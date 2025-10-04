import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function PizzaMenuScreen() {
    const navigation = useNavigation<NavigationProp>();

    const pizzas = [
        {
            id: 1,
            name: 'Margherita Classic',
            description: 'Fresh mozzarella, tomato sauce, fresh basil',
            prices: { small: 12.99, medium: 16.99, large: 20.99 },
            image: '🍕',
            isVegetarian: true,
            isPopular: true,
        },
        {
            id: 2,
            name: 'Pepperoni Supreme',
            description: 'Pepperoni, mozzarella, tomato sauce, oregano',
            prices: { small: 14.99, medium: 18.99, large: 22.99 },
            image: '🍕',
            isVegetarian: false,
            isPopular: true,
        },
        {
            id: 3,
            name: 'BBQ Chicken',
            description: 'Grilled chicken, BBQ sauce, red onions, cilantro',
            prices: { small: 16.99, medium: 20.99, large: 24.99 },
            image: '🍕',
            isVegetarian: false,
            isPopular: false,
        },
        {
            id: 4,
            name: 'Veggie Supreme',
            description: 'Bell peppers, mushrooms, onions, olives, tomatoes',
            prices: { small: 15.99, medium: 19.99, large: 23.99 },
            image: '🍕',
            isVegetarian: true,
            isPopular: false,
        },
        {
            id: 5,
            name: 'Hawaiian Delight',
            description: 'Ham, pineapple, mozzarella, tomato sauce',
            prices: { small: 15.99, medium: 19.99, large: 23.99 },
            image: '🍕',
            isVegetarian: false,
            isPopular: false,
        },
        {
            id: 6,
            name: 'Meat Lovers',
            description: 'Pepperoni, sausage, ham, bacon, ground beef',
            prices: { small: 18.99, medium: 22.99, large: 26.99 },
            image: '🍕',
            isVegetarian: false,
            isPopular: true,
        },
    ];

    const handlePizzaPress = (pizza: any) => {
        navigation.navigate('PizzaDetails', { pizzaId: pizza.id });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🍕 Pizza Menu</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryDescription}>
                        Hand-tossed pizzas made with fresh ingredients and our signature sauce
                    </Text>
                </View>

                {pizzas.map((pizza) => (
                    <TouchableOpacity
                        key={pizza.id}
                        style={styles.pizzaCard}
                        onPress={() => handlePizzaPress(pizza)}
                    >
                        <View style={styles.pizzaImage}>
                            <Text style={styles.pizzaEmoji}>{pizza.image}</Text>
                            {pizza.isPopular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>POPULAR</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.pizzaInfo}>
                            <View style={styles.pizzaHeader}>
                                <Text style={styles.pizzaName}>{pizza.name}</Text>
                                {pizza.isVegetarian && (
                                    <View style={styles.vegBadge}>
                                        <Text style={styles.vegText}>🌱 VEG</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.pizzaDescription}>{pizza.description}</Text>

                            <View style={styles.priceSection}>
                                <View style={styles.priceOptions}>
                                    <Text style={styles.priceText}>Small: ${pizza.prices.small}</Text>
                                    <Text style={styles.priceText}>Medium: ${pizza.prices.medium}</Text>
                                    <Text style={styles.priceText}>Large: ${pizza.prices.large}</Text>
                                </View>
                                <TouchableOpacity style={styles.addButton}>
                                    <Text style={styles.addButtonText}>Add +</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
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
        backgroundColor: '#FF6B6B',
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
    categoryInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    pizzaCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    pizzaImage: {
        position: 'relative',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#f8f8f8',
    },
    pizzaEmoji: {
        fontSize: 50,
    },
    popularBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pizzaInfo: {
        padding: 15,
    },
    pizzaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pizzaName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    vegBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    vegText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    pizzaDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 18,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceOptions: {
        flex: 1,
    },
    priceText: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
        marginBottom: 2,
    },
    addButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});