import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../../../redux/store';

export default function DeliveryDashboardScreen() {
    const { name } = useSelector((state: RootState) => state.auth);
    const navigation = useNavigation();

    const todayStats = {
        ordersDelivered: 12,
        earnings: 156.50,
        hoursWorked: 6.5,
        averageRating: 4.8,
    };

    const quickActions = [
        { title: '🚚 Active Orders', count: 3, color: '#FF6B6B' },
        { title: '📋 Order History', count: 245, color: '#4CAF50' },
        { title: '💰 Earnings', amount: '$1,245.50', color: '#2196F3' },
        { title: '⭐ Ratings', rating: '4.9/5', color: '#FF9800' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Welcome back!</Text>
                <Text style={styles.driverName}>{name}</Text>
                <Text style={styles.status}>🟢 Available for deliveries</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.todayStatsSection}>
                    <Text style={styles.sectionTitle}>📊 Today's Performance</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{todayStats.ordersDelivered}</Text>
                            <Text style={styles.statLabel}>Orders Delivered</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>${todayStats.earnings}</Text>
                            <Text style={styles.statLabel}>Earnings</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{todayStats.hoursWorked}h</Text>
                            <Text style={styles.statLabel}>Hours Worked</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>⭐ {todayStats.averageRating}</Text>
                            <Text style={styles.statLabel}>Avg Rating</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>

                    <View style={styles.actionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity key={index} style={[styles.actionCard, { borderColor: action.color }]}>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={[styles.actionValue, { color: action.color }]}>
                                    {action.count || action.amount || action.rating}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>📱 Delivery Status</Text>

                    <TouchableOpacity style={styles.statusToggle}>
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusText}>Available for Deliveries</Text>
                            <Text style={styles.statusSubtext}>Tap to go offline</Text>
                        </View>
                        <View style={styles.statusIndicator}>
                            <Text style={styles.statusDot}>🟢</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>

                    <View style={styles.activityItem}>
                        <Text style={styles.activityText}>✅ Delivered order #ORD-156 to Downtown</Text>
                        <Text style={styles.activityTime}>2:45 PM</Text>
                    </View>

                    <View style={styles.activityItem}>
                        <Text style={styles.activityText}>🚚 Picked up order #ORD-157 from Main Street</Text>
                        <Text style={styles.activityTime}>2:30 PM</Text>
                    </View>

                    <View style={styles.activityItem}>
                        <Text style={styles.activityText}>⭐ Received 5-star rating from customer</Text>
                        <Text style={styles.activityTime}>2:15 PM</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        paddingTop: 60,
    },
    welcome: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    driverName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    status: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    todayStatsSection: {
        marginBottom: 25,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    quickActionsSection: {
        marginBottom: 25,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    actionValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusSection: {
        marginBottom: 25,
    },
    statusToggle: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusInfo: {
        flex: 1,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    statusSubtext: {
        fontSize: 12,
        color: '#666',
    },
    statusIndicator: {
        alignItems: 'center',
    },
    statusDot: {
        fontSize: 24,
    },
    recentSection: {
        marginBottom: 25,
    },
    activityItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    activityTime: {
        fontSize: 12,
        color: '#666',
    },
});