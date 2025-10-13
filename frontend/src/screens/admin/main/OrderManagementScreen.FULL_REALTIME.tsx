import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Platform,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import axiosInstance from '../../../api/axiosInstance';
import Constants from 'expo-constants';

// Get socket URL from environment (remove /api/v1 suffix if present)
const SOCKET_URL = __DEV__
    ? (Constants.expoConfig?.extra?.apiUrlDevelopment || 'http://localhost:5000').replace(/\/api\/v1$/, '')
    : (Constants.expoConfig?.extra?.apiUrlProduction || 'https://pizzabackend-u9ui.onrender.com').replace(/\/api\/v1$/, '');

console.log('🔌 Socket URL configured:', SOCKET_URL);

export default function OrderManagementScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // 🔥 NEW: Real-time orders state
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Get user info from Redux
    const { userId, name } = useSelector((state: RootState) => state.auth);

    // 🔥 Fetch initial orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/orders');

            if (response.data.success) {
                setOrders(response.data.data.orders || response.data.data || []);
            }
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 🔥 Pull to refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // 🔥 Load orders on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // 🔥 Socket connection and real-time events
    useEffect(() => {
        if (!userId) {
            console.log('⚠️ No user ID found');
            return;
        }

        // Connect to socket
        console.log('🔌 Connecting to socket:', SOCKET_URL);
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);

            // Register as admin
            socket.emit('register', {
                userId: userId,
                role: 'admin'
            });

            console.log('📍 Registered as admin:', userId);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        socket.on('registered', (data) => {
            console.log('✅ Registration confirmed:', data);
        });

        // 🔥 Listen for new orders
        socket.on('order:new', (data) => {
            console.log('📦 NEW ORDER RECEIVED:', data);

            // Add new order to the top of the list
            setOrders((prevOrders) => [data.order || data, ...prevOrders]);

            // Optional: Show toast notification
            console.log(`🔔 New order: ${data.orderNumber || data.order?.orderNumber}`);
        });

        // 🔥 Listen for order status updates
        socket.on('order:status:changed', (data) => {
            console.log('🔄 ORDER STATUS UPDATED:', data);

            // Update the order in the list
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    (order._id === data.orderId || order.id === data.orderId)
                        ? { ...order, status: data.status, updatedAt: data.timestamp }
                        : order
                )
            );
        });

        // 🔥 Listen for delivery assignments
        socket.on('order:assigned', (data) => {
            console.log('🚴 ORDER ASSIGNED:', data);

            // Update the order in the list
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    (order._id === data.orderId || order.id === data.orderId)
                        ? {
                            ...order,
                            deliveryAgent: data.deliveryAgent,
                            status: 'out_for_delivery',
                            assignedAt: data.assignedAt
                        }
                        : order
                )
            );
        });

        // Cleanup on unmount
        return () => {
            console.log('🧹 Cleaning up socket connection');
            if (socket) {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('registered');
                socket.off('order:new');
                socket.off('order:status:changed');
                socket.off('order:assigned');
                socket.disconnect();
            }
        };
    }, [userId]);

    const filters = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
        { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
        { id: 'out_for_delivery', label: 'Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length },
        { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', color: '#FF9800', bgColor: '#FFF3E0', icon: 'schedule' };
            case 'confirmed':
                return { label: 'Confirmed', color: '#2196F3', bgColor: '#E3F2FD', icon: 'check-circle' };
            case 'preparing':
                return { label: 'Preparing', color: '#2196F3', bgColor: '#E3F2FD', icon: 'restaurant' };
            case 'ready':
                return { label: 'Ready', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'out_for_delivery':
                return { label: 'Out for Delivery', color: '#9C27B0', bgColor: '#F3E5F5', icon: 'delivery-dining' };
            case 'delivered':
                return { label: 'Delivered', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'done-all' };
            case 'cancelled':
                return { label: 'Cancelled', color: '#F44336', bgColor: '#FFEBEE', icon: 'cancel' };
            default:
                return { label: status, color: '#666', bgColor: '#F5F5F5', icon: 'info' };
        }
    };

    const filteredOrders = selectedFilter === 'all'
        ? orders.filter(order => {
            const customerName = order.user?.name || order.customer || '';
            const orderNumber = order.orderNumber || order.id || '';
            const searchLower = searchQuery.toLowerCase();

            return customerName.toLowerCase().includes(searchLower) ||
                orderNumber.toLowerCase().includes(searchLower);
        })
        : orders.filter(order => {
            const customerName = order.user?.name || order.customer || '';
            const orderNumber = order.orderNumber || order.id || '';
            const searchLower = searchQuery.toLowerCase();

            return order.status === selectedFilter &&
                (customerName.toLowerCase().includes(searchLower) ||
                    orderNumber.toLowerCase().includes(searchLower));
        });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerLabel}>Order Management</Text>
                        <Text style={styles.headerTitle}>All Orders</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => console.log('Notifications pressed')}
                    >
                        <MaterialIcons name="notifications-none" size={24} color="#2d2d2d" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search orders..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                <View style={styles.categories}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter.id && styles.activeFilterChip
                            ]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter.id && styles.activeFilterText
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView
                style={styles.scrollContainer}
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

                {/* Orders List */}
                <View style={styles.ordersSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWithIcon}>
                            <MaterialIcons name="receipt-long" size={24} color="#cb202d" />
                            <Text style={styles.sectionTitle}>
                                {selectedFilter === 'all' ? 'All Orders' : filters.find(f => f.id === selectedFilter)?.label}
                            </Text>
                        </View>
                        <Text style={styles.orderCount}>{filteredOrders.length} orders</Text>
                    </View>

                    {/* 🔥 Loading State */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#cb202d" />
                            <Text style={styles.loadingText}>Loading orders...</Text>
                        </View>
                    ) : filteredOrders.length === 0 ? (
                        /* 🔥 Empty State */
                        <View style={styles.emptyState}>
                            <MaterialIcons name="receipt-long" size={64} color="#E0E0E0" />
                            <Text style={styles.emptyTitle}>No Orders Found</Text>
                            <Text style={styles.emptyText}>
                                {selectedFilter === 'all'
                                    ? 'No orders yet. New orders will appear here automatically.'
                                    : `No ${filters.find(f => f.id === selectedFilter)?.label.toLowerCase()} orders found.`}
                            </Text>
                        </View>
                    ) : (
                        /* 🔥 Orders List */
                        filteredOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            return (
                                <View key={order.id} style={styles.orderCard}>
                                    {/* Top Section with Customer Info */}
                                    <View style={styles.topSection}>
                                        <View style={styles.customerAvatarContainer}>
                                            {order.profileImage ? (
                                                <Image
                                                    source={{ uri: order.profileImage }}
                                                    style={styles.profileImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.customerAvatar}>
                                                    <Text style={styles.customerInitial}>{order.customer.charAt(0)}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.customerDetails}>
                                            <View style={styles.nameRow}>
                                                <Text style={styles.customerName}>{order.customer}</Text>
                                                {order.priority === 'high' && (
                                                    <View style={styles.priorityBadge}>
                                                        <MaterialIcons name="local-fire-department" size={10} color="#fff" />
                                                        <Text style={styles.priorityText}>HIGH</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.orderId}>{order.id}</Text>
                                        </View>
                                    </View>

                                    {/* Status Section */}
                                    <View style={styles.statusSection}>
                                        <View style={styles.divider} />
                                        <View style={styles.statusRow}>
                                            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                                                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                                                <MaterialIcons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
                                                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                                    {statusConfig.label}
                                                </Text>
                                            </View>
                                            <Text style={styles.orderTime}>{order.time}</Text>
                                        </View>
                                    </View>

                                    {/* Delivery Details Section */}
                                    <View style={styles.deliveryDetailsSection}>
                                        <View style={styles.divider} />
                                        <View style={styles.deliveryRow}>
                                            <MaterialIcons name="location-on" size={16} color="#FF6B35" />
                                            <View style={styles.deliveryInfo}>
                                                <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
                                                <View style={styles.orderMeta}>
                                                    <MaterialIcons name="access-time" size={12} color="#8E8E93" />
                                                    <Text style={styles.readyTime}>Ready: {order.estimatedReady}</Text>
                                                </View>
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
                                            {order.itemsList?.map((item: any, itemIndex: number) => {
                                                // Parse item to extract quantity and name (assuming format like "2x Margherita Pizza")
                                                const itemMatch = item.match(/^(\d+)x?\s*(.+)$/);
                                                const quantity = itemMatch ? itemMatch[1] : '1';
                                                const itemName = itemMatch ? itemMatch[2] : item;
                                                // Mock individual prices for demo (in real app, this would come from order data)
                                                const itemPrice = itemIndex === 0 ? 12.99 : itemIndex === 1 ? 14.99 : 4.99;
                                                const totalItemPrice = parseFloat(quantity) * itemPrice;

                                                return (
                                                    <View key={itemIndex} style={styles.summaryItem}>
                                                        <Text style={styles.itemQuantityName}>
                                                            {quantity} × {itemName}
                                                        </Text>
                                                        <Text style={styles.itemPrice}>${totalItemPrice.toFixed(2)}</Text>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        <View style={styles.summaryDivider} />
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total</Text>
                                            <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={styles.actionsSection}>
                                        {order.status === 'pending' && (
                                            <TouchableOpacity style={styles.acceptButton}>
                                                <MaterialIcons name="check" size={18} color="#fff" />
                                                <Text style={styles.acceptButtonText}>Accept Order</Text>
                                            </TouchableOpacity>
                                        )}
                                        {order.status === 'preparing' && (
                                            <TouchableOpacity style={styles.readyButton}>
                                                <MaterialIcons name="done-all" size={18} color="#fff" />
                                                <Text style={styles.readyButtonText}>Mark Ready</Text>
                                            </TouchableOpacity>
                                        )}
                                        {order.status === 'ready' && (
                                            <TouchableOpacity
                                                style={styles.assignButton}
                                                onPress={() => {
                                                    // @ts-ignore - Navigation to parent stack screen
                                                    navigation.navigate('AssignDeliveryAgent', {
                                                        orderId: order.id,
                                                        orderDetails: order
                                                    });
                                                }}
                                            >
                                                <MaterialIcons name="delivery-dining" size={18} color="#fff" />
                                                <Text style={styles.assignButtonText}>Assign Delivery</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={styles.viewButton}
                                            onPress={() => {
                                                // @ts-ignore - Navigation to parent stack screen
                                                navigation.navigate('OrderDetails', { orderId: order.id });
                                            }}
                                        >
                                            <MaterialIcons name="visibility" size={16} color="#666" />
                                            <Text style={styles.viewButtonText}>View Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Bottom spacing */}
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
    scrollContainer: {
        flex: 1,
    },

    // Header
    header: {
        backgroundColor: 'transparent',
        paddingBottom: 8,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    headerLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '400',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#cb202d',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 45,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
        color: '#8E8E93',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '400',
    },

    // Advertisement Banner
    advertisementBanner: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    advertisementImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F0F0F0',
    },

    // Filters Section
    categoriesContainer: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        maxHeight: 50,
    },
    categories: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        height: 30,
    },
    filterChip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    activeFilterChip: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    activeFilterText: {
        color: '#fff',
    },

    // Orders Section
    ordersSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
    },
    orderCount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
    },

    // Order Card
    orderCard: {
        backgroundColor: '#fbfbfbff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
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
    topSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    customerAvatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#F0F0F0',
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    customerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#cb202d20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customerInitial: {
        fontSize: 18,
        fontWeight: '700',
        color: '#cb202d',
    },
    customerDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
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
    orderId: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cb202d',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 2,
    },
    priorityText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },

    // Status Section
    statusSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 6,
        flex: 1,
        marginRight: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderTime: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },

    // Delivery Details Section
    deliveryDetailsSection: {
        marginBottom: 8,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    deliveryInfo: {
        flex: 1,
        marginLeft: 12,
    },
    deliveryAddress: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 4,
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readyTime: {
        fontSize: 11,
        fontWeight: '500',
        color: '#8E8E93',
    },

    // Order Summary Section
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
    itemName: {
        fontSize: 13,
        color: '#2d2d2d',
        fontWeight: '500',
        lineHeight: 18,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
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
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    paymentMethod: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
    },

    // Action Buttons
    actionsSection: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    acceptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    readyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    readyButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    assignButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9C27B0',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    assignButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 4,
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666',
    },
    // 🔥 NEW: Loading and empty state styles
    centerContainer: {
        paddingVertical: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    emptyState: {
        paddingVertical: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});