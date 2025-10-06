import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    customizations?: string[];
    image?: string;
    isVeg?: boolean;
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
            customizations: ['Extra Cheese'],
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
            isVeg: true,
        },
        {
            id: '2',
            name: 'Pepperoni Pizza',
            price: 14.99,
            quantity: 1,
            size: 'Medium',
            customizations: ['Extra Pepperoni'],
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
            isVeg: false,
        },
        {
            id: '3',
            name: 'Veggie Supreme',
            price: 11.99,
            quantity: 1,
            size: 'Large',
            customizations: ['Fresh Basil'],
            image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400',
            isVeg: true,
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
                                    {/* Item Image */}
                                    <View style={styles.itemImageContainer}>
                                        <Image
                                            source={{ uri: item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' }}
                                            style={styles.itemImage}
                                        />
                                        {/* Veg/Non-veg Badge */}
                                        {item.isVeg !== undefined && (
                                            <View style={styles.vegBadgeSmall}>
                                                <View style={[styles.vegIndicatorSmall, !item.isVeg && styles.nonVegIndicatorSmall]} />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.itemDetails}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => updateQuantity(item.id, 0)}
                                            >
                                                <MaterialIcons name="delete-outline" size={18} color="#999" />
                                            </TouchableOpacity>
                                        </View>

                                        {item.size && (
                                            <Text style={styles.itemSize}>{item.size}</Text>
                                        )}

                                        {item.customizations && item.customizations.length > 0 && (
                                            <Text style={styles.itemCustomizations} numberOfLines={1}>
                                                {item.customizations.join(', ')}
                                            </Text>
                                        )}

                                        <View style={styles.itemFooter}>
                                            <Text style={styles.itemPrice}>₹{(item.price * item.quantity * 83).toFixed(0)}</Text>
                                            <View style={styles.quantityControls}>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <MaterialIcons name="remove" size={18} color="#0C7C59" />
                                                </TouchableOpacity>
                                                <Text style={styles.quantity}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <MaterialIcons name="add" size={18} color="#0C7C59" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.promoSection}>
                            <View style={styles.promoHeader}>
                                <MaterialIcons name="local-offer" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Apply Coupon</Text>
                            </View>
                            {appliedPromo ? (
                                <View style={styles.appliedPromo}>
                                    <View style={styles.appliedPromoContent}>
                                        <MaterialIcons name="check-circle" size={16} color="#0C7C59" />
                                        <Text style={styles.appliedPromoText}>
                                            {appliedPromo.code} applied
                                        </Text>
                                        <Text style={styles.appliedPromoSavings}>
                                            You saved ₹{(appliedPromo.discount * 83).toFixed(0)}
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
                                <MaterialIcons name="receipt" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Bill Details</Text>
                            </View>

                            <View style={styles.summaryContent}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Item total</Text>
                                    <Text style={styles.summaryValue}>₹{(subtotal * 83).toFixed(0)}</Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryLabelWithIcon}>
                                        <Text style={styles.summaryLabel}>Delivery fee</Text>
                                        <MaterialIcons name="info-outline" size={14} color="#999" />
                                    </View>
                                    <Text style={styles.summaryValue}>₹{(deliveryFee * 83).toFixed(0)}</Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Taxes and charges</Text>
                                    <Text style={styles.summaryValue}>₹{(tax * 83).toFixed(0)}</Text>
                                </View>

                                {appliedPromo && (
                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, styles.discountLabel]}>
                                            Coupon discount ({appliedPromo.code})
                                        </Text>
                                        <Text style={[styles.summaryValue, styles.discountValue]}>
                                            -₹{(appliedPromo.discount * 83).toFixed(0)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.divider} />

                                <LinearGradient
                                    colors={['#E3F2FD', '#BBDEFB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.totalRow}
                                >
                                    <View style={styles.totalRowContent}>
                                        <Text style={styles.totalLabel}>Grand Total</Text>
                                        <Text style={styles.totalValue}>₹{(total * 83).toFixed(0)}</Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>

                        <View style={styles.suggestedItems}>
                            <View style={styles.suggestedHeader}>
                                <MaterialIcons name="recommend" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Add more items</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedScrollContainer}>
                                {[
                                    { name: 'Garlic Bread', price: 5.99, image: 'https://images.unsplash.com/photo-1619326463172-59c1fb84d4a2?w=400', isVeg: true },
                                    { name: 'Chicken Wings', price: 8.99, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', isVeg: false },
                                    { name: 'Caesar Salad', price: 6.99, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', isVeg: true },
                                    { name: 'Chocolate Cake', price: 4.99, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', isVeg: true },
                                ].map((item, index) => (
                                    <TouchableOpacity key={index} style={styles.suggestedItem}>
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.suggestedItemImageNew}
                                        />
                                        {item.isVeg !== undefined && (
                                            <View style={styles.suggestedVegBadge}>
                                                <View style={[styles.vegIndicatorSmall, !item.isVeg && styles.nonVegIndicatorSmall]} />
                                            </View>
                                        )}
                                        <Text style={styles.suggestedItemName}>{item.name}</Text>
                                        <View style={styles.suggestedItemFooter}>
                                            <Text style={styles.suggestedItemPrice}>₹{(item.price * 83).toFixed(0)}</Text>
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
                    <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
                        <View style={styles.checkoutLeft}>
                            <View style={styles.totalInfo}>
                                <Text style={styles.footerTotalLabel}>Total Amount</Text>
                                <Text style={styles.footerTotalValue}>₹{(total * 83).toFixed(0)}</Text>
                            </View>
                        </View>
                        <View style={styles.checkoutRight}>
                            <Text style={styles.checkoutButtonText}>Place Order</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
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
        fontSize: 16,
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
        backgroundColor: '#cb202d',
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
        marginHorizontal: 16,
        marginTop: 16,
    },
    cartItem: {
        flexDirection: 'row',
        padding: 12,
        paddingVertical: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    itemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#f8f8f8',
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    vegBadgeSmall: {
        position: 'absolute',
        top: 6,
        left: 6,
        width: 18,
        height: 18,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#0C7C59',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegIndicatorSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#0C7C59',
    },
    nonVegIndicatorSmall: {
        backgroundColor: '#cb202d',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        flex: 1,
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
    itemSize: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    itemCustomizations: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0C7C59',
        borderRadius: 6,
    },
    quantityButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantity: {
        fontSize: 14,
        fontWeight: '700',
        marginHorizontal: 8,
        color: '#0C7C59',
        minWidth: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginLeft: 8,
    },
    promoSection: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 12,
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
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0C7C59',
    },
    appliedPromoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appliedPromoText: {
        fontSize: 14,
        color: '#0C7C59',
        fontWeight: '600',
        marginLeft: 6,
        marginRight: 8,
    },
    appliedPromoSavings: {
        fontSize: 12,
        color: '#0C7C59',
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
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
    },
    promoCodeInput: {
        flex: 1,
        fontSize: 14,
        marginLeft: 8,
        color: '#2d2d2d',
    },
    applyButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    applyButtonActive: {
        backgroundColor: '#cb202d',
    },
    applyButtonInactive: {
        backgroundColor: '#f0f0f0',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    applyButtonTextActive: {
        color: '#fff',
    },
    applyButtonTextInactive: {
        color: '#999',
    },
    orderSummary: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 12,
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
        fontSize: 13,
        color: '#666',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    discountLabel: {
        color: '#0C7C59',
    },
    discountValue: {
        color: '#0C7C59',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
    },
    totalRow: {
        marginHorizontal: -16,
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    totalRowContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1565C0',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0D47A1',
    },
    suggestedItems: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 100,
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
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 12,
        width: 140,
        overflow: 'hidden',
    },
    suggestedItemImageNew: {
        width: '100%',
        height: 100,
        resizeMode: 'cover',
        backgroundColor: '#f8f8f8',
    },
    suggestedVegBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 18,
        height: 18,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#0C7C59',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestedItemImage: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF5F5',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 8,
    },
    suggestedItemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 8,
        paddingHorizontal: 12,
        lineHeight: 18,
    },
    suggestedItemFooter: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    suggestedItemPrice: {
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '700',
    },
    addSuggestedButton: {
        backgroundColor: '#cb202d',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addSuggestedText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0C7C59',
        borderRadius: 10,
        height: 56,
        overflow: 'hidden',
    },
    checkoutLeft: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255, 255, 255, 0.2)',
    },
    totalInfo: {
        flexDirection: 'column',
    },
    footerTotalLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    checkoutRight: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});