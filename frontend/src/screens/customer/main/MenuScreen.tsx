import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function MenuScreen() {
    const navigation = useNavigation<NavigationProp>();

    const menuItems = [
        { id: 'margherita', name: 'Margherita', description: 'Tomato sauce, mozzarella, fresh basil', price: '$12.99' },
        { id: 'pepperoni', name: 'Pepperoni', description: 'Tomato sauce, mozzarella, pepperoni', price: '$14.99' },
        { id: 'vegetarian', name: 'Vegetarian Supreme', description: 'Tomato sauce, mozzarella, bell peppers, mushrooms, onions', price: '$16.99' },
        { id: 'meatlover', name: 'Meat Lovers', description: 'Tomato sauce, mozzarella, pepperoni, sausage, bacon', price: '$18.99' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🍕 Pizza Menu</Text>
            </View>

            <ScrollView style={styles.menuList}>
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Classic Pizzas</Text>

                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('PizzaDetails', { pizzaId: item.id })}
                        >
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemDescription}>{item.description}</Text>
                            <Text style={styles.itemPrice}>{item.price}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart')}
            >
                <Text style={styles.cartButtonText}>🛒 View Cart (3 items)</Text>
            </TouchableOpacity>
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
    menuList: {
        flex: 1,
    },
    menuSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    menuItem: {
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
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    itemDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    cartButton: {
        backgroundColor: '#FF6B6B',
        margin: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cartButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});