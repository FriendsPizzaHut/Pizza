import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Animated, Image, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { CustomerStackParamList } from '../../../types/navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { fetchProductByIdThunk } from '../../../../redux/thunks/productThunks';
import { addToCartThunk } from '../../../../redux/thunks/cartThunks';
import { Product } from '../../../services/productService';
import { getRestaurantSettings, Topping as AvailableTopping } from '../../../services/restaurantSettingsService';

type PizzaDetailsRouteProp = RouteProp<CustomerStackParamList, 'PizzaDetails'>;

export default function PizzaDetailsScreen() {
    const route = useRoute<PizzaDetailsRouteProp>();
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const { pizzaId } = route.params;

    console.log('🍕 PizzaDetailsScreen mounted with pizzaId:', pizzaId);

    const [selectedSize, setSelectedSize] = useState(0);
    const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [scrollY] = useState(new Animated.Value(0));
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [availableToppings, setAvailableToppings] = useState<AvailableTopping[]>([]);

    // Get product from Redux store (check both products array and selectedProduct)
    const product = useSelector((state: RootState) =>
        state.product.products.find(p => p._id === pizzaId)
    );

    const selectedProduct = useSelector((state: RootState) => state.product.selectedProduct);
    const totalProductsInStore = useSelector((state: RootState) => state.product.products.length);
    const allProductIds = useSelector((state: RootState) =>
        state.product.products.map(p => p._id).slice(0, 5)
    );

    // Use product from products array, or fallback to selectedProduct if ID matches
    const displayProduct = product || (selectedProduct?._id === pizzaId ? selectedProduct : null);

    console.log('🔍 Product lookup in Redux store:', {
        pizzaId,
        productFound: !!product,
        selectedProductId: selectedProduct?._id,
        selectedProductMatches: selectedProduct?._id === pizzaId,
        displayProductFound: !!displayProduct,
        productId: displayProduct?._id,
        productName: displayProduct?.name,
        totalProductsInStore,
        firstFiveProductIds: allProductIds
    });

    // Fetch product data and available toppings
    useEffect(() => {
        console.log('🔄 useEffect triggered - pizzaId:', pizzaId, 'displayProduct exists:', !!displayProduct);

        const fetchData = async () => {
            console.log('📡 Starting data fetch for pizzaId:', pizzaId);
            setIsLoading(true);
            try {
                // Fetch product if not in store
                if (!displayProduct) {
                    console.log('⚠️ Product not in store, fetching from API...');
                    const result = await dispatch(fetchProductByIdThunk(pizzaId));
                    console.log('✅ fetchProductByIdThunk completed:', { success: !!result });
                } else {
                    console.log('✅ Product found in store, using cached data');
                }

                // Fetch available toppings from restaurant settings
                console.log('📡 Fetching available toppings from restaurant settings...');
                const settings = await getRestaurantSettings();
                const activeToppings = settings.availableToppings.filter((t: AvailableTopping) => t.isActive);
                console.log('✅ Available toppings fetched:', activeToppings.length, 'active toppings');
                setAvailableToppings(activeToppings);

            } catch (error) {
                console.error('❌ Error fetching data:', error);
                Alert.alert('Error', 'Failed to load product details');
            } finally {
                console.log('🏁 Setting isLoading to false');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [pizzaId]);

    const toggleTopping = (index: number) => {
        setSelectedToppings(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    // Parse sizes from product.pricing
    const getSizes = () => {
        if (!displayProduct || typeof displayProduct.pricing === 'number') {
            return [{ name: 'Regular', price: 0, servings: '1-2 people' }];
        }

        const sizes = [];
        if (displayProduct.pricing.small !== undefined) {
            sizes.push({ name: 'Small', price: displayProduct.pricing.small, servings: '1-2 people' });
        }
        if (displayProduct.pricing.medium !== undefined) {
            sizes.push({ name: 'Medium', price: displayProduct.pricing.medium, servings: '2-3 people' });
        }
        if (displayProduct.pricing.large !== undefined) {
            sizes.push({ name: 'Large', price: displayProduct.pricing.large, servings: '3-4 people' });
        }

        return sizes.length > 0 ? sizes : [{ name: 'Regular', price: displayProduct.basePrice, servings: '1-2 people' }];
    };

    // Get toppings with prices from restaurant settings
    const getToppings = () => {
        if (!displayProduct || !displayProduct.toppings) return [];

        return displayProduct.toppings.map((topping, index) => {
            // Find matching topping in availableToppings to get the real price
            const availableTopping = availableToppings.find(
                at => at.name.toLowerCase() === topping.name.toLowerCase()
            );

            return {
                name: topping.name,
                price: availableTopping?.price || 0, // Use real price from restaurant settings, fallback to 0
                category: topping.category || availableTopping?.category || 'Other',
                index
            };
        });
    };

    const sizes = getSizes();
    const toppings = getToppings();

    const calculateTotalPrice = () => {
        if (!displayProduct) return 0;

        const sizePrice = sizes[selectedSize]?.price || 0;
        const toppingsPrice = selectedToppings.reduce((sum, index) => {
            const topping = toppings[index];
            return sum + (topping?.price || 0);
        }, 0);

        return (sizePrice + toppingsPrice) * quantity;
    };

    const addToCart = async () => {
        if (!displayProduct || isAddingToCart) return;

        setIsAddingToCart(true);

        try {
            // Prepare cart item data
            const sizeName = sizes[selectedSize]?.name;
            const customToppings = selectedToppings.map(index => ({
                name: toppings[index].name,
                category: toppings[index].category,
                price: toppings[index].price
            }));

            await dispatch(addToCartThunk({
                productId: displayProduct._id,
                quantity,
                size: sizeName?.toLowerCase() as 'small' | 'medium' | 'large' | undefined,
                customToppings: customToppings.length > 0 ? customToppings : undefined,
            })).unwrap();

            Alert.alert(
                'Added to Cart!',
                `${quantity}x ${displayProduct.name}${sizeName ? ` (${sizeName})` : ''} has been added to your cart.`,
                [
                    { text: 'Continue Shopping', onPress: () => navigation.goBack(), style: 'cancel' },
                    { text: 'View Cart', onPress: () => (navigation as any).navigate('Cart') },
                ]
            );
        } catch (error: any) {
            const errorMessage = error?.message || 'Failed to add item to cart';

            // Handle token expiration
            if (errorMessage.includes('Token expired') || errorMessage.includes('Session expired')) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please login again.',
                    [
                        {
                            text: 'Login',
                            onPress: () => {
                                // Navigate to login screen
                                (navigation as any).reset({
                                    index: 0,
                                    routes: [{ name: 'Auth' }],
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (isLoading || !displayProduct) {
        console.log('⏳ Showing loading screen - isLoading:', isLoading, 'displayProduct exists:', !!displayProduct);
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#cb202d" />
                <Text style={styles.loadingText}>Loading pizza details...</Text>
            </View>
        );
    }

    console.log('✅ Rendering full pizza details for:', displayProduct.name);

    const toppingsByCategory = toppings.reduce((acc, topping) => {
        const category = topping.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(topping);
        return acc;
    }, {} as Record<string, typeof toppings>);

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
                <Text style={styles.headerTitle} numberOfLines={1}>{displayProduct.name}</Text>
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
                            source={{ uri: displayProduct.imageUrl || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' }}
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
                        {displayProduct.isVegetarian && (
                            <View style={[styles.imageBadge, { backgroundColor: '#0C7C59' }]}>
                                <View style={styles.vegIcon}>
                                    <View style={styles.vegDot} />
                                </View>
                                <Text style={styles.imageBadgeText}>Pure Veg</Text>
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
                                <Text style={styles.pizzaName}>{displayProduct.name}</Text>
                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingBadge}>
                                        <MaterialIcons name="star" size={14} color="#fff" />
                                        <Text style={styles.ratingText}>{displayProduct.rating.toFixed(1)}</Text>
                                    </View>
                                    <Text style={styles.reviewsText}>({displayProduct.salesCount || 0} orders)</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.description}>{displayProduct.description}</Text>

                        {/* Quick Info */}
                        <View style={styles.quickInfoRow}>
                            <View style={styles.quickInfoItem}>
                                <MaterialIcons name="access-time" size={16} color="#cb202d" />
                                <Text style={styles.quickInfoText}>{displayProduct.preparationTime || 20} mins</Text>
                            </View>
                        </View>
                    </View>

                    {/* Size Selection - Zomato Style */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.cardTitle}>Choose Size</Text>
                        <Text style={styles.cardSubtitle}>Select 1 option</Text>
                        <View style={styles.optionsList}>
                            {sizes.map((size, index) => (
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
                                        ₹{size.price.toFixed(0)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Extra Toppings */}
                    {toppings.length > 0 && (
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
                                                <Text style={styles.radioPrice}>₹{topping.price.toFixed(0)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

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
                        <Text style={styles.addButtonText}>{isAddingToCart ? 'Adding...' : 'Add item'}</Text>
                        <Text style={styles.addButtonPrice}>₹{calculateTotalPrice().toFixed(0)}</Text>
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