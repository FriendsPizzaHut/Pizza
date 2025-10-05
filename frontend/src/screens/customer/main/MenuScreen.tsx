import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';
import { Typography, Colors, Spacing, BorderRadius, Shadows, createCardStyle } from '../../../constants/designSystem';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const { width } = Dimensions.get('window');

export default function MenuScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const menuItems = [
        {
            id: 'margherita',
            name: 'Margherita Classic',
            description: 'Fresh mozzarella, tomato sauce, basil leaves',
            price: 12.99,
            originalPrice: 15.99,
            rating: 4.5,
            reviews: 256,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            isVeg: true,
            preparationTime: '15-20 min',
            discount: '20% OFF'
        },
        {
            id: 'pepperoni',
            name: 'Pepperoni Deluxe',
            description: 'Premium pepperoni, mozzarella, spicy tomato sauce',
            price: 14.99,
            originalPrice: 17.99,
            rating: 4.7,
            reviews: 342,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            isVeg: false,
            preparationTime: '18-25 min',
            discount: '15% OFF'
        },
        {
            id: 'vegetarian',
            name: 'Veggie Supreme',
            description: 'Bell peppers, mushrooms, onions, olives, corn',
            price: 16.99,
            originalPrice: 19.99,
            rating: 4.3,
            reviews: 189,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            isVeg: true,
            preparationTime: '20-25 min',
            discount: '25% OFF'
        },
        {
            id: 'meatlover',
            name: 'Meat Lovers Paradise',
            description: 'Pepperoni, sausage, bacon, chicken, beef',
            price: 18.99,
            originalPrice: 22.99,
            rating: 4.8,
            reviews: 428,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            isVeg: false,
            preparationTime: '25-30 min',
            discount: '30% OFF'
        },
    ];

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>0</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={Colors.text.tertiary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for pizzas..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                <View style={styles.categories}>
                    {['All', 'Vegetarian', 'Non-Veg', 'Bestseller', 'New'].map((category, index) => (
                        <TouchableOpacity key={index} style={[styles.categoryChip, index === 0 && styles.activeCategoryChip]}>
                            <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
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
                        {[
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
                        ].map((favorite) => (
                            <TouchableOpacity
                                key={favorite.id}
                                style={styles.favoriteCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    // Find the corresponding menu item and navigate
                                    const menuItem = menuItems.find(item =>
                                        item.name.toLowerCase().includes(favorite.name.toLowerCase())
                                    );
                                    if (menuItem) {
                                        navigation.navigate('PizzaDetails', { pizzaId: menuItem.id });
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
                        {filteredItems.length} handcrafted pizzas ready to order
                    </Text>

                    {filteredItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('PizzaDetails', { pizzaId: item.id })}
                            activeOpacity={0.95}
                        >
                            {/* Image Section at Top */}
                            <View style={styles.imageSection}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.pizzaImage}
                                    resizeMode="cover"
                                />

                                {/* Badges over image */}
                                <View style={styles.badgesContainer}>
                                    <View style={[styles.vegIndicator, { borderColor: item.isVeg ? '#0F8A65' : '#D32F2F' }]}>
                                        <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#0F8A65' : '#D32F2F' }]} />
                                    </View>
                                    {item.rating >= 4.5 && (
                                        <View style={styles.bestsellerBadge}>
                                            <Text style={styles.bestsellerText}>BESTSELLER</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Discount badge */}
                                {item.discount && (
                                    <View style={styles.discountBadgeTop}>
                                        <Text style={styles.discountText}>{item.discount}</Text>
                                    </View>
                                )}

                                {/* ADD button over image */}
                                <TouchableOpacity style={styles.addButtonOverlay} activeOpacity={0.8}>
                                    <Text style={styles.addButtonText}>ADD</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Content Section Below Image */}
                            <View style={styles.contentSection}>
                                {/* Pizza Name */}
                                <Text style={styles.itemName}>{item.name}</Text>

                                {/* Rating and Time */}
                                <View style={styles.ratingContainer}>
                                    <View style={styles.ratingBadge}>
                                        <Text style={styles.ratingText}>★ {item.rating}</Text>
                                    </View>
                                    <Text style={styles.reviews}>({item.reviews})</Text>
                                    <Text style={styles.preparationTime}>• {item.preparationTime}</Text>
                                </View>

                                {/* Description */}
                                <Text style={styles.itemDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>

                                {/* Price Section */}
                                <View style={styles.priceContainer}>
                                    <Text style={styles.itemPrice}>${item.price}</Text>
                                    {item.originalPrice && (
                                        <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom spacing for floating cart */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Floating Cart Button */}
            <TouchableOpacity
                style={styles.floatingCartButton}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.9}
            >
                <View style={styles.cartContent}>
                    <View style={styles.cartLeft}>
                        <View style={styles.floatingCartBadge}>
                            <Text style={styles.floatingCartBadgeText}>3</Text>
                        </View>
                        <Text style={styles.cartText}>View Cart</Text>
                    </View>
                    <Text style={styles.cartTotal}>$47.97</Text>
                </View>
            </TouchableOpacity>
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
        height: 100,
    },
    floatingCartButton: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: Spacing.xl,
        right: Spacing.xl,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        ...Shadows.xl,
    },
    cartContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    cartLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    floatingCartBadge: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    floatingCartBadgeText: {
        ...Typography.semibold.text200,
        color: Colors.primary,
    },
    cartText: {
        ...Typography.semibold.text400,
        color: Colors.surface,
    },
    cartTotal: {
        ...Typography.semibold.text400,
        color: Colors.surface,
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
});