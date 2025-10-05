import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the route params type
type OrderDetailsRouteProp = RouteProp<{ OrderDetails: { orderId: string } }, 'OrderDetails'>;

export default function OrderDetailsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<OrderDetailsRouteProp>();
    const { orderId } = route.params;

    // Mock order details - in real app, fetch based on orderId
    const orderDetails = {
        id: '#ORD-001',
        customer: {
            name: 'John Doe',
            phone: '+1 (555) 123-4567',
            email: 'john.doe@example.com',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        },
        deliveryAddress: {
            street: '123 Main St, Apt 4B',
            city: 'New York',
            zipCode: '10001',
            landmark: 'Near Central Park',
        },
        status: 'preparing',
        orderTime: '14:30',
        estimatedReady: '15:15',
        priority: 'normal',
        paymentMethod: 'Card',
        paymentStatus: 'Paid',
        items: [
            {
                name: 'Margherita Pizza',
                quantity: 2,
                size: 'Large',
                price: 12.99,
                addOns: [
                    { name: 'Extra Cheese', price: 2.00 },
                    { name: 'Mushrooms', price: 1.50 },
                ],
                specialInstructions: 'Extra crispy crust',
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop',
            },
            {
                name: 'Pepperoni Pizza',
                quantity: 1,
                size: 'Medium',
                price: 14.99,
                addOns: [
                    { name: 'Extra Pepperoni', price: 3.00 },
                ],
                specialInstructions: '',
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop',
            },
            {
                name: 'Garlic Bread',
                quantity: 1,
                size: 'Regular',
                price: 4.99,
                addOns: [],
                specialInstructions: '',
                image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&h=300&fit=crop',
            },
        ],
        subtotal: 45.46,
        deliveryFee: 5.00,
        tax: 3.53,
        discount: 0,
        total: 53.99,
        deliveryNotes: 'Please ring the doorbell twice',
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', color: '#FF9800', bgColor: '#FFF3E0', icon: 'schedule' };
            case 'preparing':
                return { label: 'Preparing', color: '#2196F3', bgColor: '#E3F2FD', icon: 'restaurant' };
            case 'ready':
                return { label: 'Ready', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'delivery':
                return { label: 'Out for Delivery', color: '#9C27B0', bgColor: '#F3E5F5', icon: 'delivery-dining' };
            case 'delivered':
                return { label: 'Delivered', color: '#607D8B', bgColor: '#ECEFF1', icon: 'done-all' };
            default:
                return { label: status, color: '#666', bgColor: '#F5F5F5', icon: 'info' };
        }
    };

    const statusConfig = getStatusConfig(orderDetails.status);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Order Details</Text>
                        <Text style={styles.orderId}>{orderDetails.id}</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusBadgeLarge, { backgroundColor: statusConfig.bgColor }]}>
                        <MaterialIcons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
                        <Text style={[styles.statusTextLarge, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                    <View style={styles.timeInfo}>
                        <View style={styles.timeItem}>
                            <MaterialIcons name="access-time" size={16} color="#8E8E93" />
                            <Text style={styles.timeLabel}>Order Time</Text>
                            <Text style={styles.timeValue}>{orderDetails.orderTime}</Text>
                        </View>
                        <View style={styles.timeDivider} />
                        <View style={styles.timeItem}>
                            <MaterialIcons name="schedule" size={16} color="#8E8E93" />
                            <Text style={styles.timeLabel}>Ready By</Text>
                            <Text style={styles.timeValue}>{orderDetails.estimatedReady}</Text>
                        </View>
                    </View>
                </View>

                {/* Customer Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="person" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>Customer Information</Text>
                    </View>
                    <View style={styles.customerCard}>
                        <Image
                            source={{ uri: orderDetails.customer.profileImage }}
                            style={styles.customerImage}
                            resizeMode="cover"
                        />
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{orderDetails.customer.name}</Text>
                            <TouchableOpacity style={styles.contactRow}>
                                <MaterialIcons name="phone" size={14} color="#2196F3" />
                                <Text style={styles.contactText}>{orderDetails.customer.phone}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow}>
                                <MaterialIcons name="email" size={14} color="#2196F3" />
                                <Text style={styles.contactText}>{orderDetails.customer.email}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-on" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressStreet}>{orderDetails.deliveryAddress.street}</Text>
                        <Text style={styles.addressCity}>{orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.zipCode}</Text>
                        {orderDetails.deliveryAddress.landmark && (
                            <View style={styles.landmarkRow}>
                                <MaterialIcons name="location-searching" size={14} color="#FF6B35" />
                                <Text style={styles.landmarkText}>{orderDetails.deliveryAddress.landmark}</Text>
                            </View>
                        )}
                        {orderDetails.deliveryNotes && (
                            <View style={styles.notesRow}>
                                <MaterialIcons name="sticky-note-2" size={14} color="#FF9800" />
                                <Text style={styles.notesText}>{orderDetails.deliveryNotes}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="restaurant-menu" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>Order Items</Text>
                    </View>
                    {orderDetails.items.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            {/* Image Section at Top */}
                            <View style={styles.imageSection}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.pizzaImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.quantityBadgeTop}>
                                    <Text style={styles.quantityBadgeText}>×{item.quantity}</Text>
                                </View>
                            </View>

                            {/* Content Section */}
                            <View style={styles.contentSection}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemSize}>{item.size}</Text>
                                <Text style={styles.itemBasePrice}>${item.price.toFixed(2)} each</Text>

                                {item.addOns.length > 0 && (
                                    <View style={styles.addOnsSection}>
                                        <Text style={styles.addOnsTitle}>Add-ons:</Text>
                                        {item.addOns.map((addOn, addOnIndex) => (
                                            <View key={addOnIndex} style={styles.addOnRow}>
                                                <View style={styles.addOnDot} />
                                                <Text style={styles.addOnName}>{addOn.name}</Text>
                                                <Text style={styles.addOnPrice}>+${addOn.price.toFixed(2)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {item.specialInstructions && (
                                    <View style={styles.instructionsRow}>
                                        <MaterialIcons name="info-outline" size={14} color="#FF9800" />
                                        <Text style={styles.instructionsText}>{item.specialInstructions}</Text>
                                    </View>
                                )}

                                <View style={styles.itemTotal}>
                                    <Text style={styles.itemTotalLabel}>Item Total</Text>
                                    <Text style={styles.itemTotalPrice}>
                                        ${((item.price + item.addOns.reduce((sum, addOn) => sum + addOn.price, 0)) * item.quantity).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>                {/* Payment Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="payment" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                    </View>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Subtotal</Text>
                            <Text style={styles.paymentValue}>${orderDetails.subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Delivery Fee</Text>
                            <Text style={styles.paymentValue}>${orderDetails.deliveryFee.toFixed(2)}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Tax</Text>
                            <Text style={styles.paymentValue}>${orderDetails.tax.toFixed(2)}</Text>
                        </View>
                        {orderDetails.discount > 0 && (
                            <View style={styles.paymentRow}>
                                <Text style={[styles.paymentLabel, { color: '#4CAF50' }]}>Discount</Text>
                                <Text style={[styles.paymentValue, { color: '#4CAF50' }]}>-${orderDetails.discount.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>${orderDetails.total.toFixed(2)}</Text>
                        </View>
                        <View style={styles.paymentMethodRow}>
                            <MaterialIcons name="credit-card" size={16} color="#2196F3" />
                            <Text style={styles.paymentMethodText}>{orderDetails.paymentMethod}</Text>
                            <View style={[styles.paymentStatusBadge, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.paymentStatusText, { color: '#4CAF50' }]}>{orderDetails.paymentStatus}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    {orderDetails.status === 'pending' && (
                        <>
                            <TouchableOpacity style={styles.acceptButton}>
                                <MaterialIcons name="check" size={20} color="#fff" />
                                <Text style={styles.acceptButtonText}>Accept Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton}>
                                <MaterialIcons name="close" size={20} color="#fff" />
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {orderDetails.status === 'preparing' && (
                        <TouchableOpacity style={styles.readyButton}>
                            <MaterialIcons name="done-all" size={20} color="#fff" />
                            <Text style={styles.readyButtonText}>Mark as Ready</Text>
                        </TouchableOpacity>
                    )}
                    {orderDetails.status === 'ready' && (
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => navigation.navigate('AssignDeliveryAgent', {
                                orderId: orderDetails.id,
                                orderDetails: orderDetails
                            })}
                        >
                            <MaterialIcons name="delivery-dining" size={20} color="#fff" />
                            <Text style={styles.assignButtonText}>Assign to Delivery</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.printButton}>
                        <MaterialIcons name="print" size={18} color="#666" />
                        <Text style={styles.printButtonText}>Print Receipt</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#f4f4f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    orderId: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    headerRight: {
        width: 44,
    },

    content: {
        flex: 1,
    },

    // Status Card
    statusCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statusBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    statusTextLarge: {
        fontSize: 16,
        fontWeight: '700',
    },
    timeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    timeItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    timeDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 16,
    },
    timeLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Section
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Customer Card
    customerCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    customerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    customerInfo: {
        flex: 1,
        gap: 6,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: '500',
    },

    // Address Card
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    addressStreet: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    addressCity: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    landmarkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    landmarkText: {
        fontSize: 13,
        color: '#FF6B35',
        fontWeight: '500',
    },
    notesRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    notesText: {
        fontSize: 13,
        color: '#FF9800',
        fontWeight: '500',
        flex: 1,
    },

    // Item Card
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    imageSection: {
        position: 'relative',
        height: 200,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pizzaImage: {
        width: '100%',
        height: '100%',
    },
    quantityBadgeTop: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#cb202d',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    quantityBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    contentSection: {
        padding: 16,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 6,
        lineHeight: 24,
    },
    itemSize: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    itemBasePrice: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 12,
    },
    addOnsSection: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
    },
    addOnsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 6,
    },
    addOnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addOnDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cb202d',
        marginRight: 8,
    },
    addOnName: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    addOnPrice: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    instructionsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: '#FFF9E6',
        padding: 8,
        borderRadius: 6,
        marginTop: 8,
    },
    instructionsText: {
        fontSize: 12,
        color: '#FF9800',
        fontStyle: 'italic',
        flex: 1,
    },
    itemTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    itemTotalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    itemTotalPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#cb202d',
    },

    // Payment Card
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    paymentDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#cb202d',
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    paymentMethodText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196F3',
        flex: 1,
    },
    paymentStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    paymentStatusText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Action Buttons
    actionsSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        gap: 12,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    rejectButton: {
        backgroundColor: '#F44336',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    readyButton: {
        backgroundColor: '#2196F3',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    readyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    assignButton: {
        backgroundColor: '#9C27B0',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    printButton: {
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    printButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#666',
    },
});
