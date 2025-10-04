import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function MenuManagementScreen() {
    const menuCategories = [
        {
            name: 'Pizzas',
            items: 12,
            icon: '🍕',
            color: '#FF6B6B',
        },
        {
            name: 'Sides & Appetizers',
            items: 8,
            icon: '🍗',
            color: '#4CAF50',
        },
        {
            name: 'Beverages',
            items: 6,
            icon: '🥤',
            color: '#2196F3',
        },
        {
            name: 'Desserts',
            items: 4,
            icon: '🍰',
            color: '#FF9800',
        },
    ];

    const recentItems = [
        {
            id: 1,
            name: 'Margherita Pizza',
            category: 'Pizzas',
            price: 16.99,
            status: 'Active',
            lastUpdated: '2 hours ago',
        },
        {
            id: 2,
            name: 'Buffalo Wings',
            category: 'Sides',
            price: 12.99,
            status: 'Active',
            lastUpdated: '1 day ago',
        },
        {
            id: 3,
            name: 'Chocolate Lava Cake',
            category: 'Desserts',
            price: 7.99,
            status: 'Inactive',
            lastUpdated: '3 days ago',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🍕 Menu Management</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.quickStats}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>30</Text>
                        <Text style={styles.statLabel}>Total Items</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>4</Text>
                        <Text style={styles.statLabel}>Categories</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>27</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                </View>

                <View style={styles.categoriesSection}>
                    <Text style={styles.sectionTitle}>Menu Categories</Text>

                    {menuCategories.map((category, index) => (
                        <TouchableOpacity key={index} style={[styles.categoryCard, { borderLeftColor: category.color }]}>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <View style={styles.categoryDetails}>
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                    <Text style={styles.categoryItemCount}>{category.items} items</Text>
                                </View>
                            </View>
                            <View style={styles.categoryActions}>
                                <TouchableOpacity style={styles.editButton}>
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <Text style={styles.arrow}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Items</Text>
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.itemCard}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemCategory}>{item.category}</Text>
                                <Text style={styles.itemUpdated}>Updated {item.lastUpdated}</Text>
                            </View>
                            <View style={styles.itemMeta}>
                                <Text style={styles.itemPrice}>${item.price}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: item.status === 'Active' ? '#4CAF50' : '#FF9800' }
                                ]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>➕</Text>
                        <Text style={styles.actionText}>Add New Menu Item</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>📁</Text>
                        <Text style={styles.actionText}>Manage Categories</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionText}>Update Pricing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>📊</Text>
                        <Text style={styles.actionText}>Menu Analytics</Text>
                    </TouchableOpacity>
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
        backgroundColor: '#2196F3',
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
    quickStats: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    categoriesSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    categoryCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    categoryItemCount: {
        fontSize: 14,
        color: '#666',
    },
    categoryActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    editButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    recentSection: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    viewAllButton: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    viewAllText: {
        color: '#2196F3',
        fontSize: 12,
        fontWeight: '600',
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    itemCategory: {
        fontSize: 14,
        color: '#2196F3',
        marginBottom: 2,
    },
    itemUpdated: {
        fontSize: 12,
        color: '#666',
    },
    itemMeta: {
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionsSection: {
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 15,
    },
    actionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});