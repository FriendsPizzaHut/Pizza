import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, clearAuthState } from '../../../../redux/store';
import { logout } from '../../../../redux/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function CustomerHomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { name } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await clearAuthState();
        dispatch(logout());
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {name}! 👋</Text>
                <Text style={styles.subtitle}>What would you like to order today?</Text>
            </View>

            <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>🍕 Featured Pizzas</Text>

                <TouchableOpacity
                    style={styles.pizzaCard}
                    onPress={() => navigation.navigate('PizzaDetails', { pizzaId: 'margherita' })}
                >
                    <Text style={styles.pizzaName}>Margherita Pizza</Text>
                    <Text style={styles.pizzaDescription}>Fresh tomatoes, mozzarella, and basil</Text>
                    <Text style={styles.pizzaPrice}>$12.99</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.pizzaCard}
                    onPress={() => navigation.navigate('PizzaDetails', { pizzaId: 'pepperoni' })}
                >
                    <Text style={styles.pizzaName}>Pepperoni Pizza</Text>
                    <Text style={styles.pizzaDescription}>Classic pepperoni with mozzarella</Text>
                    <Text style={styles.pizzaPrice}>$14.99</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Text style={styles.actionButtonText}>🛒 View Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('TrackOrder', { orderId: '1234' })}
                >
                    <Text style={styles.actionButtonText}>📍 Track Order</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
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
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    featuredSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    pizzaCard: {
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
    pizzaName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    pizzaDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    pizzaPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    quickActions: {
        padding: 20,
    },
    actionButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
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