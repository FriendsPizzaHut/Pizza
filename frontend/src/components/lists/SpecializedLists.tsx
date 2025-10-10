/**
 * Specialized List Components for Pizza App
 * 
 * High-performance, domain-specific list components
 * optimized for menu items, orders, and real-time updates
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { UltraOptimizedList, VirtualizedGridList, MemoryOptimizedList } from '../common/UltraOptimizedList';
import { MenuItem, Order, OrderItem } from '../../stores/appStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with margins

// Menu Item Card Component with optimized rendering
const MenuItemCard = memo<{
    item: MenuItem;
    index: number;
    onPress: (item: MenuItem) => void;
    isVisible?: boolean;
}>(({ item, index, onPress, isVisible = true }) => {
    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    const animationDelay = index * 50; // Stagger animations

    return (
        <Animated.View
            entering={FadeIn.delay(animationDelay).duration(300)}
            style={[styles.menuCard, { opacity: isVisible ? 1 : 0.7 }]}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                style={styles.menuCardTouchable}
            >
                {/* Optimized Image Loading */}
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.menuImage}
                            resizeMode="cover"
                            // Optimizations for better performance
                            fadeDuration={0}
                            onLoadStart={() => {/* Track loading start */ }}
                            onLoadEnd={() => {/* Track loading end */ }}
                        />
                    ) : (
                        <View style={[styles.menuImage, styles.placeholderImage]}>
                            <Text style={styles.placeholderText}>🍕</Text>
                        </View>
                    )}

                    {/* Availability Status */}
                    {!item.available && (
                        <View style={styles.unavailableBadge}>
                            <Text style={styles.unavailableText}>Out of Stock</Text>
                        </View>
                    )}
                </View>

                {/* Item Details */}
                <View style={styles.menuDetails}>
                    <Text style={styles.menuName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.menuDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View style={styles.menuFooter}>
                        <Text style={styles.menuPrice}>₹{item.price}</Text>
                        <Text style={styles.menuTime}>{item.preparationTime}min</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Order Card Component for order lists
const OrderCard = memo<{
    item: Order;
    index: number;
    onPress: (order: Order) => void;
    isVisible?: boolean;
}>(({ item, index, onPress, isVisible = true }) => {
    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    const statusColor = useMemo(() => {
        switch (item.status) {
            case 'pending': return '#FFA500';
            case 'confirmed': return '#4CAF50';
            case 'preparing': return '#2196F3';
            case 'out_for_delivery': return '#9C27B0';
            case 'delivered': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return '#757575';
        }
    }, [item.status]);

    const itemCount = item.items.reduce((total, orderItem) => total + orderItem.quantity, 0);

    return (
        <Animated.View
            entering={SlideInRight.delay(index * 100).duration(400)}
            style={[styles.orderCard, { opacity: isVisible ? 1 : 0.8 }]}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                style={styles.orderCardTouchable}
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
                    </View>
                </View>

                <View style={styles.orderContent}>
                    <Text style={styles.orderItems}>
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.orderTotal}>₹{item.total}</Text>
                </View>

                <Text style={styles.orderDate}>
                    {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

// Cart Item Component for cart list
const CartItemCard = memo<{
    item: OrderItem;
    index: number;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
    isVisible?: boolean;
}>(({ item, index, onUpdateQuantity, onRemove, isVisible = true }) => {
    const handleIncrease = useCallback(() => {
        onUpdateQuantity(item.id, item.quantity + 1);
    }, [item.id, item.quantity, onUpdateQuantity]);

    const handleDecrease = useCallback(() => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.id, item.quantity - 1);
        } else {
            onRemove(item.id);
        }
    }, [item.id, item.quantity, onUpdateQuantity, onRemove]);

    return (
        <Animated.View
            entering={FadeIn.delay(index * 80).duration(250)}
            style={[styles.cartCard, { opacity: isVisible ? 1 : 0.7 }]}
        >
            <View style={styles.cartContent}>
                {/* Item Image */}
                <View style={styles.cartImageContainer}>
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.cartImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.cartImage, styles.placeholderImage]}>
                            <Text style={styles.cartPlaceholderText}>🍕</Text>
                        </View>
                    )}
                </View>

                {/* Item Details */}
                <View style={styles.cartDetails}>
                    <Text style={styles.cartItemName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        onPress={handleDecrease}
                        style={styles.quantityButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                        onPress={handleIncrease}
                        style={styles.quantityButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
});

// Menu List Component
export const MenuList = memo<{
    items: MenuItem[];
    onItemPress: (item: MenuItem) => void;
    isRefreshing?: boolean;
    onRefresh?: () => void;
}>(({ items, onItemPress, isRefreshing, onRefresh }) => {
    const renderMenuItem = useCallback((item: MenuItem, index: number, isVisible?: boolean) => (
        <MenuItemCard
            item={item}
            index={index}
            onPress={onItemPress}
            isVisible={isVisible}
        />
    ), [onItemPress]);

    return (
        <VirtualizedGridList
            data={items}
            renderItem={renderMenuItem}
            keyExtractor={(item, index) => String(item.id)}
            numColumns={2}
            itemHeight={280}
            performanceMode="speed"
            enableAnimations={true}
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            emptyMessage="No menu items available"
            emptyIcon="🍽️"
            contentContainerStyle={styles.menuListContainer}
        />
    );
});

// Orders List Component
export const OrdersList = memo<{
    orders: Order[];
    onOrderPress: (order: Order) => void;
    isRefreshing?: boolean;
    onRefresh?: () => void;
}>(({ orders, onOrderPress, isRefreshing, onRefresh }) => {
    const renderOrder = useCallback((order: Order, index: number, isVisible?: boolean) => (
        <OrderCard
            item={order}
            index={index}
            onPress={onOrderPress}
            isVisible={isVisible}
        />
    ), [onOrderPress]);

    return (
        <MemoryOptimizedList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(order, index) => String(order.id)}
            itemHeight={120}
            performanceMode="balanced"
            enableAnimations={true}
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            emptyMessage="No orders found"
            emptyIcon="📦"
            contentContainerStyle={styles.ordersListContainer}
        />
    );
});

// Cart List Component
export const CartList = memo<{
    items: OrderItem[];
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
}>(({ items, onUpdateQuantity, onRemoveItem }) => {
    const renderCartItem = useCallback((item: OrderItem, index: number, isVisible?: boolean) => (
        <CartItemCard
            item={item}
            index={index}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
            isVisible={isVisible}
        />
    ), [onUpdateQuantity, onRemoveItem]);

    return (
        <UltraOptimizedList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            itemHeight={100}
            performanceMode="speed"
            enableAnimations={true}
            emptyMessage="Your cart is empty"
            emptyIcon="🛒"
            contentContainerStyle={styles.cartListContainer}
        />
    );
});

const styles = StyleSheet.create({
    // Menu Card Styles
    menuCard: {
        width: ITEM_WIDTH,
        marginHorizontal: 8,
        marginVertical: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuCardTouchable: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    menuImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#F5F5F5',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
    },
    unavailableBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    unavailableText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    menuDetails: {
        padding: 12,
    },
    menuName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 12,
        color: '#666666',
        lineHeight: 16,
        marginBottom: 8,
    },
    menuFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF6347',
    },
    menuTime: {
        fontSize: 12,
        color: '#999999',
    },

    // Order Card Styles
    orderCard: {
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    orderCardTouchable: {
        padding: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    orderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderItems: {
        fontSize: 14,
        color: '#666666',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
    },
    orderDate: {
        fontSize: 12,
        color: '#999999',
    },

    // Cart Card Styles
    cartCard: {
        marginHorizontal: 16,
        marginVertical: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 1,
        elevation: 1,
    },
    cartContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    cartImageContainer: {
        marginRight: 12,
    },
    cartImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    cartPlaceholderText: {
        fontSize: 24,
    },
    cartDetails: {
        flex: 1,
        marginRight: 12,
    },
    cartItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 4,
    },
    cartItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6347',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    quantityText: {
        marginHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        minWidth: 24,
        textAlign: 'center',
    },

    // Container Styles
    menuListContainer: {
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    ordersListContainer: {
        paddingVertical: 8,
    },
    cartListContainer: {
        paddingVertical: 8,
    },
});

export default { MenuList, OrdersList, CartList };