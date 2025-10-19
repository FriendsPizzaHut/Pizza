import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';
import { Typography, Colors, Spacing, BorderRadius, Shadows } from '../../../constants/designSystem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getMyOrders, MyOrder, MyOrdersResponse } from '../../../services/orderService';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
    const navigation = useNavigation<NavigationProp>();

    // State management
    const [orders, setOrders] = useState<MyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalOrders, setTotalOrders] = useState(0);

    // Fetch orders from backend
    const fetchOrders = useCallback(async () => {
        try {
            setError(null);
            const data = await getMyOrders({ limit: 10 }); // Fetch only 10 orders for main screen
            setOrders(data.orders);
            setTotalOrders(data.pagination.total);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Pull to refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, [fetchOrders]);

    // Convert date string to Date object for grouping
    const ordersWithDates = orders.map(order => ({
        ...order,
        dateObj: new Date(order.date)
    }));

    // Helper function to get date label
    const getDateLabel = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const orderDate = new Date(date);

        if (orderDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (orderDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            // Always show exact date for orders older than yesterday
            return orderDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: orderDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    // Group orders by date
    const groupedOrders = ordersWithDates.reduce((groups: { [key: string]: typeof ordersWithDates }, order) => {
        const dateLabel = getDateLabel(order.dateObj);
        if (!groups[dateLabel]) {
            groups[dateLabel] = [];
        }
        groups[dateLabel].push(order);
        return groups;
    }, {});

    // Sort date groups (Today first, then Yesterday, then chronologically)
    const sortedDateGroups = Object.keys(groupedOrders).sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        if (a === 'Yesterday') return -1;
        if (b === 'Yesterday') return 1;

        // For other dates, sort by the actual date of the first order in each group
        const dateA = groupedOrders[a][0].dateObj;
        const dateB = groupedOrders[b][0].dateObj;
        return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    const getStatusColor = (statusType: string) => {
        switch (statusType) {
            case 'active': return '#cb202d'; // Using HomeScreen primary red
            case 'completed': return '#22A447'; // Using HomeScreen success green
            default: return '#666';
        }
    };

    const getStatusIcon = (statusType: string) => {
        switch (statusType) {
            case 'active': return <MaterialIcons name="local-shipping" size={16} color={Colors.surface} />;
            case 'completed': return <MaterialIcons name="check-circle" size={16} color={Colors.surface} />;
            default: return <MaterialIcons name="inventory" size={16} color={Colors.surface} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.locationContainer}>
                        <Text style={styles.ordersTitle}>Orders</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cartButtonClean}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <MaterialIcons name="shopping-cart" size={24} color="#2d2d2d" />
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>0</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loading State */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#cb202d" />
                    <Text style={styles.loadingText}>Loading your orders...</Text>
                </View>
            ) : error ? (
                /* Error State */
                <View style={styles.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#E0E0E0" />
                    <Text style={styles.errorTitle}>Oops!</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setLoading(true);
                            fetchOrders();
                        }}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                /* Orders List */
                <ScrollView
                    style={styles.ordersList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#cb202d']}
                            tintColor="#cb202d"
                        />
                    }
                >
                    <View style={styles.ordersSection}>
                        {/* Empty State */}
                        {sortedDateGroups.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="receipt-long" size={48} color="#E0E0E0" />
                                <Text style={styles.emptyStateTitle}>No Orders Found</Text>
                                <Text style={styles.emptyStateText}>
                                    You haven't placed any orders yet.
                                </Text>
                            </View>
                        ) : (
                            /* Date-wise Orders Section */
                            sortedDateGroups.map((dateLabel) => (
                                <View key={dateLabel} style={styles.sectionContainer}>
                                    {/* Date Section Header */}
                                    <View style={styles.dateHeader}>
                                        <Text style={styles.sectionTitle}>{dateLabel}</Text>
                                        <View style={styles.dottedLine}>
                                            {Array.from({ length: 40 }).map((_, index) => (
                                                <View key={index} style={styles.dot} />
                                            ))}
                                        </View>
                                    </View>

                                    {/* Orders for this date */}
                                    {groupedOrders[dateLabel].map((order) => (
                                        <TouchableOpacity
                                            key={order.id}
                                            style={styles.orderCard}
                                            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                                            activeOpacity={0.8}
                                        >
                                            {/* Top Section with Image and First Item Details */}
                                            <View style={styles.topSection}>
                                                {order.firstItemImage && (
                                                    <Image
                                                        source={{ uri: order.firstItemImage }}
                                                        style={styles.itemImage}
                                                        resizeMode="cover"
                                                    />
                                                )}
                                                <View style={styles.firstItemDetails}>
                                                    <Text style={styles.firstItemName}>
                                                        {order.items[0]}
                                                    </Text>
                                                    <Text style={styles.orderNumber}>{order.id}</Text>
                                                    <Text style={styles.itemsCount}>
                                                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Additional Items (if more than 1) */}
                                            {order.items.length > 1 && (
                                                <View style={styles.additionalItemsSection}>
                                                    <View style={styles.divider} />
                                                    {order.items.slice(1).map((item, index) => (
                                                        <Text key={index} style={styles.additionalItem}>
                                                            {item}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}

                                            {/* Order Details Section */}
                                            <View style={styles.orderDetailsSection}>
                                                <View style={styles.divider} />

                                                {/* Delivery Address */}
                                                {order.deliveryAddress && (
                                                    <View style={styles.detailRow}>
                                                        <MaterialIcons name="location-on" size={16} color="#8E8E93" />
                                                        <Text style={styles.detailText} numberOfLines={1}>
                                                            {order.deliveryAddress}
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Payment Method */}
                                                <View style={styles.detailRow}>
                                                    <MaterialIcons name="payment" size={16} color="#8E8E93" />
                                                    <Text style={styles.detailText}>
                                                        {order.paymentMethod.toUpperCase()}
                                                    </Text>
                                                </View>

                                                {/* Estimated Time for Active Orders */}
                                                {order.estimatedTime && (
                                                    <View style={styles.detailRow}>
                                                        <MaterialIcons name="schedule" size={16} color="#cb202d" />
                                                        <Text style={[styles.detailText, { color: '#cb202d', fontWeight: '600' }]}>
                                                            Arrives in {order.estimatedTime}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Delivery Agent Card (shown when assigned) */}
                                            {order.deliveryAgent && (
                                                <View style={styles.deliveryAgentSection}>
                                                    <View style={styles.divider} />
                                                    <View style={styles.deliveryAgentCard}>
                                                        <View style={styles.deliveryAgentIcon}>
                                                            <MaterialIcons name="delivery-dining" size={20} color="#cb202d" />
                                                        </View>
                                                        <View style={styles.deliveryAgentInfo}>
                                                            <Text style={styles.deliveryAgentLabel}>Delivery Agent</Text>
                                                            <Text style={styles.deliveryAgentName}>{order.deliveryAgent.name}</Text>
                                                            <View style={styles.deliveryAgentDetails}>
                                                                <MaterialIcons name="phone" size={14} color="#8E8E93" />
                                                                <Text style={styles.deliveryAgentPhone}>{order.deliveryAgent.phone}</Text>
                                                                {order.deliveryAgent.vehicleNumber && order.deliveryAgent.vehicleNumber !== 'N/A' && (
                                                                    <>
                                                                        <Text style={styles.deliveryAgentSeparator}>•</Text>
                                                                        <MaterialIcons name="two-wheeler" size={14} color="#8E8E93" />
                                                                        <Text style={styles.deliveryAgentVehicle}>{order.deliveryAgent.vehicleNumber}</Text>
                                                                    </>
                                                                )}
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            {/* Bottom Section with Date, Status and Total */}
                                            <View style={styles.bottomSection}>
                                                <View style={styles.divider} />
                                                <View style={styles.orderMetaRow}>
                                                    <Text style={styles.orderDateTime}>
                                                        Order placed on {order.dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {order.time}
                                                    </Text>
                                                </View>
                                                <View style={styles.statusTotalRow}>
                                                    <View style={styles.statusBadge}>
                                                        <Text style={styles.statusText}>{order.status}</Text>
                                                    </View>
                                                    <View style={styles.totalContainer}>
                                                        <Text style={styles.totalLabel}>Total</Text>
                                                        <Text style={styles.orderTotal}>₹{order.total.toFixed(0)}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        )}

                        {/* View All History Button */}
                        {totalOrders > 10 && (
                            <TouchableOpacity
                                style={styles.historyButton}
                                onPress={() => navigation.navigate('OrderHistory')}
                                activeOpacity={0.8}
                            >
                                <View style={styles.historyButtonLeft}>
                                    <MaterialIcons name="history" size={20} color="#cb202d" />
                                    <Text style={styles.historyButtonText}>
                                        View All Order History ({totalOrders} orders)
                                    </Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                            </TouchableOpacity>
                        )}

                        {/* Bottom Spacing */}
                        <View style={styles.bottomSpacing} />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    header: {
        backgroundColor: '#f4f4f2',
        paddingBottom: 16,
        paddingTop: 50,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    locationContainer: {
        flex: 1,
    },
    locationLabel: {
        ...Typography.regular.text200,
        color: Colors.text.secondary,
        marginBottom: 2,
    },
    locationText: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
    },
    ordersTitle: {
        ...Typography.semibold.text700,
        color: Colors.text.primary,
    },
    cartButtonClean: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartBadge: {
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
    cartBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    ordersList: {
        flex: 1,
    },
    ordersSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    ordersCount: {
        ...Typography.semibold.text600,
        color: Colors.text.primary,
        marginBottom: Spacing.xl,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        ...Typography.medium.text200,
        color: Colors.text.tertiary,
        marginRight: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dottedLine: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    dot: {
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#E0E0E0',
        opacity: 0.6,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        ...Typography.semibold.text600,
        color: Colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    orderCard: {
        backgroundColor: '#fbfbfbff',
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: Colors.grey.grey100,
    },
    firstItemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    firstItemName: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginBottom: 4,
        lineHeight: 20,
    },
    orderNumber: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
    },
    itemsCount: {
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
        marginTop: 2,
    },
    additionalItemsSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: 8,
    },
    additionalItem: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    orderDetailsSection: {
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    detailText: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        flex: 1,
    },
    bottomSection: {
        marginTop: 4,
    },
    orderMetaRow: {
        marginBottom: 8,
    },
    orderDateTime: {
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
    },
    statusTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: Colors.grey.grey100,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.light,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    statusText: {
        ...Typography.medium.text200,
        color: Colors.text.primary,
    },
    totalContainer: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
        marginBottom: 2,
    },
    orderTotal: {
        ...Typography.semibold.text500,
        color: Colors.text.primary,
    },

    // Delivery Agent Card
    deliveryAgentSection: {
        marginTop: 8,
    },
    deliveryAgentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    deliveryAgentIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deliveryAgentInfo: {
        flex: 1,
    },
    deliveryAgentLabel: {
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
        marginBottom: 2,
    },
    deliveryAgentName: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    deliveryAgentDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    deliveryAgentPhone: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
    },
    deliveryAgentSeparator: {
        ...Typography.regular.text300,
        color: Colors.text.tertiary,
        marginHorizontal: 4,
    },
    deliveryAgentVehicle: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
    },

    historyButton: {
        backgroundColor: '#f4f4f2',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    historyButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyButtonText: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginLeft: 12,
    },
    bottomSpacing: {
        height: 24,
    },

    // Loading and Error States
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    loadingText: {
        ...Typography.medium.text400,
        color: Colors.text.secondary,
        marginTop: Spacing.md,
    },
    errorTitle: {
        ...Typography.semibold.text500,
        color: Colors.text.primary,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    errorText: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    retryButton: {
        backgroundColor: '#cb202d',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    retryButtonText: {
        ...Typography.semibold.text400,
        color: Colors.surface,
    },
});