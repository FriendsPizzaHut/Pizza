import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';

export default function AddMenuItemScreen() {
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        category: 'Pizza',
        price: '',
        preparationTime: '',
        ingredients: '',
        isVegetarian: false,
        isSpicy: false,
        isAvailable: true,
    });

    const categories = ['Pizza', 'Sides', 'Drinks', 'Desserts'];

    const handleSaveItem = () => {
        // Handle save item
        console.log('Saving item:', itemData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>➕ Add Menu Item</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Item Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={itemData.name}
                            onChangeText={(text) => setItemData({ ...itemData, name: text })}
                            placeholder="Enter item name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={itemData.description}
                            onChangeText={(text) => setItemData({ ...itemData, description: text })}
                            placeholder="Enter item description"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        itemData.category === category && styles.selectedCategory
                                    ]}
                                    onPress={() => setItemData({ ...itemData, category })}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        itemData.category === category && styles.selectedCategoryText
                                    ]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Price ($) *</Text>
                            <TextInput
                                style={styles.input}
                                value={itemData.price}
                                onChangeText={(text) => setItemData({ ...itemData, price: text })}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Prep Time (mins) *</Text>
                            <TextInput
                                style={styles.input}
                                value={itemData.preparationTime}
                                onChangeText={(text) => setItemData({ ...itemData, preparationTime: text })}
                                placeholder="15"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ingredients</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={itemData.ingredients}
                            onChangeText={(text) => setItemData({ ...itemData, ingredients: text })}
                            placeholder="List main ingredients (comma separated)"
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    <View style={styles.imageSection}>
                        <Text style={styles.label}>Item Image</Text>
                        <TouchableOpacity style={styles.imageUpload}>
                            <Text style={styles.imageUploadText}>📷 Upload Image</Text>
                            <Text style={styles.imageUploadSubtext}>Tap to select image</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionsSection}>
                        <Text style={styles.label}>Item Options</Text>

                        <TouchableOpacity
                            style={styles.optionRow}
                            onPress={() => setItemData({ ...itemData, isVegetarian: !itemData.isVegetarian })}
                        >
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>🌱 Vegetarian</Text>
                                <Text style={styles.optionSubtext}>Mark as vegetarian item</Text>
                            </View>
                            <View style={[
                                styles.checkbox,
                                itemData.isVegetarian && styles.checkedBox
                            ]}>
                                {itemData.isVegetarian && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionRow}
                            onPress={() => setItemData({ ...itemData, isSpicy: !itemData.isSpicy })}
                        >
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>🌶️ Spicy</Text>
                                <Text style={styles.optionSubtext}>Mark as spicy item</Text>
                            </View>
                            <View style={[
                                styles.checkbox,
                                itemData.isSpicy && styles.checkedBox
                            ]}>
                                {itemData.isSpicy && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionRow}
                            onPress={() => setItemData({ ...itemData, isAvailable: !itemData.isAvailable })}
                        >
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>✅ Available</Text>
                                <Text style={styles.optionSubtext}>Item available for ordering</Text>
                            </View>
                            <View style={[
                                styles.checkbox,
                                itemData.isAvailable && styles.checkedBox
                            ]}>
                                {itemData.isAvailable && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewSection}>
                        <Text style={styles.label}>Preview</Text>
                        <View style={styles.previewCard}>
                            <View style={styles.previewImage}>
                                <Text style={styles.previewImageText}>📷</Text>
                            </View>
                            <View style={styles.previewContent}>
                                <Text style={styles.previewName}>
                                    {itemData.name || 'Item Name'}
                                </Text>
                                <Text style={styles.previewDescription}>
                                    {itemData.description || 'Item description will appear here'}
                                </Text>
                                <View style={styles.previewTags}>
                                    {itemData.isVegetarian && (
                                        <View style={styles.previewTag}>
                                            <Text style={styles.previewTagText}>🌱 Veg</Text>
                                        </View>
                                    )}
                                    {itemData.isSpicy && (
                                        <View style={styles.previewTag}>
                                            <Text style={styles.previewTagText}>🌶️ Spicy</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.previewPrice}>
                                    ${itemData.price || '0.00'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                    <Text style={styles.saveButtonText}>💾 Save Item</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
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
        flex: 1,
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    halfWidth: {
        flex: 1,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    selectedCategory: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    imageSection: {
        marginBottom: 20,
    },
    imageUpload: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
    },
    imageUploadText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 5,
    },
    imageUploadSubtext: {
        fontSize: 14,
        color: '#999',
    },
    optionsSection: {
        marginBottom: 20,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    optionSubtext: {
        fontSize: 14,
        color: '#666',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedBox: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    previewSection: {
        marginBottom: 20,
    },
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        gap: 15,
    },
    previewImage: {
        width: 80,
        height: 80,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImageText: {
        fontSize: 24,
        color: '#ccc',
    },
    previewContent: {
        flex: 1,
    },
    previewName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    previewDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    previewTags: {
        flexDirection: 'row',
        gap: 5,
        marginBottom: 10,
    },
    previewTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    previewTagText: {
        fontSize: 12,
        color: '#666',
    },
    previewPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});