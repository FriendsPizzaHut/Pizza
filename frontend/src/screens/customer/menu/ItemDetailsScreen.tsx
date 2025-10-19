import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Animated, Image, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { CustomerStackParamList } from '../../../types/navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { fetchProductByIdThunk } from '../../../../redux/thunks/productThunks';
import { addToCartThunk } from '../../../../redux/thunks/cartThunks';

type ItemDetailsRouteProp = RouteProp<CustomerStackParamList, 'ItemDetails'>;

export default function ItemDetailsScreen() {
    const route = useRoute<ItemDetailsRouteProp>();
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const { itemId } = route.params;

    const [quantity, setQuantity] = useState(1);
    const [scrollY] = useState(new Animated.Value(0));
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Get product from Redux store
    const product = useSelector((state: RootState) =>
        state.product.products.find(p => p._id === itemId)
    );

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                await dispatch(fetchProductByIdThunk(itemId));
            } catch (error) {
                console.error('Error fetching product:', error);
                Alert.alert('Error', 'Failed to load product details');
            } finally {
                setIsLoading(false);
            }
        };

        if (!product) {
            fetchProduct();
        } else {
            setIsLoading(false);
        }
    }, [itemId]);

    // Get single price
    const getPrice = () => {
        if (!product) return 0;
        return typeof product.pricing === 'number' ? product.pricing : product.basePrice;
    };

    const price = getPrice();

    const calculateTotalPrice = () => {
        return price * quantity;
    };

    const addToCart = async () => {
        if (!product || isAddingToCart) return;

        setIsAddingToCart(true);

        try {
            await dispatch(addToCartThunk({
                productId: product._id,
                quantity,
            })).unwrap();

            Alert.alert(
                'Added to Cart!',
                `${quantity}x ${product.name} has been added to your cart.`,
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

    if (isLoading || !product) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#cb202d" />
                <Text style={styles.loadingText}>Loading item details...</Text>
            </View>
        );
    }

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

    // Get category-specific icon and color
    const getCategoryConfig = () => {
        switch (product.category) {
            case 'beverages':
                return { icon: 'local-drink', color: '#FF9800', bgColor: '#FFF3E0' };
            case 'desserts':
                return { icon: 'cake', color: '#E91E63', bgColor: '#FCE4EC' };
            case 'sides':
                return { icon: 'restaurant', color: '#FF5722', bgColor: '#FBE9E7' };
            default:
                return { icon: 'fastfood', color: '#4CAF50', bgColor: '#E8F5E9' };
        }
    };

    const categoryConfig = getCategoryConfig();

    // Get nutritional info if available
    const getNutritionalInfo = () => {
        const info = [];

        if (product.category === 'beverages') {
            info.push({ label: 'Volume', value: '500ml', icon: 'local-drink' });
            info.push({ label: 'Chilled', value: 'Yes', icon: 'ac-unit' });
        } else if (product.category === 'desserts') {
            info.push({ label: 'Sweetness', value: 'Medium', icon: 'cake' });
            info.push({ label: 'Serving', value: '1 piece', icon: 'restaurant' });
        } else if (product.category === 'sides') {
            info.push({ label: 'Portion', value: 'Regular', icon: 'restaurant' });
            info.push({ label: 'Serves', value: '1-2', icon: 'people' });
        }

        return info;
    };

    const nutritionalInfo = getNutritionalInfo();

    // Get ingredients based on category (since ingredients field doesn't exist in Product model)
    const getIngredients = () => {
        // Generate default ingredients based on category and product name
        if (product.category === 'beverages') {
            return ['Water', 'Sugar', 'Natural Flavors', 'Carbon Dioxide'];
        } else if (product.category === 'desserts') {
            return ['Flour', 'Sugar', 'Butter', 'Eggs', 'Vanilla Extract'];
        } else if (product.category === 'sides') {
            return ['Premium Ingredients', 'Special Spices', 'Refined Oil', 'Salt'];
        }

        return [];
    };

    const ingredients = getIngredients();

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
                <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
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
                    <View style={styles.itemImageContainer}>
                        <Image
                            source={{ uri: product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Floating Back Button */}
                    <TouchableOpacity
                        style={styles.floatingBackButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Badges on Image */}
                    <View style={styles.imageBadges}>
                        {product.isVegetarian && (
                            <View style={[styles.imageBadge, { backgroundColor: '#0C7C59' }]}>
                                <View style={styles.vegIcon}>
                                    <View style={styles.vegDot} />
                                </View>
                                <Text style={styles.imageBadgeText}>Pure Veg</Text>
                            </View>
                        )}
                        <View style={[styles.imageBadge, { backgroundColor: categoryConfig.color }]}>
                            <MaterialIcons name={categoryConfig.icon as any} size={14} color="#fff" />
                            <Text style={styles.imageBadgeText}>
                                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Main Content */}
                <View style={styles.contentContainer}>
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <View style={styles.titleLeft}>
                                <Text style={styles.itemName}>{product.name}</Text>
                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingBadge}>
                                        <MaterialIcons name="star" size={14} color="#fff" />
                                        <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                                    </View>
                                    <Text style={styles.reviewsText}>({product.salesCount || 0} orders)</Text>
                                </View>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceLabel}>Price</Text>
                                <Text style={styles.priceValue}>₹{price.toFixed(0)}</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>{product.description}</Text>

                        {/* Quick Info */}
                        <View style={styles.quickInfoRow}>
                            <View style={styles.quickInfoItem}>
                                <MaterialIcons name="access-time" size={16} color="#cb202d" />
                                <Text style={styles.quickInfoText}>{product.preparationTime || 15} mins</Text>
                            </View>
                            {product.isAvailable ? (
                                <View style={styles.quickInfoItem}>
                                    <MaterialIcons name="check-circle" size={16} color="#0C7C59" />
                                    <Text style={[styles.quickInfoText, { color: '#0C7C59' }]}>Available</Text>
                                </View>
                            ) : (
                                <View style={styles.quickInfoItem}>
                                    <MaterialIcons name="cancel" size={16} color="#F44336" />
                                    <Text style={[styles.quickInfoText, { color: '#F44336' }]}>Out of Stock</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Nutritional Info */}
                    {nutritionalInfo.length > 0 && (
                        <View style={styles.sectionCard}>
                            <Text style={styles.cardTitle}>Product Information</Text>
                            <View style={styles.infoGrid}>
                                {nutritionalInfo.map((info, index) => (
                                    <View key={index} style={styles.infoItem}>
                                        <View style={[styles.infoIconContainer, { backgroundColor: categoryConfig.bgColor }]}>
                                            <MaterialIcons name={info.icon as any} size={20} color={categoryConfig.color} />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>{info.label}</Text>
                                            <Text style={styles.infoValue}>{info.value}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Ingredients */}
                    {ingredients.length > 0 && (
                        <View style={styles.sectionCard}>
                            <Text style={styles.cardTitle}>Ingredients</Text>
                            <Text style={styles.cardSubtitle}>What's inside</Text>
                            <View style={styles.ingredientsGrid}>
                                {ingredients.map((ingredient, index) => (
                                    <View key={index} style={styles.ingredientChip}>
                                        <MaterialIcons name="fiber-manual-record" size={8} color="#cb202d" />
                                        <Text style={styles.ingredientText}>{ingredient}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Popular Pairings */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.cardTitle}>Perfect With</Text>
                        <Text style={styles.cardSubtitle}>Customers often order these together</Text>
                        <View style={styles.pairingsContainer}>
                            <View style={styles.pairingChip}>
                                <MaterialIcons name="local-pizza" size={16} color="#cb202d" />
                                <Text style={styles.pairingText}>Any Pizza</Text>
                            </View>
                            {product.category !== 'beverages' && (
                                <View style={styles.pairingChip}>
                                    <MaterialIcons name="local-drink" size={16} color="#FF9800" />
                                    <Text style={styles.pairingText}>Cold Drink</Text>
                                </View>
                            )}
                            {product.category === 'beverages' && (
                                <View style={styles.pairingChip}>
                                    <MaterialIcons name="restaurant" size={16} color="#FF5722" />
                                    <Text style={styles.pairingText}>Sides</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Why Choose This */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.cardTitle}>Why Choose This?</Text>
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <MaterialIcons name="verified" size={20} color="#0C7C59" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Premium Quality</Text>
                                    <Text style={styles.featureDescription}>Made with finest ingredients</Text>
                                </View>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <MaterialIcons name="schedule" size={20} color="#2196F3" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Fresh & Quick</Text>
                                    <Text style={styles.featureDescription}>Prepared on-demand</Text>
                                </View>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <MaterialIcons name="thumb-up" size={20} color="#FF9800" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Customer Favorite</Text>
                                    <Text style={styles.featureDescription}>Highly rated by customers</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
                </View>
            </Animated.ScrollView>

            {/* Floating Add to Cart Button */}
            <View style={styles.floatingFooter}>
                <TouchableOpacity
                    style={[styles.addButton, !product.isAvailable && styles.addButtonDisabled]}
                    onPress={addToCart}
                    disabled={!product.isAvailable || isAddingToCart}
                >
                    <View style={styles.addButtonLeft}>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityBtn}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={!product.isAvailable}
                            >
                                <MaterialIcons name="remove" size={20} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.quantityDivider} />
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <View style={styles.quantityDivider} />
                            <TouchableOpacity
                                style={styles.quantityBtn}
                                onPress={() => setQuantity(quantity + 1)}
                                disabled={!product.isAvailable}
                            >
                                <MaterialIcons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.addButtonRight}>
                        <Text style={styles.addButtonText}>
                            {!product.isAvailable ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add item'}
                        </Text>
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
    itemImageContainer: {
        flex: 1,
        width: '100%',
    },
    itemImage: {
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
    itemName: {
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
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#cb202d',
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

    // Info Grid
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
        minWidth: '45%',
        gap: 12,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
    },

    // Ingredients
    ingredientsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ingredientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ebebeb',
        gap: 6,
    },
    ingredientText: {
        fontSize: 13,
        color: '#686b78',
        fontWeight: '500',
    },

    // Pairings
    pairingsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pairingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5f5',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffebeb',
        gap: 6,
    },
    pairingText: {
        fontSize: 13,
        color: '#2d2d2d',
        fontWeight: '600',
    },

    // Features List
    featuresList: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
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
    addButtonDisabled: {
        backgroundColor: '#999',
        opacity: 0.6,
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
        marginTop: 12,
    },
});
