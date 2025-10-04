import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function CategoryManagementScreen() {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categories, setCategories] = useState([
        {
            id: '1',
            name: 'Pizza',
            itemCount: 12,
            isActive: true,
            order: 1,
        },
        {
            id: '2',
            name: 'Sides',
            itemCount: 8,
            isActive: true,
            order: 2,
        },
        {
            id: '3',
            name: 'Drinks',
            itemCount: 6,
            isActive: true,
            order: 3,
        },
        {
            id: '4',
            name: 'Desserts',
            itemCount: 4,
            isActive: false,
            order: 4,
        },
    ]);

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            const newCategory = {
                id: Date.now().toString(),
                name: newCategoryName.trim(),
                itemCount: 0,
                isActive: true,
                order: categories.length + 1,
            };
            setCategories([...categories, newCategory]);
            setNewCategoryName('');
        }
    };

    const handleToggleCategory = (id: string) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
        ));
    };

    const handleDeleteCategory = (id: string) => {
        const category = categories.find(cat => cat.id === id);
        const itemCount = category?.itemCount || 0;
        if (itemCount > 0) {
            Alert.alert(
                'Cannot Delete Category',
                `This category has ${itemCount} items. Please move or delete all items first.`,
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setCategories(categories.filter(cat => cat.id !== id));
                    }
                },
            ]
        );
    };

    const moveCategory = (id: string, direction: 'up' | 'down') => {
        const currentIndex = categories.findIndex(cat => cat.id === id);
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
                <View style={styles.addSection}>
                    <Text style={styles.sectionTitle}>Add New Category</Text>
                    <View style={styles.addCategoryForm}>
                        <TextInput
                            style={styles.categoryInput}
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholder="Enter category name"
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                        >
                            <Text style={styles.addButtonText}>➕ Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.categoriesSection}>
                    <Text style={styles.sectionTitle}>Current Categories</Text>

                    {categories.map((category, index) => (
                        <View key={category.id} style={styles.categoryCard}>
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryInfo}>
                                    <Text style={[
                                        styles.categoryName,
                                        !category.isActive && styles.inactiveText
                                    ]}>
                                        {category.name}
                                    </Text>
                                    <Text style={styles.categoryMeta}>
                                        {category.itemCount || 0} items • Order: {category.order}
                                    </Text>
                                </View>

                                <View style={styles.categoryActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => moveCategory(category.id, 'up')}
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
                                        onPress={() => moveCategory(category.id, 'down')}
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
                                    onPress={() => handleToggleCategory(category.id)}
                                >
                                    <Text style={[
                                        styles.controlButtonText,
                                        category.isActive ? styles.activeButtonText : styles.inactiveButtonText
                                    ]}>
                                        {category.isActive ? '✅ Active' : '❌ Inactive'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => console.log('Edit category:', category.id)}
                                >
                                    <Text style={styles.editButtonText}>✏️ Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteCategory(category.id)}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
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
                                {Math.round(categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0) / categories.length)}
                            </Text>
                            <Text style={styles.statLabel}>Avg Items per Category</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>💡 Tips</Text>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipText}>
                            • Categories with items cannot be deleted. Move or delete items first.
                        </Text>
                        <Text style={styles.tipText}>
                            • Use the arrow buttons to reorder categories for your menu display.
                        </Text>
                        <Text style={styles.tipText}>
                            • Inactive categories are hidden from customers but still accessible to admin.
                        </Text>
                        <Text style={styles.tipText}>
                            • Keep category names short and descriptive for better user experience.
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
    editButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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