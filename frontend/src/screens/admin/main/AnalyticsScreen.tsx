import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const todayStats = {
        revenue: 3250.75,
        orders: 127,
        averageOrder: 25.60,
        customers: 98,
    };

    const chartData = [
        { day: 'Mon', revenue: 2850, orders: 115 },
        { day: 'Tue', revenue: 3100, orders: 125 },
        { day: 'Wed', revenue: 2950, orders: 118 },
        { day: 'Thu', revenue: 3250, orders: 131 },
        { day: 'Fri', revenue: 3800, orders: 152 },
        { day: 'Sat', revenue: 4200, orders: 168 },
        { day: 'Sun', revenue: 3600, orders: 144 },
    ];

    const topItems = [
        { name: 'Margherita Pizza', orders: 45, revenue: 810.00 },
        { name: 'Pepperoni Pizza', orders: 38, revenue: 722.00 },
        { name: 'Buffalo Wings', orders: 32, revenue: 416.00 },
        { name: 'Garlic Bread', orders: 28, revenue: 196.00 },
    ];

    const maxRevenue = Math.max(...chartData.map(d => d.revenue));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📊 Analytics</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.todaySection}>
                    <Text style={styles.sectionTitle}>Today's Performance</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>${todayStats.revenue}</Text>
                            <Text style={styles.statLabel}>Revenue</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{todayStats.orders}</Text>
                            <Text style={styles.statLabel}>Orders</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>${todayStats.averageOrder}</Text>
                            <Text style={styles.statLabel}>Avg Order</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{todayStats.customers}</Text>
                            <Text style={styles.statLabel}>Customers</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.chartSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Weekly Revenue</Text>
                        <TouchableOpacity style={styles.periodButton}>
                            <Text style={styles.periodButtonText}>7 Days</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.chart}>
                        <View style={styles.chartBars}>
                            {chartData.map((data, index) => (
                                <View key={index} style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height: (data.revenue / maxRevenue) * 120 }
                                        ]}
                                    />
                                    <Text style={styles.barLabel}>{data.day}</Text>
                                    <Text style={styles.barValue}>${(data.revenue / 1000).toFixed(1)}k</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.topItemsSection}>
                    <Text style={styles.sectionTitle}>Top Selling Items</Text>

                    {topItems.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemRank}>
                                <Text style={styles.rankNumber}>{index + 1}</Text>
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemOrders}>{item.orders} orders</Text>
                            </View>
                            <Text style={styles.itemRevenue}>${item.revenue}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.insightsSection}>
                    <Text style={styles.sectionTitle}>Key Insights</Text>

                    <View style={styles.insightCard}>
                        <Text style={styles.insightIcon}>📈</Text>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightTitle}>Peak Hours</Text>
                            <Text style={styles.insightText}>
                                Most orders come between 6-8 PM. Consider staffing up during these hours.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.insightCard}>
                        <Text style={styles.insightIcon}>🍕</Text>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightTitle}>Popular Items</Text>
                            <Text style={styles.insightText}>
                                Pizza orders increased 15% this week. Consider adding more pizza varieties.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.insightCard}>
                        <Text style={styles.insightIcon}>⏰</Text>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightTitle}>Delivery Time</Text>
                            <Text style={styles.insightText}>
                                Average delivery time is 28 minutes. 12% improvement from last week.
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.reportButton}>
                        <Text style={styles.reportButtonText}>📄 Generate Detailed Report</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.exportButton}>
                        <Text style={styles.exportButtonText}>📊 Export Data</Text>
                    </TouchableOpacity>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    todaySection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
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
        alignItems: 'center',
        width: (width - 60) / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
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
    chartSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    periodButton: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    periodButtonText: {
        color: '#2196F3',
        fontSize: 12,
        fontWeight: '600',
    },
    chart: {
        height: 180,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 140,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        backgroundColor: '#2196F3',
        width: 25,
        borderRadius: 2,
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    barValue: {
        fontSize: 10,
        color: '#2196F3',
        fontWeight: '600',
    },
    topItemsSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemRank: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    rankNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    itemOrders: {
        fontSize: 14,
        color: '#666',
    },
    itemRevenue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    insightsSection: {
        marginBottom: 25,
    },
    insightCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    insightIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    insightText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    actionsSection: {
        gap: 10,
        marginBottom: 20,
    },
    reportButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    exportButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});