import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function OrderManagementScreen() {
    const orders = [
        {
            id: '#ORD-001',
            customer: 'John Doe',
            items: 3,
            total: 35.99,
            status: 'Preparing',
            time: '14:30',
            estimatedReady: '15:15',
            priority: 'normal',
        },
        {
            id: '#ORD-002',
            customer: 'Sarah Wilson',
            items: 2,
            total: 24.50,
            status: 'Ready',
            time: '14:25',
            estimatedReady: '15:10',
            priority: 'high',
        },
        {
            id: '#ORD-003',
            customer: 'Mike Johnson',
            items: 5,
            total: 47.75,
            status: 'Out for Delivery',
            time: '14:20',
            estimatedReady: '15:05',
            priority: 'normal',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Preparing': return '#FF9800';
            case 'Ready': return '#4CAF50';
            case 'Out for Delivery': return '#2196F3';
            case 'Delivered': return '#9E9E9E';
            default: return '#666';
        }
    };

    const getPriorityColor = (priority: string) => {
        return priority === 'high' ? '#F44336' : '#666';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📋 Order Management</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Active Orders</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Ready to Deliver</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>In Preparation</Text>
                    </View>
                </View>

                <View style={styles.ordersSection}>
                    <Text style={styles.sectionTitle}>Current Orders</Text>

                    {orders.map((order) => (
                        <TouchableOpacity key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>{order.id}</Text>
                                    <Text style={styles.customerName}>{order.customer}</Text>
                                </View>
                                <View style={styles.orderMeta}>
                                    <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
                                        {order.status}
                                    </Text>
                                    {order.priority === 'high' && (
                                        <Text style={[styles.priority, { color: getPriorityColor(order.priority) }]}>
                                            🔥 HIGH PRIORITY
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.orderDetails}>
                                <Text style={styles.orderInfo}>📦 {order.items} items • ${order.total}</Text>
                                <Text style={styles.orderTime}>⏰ Ordered: {order.time} • Ready by: {order.estimatedReady}</Text>
                            </View>

                            <View style={styles.orderActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Text style={styles.actionButtonText}>View Details</Text>
                                </TouchableOpacity>
                                {order.status === 'Ready' && (
                                    <TouchableOpacity style={styles.assignButton}>
                                        <Text style={styles.assignButtonText}>Assign Delivery</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === 'Preparing' && (
                                    <TouchableOpacity style={styles.readyButton}>
                                        <Text style={styles.readyButtonText}>Mark Ready</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>📊</Text>
                        <Text style={styles.quickActionText}>View All Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>🚚</Text>
                        <Text style={styles.quickActionText}>Manage Deliveries</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>⚠️</Text>
                        <Text style={styles.quickActionText}>Priority Orders</Text>
                    </TouchableOpacity>
                </View>
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
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    ordersSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    customerName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    orderMeta: {
        alignItems: 'flex-end',
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    priority: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    orderDetails: {
        marginBottom: 15,
    },
    orderInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    orderTime: {
        fontSize: 12,
        color: '#666',
    },
    orderActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
    },
    actionButtonText: {
        color: '#333',
        fontSize: 14,
    },
    assignButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    readyButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
    },
    readyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    quickActions: {
        marginTop: 10,
    },
    quickActionButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        fontSize: 20,
        marginRight: 15,
    },
    quickActionText: {
        fontSize: 16,
        color: '#333',
    },
});