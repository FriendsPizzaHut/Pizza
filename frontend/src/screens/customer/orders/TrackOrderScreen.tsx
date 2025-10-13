import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

interface OrderTrackingData {
    orderId: string;
    status: 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
    estimatedTime: string;
    placedAt: string;
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    deliveryAddress?: string;
    driverInfo?: {
        name: string;
        phone: string;
        vehicle: string;
        photo?: string;
    };
    timeline: {
        step: string;
        time: string;
        completed: boolean;
    }[];
}

export default function TrackOrderScreen() {
    const [order, setOrder] = useState<OrderTrackingData>({
        orderId: 'ORD-2024-001',
        status: 'preparing',
        estimatedTime: '25 mins',
        placedAt: '2:45 PM',
        items: [
            { name: 'Margherita Pizza (Large)', quantity: 2, price: 15.98 },
            { name: 'Pepperoni Pizza (Medium)', quantity: 1, price: 14.99 },
            { name: 'Garlic Bread', quantity: 3, price: 17.97 },
            { name: 'Coca-Cola (500ml)', quantity: 2, price: 5.98 },
        ],
        total: 54.92,
        deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
        driverInfo: {
            name: 'Sarah Johnson',
            phone: '+1 (555) 234-5678',
            vehicle: 'Honda Civic - Blue (ABC 123)',
        },
        timeline: [
            { step: 'Order Placed', time: '2:45 PM', completed: true },
            { step: 'Order Confirmed', time: '2:47 PM', completed: true },
            { step: 'Preparing Food', time: '2:50 PM', completed: true },
            { step: 'Ready for Delivery', time: '', completed: false },
            { step: 'Out for Delivery', time: '', completed: false },
            { step: 'Delivered', time: '', completed: false },
        ],
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'confirmed':
                return { emoji: '✅', title: 'Order Confirmed', description: 'Your order has been confirmed and is being prepared' };
            case 'preparing':
                return { emoji: '👨‍🍳', title: 'Preparing Your Order', description: 'Our chefs are preparing your delicious meal' };
            case 'ready':
                return { emoji: '🍕', title: 'Order Ready', description: 'Your order is ready and waiting for pickup' };
            case 'out_for_delivery':
                return { emoji: '🚗', title: 'Out for Delivery', description: 'Your order is on the way!' };
            case 'delivered':
                return { emoji: '🎉', title: 'Delivered', description: 'Your order has been delivered. Enjoy!' };
            default:
                return { emoji: '📋', title: 'Processing', description: 'Processing your order' };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    const handleCallDriver = () => {
        Alert.alert(
            'Call Driver',
            `Would you like to call ${order.driverInfo?.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => console.log('Calling driver...') },
            ]
        );
    };

    const handleReorder = () => {
        Alert.alert('Reorder', 'Add these items to your cart again?');
    };

    const handleRateOrder = () => {
        Alert.alert('Rate Order', 'How was your experience?');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📍 Track Order</Text>
                <Text style={styles.orderId}>Order #{order.orderId}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>{statusInfo.title}</Text>
                            <Text style={styles.statusDescription}>{statusInfo.description}</Text>
                        </View>
                    </View>

                    <View style={styles.estimatedTime}>
                        <Text style={styles.timeLabel}>Estimated Time</Text>
                        <Text style={styles.timeValue}>{order.estimatedTime}</Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>📋 Order Progress</Text>

                    {order.timeline.map((step, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineIndicator}>
                                <View style={[
                                    styles.timelineDot,
                                    step.completed && styles.completedDot
                                ]} />
                                {index < order.timeline.length - 1 && (
                                    <View style={[
                                        styles.timelineLine,
                                        step.completed && styles.completedLine
                                    ]} />
                                )}
                            </View>

                            <View style={styles.timelineContent}>
                                <Text style={[
                                    styles.timelineStep,
                                    step.completed && styles.completedStep
                                ]}>
                                    {step.step}
                                </Text>
                                {step.time && (
                                    <Text style={styles.timelineTime}>{step.time}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {order.status === 'out_for_delivery' && order.driverInfo && (
                    <View style={styles.driverCard}>
                        <Text style={styles.sectionTitle}>🚗 Driver Information</Text>

                        <View style={styles.driverInfo}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.driverAvatarText}>👤</Text>
                            </View>

                            <View style={styles.driverDetails}>
                                <Text style={styles.driverName}>{order.driverInfo.name}</Text>
                                <Text style={styles.driverVehicle}>{order.driverInfo.vehicle}</Text>
                                <Text style={styles.driverPhone}>{order.driverInfo.phone}</Text>
                            </View>

                            <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                                <Text style={styles.callButtonText}>📞 Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {order.deliveryAddress && (
                    <View style={styles.addressCard}>
                        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
                        <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                    </View>
                )}

                <View style={styles.orderSummary}>
                    <Text style={styles.sectionTitle}>📋 Order Summary</Text>

                    {order.items.map((item, index) => (
                        <View key={index} style={styles.orderItem}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>
                                    {item.quantity}x {item.name}
                                </Text>
                            </View>
                            <Text style={styles.itemPrice}>₹{item.price.toFixed(0)}</Text>
                        </View>
                    ))}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{order.total.toFixed(0)}</Text>
                    </View>
                </View>

                <View style={styles.orderDetails}>
                    <Text style={styles.sectionTitle}>📄 Order Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Time</Text>
                        <Text style={styles.detailValue}>{order.placedAt}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Type</Text>
                        <Text style={styles.detailValue}>Delivery</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment</Text>
                        <Text style={styles.detailValue}>Card ending in 4567</Text>
                    </View>
                </View>

                {order.status === 'delivered' && (
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleReorder}>
                            <Text style={styles.actionButtonText}>🔄 Reorder</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleRateOrder}>
                            <Text style={styles.actionButtonText}>⭐ Rate Order</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.helpSection}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <TouchableOpacity style={styles.helpButton}>
                        <Text style={styles.helpButtonText}>💬 Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
        marginBottom: 5,
    },
    orderId: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    content: {
        padding: 20,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusEmoji: {
        fontSize: 48,
        marginRight: 15,
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statusDescription: {
        fontSize: 16,
        color: '#666',
    },
    estimatedTime: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 14,
        color: '#1976D2',
        marginBottom: 5,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    progressSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineIndicator: {
        alignItems: 'center',
        marginRight: 15,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ddd',
        borderWidth: 2,
        borderColor: '#fff',
    },
    completedDot: {
        backgroundColor: '#4CAF50',
    },
    timelineLine: {
        width: 2,
        height: 40,
        backgroundColor: '#ddd',
        marginTop: 5,
    },
    completedLine: {
        backgroundColor: '#4CAF50',
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 20,
    },
    timelineStep: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 2,
    },
    completedStep: {
        color: '#333',
    },
    timelineTime: {
        fontSize: 14,
        color: '#888',
    },
    driverCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    driverAvatarText: {
        fontSize: 24,
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    driverVehicle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    driverPhone: {
        fontSize: 14,
        color: '#666',
    },
    callButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    callButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    addressText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    orderSummary: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        color: '#333',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    orderDetails: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#666',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    helpButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    helpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});