import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../types/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../../../../redux/thunks/notificationThunks';
import { setFilter, addNewNotification } from '../../../../redux/slices/notificationSlice';
import { SOCKET_URL, SOCKET_OPTIONS } from '../../../config/socket.config';
import { format, formatDistanceToNow } from 'date-fns';
import io, { Socket } from 'socket.io-client';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export default function NotificationsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();

    // Redux state
    const {
        notifications,
        unreadCount,
        loading,
        refreshing,
        filter,
        error,
    } = useSelector((state: RootState) => state.notifications);

    // Local state
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

    // Fetch notifications on mount
    useEffect(() => {
        dispatch(fetchNotifications({ page: 1, limit: 50 }));
    }, [dispatch]);

    // Socket.IO listener for real-time notifications
    useEffect(() => {
        // Initialize socket connection
        const socket = io(SOCKET_URL, SOCKET_OPTIONS);

        const handleNewNotification = (notification: any) => {
            dispatch(addNewNotification(notification));
        };

        // Connect event
        socket.on('connect', () => {
            // Socket connected
        });

        // Listen for new notifications
        socket.on('notification:new', handleNewNotification);

        // Cleanup on unmount
        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.disconnect();
        };
    }, [dispatch]);

    // Refresh handler
    const handleRefresh = () => {
        dispatch(fetchNotifications({ page: 1, limit: 50, isRead: filter === 'unread' ? false : undefined }));
    };

    // Mark as read handler
    const handleMarkAsRead = (notificationId: string) => {
        dispatch(markNotificationAsRead(notificationId));
    };

    // Mark all as read handler
    const handleMarkAllAsRead = async () => {
        setIsMarkingAllRead(true);
        await dispatch(markAllNotificationsAsRead());
        setIsMarkingAllRead(false);
    };

    // Filter handler
    const handleFilterChange = (newFilter: 'all' | 'unread') => {
        dispatch(setFilter(newFilter));
        dispatch(fetchNotifications({
            page: 1,
            limit: 50,
            isRead: newFilter === 'unread' ? false : undefined
        }));
    };

    // Filter notifications based on filter
    const filteredNotifications = filter === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    // Format time helper
    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                return formatDistanceToNow(date, { addSuffix: true });
            } else {
                return format(date, 'MMM dd, yyyy');
            }
        } catch (error) {
            return dateString;
        }
    };

    const getIconName = (type: 'order' | 'delivery' | 'payment' | 'customer' | 'system' | 'staff') => {
        switch (type) {
            case 'order':
                return 'shopping-cart';
            case 'delivery':
                return 'delivery-dining';
            case 'payment':
                return 'payments';
            case 'customer':
                return 'person';
            case 'staff':
                return 'people';
            case 'system':
                return 'settings';
            default:
                return 'notifications';
        }
    };

    const getIconColor = (type: 'order' | 'delivery' | 'payment' | 'customer' | 'system' | 'staff') => {
        switch (type) {
            case 'order':
                return '#cb202d';
            case 'delivery':
                return '#FF9800';
            case 'payment':
                return '#4CAF50';
            case 'customer':
                return '#2196F3';
            case 'staff':
                return '#9C27B0';
            case 'system':
                return '#607D8B';
            default:
                return '#8E8E93';
        }
    };

    const getIconGradient = (type: 'order' | 'delivery' | 'payment' | 'customer' | 'system' | 'staff'): [string, string] => {
        switch (type) {
            case 'order':
                return ['#FFEBEE', '#FFCDD2'];
            case 'delivery':
                return ['#FFF3E0', '#FFE0B2'];
            case 'payment':
                return ['#E8F5E9', '#C8E6C9'];
            case 'customer':
                return ['#E3F2FD', '#BBDEFB'];
            case 'staff':
                return ['#F3E5F5', '#E1BEE7'];
            case 'system':
                return ['#ECEFF1', '#CFD8DC'];
            default:
                return ['#F5F5F5', '#EEEEEE'];
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {unreadCount > 0 && (
                            <TouchableOpacity
                                style={styles.markAllButton}
                                onPress={handleMarkAllAsRead}
                                disabled={isMarkingAllRead}
                            >
                                {isMarkingAllRead ? (
                                    <ActivityIndicator size="small" color="#cb202d" />
                                ) : (
                                    <MaterialIcons name="done-all" size={20} color="#cb202d" />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                        onPress={() => handleFilterChange('all')}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filter === 'all' && styles.filterTabTextActive,
                            ]}
                        >
                            All ({notifications.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            filter === 'unread' && styles.filterTabActive,
                        ]}
                        onPress={() => handleFilterChange('unread')}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filter === 'unread' && styles.filterTabTextActive,
                            ]}
                        >
                            Unread ({unreadCount})
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Notifications List */}
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#cb202d']}
                        tintColor="#cb202d"
                    />
                }
            >
                {loading && notifications.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#cb202d" />
                        <Text style={styles.loadingText}>Loading notifications...</Text>
                    </View>
                ) : filteredNotifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <MaterialIcons
                                name="notifications-none"
                                size={64}
                                color="#CFD8DC"
                            />
                        </View>
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyMessage}>
                            {filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : 'You have no notifications at the moment.'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.notificationsList}>
                        {filteredNotifications.map((notification, index) => (
                            <TouchableOpacity
                                key={notification._id}
                                style={[
                                    styles.notificationItem,
                                    !notification.isRead && styles.notificationItemUnread,
                                ]}
                                onPress={() => handleMarkAsRead(notification._id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.notificationContent}>
                                    <LinearGradient
                                        colors={getIconGradient(notification.type)}
                                        style={styles.notificationIcon}
                                    >
                                        <MaterialIcons
                                            name={getIconName(notification.type)}
                                            size={24}
                                            color={getIconColor(notification.type)}
                                        />
                                    </LinearGradient>

                                    <View style={styles.notificationText}>
                                        <View style={styles.notificationHeader}>
                                            <Text
                                                style={[
                                                    styles.notificationTitle,
                                                    !notification.isRead &&
                                                    styles.notificationTitleUnread,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {notification.title}
                                            </Text>
                                            {notification.priority === 'high' && (
                                                <View style={styles.priorityBadge}>
                                                    <MaterialIcons
                                                        name="priority-high"
                                                        size={12}
                                                        color="#fff"
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        <Text
                                            style={styles.notificationMessage}
                                            numberOfLines={2}
                                        >
                                            {notification.message}
                                        </Text>
                                        <Text style={styles.notificationTime}>
                                            {formatTime(notification.createdAt)}
                                        </Text>
                                    </View>

                                    {!notification.isRead && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    headerSafeArea: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f4f4f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    headerRight: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markAllButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '600',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#fff',
        gap: 12,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f4f4f2',
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#cb202d',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    filterTabTextActive: {
        color: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    notificationsList: {
        paddingHorizontal: 16,
    },
    notificationItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
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
    notificationItemUnread: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FFEBEE',
        ...Platform.select({
            ios: {
                shadowColor: '#cb202d',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        flex: 1,
    },
    notificationTitleUnread: {
        fontWeight: '700',
    },
    priorityBadge: {
        backgroundColor: '#cb202d',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 6,
    },
    notificationTime: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#cb202d',
        marginLeft: 8,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
});
