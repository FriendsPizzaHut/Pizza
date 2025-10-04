import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function SidesMenuScreen() {
    const navigation = useNavigation<NavigationProp>();

    const sides = [
        {
            id: 1,
            name: 'Garlic Bread',
            description: 'Freshly baked bread with garlic butter and herbs',
            price: 6.99,
            image: '🍞',
            isVegetarian: true,
        },
        {
            id: 2,
            name: 'Buffalo Wings',
            description: '8 crispy wings with buffalo sauce and ranch dip',
            price: 12.99,
            image: '🍗',
            isVegetarian: false,
        },
        {
            id: 3,
            name: 'Mozzarella Sticks',
            description: '6 golden fried mozzarella sticks with marinara sauce',
            price: 8.99,
            image: '🧀',
            isVegetarian: true,
        },
        {
            id: 4,
            name: 'Caesar Salad',
            description: 'Crisp romaine lettuce, parmesan, croutons, caesar dressing',
            price: 9.99,
            image: '🥗',
            isVegetarian: true,
        },
        {
            id: 5,
            name: 'BBQ Wings',
            description: '8 grilled wings with tangy BBQ sauce',
            price: 12.99,
            image: '🍗',
            isVegetarian: false,
        },
        {
            id: 6,
            name: 'Onion Rings',
            description: 'Crispy beer-battered onion rings with chipotle mayo',
            price: 7.99,
            image: '🧅',
            isVegetarian: true,
        },
        {
            id: 7,
            name: 'Garden Salad',
            description: 'Mixed greens, tomatoes, cucumbers, carrots with vinaigrette',
            price: 8.99,
            image: '🥗',
            isVegetarian: true,
        },
        {
            id: 8,
            name: 'Jalapeño Poppers',
            description: '6 cream cheese-filled jalapeños, breaded and fried',
            price: 9.99,
            image: '🌶️',
            isVegetarian: true,
        },
    ];

    const handleSidePress = (side: any) => {
        navigation.navigate('SideDetails', { sideId: side.id });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🍗 Sides & Salads</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryDescription}>
                        Perfect sides to complement your pizza order
                    </Text>
                </View>

                <View style={styles.menuGrid}>
                    {sides.map((side) => (
                        <TouchableOpacity
                            key={side.id}
                            style={styles.sideCard}
                            onPress={() => handleSidePress(side)}
                        >
                            <View style={styles.sideImage}>
                                <Text style={styles.sideEmoji}>{side.image}</Text>
                            </View>

                            <View style={styles.sideInfo}>
                                <View style={styles.sideHeader}>
                                    <Text style={styles.sideName}>{side.name}</Text>
                                    {side.isVegetarian && (
                                        <Text style={styles.vegIcon}>🌱</Text>
                                    )}
                                </View>

                                <Text style={styles.sideDescription}>{side.description}</Text>

                                <View style={styles.priceSection}>
                                    <Text style={styles.priceText}>${side.price}</Text>
                                    <TouchableOpacity style={styles.addButton}>
                                        <Text style={styles.addButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
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
    menuGrid: {
        gap: 15,
    },
    sideCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    sideImage: {
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#f8f8f8',
    },
    sideEmoji: {
        fontSize: 40,
    },
    sideInfo: {
        padding: 15,
    },
    sideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sideName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    vegIcon: {
        fontSize: 16,
    },
    sideDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        lineHeight: 16,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 16,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#FF6B6B',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});