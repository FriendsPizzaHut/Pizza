import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Platform, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/store';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AdminStackParamList, AdminTabParamList } from '../../../types/navigation';
import { fetchDashboardOverview, refreshDashboardStats } from '../../../../redux/thunks/dashboardThunks';
import {
    selectFormattedStats,
    selectFormattedWeeklyChart,
    selectHourlySales,
    selectRecentActivities,
    selectMaxWeeklyRevenue,
    selectMaxHourlyRevenue,
    selectIsLoading,
    selectIsRefreshing,
    selectError,
    selectHasData,
} from '../../../../redux/selectors/dashboardSelectors';
import { useDashboardSocket } from '../../../hooks/useDashboardSocket';
import { fetchUnreadCount } from '../../../../redux/thunks/notificationThunks';

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<AdminTabParamList, 'Dashboard'>,
    NativeStackNavigationProp<AdminStackParamList>
>;

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();
    const { name } = useSelector((state: RootState) => state.auth);

    // Initialize real-time socket updates
    useDashboardSocket();

    // Redux selectors (memoized)
    const quickStats = useSelector(selectFormattedStats);
    const chartData = useSelector(selectFormattedWeeklyChart);
    const hourlyData = useSelector(selectHourlySales);
    const recentActivity = useSelector(selectRecentActivities);
    const maxRevenue = useSelector(selectMaxWeeklyRevenue);
    const maxHourlyRevenue = useSelector(selectMaxHourlyRevenue);
    const isLoading = useSelector(selectIsLoading);
    const isRefreshing = useSelector(selectIsRefreshing);
    const error = useSelector(selectError);
    const hasData = useSelector(selectHasData);

    // Notification unread count
    const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

    // Admin actions (static)
    const adminActions = useMemo(() => [
        { title: 'Manage Orders', description: 'View and manage all orders', icon: 'shopping-bag', color: '#cb202d', action: 'OrderManagement' },
        { title: 'Menu Management', description: 'Update menu items and prices', icon: 'restaurant-menu', color: '#4CAF50', action: null },
        { title: 'Delivery Tracking', description: 'Track all delivery personnel', icon: 'location-on', color: '#2196F3', action: null },
        { title: 'Staff Management', description: 'Manage delivery staff', icon: 'people', color: '#FF9800', action: null },
        { title: 'Analytics', description: 'View detailed reports', icon: 'bar-chart', color: '#9C27B0', action: null },
    ], []);

    // Fetch dashboard data on mount
    useEffect(() => {
        if (!hasData) {
            dispatch(fetchDashboardOverview());
        }
        // Fetch unread notification count
        dispatch(fetchUnreadCount());
    }, [dispatch, hasData]);

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        dispatch(refreshDashboardStats());
    }, [dispatch]);

    // Ensure all 7 days are shown (fill missing days with zero data)
    const completeWeeklyChartData = useMemo(() => {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const todayDayIndex = today.getDay(); // 0=Sun, 1=Mon, etc.

        // Create array for past 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i)); // Go back 6 days to today
            const dayIndex = date.getDay();
            // Convert Sunday (0) to index 6, Monday (1) to 0, etc.
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            return {
                day: dayNames[adjustedIndex],
                date: date.toISOString().split('T')[0],
                revenue: 0,
                orders: 0,
            };
        });

        // Merge with actual data from backend
        chartData.forEach((data) => {
            const matchingDay = last7Days.find((d) => d.day === data.day);
            if (matchingDay) {
                matchingDay.revenue = data.revenue;
                matchingDay.orders = data.orders;
            }
        });

        return last7Days;
    }, [chartData]);

    // Group hourly data into 4-hour time blocks (6 blocks total)
    const timeBlockData = useMemo(() => {
        // Define 6 time blocks covering 24 hours
        const timeBlocks = [
            { label: '12AM-4AM', start: 0, end: 3 },
            { label: '4AM-8AM', start: 4, end: 7 },
            { label: '8AM-12PM', start: 8, end: 11 },
            { label: '12PM-4PM', start: 12, end: 15 },
            { label: '4PM-8PM', start: 16, end: 19 },
            { label: '8PM-12AM', start: 20, end: 23 },
        ];

        // Map hourly data to time blocks
        return timeBlocks.map((block) => {
            let totalRevenue = 0;
            let totalOrders = 0;

            // Sum up all hours in this block using numeric comparison
            hourlyData.forEach((hourData) => {
                const hourValue = hourData.hourValue ?? parseInt(String(hourData.hour || '0').replace(/\D/g, ''));
                if (hourValue >= block.start && hourValue <= block.end) {
                    totalRevenue += hourData.revenue || 0;
                    totalOrders += hourData.orders || 0;
                }
            });

            return {
                timeRange: block.label,
                revenue: totalRevenue,
                orders: totalOrders,
            };
        });
    }, [hourlyData]);

    // Calculate max revenue from time blocks
    const maxTimeBlockRevenue = useMemo(() => {
        if (timeBlockData.length === 0) return 1;
        const max = Math.max(...timeBlockData.map((d) => d.revenue));
        return max === 0 ? 1 : max;
    }, [timeBlockData]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Modern Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.welcome}>Admin Dashboard</Text>
                            <Text style={styles.adminName}>Welcome, {name}!</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <MaterialIcons name="notifications-none" size={24} color="#2d2d2d" />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['#cb202d']}
                        tintColor="#cb202d"
                    />
                }
            >
                {/* Loading State */}
                {isLoading && !hasData && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#cb202d" />
                        <Text style={styles.loadingText}>Loading dashboard...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && !hasData && (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={48} color="#cb202d" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => dispatch(fetchDashboardOverview())}
                        >
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Content - Only show when data is available */}
                {hasData && (
                    <>
                        {/* Premium Hero Banner */}
                        <View style={styles.heroBanner}>
                            <LinearGradient
                                colors={['#cb202d', '#2d2d2d']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                <View style={styles.heroContent}>
                                    <View style={styles.heroLeft}>
                                        <Text style={styles.heroGreeting}>Hey {name}! 👋</Text>
                                        <Text style={styles.heroTitle}>Dashboard Overview</Text>
                                        <Text style={styles.heroSubtitle}>Monitor your business in real-time</Text>

                                        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('OrderManagement')}>
                                            <Text style={styles.ctaText}>View Orders</Text>
                                            <Text style={styles.ctaArrow}>→</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300' }}
                                        style={styles.heroImage}
                                    />
                                </View>

                                {/* Decorative elements */}
                                <View style={styles.heroDecor1} />
                                <View style={styles.heroDecor2} />
                            </LinearGradient>
                        </View>

                        <View style={styles.mainContent}>
                            {/* Quick Stats */}
                            <View style={styles.section}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionTitleWithIcon}>
                                        <MaterialIcons name="trending-up" size={24} color="#cb202d" />
                                        <Text style={styles.sectionTitle}>Today's Overview</Text>
                                    </View>
                                </View>
                                <View style={styles.statsGrid}>
                                    {quickStats.map((stat, index) => (
                                        <View key={index} style={styles.modernStatItem}>
                                            <LinearGradient
                                                colors={
                                                    stat.color === '#cb202d' ? ['#FFEBEE', '#FFCDD2'] :
                                                        stat.color === '#9C27B0' ? ['#F3E5F5', '#E1BEE7'] :
                                                            stat.color === '#4CAF50' ? ['#E8F5E9', '#C8E6C9'] :
                                                                stat.color === '#2196F3' ? ['#E3F2FD', '#BBDEFB'] :
                                                                    stat.color === '#FF9800' ? ['#FFF3E0', '#FFE0B2'] :
                                                                        ['#ECEFF1', '#CFD8DC']
                                                }
                                                style={styles.modernStatGradient}
                                            >
                                                <View style={styles.statIconContainer}>
                                                    <MaterialIcons name={stat.icon as any} size={28} color={stat.color} />
                                                </View>
                                                <Text style={styles.modernStatNumber}>{stat.value}</Text>
                                                <Text style={styles.modernStatLabel}>{stat.title}</Text>
                                            </LinearGradient>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Weekly Revenue Chart */}
                            <View style={styles.section}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionTitleWithIcon}>
                                        <MaterialIcons name="show-chart" size={24} color="#cb202d" />
                                        <Text style={styles.sectionTitle}>Weekly Revenue</Text>
                                    </View>
                                    <View style={styles.periodBadge}>
                                        <MaterialIcons name="calendar-today" size={14} color="#cb202d" />
                                        <Text style={styles.periodBadgeText}>7 Days</Text>
                                    </View>
                                </View>

                                <View style={styles.chartBarsContainer}>
                                    {completeWeeklyChartData.map((data, index) => {
                                        // Calculate bar height - minimum 12px for zero values
                                        const calculatedHeight = (data.revenue / maxRevenue) * 140;
                                        const barHeight = data.revenue === 0 ? 12 : Math.max(calculatedHeight, 12);
                                        const isHighest = data.revenue === maxRevenue && data.revenue > 0;
                                        const isZero = data.revenue === 0;

                                        return (
                                            <View key={index} style={styles.barWrapper}>
                                                <View style={styles.barWithValue}>
                                                    <Text style={[
                                                        styles.barValueText,
                                                        isHighest && styles.barValueTextHighlight,
                                                        isZero && styles.barValueTextZero
                                                    ]}>
                                                        {isZero ? '₹0' : `₹${(data.revenue / 1000).toFixed(1)}k`}
                                                    </Text>
                                                    <LinearGradient
                                                        colors={
                                                            isZero ? ['#E0E0E0', '#BDBDBD'] :
                                                                isHighest ? ['#cb202d', '#a01823'] :
                                                                    ['#FF9800', '#F57C00']
                                                        }
                                                        style={[styles.chartBar, { height: barHeight }]}
                                                    >
                                                        {isHighest && !isZero && (
                                                            <View style={styles.peakIndicator}>
                                                                <MaterialIcons name="star" size={12} color="#fff" />
                                                            </View>
                                                        )}
                                                    </LinearGradient>
                                                </View>
                                                <Text style={styles.barDayLabel}>{data.day}</Text>
                                                <View style={styles.barOrdersBadge}>
                                                    <MaterialIcons name="shopping-cart" size={10} color="#8E8E93" />
                                                    <Text style={styles.barOrdersText}>{data.orders}</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>

                                <View style={styles.chartFooter}>
                                    <View style={styles.chartLegend}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#cb202d' }]} />
                                            <Text style={styles.legendText}>Peak Day</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                                            <Text style={styles.legendText}>Regular Day</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Time Block Sales Chart (4-hour blocks) */}
                            <View style={styles.section}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionTitleWithIcon}>
                                        <MaterialIcons name="access-time" size={24} color="#cb202d" />
                                        <Text style={styles.sectionTitle}>Sales by Time</Text>
                                    </View>
                                    <View style={styles.periodBadge}>
                                        <MaterialIcons name="today" size={14} color="#cb202d" />
                                        <Text style={styles.periodBadgeText}>Today</Text>
                                    </View>
                                </View>

                                <View style={styles.timeBlockChartContainer}>
                                    {timeBlockData.map((block, index) => {
                                        // Calculate bar height - minimum 12px for zero values
                                        const calculatedHeight = (block.revenue / maxTimeBlockRevenue) * 140;
                                        const barHeight = block.revenue === 0 ? 12 : Math.max(calculatedHeight, 12);
                                        const isPeak = block.revenue === maxTimeBlockRevenue && block.revenue > 0;
                                        const isZero = block.revenue === 0;

                                        return (
                                            <View key={index} style={styles.timeBlockBarWrapper}>
                                                <View style={styles.timeBlockBarWithValue}>
                                                    <Text style={[
                                                        styles.timeBlockValueText,
                                                        isPeak && styles.timeBlockValueTextHighlight,
                                                        isZero && styles.timeBlockValueTextZero
                                                    ]}>
                                                        {isZero ? '₹0' : `₹${(block.revenue / 1000).toFixed(1)}k`}
                                                    </Text>
                                                    <LinearGradient
                                                        colors={
                                                            isZero ? ['#E0E0E0', '#BDBDBD'] :
                                                                isPeak ? ['#cb202d', '#a01823'] :
                                                                    ['#FF9800', '#F57C00']
                                                        }
                                                        style={[styles.timeBlockBar, { height: barHeight }]}
                                                    >
                                                        {isPeak && !isZero && (
                                                            <View style={styles.peakIndicator}>
                                                                <MaterialIcons name="star" size={12} color="#fff" />
                                                            </View>
                                                        )}
                                                    </LinearGradient>
                                                </View>
                                                <Text style={styles.timeBlockLabel}>{block.timeRange}</Text>
                                                <View style={styles.timeBlockOrdersBadge}>
                                                    <MaterialIcons name="shopping-cart" size={10} color="#8E8E93" />
                                                    <Text style={styles.timeBlockOrdersText}>{block.orders}</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>

                                <View style={styles.timeBlockChartFooter}>
                                    <View style={styles.timeBlockChartLegend}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#cb202d' }]} />
                                            <Text style={styles.legendText}>Peak Period</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                                            <Text style={styles.legendText}>Regular Period</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Recent Activity */}
                            <View style={styles.section}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionTitleWithIcon}>
                                        <MaterialIcons name="history" size={24} color="#cb202d" />
                                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Text style={styles.seeAllText}>View All</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.activityTimeline}>
                                    {recentActivity.map((activity, index) => (
                                        <View key={index} style={styles.modernActivityItem}>
                                            <View style={styles.timelineLeftSection}>
                                                <View style={[styles.modernActivityIconContainer, { backgroundColor: `${activity.color}15` }]}>
                                                    <MaterialIcons name={activity.icon as any} size={20} color={activity.color} />
                                                </View>
                                                {index < recentActivity.length - 1 && (
                                                    <View style={styles.timelineConnector} />
                                                )}
                                            </View>
                                            <View style={styles.modernActivityCard}>
                                                <View style={styles.modernActivityHeader}>
                                                    <Text style={styles.modernActivityAction}>{activity.action}</Text>
                                                    <Text style={styles.modernActivityTime}>{activity.time}</Text>
                                                </View>
                                                <View style={styles.modernActivityIdBadge}>
                                                    <MaterialIcons name="tag" size={12} color="#8E8E93" />
                                                    <Text style={styles.modernActivityId}>{activity.id}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* System Status */}
                            <View style={styles.section}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionTitleWithIcon}>
                                        <MaterialIcons name="verified" size={24} color="#cb202d" />
                                        <Text style={styles.sectionTitle}>System Status</Text>
                                    </View>
                                </View>

                                <View style={styles.statusCard}>
                                    <View style={styles.statusItem}>
                                        <View style={styles.statusLeft}>
                                            <MaterialIcons name="shopping-cart" size={20} color="#4CAF50" />
                                            <Text style={styles.statusLabel}>Online Ordering</Text>
                                        </View>
                                        <View style={[styles.statusIndicator, { backgroundColor: '#E8F5E9' }]}>
                                            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                                            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Active</Text>
                                        </View>
                                    </View>

                                    <View style={styles.statusDivider} />

                                    <View style={styles.statusItem}>
                                        <View style={styles.statusLeft}>
                                            <MaterialIcons name="local-shipping" size={20} color="#4CAF50" />
                                            <Text style={styles.statusLabel}>Delivery Service</Text>
                                        </View>
                                        <View style={[styles.statusIndicator, { backgroundColor: '#E8F5E9' }]}>
                                            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                                            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Running</Text>
                                        </View>
                                    </View>

                                    <View style={styles.statusDivider} />

                                    <View style={styles.statusItem}>
                                        <View style={styles.statusLeft}>
                                            <MaterialIcons name="payment" size={20} color="#4CAF50" />
                                            <Text style={styles.statusLabel}>Payment Gateway</Text>
                                        </View>
                                        <View style={[styles.statusIndicator, { backgroundColor: '#E8F5E9' }]}>
                                            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                                            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Operational</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={{ height: 40 }} />
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },

    // Loading & Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
        paddingHorizontal: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#cb202d',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#f4f4f2',
    },
    header: {
        backgroundColor: '#f4f4f2',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
    },
    welcome: {
        fontSize: 11,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 4,
    },
    adminName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#cb202d',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Scroll Container
    scrollContainer: {
        flex: 1,
    },

    // Hero Banner
    heroBanner: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#cb202d',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    heroGradient: {
        paddingHorizontal: 24,
        paddingVertical: 28,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    heroLeft: {
        flex: 1,
        paddingRight: 16,
    },
    heroGreeting: {
        fontSize: 14,
        color: '#FFE5E5',
        fontWeight: '600',
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 13,
        color: '#FFE5E5',
        marginBottom: 20,
        lineHeight: 18,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignSelf: 'flex-start',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#cb202d',
        marginRight: 6,
    },
    ctaArrow: {
        fontSize: 18,
        color: '#cb202d',
        fontWeight: '700',
    },
    heroImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroDecor1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -40,
        right: -30,
    },
    heroDecor2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -20,
        left: -20,
    },

    // Main Content
    mainContent: {
        paddingTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    sectionTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
        marginLeft: 8,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    modernStatItem: {
        width: '48%',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    modernStatGradient: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 12,
    },
    statCard: {
        width: (width - 48) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    modernStatNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    modernStatLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 13,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '600',
    },

    // Actions Grid
    actionsGrid: {
        paddingHorizontal: 16,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    actionContent: {
        flex: 1,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#cb202d',
    },

    // Period Badge
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    periodBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#cb202d',
    },

    // Weekly Revenue Chart
    chartBarsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    barWrapper: {
        alignItems: 'center',
        width: '13%',
    },
    barWithValue: {
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    barValueText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#666',
        marginBottom: 6,
    },
    barValueTextHighlight: {
        color: '#cb202d',
        fontSize: 12,
    },
    barValueTextZero: {
        color: '#9E9E9E',
        fontSize: 10,
        fontWeight: '600',
    },
    chartBar: {
        width: '100%',
        maxWidth: 36,
        borderRadius: 8,
        minHeight: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    peakIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    barDayLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    barOrdersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    barOrdersText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8E8E93',
    },
    chartFooter: {
        paddingTop: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },

    // Activity Timeline (Modern)
    activityTimeline: {
        paddingHorizontal: 16,
    },
    modernActivityItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineLeftSection: {
        alignItems: 'center',
        marginRight: 12,
    },
    modernActivityIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    timelineConnector: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginTop: 8,
    },
    modernActivityCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    modernActivityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    modernActivityAction: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        marginRight: 8,
    },
    modernActivityTime: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8E8E93',
    },
    modernActivityIdBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    modernActivityId: {
        fontSize: 11,
        fontWeight: '700',
        color: '#cb202d',
        marginLeft: 4,
    },

    // Old Activity Items (keeping for compatibility)
    activityItem: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityAction: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    activityId: {
        fontSize: 13,
        color: '#cb202d',
        fontWeight: '700',
    },
    activityTime: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
    },

    // Status Section
    statusCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statusItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusLabel: {
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '600',
        marginLeft: 12,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statusDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 20,
    },

    // Hourly Sales Chart
    hourlyChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    hourlyBarWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    hourlyBarWithValue: {
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    hourlyBarValueText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#666',
        marginBottom: 6,
    },
    hourlyBarValueTextHighlight: {
        color: '#cb202d',
        fontSize: 11,
    },
    hourlyBarValueTextZero: {
        color: '#9E9E9E',
        fontSize: 9,
        fontWeight: '600',
    },
    hourlyBar: {
        width: '100%',
        maxWidth: 28,
        borderRadius: 8,
        minHeight: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    hourlyBarLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    hourlyOrdersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    hourlyOrdersText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#8E8E93',
    },
    hourlyChartFooter: {
        paddingTop: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    hourlyChartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
    },

    // Time Block Chart (4-hour blocks)
    timeBlockChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    timeBlockBarWrapper: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 2,
    },
    timeBlockBarWithValue: {
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    timeBlockValueText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#666',
        marginBottom: 6,
    },
    timeBlockValueTextHighlight: {
        color: '#cb202d',
        fontSize: 11,
    },
    timeBlockValueTextZero: {
        color: '#9E9E9E',
        fontSize: 9,
        fontWeight: '600',
    },
    timeBlockBar: {
        width: '100%',
        maxWidth: 48,
        borderRadius: 8,
        minHeight: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    timeBlockLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 4,
        textAlign: 'center',
    },
    timeBlockOrdersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    timeBlockOrdersText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#8E8E93',
    },
    timeBlockChartFooter: {
        paddingTop: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    timeBlockChartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
    },

    // Notification Debug Button Styles
    debugButton: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B35',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    debugButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    debugIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF5F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    debugTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    debugSubtitle: {
        fontSize: 13,
        color: '#666',
    },
});