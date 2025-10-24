import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CustomerStackParamList } from '../../../types/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/store';
import {
    setAddresses,
    selectAddress,
    setLoading,
    setError,
    isCacheValid,
    Address as AddressType,
} from '../../../../redux/slices/addressSlice';
import { placeOrderFromCartThunk } from '../../../../redux/thunks/orderThunks';
import apiClient from '../../../api/apiClient';
import { handleRazorpayPayment } from '../../../services/razorpayService';
import { getPublicSettings, PublicSettings } from '../../../services/restaurantSettingsService';

type CheckoutRouteProp = RouteProp<CustomerStackParamList, 'Checkout'>;

interface PaymentMethod {
    id: string;
    type: 'cash' | 'card' | 'upi' | 'wallet';
    name: string;
    last4?: string;
    icon: string;
    isDefault: boolean;
}

export default function CheckoutScreen() {
    const route = useRoute<CheckoutRouteProp>();
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const { cartTotal } = route.params || { cartTotal: 0 };

    // Get data from Redux
    const userId = useSelector((state: RootState) => state.auth.userId);
    const addresses = useSelector((state: RootState) => state.address.addresses);
    const selectedAddressId = useSelector((state: RootState) => state.address.selectedAddressId);
    const lastFetched = useSelector((state: RootState) => state.address.lastFetched);

    // State
    const [selectedPayment, setSelectedPayment] = useState<string>('1');
    const [orderInstructions, setOrderInstructions] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [userPhone, setUserPhone] = useState<string>(''); // Store user phone from profile
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Fetch restaurant settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoadingSettings(true);
            const publicSettings = await getPublicSettings();
            setSettings(publicSettings);
            console.log('✅ Restaurant settings loaded:', publicSettings);
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
            // Use fallback values if settings fail to load
            setSettings({
                minOrderAmount: 100,
                taxRate: 8.5,
                deliveryFee: 40,
                freeDeliveryThreshold: 2490,
            });
        } finally {
            setIsLoadingSettings(false);
        }
    };

    // Show only 3 addresses (selected + 2 others) for performance
    const visibleAddresses = React.useMemo(() => {
        if (addresses.length <= 3) return addresses;

        // Always include selected address
        const selected = addresses.find(a => a._id === selectedAddressId);
        const others = addresses.filter(a => a._id !== selectedAddressId).slice(0, 2);

        return selected ? [selected, ...others] : addresses.slice(0, 3);
    }, [addresses, selectedAddressId]);

    // Fetch user profile with addresses
    useEffect(() => {
        if (userId) {
            // Only fetch if cache is invalid
            if (!isCacheValid(lastFetched)) {
                fetchUserProfile();
            } else {
                setIsLoadingProfile(false);
            }
        } else {
            Alert.alert('Error', 'Please login to continue');
            navigation.goBack();
        }
    }, [userId, lastFetched]);

    const fetchUserProfile = async () => {
        try {
            setIsLoadingProfile(true);
            dispatch(setLoading(true));

            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await apiClient.get(`/users/${userId}`);

            if (response.data?.data?.address) {
                // Update Redux cache
                dispatch(setAddresses(response.data.data.address));
            }

            // Store user phone for order
            if (response.data?.data?.phone) {
                setUserPhone(response.data.data.phone);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load profile. Please try again.';
            dispatch(setError(errorMessage));
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoadingProfile(false);
            dispatch(setLoading(false));
        }
    };

    const paymentMethods: PaymentMethod[] = [
        {
            id: '1',
            type: 'cash',
            name: 'Cash on Delivery',
            icon: '💵',
            isDefault: true,
        },
        {
            id: '2',
            type: 'card',
            name: 'Credit/Debit Card',
            icon: '💳',
            isDefault: false,
        },
        {
            id: '3',
            type: 'upi',
            name: 'UPI Payment',
            icon: '📱',
            isDefault: false,
        },
        {
            id: '4',
            type: 'wallet',
            name: 'Digital Wallet',
            icon: '👛',
            isDefault: false,
        },
    ];

    // Calculate order summary using dynamic settings
    const orderSummary = {
        subtotal: cartTotal || 0,
        tax: settings ? (cartTotal || 0) * (settings.taxRate / 100) : 0,
        deliveryFee: settings ? (cartTotal > settings.freeDeliveryThreshold ? 0 : settings.deliveryFee) : 0,
        discount: 0,
    };

    const calculateTotal = () => {
        return orderSummary.subtotal + orderSummary.tax + orderSummary.deliveryFee - orderSummary.discount;
    };

    const placeOrder = async () => {
        if (isPlacingOrder) return;

        // Validation
        if (!addresses || addresses.length === 0) {
            Alert.alert('No Address', 'Please add a delivery address to continue');
            return;
        }

        if (!selectedAddressId) {
            Alert.alert('Address Required', 'Please select a delivery address');
            return;
        }

        // Validate minimum order using dynamic settings
        if (settings && cartTotal < settings.minOrderAmount) {
            Alert.alert(
                'Minimum Order Required',
                `Minimum order amount is ₹${settings.minOrderAmount}. Your cart total is ₹${cartTotal.toFixed(0)}. Please add more items.`
            );
            return;
        }

        if (!selectedPayment) {
            Alert.alert('Payment Required', 'Please select a payment method');
            return;
        }

        setIsPlacingOrder(true);

        try {
            const selectedAddr = addresses.find(a => a._id === selectedAddressId);
            const selectedPay = paymentMethods.find(p => p.id === selectedPayment);

            if (!selectedAddr) {
                throw new Error('Selected address not found');
            }

            // Get contact phone from user profile or use default
            const contactPhone = userPhone || '0000000000'; // Fallback if phone not in Redux

            // Prepare order data
            const orderData = {
                deliveryAddress: {
                    street: selectedAddr.street,
                    city: selectedAddr.city,
                    state: selectedAddr.state,
                    pincode: selectedAddr.pincode,
                    landmark: selectedAddr.landmark,
                    instructions: orderInstructions || undefined,
                },
                contactPhone,
                paymentMethod: selectedPay?.type || 'cash',
                orderInstructions: orderInstructions || undefined,
            };

            console.log('📦 Creating order with payment method:', selectedPay?.type);

            // Step 1: Place order using thunk (automatically clears cart on backend and Redux)
            const order = await dispatch(placeOrderFromCartThunk(orderData)).unwrap();

            console.log('✅ Order created:', order.orderNumber);

            // Step 2: Check if online payment is required
            const isOnlinePayment = selectedPay?.type !== 'cash';

            if (isOnlinePayment) {
                console.log('💳 Processing online payment...');

                try {
                    // Get user details for Razorpay checkout
                    const userResponse = await apiClient.get(`/users/${userId}`);
                    const userData = userResponse.data.data;

                    // Prepare order details for Razorpay
                    const orderDetails = {
                        _id: order._id,
                        orderNumber: order.orderNumber,
                        totalAmount: order.totalAmount,
                        user: {
                            name: userData.name || 'Customer',
                            email: userData.email || '',
                            phone: contactPhone,
                        },
                    };

                    // Open Razorpay checkout and process payment
                    const paymentResult = await handleRazorpayPayment(orderDetails);

                    console.log('✅ Payment successful:', paymentResult);

                    // Payment successful! Show success message
                    Alert.alert(
                        'Payment Successful! 🎉',
                        `Your payment has been received.\n\nOrder #${order.orderNumber}\nEstimated delivery: ${order.estimatedDeliveryTime} mins`,
                        [
                            {
                                text: 'Track Order',
                                onPress: () => {
                                    (navigation as any).reset({
                                        index: 0,
                                        routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
                                    });
                                }
                            },
                        ]
                    );
                } catch (paymentError: any) {
                    console.error('❌ Payment error:', paymentError);

                    // Check if payment was cancelled
                    if ((paymentError as any).code === 'PAYMENT_CANCELLED') {
                        Alert.alert(
                            'Payment Cancelled',
                            `Your order #${order.orderNumber} is created but payment is pending.\n\nYou can complete payment from your orders page.`,
                            [
                                {
                                    text: 'Go to Orders',
                                    onPress: () => {
                                        (navigation as any).reset({
                                            index: 0,
                                            routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
                                        });
                                    }
                                },
                                {
                                    text: 'OK',
                                    style: 'cancel'
                                }
                            ]
                        );
                    } else {
                        // Payment failed
                        Alert.alert(
                            'Payment Failed',
                            `Your order #${order.orderNumber} is created but payment failed.\n\n${paymentError.message}\n\nYou can retry payment from your orders page.`,
                            [
                                {
                                    text: 'Retry Payment',
                                    onPress: () => {
                                        (navigation as any).reset({
                                            index: 0,
                                            routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
                                        });
                                    }
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                }
                            ]
                        );
                    }
                }
            } else {
                // COD order - Show success message directly
                console.log('💵 Cash on Delivery order placed');

                Alert.alert(
                    'Order Placed! 🎉',
                    `Your order #${order.orderNumber} has been successfully placed.\n\nEstimated delivery: ${order.estimatedDeliveryTime} mins\n\nPay ${order.totalAmount.toFixed(0)} cash on delivery.`,
                    [
                        {
                            text: 'Track Order',
                            onPress: () => {
                                (navigation as any).reset({
                                    index: 0,
                                    routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
                                });
                            }
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('❌ Place order error:', error);

            // Handle specific error cases
            if (error?.message?.includes('Cart is empty')) {
                Alert.alert(
                    'Cart is Empty',
                    'Your cart is empty. Please add items before placing an order.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else if (error?.message?.includes('Token expired') || error?.message?.includes('Session expired')) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please login again.',
                    [
                        {
                            text: 'Login',
                            onPress: () => {
                                (navigation as any).reset({
                                    index: 0,
                                    routes: [{ name: 'Auth' }],
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', error?.message || 'Failed to place order. Please try again.');
            }
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const getAddressTypeIcon = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('home')) return 'home';
        if (lowerLabel.includes('work') || lowerLabel.includes('office')) return 'work';
        return 'place';
    };

    // Loading state
    if (isLoadingProfile || isLoadingSettings) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <ActivityIndicator size="large" color="#cb202d" />
                <Text style={styles.loadingText}>
                    {isLoadingSettings ? 'Loading settings...' : 'Loading your details...'}
                </Text>
            </View>
        );
    }

    // No addresses state
    const hasNoAddresses = !addresses || addresses.length === 0;

    const handleSelectAddress = (addressId: string) => {
        dispatch(selectAddress(addressId));
    };

    const handleAddAddress = () => {
        (navigation as any).navigate('AddAddress', { fromScreen: 'Checkout' });
    };

    const handleManageAddresses = () => {
        (navigation as any).navigate('ManageAddress', { fromScreen: 'Checkout' });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* No Addresses Warning */}
                {hasNoAddresses && (
                    <View style={styles.warningSection}>
                        <MaterialIcons name="warning" size={32} color="#f59e0b" />
                        <Text style={styles.warningTitle}>No Delivery Address</Text>
                        <Text style={styles.warningText}>
                            Please add a delivery address to place your order
                        </Text>
                        <TouchableOpacity
                            style={styles.addAddressButton}
                            onPress={handleAddAddress}
                        >
                            <MaterialIcons name="add" size={20} color="#fff" />
                            <Text style={styles.addAddressButtonText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Delivery Address */}
                {!hasNoAddresses && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                            <TouchableOpacity
                                style={styles.addNewButton}
                                onPress={handleAddAddress}
                            >
                                <MaterialIcons name="add" size={16} color="#0C7C59" />
                                <Text style={styles.addNewText}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.addressList}>
                            {visibleAddresses.map((address) => (
                                <TouchableOpacity
                                    key={address._id}
                                    style={[
                                        styles.addressCard,
                                        selectedAddressId === address._id && styles.addressCardSelected
                                    ]}
                                    onPress={() => handleSelectAddress(address._id || '')}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.addressHeader}>
                                        <View style={styles.addressTypeContainer}>
                                            <View style={[
                                                styles.addressIconContainer,
                                                selectedAddressId === address._id && styles.addressIconContainerSelected
                                            ]}>
                                                <MaterialIcons
                                                    name={getAddressTypeIcon(address.label)}
                                                    size={18}
                                                    color={selectedAddressId === address._id ? '#cb202d' : '#686b78'}
                                                />
                                            </View>
                                            <View style={styles.addressTypeInfo}>
                                                <Text style={styles.addressTypeText}>
                                                    {address.label}
                                                </Text>
                                                {address.isDefault && (
                                                    <View style={styles.defaultBadge}>
                                                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {selectedAddressId === address._id && (
                                            <View style={styles.selectedBadge}>
                                                <MaterialIcons name="check-circle" size={20} color="#cb202d" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.addressText}>{address.street}</Text>
                                    {address.landmark && (
                                        <Text style={styles.addressLandmark}>Near: {address.landmark}</Text>
                                    )}
                                    <Text style={styles.addressCity}>
                                        {address.city}, {address.state} {address.pincode}
                                    </Text>
                                    <View style={styles.addressFooter}>
                                        <MaterialIcons name="phone" size={14} color="#686b78" />
                                        <Text style={styles.phoneText}>Contact on file</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* View All Addresses Button (if more than 3) */}
                        {addresses.length > 3 && (
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={handleManageAddresses}
                            >
                                <Text style={styles.viewAllText}>
                                    View All {addresses.length} Addresses
                                </Text>
                                <MaterialIcons name="arrow-forward" size={18} color="#cb202d" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentList}>
                        {paymentMethods.map((payment) => (
                            <TouchableOpacity
                                key={payment.id}
                                style={[
                                    styles.paymentCard,
                                    selectedPayment === payment.id && styles.paymentCardSelected
                                ]}
                                onPress={() => setSelectedPayment(payment.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.paymentLeft}>
                                    <View style={[
                                        styles.radioCircle,
                                        selectedPayment === payment.id && styles.radioCircleSelected
                                    ]}>
                                        {selectedPayment === payment.id && (
                                            <View style={styles.radioInner} />
                                        )}
                                    </View>
                                    <Text style={styles.paymentIcon}>{payment.icon}</Text>
                                    <View>
                                        <Text style={styles.paymentName}>{payment.name}</Text>
                                        {payment.type === 'cash' && (
                                            <Text style={styles.paymentSubtext}>Pay on delivery</Text>
                                        )}
                                    </View>
                                </View>
                                {selectedPayment === payment.id && (
                                    <MaterialIcons name="check-circle" size={20} color="#cb202d" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Order Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cooking Instructions (Optional)</Text>
                    <TextInput
                        style={styles.instructionsInput}
                        value={orderInstructions}
                        onChangeText={setOrderInstructions}
                        placeholder="e.g., Extra cheese, less spicy, well done..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        maxLength={200}
                    />
                    <Text style={styles.instructionsCounter}>
                        {orderInstructions.length}/200
                    </Text>
                </View>

                {/* Bill Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill Details</Text>
                    <View style={styles.billDetails}>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Item Total</Text>
                            <Text style={styles.billValue}>₹{orderSummary.subtotal.toFixed(0)}</Text>
                        </View>

                        <View style={styles.billRow}>
                            <View style={styles.billLabelContainer}>
                                <Text style={styles.billLabel}>Delivery Fee</Text>
                                {orderSummary.deliveryFee === 0 && (
                                    <View style={styles.freeBadge}>
                                        <Text style={styles.freeBadgeText}>FREE</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[
                                styles.billValue,
                                orderSummary.deliveryFee === 0 && styles.billValueStrike
                            ]}>
                                ₹{orderSummary.deliveryFee === 0 ? '40' : orderSummary.deliveryFee.toFixed(0)}
                            </Text>
                        </View>

                        <View style={styles.billRow}>
                            <View style={styles.billLabelContainer}>
                                <Text style={styles.billLabel}>Taxes & Charges</Text>
                                <MaterialIcons name="info-outline" size={14} color="#686b78" />
                            </View>
                            <Text style={styles.billValue}>₹{orderSummary.tax.toFixed(0)}</Text>
                        </View>

                        {orderSummary.discount > 0 && (
                            <View style={styles.billRow}>
                                <Text style={[styles.billLabel, styles.discountLabel]}>Discount</Text>
                                <Text style={[styles.billValue, styles.discountValue]}>
                                    -₹{orderSummary.discount.toFixed(0)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.billDivider} />

                        <View style={styles.billRow}>
                            <Text style={styles.billTotalLabel}>To Pay</Text>
                            <Text style={styles.billTotalValue}>₹{calculateTotal().toFixed(0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Floating Place Order Button */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <View style={styles.footerLeft}>
                        <Text style={styles.footerTotalLabel}>Total Amount</Text>
                        <Text style={styles.footerTotalValue}>₹{calculateTotal().toFixed(0)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.placeOrderButton,
                            isPlacingOrder && styles.placeOrderButtonDisabled
                        ]}
                        onPress={placeOrder}
                        disabled={isPlacingOrder}
                        activeOpacity={0.8}
                    >
                        {isPlacingOrder ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.placeOrderText}>Place Order</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'center',
    },
    headerPlaceholder: {
        width: 40,
    },

    // Loading & Warning
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#686b78',
        marginTop: 12,
    },
    warningSection: {
        margin: 16,
        padding: 24,
        backgroundColor: '#fffbeb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fef3c7',
        alignItems: 'center',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400e',
        marginTop: 12,
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#78350f',
        textAlign: 'center',
        marginBottom: 16,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#0C7C59',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addAddressButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },

    // Section
    section: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#f8f8f8',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 16,
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#0C7C59',
        backgroundColor: '#f0fdf4',
    },
    addNewText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0C7C59',
    },

    // Address Cards
    addressList: {
        gap: 12,
    },
    addressCard: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
        borderWidth: 2,
        borderColor: '#f0f0f0',
    },
    addressCardSelected: {
        backgroundColor: '#fff5f5',
        borderColor: '#cb202d',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    addressIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressIconContainerSelected: {
        backgroundColor: '#fee2e2',
    },
    addressTypeInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressTypeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    defaultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        backgroundColor: '#fef3c7',
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#92400e',
        letterSpacing: 0.5,
    },
    selectedBadge: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressText: {
        fontSize: 14,
        color: '#686b78',
        lineHeight: 20,
        marginBottom: 4,
    },
    addressLandmark: {
        fontSize: 13,
        color: '#9ca3af',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    addressCity: {
        fontSize: 14,
        color: '#686b78',
        marginBottom: 8,
    },
    addressFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    phoneText: {
        fontSize: 13,
        color: '#686b78',
        fontWeight: '500',
    },

    // View All Button
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#cb202d',
    },

    // Payment Cards
    paymentList: {
        gap: 12,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
        borderWidth: 2,
        borderColor: '#f0f0f0',
    },
    paymentCardSelected: {
        backgroundColor: '#fff5f5',
        borderColor: '#cb202d',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d4d5d9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: '#cb202d',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#cb202d',
    },
    paymentIcon: {
        fontSize: 24,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    paymentSubtext: {
        fontSize: 12,
        color: '#686b78',
    },

    // Instructions Input
    instructionsInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: '#2d2d2d',
        textAlignVertical: 'top',
        minHeight: 100,
        backgroundColor: '#f8f8f8',
    },
    instructionsCounter: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'right',
        marginTop: 6,
    },

    // Bill Details
    billDetails: {
        gap: 12,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    billLabel: {
        fontSize: 14,
        color: '#686b78',
        fontWeight: '500',
    },
    billValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    billValueStrike: {
        textDecorationLine: 'line-through',
        color: '#9ca3af',
    },
    freeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#d1fae5',
    },
    freeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#059669',
        letterSpacing: 0.5,
    },
    discountLabel: {
        color: '#059669',
    },
    discountValue: {
        color: '#059669',
    },
    billDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 8,
    },
    billTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    billTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    footerLeft: {
        flex: 1,
    },
    footerTotalLabel: {
        fontSize: 12,
        color: '#686b78',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    placeOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#0C7C59',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        minWidth: 160,
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    bottomSpacing: {
        height: 20,
    },
});
