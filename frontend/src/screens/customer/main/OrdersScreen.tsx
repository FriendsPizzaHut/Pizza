import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';
import { Typography, Colors, Spacing, BorderRadius, Shadows } from '../../../constants/designSystem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
    const navigation = useNavigation<NavigationProp>();

    const orders = [
        {
            id: '1234',
            status: 'Out for Delivery',
            statusType: 'active',
            items: ['2x Margherita Pizza', '1x Pepperoni Pizza'],
            firstItemImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 42.97,
            date: new Date(), // Today
            time: '2:30 PM',
            estimatedTime: '15-20 min'
        },
        {
            id: '1235',
            status: 'Preparing',
            statusType: 'active',
            items: ['1x Supreme Pizza', '1x Garlic Bread'],
            firstItemImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 28.50,
            date: new Date(), // Today
            time: '1:15 PM',
            estimatedTime: '25-30 min'
        },
        {
            id: '1233',
            status: 'Delivered',
            statusType: 'completed',
            items: ['1x Vegetarian Supreme'],
            firstItemImage: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 16.99,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            time: '7:15 PM',
            estimatedTime: null
        },
        {
            id: '1232',
            status: 'Delivered',
            statusType: 'completed',
            items: ['1x Meat Lovers', '1x Margherita'],
            firstItemImage: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 31.98,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            time: '6:45 PM',
            estimatedTime: null
        },
        {
            id: '1231',
            status: 'Delivered',
            statusType: 'completed',
            items: ['1x BBQ Chicken Pizza'],
            firstItemImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 19.99,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            time: '8:30 PM',
            estimatedTime: null
        },
        {
            id: '1230',
            status: 'Delivered',
            statusType: 'completed',
            items: ['1x Hawaiian Pizza', '2x Coca Cola'],
            firstItemImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 24.50,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            time: '7:20 PM',
            estimatedTime: null
        },
        {
            id: '1229',
            status: 'Delivered',
            statusType: 'completed',
            items: ['1x Four Cheese Pizza'],
            firstItemImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            total: 22.99,
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 2 weeks ago
            time: '6:45 PM',
            estimatedTime: null
        },
    ];

    // Helper function to get date label
    const getDateLabel = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const orderDate = new Date(date);

        if (orderDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (orderDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            // Always show exact date for orders older than yesterday
            return orderDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: orderDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };    // Group orders by date
    const groupedOrders = orders.reduce((groups: { [key: string]: typeof orders }, order) => {
        const dateLabel = getDateLabel(order.date);
        if (!groups[dateLabel]) {
            groups[dateLabel] = [];
        }
        groups[dateLabel].push(order);
        return groups;
    }, {});

    // Sort date groups (Today first, then Yesterday, then chronologically)
    const sortedDateGroups = Object.keys(groupedOrders).sort((a, b) => {
        if (a === 'Today') return -1;
        if (b === 'Today') return 1;
        if (a === 'Yesterday') return -1;
        if (b === 'Yesterday') return 1;

        // For other dates, sort by the actual date of the first order in each group
        const dateA = groupedOrders[a][0].date;
        const dateB = groupedOrders[b][0].date;
        return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    const getStatusColor = (statusType: string) => {
        switch (statusType) {
            case 'active': return '#cb202d'; // Using HomeScreen primary red
            case 'completed': return '#22A447'; // Using HomeScreen success green
            default: return '#666';
        }
    };

    const getStatusIcon = (statusType: string) => {
        switch (statusType) {
            case 'active': return <MaterialIcons name="local-shipping" size={16} color={Colors.surface} />;
            case 'completed': return <MaterialIcons name="check-circle" size={16} color={Colors.surface} />;
            default: return <MaterialIcons name="inventory" size={16} color={Colors.surface} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.locationContainer}>
                        <Text style={styles.ordersTitle}>Orders</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cartButtonClean}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <MaterialIcons name="shopping-cart" size={24} color="#2d2d2d" />
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>0</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
                <View style={styles.ordersSection}>
                    {/* Empty State */}
                    {sortedDateGroups.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="receipt-long" size={48} color="#E0E0E0" />
                            <Text style={styles.emptyStateTitle}>No Orders Found</Text>
                            <Text style={styles.emptyStateText}>
                                You haven't placed any orders yet.
                            </Text>
                        </View>
                    ) : (
                        /* Date-wise Orders Section */
                        sortedDateGroups.map((dateLabel) => (
                            <View key={dateLabel} style={styles.sectionContainer}>
                                {/* Date Section Header */}
                                <View style={styles.dateHeader}>
                                    <Text style={styles.sectionTitle}>{dateLabel}</Text>
                                    <View style={styles.dottedLine}>
                                        {Array.from({ length: 40 }).map((_, index) => (
                                            <View key={index} style={styles.dot} />
                                        ))}
                                    </View>
                                </View>

                                {/* Orders for this date */}
                                {groupedOrders[dateLabel].map((order) => (
                                    <TouchableOpacity
                                        key={order.id}
                                        style={styles.orderCard}
                                        onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                                        activeOpacity={0.8}
                                    >
                                        {/* Top Section with Image and First Item Details */}
                                        <View style={styles.topSection}>
                                            <Image
                                                source={{ uri: order.firstItemImage }}
                                                style={styles.itemImage}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.firstItemDetails}>
                                                <Text style={styles.firstItemName}>
                                                    {order.items[0]}
                                                </Text>
                                                <Text style={styles.orderNumber}>Order #{order.id}</Text>
                                            </View>
                                        </View>

                                        {/* Additional Items (if more than 1) */}
                                        {order.items.length > 1 && (
                                            <View style={styles.additionalItemsSection}>
                                                <View style={styles.divider} />
                                                {order.items.slice(1).map((item, index) => (
                                                    <Text key={index} style={styles.additionalItem}>
                                                        {item}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}

                                        {/* Bottom Section with Date, Status and Total */}
                                        <View style={styles.bottomSection}>
                                            <View style={styles.divider} />
                                            <View style={styles.orderMetaRow}>
                                                <Text style={styles.orderDateTime}>
                                                    Order placed on {order.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {order.time}
                                                </Text>
                                            </View>
                                            <View style={styles.statusTotalRow}>
                                                <View style={styles.statusBadge}>
                                                    <Text style={styles.statusText}>{order.status}</Text>
                                                </View>
                                                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))
                    )}

                    {/* View All History Button */}
                    {sortedDateGroups.length > 0 && (
                        <TouchableOpacity
                            style={styles.historyButton}
                            onPress={() => navigation.navigate('OrderHistory')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.historyButtonLeft}>
                                <MaterialIcons name="history" size={20} color="#cb202d" />
                                <Text style={styles.historyButtonText}>View All Order History</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    )}

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    header: {
        backgroundColor: '#f4f4f2',
        paddingBottom: 16,
        paddingTop: 50,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    locationContainer: {
        flex: 1,
    },
    locationLabel: {
        ...Typography.regular.text200,
        color: Colors.text.secondary,
        marginBottom: 2,
    },
    locationText: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
    },
    ordersTitle: {
        ...Typography.semibold.text700,
        color: Colors.text.primary,
    },
    cartButtonClean: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartBadge: {
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
    cartBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    ordersList: {
        flex: 1,
    },
    ordersSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    ordersCount: {
        ...Typography.semibold.text600,
        color: Colors.text.primary,
        marginBottom: Spacing.xl,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        ...Typography.medium.text200,
        color: Colors.text.tertiary,
        marginRight: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dottedLine: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    dot: {
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#E0E0E0',
        opacity: 0.6,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        ...Typography.semibold.text600,
        color: Colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
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
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: Colors.grey.grey100,
    },
    firstItemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    firstItemName: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginBottom: 4,
        lineHeight: 20,
    },
    orderNumber: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
    },
    additionalItemsSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.light,
        marginVertical: 8,
    },
    additionalItem: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
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
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
    },
    statusTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: Colors.grey.grey100,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.light,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    statusText: {
        ...Typography.medium.text200,
        color: Colors.text.primary,
    },
    orderTotal: {
        ...Typography.semibold.text500,
        color: Colors.text.primary,
    },

    historyButton: {
        backgroundColor: '#f4f4f2',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    historyButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyButtonText: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginLeft: 12,
    },
    bottomSpacing: {
        height: 24,
    },
});