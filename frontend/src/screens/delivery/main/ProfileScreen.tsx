import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, clearAuthState } from '../../../../redux/store';
import { logout } from '../../../../redux/slices/authSlice';

export default function ProfileScreen() {
    const dispatch = useDispatch();
    const { name, email } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await clearAuthState();
        dispatch(logout());
    };

    const stats = {
        totalDeliveries: 247,
        totalEarnings: 3420.50,
        averageRating: 4.8,
        memberSince: 'March 2023',
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👤 Profile</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <Text style={styles.driverName}>{name}</Text>
                    <Text style={styles.driverEmail}>{email}</Text>
                    <Text style={styles.memberSince}>Member since {stats.memberSince}</Text>
                </View>

                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Performance Stats</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{stats.totalDeliveries}</Text>
                            <Text style={styles.statLabel}>Total Deliveries</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>${stats.totalEarnings}</Text>
                            <Text style={styles.statLabel}>Total Earnings</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>⭐ {stats.averageRating}</Text>
                            <Text style={styles.statLabel}>Average Rating</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>98%</Text>
                            <Text style={styles.statLabel}>On-Time Rate</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account Options</Text>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>💰 Earnings History</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>🚗 Vehicle Information</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>⚙️ Settings</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    driverName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    driverEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    memberSince: {
        fontSize: 14,
        color: '#4CAF50',
    },
    statsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
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
        alignItems: 'center',
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    menuSection: {
        marginBottom: 20,
    },
    menuButton: {
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
    menuButtonText: {
        fontSize: 16,
        color: '#333',
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});