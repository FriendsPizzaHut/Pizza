import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/store';
import {
    setCategory,
    setSearchQuery,
} from '../../../../redux/slices/productSlice';
import {
    fetchProductsThunk,
    loadMoreProductsThunk,
    refreshProductsThunk,
} from '../../../../redux/thunks/productThunks';
import { Product } from '../../../services/productService';
import MenuItemSkeleton from '../../../components/admin/MenuItemSkeleton';

/**
 * Decode HTML entities in image URL
 * Fixes issue where URLs are stored with &#x2F; instead of /
 */
const decodeImageUrl = (url: string): string => {
    if (!url) return '';
    return url
        .replace(/&#x2F;/g, '/')
        .replace(/&#x3A;/g, ':')
        .replace(/&amp;/g, '&');
};

/**
 * MenuManagementScreen - Professional optimized version
 * 
 * Features:
 * - Pagination (loads 10 items at a time)
 * - Infinite scroll
 * - Pull to refresh
 * - Debounced search (500ms)
 * - Smart filtering
 * - Skeleton loading
 * - Empty states
 * - Optimized for 1000+ items
 */

export default function MenuManagementScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const dispatch = useDispatch<AppDispatch>();

    // Redux state
    const {
        products,
        total,
        page,
        hasMore,
        selectedCategory,
        searchQuery: reduxSearchQuery,
        isLoading,
        isLoadingMore,
        isRefreshing,
    } = useSelector((state: RootState) => state.product);

    // Local state for search input (debounced)
    const [localSearchQuery, setLocalSearchQuery] = useState(reduxSearchQuery);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Categories with counts (will be updated dynamically)
    const [categories, setCategories] = useState([
        { id: 'all', label: 'All Items', count: total },
        { id: 'pizza', label: 'Pizzas', count: 0 },
        { id: 'sides', label: 'Sides', count: 0 },
        { id: 'beverages', label: 'Beverages', count: 0 },
        { id: 'desserts', label: 'Desserts', count: 0 },
    ]);

    // Load initial products
    useEffect(() => {
        loadProducts(1, false);
    }, [selectedCategory, reduxSearchQuery]);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (localSearchQuery !== reduxSearchQuery) {
                dispatch(setSearchQuery(localSearchQuery));
            }
        }, 500); // 500ms debounce

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [localSearchQuery]);

    /**
     * Load products from backend using thunks
     */
    const loadProducts = async (pageNum: number, isLoadMore: boolean) => {
        const params = {
            page: pageNum,
            limit: 10,
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: reduxSearchQuery || undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc' as const,
        };

        if (isLoadMore) {
            const result = await dispatch(loadMoreProductsThunk(params));
            if (result.success && result.data) {
                updateCategoryCounts(result.data.total);
            }
        } else {
            const result = await dispatch(fetchProductsThunk(params));
            if (result.success && result.data) {
                updateCategoryCounts(result.data.total);
            }
        }
    };

    /**
     * Update category counts dynamically
     */
    const updateCategoryCounts = (totalCount: number) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === 'all' ? { ...cat, count: totalCount } : cat
            )
        );
    };

    /**
     * Handle pull to refresh
     */
    const handleRefresh = useCallback(async () => {
        const result = await dispatch(refreshProductsThunk({
            limit: 10,
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: reduxSearchQuery || undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc' as const,
        }));

        if (result.success && result.data) {
            updateCategoryCounts(result.data.total);
        }
    }, [selectedCategory, reduxSearchQuery]);

    /**
     * Handle load more (infinite scroll)
     */
    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && hasMore && !isLoading) {
            loadProducts(page + 1, true);
        }
    }, [isLoadingMore, hasMore, isLoading, page]);

    /**
     * Handle category change
     */
    const handleCategoryChange = useCallback((categoryId: string) => {
        if (categoryId !== selectedCategory) {
            dispatch(setCategory(categoryId));
        }
    }, [selectedCategory]);

    /**
     * Handle delete item with confirmation
     */
    const handleDeleteItem = useCallback((itemId: string, itemName: string) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${itemName}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement delete functionality
                        console.log('Deleting item:', itemId);
                        // You can add the delete thunk here later
                        // dispatch(deleteProductThunk(itemId));
                    },
                },
            ],
            { cancelable: true }
        );
    }, []);

    /**
     * Get status configuration
     */
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'active':
                return { label: 'Active', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'inactive':
                return { label: 'Inactive', color: '#FF9800', bgColor: '#FFF3E0', icon: 'pause-circle' };
            case 'outofstock':
                return { label: 'Out of Stock', color: '#F44336', bgColor: '#FFEBEE', icon: 'cancel' };
            default:
                return { label: 'Active', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
        }
    };

    /**
     * Render menu item card
     */
    const renderMenuItem = useCallback(({ item }: { item: Product }) => {
        // Determine status based on isAvailable
        const status = item.isAvailable ? 'active' : 'inactive';
        const statusConfig = getStatusConfig(status);

        // Get display price
        const displayPrice = typeof item.pricing === 'number'
            ? `₹${item.pricing.toFixed(0)}`
            : item.pricing.small
                ? `₹${item.pricing.small.toFixed(0)} - ₹${item.pricing.large?.toFixed(0) || item.pricing.medium?.toFixed(0) || item.pricing.small.toFixed(0)}`
                : `₹${item.basePrice.toFixed(0)}`;

        return (
            <View style={styles.itemCard}>
                {/* Top Section */}
                <View style={styles.topSection}>
                    <View style={styles.itemImageContainer}>
                        <Image
                            source={{ uri: decodeImageUrl(item.imageUrl) }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.itemId}>{item._id.slice(-8).toUpperCase()}</Text>
                        <Text style={styles.itemDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                </View>

                {/* Status Section */}
                <View style={styles.statusSection}>
                    <View style={styles.divider} />
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                            <MaterialIcons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                        <Text style={styles.categoryBadge}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <View style={styles.divider} />
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Price</Text>
                                <Text style={styles.detailValue}>{displayPrice}</Text>
                            </View>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="shopping-cart" size={16} color="#2196F3" />
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>Sales</Text>
                                <Text style={styles.detailValue}>{item.salesCount || 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditMenuItem', { itemId: item._id })}
                    >
                        <MaterialIcons name="edit" size={16} color="#2196F3" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.duplicateButton}
                        onPress={() => console.log('Duplicate item:', item._id)}
                    >
                        <MaterialIcons name="content-copy" size={16} color="#FF9800" />
                        <Text style={styles.duplicateButtonText}>Duplicate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteItem(item._id, item.name)}
                    >
                        <MaterialIcons name="delete" size={16} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }, [navigation, handleDeleteItem]);

    /**
     * Render loading skeleton
     */
    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((key) => (
                <MenuItemSkeleton key={key} />
            ))}
        </View>
    );

    /**
     * Render footer (load more indicator)
     */
    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#cb202d" />
                <Text style={styles.footerText}>Loading more items...</Text>
            </View>
        );
    };

    /**
     * Render empty state
     */
    const renderEmptyState = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyState}>
                <MaterialIcons name="restaurant-menu" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>
                    {reduxSearchQuery ? 'No items found' : 'No menu items yet'}
                </Text>
                <Text style={styles.emptyDescription}>
                    {reduxSearchQuery
                        ? `No items match "${reduxSearchQuery}"`
                        : 'Add your first menu item to get started'}
                </Text>
                {!reduxSearchQuery && (
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate('AddMenuItem')}
                    >
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.emptyButtonText}>Add Menu Item</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    /**
     * Render list header (banner + section title)
     * Only shows banner and header when NOT searching
     */
    const renderListHeader = () => {
        // If actively searching, don't show banner and header
        const isSearching = reduxSearchQuery && reduxSearchQuery.trim().length > 0;

        if (isSearching) {
            return (
                <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsText}>
                        Search results for "{reduxSearchQuery}"
                    </Text>
                    <Text style={styles.searchResultsCount}>{total} items found</Text>
                </View>
            );
        }

        // Normal view: show banner and section header
        return (
            <>
                {/* Advertisement Banner */}
                <View style={styles.advertisementBanner}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop' }}
                        style={styles.advertisementImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWithIcon}>
                        <MaterialIcons name="restaurant-menu" size={24} color="#cb202d" />
                        <Text style={styles.sectionTitle}>
                            {selectedCategory === 'all'
                                ? 'All Menu Items'
                                : categories.find((c) => c.id === selectedCategory)?.label}
                        </Text>
                    </View>
                    <Text style={styles.itemCount}>{total} items</Text>
                </View>
            </>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerLabel}>Menu Management</Text>
                        <Text style={styles.headerTitle}>All Menu Items</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddMenuItem')}
                    >
                        <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search menu items..."
                        placeholderTextColor="#999"
                        value={localSearchQuery}
                        onChangeText={setLocalSearchQuery}
                    />
                    {localSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setLocalSearchQuery('')}>
                            <MaterialIcons name="close" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filters */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.categories}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                selectedCategory === item.id && styles.activeFilterChip,
                            ]}
                            onPress={() => handleCategoryChange(item.id)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedCategory === item.id && styles.activeFilterText,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Products List */}
            {isLoading && products.length === 0 ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderMenuItem}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={renderListHeader}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#cb202d"
                            colors={['#cb202d']}
                        />
                    }
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={10}
                    updateCellsBatchingPeriod={50}
                />
            )}
        </View>
    );
}

// [Styles remain the same - will continue in next message due to length...]
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    header: {
        backgroundColor: 'transparent',
        paddingBottom: 8,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    headerLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '400',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#cb202d',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#cb202d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 45,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
        color: '#8E8E93',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '400',
    },
    categoriesContainer: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        maxHeight: 50,
    },
    categories: {
        paddingHorizontal: 20,
        alignItems: 'center',
        height: 30,
    },
    filterChip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
    },
    activeFilterChip: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    advertisementBanner: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    advertisementImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 16,
    },
    sectionTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
    },
    itemCount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
    },
    itemCard: {
        backgroundColor: '#fbfbfbff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#F0F0F0',
    },
    itemImage: {
        width: 80,
        height: 80,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        lineHeight: 20,
        marginBottom: 4,
    },
    itemId: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    statusSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    categoryBadge: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    detailsSection: {
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    detailInfo: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        color: '#8E8E93',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2196F3',
    },
    duplicateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    duplicateButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FF9800',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    skeletonContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#cb202d',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    searchResultsHeader: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    searchResultsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    searchResultsCount: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
});
