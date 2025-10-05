import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export default function OrderHistoryScreen() {
    const navigation = useNavigation();
    const [filter, setFilter] = useState('all');

    const orders = [
        {
            id: 'ORD-001',
            date: '2024-10-05',
            time: '2:30 PM',
            status: 'Delivered',
            total: 24.99,
            items: ['Margherita Pizza (Large)', 'Garlic Bread', 'Coca Cola'],
            firstItemImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 5,
        },
        {
            id: 'ORD-002',
            date: '2024-10-03',
            time: '7:45 PM',
            status: 'Delivered',
            total: 31.50,
            items: ['Pepperoni Pizza (Medium)', 'BBQ Wings', 'Sprite'],
            firstItemImage: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 4,
        },
        {
            id: 'ORD-003',
            date: '2024-09-28',
            time: '1:15 PM',
            status: 'Cancelled',
            total: 18.99,
            items: ['Veggie Supreme (Small)', 'Garlic Knots'],
            firstItemImage: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'cancelled',
            rating: null,
        },
        {
            id: 'ORD-004',
            date: '2024-09-25',
            time: '8:20 PM',
            status: 'Delivered',
            total: 45.99,
            items: ['Supreme Pizza (Large)', 'Chicken Wings', 'Pepsi', 'Garlic Bread'],
            firstItemImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 5,
        },
        {
            id: 'ORD-005',
            date: '2024-09-20',
            time: '6:15 PM',
            status: 'Delivered',
            total: 29.99,
            items: ['BBQ Chicken Pizza (Medium)', 'Coke'],
            firstItemImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 4,
        },
        {
            id: 'ORD-006',
            date: '2024-09-15',
            time: '7:30 PM',
            status: 'Delivered',
            total: 22.50,
            items: ['Veggie Supreme (Small)', 'Sprite'],
            firstItemImage: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 3,
        },
        {
            id: 'ORD-007',
            date: '2024-09-10',
            time: '5:45 PM',
            status: 'Delivered',
            total: 38.99,
            items: ['Meat Lovers (Large)', 'Garlic Knots', 'Coca Cola'],
            firstItemImage: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 5,
        },
        {
            id: 'ORD-008',
            date: '2024-08-28',
            time: '2:20 PM',
            status: 'Delivered',
            total: 27.99,
            items: ['Hawaiian Pizza (Medium)', 'Pepsi'],
            firstItemImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            statusType: 'delivered',
            rating: 4,
        },
    ];

    const getStatusColor = (statusType: string) => {
        switch (statusType) {
            case 'delivered': return '#22A447';
            case 'cancelled': return '#ff4444';
            default: return '#666';
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'delivered') return order.statusType === 'delivered';
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Orders Count */}
                <View style={styles.ordersCountContainer}>
                    <Text style={styles.ordersCount}>
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
                    </Text>
                </View>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
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
                    filteredOrders.map((order) => (
                        <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.8}>
                            {/* Top Section with Image and First Item Details */}
                            <View style={styles.topSection}>
                                <Image
                                    source={{ uri: order.firstItemImage }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.firstItemDetails}>
                                    <Text style={styles.firstItemName}>
                                        {order.items[0]}
                                    </Text>
                                    <Text style={styles.orderNumber}>Order #{order.id}</Text>
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

                            {/* Bottom Section with Date, Status and Total */}
                            <View style={styles.bottomSection}>
                                <View style={styles.divider} />
                                <View style={styles.orderMetaRow}>
                                    <Text style={styles.orderDateTime}>
                                        Order placed on {formatDate(order.date)}, {order.time}
                                    </Text>
                                </View>
                                <View style={styles.statusTotalRow}>
                                    <View style={styles.statusBadgeNew}>
                                        <Text style={styles.statusTextNew}>{order.status}</Text>
                                    </View>
                                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
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
});