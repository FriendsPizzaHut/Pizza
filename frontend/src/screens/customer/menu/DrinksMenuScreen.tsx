import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function DrinksMenuScreen() {
    const navigation = useNavigation<NavigationProp>();

    const drinks = [
        {
            id: 1,
            name: 'Coca Cola',
            description: 'Classic Coca Cola - refreshing cola taste',
            sizes: { small: 1.99, medium: 2.49, large: 2.99 },
            image: '🥤',
            category: 'Soft Drinks',
        },
        {
            id: 2,
            name: 'Sprite',
            description: 'Crisp lemon-lime soda',
            sizes: { small: 1.99, medium: 2.49, large: 2.99 },
            image: '🥤',
            category: 'Soft Drinks',
        },
        {
            id: 3,
            name: 'Orange Juice',
            description: 'Fresh squeezed orange juice',
            sizes: { small: 2.99, medium: 3.99 },
            image: '🧃',
            category: 'Juices',
        },
        {
            id: 4,
            name: 'Bottled Water',
            description: 'Pure spring water',
            sizes: { single: 1.49 },
            image: '💧',
            category: 'Water',
        },
        {
            id: 5,
            name: 'Iced Tea',
            description: 'Refreshing iced tea with lemon',
            sizes: { small: 2.29, medium: 2.79, large: 3.29 },
            image: '🧊',
            category: 'Teas',
        },
        {
            id: 6,
            name: 'Lemonade',
            description: 'Fresh squeezed lemonade',
            sizes: { small: 2.99, medium: 3.49, large: 3.99 },
            image: '🍋',
            category: 'Juices',
        },
        {
            id: 7,
            name: 'Energy Drink',
            description: 'Red Bull energy drink',
            sizes: { single: 3.99 },
            image: '⚡',
            category: 'Energy',
        },
        {
            id: 8,
            name: 'Milkshake',
            description: 'Creamy vanilla milkshake',
            sizes: { regular: 4.99 },
            image: '🥛',
            category: 'Milkshakes',
        },
    ];

    const categories = [...new Set(drinks.map(drink => drink.category))];

    const handleDrinkPress = (drink: any) => {
        navigation.navigate('DrinkDetails', { drinkId: drink.id });
    };

    const renderSizeOptions = (sizes: any) => {
        return Object.entries(sizes).map(([size, price]) => (
            <Text key={size} style={styles.sizeText}>
                {size.charAt(0).toUpperCase() + size.slice(1)}: ${String(price)}
            </Text>
        ));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🥤 Drinks</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryDescription}>
                        Stay refreshed with our selection of beverages
                    </Text>
                </View>

                {categories.map((category) => (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{category}</Text>

                        {drinks
                            .filter(drink => drink.category === category)
                            .map((drink) => (
                                <TouchableOpacity
                                    key={drink.id}
                                    style={styles.drinkCard}
                                    onPress={() => handleDrinkPress(drink)}
                                >
                                    <View style={styles.drinkImage}>
                                        <Text style={styles.drinkEmoji}>{drink.image}</Text>
                                    </View>

                                    <View style={styles.drinkInfo}>
                                        <Text style={styles.drinkName}>{drink.name}</Text>
                                        <Text style={styles.drinkDescription}>{drink.description}</Text>

                                        <View style={styles.sizesSection}>
                                            {renderSizeOptions(drink.sizes)}
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.addButton}>
                                        <Text style={styles.addButtonText}>+</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
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
    categorySection: {
        marginBottom: 25,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        paddingLeft: 5,
    },
    drinkCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 15,
    },
    drinkImage: {
        marginRight: 15,
    },
    drinkEmoji: {
        fontSize: 32,
    },
    drinkInfo: {
        flex: 1,
    },
    drinkName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    drinkDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    sizesSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sizeText: {
        fontSize: 12,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#FF6B6B',
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});