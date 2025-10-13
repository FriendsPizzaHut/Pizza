import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';
import { Typography, Colors, Spacing, BorderRadius, Shadows, createCardStyle } from '../../../constants/designSystem';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { fetchProductsThunk, loadMoreProductsThunk, refreshProductsThunk } from '../../../../redux/thunks/productThunks';
import { setSearchQuery, setCategory } from '../../../../redux/slices/productSlice';
import { addToCartThunk } from '../../../../redux/thunks/cartThunks';
import { selectCartItemCount } from '../../../../redux/slices/cartSlice';
import { Product } from '../../../services/productService';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const { width } = Dimensions.get('window');

// Helper function to get display price from pricing
const getDisplayPrice = (pricing: number | { small?: number; medium?: number; large?: number }): number => {
    if (typeof pricing === 'number') {
        return pricing;
    }
    // For multi-size pricing, return the medium price or smallest available
    return pricing.medium || pricing.small || pricing.large || 0;
};

// Helper function to get original price (for discount display)
const getOriginalPrice = (basePrice: number, discountPercent: number): number | null => {
    if (discountPercent > 0) {
        return parseFloat((basePrice / (1 - discountPercent / 100)).toFixed(2));
    }
    return null;
};

// Helper function to format preparation time
const formatPrepTime = (minutes: number): string => {
    const min = Math.floor(minutes);
    const max = Math.floor(minutes * 1.2); // Add 20% buffer
    return `${min}-${max} min`;
};

export default function MenuScreen() {
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch<AppDispatch>();

    // Redux state
    const {
        products,
        total,
        page,
        hasMore,
        isLoading,
        isLoadingMore,
        isRefreshing,
        error,
        selectedCategory,
        searchQuery: reduxSearchQuery
    } = useSelector((state: RootState) => state.product);

    // Cart state
    const cartItemCount = useSelector(selectCartItemCount);

    // Local search state for immediate UI update
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Fetch products on mount and when filters change
    useFocusEffect(
        useCallback(() => {
            if (isInitialLoad) {
                dispatch(fetchProductsThunk({
                    page: 1,
                    limit: 20,
                    category: selectedCategory !== 'all' ? selectedCategory : undefined,
                    search: reduxSearchQuery || undefined,
                    isAvailable: true // Only show available products to customers
                }));
                setIsInitialLoad(false);
            }
        }, [])
    );

    // Handle category change
    const handleCategoryChange = (category: string) => {
        dispatch(setCategory(category.toLowerCase()));
        dispatch(fetchProductsThunk({
            page: 1,
            limit: 20,
            category: category.toLowerCase() !== 'all' ? category.toLowerCase() : undefined,
            search: reduxSearchQuery || undefined,
            isAvailable: true
        }));
    };

    // Handle search with debouncing
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (localSearchQuery !== reduxSearchQuery) {
                dispatch(setSearchQuery(localSearchQuery));
                dispatch(fetchProductsThunk({
                    page: 1,
                    limit: 20,
                    category: selectedCategory !== 'all' ? selectedCategory : undefined,
                    search: localSearchQuery || undefined,
                    isAvailable: true
                }));
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [localSearchQuery]);

    // Handle refresh
    const handleRefresh = () => {
        dispatch(refreshProductsThunk({
            limit: 20,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: reduxSearchQuery || undefined,
            isAvailable: true
        }));
    };

    // Handle load more
    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore && products.length > 0) {
            dispatch(loadMoreProductsThunk({
                page: page + 1,
                limit: 20,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                search: reduxSearchQuery || undefined,
                isAvailable: true
            }));
        }
    };

    // Handle add to cart
    const handleAddToCart = (product: Product) => {
        // For pizzas, navigate to PizzaDetailsScreen for full customization
        if (product.category === 'pizza') {
            navigation.navigate('PizzaDetails', { pizzaId: product._id });
        } else {
            // Add directly to cart for single-price items (drinks, sides, desserts)
            dispatch(addToCartThunk({
                productId: product._id,
                quantity: 1
            }))
                .unwrap()
                .then(() => {
                    Alert.alert('Success', `${product.name} added to cart!`);
                })
                .catch((error) => {
                    Alert.alert('Error', error || 'Failed to add item to cart');
                });
        }
    };

    // Static fallback data for favorites (these can be recently ordered items from user's history in future)
    const favoriteItems = [
        {
            id: 'fav1',
            name: 'Margherita',
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=150&h=150&fit=crop',
            lastOrdered: '2 days ago',
            orderCount: 8
        },
        {
            id: 'fav2',
            name: 'Pepperoni',
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=150&h=150&fit=crop',
            lastOrdered: '5 days ago',
            orderCount: 6
        },
        {
            id: 'fav3',
            name: 'Veggie Supreme',
            image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=150&h=150&fit=crop',
            lastOrdered: '1 week ago',
            orderCount: 4
        },
        {
            id: 'fav4',
            name: 'BBQ Chicken',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop',
            lastOrdered: '1 week ago',
            orderCount: 3
        }
    ];

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push('⭐');
        }
        if (hasHalfStar) {
            stars.push('⭐');
        }
        return stars.join('');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationLabel}>Deliver to</Text>
                        <Text style={styles.locationText}>📍 Home - New York</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cartButtonClean}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <MaterialIcons name="shopping-cart" size={24} color="#2d2d2d" />
                        {cartItemCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={Colors.text.tertiary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for pizzas..."
                        placeholderTextColor="#999"
                        value={localSearchQuery}
                        onChangeText={setLocalSearchQuery}
                    />
                </View>
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                <View style={styles.categories}>
                    {['All', 'Pizza', 'Sides', 'Beverages', 'Desserts'].map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category.toLowerCase() && styles.activeCategoryChip
                            ]}
                            onPress={() => handleCategoryChange(category)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category.toLowerCase() && styles.activeCategoryText
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView
                style={styles.menuList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
                    if (isCloseToBottom) {
                        handleLoadMore();
                    }
                }}
                scrollEventThrottle={400}
            >
                {/* Favorite Orders Section */}
                <View style={styles.favoritesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.favoritesTitle}>Your Favorites</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.favoritesContainer}
                    >
                        {favoriteItems.map((favorite) => (
                            <TouchableOpacity
                                key={favorite.id}
                                style={styles.favoriteCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    // Find the corresponding menu item and navigate
                                    const menuItem = products.find(item =>
                                        item.name.toLowerCase().includes(favorite.name.toLowerCase())
                                    );
                                    if (menuItem) {
                                        navigation.navigate('PizzaDetails', { pizzaId: menuItem._id });
                                    }
                                }}
                            >
                                <View style={styles.favoriteImageContainer}>
                                    <Image
                                        source={{ uri: favorite.image }}
                                        style={styles.favoriteImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.favoriteOrderBadge}>
                                        <Text style={styles.favoriteOrderBadgeText}>{favorite.orderCount}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.favoriteAddButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            console.log(`Added ${favorite.name} to cart`);
                                        }}
                                    >
                                        <Text style={styles.favoriteAddText}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.favoriteInfo}>
                                    <Text style={styles.favoriteName} numberOfLines={1}>
                                        {favorite.name}
                                    </Text>
                                    <View style={styles.favoriteStatsRow}>
                                        <Text style={styles.favoriteDetails}>
                                            {favorite.orderCount}x ordered
                                        </Text>
                                        <Text style={styles.favoriteDot}>•</Text>
                                        <Text style={styles.favoriteLastOrder}>
                                            {favorite.lastOrdered}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Our Delicious Menu</Text>
                    <Text style={styles.sectionSubtitle}>
                        {isLoading ? 'Loading...' : `${total} ${total === 1 ? 'item' : 'items'} ready to order`}
                    </Text>

                    {/* Loading State */}
                    {isLoading && products.length === 0 && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading delicious menu...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {error && products.length === 0 && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && products.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>🍕</Text>
                            <Text style={styles.emptyTitle}>No items found</Text>
                            <Text style={styles.emptySubtitle}>
                                {reduxSearchQuery
                                    ? 'Try adjusting your search or filters'
                                    : 'Check back soon for delicious items!'}
                            </Text>
                        </View>
                    )}

                    {/* Menu Items */}
                    {products.map((item: Product) => {
                        const displayPrice = getDisplayPrice(item.pricing);
                        const originalPrice = getOriginalPrice(displayPrice, item.discountPercent);
                        const prepTime = item.preparationTime || 20; // Default 20 minutes

                        return (
                            <TouchableOpacity
                                key={item._id}
                                style={styles.menuItem}
                                onPress={() => {
                                    // Only navigate to PizzaDetails for pizza items
                                    if (item.category === 'pizza') {
                                        navigation.navigate('PizzaDetails', { pizzaId: item._id });
                                    }
                                    // For other items, do nothing on card press - they use ADD button
                                }}
                                activeOpacity={item.category === 'pizza' ? 0.95 : 1}
                            >
                                {/* Image Section at Top */}
                                <View style={styles.imageSection}>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.pizzaImage}
                                        resizeMode="cover"
                                        defaultSource={require('../../../../assets/adaptive-icon.png')}
                                    />

                                    {/* Badges over image */}
                                    <View style={styles.badgesContainer}>
                                        <View style={[
                                            styles.vegIndicator,
                                            { borderColor: item.isVegetarian ? '#0F8A65' : '#D32F2F' }
                                        ]}>
                                            <View style={[
                                                styles.vegDot,
                                                { backgroundColor: item.isVegetarian ? '#0F8A65' : '#D32F2F' }
                                            ]} />
                                        </View>
                                        {item.rating >= 4.5 && (
                                            <View style={styles.bestsellerBadge}>
                                                <Text style={styles.bestsellerText}>BESTSELLER</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Discount badge */}
                                    {item.discountPercent > 0 && (
                                        <View style={styles.discountBadgeTop}>
                                            <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
                                        </View>
                                    )}

                                    {/* ADD button over image */}
                                    <TouchableOpacity
                                        style={styles.addButtonOverlay}
                                        activeOpacity={0.8}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(item);
                                        }}
                                    >
                                        <Text style={styles.addButtonText}>ADD</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Content Section Below Image */}
                                <View style={styles.contentSection}>
                                    {/* Item Name */}
                                    <Text style={styles.itemName}>{item.name}</Text>

                                    {/* Rating and Time */}
                                    <View style={styles.ratingContainer}>
                                        <View style={styles.ratingBadge}>
                                            <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                                        </View>
                                        <Text style={styles.reviews}>
                                            ({item.salesCount > 0 ? item.salesCount : 'New'})
                                        </Text>
                                        <Text style={styles.preparationTime}>• {formatPrepTime(prepTime)}</Text>
                                    </View>

                                    {/* Description */}
                                    <Text style={styles.itemDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>

                                    {/* Price Section */}
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.itemPrice}>₹{displayPrice.toFixed(0)}</Text>
                                        {originalPrice && (
                                            <Text style={styles.originalPrice}>₹{originalPrice.toFixed(0)}</Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Load More Indicator */}
                    {isLoadingMore && (
                        <View style={styles.loadMoreContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadMoreText}>Loading more items...</Text>
                        </View>
                    )}

                    {/* End of List Message */}
                    {!isLoading && !isLoadingMore && products.length > 0 && !hasMore && (
                        <View style={styles.endOfListContainer}>
                            <Text style={styles.endOfListText}>🎉 You've seen all items!</Text>
                        </View>
                    )}
                </View>

                {/* Bottom spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: 'transparent',
        paddingBottom: Spacing.sm,
        paddingTop: 50,
        paddingHorizontal: Spacing.xl,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    locationContainer: {
        flex: 1,
    },
    locationLabel: {
        ...Typography.regular.text200,
        color: Colors.text.secondary,
        marginBottom: 2,
    },
    locationText: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
    },
    cartButtonClean: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#cb202d',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 45,
        ...Shadows.sm,
    },
    searchIcon: {
        ...Typography.regular.text400,
        marginRight: Spacing.sm,
        color: Colors.text.secondary,
    },
    searchInput: {
        flex: 1,
        ...Typography.regular.text400,
        color: Colors.text.primary,
    },
    categoriesContainer: {
        backgroundColor: 'transparent',
        paddingVertical: Spacing.xs,
        maxHeight: 50,
    },
    categories: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        height: 30,
    },
    categoryChip: {
        backgroundColor: Colors.grey.grey100,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border.light,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
        ...Shadows.sm,
    },
    activeCategoryChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        ...Typography.medium.text200,
        color: Colors.text.primary,
    },
    activeCategoryText: {
        color: Colors.surface,
    },
    menuList: {
        flex: 1,
    },
    menuSection: {
        padding: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.semibold.text600,
        color: Colors.text.primary,
        marginBottom: Spacing.xl,
    },
    menuItem: {
        ...createCardStyle('md'),
        marginBottom: Spacing.lg,
        overflow: 'hidden',
    },
    imageSection: {
        position: 'relative',
        height: 200,
        backgroundColor: Colors.grey.grey100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentSection: {
        padding: Spacing.lg,
    },
    vegIndicator: {
        width: 16,
        height: 16,
        borderRadius: BorderRadius.sm,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    vegDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    discountBadge: {
        backgroundColor: Colors.yellow.yellow500,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        marginLeft: 6,
    },
    bestsellerBadge: {
        backgroundColor: Colors.yellow.yellow600,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    bestsellerText: {
        ...Typography.semibold.text100,
        color: Colors.surface,
        letterSpacing: 0.3,
    },
    discountText: {
        ...Typography.semibold.text100,
        color: Colors.surface,
    },
    itemName: {
        ...Typography.semibold.text500,
        color: Colors.text.primary,
        marginBottom: 6,
        lineHeight: 22,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingBadge: {
        backgroundColor: Colors.success,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 1,
        marginRight: 6,
    },
    ratingText: {
        ...Typography.semibold.text100,
        color: Colors.surface,
    },
    reviews: {
        ...Typography.regular.text200,
        color: Colors.text.secondary,
        marginRight: Spacing.xs,
    },
    itemDescription: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    preparationTime: {
        ...Typography.regular.text200,
        color: Colors.text.secondary,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    itemPrice: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginRight: Spacing.sm,
    },
    originalPrice: {
        ...Typography.regular.text300,
        color: Colors.text.tertiary,
        textDecorationLine: 'line-through',
    },
    pizzaImageBackground: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    pizzaImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.lg,
    },
    badgesContainer: {
        position: 'absolute',
        top: Spacing.md,
        left: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    discountBadgeTop: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        backgroundColor: Colors.warning,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    addButtonOverlay: {
        position: 'absolute',
        bottom: Spacing.md,
        right: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        ...Shadows.lg,
    },
    addButtonText: {
        ...Typography.semibold.text200,
        color: Colors.surface,
    },
    bottomSpacing: {
        height: 40,
    },
    // Favorites Section
    favoritesSection: {
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl + 8, // Extra space for card shadows
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.light,
    },
    sectionHeader: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    favoritesTitle: {
        ...Typography.semibold.text700,
        color: Colors.text.primary,
        letterSpacing: -0.3,
    },
    seeAllText: {
        ...Typography.medium.text300,
        color: Colors.primary,
    },
    favoritesContainer: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.sm, // Extra space for shadows to appear properly
    },
    favoriteCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        marginRight: Spacing.lg,
        width: 150,
        borderWidth: 1,
        borderColor: Colors.border.light,
        ...Shadows.md,
        overflow: 'hidden',
    },
    favoriteImageContainer: {
        position: 'relative',
        height: 100,
    },
    favoriteImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.grey.grey100,
    },
    favoriteOrderBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    favoriteOrderBadgeText: {
        ...Typography.semibold.text100,
        color: Colors.surface,
        fontSize: 10,
    },
    favoriteAddButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    favoriteAddText: {
        ...Typography.semibold.text300,
        color: Colors.surface,
        fontSize: 16,
        lineHeight: 16,
    },
    favoriteInfo: {
        padding: Spacing.md,
    },
    favoriteName: {
        ...Typography.semibold.text400,
        color: Colors.text.primary,
        marginBottom: 6,
    },
    favoriteStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favoriteDetails: {
        ...Typography.regular.text200,
        color: Colors.primary,
        fontSize: 11,
        fontWeight: '600',
    },
    favoriteDot: {
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
        marginHorizontal: 4,
        fontSize: 12,
    },
    favoriteLastOrder: {
        ...Typography.regular.text200,
        color: Colors.text.tertiary,
        fontSize: 11,
    },
    sectionSubtitle: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        marginBottom: Spacing.lg,
    },
    // Loading, Error, Empty States
    loadingContainer: {
        paddingVertical: Spacing.xl * 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        ...Typography.regular.text400,
        color: Colors.text.secondary,
        marginTop: Spacing.md,
    },
    errorContainer: {
        paddingVertical: Spacing.xl * 2,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        ...Typography.regular.text400,
        color: Colors.error,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        ...Typography.semibold.text400,
        color: Colors.surface,
    },
    emptyContainer: {
        paddingVertical: Spacing.xl * 2,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        ...Typography.semibold.text500,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        ...Typography.regular.text400,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    loadMoreContainer: {
        paddingVertical: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreText: {
        ...Typography.regular.text300,
        color: Colors.text.secondary,
        marginLeft: Spacing.sm,
    },
    endOfListContainer: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    endOfListText: {
        ...Typography.regular.text400,
        color: Colors.text.secondary,
    },
});