import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

interface DeliveryAddress {
    id: string;
    type: 'home' | 'work' | 'other';
    address: string;
    city: string;
    zipCode: string;
    phone: string;
    isDefault: boolean;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'cash' | 'digital';
    name: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
    isDefault: boolean;
}

export default function CheckoutScreen() {
    const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
    const [selectedAddress, setSelectedAddress] = useState<string>('1');
    const [selectedPayment, setSelectedPayment] = useState<string>('1');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [tipAmount, setTipAmount] = useState('3.00');
    const [selectedTipOption, setSelectedTipOption] = useState<number | 'custom'>(18);

    const addresses: DeliveryAddress[] = [
        {
            id: '1',
            type: 'home',
            address: '123 Main Street, Apt 4B',
            city: 'New York, NY',
            zipCode: '10001',
            phone: '+1 (555) 123-4567',
            isDefault: true,
        },
        {
            id: '2',
            type: 'work',
            address: '456 Business Ave, Suite 200',
            city: 'New York, NY',
            zipCode: '10002',
            phone: '+1 (555) 987-6543',
            isDefault: false,
        },
    ];

    const paymentMethods: PaymentMethod[] = [
        {
            id: '1',
            type: 'card',
            name: 'Visa ending in 4567',
            last4: '4567',
            expiryMonth: '12',
            expiryYear: '25',
            isDefault: true,
        },
        {
            id: '2',
            type: 'card',
            name: 'Mastercard ending in 8901',
            last4: '8901',
            expiryMonth: '08',
            expiryYear: '26',
            isDefault: false,
        },
        {
            id: '3',
            type: 'cash',
            name: 'Cash on Delivery',
            isDefault: false,
        },
    ];

    const orderSummary = {
        subtotal: 35.47,
        tax: 3.02,
        deliveryFee: 2.99,
        serviceFee: 1.50,
    };

    const tipOptions = [15, 18, 20, 25];

    const calculateTip = () => {
        if (selectedTipOption === 'custom') {
            return parseFloat(tipAmount) || 0;
        } else {
            return (orderSummary.subtotal * (selectedTipOption as number)) / 100;
        }
    };

    const calculateTotal = () => {
        const tip = calculateTip();
        const deliveryFee = orderType === 'delivery' ? orderSummary.deliveryFee : 0;
        return orderSummary.subtotal + orderSummary.tax + deliveryFee + orderSummary.serviceFee + tip;
    };

    const handleTipSelection = (percentage: number) => {
        setSelectedTipOption(percentage);
        setTipAmount(((orderSummary.subtotal * percentage) / 100).toFixed(2));
    };

    const handleCustomTip = (amount: string) => {
        setTipAmount(amount);
        setSelectedTipOption('custom');
    };

    const placeOrder = () => {
        Alert.alert(
            'Order Confirmation',
            `Your order has been placed successfully! Total: $${calculateTotal().toFixed(2)}`,
            [
                { text: 'Track Order', onPress: () => console.log('Navigate to track order') },
            ]
        );
    };

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home': return '🏠';
            case 'work': return '🏢';
            default: return '📍';
        }
    };

    const getPaymentIcon = (type: string) => {
        switch (type) {
            case 'card': return '💳';
            case 'cash': return '💵';
            case 'digital': return '📱';
            default: return '💳';
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🛒 Checkout</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🚀 Order Type</Text>
                    <View style={styles.orderTypeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.orderTypeButton,
                                orderType === 'delivery' && styles.selectedOrderType
                            ]}
                            onPress={() => setOrderType('delivery')}
                        >
                            <Text style={styles.orderTypeIcon}>🚚</Text>
                            <Text style={[
                                styles.orderTypeText,
                                orderType === 'delivery' && styles.selectedOrderTypeText
                            ]}>
                                Delivery
                            </Text>
                            <Text style={styles.orderTypeTime}>30-45 mins</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.orderTypeButton,
                                orderType === 'pickup' && styles.selectedOrderType
                            ]}
                            onPress={() => setOrderType('pickup')}
                        >
                            <Text style={styles.orderTypeIcon}>🏪</Text>
                            <Text style={[
                                styles.orderTypeText,
                                orderType === 'pickup' && styles.selectedOrderTypeText
                            ]}>
                                Pickup
                            </Text>
                            <Text style={styles.orderTypeTime}>15-20 mins</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {orderType === 'delivery' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
                            <TouchableOpacity style={styles.addButton}>
                                <Text style={styles.addButtonText}>+ Add New</Text>
                            </TouchableOpacity>
                        </View>

                        {addresses.map((address) => (
                            <TouchableOpacity
                                key={address.id}
                                style={[
                                    styles.addressCard,
                                    selectedAddress === address.id && styles.selectedCard
                                ]}
                                onPress={() => setSelectedAddress(address.id)}
                            >
                                <View style={styles.addressHeader}>
                                    <View style={styles.addressTypeContainer}>
                                        <Text style={styles.addressIcon}>
                                            {getAddressIcon(address.type)}
                                        </Text>
                                        <Text style={styles.addressType}>
                                            {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                        </Text>
                                        {address.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    {selectedAddress === address.id && (
                                        <Text style={styles.selectedIcon}>✓</Text>
                                    )}
                                </View>
                                <Text style={styles.addressText}>{address.address}</Text>
                                <Text style={styles.addressText}>{address.city} {address.zipCode}</Text>
                                <Text style={styles.phoneText}>{address.phone}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>💳 Payment Method</Text>
                        <TouchableOpacity style={styles.addButton}>
                            <Text style={styles.addButtonText}>+ Add New</Text>
                        </TouchableOpacity>
                    </View>

                    {paymentMethods.map((payment) => (
                        <TouchableOpacity
                            key={payment.id}
                            style={[
                                styles.paymentCard,
                                selectedPayment === payment.id && styles.selectedCard
                            ]}
                            onPress={() => setSelectedPayment(payment.id)}
                        >
                            <View style={styles.paymentHeader}>
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentIcon}>
                                        {getPaymentIcon(payment.type)}
                                    </Text>
                                    <View>
                                        <Text style={styles.paymentName}>{payment.name}</Text>
                                        {payment.expiryMonth && payment.expiryYear && (
                                            <Text style={styles.paymentExpiry}>
                                                Expires {payment.expiryMonth}/{payment.expiryYear}
                                            </Text>
                                        )}
                                    </View>
                                    {payment.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultText}>Default</Text>
                                        </View>
                                    )}
                                </View>
                                {selectedPayment === payment.id && (
                                    <Text style={styles.selectedIcon}>✓</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {orderType === 'delivery' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💰 Tip Your Driver</Text>
                        <View style={styles.tipContainer}>
                            {tipOptions.map((percentage) => (
                                <TouchableOpacity
                                    key={percentage}
                                    style={[
                                        styles.tipButton,
                                        selectedTipOption === percentage && styles.selectedTipButton
                                    ]}
                                    onPress={() => handleTipSelection(percentage)}
                                >
                                    <Text style={[
                                        styles.tipButtonText,
                                        selectedTipOption === percentage && styles.selectedTipButtonText
                                    ]}>
                                        {percentage}%
                                    </Text>
                                    <Text style={[
                                        styles.tipAmountText,
                                        selectedTipOption === percentage && styles.selectedTipAmountText
                                    ]}>
                                        ${((orderSummary.subtotal * percentage) / 100).toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.customTipContainer}>
                            <Text style={styles.customTipLabel}>Custom Amount:</Text>
                            <TextInput
                                style={styles.customTipInput}
                                value={tipAmount}
                                onChangeText={handleCustomTip}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
                    <TextInput
                        style={styles.instructionsInput}
                        value={specialInstructions}
                        onChangeText={setSpecialInstructions}
                        placeholder="Add any special instructions for your order (optional)"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${orderSummary.subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax</Text>
                        <Text style={styles.summaryValue}>${orderSummary.tax.toFixed(2)}</Text>
                    </View>

                    {orderType === 'delivery' && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>${orderSummary.deliveryFee.toFixed(2)}</Text>
                        </View>
                    )}

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service Fee</Text>
                        <Text style={styles.summaryValue}>${orderSummary.serviceFee.toFixed(2)}</Text>
                    </View>

                    {orderType === 'delivery' && calculateTip() > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tip</Text>
                            <Text style={styles.summaryValue}>${calculateTip().toFixed(2)}</Text>
                        </View>
                    )}

                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
                    <Text style={styles.placeOrderText}>
                        Place Order • ${calculateTotal().toFixed(2)}
                    </Text>
                </TouchableOpacity>
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#4CAF50',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    orderTypeContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    orderTypeButton: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOrderType: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
    },
    orderTypeIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    orderTypeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    selectedOrderTypeText: {
        color: '#4CAF50',
    },
    orderTypeTime: {
        fontSize: 14,
        color: '#666',
    },
    addressCard: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    addressIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    addressType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    defaultBadge: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    defaultText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    selectedIcon: {
        fontSize: 20,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    phoneText: {
        fontSize: 14,
        color: '#888',
    },
    paymentCard: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    paymentExpiry: {
        fontSize: 12,
        color: '#666',
    },
    tipContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },
    tipButton: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedTipButton: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
    },
    tipButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    selectedTipButtonText: {
        color: '#4CAF50',
    },
    tipAmountText: {
        fontSize: 14,
        color: '#666',
    },
    selectedTipAmountText: {
        color: '#4CAF50',
    },
    customTipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    customTipLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    customTipInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    instructionsInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
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
        color: '#4CAF50',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    placeOrderButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});