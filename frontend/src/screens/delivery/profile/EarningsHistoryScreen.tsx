import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function EarningsHistoryScreen() {
    const earningsData = [
        {
            date: '2024-01-15',
            deliveries: 8,
            basePay: 80.00,
            tips: 45.50,
            bonuses: 15.00,
            total: 140.50,
        },
        {
            date: '2024-01-14',
            deliveries: 6,
            basePay: 60.00,
            tips: 32.00,
            bonuses: 0.00,
            total: 92.00,
        },
        {
            date: '2024-01-13',
            deliveries: 10,
            basePay: 100.00,
            tips: 58.75,
            bonuses: 20.00,
            total: 178.75,
        },
        {
            date: '2024-01-12',
            deliveries: 7,
            basePay: 70.00,
            tips: 38.25,
            bonuses: 10.00,
            total: 118.25,
        },
    ];

    const weeklyStats = {
        totalEarnings: 529.50,
        totalDeliveries: 31,
        averagePerDelivery: 17.08,
        totalTips: 174.50,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>💰 Earnings History</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>This Week Summary</Text>
                    <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>${weeklyStats.totalEarnings}</Text>
                            <Text style={styles.statLabel}>Total Earnings</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{weeklyStats.totalDeliveries}</Text>
                            <Text style={styles.statLabel}>Deliveries</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>${weeklyStats.averagePerDelivery}</Text>
                            <Text style={styles.statLabel}>Per Delivery</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>${weeklyStats.totalTips}</Text>
                            <Text style={styles.statLabel}>Total Tips</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Daily Breakdown</Text>

                {earningsData.map((day, index) => (
                    <View key={index} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayDate}>{day.date}</Text>
                            <Text style={styles.dayTotal}>${day.total}</Text>
                        </View>

                        <View style={styles.dayStats}>
                            <Text style={styles.deliveryCount}>🚚 {day.deliveries} deliveries</Text>

                            <View style={styles.earningsBreakdown}>
                                <View style={styles.breakdownItem}>
                                    <Text style={styles.breakdownLabel}>Base Pay:</Text>
                                    <Text style={styles.breakdownValue}>${day.basePay}</Text>
                                </View>
                                <View style={styles.breakdownItem}>
                                    <Text style={styles.breakdownLabel}>Tips:</Text>
                                    <Text style={styles.breakdownValue}>${day.tips}</Text>
                                </View>
                                {day.bonuses > 0 && (
                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>Bonuses:</Text>
                                        <Text style={styles.breakdownValue}>${day.bonuses}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
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
        backgroundColor: '#4CAF50',
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
    summaryCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    statItem: {
        alignItems: 'center',
        width: '45%',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    dayCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dayDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dayTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    dayStats: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    deliveryCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    earningsBreakdown: {
        gap: 4,
    },
    breakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#666',
    },
    breakdownValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
});