import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

export default function AdminDashboardScreen() {
    const { name } = useSelector((state: RootState) => state.auth);

    const todayStats = {
        totalOrders: 127,
        revenue: 3250.75,
        activeDeliveries: 8,
        avgOrderValue: 25.60,
    };

    const quickStats = [
        { title: 'Total Orders', value: todayStats.totalOrders, icon: '📦', color: '#FF6B6B' },
        { title: "Today's Revenue", value: `$${todayStats.revenue}`, icon: '💰', color: '#4CAF50' },
        { title: 'Active Deliveries', value: todayStats.activeDeliveries, icon: '🚚', color: '#2196F3' },
        { title: 'Avg Order Value', value: `$${todayStats.avgOrderValue}`, icon: '📊', color: '#FF9800' },
    ];

    const adminActions = [
        { title: '👥 Manage Orders', description: 'View and manage all orders', color: '#FF6B6B' },
        { title: '🍕 Menu Management', description: 'Update menu items and prices', color: '#4CAF50' },
        { title: '🚚 Delivery Tracking', description: 'Track all delivery personnel', color: '#2196F3' },
        { title: '👤 Staff Management', description: 'Manage delivery staff', color: '#FF9800' },
        { title: '📊 Analytics', description: 'View detailed reports', color: '#9C27B0' },
        { title: '⚙️ Settings', description: 'App and business settings', color: '#607D8B' },
    ];

    const recentActivity = [
        { action: '📦 New order received', time: '2 mins ago', id: '#ORD-161' },
        { action: '✅ Order delivered', time: '5 mins ago', id: '#ORD-158' },
        { action: '👥 New customer registered', time: '12 mins ago', id: 'Sarah Johnson' },
        { action: '🚚 Driver went online', time: '15 mins ago', id: 'Mike Chen' },
        { action: '💰 Payment received', time: '18 mins ago', id: '#PAY-1547' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Admin Dashboard</Text>
                <Text style={styles.adminName}>Welcome, {name}!</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Quick Stats */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>📈 Today's Overview</Text>
                    <View style={styles.statsGrid}>
                        {quickStats.map((stat, index) => (
                            <View key={index} style={[styles.statCard, { borderColor: stat.color }]}>
                                <Text style={styles.statIcon}>{stat.icon}</Text>
                                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Admin Actions */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        {adminActions.map((action, index) => (
                            <TouchableOpacity key={index} style={[styles.actionCard, { borderLeftColor: action.color }]}>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={styles.actionDescription}>{action.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.activitySection}>
                    <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
                    {recentActivity.map((activity, index) => (
                        <View key={index} style={styles.activityItem}>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityAction}>{activity.action}</Text>
                                <Text style={styles.activityId}>{activity.id}</Text>
                            </View>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                    ))}
                </View>

                {/* System Status */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>🔧 System Status</Text>

                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>🌐 Online Ordering</Text>
                        <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>

                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>🚚 Delivery Service</Text>
                        <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.statusText}>Running</Text>
                        </View>
                    </View>

                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>💳 Payment Gateway</Text>
                        <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.statusText}>Operational</Text>
                        </View>
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
        backgroundColor: '#9C27B0',
        padding: 20,
        paddingTop: 60,
    },
    welcome: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    adminName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    date: {
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
    statsSection: {
        marginBottom: 30,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
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
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    actionsSection: {
        marginBottom: 30,
    },
    actionsGrid: {
        gap: 12,
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 14,
        color: '#666',
    },
    activitySection: {
        marginBottom: 30,
    },
    activityItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityContent: {
        flex: 1,
    },
    activityAction: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    activityId: {
        fontSize: 12,
        color: '#9C27B0',
        fontWeight: '600',
    },
    activityTime: {
        fontSize: 12,
        color: '#666',
    },
    statusSection: {
        marginBottom: 20,
    },
    statusItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    statusIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
});