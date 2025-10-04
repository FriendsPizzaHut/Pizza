import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, clearAuthState } from '../../../../redux/store';
import { logout } from '../../../../redux/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { name, email, role } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await clearAuthState();
        dispatch(logout());
    };

    const profileOptions = [
        { title: '📍 Delivery Addresses', screen: 'DeliveryAddresses' as const },
        { title: '💳 Payment Methods', screen: 'PaymentMethods' as const },
        { title: '📜 Order History', screen: 'OrderHistory' as const },
        { title: '⚙️ Account Settings', screen: 'AccountSettings' as const },
        { title: '❓ Help & Support', screen: 'HelpSupport' as const },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👤 Profile</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.profileCard}>
                        <Text style={styles.profileLabel}>Name</Text>
                        <Text style={styles.profileValue}>{name}</Text>
                    </View>

                    <View style={styles.profileCard}>
                        <Text style={styles.profileLabel}>Email</Text>
                        <Text style={styles.profileValue}>{email}</Text>
                    </View>

                    <View style={styles.profileCard}>
                        <Text style={styles.profileLabel}>Account Type</Text>
                        <Text style={styles.profileValue}>{role?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account Management</Text>

                    {profileOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuButton}
                            onPress={() => navigation.navigate(option.screen)}
                        >
                            <Text style={styles.menuButtonText}>{option.title}</Text>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))}
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
        backgroundColor: '#FF6B6B',
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
        flex: 1,
    },
    profileSection: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    profileValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    menuSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
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
        margin: 20,
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