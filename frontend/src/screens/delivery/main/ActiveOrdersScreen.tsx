import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Dimensions, Image, Animated, PanResponder, Easing, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryStackParamList, DeliveryTabParamList } from '../../../types/navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeliveryOrders } from '../../../hooks/useDeliveryOrders';

const { width } = Dimensions.get('window');

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<DeliveryTabParamList, 'ActiveOrders'>,
    NativeStackNavigationProp<DeliveryStackParamList>
>;

// Swipeable Slider Component
interface SwipeToConfirmProps {
    onConfirm: () => Promise<void>;
    status: string;
    buttonText: string;
    buttonColor: string;
    icon: string;
}

const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({ onConfirm, status, buttonText, buttonColor, icon }) => {
    const sliderWidth = width - 64; // Account for card padding
    const buttonSize = 56;
    const maxSlide = sliderWidth - buttonSize - 8;

    const [isCompleting, setIsCompleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const pan = useRef(new Animated.Value(0)).current;
    const backgroundOpacity = useRef(new Animated.Value(1)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;
    const iconScale = useRef(new Animated.Value(1)).current;
    const loadingRotation = useRef(new Animated.Value(0)).current;
    const successScale = useRef(new Animated.Value(1)).current; // Start at 1 to show icon

    // Spinning animation for loader
    const startLoadingAnimation = () => {
        loadingRotation.setValue(0);
        Animated.loop(
            Animated.timing(loadingRotation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.linear,
            })
        ).start();
    };

    // Success animation
    const showSuccessAnimation = () => {
        Animated.sequence([
            Animated.spring(successScale, {
                toValue: 1.2,
                useNativeDriver: true,
                tension: 100,
                friction: 5,
            }),
            Animated.spring(successScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 5,
            }),
        ]).start();
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !isCompleting && !isLoading,
            onMoveShouldSetPanResponder: () => !isCompleting && !isLoading,
            onPanResponderGrant: () => {
                // Scale up icon on press with haptic-like feedback
                Animated.spring(iconScale, {
                    toValue: 1.15,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 5,
                }).start();
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx >= 0 && gestureState.dx <= maxSlide) {
                    pan.setValue(gestureState.dx);
                    // Smooth fade out text
                    const newTextOpacity = Math.max(0, 1 - (gestureState.dx / (maxSlide * 0.5)));
                    textOpacity.setValue(newTextOpacity);
                    // Progressive background fade
                    const newOpacity = Math.min(1, 0.3 + (gestureState.dx / maxSlide) * 0.7);
                    backgroundOpacity.setValue(newOpacity);
                }
            },
            onPanResponderRelease: async (_, gestureState) => {
                const threshold = 0.6; // Lower threshold for easier completion
                const velocity = gestureState.vx;

                // Check if swipe is complete based on distance OR velocity
                if (gestureState.dx > maxSlide * threshold || velocity > 0.5) {
                    setIsCompleting(true);
                    // Complete the slide smoothly
                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: maxSlide,
                            duration: 250,
                            useNativeDriver: true,
                            easing: Easing.out(Easing.cubic),
                        }),
                        Animated.timing(textOpacity, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(backgroundOpacity, {
                            toValue: 1,
                            duration: 250,
                            useNativeDriver: true,
                        }),
                        Animated.spring(iconScale, {
                            toValue: 1.4,
                            useNativeDriver: true,
                            tension: 80,
                            friction: 5,
                        })
                    ]).start(async () => {
                        // Show loading state
                        setIsLoading(true);
                        startLoadingAnimation();

                        try {
                            // Call the async function (will handle backend call)
                            await onConfirm();

                            // Show success animation
                            setIsLoading(false);
                            showSuccessAnimation();

                            // Wait a bit to show success, then fade out
                            setTimeout(() => {
                                Animated.parallel([
                                    Animated.timing(pan, {
                                        toValue: 0,
                                        duration: 400,
                                        useNativeDriver: true,
                                        easing: Easing.inOut(Easing.ease),
                                    }),
                                    Animated.timing(textOpacity, {
                                        toValue: 1,
                                        duration: 400,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(backgroundOpacity, {
                                        toValue: 1,
                                        duration: 400,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(iconScale, {
                                        toValue: 1,
                                        duration: 400,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(successScale, {
                                        toValue: 1,
                                        duration: 300,
                                        useNativeDriver: true,
                                    }),
                                ]).start(() => {
                                    setIsCompleting(false);
                                });
                            }, 600);
                        } catch (error) {
                            // Handle error - snap back
                            setIsLoading(false);
                            Animated.parallel([
                                Animated.spring(pan, {
                                    toValue: 0,
                                    useNativeDriver: true,
                                    tension: 70,
                                    friction: 8,
                                }),
                                Animated.spring(textOpacity, {
                                    toValue: 1,
                                    useNativeDriver: true,
                                }),
                                Animated.spring(backgroundOpacity, {
                                    toValue: 1,
                                    useNativeDriver: true,
                                }),
                                Animated.spring(iconScale, {
                                    toValue: 1,
                                    useNativeDriver: true,
                                }),
                            ]).start(() => {
                                setIsCompleting(false);
                            });
                        }
                    });
                } else {
                    // Smooth snap back with spring physics
                    Animated.parallel([
                        Animated.spring(pan, {
                            toValue: 0,
                            useNativeDriver: true,
                            tension: 70,
                            friction: 8,
                            velocity: -velocity,
                        }),
                        Animated.spring(textOpacity, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 70,
                            friction: 8,
                        }),
                        Animated.spring(backgroundOpacity, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 70,
                            friction: 8,
                        }),
                        Animated.spring(iconScale, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 70,
                            friction: 8,
                        })
                    ]).start();
                }
            },
        })
    ).current;

    const spin = loadingRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.sliderContainer}>
            <Animated.View style={[styles.sliderTrack, { backgroundColor: buttonColor + '20', opacity: backgroundOpacity }]}>
                <Animated.View style={[styles.sliderTextContainer, { opacity: textOpacity }]}>
                    <MaterialIcons name="chevron-right" size={20} color={buttonColor} style={styles.chevronIcon} />
                    <Text style={[styles.sliderText, { color: buttonColor }]} numberOfLines={1}>
                        {buttonText}
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color={buttonColor} style={styles.chevronIcon} />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.sliderButton,
                        {
                            backgroundColor: buttonColor,
                            transform: [{ translateX: pan }, { scale: iconScale }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Animated.View style={{ transform: [{ scale: successScale }] }}>
                            <MaterialIcons name={icon as any} size={26} color="#fff" />
                        </Animated.View>
                    )}
                </Animated.View>
            </Animated.View>
        </View>
    );
};

export default function ActiveOrdersScreen() {
    const navigation = useNavigation<NavigationProp>();

    // Use custom hook for orders management
    const {
        orders,
        loading,
        error,
        refreshing,
        onRefresh,
        updateOrderStatus,
        removeOrder,
    } = useDeliveryOrders();

    // 🔄 Refresh orders when screen comes into focus (e.g., returning from PaymentCollectionScreen)
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 [FOCUS] ActiveOrdersScreen focused - Refreshing orders');
            onRefresh();
        }, [onRefresh])
    );

    const handlePickup = async (orderId: string) => {
        try {
            console.log('📦 [PICKUP] Marking order as picked up:', orderId);

            // Update status to out_for_delivery
            await updateOrderStatus(orderId, 'out_for_delivery');
        } catch (error: any) {
            console.error('❌ [PICKUP] Error:', error.message);
            Alert.alert('Error', 'Failed to update pickup status. Please try again.');
        }
    };

    const handleDelivery = async (orderId: string) => {
        try {
            console.log('✅ [DELIVERY] Processing delivery completion:', orderId);

            const order = orders.find(o => o._id === orderId);

            // Check if this is COD and payment not yet collected
            if (order?.paymentMethod === 'cod' && order.paymentStatus !== 'completed') {
                // COD: Navigate to payment collection screen
                console.log('💰 [DELIVERY] COD order - Navigating to payment collection');
                navigation.navigate('PaymentCollection', {
                    orderId: order._id,
                    orderNumber: order.id,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    totalAmount: order.totalAmount,
                    orderItems: order.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    deliveryAddress: order.deliveryAddress,
                });
            } else {
                // Either online payment OR COD payment already collected - Mark as delivered
                console.log('✅ [DELIVERY] Marking order as delivered');
                await updateOrderStatus(orderId, 'delivered');

                // Remove from list after 3 seconds
                setTimeout(() => {
                    removeOrder(orderId);
                }, 3000);
            }
        } catch (error: any) {
            console.error('❌ [DELIVERY] Error:', error.message);
            Alert.alert('Error', 'Failed to update delivery status. Please try again.');
        }
    };

    // Auto-remove online payment orders after delivery
    useEffect(() => {
        const deliveredOnlineOrders = orders.filter(
            order => order.status === 'delivered' && order.paymentMethod === 'online'
        );

        if (deliveredOnlineOrders.length > 0) {
            const timers = deliveredOnlineOrders.map(order => {
                return setTimeout(() => {
                    removeOrder(order._id);
                }, 5000);
            });

            return () => {
                timers.forEach(timer => clearTimeout(timer));
            };
        }
    }, [orders, removeOrder]);

    // Get color based on order status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'assigned':
                return '#2196F3'; // Blue for assigned (needs pickup)
            case 'out_for_delivery':
                return '#0C7C59'; // Green for delivery (in transit)
            case 'awaiting_payment':
                return '#FF9800'; // Orange for COD collection
            case 'delivered':
                return '#4CAF50'; // Green for completed
            default:
                return '#0C7C59';
        }
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

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#cb202d']}
                        tintColor="#cb202d"
                    />
                }
            >
                {/* Advertisement Banner */}
                <View style={styles.advertisementBanner}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1659353740953-c93814e4a2a5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                        style={styles.advertisementImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Loading State */}
                {loading && orders.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#cb202d" />
                        <Text style={styles.loadingText}>Loading your orders...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={64} color="#F44336" />
                        <Text style={styles.errorTitle}>Failed to Load Orders</Text>
                        <Text style={styles.errorMessage}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => onRefresh()}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : orders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="delivery-dining" size={64} color="#E0E0E0" />
                        <Text style={styles.emptyStateTitle}>No Active Orders</Text>
                        <Text style={styles.emptyStateMessage}>
                            You don't have any active deliveries right now.
                        </Text>
                    </View>
                ) : (
                    orders.map((order, index) => (
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
                                    <View style={styles.customerNameRow}>
                                        <Text style={styles.customerName}>{order.customerName}</Text>
                                        <View style={[
                                            styles.paymentBadge,
                                            { backgroundColor: order.paymentMethod === 'cod' ? '#FFF3E0' : '#E8F5E9' }
                                        ]}>
                                            <MaterialIcons
                                                name={order.paymentMethod === 'cod' ? 'money' : 'check-circle'}
                                                size={12}
                                                color={order.paymentMethod === 'cod' ? '#FF9800' : '#4CAF50'}
                                            />
                                            <Text style={[
                                                styles.paymentBadgeText,
                                                { color: order.paymentMethod === 'cod' ? '#FF9800' : '#4CAF50' }
                                            ]}>
                                                {order.paymentMethod === 'cod' ? 'COD' : 'Paid'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.orderNumber}>{order.id}</Text>
                                </View>
                            </View>

                            {/* Order Status Section */}
                            <View style={styles.statusSection}>
                                <View style={styles.divider} />
                                <View style={styles.statusRow}>
                                    <View style={styles.statusBadge}>
                                        <View style={styles.statusDot} />
                                        <Text style={styles.statusText}>
                                            {order.status === 'out_for_delivery' ? 'On the way to customer' : 'Assigned - Ready for pickup'}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderTime}>{new Date(order.orderTime).toLocaleTimeString()}</Text>
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
                                        const quantity = item.quantity;
                                        const itemName = item.name;
                                        const itemPrice = item.price;
                                        const totalItemPrice = quantity * itemPrice;

                                        return (
                                            <View key={itemIndex} style={styles.summaryItem}>
                                                <Text style={styles.itemQuantityName}>
                                                    {quantity} × {itemName}
                                                </Text>
                                                <Text style={styles.itemPrice}>₹{totalItemPrice.toFixed(2)}</Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                <View style={styles.summaryDivider} />

                                {/* Pricing Breakdown */}
                                <View style={styles.pricingBreakdown}>
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>Subtotal</Text>
                                        <Text style={styles.breakdownValue}>₹{order.subtotal?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>Tax</Text>
                                        <Text style={styles.breakdownValue}>₹{order.tax?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>Delivery Fee</Text>
                                        <Text style={styles.breakdownValue}>₹{order.deliveryFee?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                    {order.discount > 0 && (
                                        <View style={styles.breakdownRow}>
                                            <Text style={[styles.breakdownLabel, styles.discountText]}>Discount</Text>
                                            <Text style={[styles.breakdownValue, styles.discountText]}>-₹{order.discount?.toFixed(2)}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.summaryDivider} />
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalAmount}>{order.total}</Text>
                                </View>
                            </View>

                            {/* Swipe Slider */}
                            <View style={styles.actionsSection}>
                                {order.status === 'assigned' ? (
                                    <SwipeToConfirm
                                        key={`${order.id}-${order.status}`}
                                        onConfirm={() => handlePickup(order._id)}
                                        status={order.status}
                                        buttonText="Slide to Pickup"
                                        buttonColor={getStatusColor(order.status)}
                                        icon="arrow-forward"
                                    />
                                ) : order.status === 'out_for_delivery' ? (
                                    <SwipeToConfirm
                                        key={`${order.id}-${order.status}-${order.paymentStatus}`}
                                        onConfirm={() => handleDelivery(order._id)}
                                        status={order.status}
                                        buttonText={
                                            order.paymentMethod === 'cod' && order.paymentStatus !== 'completed'
                                                ? 'Slide to Collect Payment'
                                                : 'Slide to Complete'
                                        }
                                        buttonColor={getStatusColor(order.status)}
                                        icon={
                                            order.paymentMethod === 'cod' && order.paymentStatus !== 'completed'
                                                ? 'money'
                                                : 'check'
                                        }
                                    />
                                ) : order.status === 'awaiting_payment' ? (
                                    <View style={styles.paymentCollectionContainer}>
                                        <View style={styles.codAlertBanner}>
                                            <MaterialIcons name="money" size={24} color="#FF9800" />
                                            <View style={styles.codAlertContent}>
                                                <Text style={styles.codAlertTitle}>Cash on Delivery</Text>
                                                <Text style={styles.codAlertSubtitle}>Collect payment from customer</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.collectPaymentButton}
                                            onPress={async () => {
                                                try {
                                                    await updateOrderStatus(order._id, 'delivered');
                                                    Alert.alert('Success', 'Payment collected successfully!');
                                                    setTimeout(() => {
                                                        removeOrder(order._id);
                                                    }, 3000);
                                                } catch (error) {
                                                    Alert.alert('Error', 'Failed to confirm payment collection');
                                                }
                                            }}
                                        >
                                            <MaterialIcons name="payment" size={20} color="#fff" />
                                            <Text style={styles.collectPaymentButtonText}>Collect Cash {order.total}</Text>
                                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
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
    customerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        lineHeight: 20,
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    paymentBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
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

    // Action Buttons (kept for reference but now using slider)
    actionsSection: {
        marginTop: 12,
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
    pricingBreakdown: {
        gap: 8,
        marginBottom: 4,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    breakdownLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    breakdownValue: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    discountText: {
        color: '#4CAF50',
        fontWeight: '600',
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

    // Loading State
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

    // Error State
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F44336',
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#cb202d',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    // Empty State
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

    // Swipe Slider Styles
    sliderContainer: {
        width: '100%',
        marginTop: 4,
    },
    sliderTrack: {
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#0C7C59' + '30',
    },
    sliderTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 60,
    },
    sliderText: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    chevronIcon: {
        opacity: 0.5,
    },
    sliderButton: {
        position: 'absolute',
        left: 4,
        width: 52,
        height: 52,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
    },

    // Payment Collection Styles
    paymentCollectionContainer: {
        gap: 12,
    },
    codAlertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE0B2',
        gap: 12,
    },
    codAlertContent: {
        flex: 1,
    },
    codAlertTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    codAlertSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    collectPaymentButton: {
        backgroundColor: '#FF9800',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
    },
    collectPaymentButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },

    bottomSpacing: {
        height: 20,
    },
});