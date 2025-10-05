import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

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
    const navigation = useNavigation();
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
            <StatusBar style="dark" backgroundColor="#fff" />

            {/* Clean Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Cart</Text>
                        <Text style={styles.itemCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {cartItems.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <MaterialIcons name="shopping-cart" size={80} color="#ddd" />
                        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyCartSubtext}>Add some delicious items to get started!</Text>
                        <TouchableOpacity style={styles.browseMenuButton}>
                            <Text style={styles.browseMenuText}>Browse Menu</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <View style={styles.cartItemsContainer}>
                            {cartItems.map((item) => (
                                <View key={item.id} style={styles.cartItem}>
                                    <View style={styles.itemImage}>
                                        <MaterialIcons name="fastfood" size={28} color="#FF6B35" />
                                    </View>

                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={styles.itemMeta}>
                                            {item.size && (
                                                <View style={styles.sizeTag}>
                                                    <Text style={styles.sizeText}>{item.size}</Text>
                                                </View>
                                            )}
                                            {item.customizations && item.customizations.length > 0 && (
                                                <Text style={styles.itemCustomizations}>
                                                    {item.customizations.join(', ')}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={styles.itemFooter}>
                                            <Text style={styles.itemPrice}>₹{(item.price * 82).toFixed(0)}</Text>
                                            <View style={styles.quantityControls}>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <MaterialIcons name="remove" size={16} color="#FF6B35" />
                                                </TouchableOpacity>
                                                <Text style={styles.quantity}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <MaterialIcons name="add" size={16} color="#FF6B35" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.promoSection}>
                            <View style={styles.promoHeader}>
                                <MaterialIcons name="local-offer" size={20} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Apply Coupon</Text>
                            </View>
                            {appliedPromo ? (
                                <View style={styles.appliedPromo}>
                                    <View style={styles.appliedPromoContent}>
                                        <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                                        <Text style={styles.appliedPromoText}>
                                            {appliedPromo.code} applied
                                        </Text>
                                        <Text style={styles.appliedPromoSavings}>
                                            You saved ₹{(appliedPromo.discount * 82).toFixed(0)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={removePromo} style={styles.removeButton}>
                                        <MaterialIcons name="close" size={16} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.promoInput}>
                                    <View style={styles.promoInputWrapper}>
                                        <MaterialIcons name="local-offer" size={16} color="#999" />
                                        <TextInput
                                            style={styles.promoCodeInput}
                                            value={promoCode}
                                            onChangeText={setPromoCode}
                                            placeholder="Enter coupon code"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.applyButton, promoCode.trim() ? styles.applyButtonActive : styles.applyButtonInactive]}
                                        onPress={applyPromoCode}
                                        disabled={!promoCode.trim()}
                                    >
                                        <Text style={[styles.applyButtonText, promoCode.trim() ? styles.applyButtonTextActive : styles.applyButtonTextInactive]}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.orderSummary}>
                            <View style={styles.summaryHeader}>
                                <MaterialIcons name="receipt" size={20} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Bill Details</Text>
                            </View>

                            <View style={styles.summaryContent}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Item total</Text>
                                    <Text style={styles.summaryValue}>₹{(subtotal * 82).toFixed(0)}</Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryLabelWithIcon}>
                                        <Text style={styles.summaryLabel}>Delivery fee</Text>
                                        <MaterialIcons name="info-outline" size={14} color="#999" />
                                    </View>
                                    <Text style={styles.summaryValue}>₹{(deliveryFee * 82).toFixed(0)}</Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Taxes and charges</Text>
                                    <Text style={styles.summaryValue}>₹{(tax * 82).toFixed(0)}</Text>
                                </View>

                                {appliedPromo && (
                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, styles.discountLabel]}>
                                            Coupon discount ({appliedPromo.code})
                                        </Text>
                                        <Text style={[styles.summaryValue, styles.discountValue]}>
                                            -₹{(appliedPromo.discount * 82).toFixed(0)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.divider} />

                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Grand Total</Text>
                                    <Text style={styles.totalValue}>₹{(total * 82).toFixed(0)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.suggestedItems}>
                            <View style={styles.suggestedHeader}>
                                <MaterialIcons name="recommend" size={20} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Add more items</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedScrollContainer}>
                                {[
                                    { name: 'Buffalo Wings', price: 8.99, icon: 'restaurant' },
                                    { name: 'Caesar Salad', price: 6.99, icon: 'eco' },
                                    { name: 'Chocolate Cake', price: 4.99, icon: 'cake' },
                                ].map((item, index) => (
                                    <TouchableOpacity key={index} style={styles.suggestedItem}>
                                        <View style={styles.suggestedItemImage}>
                                            <MaterialIcons name={item.icon as any} size={24} color="#FF6B35" />
                                        </View>
                                        <Text style={styles.suggestedItemName}>{item.name}</Text>
                                        <View style={styles.suggestedItemFooter}>
                                            <Text style={styles.suggestedItemPrice}>₹{(item.price * 82).toFixed(0)}</Text>
                                            <View style={styles.addSuggestedButton}>
                                                <Text style={styles.addSuggestedText}>ADD</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </ScrollView>

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <View style={styles.totalSection}>
                            <Text style={styles.footerTotalLabel}>Total</Text>
                            <Text style={styles.footerTotalValue}>₹{(total * 82).toFixed(0)}</Text>
                        </View>
                        <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
                            <Text style={styles.checkoutButtonText}>Place Order</Text>
                            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        textAlign: 'center',
    },
    itemCount: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingTop: 12,
    },
    emptyCart: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyCartTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
        marginBottom: 8,
    },
    emptyCartSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    browseMenuButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    browseMenuText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    cartItemsContainer: {
        backgroundColor: '#fff',
        marginTop: 8,
    },
    cartItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemImage: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    sizeTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    sizeText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    itemCustomizations: {
        fontSize: 12,
        color: '#999',
        flex: 1,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 6,
        paddingHorizontal: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantity: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 12,
        color: '#2d2d2d',
        minWidth: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginLeft: 8,
    },
    promoSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    promoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    appliedPromo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    appliedPromoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appliedPromoText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginLeft: 6,
        marginRight: 8,
    },
    appliedPromoSavings: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    removeButton: {
        padding: 4,
    },
    promoInput: {
        flexDirection: 'row',
        gap: 8,
    },
    promoInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    promoCodeInput: {
        flex: 1,
        fontSize: 14,
        marginLeft: 8,
        color: '#2d2d2d',
    },
    applyButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        borderWidth: 1,
    },
    applyButtonActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    applyButtonInactive: {
        backgroundColor: '#f8f8f8',
        borderColor: '#e0e0e0',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    applyButtonTextActive: {
        color: '#fff',
    },
    applyButtonTextInactive: {
        color: '#999',
    },
    orderSummary: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryContent: {
        gap: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabelWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    discountLabel: {
        color: '#4CAF50',
    },
    discountValue: {
        color: '#4CAF50',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
    },
    totalRow: {
        paddingVertical: 8,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    totalValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    suggestedItems: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 100,
        borderRadius: 8,
        paddingVertical: 16,
    },
    suggestedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    suggestedScrollContainer: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    suggestedItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        width: 120,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    suggestedItemImage: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF3E0',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 8,
    },
    suggestedItemName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 16,
    },
    suggestedItemFooter: {
        alignItems: 'center',
    },
    suggestedItemPrice: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
        marginBottom: 8,
    },
    addSuggestedButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    addSuggestedText: {
        color: '#FF6B35',
        fontSize: 11,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: 34, // Safe area padding
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    totalSection: {
        alignItems: 'flex-start',
    },
    footerTotalLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    checkoutButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});