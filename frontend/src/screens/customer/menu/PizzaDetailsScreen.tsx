import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Animated, Image } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { CustomerStackParamList } from '../../../types/navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
    const navigation = useNavigation();
    const { pizzaId } = route.params;

    const [selectedSize, setSelectedSize] = useState(0);
    const [selectedCrust, setSelectedCrust] = useState(0);
    const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [pizza, setPizza] = useState<PizzaDetails | null>(null);
    const [scrollY] = useState(new Animated.Value(0));

    // Mock pizza data - in real app, this would be fetched based on pizzaId
    const getPizzaDetails = (id: string): PizzaDetails => {
        const pizzaData: Record<string, PizzaDetails> = {
            'margherita': {
                id: 'margherita',
                name: 'Margherita Pizza',
                description: 'A classic Italian pizza with fresh tomato sauce, mozzarella cheese, fresh basil leaves, and a drizzle of olive oil on our signature pizza dough.',
                basePrice: 9.99,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
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
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
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

    // Animated header opacity
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const imageScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.5, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />

            {/* Animated Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{pizza.name}</Text>
                <View style={styles.headerPlaceholder} />
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            >
                {/* Hero Image Section */}
                <Animated.View style={[styles.heroSection, { transform: [{ scale: imageScale }] }]}>
                    <View style={styles.pizzaImageContainer}>
                        <Image
                            source={{ uri: pizza.image || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' }}
                            style={styles.pizzaImage}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Floating Back Button - On Image */}
                    <TouchableOpacity
                        style={styles.floatingBackButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Badges on Image */}
                    <View style={styles.imageBadges}>
                        {pizza.isVegetarian && (
                            <View style={[styles.imageBadge, { backgroundColor: '#0C7C59' }]}>
                                <View style={styles.vegIcon}>
                                    <View style={styles.vegDot} />
                                </View>
                                <Text style={styles.imageBadgeText}>Pure Veg</Text>
                            </View>
                        )}
                        {pizza.isSpicy && (
                            <View style={[styles.imageBadge, { backgroundColor: '#cb202d' }]}>
                                <Text style={styles.imageBadgeText}>🌶️ Spicy</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Main Content */}
                <View style={styles.contentContainer}>
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <View style={styles.titleLeft}>
                                <Text style={styles.pizzaName}>{pizza.name}</Text>
                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingBadge}>
                                        <MaterialIcons name="star" size={14} color="#fff" />
                                        <Text style={styles.ratingText}>4.5</Text>
                                    </View>
                                    <Text style={styles.reviewsText}>(245 ratings)</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.description}>{pizza.description}</Text>

                        {/* Quick Info */}
                        <View style={styles.quickInfoRow}>
                            <View style={styles.quickInfoItem}>
                                <MaterialIcons name="access-time" size={16} color="#cb202d" />
                                <Text style={styles.quickInfoText}>{pizza.preparationTime}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Size Selection - Zomato Style */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.cardTitle}>Choose Size</Text>
                        <Text style={styles.cardSubtitle}>Select 1 option</Text>
                        <View style={styles.optionsList}>
                            {pizza.sizes.map((size, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.radioOption,
                                        selectedSize === index && styles.radioOptionSelected
                                    ]}
                                    onPress={() => setSelectedSize(index)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.radioLeft}>
                                        <View style={[
                                            styles.radioCircle,
                                            selectedSize === index && styles.radioCircleSelected
                                        ]}>
                                            {selectedSize === index && <View style={styles.radioSelected} />}
                                        </View>
                                        <View style={styles.radioContent}>
                                            <Text style={styles.radioTitle}>{size.name}</Text>
                                            <Text style={styles.radioSubtitle}>{size.servings}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.radioPrice}>
                                        {size.price > 0 ? `+₹${(size.price * 83).toFixed(0)}` : 'Free'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Extra Toppings */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.cardTitle}>Extra Toppings (Optional)</Text>
                        <Text style={styles.cardSubtitle}>You can select multiple</Text>
                        <View style={styles.optionsList}>
                            {Object.entries(toppingsByCategory).map(([category, toppings]) => (
                                <View key={category}>
                                    <Text style={styles.toppingCategoryTitle}>{category}</Text>
                                    {toppings.map((topping) => (
                                        <TouchableOpacity
                                            key={topping.index}
                                            style={[
                                                styles.checkboxOption,
                                                selectedToppings.includes(topping.index) && styles.checkboxOptionSelected
                                            ]}
                                            onPress={() => toggleTopping(topping.index)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.radioLeft}>
                                                <View style={[
                                                    styles.checkbox,
                                                    selectedToppings.includes(topping.index) && styles.checkboxSelected
                                                ]}>
                                                    {selectedToppings.includes(topping.index) && (
                                                        <MaterialIcons name="check" size={14} color="#fff" />
                                                    )}
                                                </View>
                                                <Text style={styles.radioTitle}>{topping.name}</Text>
                                            </View>
                                            <Text style={styles.radioPrice}>+₹{(topping.price * 83).toFixed(0)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
                </View>
            </Animated.ScrollView>

            {/* Floating Add to Cart Button - Zomato Style */}
            <View style={styles.floatingFooter}>
                <TouchableOpacity style={styles.addButton} onPress={addToCart}>
                    <View style={styles.addButtonLeft}>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityBtn}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <MaterialIcons name="remove" size={20} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.quantityDivider} />
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <View style={styles.quantityDivider} />
                            <TouchableOpacity
                                style={styles.quantityBtn}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <MaterialIcons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.addButtonRight}>
                        <Text style={styles.addButtonText}>Add item</Text>
                        <Text style={styles.addButtonPrice}>₹{(calculateTotalPrice() * 83).toFixed(0)}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },

    // Animated Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        paddingTop: 35,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        zIndex: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        marginHorizontal: 16,
        textAlign: 'center',
    },
    headerPlaceholder: {
        width: 40,
    },

    // Floating Back Button
    floatingBackButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },

    // Hero Section
    heroSection: {
        position: 'relative',
        height: 300,
        backgroundColor: '#f8f8f8',
        overflow: 'hidden',
    },
    pizzaImageContainer: {
        flex: 1,
        width: '100%',
    },
    pizzaImage: {
        width: '100%',
        height: '100%',
    },
    imageBadges: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'row',
        gap: 8,
    },
    imageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        gap: 4,
    },
    imageBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    vegIcon: {
        width: 14,
        height: 14,
        borderWidth: 1.5,
        borderColor: '#fff',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vegDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },

    // Content Container
    contentContainer: {
        backgroundColor: '#fff',
    },

    // Title Section
    titleSection: {
        padding: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#f8f8f8',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleLeft: {
        flex: 1,
    },
    pizzaName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 6,
        lineHeight: 28,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0C7C59',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        gap: 2,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    reviewsText: {
        fontSize: 12,
        color: '#666',
    },
    description: {
        fontSize: 14,
        color: '#686b78',
        lineHeight: 20,
        marginTop: 12,
        marginBottom: 12,
    },
    quickInfoRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    quickInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    quickInfoText: {
        fontSize: 13,
        color: '#686b78',
        fontWeight: '500',
    },

    // Section Cards
    sectionCard: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#f8f8f8',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    optionsList: {
        gap: 0,
    },

    // Radio Options (Size, Crust)
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    radioOptionSelected: {
        backgroundColor: '#fff5f5',
    },
    radioLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#d4d5d9',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    radioCircleSelected: {
        borderColor: '#cb202d',
        backgroundColor: '#cb202d',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    radioContent: {
        flex: 1,
    },
    radioTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    radioSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    radioPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d2d2d',
    },

    // Checkbox Options (Toppings)
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    checkboxOptionSelected: {
        backgroundColor: '#fff5f5',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d4d5d9',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxSelected: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
    },
    checkboxLeft: {
        flex: 1,
    },
    checkboxTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    checkboxPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    toppingCategoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Ingredients
    ingredientsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ingredientChip: {
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ebebeb',
    },
    ingredientText: {
        fontSize: 13,
        color: '#686b78',
        fontWeight: '500',
    },

    // Floating Footer
    floatingFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0C7C59',
        borderRadius: 10,
        height: 56,
        overflow: 'hidden',
    },
    addButtonLeft: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityBtn: {
        width: 40,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        minWidth: 36,
        textAlign: 'center',
    },
    addButtonRight: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    addButtonPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    bottomSpacing: {
        height: 100,
    },
    loadingText: {
        fontSize: 16,
        color: '#686b78',
        textAlign: 'center',
    },
});