import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function OrderHistoryScreen() {
    const orders = [
        {
            id: '#ORD-001',
            date: '2024-01-15',
            time: '2:30 PM',
            status: 'Delivered',
            total: '$24.99',
            items: ['Margherita Pizza (Large)', 'Garlic Bread', 'Coca Cola'],
            statusColor: '#4CAF50',
        },
        {
            id: '#ORD-002',
            date: '2024-01-12',
            time: '7:45 PM',
            status: 'Delivered',
            total: '$31.50',
            items: ['Pepperoni Pizza (Medium)', 'BBQ Wings', 'Sprite'],
            statusColor: '#4CAF50',
        },
        {
            id: '#ORD-003',
            date: '2024-01-08',
            time: '1:15 PM',
            status: 'Cancelled',
            total: '$18.99',
            items: ['Veggie Supreme (Small)', 'Garlic Knots'],
            statusColor: '#ff4444',
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered':
                return '✅';
            case 'Cancelled':
                return '❌';
            case 'In Progress':
                return '🚚';
            default:
                return '📦';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📜 Order History</Text>
            </View>

            <ScrollView style={styles.content}>
                {orders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <View>
                                <Text style={styles.orderId}>{order.id}</Text>
                                <Text style={styles.orderDate}>{order.date} at {order.time}</Text>
                            </View>
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
                                <Text style={[styles.status, { color: order.statusColor }]}>
                                    {order.status}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.itemsList}>
                            {order.items.map((item, index) => (
                                <Text key={index} style={styles.orderItem}>• {item}</Text>
                            ))}
                        </View>

                        <View style={styles.orderFooter}>
                            <Text style={styles.total}>Total: {order.total}</Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                </TouchableOpacity>
                                {order.status === 'Delivered' && (
                                    <TouchableOpacity style={styles.reorderButton}>
                                        <Text style={styles.reorderButtonText}>Reorder</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}

                {orders.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🍕</Text>
                        <Text style={styles.emptyTitle}>No Orders Yet</Text>
                        <Text style={styles.emptyText}>
                            Your order history will appear here once you place your first order.
                        </Text>
                        <TouchableOpacity style={styles.startOrderButton}>
                            <Text style={styles.startOrderButtonText}>Start Ordering</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: '#FF6B6B',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemsList: {
        marginBottom: 12,
    },
    orderItem: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    viewButton: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
    },
    viewButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    reorderButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
    },
    reorderButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
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
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    startOrderButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    startOrderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});