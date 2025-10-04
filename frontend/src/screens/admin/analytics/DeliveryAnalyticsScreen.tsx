import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function DeliveryAnalyticsScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [selectedView, setSelectedView] = useState('performance');

    const periods = [
        { key: 'day', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'year', label: 'This Year' },
    ];

    const viewTypes = [
        { key: 'performance', label: '🎯 Performance', color: '#2196F3' },
        { key: 'drivers', label: '🚗 Drivers', color: '#4CAF50' },
        { key: 'routes', label: '🗺️ Routes', color: '#FF9800' },
        { key: 'times', label: '⏱️ Times', color: '#9C27B0' },
    ];

    const analyticsData = {
        performance: {
            totalDeliveries: 342,
            averageTime: 28.5,
            onTimeRate: 94.2,
            customerRating: 4.7,
        },
        drivers: [
            { name: 'Sarah Chen', deliveries: 87, avgTime: 24.3, rating: 4.9, earnings: 1247 },
            { name: 'Mike Johnson', deliveries: 73, avgTime: 26.8, rating: 4.8, earnings: 1089 },
            { name: 'Alex Rodriguez', deliveries: 65, avgTime: 29.2, rating: 4.7, earnings: 967 },
            { name: 'Emma Wilson', deliveries: 58, avgTime: 31.5, rating: 4.6, earnings: 834 },
            { name: 'David Brown', deliveries: 45, avgTime: 27.9, rating: 4.5, earnings: 672 },
        ],
        timeDistribution: [
            { range: '0-15 min', count: 45, percentage: 13.2 },
            { range: '15-25 min', count: 128, percentage: 37.4 },
            { range: '25-35 min', count: 103, percentage: 30.1 },
            { range: '35-45 min', count: 52, percentage: 15.2 },
            { range: '45+ min', count: 14, percentage: 4.1 },
        ],
        hourlyDeliveries: [
            { hour: '9AM', deliveries: 8, avgTime: 32 },
            { hour: '10AM', deliveries: 12, avgTime: 28 },
            { hour: '11AM', deliveries: 18, avgTime: 25 },
            { hour: '12PM', deliveries: 34, avgTime: 31 },
            { hour: '1PM', deliveries: 42, avgTime: 33 },
            { hour: '2PM', deliveries: 28, avgTime: 29 },
            { hour: '6PM', deliveries: 52, avgTime: 35 },
            { hour: '7PM', deliveries: 58, avgTime: 38 },
            { hour: '8PM', deliveries: 46, avgTime: 32 },
        ],
    };

    const renderPerformanceView = () => (
        <View>
            <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{analyticsData.performance.totalDeliveries}</Text>
                    <Text style={styles.metricLabel}>Total Deliveries</Text>
                    <Text style={styles.metricChange}>+15.3% vs last week</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{analyticsData.performance.averageTime} min</Text>
                    <Text style={styles.metricLabel}>Avg Delivery Time</Text>
                    <Text style={[styles.metricChange, { color: '#4CAF50' }]}>-2.1 min improvement</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{analyticsData.performance.onTimeRate}%</Text>
                    <Text style={styles.metricLabel}>On-Time Rate</Text>
                    <Text style={styles.metricChange}>+1.8% vs last week</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>⭐ {analyticsData.performance.customerRating}</Text>
                    <Text style={styles.metricLabel}>Customer Rating</Text>
                    <Text style={styles.metricChange}>+0.2 improvement</Text>
                </View>
            </View>

            <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>📊 Delivery Times Distribution</Text>
                {analyticsData.timeDistribution.map((data, index) => (
                    <View key={index} style={styles.distributionRow}>
                        <Text style={styles.timeRange}>{data.range}</Text>
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${data.percentage}%` }]} />
                        </View>
                        <Text style={styles.distributionCount}>{data.count}</Text>
                        <Text style={styles.distributionPercentage}>{data.percentage}%</Text>
                    </View>
                ))}
            </View>

            <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>📈 Deliveries by Hour</Text>
                <View style={styles.chartContainer}>
                    {analyticsData.hourlyDeliveries.map((data, index) => {
                        const maxDeliveries = Math.max(...analyticsData.hourlyDeliveries.map(d => d.deliveries));
                        const height = (data.deliveries / maxDeliveries) * 100;
                        return (
                            <View key={index} style={styles.barContainer}>
                                <View style={[styles.deliveryBar, { height }]} />
                                <Text style={styles.barLabel}>{data.hour}</Text>
                                <Text style={styles.barValue}>{data.deliveries}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    const renderDriversView = () => (
        <View>
            <Text style={styles.sectionTitle}>🏆 Top Performing Drivers</Text>
            {analyticsData.drivers.map((driver, index) => (
                <View key={index} style={styles.driverCard}>
                    <View style={styles.driverHeader}>
                        <View style={styles.driverRank}>
                            <Text style={styles.rankNumber}>#{index + 1}</Text>
                        </View>
                        <View style={styles.driverInfo}>
                            <Text style={styles.driverName}>{driver.name}</Text>
                            <Text style={styles.driverRating}>⭐ {driver.rating} rating</Text>
                        </View>
                        <View style={styles.driverEarnings}>
                            <Text style={styles.earningsAmount}>${driver.earnings}</Text>
                            <Text style={styles.earningsLabel}>Earnings</Text>
                        </View>
                    </View>

                    <View style={styles.driverStats}>
                        <View style={styles.driverStatItem}>
                            <Text style={styles.statValue}>{driver.deliveries}</Text>
                            <Text style={styles.statLabel}>Deliveries</Text>
                        </View>
                        <View style={styles.driverStatItem}>
                            <Text style={styles.statValue}>{driver.avgTime} min</Text>
                            <Text style={styles.statLabel}>Avg Time</Text>
                        </View>
                        <View style={styles.driverStatItem}>
                            <Text style={styles.statValue}>
                                {((driver.deliveries / analyticsData.performance.totalDeliveries) * 100).toFixed(1)}%
                            </Text>
                            <Text style={styles.statLabel}>Share</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderRoutesView = () => (
        <View>
            <View style={styles.routeStats}>
                <View style={styles.routeStatCard}>
                    <Text style={styles.routeStatValue}>2.4 km</Text>
                    <Text style={styles.routeStatLabel}>Avg Distance</Text>
                </View>
                <View style={styles.routeStatCard}>
                    <Text style={styles.routeStatValue}>$3.25</Text>
                    <Text style={styles.routeStatLabel}>Avg Cost</Text>
                </View>
                <View style={styles.routeStatCard}>
                    <Text style={styles.routeStatValue}>15</Text>
                    <Text style={styles.routeStatLabel}>Peak Areas</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>🗺️ Popular Delivery Areas</Text>
            {[
                { area: 'Downtown', orders: 87, avgTime: '25 min', distance: '1.8 km' },
                { area: 'University District', orders: 73, avgTime: '22 min', distance: '2.1 km' },
                { area: 'Residential North', orders: 56, avgTime: '31 min', distance: '3.2 km' },
                { area: 'Business Park', orders: 42, avgTime: '28 min', distance: '2.8 km' },
                { area: 'Shopping Mall', orders: 38, avgTime: '19 min', distance: '1.5 km' },
            ].map((area, index) => (
                <View key={index} style={styles.areaCard}>
                    <View style={styles.areaInfo}>
                        <Text style={styles.areaName}>{area.area}</Text>
                        <Text style={styles.areaDistance}>📍 {area.distance} away</Text>
                    </View>
                    <View style={styles.areaStats}>
                        <Text style={styles.areaOrders}>{area.orders} orders</Text>
                        <Text style={styles.areaTime}>⏱️ {area.avgTime}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderTimesView = () => (
        <View>
            <View style={styles.timeMetrics}>
                <View style={styles.timeMetricCard}>
                    <Text style={styles.timeMetricValue}>12:30 PM</Text>
                    <Text style={styles.timeMetricLabel}>Peak Hour</Text>
                </View>
                <View style={styles.timeMetricCard}>
                    <Text style={styles.timeMetricValue}>22 min</Text>
                    <Text style={styles.timeMetricLabel}>Best Time</Text>
                </View>
                <View style={styles.timeMetricCard}>
                    <Text style={styles.timeMetricValue}>42 min</Text>
                    <Text style={styles.timeMetricLabel}>Worst Time</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>⏰ Time Performance</Text>

            <View style={styles.performanceCard}>
                <Text style={styles.performanceTitle}>On-Time Delivery Rate</Text>
                <View style={styles.performanceBar}>
                    <View style={[styles.performanceFill, { width: '94.2%' }]} />
                </View>
                <Text style={styles.performanceValue}>94.2% (Target: 90%)</Text>
            </View>

            <View style={styles.performanceCard}>
                <Text style={styles.performanceTitle}>Average Preparation Time</Text>
                <View style={styles.performanceBar}>
                    <View style={[styles.performanceFill, { width: '75%', backgroundColor: '#FF9800' }]} />
                </View>
                <Text style={styles.performanceValue}>15 minutes (Target: 20 min)</Text>
            </View>

            <View style={styles.performanceCard}>
                <Text style={styles.performanceTitle}>Average Delivery Time</Text>
                <View style={styles.performanceBar}>
                    <View style={[styles.performanceFill, { width: '85%', backgroundColor: '#9C27B0' }]} />
                </View>
                <Text style={styles.performanceValue}>28.5 minutes (Target: 30 min)</Text>
            </View>

            <Text style={styles.sectionTitle}>📅 Weekly Trends</Text>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                const avgTimes = [26.5, 24.8, 27.2, 29.1, 31.5, 28.9, 25.3];
                const deliveries = [42, 38, 45, 52, 67, 73, 58];
                return (
                    <View key={index} style={styles.dayRow}>
                        <Text style={styles.dayName}>{day}</Text>
                        <Text style={styles.dayDeliveries}>{deliveries[index]} deliveries</Text>
                        <Text style={styles.dayTime}>{avgTimes[index]} min avg</Text>
                    </View>
                );
            })}
        </View>
    );

    const renderCurrentView = () => {
        switch (selectedView) {
            case 'performance':
                return renderPerformanceView();
            case 'drivers':
                return renderDriversView();
            case 'routes':
                return renderRoutesView();
            case 'times':
                return renderTimesView();
            default:
                return renderPerformanceView();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🚚 Delivery Analytics</Text>
            </View>

            <View style={styles.controls}>
                <View style={styles.periodSelector}>
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period.key}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period.key && styles.selectedPeriodButton
                            ]}
                            onPress={() => setSelectedPeriod(period.key)}
                        >
                            <Text style={[
                                styles.periodButtonText,
                                selectedPeriod === period.key && styles.selectedPeriodButtonText
                            ]}>
                                {period.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.viewSelector}
                >
                    {viewTypes.map((view) => (
                        <TouchableOpacity
                            key={view.key}
                            style={[
                                styles.viewButton,
                                selectedView === view.key && { backgroundColor: view.color }
                            ]}
                            onPress={() => setSelectedView(view.key)}
                        >
                            <Text style={[
                                styles.viewButtonText,
                                selectedView === view.key && styles.selectedViewButtonText
                            ]}>
                                {view.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content}>
                {renderCurrentView()}
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
        backgroundColor: '#795548',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    controls: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    periodSelector: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginHorizontal: 2,
        backgroundColor: '#f0f0f0',
    },
    selectedPeriodButton: {
        backgroundColor: '#795548',
    },
    periodButtonText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedPeriodButtonText: {
        color: '#fff',
    },
    viewSelector: {
        paddingHorizontal: 15,
    },
    viewButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedViewButtonText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 25,
    },
    metricCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        minWidth: (width - 55) / 2,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    metricLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    metricChange: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    chartSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    distributionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    timeRange: {
        width: 80,
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginHorizontal: 15,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 4,
    },
    distributionCount: {
        width: 35,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    distributionPercentage: {
        width: 45,
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    deliveryBar: {
        backgroundColor: '#795548',
        width: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    barLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },
    barValue: {
        fontSize: 9,
        color: '#999',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    driverCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },
    driverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    driverRank: {
        width: 40,
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#795548',
    },
    driverInfo: {
        flex: 1,
        marginLeft: 15,
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    driverRating: {
        fontSize: 14,
        color: '#666',
    },
    driverEarnings: {
        alignItems: 'flex-end',
    },
    earningsAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    earningsLabel: {
        fontSize: 12,
        color: '#666',
    },
    driverStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    driverStatItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    routeStats: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    routeStatCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
    },
    routeStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF9800',
        marginBottom: 5,
    },
    routeStatLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    areaCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    areaInfo: {
        flex: 1,
    },
    areaName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    areaDistance: {
        fontSize: 14,
        color: '#666',
    },
    areaStats: {
        alignItems: 'flex-end',
    },
    areaOrders: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF9800',
        marginBottom: 4,
    },
    areaTime: {
        fontSize: 14,
        color: '#666',
    },
    timeMetrics: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    timeMetricCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
    },
    timeMetricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#9C27B0',
        marginBottom: 5,
    },
    timeMetricLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    performanceCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
    },
    performanceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    performanceBar: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 10,
    },
    performanceFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    performanceValue: {
        fontSize: 14,
        color: '#666',
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    dayName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dayDeliveries: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        textAlign: 'center',
    },
    dayTime: {
        fontSize: 14,
        color: '#9C27B0',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
});