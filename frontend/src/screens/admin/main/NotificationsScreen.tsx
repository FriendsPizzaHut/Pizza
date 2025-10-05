import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Notification {
    id: string;
    type: 'order' | 'delivery' | 'payment' | 'customer' | 'system' | 'staff';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    priority: 'high' | 'medium' | 'low';
}

export default function NotificationsScreen() {
    const navigation = useNavigation<NavigationProp>();

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'order',
            title: 'New Order Received',
            message: 'Order #ORD-161 has been placed. 2x Margherita Pizza, 1x Garlic Bread',
            time: '2 mins ago',
            isRead: false,
            priority: 'high',
        },
        {
            id: '2',
            type: 'delivery',
            title: 'Delivery Completed',
            message: 'Order #ORD-158 has been successfully delivered by Mike Chen',
            time: '5 mins ago',
            isRead: false,
            priority: 'medium',
        },
        {
            id: '3',
            type: 'payment',
            title: 'Payment Received',
            message: 'Payment of ₹850.00 received for Order #ORD-159',
            time: '8 mins ago',
            isRead: false,
            priority: 'medium',
        },
        {
            id: '4',
            type: 'customer',
            title: 'New Customer Registration',
            message: 'Sarah Johnson has registered as a new customer',
            time: '12 mins ago',
            isRead: true,
            priority: 'low',
        },
        {
            id: '5',
            type: 'staff',
            title: 'Driver Status Update',
            message: 'Mike Chen is now online and available for deliveries',
            time: '15 mins ago',
            isRead: true,
            priority: 'low',
        },
        {
            id: '6',
            type: 'order',
            title: 'Order Cancelled',
            message: 'Order #ORD-157 has been cancelled by the customer',
            time: '18 mins ago',
            isRead: true,
            priority: 'medium',
        },
        {
            id: '7',
            type: 'payment',
            title: 'Payment Failed',
            message: 'Payment failed for Order #ORD-156. Please contact customer.',
            time: '25 mins ago',
            isRead: true,
            priority: 'high',
        },
        {
            id: '8',
            type: 'system',
            title: 'System Update',
            message: 'Menu items have been successfully updated',
            time: '1 hour ago',
            isRead: true,
            priority: 'low',
        },
        {
            id: '9',
            type: 'delivery',
            title: 'Delivery Delayed',
            message: 'Order #ORD-155 is running 10 minutes behind schedule',
            time: '2 hours ago',
            isRead: true,
            priority: 'high',
        },
        {
            id: '10',
            type: 'customer',
            title: 'Customer Feedback',
            message: 'New 5-star rating received from John Doe',
            time: '3 hours ago',
            isRead: true,
            priority: 'low',
        },
    ]);

    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getIconName = (type: Notification['type']) => {
        switch (type) {
            case 'order':
                return 'shopping-cart';
            case 'delivery':
                return 'delivery-dining';
            case 'payment':
                return 'payments';
            case 'customer':
                return 'person';
            case 'staff':
                return 'people';
            case 'system':
                return 'settings';
            default:
                return 'notifications';
        }
    };

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'order':
                return '#cb202d';
            case 'delivery':
                return '#FF9800';
            case 'payment':
                return '#4CAF50';
            case 'customer':
                return '#2196F3';
            case 'staff':
                return '#9C27B0';
            case 'system':
                return '#607D8B';
            default:
                return '#8E8E93';
        }
    };

    const getIconGradient = (type: Notification['type']): [string, string] => {
        switch (type) {
            case 'order':
                return ['#FFEBEE', '#FFCDD2'];
            case 'delivery':
                return ['#FFF3E0', '#FFE0B2'];
            case 'payment':
                return ['#E8F5E9', '#C8E6C9'];
            case 'customer':
                return ['#E3F2FD', '#BBDEFB'];
            case 'staff':
                return ['#F3E5F5', '#E1BEE7'];
            case 'system':
                return ['#ECEFF1', '#CFD8DC'];
            default:
                return ['#F5F5F5', '#EEEEEE'];
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };

    const filteredNotifications =
        filter === 'unread'
            ? notifications.filter((n) => !n.isRead)
            : notifications;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filter === 'all' && styles.filterTabTextActive,
                            ]}
                        >
                            All ({notifications.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            filter === 'unread' && styles.filterTabActive,
                        ]}
                        onPress={() => setFilter('unread')}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filter === 'unread' && styles.filterTabTextActive,
                            ]}
                        >
                            Unread ({unreadCount})
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Notifications List */}
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {filteredNotifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <MaterialIcons
                                name="notifications-none"
                                size={64}
                                color="#CFD8DC"
                            />
                        </View>
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyMessage}>
                            {filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : 'You have no notifications at the moment.'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.notificationsList}>
                        {filteredNotifications.map((notification, index) => (
                            <TouchableOpacity
                                key={notification.id}
                                style={[
                                    styles.notificationItem,
                                    !notification.isRead && styles.notificationItemUnread,
                                ]}
                                onPress={() => markAsRead(notification.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.notificationContent}>
                                    <LinearGradient
                                        colors={getIconGradient(notification.type)}
                                        style={styles.notificationIcon}
                                    >
                                        <MaterialIcons
                                            name={getIconName(notification.type)}
                                            size={24}
                                            color={getIconColor(notification.type)}
                                        />
                                    </LinearGradient>

                                    <View style={styles.notificationText}>
                                        <View style={styles.notificationHeader}>
                                            <Text
                                                style={[
                                                    styles.notificationTitle,
                                                    !notification.isRead &&
                                                    styles.notificationTitleUnread,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {notification.title}
                                            </Text>
                                            {notification.priority === 'high' && (
                                                <View style={styles.priorityBadge}>
                                                    <MaterialIcons
                                                        name="priority-high"
                                                        size={12}
                                                        color="#fff"
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        <Text
                                            style={styles.notificationMessage}
                                            numberOfLines={2}
                                        >
                                            {notification.message}
                                        </Text>
                                        <Text style={styles.notificationTime}>
                                            {notification.time}
                                        </Text>
                                    </View>

                                    {!notification.isRead && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    headerSafeArea: {
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f4f4f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    headerRight: {
        width: 40,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#fff',
        gap: 12,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f4f4f2',
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#cb202d',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    filterTabTextActive: {
        color: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    notificationsList: {
        paddingHorizontal: 16,
    },
    notificationItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    notificationItemUnread: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FFEBEE',
        ...Platform.select({
            ios: {
                shadowColor: '#cb202d',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        flex: 1,
    },
    notificationTitleUnread: {
        fontWeight: '700',
    },
    priorityBadge: {
        backgroundColor: '#cb202d',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 6,
    },
    notificationTime: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#cb202d',
        marginLeft: 8,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
});
