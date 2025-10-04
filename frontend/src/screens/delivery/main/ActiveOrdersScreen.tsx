import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function DeliveryActiveOrdersScreen() {
    const activeOrders = [
        {
            id: '#ORD-158',
            customerName: 'Sarah Johnson',
            address: '123 Oak Street, Apt 4B',
            distance: '2.1 km',
            estimatedTime: '15 mins',
            status: 'picked_up',
            total: '$28.50',
            items: ['Large Pepperoni Pizza', 'Garlic Bread', 'Coke'],
            phone: '+1 (555) 123-4567',
        },
        {
            id: '#ORD-159',
            customerName: 'Mike Chen',
            address: '456 Maple Ave, Suite 12',
            distance: '3.5 km',
            estimatedTime: '22 mins',
            status: 'ready_for_pickup',
            total: '$35.99',
            items: ['2 Medium Pizzas', 'Buffalo Wings', 'Sprite'],
            phone: '+1 (555) 987-6543',
        },
        {
            id: '#ORD-160',
            customerName: 'Lisa Rodriguez',
            address: '789 Pine Road, House #15',
            distance: '1.8 km',
            estimatedTime: '12 mins',
            status: 'preparing',
            total: '$22.75',
            items: ['Veggie Supreme Pizza', 'Caesar Salad'],
            phone: '+1 (555) 456-7890',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'picked_up':
                return '#FF6B6B';
            case 'ready_for_pickup':
                return '#FF9800';
            case 'preparing':
                return '#2196F3';
            default:
                return '#999';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'picked_up':
                return '🚚 On the way';
            case 'ready_for_pickup':
                return '📦 Ready for pickup';
            case 'preparing':
                return '👨‍🍳 Preparing';
            default:
                return status;
        }
    };

    const getActionButton = (status: string, orderId: string) => {
        switch (status) {
            case 'picked_up':
                return (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.actionButtonText}>✅ Mark Delivered</Text>
                    </TouchableOpacity>
                );
            case 'ready_for_pickup':
                return (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]}>
                        <Text style={styles.actionButtonText}>📦 Pick Up Order</Text>
                    </TouchableOpacity>
                );
            case 'preparing':
                return (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ccc' }]} disabled>
                        <Text style={[styles.actionButtonText, { color: '#666' }]}>⏳ Wait for Ready</Text>
                    </TouchableOpacity>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🚚 Active Orders</Text>
                <View style={styles.orderCount}>
                    <Text style={styles.countText}>{activeOrders.length}</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {activeOrders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📪</Text>
                        <Text style={styles.emptyTitle}>No Active Orders</Text>
                        <Text style={styles.emptyText}>
                            You're all caught up! New orders will appear here when available.
                        </Text>
                    </View>
                ) : (
                    activeOrders.map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View style={styles.orderIdSection}>
                                    <Text style={styles.orderId}>{order.id}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                                        <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.orderTotal}>{order.total}</Text>
                            </View>

                            <View style={styles.customerSection}>
                                <Text style={styles.customerName}>👤 {order.customerName}</Text>
                                <TouchableOpacity style={styles.phoneButton}>
                                    <Text style={styles.phoneButtonText}>📞 Call</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.addressSection}>
                                <Text style={styles.addressText}>📍 {order.address}</Text>
                                <View style={styles.distanceInfo}>
                                    <Text style={styles.distanceText}>{order.distance} • {order.estimatedTime}</Text>
                                    <TouchableOpacity style={styles.navigateButton}>
                                        <Text style={styles.navigateButtonText}>🗺️ Navigate</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.itemsSection}>
                                <Text style={styles.itemsTitle}>📋 Order Items:</Text>
                                {order.items.map((item, index) => (
                                    <Text key={index} style={styles.itemText}>• {item}</Text>
                                ))}
                            </View>

                            <View style={styles.actionSection}>
                                {getActionButton(order.status, order.id)}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    orderCount: {
        backgroundColor: '#fff',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    orderIdSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    customerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    phoneButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    phoneButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addressSection: {
        marginBottom: 15,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    distanceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distanceText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '600',
    },
    navigateButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    navigateButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    itemsSection: {
        marginBottom: 20,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    itemText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    actionSection: {
        alignItems: 'center',
    },
    actionButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: '80%',
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});