import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryStackParamList } from '../../../types/navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<DeliveryStackParamList>;

export default function ActiveOrdersScreen() {
    const navigation = useNavigation<NavigationProp>();

    const activeOrders = [
        {
            id: '#ORD-158',
            customerName: 'Sarah Johnson',
            customerPhone: '+1 (555) 123-4567',
            restaurant: 'Pizza Palace',
            restaurantAddress: '123 Restaurant St.',
            restaurantPhone: '+1 (555) 111-2222',
            deliveryAddress: '456 Oak Avenue, Apt 4B',
            distance: '2.1 km',
            estimatedTime: '15 mins',
            status: 'picked_up',
            total: '₹485.50',
            items: ['Large Pepperoni Pizza', 'Garlic Bread', 'Coke'],
            earnings: '₹65.00',
            orderTime: '2:30 PM',
            currentStep: 2, // 0: going to restaurant, 1: at restaurant, 2: picked up, 3: delivered
        },
        {
            id: '#ORD-159',
            customerName: 'Mike Chen',
            customerPhone: '+1 (555) 987-6543',
            restaurant: 'Burger Junction',
            restaurantAddress: '789 Food Street',
            restaurantPhone: '+1 (555) 333-4444',
            deliveryAddress: '123 Maple Ave, Suite 12',
            distance: '3.5 km',
            estimatedTime: '22 mins',
            status: 'ready_for_pickup',
            total: '₹599.99',
            items: ['2 Medium Pizzas', 'Buffalo Wings', 'Sprite'],
            earnings: '₹78.00',
            orderTime: '1:15 PM',
            currentStep: 1,
        },
    ];

    const steps = ['Go to Restaurant', 'Pickup Order', 'Deliver Order', 'Complete'];

    const handleCallCustomer = (customerPhone: string) => {
        Alert.alert('Call Customer', `Call ${customerPhone}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => console.log('Calling customer...') }
        ]);
    };

    const handleCallRestaurant = (restaurantPhone: string) => {
        Alert.alert('Call Restaurant', `Call ${restaurantPhone}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => console.log('Calling restaurant...') }
        ]);
    };

    const handlePickup = (orderId: string) => {
        Alert.alert('Pickup Confirmed', 'Order has been picked up successfully!');
    };

    const handleDelivery = (orderId: string) => {
        Alert.alert('Delivery Completed', 'Order has been delivered successfully!');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Modern Header inspired by MenuScreen and HomeScreen */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                            </TouchableOpacity>
                            <View style={styles.headerCenter}>
                                <Text style={styles.headerTitle}>Active Deliveries</Text>
                            </View>
                            <View style={styles.headerRight} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Advertisement Banner */}
                <View style={styles.advertisementBanner}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1659353740953-c93814e4a2a5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                        style={styles.advertisementImage}
                        resizeMode="cover"
                    />
                </View>
                {activeOrders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="delivery-dining" size={64} color="#E0E0E0" />
                        <Text style={styles.emptyStateTitle}>No Active Orders</Text>
                        <Text style={styles.emptyStateMessage}>
                            You don't have any active deliveries right now.
                        </Text>
                    </View>
                ) : (
                    activeOrders.map((order, index) => (
                        <View key={index} style={styles.orderCard}>
                            {/* Top Section with Customer Info */}
                            <View style={styles.topSection}>
                                <View style={styles.customerIconContainer}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.customerDetails}>
                                    <Text style={styles.customerName}>{order.customerName}</Text>
                                    <Text style={styles.orderNumber}>Order {order.id}</Text>
                                </View>
                            </View>

                            {/* Order Status Section */}
                            <View style={styles.statusSection}>
                                <View style={styles.divider} />
                                <View style={styles.statusRow}>
                                    <View style={styles.statusBadge}>
                                        <View style={styles.statusDot} />
                                        <Text style={styles.statusText}>
                                            {order.status === 'picked_up' ? 'On the way to customer' : 'Ready for pickup'}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderTime}>{order.orderTime}</Text>
                                </View>
                            </View>

                            {/* Delivery Details Section */}
                            <View style={styles.deliveryDetailsSection}>
                                <View style={styles.divider} />
                                <View style={styles.deliveryRow}>
                                    <MaterialIcons name="home" size={16} color="#2196F3" />
                                    <View style={styles.deliveryInfo}>
                                        <Text style={styles.deliveryTitle}>{order.customerName}</Text>
                                        <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
                                        <Text style={styles.distanceInfo}>{order.distance}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Order Summary Section */}
                            <View style={styles.orderSummarySection}>
                                <View style={styles.divider} />
                                <View style={styles.summaryHeader}>
                                    <MaterialIcons name="receipt-long" size={16} color="#FF6B35" />
                                    <Text style={styles.summaryTitle}>Order Summary</Text>
                                </View>

                                <View style={styles.itemsList}>
                                    {order.items.map((item, itemIndex) => {
                                        // Parse item to extract quantity and name (assuming format like "2x Margherita Pizza")
                                        const itemMatch = item.match(/^(\d+)x?\s*(.+)$/);
                                        const quantity = itemMatch ? itemMatch[1] : '1';
                                        const itemName = itemMatch ? itemMatch[2] : item;
                                        // Mock individual prices for demo (in real app, this would come from order data)
                                        const itemPrice = itemIndex === 0 ? 24.99 : itemIndex === 1 ? 8.99 : 4.99;
                                        const totalItemPrice = parseFloat(quantity) * itemPrice;

                                        return (
                                            <View key={itemIndex} style={styles.summaryItem}>
                                                <Text style={styles.itemQuantityName}>
                                                    {quantity} × {itemName}
                                                </Text>
                                                <Text style={styles.itemPrice}>${totalItemPrice.toFixed(2)}</Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                <View style={styles.summaryDivider} />
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalAmount}>{order.total}</Text>
                                </View>
                            </View>                            {/* Action Buttons */}
                            <View style={styles.actionsSection}>
                                {order.status === 'ready_for_pickup' ? (
                                    <TouchableOpacity
                                        style={styles.pickupButton}
                                        onPress={() => handlePickup(order.id)}
                                    >
                                        <MaterialIcons name="shopping-bag" size={16} color="#fff" />
                                        <Text style={styles.pickupButtonText}>Pickup</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.deliverButton}
                                        onPress={() => handleDelivery(order.id)}
                                    >
                                        <MaterialIcons name="check-circle" size={16} color="#fff" />
                                        <Text style={styles.deliverButtonText}>Complete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>


                        </View>
                    ))
                )}

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

    // Header styles inspired by MenuScreen and HomeScreen
    headerSafeArea: {
        backgroundColor: '#f4f4f2',
    },
    header: {
        backgroundColor: '#f4f4f2',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        textAlign: 'center',
    },
    headerRight: {
        width: 44,
        alignItems: 'flex-end',
    },

    // Advertisement Banner
    advertisementBanner: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    advertisementImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F0F0F0',
    },

    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    // Order Cards (matching OrdersScreen style)
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
    customerIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    customerDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
        lineHeight: 20,
    },
    orderNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    itemsSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    itemText: {
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
    },
    statusTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 30,
        flex: 1,
        marginRight: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Action Buttons
    actionsSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    pickupButton: {
        flex: 1,
        backgroundColor: '#FF9800',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    deliverButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deliverButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },

    // Enhanced Sections
    statusSection: {
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    orderTime: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },

    deliveryDetailsSection: {
        marginBottom: 8,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    deliveryInfo: {
        flex: 1,
        marginLeft: 12,
    },
    deliveryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    deliveryAddress: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    distanceInfo: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '500',
        marginTop: 4,
    },

    orderSummarySection: {
        marginBottom: 8,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginLeft: 8,
    },
    itemsList: {
        marginBottom: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemQuantityName: {
        fontSize: 14,
        color: '#2d2d2d',
        flex: 1,
        fontWeight: '500',
    },
    itemPrice: {
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '600',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Modern Location Section
    modernLocationSection: {
        marginBottom: 16,
    },
    modernLocationCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    locationGradient: {
        padding: 16,
    },
    locationCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    locationCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    modernCallButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    locationCardContent: {
        paddingLeft: 52,
    },
    modernLocationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    modernLocationAddress: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    distanceText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        fontWeight: '500',
    },
    journeyIndicator: {
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    journeyLine: {
        position: 'absolute',
        width: 2,
        height: 30,
        backgroundColor: '#E0E0E0',
        left: '50%',
        marginLeft: -1,
    },
    journeyDots: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    journeyDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FF6B35',
    },

    // Modern Items Section
    modernItemsSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    itemsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    modernItemsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    itemsBadge: {
        backgroundColor: '#FF6B35',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    bottomSpacing: {
        height: 20,
    },
});