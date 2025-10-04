import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Linking,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, clearAuthState } from '../../../../redux/store';
import { logout } from '../../../../redux/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const { width, height } = Dimensions.get('window');

// Simple icon components (replace with react-native-vector-icons if available)
const ChevronRight = ({ size, color }: { size: number; color: string }) => (
    <Text style={{ fontSize: size, color }}>›</Text>
);

const Gift = ({ size, color }: { size: number; color: string }) => (
    <Text style={{ fontSize: size, color }}>🎁</Text>
);

const Flame = ({ size, color }: { size: number; color: string }) => (
    <Text style={{ fontSize: size, color }}>🔥</Text>
);

const Phone = ({ size, color }: { size: number; color: string }) => (
    <Text style={{ fontSize: size, color }}>📞</Text>
);

const ShoppingCart = ({ size, color }: { size: number; color: string }) => (
    <Text style={{ fontSize: size, color }}>🛒</Text>
);

const CheckIcon = ({ size, color }: { size: number; color: string }) => (
    <Text style={{ fontSize: size, color }}>✓</Text>
);

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

// Types
interface Offer {
    _id: string;
    title: string;
    description: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    isActive: boolean;
}

interface HomeOfferItem {
    id: string;
    badge: string;
    title: string;
    subtitle: string;
    code: string;
    bgColor: string;
    gradientColors: readonly [string, string];
}

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isVeg: boolean;
    isAvailable: boolean;
}

interface BusinessProfile {
    name: string;
    address: string;
    phone: string;
    status: {
        isOpen: boolean;
        reason: string;
        manualOverride: boolean;
    };
}

// Constants
const ITEM_WIDTH = width * 0.85;
const SPACING = 15;
const API_URL = process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:3000';

// Simple logger
const logger = {
    log: (...args: any[]) => console.log(...args),
    error: (...args: any[]) => console.error(...args),
    warn: (...args: any[]) => console.warn(...args),
    debug: (...args: any[]) => console.log('[DEBUG]', ...args),
};

// Cache configuration
const CACHE_KEYS = {
    BUSINESS_PROFILE: 'cache_business_profile',
    OFFERS: 'cache_offers',
    POPULAR_ITEMS: 'cache_popular_items',
};

const CACHE_TTL = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
};

// Simple fetch with retry and caching
async function fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number,
    retries = 3
): Promise<T> {
    // Check cache first
    if (cacheKey && cacheTTL) {
        try {
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < cacheTTL) {
                    return data as T;
                }
            }
        } catch (error) {
            logger.warn('Cache read error:', error);
        }
    }

    // Fetch from API
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache the result
            if (cacheKey) {
                try {
                    await AsyncStorage.setItem(
                        cacheKey,
                        JSON.stringify({ data, timestamp: Date.now() })
                    );
                } catch (error) {
                    logger.warn('Cache write error:', error);
                }
            }

            return data as T;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }

    throw new Error('Max retries exceeded');
}


export default function CustomerHomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { name } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    // State management
    const scrollX = useRef(new Animated.Value(0)).current;
    const [activeOfferIndex, setActiveOfferIndex] = useState(0);
    const [offers, setOffers] = useState<HomeOfferItem[]>([]);
    const [loadingOffers, setLoadingOffers] = useState(true);
    const [offerError, setOfferError] = useState<string | null>(null);
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
    const [loadingPopularItems, setLoadingPopularItems] = useState(true);
    const [popularItemsError, setPopularItemsError] = useState<string | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [businessProfileLoading, setBusinessProfileLoading] = useState(true);
    const [businessProfileError, setBusinessProfileError] = useState<string | null>(null);
    const [liveStatus, setLiveStatus] = useState<{ isOpen: boolean; reason: string; manualOverride: boolean } | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const userName = name || 'Pizza Lover';

    const offerThemes = [
        {
            bgColor: '#FF5722',
            gradientColors: ['#FF9800', '#FF5722'] as const,
        },
        {
            bgColor: '#2196F3',
            gradientColors: ['#03A9F4', '#1976D2'] as const,
        },
        {
            bgColor: '#4CAF50',
            gradientColors: ['#8BC34A', '#388E3C'] as const,
        },
        {
            bgColor: '#9C27B0',
            gradientColors: ['#BA68C8', '#7B1FA2'] as const,
        },
        {
            bgColor: '#F44336',
            gradientColors: ['#FF5252', '#D32F2F'] as const,
        },
    ];

    // Load static business profile
    useEffect(() => {
        const loadBusinessProfile = () => {
            const staticProfile: BusinessProfile = {
                name: "Friend's Pizza Hut",
                address: '123 Main Street, City Center, Mumbai 400001',
                phone: '+91 98765 43210',
                status: {
                    isOpen: true,
                    reason: '',
                    manualOverride: false
                }
            };

            setBusinessProfile(staticProfile);
            setLiveStatus(staticProfile.status);
            setBusinessProfileLoading(false);
        };

        loadBusinessProfile();
    }, []);

    // Load static offers
    useEffect(() => {
        const loadOffers = () => {
            const staticOffers: HomeOfferItem[] = [
                {
                    id: '1',
                    badge: '50% OFF',
                    title: 'Mega Pizza Sale',
                    subtitle: 'Get 50% off on all large pizzas Min order: ₹299',
                    code: 'PIZZA50',
                    bgColor: '#FF5722',
                    gradientColors: ['#FF9800', '#FF5722'] as const,
                },
                {
                    id: '2',
                    badge: '₹100 OFF',
                    title: 'Combo Special',
                    subtitle: 'Save ₹100 on combo meals Min order: ₹499',
                    code: 'COMBO100',
                    bgColor: '#2196F3',
                    gradientColors: ['#03A9F4', '#1976D2'] as const,
                },
                {
                    id: '3',
                    badge: '₹150 OFF',
                    title: 'First Order Treat',
                    subtitle: 'New customers get ₹150 off Min order: ₹399',
                    code: 'FIRST150',
                    bgColor: '#4CAF50',
                    gradientColors: ['#8BC34A', '#388E3C'] as const,
                },
                {
                    id: '4',
                    badge: '30% OFF',
                    title: 'Weekend Bonanza',
                    subtitle: '30% discount on all orders Min order: ₹349',
                    code: 'WEEKEND30',
                    bgColor: '#9C27B0',
                    gradientColors: ['#BA68C8', '#7B1FA2'] as const,
                },
                {
                    id: '5',
                    badge: 'BUY 1 GET 1',
                    title: 'Double Delight',
                    subtitle: 'Buy one pizza, get one free Min order: ₹399',
                    code: 'BOGO',
                    bgColor: '#F44336',
                    gradientColors: ['#FF5252', '#D32F2F'] as const,
                }
            ];

            setOffers(staticOffers);
            setLoadingOffers(false);
        };

        loadOffers();
    }, []);

    // Load static popular items
    useEffect(() => {
        const loadPopularItems = () => {
            const staticItems: MenuItem[] = [
                {
                    _id: '1',
                    name: 'Margherita Pizza',
                    description: 'Classic delight with 100% real mozzarella cheese',
                    price: 199,
                    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                    category: 'Pizza',
                    isVeg: true,
                    isAvailable: true
                },
                {
                    _id: '2',
                    name: 'Pepperoni Paradise',
                    description: 'American classic with spicy pepperoni & cheese',
                    price: 299,
                    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
                    category: 'Pizza',
                    isVeg: false,
                    isAvailable: true
                },
                {
                    _id: '3',
                    name: 'Veggie Supreme',
                    description: 'Loaded with fresh vegetables & herbs',
                    price: 249,
                    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400',
                    category: 'Pizza',
                    isVeg: true,
                    isAvailable: true
                },
                {
                    _id: '4',
                    name: 'Chicken BBQ',
                    description: 'Smoky BBQ chicken with onions & peppers',
                    price: 329,
                    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
                    category: 'Pizza',
                    isVeg: false,
                    isAvailable: true
                },
                {
                    _id: '5',
                    name: 'Cheese Burst',
                    description: 'Extra cheese in every bite with liquid cheese filling',
                    price: 279,
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
                    category: 'Pizza',
                    isVeg: true,
                    isAvailable: true
                },
                {
                    _id: '6',
                    name: 'Mexican Fiesta',
                    description: 'Spicy jalapeños, corn & red paprika',
                    price: 259,
                    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
                    category: 'Pizza',
                    isVeg: true,
                    isAvailable: true
                }
            ];

            setPopularItems(staticItems);
            setLoadingPopularItems(false);
        };

        loadPopularItems();
    }, []);

    // Navigation handlers
    const navigateToCart = useCallback(() => {
        navigation.navigate('Cart');
    }, [navigation]);

    const navigateToItem = useCallback((item: MenuItem) => {
        navigation.navigate('PizzaDetails', { pizzaId: item._id });
    }, [navigation]);

    const navigateToMenu = useCallback(() => {
        if (liveStatus && !liveStatus.isOpen) {
            Alert.alert(
                'Restaurant Closed',
                `Sorry, we're currently closed. ${liveStatus.reason || 'Please check our operating hours.'}`,
                [{ text: 'OK', style: 'default' }]
            );
            return;
        }
        navigation.navigate('Menu' as any);
    }, [navigation, liveStatus]);

    const handleCopyOfferCode = useCallback(async (code: string) => {
        if (!code) return;

        try {
            await Clipboard.setStringAsync(code);
            setCopiedCode(code);

            setTimeout(() => {
                setCopiedCode(null);
            }, 2000);

            try {
                await AsyncStorage.setItem('selectedOfferCode', code);
            } catch (storageError) {
                logger.warn('Failed to save offer code to storage:', storageError);
            }
        } catch (err) {
            logger.error('Failed to copy offer code:', err);
            Alert.alert('Error', 'Failed to copy the offer code.');
        }
    }, []);

    const handleOfferScroll = useMemo(
        () =>
            Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: false,
                listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const scrollPosition = event.nativeEvent.contentOffset.x;
                    const index = Math.round(scrollPosition / (ITEM_WIDTH + SPACING));
                    if (index !== activeOfferIndex) {
                        setActiveOfferIndex(index);
                    }
                },
            }),
        [scrollX, activeOfferIndex]
    );

    const handleLogout = async () => {
        await clearAuthState();
        dispatch(logout());
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Clean Modern Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <View style={styles.locationInfo}>
                                <Text style={styles.deliveryLabel}>Delivery to</Text>
                                <TouchableOpacity style={styles.addressRow} activeOpacity={0.7}>
                                    <Text style={styles.addressText}>Home</Text>
                                    <Text style={styles.dropdownArrow}>▾</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.cartButtonClean}
                                onPress={navigateToCart}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cartIconClean}>🛒</Text>
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>0</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium Hero Banner */}
                <View style={styles.heroBanner}>
                    <LinearGradient
                        colors={['#E60E1C', '#C50712']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroContent}>
                            <View style={styles.heroLeft}>
                                <Text style={styles.heroGreeting}>Hey {userName}! 👋</Text>
                                <Text style={styles.heroTitle}>Freshly Baked</Text>
                                <Text style={styles.heroSubtitle}>Delicious pizzas delivered hot!</Text>

                                <TouchableOpacity style={styles.ctaButton} onPress={navigateToMenu}>
                                    <Text style={styles.ctaText}>Order Now</Text>
                                    <Text style={styles.ctaArrow}>→</Text>
                                </TouchableOpacity>
                            </View>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300' }}
                                style={styles.heroImage}
                            />
                        </View>

                        {/* Decorative elements */}
                        <View style={styles.heroDecor1} />
                        <View style={styles.heroDecor2} />
                    </LinearGradient>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionCard} onPress={navigateToMenu}>
                        <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.quickActionGradient}>
                            <Text style={styles.quickActionIcon}>🍕</Text>
                            <Text style={styles.quickActionText}>Menu</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard}>
                        <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.quickActionGradient}>
                            <Text style={styles.quickActionIcon}>⚡</Text>
                            <Text style={styles.quickActionText}>Fast Delivery</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard}>
                        <LinearGradient colors={['#FCE4EC', '#F8BBD0']} style={styles.quickActionGradient}>
                            <Text style={styles.quickActionIcon}>🎁</Text>
                            <Text style={styles.quickActionText}>Offers</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard}>
                        <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.quickActionGradient}>
                            <Text style={styles.quickActionIcon}>⭐</Text>
                            <Text style={styles.quickActionText}>Top Rated</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.mainContent}>
                    {/* Exclusive Offers */}
                    {loadingOffers ? (
                        <View style={styles.section}>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionTitle}>🎉 Exclusive Offers</Text>
                            </View>
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#E60E1C" />
                            </View>
                        </View>
                    ) : !offerError && offers.length > 0 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionTitle}>🎉 Exclusive Offers</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAllText}>See All →</Text>
                                </TouchableOpacity>
                            </View>

                            <Animated.FlatList
                                data={offers}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.offersContainer}
                                snapToInterval={ITEM_WIDTH + SPACING}
                                snapToAlignment="start"
                                decelerationRate="fast"
                                onScroll={handleOfferScroll}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modernOfferCard}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={item.gradientColors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1.2, y: 1.2 }}
                                            style={styles.offerGradient}
                                        >
                                            {/* Offer Badge */}
                                            <View style={styles.modernOfferBadge}>
                                                <Text style={styles.modernOfferBadgeText}>{item.badge}</Text>
                                            </View>

                                            {/* Offer Content */}
                                            <View style={styles.offerContentArea}>
                                                <Text style={styles.modernOfferTitle}>{item.title}</Text>
                                                <Text style={styles.modernOfferSubtitle} numberOfLines={2}>
                                                    {item.subtitle}
                                                </Text>

                                                {/* Code Section */}
                                                <View style={styles.codeSection}>
                                                    <View style={styles.dottedBorder}>
                                                        <Text style={styles.codeLabel}>USE CODE</Text>
                                                        <Text style={styles.codeValue}>{item.code}</Text>
                                                    </View>

                                                    <TouchableOpacity
                                                        style={styles.modernCopyButton}
                                                        onPress={() => handleCopyOfferCode(item.code || '')}
                                                    >
                                                        <Text style={styles.modernCopyButtonText}>
                                                            {copiedCode === item.code ? '✓ COPIED' : 'TAP TO COPY'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Decorative pizza slice */}
                                            <Text style={styles.decorPizza}>🍕</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            />

                            {/* Modern pagination */}
                            <View style={styles.modernPagination}>
                                {offers.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.modernPaginationDot,
                                            index === activeOfferIndex && styles.modernPaginationDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    ) : null}

                    {/* Popular Picks */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>🔥 Popular Picks</Text>
                            <TouchableOpacity onPress={navigateToMenu}>
                                <Text style={styles.seeAllText}>See All →</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingPopularItems ? (
                            <View style={styles.modernGrid}>
                                {[1, 2, 3, 4].map((_, index) => (
                                    <View key={index} style={styles.modernSkeleton}>
                                        <View style={styles.skeletonImageRound} />
                                        <View style={styles.skeletonLine1} />
                                        <View style={styles.skeletonLine2} />
                                    </View>
                                ))}
                            </View>
                        ) : popularItemsError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorEmoji}>😕</Text>
                                <Text style={styles.errorTitle}>Oops!</Text>
                                <Text style={styles.errorText}>{popularItemsError}</Text>
                            </View>
                        ) : popularItems.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🍕</Text>
                                <Text style={styles.emptyTitle}>No items yet!</Text>
                                <Text style={styles.emptyText}>Check back soon for delicious treats</Text>
                            </View>
                        ) : (
                            <View style={styles.modernGrid}>
                                {popularItems.map((item) => (
                                    <TouchableOpacity
                                        key={item._id}
                                        style={styles.modernItemCard}
                                        onPress={() => navigateToItem(item)}
                                        activeOpacity={0.8}
                                    >
                                        {/* Image with badge */}
                                        <View style={styles.modernItemImageContainer}>
                                            <Image
                                                source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                                                style={styles.modernItemImage}
                                            />

                                            {/* Veg/Non-veg indicator */}
                                            <View style={styles.vegBadge}>
                                                <View style={[styles.vegBadgeInner, !item.isVeg && styles.nonVegBadgeInner]}>
                                                    <View style={[styles.vegIndicatorDot, !item.isVeg && styles.nonVegIndicatorDot]} />
                                                </View>
                                            </View>

                                            {/* Bestseller tag */}
                                            <View style={styles.bestsellerTag}>
                                                <Text style={styles.bestsellerText}>⭐ BESTSELLER</Text>
                                            </View>
                                        </View>

                                        {/* Item details */}
                                        <View style={styles.modernItemDetails}>
                                            <Text style={styles.modernItemName} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.modernItemDesc} numberOfLines={2}>
                                                {item.description}
                                            </Text>

                                            {/* Price and Add button */}
                                            <View style={styles.modernItemFooter}>
                                                <Text style={styles.modernItemPrice}>₹{item.price}</Text>
                                                <TouchableOpacity style={styles.addButton}>
                                                    <Text style={styles.addButtonText}>ADD +</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Restaurant Info Card */}
                    {businessProfile && (
                        <View style={styles.modernBusinessCard}>
                            <View style={styles.businessHeader}>
                                <View style={styles.businessIconCircle}>
                                    <Text style={styles.businessIcon}>🏪</Text>
                                </View>
                                <View style={styles.businessInfo}>
                                    <Text style={styles.businessTitle}>{businessProfile.name}</Text>
                                    <View style={styles.statusRow}>
                                        <View style={[styles.statusIndicator, liveStatus?.isOpen && styles.statusIndicatorOpen]} />
                                        <Text style={styles.statusLabel}>
                                            {liveStatus?.isOpen ? 'Open Now • Delivery in 30 mins' : 'Currently Closed'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.businessDivider} />

                            <View style={styles.businessDetails}>
                                <View style={styles.businessDetailRow}>
                                    <Text style={styles.detailIcon}>📍</Text>
                                    <Text style={styles.detailText}>{businessProfile.address}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.modernCallButton}
                                    onPress={() => {
                                        const phoneNumber = businessProfile.phone.replace(/[^0-9+]/g, '');
                                        Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
                                            Alert.alert('Error', 'Unable to make phone call');
                                            logger.error('Phone call error:', err);
                                        });
                                    }}
                                >
                                    <Text style={styles.modernCallIcon}>📞</Text>
                                    <Text style={styles.modernCallText}>Call {businessProfile.phone}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContainer: {
        flex: 1,
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
    },
    locationInfo: {
        flexDirection: 'column',
    },
    deliveryLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
        marginRight: 6,
    },
    dropdownArrow: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
    cartIconClean: {
        fontSize: 20,
    },
    cartBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#E60E1C',
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
    },    // Hero Banner
    heroBanner: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#E60E1C',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    heroGradient: {
        paddingHorizontal: 24,
        paddingVertical: 28,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    heroLeft: {
        flex: 1,
        paddingRight: 16,
    },
    heroGreeting: {
        fontSize: 14,
        color: '#FFE5E5',
        fontWeight: '600',
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#FFE5E5',
        marginBottom: 20,
        lineHeight: 20,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignSelf: 'flex-start',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#E60E1C',
        marginRight: 6,
    },
    ctaArrow: {
        fontSize: 18,
        color: '#E60E1C',
        fontWeight: '700',
    },
    heroImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroDecor1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -40,
        right: -30,
    },
    heroDecor2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -20,
        left: -20,
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    quickActionGradient: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },

    // Main Content
    mainContent: {
        paddingTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: -0.3,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E60E1C',
    },

    // Modern Offers
    offersContainer: {
        paddingLeft: 16,
        paddingBottom: 12,
    },
    modernOfferCard: {
        width: ITEM_WIDTH,
        marginRight: SPACING,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    offerGradient: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        minHeight: 200,
        justifyContent: 'space-between',
        position: 'relative',
    },
    modernOfferBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    modernOfferBadgeText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    offerContentArea: {
        zIndex: 1,
    },
    modernOfferTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    modernOfferSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.95,
        lineHeight: 18,
        marginBottom: 16,
    },
    codeSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
    },
    dottedBorder: {
        borderWidth: 1,
        borderColor: '#fff',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    codeLabel: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.8,
        fontWeight: '600',
        marginBottom: 4,
    },
    codeValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    modernCopyButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    modernCopyButtonText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: 0.5,
    },
    decorPizza: {
        position: 'absolute',
        fontSize: 80,
        opacity: 0.15,
        right: -10,
        top: 40,
    },
    modernPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    modernPaginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D0D0D0',
        marginHorizontal: 4,
    },
    modernPaginationDotActive: {
        backgroundColor: '#E60E1C',
        width: 20,
        height: 6,
        borderRadius: 3,
    },

    // Modern Grid Items
    modernGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    modernItemCard: {
        width: (width - 48) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    modernItemImageContainer: {
        height: 140,
        backgroundColor: '#F8F8F8',
        position: 'relative',
    },
    modernItemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    vegBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    vegBadgeInner: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#22A447',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nonVegBadgeInner: {
        borderColor: '#DC3545',
    },
    vegIndicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22A447',
    },
    nonVegIndicatorDot: {
        backgroundColor: '#DC3545',
    },
    bestsellerTag: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFA000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    bestsellerText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },
    modernItemDetails: {
        padding: 14,
    },
    modernItemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    modernItemDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 12,
    },
    modernItemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modernItemPrice: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    addButton: {
        backgroundColor: '#E60E1C',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },

    // Loading States
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    modernSkeleton: {
        width: (width - 36) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 14,
        marginHorizontal: 6,
        marginBottom: 16,
    },
    skeletonImageRound: {
        width: '100%',
        height: 120,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        marginBottom: 12,
    },
    skeletonLine1: {
        width: '80%',
        height: 14,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        marginBottom: 8,
    },
    skeletonLine2: {
        width: '50%',
        height: 14,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
    },

    // Error & Empty States
    errorContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    emptyState: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },

    // Modern Business Card
    modernBusinessCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    businessHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    businessIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF3E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    businessIcon: {
        fontSize: 28,
    },
    businessInfo: {
        flex: 1,
    },
    businessTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#999',
        marginRight: 8,
    },
    statusIndicatorOpen: {
        backgroundColor: '#22A447',
    },
    statusLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    businessDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 20,
    },
    businessDetails: {
        padding: 20,
    },
    businessDetailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailIcon: {
        fontSize: 18,
        marginRight: 10,
        marginTop: 2,
    },
    detailText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    modernCallButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    modernCallIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    modernCallText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#E60E1C',
    },
});