import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function OrderHistoryScreen() {
    const deliveredOrders = [
        {
            id: '#DEL-001',
            customerName: 'John Doe',
            address: '123 Main Street, Apt 4B',
            completedAt: '2024-01-15 14:30',
            earnings: 12.50,
            tip: 5.00,
            distance: '2.3 miles',
        },
        {
            id: '#DEL-002',
            customerName: 'Sarah Wilson',
            address: '456 Oak Avenue',
            completedAt: '2024-01-15 12:15',
            earnings: 10.00,
            tip: 3.50,
            distance: '1.8 miles',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📜 Order History</Text>
            </View>

            <ScrollView style={styles.content}>
                {deliveredOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderId}>{order.id}</Text>
                            <Text style={styles.earnings}>+${(order.earnings + order.tip).toFixed(2)}</Text>
                        </View>

                        <Text style={styles.customerName}>📍 {order.customerName}</Text>
                        <Text style={styles.address}>{order.address}</Text>
                        <Text style={styles.distance}>🚗 {order.distance}</Text>

                        <View style={styles.orderFooter}>
                            <Text style={styles.completedAt}>Completed: {order.completedAt}</Text>
                            <View style={styles.earningsBreakdown}>
                                <Text style={styles.basePay}>Base: ${order.earnings}</Text>
                                <Text style={styles.tip}>Tip: ${order.tip}</Text>
                            </View>
                        </View>
                    </View>
                ))}
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
        backgroundColor: '#4CAF50',
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
        marginBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    earnings: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    customerName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    distance: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    orderFooter: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    completedAt: {
        fontSize: 12,
        color: '#666',
    },
    earningsBreakdown: {
        flexDirection: 'row',
        gap: 10,
    },
    basePay: {
        fontSize: 12,
        color: '#666',
    },
    tip: {
        fontSize: 12,
        color: '#4CAF50',
    },
});