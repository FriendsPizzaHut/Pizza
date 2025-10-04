import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SalesReportsScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [selectedReport, setSelectedReport] = useState('overview');

    const periods = [
        { key: 'day', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'year', label: 'This Year' },
    ];

    const reportTypes = [
        { key: 'overview', label: '📊 Overview', color: '#2196F3' },
        { key: 'products', label: '🍕 Products', color: '#4CAF50' },
        { key: 'customers', label: '👥 Customers', color: '#FF9800' },
        { key: 'payments', label: '💳 Payments', color: '#9C27B0' },
    ];

    const salesData = {
        overview: {
            totalRevenue: 15847,
            totalOrders: 342,
            averageOrder: 46.36,
            newCustomers: 28,
        },
        topProducts: [
            { name: 'Margherita Pizza', sales: 87, revenue: 1131.13 },
            { name: 'Pepperoni Pizza', sales: 73, revenue: 1059.27 },
            { name: 'Supreme Pizza', sales: 56, revenue: 952.48 },
            { name: 'Garlic Bread', sales: 124, revenue: 372.76 },
            { name: 'Coca-Cola', sales: 156, revenue: 468.00 },
        ],
        hourlyData: [
            { hour: '9AM', orders: 12, revenue: 487 },
            { hour: '10AM', orders: 18, revenue: 743 },
            { hour: '11AM', orders: 24, revenue: 892 },
            { hour: '12PM', orders: 45, revenue: 1653 },
            { hour: '1PM', orders: 52, revenue: 1987 },
            { hour: '2PM', orders: 38, revenue: 1456 },
            { hour: '6PM', orders: 67, revenue: 2543 },
            { hour: '7PM', orders: 73, revenue: 2876 },
            { hour: '8PM', orders: 58, revenue: 2234 },
        ],
    };

    const renderOverviewReport = () => (
        <View>
            <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>${salesData.overview.totalRevenue.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>Total Revenue</Text>
                    <Text style={styles.metricChange}>+12.5% vs last week</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{salesData.overview.totalOrders}</Text>
                    <Text style={styles.metricLabel}>Total Orders</Text>
                    <Text style={styles.metricChange}>+8.3% vs last week</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>${salesData.overview.averageOrder}</Text>
                    <Text style={styles.metricLabel}>Average Order</Text>
                    <Text style={styles.metricChange}>+3.7% vs last week</Text>
                </View>
                <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{salesData.overview.newCustomers}</Text>
                    <Text style={styles.metricLabel}>New Customers</Text>
                    <Text style={styles.metricChange}>+15.2% vs last week</Text>
                </View>
            </View>

            <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>📈 Sales by Hour</Text>
                <View style={styles.chartContainer}>
                    {salesData.hourlyData.map((data, index) => {
                        const maxRevenue = Math.max(...salesData.hourlyData.map(d => d.revenue));
                        const height = (data.revenue / maxRevenue) * 120;
                        return (
                            <View key={index} style={styles.barContainer}>
                                <View style={[styles.bar, { height }]} />
                                <Text style={styles.barLabel}>{data.hour}</Text>
                                <Text style={styles.barValue}>${data.revenue}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    const renderProductsReport = () => (
        <View>
            <Text style={styles.sectionTitle}>🏆 Top Selling Products</Text>
            {salesData.topProducts.map((product, index) => (
                <View key={index} style={styles.productRow}>
                    <View style={styles.productRank}>
                        <Text style={styles.rankNumber}>#{index + 1}</Text>
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productStats}>{product.sales} sold</Text>
                    </View>
                    <View style={styles.productRevenue}>
                        <Text style={styles.revenueAmount}>${product.revenue.toFixed(2)}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderCustomersReport = () => (
        <View>
            <View style={styles.customerStats}>
                <View style={styles.customerStatCard}>
                    <Text style={styles.customerStatValue}>1,247</Text>
                    <Text style={styles.customerStatLabel}>Total Customers</Text>
                </View>
                <View style={styles.customerStatCard}>
                    <Text style={styles.customerStatValue}>28</Text>
                    <Text style={styles.customerStatLabel}>New This Week</Text>
                </View>
                <View style={styles.customerStatCard}>
                    <Text style={styles.customerStatValue}>89%</Text>
                    <Text style={styles.customerStatLabel}>Retention Rate</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>👑 Top Customers</Text>
            {[
                { name: 'John Smith', orders: 24, spent: 1247.50 },
                { name: 'Sarah Johnson', orders: 19, spent: 892.25 },
                { name: 'Mike Brown', orders: 16, spent: 734.80 },
                { name: 'Emma Wilson', orders: 14, spent: 678.40 },
                { name: 'David Lee', orders: 12, spent: 567.30 },
            ].map((customer, index) => (
                <View key={index} style={styles.customerRow}>
                    <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <Text style={styles.customerOrders}>{customer.orders} orders</Text>
                    </View>
                    <Text style={styles.customerSpent}>${customer.spent.toFixed(2)}</Text>
                </View>
            ))}
        </View>
    );

    const renderPaymentsReport = () => (
        <View>
            <View style={styles.paymentMethodsGrid}>
                <View style={styles.paymentCard}>
                    <Text style={styles.paymentIcon}>💳</Text>
                    <Text style={styles.paymentValue}>73%</Text>
                    <Text style={styles.paymentLabel}>Credit Card</Text>
                </View>
                <View style={styles.paymentCard}>
                    <Text style={styles.paymentIcon}>📱</Text>
                    <Text style={styles.paymentValue}>18%</Text>
                    <Text style={styles.paymentLabel}>Digital Wallet</Text>
                </View>
                <View style={styles.paymentCard}>
                    <Text style={styles.paymentIcon}>💵</Text>
                    <Text style={styles.paymentValue}>9%</Text>
                    <Text style={styles.paymentLabel}>Cash</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>💰 Payment Trends</Text>
            <View style={styles.trendCard}>
                <Text style={styles.trendTitle}>Average Transaction Value</Text>
                <Text style={styles.trendValue}>$46.36</Text>
                <Text style={styles.trendChange}>+3.7% from last week</Text>
            </View>
            <View style={styles.trendCard}>
                <Text style={styles.trendTitle}>Failed Transactions</Text>
                <Text style={styles.trendValue}>2.3%</Text>
                <Text style={styles.trendChange}>-0.5% from last week</Text>
            </View>
        </View>
    );

    const renderCurrentReport = () => {
        switch (selectedReport) {
            case 'overview':
                return renderOverviewReport();
            case 'products':
                return renderProductsReport();
            case 'customers':
                return renderCustomersReport();
            case 'payments':
                return renderPaymentsReport();
            default:
                return renderOverviewReport();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📊 Sales Reports</Text>
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
                    style={styles.reportSelector}
                >
                    {reportTypes.map((report) => (
                        <TouchableOpacity
                            key={report.key}
                            style={[
                                styles.reportButton,
                                selectedReport === report.key && { backgroundColor: report.color }
                            ]}
                            onPress={() => setSelectedReport(report.key)}
                        >
                            <Text style={[
                                styles.reportButtonText,
                                selectedReport === report.key && styles.selectedReportButtonText
                            ]}>
                                {report.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content}>
                {renderCurrentReport()}
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
        backgroundColor: '#673AB7',
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
        backgroundColor: '#673AB7',
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
    reportSelector: {
        paddingHorizontal: 15,
    },
    reportButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
    },
    reportButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedReportButtonText: {
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
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 160,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        backgroundColor: '#2196F3',
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
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    productRank: {
        width: 40,
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#673AB7',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productStats: {
        fontSize: 14,
        color: '#666',
    },
    productRevenue: {
        alignItems: 'flex-end',
    },
    revenueAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    customerStats: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    customerStatCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
    },
    customerStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF9800',
        marginBottom: 5,
    },
    customerStatLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    customerOrders: {
        fontSize: 14,
        color: '#666',
    },
    customerSpent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF9800',
    },
    paymentMethodsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    paymentCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
    },
    paymentIcon: {
        fontSize: 24,
        marginBottom: 10,
    },
    paymentValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#9C27B0',
        marginBottom: 5,
    },
    paymentLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    trendCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
    },
    trendTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    trendValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    trendChange: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
});