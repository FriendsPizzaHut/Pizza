import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    customizations?: string[];
    image?: string;
}

export default function CartScreen() {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            name: 'Margherita Pizza',
            price: 12.99,
            quantity: 2,
            size: 'Large',
            customizations: ['Extra Cheese', 'Thin Crust'],
        },
        {
            id: '2',
            name: 'Pepperoni Pizza',
            price: 14.99,
            quantity: 1,
            size: 'Medium',
            customizations: ['Thick Crust'],
        },
        {
            id: '3',
            name: 'Garlic Bread',
            price: 5.99,
            quantity: 3,
            customizations: ['Extra Garlic'],
        },
        {
            id: '4',
            name: 'Coca-Cola',
            price: 2.99,
            quantity: 2,
            size: '500ml',
        },
    ]);

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string, discount: number } | null>(null);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.085; // 8.5% tax
    const deliveryFee = 2.99;
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const total = subtotal + tax + deliveryFee - discount;

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity === 0) {
            setCartItems(cartItems.filter(item => item.id !== id));
        } else {
            setCartItems(cartItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const applyPromoCode = () => {
        const validCodes = {
            'WELCOME10': 5.00,
            'STUDENT15': 7.50,
            'PIZZA20': 10.00,
        };

        if (validCodes[promoCode as keyof typeof validCodes]) {
            setAppliedPromo({
                code: promoCode,
                discount: validCodes[promoCode as keyof typeof validCodes]
            });
            setPromoCode('');
            Alert.alert('Success!', `Promo code ${promoCode} applied successfully!`);
        } else {
            Alert.alert('Invalid Code', 'The promo code you entered is not valid.');
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before proceeding.');
            return;
        }
        // Navigate to checkout screen
        console.log('Proceeding to checkout...');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🛒 Your Cart</Text>
                <Text style={styles.itemCount}>{cartItems.length} items</Text>
            </View>

            <ScrollView style={styles.content}>
                {cartItems.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Text style={styles.emptyCartIcon}>🛒</Text>
                        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyCartSubtext}>Add some delicious pizzas to get started!</Text>
                        <TouchableOpacity style={styles.browseMenuButton}>
                            <Text style={styles.browseMenuText}>Browse Menu</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <View style={styles.cartItems}>
                            {cartItems.map((item) => (
                                <View key={item.id} style={styles.cartItem}>
                                    <View style={styles.itemImage}>
                                        <Text style={styles.itemImagePlaceholder}>🍕</Text>
                                    </View>

                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        {item.size && (
                                            <Text style={styles.itemSize}>Size: {item.size}</Text>
                                        )}
                                        {item.customizations && item.customizations.length > 0 && (
                                            <Text style={styles.itemCustomizations}>
                                                + {item.customizations.join(', ')}
                                            </Text>
                                        )}
                                        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                                    </View>

                                    <View style={styles.quantityControls}>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Text style={styles.quantityButtonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantity}>{item.quantity}</Text>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Text style={styles.quantityButtonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.promoSection}>
                            <Text style={styles.sectionTitle}>🎟️ Promo Code</Text>
                            {appliedPromo ? (
                                <View style={styles.appliedPromo}>
                                    <Text style={styles.appliedPromoText}>
                                        {appliedPromo.code} applied (-${appliedPromo.discount.toFixed(2)})
                                    </Text>
                                    <TouchableOpacity onPress={removePromo}>
                                        <Text style={styles.removePromo}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.promoInput}>
                                    <TextInput
                                        style={styles.promoCodeInput}
                                        value={promoCode}
                                        onChangeText={setPromoCode}
                                        placeholder="Enter promo code"
                                    />
                                    <TouchableOpacity
                                        style={styles.applyButton}
                                        onPress={applyPromoCode}
                                    >
                                        <Text style={styles.applyButtonText}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.orderSummary}>
                            <Text style={styles.sectionTitle}>📋 Order Summary</Text>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tax (8.5%)</Text>
                                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
                            </View>

                            {appliedPromo && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                                        Discount ({appliedPromo.code})
                                    </Text>
                                    <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                        -${appliedPromo.discount.toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.suggestedItems}>
                            <Text style={styles.sectionTitle}>🌟 You Might Also Like</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {[
                                    { name: 'Buffalo Wings', price: 8.99 },
                                    { name: 'Caesar Salad', price: 6.99 },
                                    { name: 'Chocolate Cake', price: 4.99 },
                                ].map((item, index) => (
                                    <View key={index} style={styles.suggestedItem}>
                                        <Text style={styles.suggestedItemName}>{item.name}</Text>
                                        <Text style={styles.suggestedItemPrice}>${item.price}</Text>
                                        <TouchableOpacity style={styles.addSuggestedButton}>
                                            <Text style={styles.addSuggestedText}>+ Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </ScrollView>

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
                        <Text style={styles.checkoutButtonText}>
                            Proceed to Checkout • ${total.toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#FF5722',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    itemCount: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    emptyCart: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyCartIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyCartTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptyCartSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    browseMenuButton: {
        backgroundColor: '#FF5722',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    browseMenuText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartItems: {
        marginBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 60,
        height: 60,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    itemImagePlaceholder: {
        fontSize: 24,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemSize: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    itemCustomizations: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5722',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    promoSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    appliedPromo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        padding: 15,
        borderRadius: 8,
    },
    appliedPromoText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    removePromo: {
        fontSize: 14,
        color: '#f44336',
        fontWeight: '600',
    },
    promoInput: {
        flexDirection: 'row',
        gap: 10,
    },
    promoCodeInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: '#FF5722',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderSummary: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
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
        color: '#FF5722',
    },
    suggestedItems: {
        marginBottom: 20,
    },
    suggestedItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginRight: 15,
        width: 140,
        alignItems: 'center',
    },
    suggestedItemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    suggestedItemPrice: {
        fontSize: 14,
        color: '#FF5722',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    addSuggestedButton: {
        backgroundColor: '#FF5722',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    addSuggestedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    checkoutButton: {
        backgroundColor: '#FF5722',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});