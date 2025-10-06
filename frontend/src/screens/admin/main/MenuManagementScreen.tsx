import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Image, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function MenuManagementScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const categories = [
        { id: 'all', label: 'All Items', count: 30 },
        { id: 'pizzas', label: 'Pizzas', count: 12 },
        { id: 'sides', label: 'Sides', count: 8 },
        { id: 'beverages', label: 'Beverages', count: 6 },
        { id: 'desserts', label: 'Desserts', count: 4 },
    ];

    const menuItems = [
        {
            id: 'ITEM-001',
            name: 'Margherita Pizza',
            category: 'pizzas',
            categoryLabel: 'Pizzas',
            price: 16.99,
            status: 'active',
            description: 'Fresh mozzarella, tomato sauce, basil',
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop',
            sales: 245,
            stock: 'In Stock',
            lastUpdated: '2 hours ago',
        },
        {
            id: 'ITEM-002',
            name: 'Pepperoni Supreme',
            category: 'pizzas',
            categoryLabel: 'Pizzas',
            price: 18.99,
            status: 'active',
            description: 'Double pepperoni, extra cheese',
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop',
            sales: 312,
            stock: 'In Stock',
            lastUpdated: '5 hours ago',
        },
        {
            id: 'ITEM-003',
            name: 'Buffalo Wings',
            category: 'sides',
            categoryLabel: 'Sides',
            price: 12.99,
            status: 'active',
            description: 'Spicy buffalo wings with ranch',
            image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=300&h=300&fit=crop',
            sales: 189,
            stock: 'In Stock',
            lastUpdated: '1 day ago',
        },
        {
            id: 'ITEM-004',
            name: 'Garlic Bread',
            category: 'sides',
            categoryLabel: 'Sides',
            price: 5.99,
            status: 'active',
            description: 'Toasted bread with garlic butter',
            image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=300&h=300&fit=crop',
            sales: 421,
            stock: 'In Stock',
            lastUpdated: '3 hours ago',
        },
        {
            id: 'ITEM-005',
            name: 'Coca Cola',
            category: 'beverages',
            categoryLabel: 'Beverages',
            price: 2.99,
            status: 'active',
            description: 'Chilled soft drink, 500ml',
            image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=300&fit=crop',
            sales: 567,
            stock: 'In Stock',
            lastUpdated: '1 day ago',
        },
        {
            id: 'ITEM-006',
            name: 'Chocolate Lava Cake',
            category: 'desserts',
            categoryLabel: 'Desserts',
            price: 7.99,
            status: 'inactive',
            description: 'Warm chocolate cake with molten center',
            image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300&h=300&fit=crop',
            sales: 98,
            stock: 'Out of Stock',
            lastUpdated: '3 days ago',
        },
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'active':
                return { label: 'Active', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'inactive':
                return { label: 'Inactive', color: '#FF9800', bgColor: '#FFF3E0', icon: 'pause-circle' };
            case 'outofstock':
                return { label: 'Out of Stock', color: '#F44336', bgColor: '#FFEBEE', icon: 'cancel' };
            default:
                return { label: status, color: '#666', bgColor: '#F5F5F5', icon: 'info' };
        }
    };

    const filteredItems = selectedCategory === 'all'
        ? menuItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : menuItems.filter(item =>
            item.category === selectedCategory &&
            (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Modern Header */}
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
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Category Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                <View style={styles.categories}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterChip,
                                selectedCategory === category.id && styles.activeFilterChip
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedCategory === category.id && styles.activeFilterText
                            ]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Advertisement Banner */}
                <View style={styles.advertisementBanner}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop' }}
                        style={styles.advertisementImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Menu Items List */}
                <View style={styles.itemsSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWithIcon}>
                            <MaterialIcons name="restaurant-menu" size={24} color="#cb202d" />
                            <Text style={styles.sectionTitle}>
                                {selectedCategory === 'all' ? 'All Menu Items' : categories.find(c => c.id === selectedCategory)?.label}
                            </Text>
                        </View>
                        <Text style={styles.itemCount}>{filteredItems.length} items</Text>
                    </View>

                    {filteredItems.map((item) => {
                        const statusConfig = getStatusConfig(item.status);
                        return (
                            <View key={item.id} style={styles.itemCard}>
                                {/* Top Section with Image and Info */}
                                <View style={styles.topSection}>
                                    <View style={styles.itemImageContainer}>
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.itemImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <View style={styles.nameRow}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.itemId}>{item.id}</Text>
                                        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
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
                                        <Text style={styles.categoryBadge}>{item.categoryLabel}</Text>
                                    </View>
                                </View>

                                {/* Item Details Section */}
                                <View style={styles.detailsSection}>
                                    <View style={styles.divider} />
                                    <View style={styles.detailsRow}>
                                        <View style={styles.detailItem}>
                                            <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
                                            <View style={styles.detailInfo}>
                                                <Text style={styles.detailLabel}>Price</Text>
                                                <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <MaterialIcons name="shopping-cart" size={16} color="#2196F3" />
                                            <View style={styles.detailInfo}>
                                                <Text style={styles.detailLabel}>Sales</Text>
                                                <Text style={styles.detailValue}>{item.sales}</Text>
                                            </View>
                                        </View>
                                        {/* Removed stock option, only price and sales remain */}
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionsSection}>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => navigation.navigate('EditMenuItem', { itemId: item.id })}
                                    >
                                        <MaterialIcons name="edit" size={16} color="#2196F3" />
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.duplicateButton}
                                        onPress={() => console.log('Duplicate item:', item.id)}
                                    >
                                        <MaterialIcons name="content-copy" size={16} color="#FF9800" />
                                        <Text style={styles.duplicateButtonText}>Duplicate</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => console.log('Delete item:', item.id)}
                                    >
                                        <MaterialIcons name="delete" size={16} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    scrollContainer: {
        flex: 1,
    },

    // Header
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

    // Advertisement Banner
    advertisementBanner: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 16,
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

    // Category Filters
    categoriesContainer: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        maxHeight: 50,
    },
    categories: {
        flexDirection: 'row',
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
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

    // Items Section
    itemsSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
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

    // Item Card
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        lineHeight: 20,
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

    // Status Section
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

    // Details Section
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

    // Action Buttons
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
});