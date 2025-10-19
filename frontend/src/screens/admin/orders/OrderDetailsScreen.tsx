import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../../api/axiosInstance';
import { shareOrderToKitchen } from '../../../utils/whatsappHelper'; // 🔥 PART 1.9

// Define the route params type
type OrderDetailsRouteProp = RouteProp<{ OrderDetails: { orderId: string } }, 'OrderDetails'>;

export default function OrderDetailsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<OrderDetailsRouteProp>();
    const { orderId } = route.params;

    // 🔥 PART 1.1: State management
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false); // 🔥 PART 1.5: Button loading state

    console.log('🔥 PART 1.1 - OrderDetailsScreen initialized');
    console.log('  - Order ID from params:', orderId);

    // 🔥 PART 1.1: Fetch order data from API
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                console.log('📡 PART 1.1 - Fetching order details...');
                setLoading(true);
                setError(null);

                const response = await axiosInstance.get(`/orders/${orderId}`);

                console.log('✅ PART 1.1 - Order details fetched successfully');
                console.log('  - Order Number:', response.data.data.order.orderNumber);
                console.log('  - Status:', response.data.data.order.status);
                console.log('  - Full Order Data:', JSON.stringify(response.data.data.order, null, 2));

                setOrderDetails(response.data.data.order);
            } catch (err: any) {
                console.error('❌ PART 1.1 - Error fetching order:', err.message);
                setError(err.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    // Mock order details - REMOVED, now using state above
    const mockOrderDetails = {
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
            case 'accepted':
                return { label: 'Accepted', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'assigned':
                return { label: 'Assigned', color: '#2196F3', bgColor: '#E3F2FD', icon: 'person' };
            case 'out_for_delivery':
                return { label: 'Out for Delivery', color: '#9C27B0', bgColor: '#F3E5F5', icon: 'delivery-dining' };
            case 'delivered':
                return { label: 'Delivered', color: '#607D8B', bgColor: '#ECEFF1', icon: 'done-all' };
            case 'cancelled':
                return { label: 'Cancelled', color: '#F44336', bgColor: '#FFEBEE', icon: 'cancel' };
            default:
                return { label: status, color: '#666', bgColor: '#F5F5F5', icon: 'info' };
        }
    };

    // 🔥 PART 1.1: Loading state
    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />
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
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#cb202d" />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            </View>
        );
    }

    // 🔥 PART 1.1: Error state
    if (error || !orderDetails) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />
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
                        </View>
                        <View style={styles.headerRight} />
                    </View>
                </SafeAreaView>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={64} color="#F44336" />
                    <Text style={styles.errorTitle}>Failed to Load Order</Text>
                    <Text style={styles.errorText}>{error || 'Order not found'}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setLoading(true);
                            setError(null);
                            // Trigger re-fetch by updating orderId dependency
                        }}
                    >
                        <MaterialIcons name="refresh" size={20} color="#fff" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const statusConfig = getStatusConfig(orderDetails.status);

    // 🔥 PART 1.5: Accept Order Handler
    const handleAcceptOrder = async () => {
        try {
            console.log('✅ PART 1.5 - Accepting order:', orderId);
            setActionLoading(true);

            const response = await axiosInstance.post(`/orders/${orderId}/accept`);

            console.log('✅ PART 1.5 - Order accepted successfully');

            // Update local state with the new order data
            const updatedOrder = response.data.data?.order || response.data.data || response.data.order || response.data;
            setOrderDetails(updatedOrder);

            // Show success feedback
            console.log('✅ Order status changed to:', updatedOrder.status);
            alert('Order accepted successfully!');
        } catch (err: any) {
            console.error('❌ PART 1.5 - Error accepting order:', err.message);
            alert(err.response?.data?.message || 'Failed to accept order');
        } finally {
            setActionLoading(false);
        }
    };

    // 🔥 PART 1.6: Reject Order Handler
    const handleRejectOrder = async () => {
        try {
            console.log('❌ PART 1.6 - Rejecting order:', orderId);

            // TODO: Show confirmation dialog with reason input
            const confirmed = confirm('Are you sure you want to reject this order?');
            if (!confirmed) return;

            setActionLoading(true);

            const response = await axiosInstance.post(`/orders/${orderId}/reject`, {
                reason: 'Rejected by admin' // TODO: Get from user input
            });

            console.log('✅ PART 1.6 - Order rejected successfully');

            // Update local state with the new order data
            const updatedOrder = response.data.data?.order || response.data.data || response.data.order || response.data;
            setOrderDetails(updatedOrder);

            console.log('✅ Order status changed to:', updatedOrder.status);
            alert('Order has been rejected');
        } catch (err: any) {
            console.error('❌ PART 1.6 - Error rejecting order:', err.message);
            alert(err.response?.data?.message || 'Failed to reject order');
        } finally {
            setActionLoading(false);
        }
    };

    // 🔥 PART 1.7: Mark Ready Handler
    const handleMarkReady = async () => {
        try {
            console.log('🍕 PART 1.7 - Marking order as ready:', orderId);
            setActionLoading(true);

            const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
                status: 'ready'
            });

            console.log('✅ PART 1.7 - Order marked as ready');
            console.log('Response structure:', JSON.stringify(response.data, null, 2));

            // Update local state with the new order data
            const updatedOrder = response.data.data?.order || response.data.data || response.data.order || response.data;
            setOrderDetails(updatedOrder);

            console.log('✅ Order status changed to:', updatedOrder.status);
            alert('Order marked as ready for delivery!');
        } catch (err: any) {
            console.error('❌ PART 1.7 - Error marking order ready:', err.message);
            console.error('Error response:', err.response?.data);
            alert(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setActionLoading(false);
        }
    };

    // 🔥 PART 1.9: Share to Kitchen Handler
    const handleShareToKitchen = async () => {
        try {
            console.log('📱 PART 1.9 - Sharing order to kitchen via WhatsApp');

            const success = await shareOrderToKitchen(orderDetails, '919060557296');

            if (success) {
                console.log('✅ PART 1.9 - Order shared successfully');
            }
        } catch (err: any) {
            console.error('❌ PART 1.9 - Error sharing to WhatsApp:', err.message);
        }
    };

    // 🔥 PART 1.1: Format helpers for API data
    const formatTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatEstimatedTime = () => {
        if (orderDetails.estimatedDeliveryTime) {
            return `${orderDetails.estimatedDeliveryTime} mins`;
        }
        return 'N/A';
    };

    const getCustomerImage = () => {
        return orderDetails.user?.profileImage ||
            orderDetails.customer?.profileImage ||
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(orderDetails.user?.name || 'User');
    };

    console.log('🔥 PART 1.1 - Rendering order details');
    console.log('  - Order Number:', orderDetails.orderNumber);
    console.log('  - Customer:', orderDetails.user?.name);
    console.log('  - Items:', orderDetails.items?.length);

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
                        <Text style={styles.orderId}>#{orderDetails.orderNumber || orderDetails.id}</Text>
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
                            <Text style={styles.timeValue}>{formatTime(orderDetails.createdAt)}</Text>
                        </View>
                        <View style={styles.timeDivider} />
                        <View style={styles.timeItem}>
                            <MaterialIcons name="schedule" size={16} color="#8E8E93" />
                            <Text style={styles.timeLabel}>Ready By</Text>
                            <Text style={styles.timeValue}>{formatEstimatedTime()}</Text>
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
                            source={{ uri: getCustomerImage() }}
                            style={styles.customerImage}
                            resizeMode="cover"
                        />
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{orderDetails.user?.name || 'Unknown Customer'}</Text>
                            <TouchableOpacity style={styles.contactRow}>
                                <MaterialIcons name="phone" size={14} color="#2196F3" />
                                <Text style={styles.contactText}>{orderDetails.user?.phone || orderDetails.contactPhone || 'N/A'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow}>
                                <MaterialIcons name="email" size={14} color="#2196F3" />
                                <Text style={styles.contactText}>{orderDetails.user?.email || 'N/A'}</Text>
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
                        <Text style={styles.addressStreet}>{orderDetails.deliveryAddress?.street || 'N/A'}</Text>
                        <Text style={styles.addressCity}>
                            {orderDetails.deliveryAddress?.city || ''}{orderDetails.deliveryAddress?.zipCode ? `, ${orderDetails.deliveryAddress.zipCode}` : ''}
                        </Text>
                        {orderDetails.deliveryAddress?.landmark && (
                            <View style={styles.landmarkRow}>
                                <MaterialIcons name="location-searching" size={14} color="#FF6B35" />
                                <Text style={styles.landmarkText}>{orderDetails.deliveryAddress.landmark}</Text>
                            </View>
                        )}
                        {orderDetails.specialInstructions && (
                            <View style={styles.notesRow}>
                                <MaterialIcons name="sticky-note-2" size={14} color="#FF9800" />
                                <Text style={styles.notesText}>{orderDetails.specialInstructions}</Text>
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
                    {(orderDetails.items || []).map((item: any, index: number) => {
                        // 🔥 PART 1.1: Handle API data structure correctly
                        // API returns: { productSnapshot: {name, imageUrl, basePrice}, selectedPrice, customToppings, subtotal, quantity, size, specialInstructions }

                        const productSnapshot = item.productSnapshot || {};
                        const itemName = productSnapshot.name || 'Unknown Item';
                        const itemImage = productSnapshot.imageUrl || 'https://via.placeholder.com/300';

                        // Price handling: selectedPrice is the price per unit, subtotal is total for quantity
                        const itemPrice = item.selectedPrice || productSnapshot.basePrice || 0;
                        const itemSubtotal = item.subtotal || 0;
                        const itemQuantity = item.quantity || 1;
                        const itemSize = item.size ? item.size.charAt(0).toUpperCase() + item.size.slice(1) : null;

                        // Custom toppings (from API)
                        const customToppings = item.customToppings || [];

                        console.log('🍕 Rendering item:', {
                            name: itemName,
                            price: itemPrice,
                            subtotal: itemSubtotal,
                            quantity: itemQuantity,
                            size: itemSize,
                            toppings: customToppings.length
                        });

                        return (
                            <View key={item._id || index} style={styles.itemCard}>
                                {/* Image Section at Top */}
                                <View style={styles.imageSection}>
                                    <Image
                                        source={{ uri: itemImage }}
                                        style={styles.pizzaImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.quantityBadgeTop}>
                                        <Text style={styles.quantityBadgeText}>×{itemQuantity}</Text>
                                    </View>
                                </View>

                                {/* Content Section */}
                                <View style={styles.contentSection}>
                                    <Text style={styles.itemName}>{itemName}</Text>
                                    {itemSize && <Text style={styles.itemSize}>{itemSize}</Text>}
                                    <Text style={styles.itemBasePrice}>₹{itemPrice.toFixed(0)} each</Text>

                                    {customToppings.length > 0 && (
                                        <View style={styles.addOnsSection}>
                                            <Text style={styles.addOnsTitle}>Custom Toppings:</Text>
                                            {customToppings.map((topping: any, toppingIndex: number) => (
                                                <View key={toppingIndex} style={styles.addOnRow}>
                                                    <View style={styles.addOnDot} />
                                                    <Text style={styles.addOnName}>{topping.name}</Text>
                                                    {topping.price > 0 && (
                                                        <Text style={styles.addOnPrice}>+₹{topping.price.toFixed(0)}</Text>
                                                    )}
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
                                            ₹{itemSubtotal.toFixed(0)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Payment Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="payment" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                    </View>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Subtotal</Text>
                            <Text style={styles.paymentValue}>₹{(orderDetails.subtotal || 0).toFixed(0)}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Delivery Fee</Text>
                            <Text style={styles.paymentValue}>₹{(orderDetails.deliveryFee || 0).toFixed(0)}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Tax</Text>
                            <Text style={styles.paymentValue}>₹{(orderDetails.tax || 0).toFixed(0)}</Text>
                        </View>
                        {orderDetails.discount > 0 && (
                            <View style={styles.paymentRow}>
                                <Text style={[styles.paymentLabel, { color: '#4CAF50' }]}>Discount</Text>
                                <Text style={[styles.paymentValue, { color: '#4CAF50' }]}>-₹{orderDetails.discount.toFixed(0)}</Text>
                            </View>
                        )}
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{(orderDetails.totalAmount || orderDetails.total || 0).toFixed(0)}</Text>
                        </View>
                        <View style={styles.paymentMethodRow}>
                            <MaterialIcons name="credit-card" size={16} color="#2196F3" />
                            <Text style={styles.paymentMethodText}>{orderDetails.paymentMethod || 'Cash'}</Text>
                            <View style={[styles.paymentStatusBadge, { backgroundColor: orderDetails.paymentStatus === 'paid' ? '#E8F5E9' : '#FFF3E0' }]}>
                                <Text style={[styles.paymentStatusText, { color: orderDetails.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }]}>
                                    {orderDetails.paymentStatus || 'Pending'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    {/* Pending orders: Show Accept & Reject buttons */}
                    {orderDetails.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.acceptButton, actionLoading && styles.buttonDisabled]}
                                onPress={handleAcceptOrder}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="check" size={20} color="#fff" />
                                        <Text style={styles.acceptButtonText}>Accept Order</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.rejectButton, actionLoading && styles.buttonDisabled]}
                                onPress={handleRejectOrder}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                        <Text style={styles.rejectButtonText}>Reject</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                    {/* Accepted orders: Show Assign to Delivery button */}
                    {orderDetails.status === 'accepted' && (
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => navigation.navigate('AssignDelivery', {
                                orderId: orderDetails.orderNumber || orderDetails._id || orderDetails.id,
                                orderDetails: orderDetails
                            })}
                        >
                            <MaterialIcons name="delivery-dining" size={20} color="#fff" />
                            <Text style={styles.assignButtonText}>Assign to Delivery</Text>
                        </TouchableOpacity>
                    )}
                    {/* Assigned orders: Show delivery agent info (read-only) */}
                    {orderDetails.status === 'assigned' && (
                        <View style={styles.assignedInfo}>
                            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                            <Text style={styles.assignedInfoText}>
                                Assigned to delivery agent
                            </Text>
                        </View>
                    )}

                    {/* 🔥 PART 1.9: WhatsApp Share Button */}
                    {['confirmed', 'preparing', 'ready'].includes(orderDetails.status) && (
                        <TouchableOpacity
                            style={styles.whatsappButton}
                            onPress={handleShareToKitchen}
                        >
                            <MaterialIcons name="chat" size={18} color="#fff" />
                            <Text style={styles.whatsappButtonText}>Share to Kitchen (WhatsApp)</Text>
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
    assignedInfo: {
        backgroundColor: '#E8F5E9',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    assignedInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
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
    // 🔥 PART 1.9: WhatsApp Button
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366', // WhatsApp green
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    whatsappButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    // 🔥 PART 1.1: Loading and Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 20,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cb202d',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    // 🔥 PART 1.5: Button disabled state
    buttonDisabled: {
        opacity: 0.6,
    },
});
