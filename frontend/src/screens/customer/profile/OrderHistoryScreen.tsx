import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getMyOrders, MyOrder, MyOrdersResponse } from '../../../services/orderService';

export default function OrderHistoryScreen() {
    const navigation = useNavigation();
    const [filter, setFilter] = useState('all');
    const [orders, setOrders] = useState<MyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch orders with pagination
    const fetchOrders = useCallback(async (skip = 0, append = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            setError(null);
            const statusFilter = filter === 'delivered' ? 'delivered' : undefined;
            const data = await getMyOrders({
                limit: 20,
                skip,
                status: statusFilter,
            });

            if (append) {
                setOrders(prev => [...prev, ...data.orders]);
            } else {
                setOrders(data.orders);
            }

            setHasMore(data.pagination.hasMore);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter]);

    // Initial load
    useEffect(() => {
        fetchOrders(0, false);
    }, [filter]);

    // Load more on scroll
    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;

        if (isCloseToBottom && !loadingMore && hasMore && !loading) {
            fetchOrders(orders.length, true);
        }
    };



    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Order History</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                            All Orders
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'delivered' && styles.activeFilterTab]}
                        onPress={() => setFilter('delivered')}
                    >
                        <Text style={[styles.filterText, filter === 'delivered' && styles.activeFilterText]}>
                            Delivered
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#cb202d" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#E0E0E0" />
                    <Text style={styles.errorTitle}>Oops!</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchOrders(0, false)}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={400}
                >
                    {/* Orders Count */}
                    <View style={styles.ordersCountContainer}>
                        <Text style={styles.ordersCount}>
                            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                        </Text>
                    </View>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="receipt-long" size={64} color="#E0E0E0" />
                            <Text style={styles.emptyTitle}>No Orders Found</Text>
                            <Text style={styles.emptyText}>
                                {filter === 'all'
                                    ? "You haven't placed any orders yet."
                                    : "No delivered orders found."
                                }
                            </Text>
                        </View>
                    ) : (
                        orders.map((order) => (
                            <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.8}>
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

                                {/* Bottom Section with Date, Status and Total */}
                                <View style={styles.bottomSection}>
                                    <View style={styles.divider} />
                                    <View style={styles.orderMetaRow}>
                                        <Text style={styles.orderDateTime}>
                                            Order placed on {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {order.time}
                                        </Text>
                                    </View>
                                    <View style={styles.statusTotalRow}>
                                        <View style={styles.statusBadgeNew}>
                                            <Text style={styles.statusTextNew}>{order.status}</Text>
                                        </View>
                                        <Text style={styles.orderTotal}>₹{order.total.toFixed(0)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {/* Loading More Indicator */}
                    {loadingMore && (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="small" color="#cb202d" />
                            <Text style={styles.loadingMoreText}>Loading more orders...</Text>
                        </View>
                    )}

                    {/* End of List Message */}
                    {!hasMore && orders.length > 0 && (
                        <View style={styles.endOfListContainer}>
                            <Text style={styles.endOfListText}>You've reached the end</Text>
                        </View>
                    )}

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
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
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    placeholder: {
        width: 40,
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeFilterTab: {
        backgroundColor: '#cb202d',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeFilterText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    ordersCountContainer: {
        paddingVertical: 16,
    },
    ordersCount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
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
        backgroundColor: '#F5F5F5',
    },
    firstItemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    firstItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
        lineHeight: 20,
    },
    orderNumber: {
        fontSize: 14,
        color: '#666',
    },
    itemsCount: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    additionalItemsSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    additionalItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        lineHeight: 18,
    },
    orderDetailsSection: {
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    bottomSection: {
        marginTop: 4,
    },
    orderMetaRow: {
        marginBottom: 8,
    },
    orderDateTime: {
        fontSize: 12,
        color: '#8E8E93',
        flex: 1,
    },
    statusTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadgeNew: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusTextNew: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 40,
    },
    // Loading and Error States
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 12,
        marginBottom: 4,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#cb202d',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    loadingMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    loadingMoreText: {
        fontSize: 14,
        color: '#666',
    },
    endOfListContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    endOfListText: {
        fontSize: 14,
        color: '#8E8E93',
        fontStyle: 'italic',
    },
});