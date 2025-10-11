import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { fetchProductsThunk } from '../../../../redux/thunks/productThunks';

interface Category {
    name: string;
    itemCount: number;
    isActive: boolean;
    order: number;
}

export default function CategoryManagementScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const { products, isLoading } = useSelector((state: RootState) => state.product);

    const [categories, setCategories] = useState<Category[]>([
        { name: 'pizza', itemCount: 0, isActive: true, order: 1 },
        { name: 'sides', itemCount: 0, isActive: true, order: 2 },
        { name: 'beverages', itemCount: 0, isActive: true, order: 3 },
        { name: 'desserts', itemCount: 0, isActive: true, order: 4 },
    ]);

    // Fetch products on component mount
    useEffect(() => {
        dispatch(fetchProductsThunk());
    }, [dispatch]);

    // Update category counts when products change
    useEffect(() => {
        if (products.length > 0) {
            const updatedCategories = categories.map(cat => {
                const count = products.filter(p => p.category === cat.name).length;
                return { ...cat, itemCount: count };
            });
            setCategories(updatedCategories);
        }
    }, [products]);

    const getCategoryDisplayName = (name: string): string => {
        const displayNames: { [key: string]: string } = {
            'pizza': 'Pizza',
            'sides': 'Sides',
            'beverages': 'Beverages',
            'desserts': 'Desserts',
        };
        return displayNames[name] || name;
    };

    const handleToggleCategory = (categoryName: string) => {
        setCategories(categories.map(cat =>
            cat.name === categoryName ? { ...cat, isActive: !cat.isActive } : cat
        ));
    };

    const moveCategory = (categoryName: string, direction: 'up' | 'down') => {
        const currentIndex = categories.findIndex(cat => cat.name === categoryName);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === categories.length - 1)
        ) {
            return;
        }

        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        [newCategories[currentIndex], newCategories[targetIndex]] =
            [newCategories[targetIndex], newCategories[currentIndex]];

        // Update order numbers
        newCategories.forEach((cat, index) => {
            cat.order = index + 1;
        });

        setCategories(newCategories);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📂 Category Management</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>ℹ️ Category Information</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            Categories in this system are fixed: Pizza, Sides, Beverages, and Desserts.
                        </Text>
                        <Text style={styles.infoText}>
                            • You can reorder categories to change their display order
                        </Text>
                        <Text style={styles.infoText}>
                            • Toggle categories active/inactive to show/hide from customers
                        </Text>
                        <Text style={styles.infoText}>
                            • Item counts are updated automatically when you add/remove products
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9C27B0" />
                        <Text style={styles.loadingText}>Loading category data...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.categoriesSection}>
                            <Text style={styles.sectionTitle}>Current Categories</Text>

                            {categories.map((category, index) => (
                                <View key={category.name} style={styles.categoryCard}>
                                    <View style={styles.categoryHeader}>
                                        <View style={styles.categoryInfo}>
                                            <Text style={[
                                                styles.categoryName,
                                                !category.isActive && styles.inactiveText
                                            ]}>
                                                {getCategoryDisplayName(category.name)}
                                            </Text>
                                            <Text style={styles.categoryMeta}>
                                                {category.itemCount || 0} items • Order: {category.order}
                                            </Text>
                                        </View>

                                        <View style={styles.categoryActions}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => moveCategory(category.name, 'up')}
                                                disabled={index === 0}
                                            >
                                                <Text style={[
                                                    styles.actionButtonText,
                                                    index === 0 && styles.disabledText
                                                ]}>
                                                    ⬆️
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => moveCategory(category.name, 'down')}
                                                disabled={index === categories.length - 1}
                                            >
                                                <Text style={[
                                                    styles.actionButtonText,
                                                    index === categories.length - 1 && styles.disabledText
                                                ]}>
                                                    ⬇️
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.categoryControls}>
                                        <TouchableOpacity
                                            style={[
                                                styles.controlButton,
                                                category.isActive ? styles.activeButton : styles.inactiveButton
                                            ]}
                                            onPress={() => handleToggleCategory(category.name)}
                                        >
                                            <Text style={[
                                                styles.controlButtonText,
                                                category.isActive ? styles.activeButtonText : styles.inactiveButtonText
                                            ]}>
                                                {category.isActive ? '✅ Active' : '❌ Inactive'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.statsSection}>
                            <Text style={styles.sectionTitle}>Category Statistics</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>{categories.length}</Text>
                                    <Text style={styles.statLabel}>Total Categories</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>
                                        {categories.filter(cat => cat.isActive).length}
                                    </Text>
                                    <Text style={styles.statLabel}>Active Categories</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>
                                        {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
                                    </Text>
                                    <Text style={styles.statLabel}>Total Items</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>
                                        {categories.length > 0
                                            ? Math.round(categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0) / categories.length)
                                            : 0
                                        }
                                    </Text>
                                    <Text style={styles.statLabel}>Avg Items per Category</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>💡 Tips</Text>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipText}>
                            • Categories are predefined based on the product model schema
                        </Text>
                        <Text style={styles.tipText}>
                            • Use the arrow buttons to reorder categories for your menu display
                        </Text>
                        <Text style={styles.tipText}>
                            • Inactive categories are hidden from customers but still accessible to admin
                        </Text>
                        <Text style={styles.tipText}>
                            • Add products to categories using the "Add Menu Item" screen
                        </Text>
                    </View>
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
        backgroundColor: '#9C27B0',
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoSection: {
        marginBottom: 25,
    },
    infoCard: {
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    infoText: {
        fontSize: 13,
        color: '#1976D2',
        marginBottom: 6,
        lineHeight: 18,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    addSection: {
        marginBottom: 25,
    },
    addCategoryForm: {
        flexDirection: 'row',
        gap: 10,
    },
    categoryInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    categoriesSection: {
        marginBottom: 25,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    categoryMeta: {
        fontSize: 14,
        color: '#666',
    },
    inactiveText: {
        color: '#999',
    },
    categoryActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 8,
    },
    actionButtonText: {
        fontSize: 18,
    },
    disabledText: {
        opacity: 0.3,
    },
    categoryControls: {
        flexDirection: 'row',
        gap: 10,
    },
    controlButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#4CAF50',
    },
    inactiveButton: {
        backgroundColor: '#f44336',
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeButtonText: {
        color: '#fff',
    },
    inactiveButtonText: {
        color: '#fff',
    },
    statsSection: {
        marginBottom: 25,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: '45%',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#9C27B0',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    tipsSection: {
        marginBottom: 20,
    },
    tipCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#9C27B0',
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
});