import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

interface OrderDetails {
    orderId: string;
    status: 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
    orderType: 'delivery' | 'pickup';
    placedAt: string;
    deliveredAt?: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        size?: string;
        customizations?: string[];
        price: number;
    }[];
    pricing: {
        subtotal: number;
        tax: number;
        deliveryFee: number;
        tip: number;
        discount: number;
        total: number;
    };
    customerInfo: {
        name: string;
        phone: string;
        email: string;
    };
    deliveryAddress?: string;
    paymentMethod: string;
    specialInstructions?: string;
    driverInfo?: {
        name: string;
        phone: string;
        vehicle: string;
        rating: number;
    };
}

export default function OrderDetailsScreen() {
    const [order] = useState<OrderDetails>({
        orderId: 'ORD-2024-001',
        status: 'delivered',
        orderType: 'delivery',
        placedAt: 'March 15, 2024 at 2:45 PM',
        deliveredAt: 'March 15, 2024 at 3:20 PM',
        items: [
            {
                id: '1',
                name: 'Margherita Pizza',
                quantity: 2,
                size: 'Large',
                customizations: ['Extra Cheese', 'Thin Crust'],
                price: 15.98,
            },
            {
                id: '2',
                name: 'Pepperoni Pizza',
                quantity: 1,
                size: 'Medium',
                customizations: ['Thick Crust'],
                price: 14.99,
            },
            {
                id: '3',
                name: 'Garlic Bread',
                quantity: 3,
                customizations: ['Extra Garlic'],
                price: 17.97,
            },
            {
                id: '4',
                name: 'Coca-Cola',
                quantity: 2,
                size: '500ml',
                price: 5.98,
            },
        ],
        pricing: {
            subtotal: 54.92,
            tax: 4.67,
            deliveryFee: 2.99,
            tip: 8.24,
            discount: 5.00,
            total: 65.82,
        },
        customerInfo: {
            name: 'John Doe',
            phone: '+1 (555) 123-4567',
            email: 'john.doe@email.com',
        },
        deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
        paymentMethod: 'Visa ending in 4567',
        specialInstructions: 'Please ring the doorbell twice and leave at the door.',
        driverInfo: {
            name: 'Sarah Johnson',
            phone: '+1 (555) 234-5678',
            vehicle: 'Honda Civic - Blue (ABC 123)',
            rating: 4.9,
        },
    });

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'confirmed':
                return { emoji: '✅', title: 'Confirmed', color: '#4CAF50' };
            case 'preparing':
                return { emoji: '👨‍🍳', title: 'Preparing', color: '#FF9800' };
            case 'ready':
                return { emoji: '🍕', title: 'Ready', color: '#2196F3' };
            case 'out_for_delivery':
                return { emoji: '🚗', title: 'Out for Delivery', color: '#9C27B0' };
            case 'delivered':
                return { emoji: '🎉', title: 'Delivered', color: '#4CAF50' };
            case 'cancelled':
                return { emoji: '❌', title: 'Cancelled', color: '#f44336' };
            default:
                return { emoji: '📋', title: 'Processing', color: '#666' };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    const handleReorder = () => {
        Alert.alert(
            'Reorder Items',
            'Add all items from this order to your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Add to Cart', onPress: () => console.log('Items added to cart') },
            ]
        );
    };

    const handleRateOrder = () => {
        Alert.alert('Rate Order', 'How was your experience with this order?');
    };

    const handleReportIssue = () => {
        Alert.alert('Report Issue', 'What issue would you like to report?');
    };

    const handleCallDriver = () => {
        if (order.driverInfo) {
            Alert.alert(
                'Call Driver',
                `Would you like to call ${order.driverInfo.name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => console.log('Calling driver...') },
                ]
            );
        }
    };

    const handleDownloadReceipt = () => {
        Alert.alert('Download Receipt', 'Receipt will be downloaded to your device.');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📋 Order Details</Text>
                <Text style={styles.orderId}>#{order.orderId}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
                        <View style={styles.statusInfo}>
                            <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                                {statusInfo.title}
                            </Text>
                            <Text style={styles.orderType}>
                                {order.orderType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'} Order
                            </Text>
                        </View>
                    </View>

                    <View style={styles.orderTimes}>
                        <View style={styles.timeItem}>
                            <Text style={styles.timeLabel}>Placed At</Text>
                            <Text style={styles.timeValue}>{order.placedAt}</Text>
                        </View>
                        {order.deliveredAt && (
                            <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>Delivered At</Text>
                                <Text style={styles.timeValue}>{order.deliveredAt}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🛒 Order Items</Text>
                    {order.items.map((item) => (
                        <View key={item.id} style={styles.orderItem}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemName}>
                                    {item.quantity}x {item.name}
                                </Text>
                                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                            </View>

                            {item.size && (
                                <Text style={styles.itemDetail}>Size: {item.size}</Text>
                            )}

                            {item.customizations && item.customizations.length > 0 && (
                                <Text style={styles.itemDetail}>
                                    Customizations: {item.customizations.join(', ')}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Pricing Breakdown</Text>

                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Subtotal</Text>
                        <Text style={styles.pricingValue}>${order.pricing.subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Tax</Text>
                        <Text style={styles.pricingValue}>${order.pricing.tax.toFixed(2)}</Text>
                    </View>

                    {order.orderType === 'delivery' && (
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Delivery Fee</Text>
                            <Text style={styles.pricingValue}>${order.pricing.deliveryFee.toFixed(2)}</Text>
                        </View>
                    )}

                    {order.pricing.tip > 0 && (
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Tip</Text>
                            <Text style={styles.pricingValue}>${order.pricing.tip.toFixed(2)}</Text>
                        </View>
                    )}

                    {order.pricing.discount > 0 && (
                        <View style={styles.pricingRow}>
                            <Text style={[styles.pricingLabel, { color: '#4CAF50' }]}>Discount</Text>
                            <Text style={[styles.pricingValue, { color: '#4CAF50' }]}>
                                -${order.pricing.discount.toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.pricingRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${order.pricing.total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👤 Customer Information</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{order.customerInfo.name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{order.customerInfo.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{order.customerInfo.email}</Text>
                    </View>
                </View>

                {order.deliveryAddress && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
                        <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💳 Payment Information</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method</Text>
                        <Text style={styles.infoValue}>{order.paymentMethod}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Status</Text>
                        <Text style={[styles.infoValue, { color: '#4CAF50' }]}>Paid</Text>
                    </View>
                </View>

                {order.specialInstructions && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
                        <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
                    </View>
                )}

                {order.driverInfo && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🚗 Driver Information</Text>

                        <View style={styles.driverInfo}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.driverAvatarText}>👤</Text>
                            </View>

                            <View style={styles.driverDetails}>
                                <Text style={styles.driverName}>{order.driverInfo.name}</Text>
                                <Text style={styles.driverVehicle}>{order.driverInfo.vehicle}</Text>
                                <Text style={styles.driverRating}>
                                    ⭐ {order.driverInfo.rating} rating
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.callDriverButton} onPress={handleCallDriver}>
                                <Text style={styles.callDriverText}>📞 Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleReorder}>
                        <Text style={styles.actionButtonText}>🔄 Reorder</Text>
                    </TouchableOpacity>

                    {order.status === 'delivered' && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleRateOrder}>
                            <Text style={styles.actionButtonText}>⭐ Rate Order</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={handleDownloadReceipt}
                    >
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                            📄 Download Receipt
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={handleReportIssue}
                    >
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                            ⚠️ Report Issue
                        </Text>
                    </TouchableOpacity>
                </View>

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
        backgroundColor: '#673AB7',
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
        fontSize: 18,
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
        marginBottom: 20,
    },
    statusEmoji: {
        fontSize: 48,
        marginRight: 15,
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    orderType: {
        fontSize: 16,
        color: '#666',
    },
    orderTimes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeItem: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    orderItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#673AB7',
    },
    itemDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    pricingLabel: {
        fontSize: 16,
        color: '#666',
    },
    pricingValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 10,
        paddingTop: 15,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#673AB7',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    addressText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    instructionsText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        fontStyle: 'italic',
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
    driverRating: {
        fontSize: 14,
        color: '#666',
    },
    callDriverButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    callDriverText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#673AB7',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#673AB7',
    },
    secondaryButtonText: {
        color: '#673AB7',
    },
    helpSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
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