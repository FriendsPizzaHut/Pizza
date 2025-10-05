import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Modal, Dimensions, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryStackParamList, DeliveryTabParamList } from '../../../types/navigation';
import { RootState } from '../../../../redux/store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<DeliveryTabParamList, 'Home'>,
    NativeStackNavigationProp<DeliveryStackParamList>
>;

interface Order {
    id: string;
    restaurant: string;
    restaurantAddress: string;
    customer: string;
    deliveryAddress: string;
    distance: string;
    estimatedEarnings: number;
    estimatedTime: string;
    items: string[];
    total: number;
    preparationTime: string;
}

export default function DeliveryHomeScreen() {
    const { name } = useSelector((state: RootState) => state.auth);
    const navigation = useNavigation<NavigationProp>();

    const [isOnline, setIsOnline] = useState(true);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [acceptTimer, setAcceptTimer] = useState(30);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

    // Mock order assignment
    const mockOrder = {
        id: '#ORD-2024-001',
        restaurant: 'Pizza Palace',
        restaurantAddress: '123 Restaurant St.',
        customer: 'Sarah Johnson',
        deliveryAddress: '456 Oak Avenue, Apt 2B',
        distance: '2.3 km',
        estimatedEarnings: 8.50,
        estimatedTime: '25 mins',
        items: ['Large Margherita Pizza', 'Garlic Bread', 'Coke'],
        total: 28.99,
        preparationTime: '12 mins'
    };

    const todayStats = {
        activeOrders: 2,
        ordersCompleted: 8,
        earnings: 87.50,
        hoursOnline: 4.2,
        acceptance: 95
    };

    // Simulate new order assignment - DISABLED
    // useEffect(() => {
    //     let orderTimeout: NodeJS.Timeout;
    //     if (isOnline) {
    //         orderTimeout = setTimeout(() => {
    //             setCurrentOrder(mockOrder);
    //             setShowOrderModal(true);
    //             startAcceptTimer();
    //         }, 5000); // Show order after 5 seconds when online
    //     }

    //     return () => {
    //         if (orderTimeout) clearTimeout(orderTimeout);
    //     };
    // }, [isOnline]);

    const startAcceptTimer = () => {
        setAcceptTimer(30);
        const timer = setInterval(() => {
            setAcceptTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleRejectOrder();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAcceptOrder = () => {
        setShowOrderModal(false);
        setAcceptTimer(30);
        Alert.alert(
            'Order Accepted!',
            'Navigate to restaurant to pick up the order.',
            [
                {
                    text: 'Navigate Now', onPress: () => {
                        if (currentOrder) {
                            navigation.navigate('Navigation', {
                                orderId: currentOrder.id,
                                address: currentOrder.restaurantAddress
                            });
                        }
                    }
                },
                { text: 'OK' }
            ]
        );
    };

    const handleRejectOrder = () => {
        setShowOrderModal(false);
        setAcceptTimer(30);
        setCurrentOrder(null);
        Alert.alert('Order Rejected', 'Looking for more orders...');
    };

    const toggleOnlineStatus = () => {
        setIsOnline(!isOnline);
        if (!isOnline) {
            Alert.alert('You\'re Online!', 'You will start receiving order requests.');
        } else {
            Alert.alert('You\'re Offline', 'You won\'t receive any order requests.');
            setShowOrderModal(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Modern Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.deliveryLabel}>Delivery Partner</Text>
                            <View style={styles.nameRow}>
                                <Text style={styles.driverName}>{name || 'Driver'}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#4CAF50' : '#FF4444' }]}>
                                    <Text style={styles.statusBadgeText}>
                                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.statusToggleButton}
                            onPress={toggleOnlineStatus}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons
                                name={isOnline ? 'toggle-on' : 'toggle-off'}
                                size={32}
                                color={isOnline ? '#4CAF50' : '#999'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <LinearGradient
                        colors={['#FF6B35', '#F7931E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroContent}>
                            <View style={styles.heroLeft}>
                                <Text style={styles.heroGreeting}>Good morning!</Text>
                                <Text style={styles.heroTitle}>Ready to Deliver?</Text>
                                <Text style={styles.heroSubtitle}>
                                    {isOnline ? 'You\'re online and ready for orders' : 'Go online to start receiving orders'}
                                </Text>

                                <TouchableOpacity
                                    style={styles.ctaButton}
                                    onPress={() => navigation.navigate('ActiveOrders')}
                                >
                                    <Text style={styles.ctaText}>View Orders</Text>
                                    <MaterialIcons name="arrow-forward" size={18} color="#FF6B35" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.heroRight}>
                                <View style={styles.heroIconContainer}>
                                    <Text style={styles.heroEmoji}>🛵</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.heroDecor1} />
                        <View style={styles.heroDecor2} />
                        <Text style={styles.heroBgEmoji}>🚀</Text>
                    </LinearGradient>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation.navigate('ActiveOrders')}
                    >
                        <LinearGradient
                            colors={['#FFF3E0', '#FFE0B2']}
                            style={styles.quickActionGradient}
                        >
                            <Text style={styles.quickActionEmoji}>🚚</Text>
                            <Text style={styles.quickActionText}>Active Orders</Text>
                            <View style={styles.quickActionBadge}>
                                <Text style={styles.badgeText}>2</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation.navigate('PaymentCollection')}
                    >
                        <LinearGradient
                            colors={['#E8F5E9', '#C8E6C9']}
                            style={styles.quickActionGradient}
                        >
                            <Text style={styles.quickActionEmoji}>�</Text>
                            <Text style={styles.quickActionText}>Payments</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard}>
                        <LinearGradient
                            colors={['#E3F2FD', '#BBDEFB']}
                            style={styles.quickActionGradient}
                        >
                            <Text style={styles.quickActionEmoji}>🎧</Text>
                            <Text style={styles.quickActionText}>Support</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard}>
                        <LinearGradient
                            colors={['#FCE4EC', '#F8BBD0']}
                            style={styles.quickActionGradient}
                        >
                            <Text style={styles.quickActionEmoji}>�</Text>
                            <Text style={styles.quickActionText}>Analytics</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    {/* Today's Performance Card */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <View style={styles.sectionTitleWithIcon}>
                                <MaterialIcons name="insights" size={24} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Today's Performance</Text>
                            </View>
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.modernStatItem}>
                                <LinearGradient
                                    colors={['#FFF3E0', '#FFE0B2']}
                                    style={styles.modernStatGradient}
                                >
                                    <View style={styles.statIconContainer}>
                                        <Text style={styles.statEmoji}>🚚</Text>
                                    </View>
                                    <Text style={styles.modernStatNumber}>{todayStats.activeOrders || 2}</Text>
                                    <Text style={styles.modernStatLabel}>Active Orders</Text>
                                </LinearGradient>
                            </View>

                            <View style={styles.modernStatItem}>
                                <LinearGradient
                                    colors={['#E8F5E9', '#C8E6C9']}
                                    style={styles.modernStatGradient}
                                >
                                    <View style={styles.statIconContainer}>
                                        <Text style={styles.statEmoji}>✅</Text>
                                    </View>
                                    <Text style={styles.modernStatNumber}>{todayStats.ordersCompleted}</Text>
                                    <Text style={styles.modernStatLabel}>Orders Delivered</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>

                    {/* Recent Deliveries */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <View style={styles.sectionTitleWithIcon}>
                                <MaterialIcons name="history" size={24} color="#FF6B35" />
                                <Text style={styles.sectionTitle}>Recent Deliveries</Text>
                            </View>
                        </View>

                        {[
                            {
                                orderId: 'ORD-158',
                                items: ['2x Margherita Pizza', '1x Pepperoni Pizza'],
                                deliveredAt: '2:30 PM',
                                location: 'Oak Avenue, Sector 15',
                                rating: 4.8,
                                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400'
                            },
                            {
                                orderId: 'ORD-159',
                                items: ['1x Supreme Pizza', '1x Garlic Bread'],
                                deliveredAt: '2:31 PM',
                                location: 'Oak Avenue, Sector 16',
                                rating: 4.9,
                                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400'
                            },
                            {
                                orderId: 'ORD-160',
                                items: ['1x Vegetarian Supreme'],
                                deliveredAt: '2:32 PM',
                                location: 'Oak Avenue, Sector 17',
                                rating: 5.0,
                                image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?q=80&w=400'
                            }
                        ].map((delivery, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.deliveryOrderCard}
                                activeOpacity={0.8}
                            >
                                {/* Top Section with Image and Order Details */}
                                <View style={styles.deliveryTopSection}>
                                    <Image
                                        source={{ uri: delivery.image }}
                                        style={styles.deliveryItemImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.deliveryItemDetails}>
                                        <Text style={styles.deliveryFirstItemName}>
                                            {delivery.items[0]}
                                        </Text>
                                        <Text style={styles.deliveryOrderNumber}>Order #{delivery.orderId}</Text>
                                    </View>
                                </View>

                                {/* Additional Items (if more than 1) */}
                                {delivery.items.length > 1 && (
                                    <View style={styles.deliveryAdditionalItemsSection}>
                                        <View style={styles.deliveryDivider} />
                                        {delivery.items.slice(1).map((item, itemIndex) => (
                                            <Text key={itemIndex} style={styles.deliveryAdditionalItem}>
                                                {item}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                {/* Bottom Section with Location, Time and Rating */}
                                <View style={styles.deliveryBottomSection}>
                                    <View style={styles.deliveryDivider} />
                                    <View style={styles.deliveryMetaRow}>
                                        <View style={styles.deliveryLocationRow}>
                                            <MaterialIcons name="location-on" size={14} color="#8E8E93" />
                                            <Text style={styles.deliveryLocationText}>
                                                {delivery.location}
                                            </Text>
                                        </View>
                                        <Text style={styles.deliveryTimeText}>
                                            Delivered at {delivery.deliveredAt}
                                        </Text>
                                    </View>
                                    <View style={styles.deliveryStatusRow}>
                                        <View style={styles.deliveryStatusBadge}>
                                            <MaterialIcons name="check-circle" size={14} color="#22A447" />
                                            <Text style={styles.deliveryStatusText}>Delivered</Text>
                                        </View>
                                        <View style={styles.deliveryRatingSection}>
                                            <MaterialIcons name="star" size={16} color="#FFB800" />
                                            <Text style={styles.deliveryRatingText}>{delivery.rating}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {!isOnline && (
                        <View style={styles.offlinePrompt}>
                            <LinearGradient
                                colors={['#FFF3E0', '#FFE0B2']}
                                style={styles.offlineGradient}
                            >
                                <Text style={styles.offlineEmoji}>😴</Text>
                                <Text style={styles.offlineTitle}>You're Offline</Text>
                                <Text style={styles.offlineMessage}>
                                    Turn on your status to start receiving order requests and earn money.
                                </Text>
                                <TouchableOpacity
                                    style={styles.goOnlineButton}
                                    onPress={toggleOnlineStatus}
                                >
                                    <Text style={styles.goOnlineText}>Go Online</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>

            {/* Order Assignment Modal */}
            <Modal
                visible={showOrderModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.orderModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Order Request</Text>
                            <View style={styles.timerContainer}>
                                <Text style={styles.timerText}>{acceptTimer}s</Text>
                            </View>
                        </View>

                        <View style={styles.orderInfo}>
                            <View style={styles.restaurantInfo}>
                                <MaterialIcons name="restaurant" size={20} color="#FF6B35" />
                                <Text style={styles.restaurantName}>{currentOrder?.restaurant}</Text>
                            </View>

                            <View style={styles.orderDetail}>
                                <MaterialIcons name="location-on" size={16} color="#666" />
                                <Text style={styles.detailText}>{currentOrder?.deliveryAddress}</Text>
                            </View>

                            <View style={styles.orderStats}>
                                <View style={styles.orderStatItem}>
                                    <Text style={styles.statValue}>{currentOrder?.distance}</Text>
                                    <Text style={styles.statDesc}>Distance</Text>
                                </View>
                                <View style={styles.orderStatItem}>
                                    <Text style={styles.statValue}>₹{currentOrder?.estimatedEarnings}</Text>
                                    <Text style={styles.statDesc}>You'll earn</Text>
                                </View>
                                <View style={styles.orderStatItem}>
                                    <Text style={styles.statValue}>{currentOrder?.estimatedTime}</Text>
                                    <Text style={styles.statDesc}>Est. time</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={handleRejectOrder}
                            >
                                <Text style={styles.rejectText}>Reject</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={handleAcceptOrder}
                            >
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    scrollContainer: {
        flex: 1,
    },

    // Header
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
    headerLeft: {
        flex: 1,
    },
    deliveryLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    statusToggleButton: {
        padding: 4,
    },

    // Hero Banner
    heroBanner: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6B35',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    heroGradient: {
        paddingHorizontal: 24,
        paddingVertical: 28,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    heroLeft: {
        flex: 1,
        paddingRight: 16,
    },
    heroGreeting: {
        fontSize: 14,
        color: '#FFE5E5',
        fontWeight: '600',
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#FFE5E5',
        marginBottom: 20,
        lineHeight: 20,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignSelf: 'flex-start',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FF6B35',
        marginRight: 6,
    },
    heroRight: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroDecor1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -40,
        right: -30,
    },
    heroDecor2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -20,
        left: -20,
    },

    // Emoji Styles
    heroEmoji: {
        fontSize: 50,
        textAlign: 'center',
    },
    quickActionEmoji: {
        fontSize: 24,
        textAlign: 'center',
    },
    sectionEmoji: {
        fontSize: 24,
    },
    statEmoji: {
        fontSize: 18,
        textAlign: 'center',
    },
    deliveryCardEmoji: {
        fontSize: 14,
        marginRight: 6,
    },
    successEmoji: {
        fontSize: 10,
        marginRight: 2,
    },
    deliveryInfoEmoji: {
        fontSize: 12,
        marginRight: 6,
    },
    ratingEmoji: {
        fontSize: 14,
        marginRight: 4,
    },
    offlineEmoji: {
        fontSize: 48,
        textAlign: 'center',
    },
    heroBgEmoji: {
        position: 'absolute',
        fontSize: 120,
        opacity: 0.1,
        right: -20,
        top: 20,
        color: '#fff',
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    quickActionGradient: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    quickActionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginTop: 8,
    },
    quickActionBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },

    // Main Content
    mainContent: {
        paddingTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
        marginLeft: 8,
    },

    // Modern Stats Card
    modernStatsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    modernStatItem: {
        width: '48%',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    modernStatGradient: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    modernStatNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    modernStatLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },

    // Modern Delivery Cards
    modernDeliveryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    deliveryCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2d2d2d',
        marginLeft: 6,
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    successText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 4,
    },
    deliveryDetails: {
        marginBottom: 12,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    deliveryTime: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
    },
    deliveryLocation: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
        flex: 1,
    },
    deliveryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
    },
    modernEarning: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4CAF50',
    },

    // New Delivery Order Cards (OrdersScreen style)
    deliveryOrderCard: {
        backgroundColor: '#fbfbfbff',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    deliveryTopSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    deliveryItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F0F0F0',
    },
    deliveryItemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    deliveryFirstItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
        lineHeight: 20,
    },
    deliveryOrderNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    deliveryAdditionalItemsSection: {
        marginBottom: 8,
    },
    deliveryDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    deliveryAdditionalItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        lineHeight: 18,
    },
    deliveryBottomSection: {
        marginTop: 4,
    },
    deliveryMetaRow: {
        marginBottom: 8,
    },
    deliveryLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    deliveryLocationText: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
        flex: 1,
    },
    deliveryTimeText: {
        fontSize: 12,
        color: '#8E8E93',
    },
    deliveryStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deliveryStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 30,
    },
    deliveryStatusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#2d2d2d',
        marginLeft: 4,
    },
    deliveryRatingSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryRatingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginLeft: 4,
    },

    // Offline Prompt
    offlinePrompt: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 20,
        overflow: 'hidden',
    },
    offlineGradient: {
        padding: 24,
        alignItems: 'center',
    },
    offlineTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#E65100',
        marginTop: 12,
        marginBottom: 8,
    },
    offlineMessage: {
        fontSize: 14,
        color: '#BF360C',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    goOnlineButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    goOnlineText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },

    // Modal Styles (keeping existing)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    orderModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    timerContainer: {
        backgroundColor: '#FF4444',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    orderInfo: {
        padding: 20,
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginLeft: 8,
    },
    orderDetail: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        flex: 1,
        lineHeight: 18,
    },
    orderStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
    },
    orderStatItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    statDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    modalActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginLeft: 10,
    },
    rejectText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    acceptText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});