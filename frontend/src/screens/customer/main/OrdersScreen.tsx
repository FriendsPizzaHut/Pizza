import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function OrdersScreen() {
    const navigation = useNavigation<NavigationProp>();

    const orders = [
        { id: '1234', status: '🚚 Out for Delivery', items: '2x Margherita Pizza, 1x Pepperoni Pizza', total: '$42.97', date: 'Today, 2:30 PM' },
        { id: '1233', status: '✅ Delivered', items: '1x Vegetarian Supreme', total: '$16.99', date: 'Yesterday, 7:15 PM' },
        { id: '1232', status: '✅ Delivered', items: '1x Meat Lovers, 1x Margherita', total: '$31.98', date: '2 days ago' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📋 My Orders</Text>
            </View>

            <ScrollView style={styles.ordersList}>
                <View style={styles.ordersSection}>
                    {orders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.orderCard}
                            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                        >
                            <Text style={styles.orderNumber}>Order #{order.id}</Text>
                            <Text style={styles.orderStatus}>{order.status}</Text>
                            <Text style={styles.orderItems}>{order.items}</Text>
                            <Text style={styles.orderTotal}>Total: {order.total}</Text>
                            <Text style={styles.orderDate}>Ordered: {order.date}</Text>

                            {order.status.includes('Delivery') && (
                                <TouchableOpacity
                                    style={styles.trackButton}
                                    onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
                                >
                                    <Text style={styles.trackButtonText}>Track Order</Text>
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('OrderHistory')}
                    >
                        <Text style={styles.historyButtonText}>📜 View All Order History</Text>
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
        backgroundColor: '#FF6B6B',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    ordersList: {
        flex: 1,
    },
    ordersSection: {
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
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    orderStatus: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    orderItems: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginBottom: 5,
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    trackButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    trackButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    historyButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF6B6B',
        borderStyle: 'dashed',
    },
    historyButtonText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
});