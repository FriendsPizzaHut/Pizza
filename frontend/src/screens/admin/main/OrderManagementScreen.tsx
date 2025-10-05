import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Platform, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


// const { width } = Dimensions.get('window');

export default function OrderManagementScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const orders = [
        {
            id: '#ORD-001',
            customer: 'John Doe',
            items: 3,
            total: 35.99,
            status: 'preparing',
            time: '14:30',
            estimatedReady: '15:15',
            priority: 'normal',
            itemsList: ['2x Margherita Pizza', '1x Pepperoni Pizza', '1x Garlic Bread'],
            paymentMethod: 'Card',
            deliveryAddress: '123 Main St, Apt 4B',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        },
        {
            id: '#ORD-002',
            customer: 'Sarah Wilson',
            items: 2,
            total: 24.50,
            status: 'ready',
            time: '14:25',
            estimatedReady: '15:10',
            priority: 'high',
            itemsList: ['1x Veggie Supreme', '2x Coke'],
            paymentMethod: 'Cash',
            deliveryAddress: '456 Oak Ave',
            profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        },
        {
            id: '#ORD-003',
            customer: 'Mike Johnson',
            items: 5,
            total: 47.75,
            status: 'delivery',
            time: '14:20',
            estimatedReady: '15:05',
            priority: 'normal',
            itemsList: ['1x BBQ Chicken', '1x Meat Lovers', '1x Fries', '2x Pepsi'],
            paymentMethod: 'Card',
            deliveryAddress: '789 Pine Road',
            profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        },
        {
            id: '#ORD-004',
            customer: 'Emma Davis',
            items: 1,
            total: 15.99,
            status: 'pending',
            time: '14:35',
            estimatedReady: '15:20',
            priority: 'normal',
            itemsList: ['1x Margherita Pizza'],
            paymentMethod: 'Card',
            deliveryAddress: '321 Elm Street',
            profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        },
    ];

    const filters = [
        { id: 'all', label: 'All Orders', count: 20 },
        { id: 'pending', label: 'Pending', count: 4 },
        { id: 'preparing', label: 'Preparing', count: 8 },
        { id: 'ready', label: 'Ready', count: 3 },
        { id: 'delivery', label: 'Delivery', count: 5 },
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', color: '#FF9800', bgColor: '#FFF3E0', icon: 'schedule' };
            case 'preparing':
                return { label: 'Preparing', color: '#2196F3', bgColor: '#E3F2FD', icon: 'restaurant' };
            case 'ready':
                return { label: 'Ready', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'delivery':
                return { label: 'Out for Delivery', color: '#9C27B0', bgColor: '#F3E5F5', icon: 'delivery-dining' };
            case 'delivered':
                return { label: 'Delivered', color: '#607D8B', bgColor: '#ECEFF1', icon: 'done-all' };
            default:
                return { label: status, color: '#666', bgColor: '#F5F5F5', icon: 'info' };
        }
    };

    const filteredOrders = selectedFilter === 'all'
        ? orders.filter(order =>
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : orders.filter(order =>
            order.status === selectedFilter &&
            (order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase()))
        );

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

                    {filteredOrders.map((order) => {
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
                                        {order.itemsList.map((item, itemIndex) => {
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
                                            onPress={() => navigation.navigate('AssignDeliveryAgent', {
                                                orderId: order.id,
                                                orderDetails: order
                                            })}
                                        >
                                            <MaterialIcons name="delivery-dining" size={18} color="#fff" />
                                            <Text style={styles.assignButtonText}>Assign Delivery</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                                    >
                                        <MaterialIcons name="visibility" size={16} color="#666" />
                                        <Text style={styles.viewButtonText}>View Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
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
});