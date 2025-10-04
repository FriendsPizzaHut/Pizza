import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CustomerStackParamList } from '../../../types/navigation';

interface PizzaDetails {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    image?: string;
    category: string;
    preparationTime: string;
    isVegetarian: boolean;
    isSpicy: boolean;
    ingredients: string[];
    nutritionalInfo: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    sizes: {
        name: string;
        price: number;
        servings: string;
    }[];
    crusts: {
        name: string;
        price: number;
    }[];
    toppings: {
        name: string;
        price: number;
        category: string;
    }[];
}

type PizzaDetailsRouteProp = RouteProp<CustomerStackParamList, 'PizzaDetails'>;

export default function PizzaDetailsScreen() {
    const route = useRoute<PizzaDetailsRouteProp>();
    const { pizzaId } = route.params;

    const [selectedSize, setSelectedSize] = useState(0);
    const [selectedCrust, setSelectedCrust] = useState(0);
    const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [pizza, setPizza] = useState<PizzaDetails | null>(null);

    // Mock pizza data - in real app, this would be fetched based on pizzaId
    const getPizzaDetails = (id: string): PizzaDetails => {
        const pizzaData: Record<string, PizzaDetails> = {
            'margherita': {
                id: 'margherita',
                name: 'Margherita Pizza',
                description: 'A classic Italian pizza with fresh tomato sauce, mozzarella cheese, fresh basil leaves, and a drizzle of olive oil on our signature pizza dough.',
                basePrice: 9.99,
                category: 'Classic Pizzas',
                preparationTime: '15-20 mins',
                isVegetarian: true,
                isSpicy: false,
                ingredients: [
                    'Pizza Dough',
                    'Tomato Sauce',
                    'Fresh Mozzarella',
                    'Fresh Basil',
                    'Olive Oil',
                    'Sea Salt'
                ],
                nutritionalInfo: {
                    calories: 285,
                    protein: '12g',
                    carbs: '36g',
                    fat: '10g',
                },
                sizes: [
                    { name: 'Small', price: 0, servings: '1-2 people' },
                    { name: 'Medium', price: 3, servings: '2-3 people' },
                    { name: 'Large', price: 6, servings: '3-4 people' },
                    { name: 'X-Large', price: 9, servings: '4-5 people' },
                ],
                crusts: [
                    { name: 'Original', price: 0 },
                    { name: 'Thin & Crispy', price: 0 },
                    { name: 'Thick & Fluffy', price: 1.5 },
                    { name: 'Stuffed Crust', price: 2.99 },
                ],
                toppings: [
                    { name: 'Extra Cheese', price: 1.99, category: 'Cheese' },
                    { name: 'Pepperoni', price: 2.49, category: 'Meat' },
                    { name: 'Italian Sausage', price: 2.49, category: 'Meat' },
                    { name: 'Mushrooms', price: 1.49, category: 'Vegetables' },
                    { name: 'Bell Peppers', price: 1.49, category: 'Vegetables' },
                    { name: 'Red Onions', price: 1.29, category: 'Vegetables' },
                    { name: 'Black Olives', price: 1.49, category: 'Vegetables' },
                    { name: 'Fresh Tomatoes', price: 1.29, category: 'Vegetables' },
                ],
            },
            'pepperoni': {
                id: 'pepperoni',
                name: 'Pepperoni Pizza',
                description: 'Classic pepperoni pizza with premium pepperoni slices and mozzarella cheese.',
                basePrice: 11.99,
                category: 'Classic Pizzas',
                preparationTime: '15-20 mins',
                isVegetarian: false,
                isSpicy: false,
                ingredients: [
                    'Pizza Dough',
                    'Tomato Sauce',
                    'Mozzarella Cheese',
                    'Premium Pepperoni'
                ],
                nutritionalInfo: {
                    calories: 320,
                    protein: '14g',
                    carbs: '35g',
                    fat: '14g',
                },
                sizes: [
                    { name: 'Small', price: 0, servings: '1-2 people' },
                    { name: 'Medium', price: 3, servings: '2-3 people' },
                    { name: 'Large', price: 6, servings: '3-4 people' },
                    { name: 'X-Large', price: 9, servings: '4-5 people' },
                ],
                crusts: [
                    { name: 'Original', price: 0 },
                    { name: 'Thin & Crispy', price: 0 },
                    { name: 'Thick & Fluffy', price: 1.5 },
                    { name: 'Stuffed Crust', price: 2.99 },
                ],
                toppings: [
                    { name: 'Extra Cheese', price: 1.99, category: 'Cheese' },
                    { name: 'Extra Pepperoni', price: 2.49, category: 'Meat' },
                    { name: 'Italian Sausage', price: 2.49, category: 'Meat' },
                    { name: 'Mushrooms', price: 1.49, category: 'Vegetables' },
                    { name: 'Bell Peppers', price: 1.49, category: 'Vegetables' },
                    { name: 'Red Onions', price: 1.29, category: 'Vegetables' },
                    { name: 'Black Olives', price: 1.49, category: 'Vegetables' },
                    { name: 'Jalapeños', price: 1.29, category: 'Vegetables' },
                ],
            }
        };

        return pizzaData[id] || pizzaData['margherita']; // Default to margherita if ID not found
    };

    useEffect(() => {
        const pizzaDetails = getPizzaDetails(pizzaId);
        setPizza(pizzaDetails);
    }, [pizzaId]);

    const toggleTopping = (index: number) => {
        setSelectedToppings(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const calculateTotalPrice = () => {
        if (!pizza) return 0;
        const sizePrice = pizza.sizes[selectedSize].price;
        const crustPrice = pizza.crusts[selectedCrust].price;
        const toppingsPrice = selectedToppings.reduce((sum, index) =>
            sum + pizza.toppings[index].price, 0
        );

        return (pizza.basePrice + sizePrice + crustPrice + toppingsPrice) * quantity;
    };

    const addToCart = () => {
        if (!pizza) return;

        const cartItem = {
            id: pizza.id,
            name: pizza.name,
            size: pizza.sizes[selectedSize].name,
            crust: pizza.crusts[selectedCrust].name,
            toppings: selectedToppings.map(index => pizza.toppings[index].name),
            quantity,
            price: calculateTotalPrice() / quantity,
            totalPrice: calculateTotalPrice(),
        };

        Alert.alert(
            'Added to Cart!',
            `${quantity}x ${pizza.name} (${cartItem.size}) has been added to your cart.`,
            [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'View Cart', onPress: () => console.log('Navigate to cart') },
            ]
        );
    };

    if (!pizza) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.loadingText}>Loading pizza details...</Text>
            </View>
        );
    }

    const toppingsByCategory = pizza.toppings.reduce((acc, topping, index) => {
        if (!acc[topping.category]) {
            acc[topping.category] = [];
        }
        acc[topping.category].push({ ...topping, index });
        return acc;
    }, {} as Record<string, (typeof pizza.toppings[0] & { index: number })[]>);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imageSection}>
                <View style={styles.pizzaImage}>
                    <Text style={styles.pizzaImagePlaceholder}>🍕</Text>
                </View>
                <View style={styles.badges}>
                    {pizza.isVegetarian && (
                        <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.badgeText}>🌱 Vegetarian</Text>
                        </View>
                    )}
                    {pizza.isSpicy && (
                        <View style={[styles.badge, { backgroundColor: '#FF5722' }]}>
                            <Text style={styles.badgeText}>🌶️ Spicy</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <Text style={styles.pizzaName}>{pizza.name}</Text>
                    <Text style={styles.category}>{pizza.category}</Text>
                    <Text style={styles.description}>{pizza.description}</Text>
                    <Text style={styles.prepTime}>⏱️ {pizza.preparationTime}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📏 Choose Size</Text>
                    {pizza.sizes.map((size, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionRow,
                                selectedSize === index && styles.selectedOption
                            ]}
                            onPress={() => setSelectedSize(index)}
                        >
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionName}>{size.name}</Text>
                                <Text style={styles.optionMeta}>{size.servings}</Text>
                            </View>
                            <Text style={styles.optionPrice}>
                                {size.price > 0 ? `+$${size.price.toFixed(2)}` : 'Included'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍞 Choose Crust</Text>
                    {pizza.crusts.map((crust, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionRow,
                                selectedCrust === index && styles.selectedOption
                            ]}
                            onPress={() => setSelectedCrust(index)}
                        >
                            <Text style={styles.optionName}>{crust.name}</Text>
                            <Text style={styles.optionPrice}>
                                {crust.price > 0 ? `+$${crust.price.toFixed(2)}` : 'Included'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🧀 Extra Toppings</Text>
                    {Object.entries(toppingsByCategory).map(([category, toppings]) => (
                        <View key={category}>
                            <Text style={styles.toppingCategory}>{category}</Text>
                            {toppings.map((topping) => (
                                <TouchableOpacity
                                    key={topping.index}
                                    style={[
                                        styles.optionRow,
                                        selectedToppings.includes(topping.index) && styles.selectedOption
                                    ]}
                                    onPress={() => toggleTopping(topping.index)}
                                >
                                    <Text style={styles.optionName}>{topping.name}</Text>
                                    <Text style={styles.optionPrice}>+${topping.price.toFixed(2)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🥗 Ingredients</Text>
                    <View style={styles.ingredientsList}>
                        {pizza.ingredients.map((ingredient, index) => (
                            <View key={index} style={styles.ingredientTag}>
                                <Text style={styles.ingredientText}>{ingredient}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Nutritional Info (per serving)</Text>
                    <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{pizza.nutritionalInfo.calories}</Text>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{pizza.nutritionalInfo.protein}</Text>
                            <Text style={styles.nutritionLabel}>Protein</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{pizza.nutritionalInfo.carbs}</Text>
                            <Text style={styles.nutritionLabel}>Carbs</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{pizza.nutritionalInfo.fat}</Text>
                            <Text style={styles.nutritionLabel}>Fat</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.quantitySection}>
                    <Text style={styles.sectionTitle}>🔢 Quantity</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(quantity + 1)}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.priceBreakdown}>
                    <Text style={styles.sectionTitle}>💰 Price Breakdown</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Base Price ({pizza.sizes[selectedSize].name})</Text>
                        <Text style={styles.priceValue}>
                            ${(pizza.basePrice + pizza.sizes[selectedSize].price).toFixed(2)}
                        </Text>
                    </View>
                    {pizza.crusts[selectedCrust].price > 0 && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>{pizza.crusts[selectedCrust].name} Crust</Text>
                            <Text style={styles.priceValue}>
                                +${pizza.crusts[selectedCrust].price.toFixed(2)}
                            </Text>
                        </View>
                    )}
                    {selectedToppings.map((index) => (
                        <View key={index} style={styles.priceRow}>
                            <Text style={styles.priceLabel}>{pizza.toppings[index].name}</Text>
                            <Text style={styles.priceValue}>
                                +${pizza.toppings[index].price.toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    {quantity > 1 && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Quantity × {quantity}</Text>
                            <Text style={styles.priceValue}>
                                × {quantity}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${calculateTotalPrice().toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
                    <Text style={styles.addToCartText}>
                        🛒 Add to Cart • ${calculateTotalPrice().toFixed(2)}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    imageSection: {
        position: 'relative',
        backgroundColor: '#fff',
    },
    pizzaImage: {
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    pizzaImagePlaceholder: {
        fontSize: 120,
    },
    badges: {
        position: 'absolute',
        top: 20,
        right: 20,
        gap: 5,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    headerSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    pizzaName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    category: {
        fontSize: 16,
        color: '#FF5722',
        fontWeight: '600',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 15,
    },
    prepTime: {
        fontSize: 14,
        color: '#888',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f8f8',
    },
    selectedOption: {
        backgroundColor: '#FFF3E0',
        borderWidth: 2,
        borderColor: '#FF5722',
    },
    optionInfo: {
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    optionMeta: {
        fontSize: 14,
        color: '#666',
    },
    optionPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5722',
    },
    toppingCategory: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5722',
        marginTop: 10,
        marginBottom: 8,
    },
    ingredientsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ingredientTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    ingredientText: {
        fontSize: 14,
        color: '#666',
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5722',
        marginBottom: 4,
    },
    nutritionLabel: {
        fontSize: 12,
        color: '#666',
    },
    quantitySection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButton: {
        width: 44,
        height: 44,
        backgroundColor: '#FF5722',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    quantity: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 30,
        color: '#333',
    },
    priceBreakdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 10,
        paddingTop: 15,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5722',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addToCartButton: {
        backgroundColor: '#FF5722',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});