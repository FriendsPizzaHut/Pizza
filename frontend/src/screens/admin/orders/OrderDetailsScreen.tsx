import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AdminOrderDetailsScreen() {
    const order = {
        id: '#ORD-12345',
        customerName: 'John Doe',
        customerPhone: '+1 (555) 123-4567',
        customerEmail: 'john.doe@example.com',
        address: '123 Main Street, Apt 4B',
        city: 'New York, NY 10001',
        orderTime: '2:30 PM',
        estimatedDelivery: '3:15 PM',
        status: 'Preparing',
        assignedDriver: 'Mike Johnson',
        items: [
            { name: 'Large Pepperoni Pizza', quantity: 1, price: 18.99, notes: 'Extra cheese' },
            { name: 'Garlic Bread', quantity: 1, price: 6.99, notes: '' },
            { name: 'Coca Cola (2L)', quantity: 1, price: 3.99, notes: '' },
        ],
        subtotal: 29.97,
        tax: 2.40,
        deliveryFee: 2.99,
        total: 35.36,
        paymentMethod: 'Credit Card (****4242)',
        specialInstructions: 'Please ring doorbell and leave at door. Building has secure entry.',
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Order Details</Text>
                <Text style={styles.orderId}>{order.id}</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statusCard}>
                    <Text style={styles.status}>Status: {order.status}</Text>
                    <Text style={styles.timing}>Ordered: {order.orderTime} • ETA: {order.estimatedDelivery}</Text>
                    {order.assignedDriver && (
                        <Text style={styles.driver}>Driver: {order.assignedDriver}</Text>
                    )}
                </View>

                <View style={styles.customerCard}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <Text style={styles.customerName}>👤 {order.customerName}</Text>
                    <Text style={styles.customerPhone}>📞 {order.customerPhone}</Text>
                    <Text style={styles.customerEmail}>📧 {order.customerEmail}</Text>
                    <Text style={styles.address}>📍 {order.address}</Text>
                    <Text style={styles.city}>{order.city}</Text>
                </View>

                <View style={styles.itemsCard}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.orderItem}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                                {item.notes && <Text style={styles.itemNotes}>Note: {item.notes}</Text>}
                            </View>
                            <Text style={styles.itemPrice}>${item.price}</Text>
                        </View>
                    ))}

                    <View style={styles.orderSummary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>${order.subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax:</Text>
                            <Text style={styles.summaryValue}>${order.tax}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                            <Text style={styles.summaryValue}>${order.deliveryFee}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalValue}>${order.total}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.paymentCard}>
                    <Text style={styles.sectionTitle}>Payment & Instructions</Text>
                    <Text style={styles.paymentMethod}>💳 {order.paymentMethod}</Text>
                    {order.specialInstructions && (
                        <>
                            <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                            <Text style={styles.instructions}>{order.specialInstructions}</Text>
                        </>
                    )}
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
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    orderId: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
    },
    content: {
        padding: 20,
    },
    statusCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    status: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9800',
        marginBottom: 5,
    },
    timing: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    driver: {
        fontSize: 14,
        color: '#2196F3',
    },
    customerCard: {
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    customerName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    customerPhone: {
        fontSize: 16,
        color: '#2196F3',
        marginBottom: 5,
    },
    customerEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    address: {
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    city: {
        fontSize: 14,
        color: '#666',
    },
    itemsCard: {
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
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
    },
    itemNotes: {
        fontSize: 12,
        color: '#FF9800',
        fontStyle: 'italic',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    orderSummary: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 2,
        borderTopColor: '#f0f0f0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    paymentCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    paymentMethod: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    instructionsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
});