import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function AddMenuItemScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
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

    const categories = ['Pizzas', 'Sides', 'Beverages', 'Desserts'];

    const handleSaveItem = () => {
        // Validate required fields
        if (!itemData.name || !itemData.price || !itemData.preparationTime) {
            Alert.alert('Missing Information', 'Please fill in all required fields (Name, Price, Prep Time)');
            return;
        }

        // Handle save item
        Alert.alert(
            'Success',
            'Menu item has been added successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Add Menu Item</Text>
                        <Text style={styles.headerSubtitle}>Create new menu item</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    {/* Basic Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="info" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Item Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={itemData.name}
                                onChangeText={(text) => setItemData({ ...itemData, name: text })}
                                placeholder="e.g., Margherita Pizza"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={itemData.description}
                                onChangeText={(text) => setItemData({ ...itemData, description: text })}
                                placeholder="Describe your menu item..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    {/* Category Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="category" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Category <Text style={styles.required}>*</Text></Text>
                        </View>
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

                    {/* Pricing & Time */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="attach-money" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Pricing & Time</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Price ($) <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithPadding]}
                                        value={itemData.price}
                                        onChangeText={(text) => setItemData({ ...itemData, price: text })}
                                        placeholder="0.00"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Prep Time <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <MaterialIcons name="schedule" size={20} color="#8E8E93" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithPadding]}
                                        value={itemData.preparationTime}
                                        onChangeText={(text) => setItemData({ ...itemData, preparationTime: text })}
                                        placeholder="15 mins"
                                        placeholderTextColor="#999"
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Ingredients */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="restaurant" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Ingredients</Text>
                        </View>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={itemData.ingredients}
                                onChangeText={(text) => setItemData({ ...itemData, ingredients: text })}
                                placeholder="e.g., Tomato sauce, Mozzarella, Basil..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </View>

                    {/* Image Upload */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="image" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Item Image</Text>
                        </View>
                        <TouchableOpacity style={styles.imageUpload}>
                            <MaterialIcons name="add-photo-alternate" size={48} color="#8E8E93" />
                            <Text style={styles.imageUploadText}>Upload Image</Text>
                            <Text style={styles.imageUploadSubtext}>Tap to select from gallery</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Item Options */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="tune" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Item Options</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.optionRow}
                            onPress={() => setItemData({ ...itemData, isVegetarian: !itemData.isVegetarian })}
                        >
                            <MaterialIcons name="eco" size={20} color="#4CAF50" />
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>Vegetarian</Text>
                                <Text style={styles.optionSubtext}>Mark as vegetarian item</Text>
                            </View>
                            <View style={[
                                styles.switch,
                                itemData.isVegetarian && styles.switchActive
                            ]}>
                                <View style={[
                                    styles.switchThumb,
                                    itemData.isVegetarian && styles.switchThumbActive
                                ]} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionRow}
                            onPress={() => setItemData({ ...itemData, isSpicy: !itemData.isSpicy })}
                        >
                            <MaterialIcons name="local-fire-department" size={20} color="#FF5722" />
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>Spicy</Text>
                                <Text style={styles.optionSubtext}>Mark as spicy item</Text>
                            </View>
                            <View style={[
                                styles.switch,
                                itemData.isSpicy && styles.switchActive
                            ]}>
                                <View style={[
                                    styles.switchThumb,
                                    itemData.isSpicy && styles.switchThumbActive
                                ]} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionRow}
                            onPress={() => setItemData({ ...itemData, isAvailable: !itemData.isAvailable })}
                        >
                            <MaterialIcons name="check-circle" size={20} color="#2196F3" />
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>Available</Text>
                                <Text style={styles.optionSubtext}>Item available for ordering</Text>
                            </View>
                            <View style={[
                                styles.switch,
                                itemData.isAvailable && styles.switchActive
                            ]}>
                                <View style={[
                                    styles.switchThumb,
                                    itemData.isAvailable && styles.switchThumbActive
                                ]} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Preview */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="visibility" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Customer Preview</Text>
                        </View>
                        <View style={styles.previewCard}>
                            {/* Image Section at Top */}
                            <View style={styles.previewImageSection}>
                                <View style={styles.previewImagePlaceholder}>
                                    <MaterialIcons name="image" size={48} color="#ccc" />
                                    <Text style={styles.previewImageText}>Preview Image</Text>
                                </View>

                                {/* Badges over image */}
                                <View style={styles.previewBadgesContainer}>
                                    <View style={[styles.previewVegIndicator, { borderColor: itemData.isVegetarian ? '#0F8A65' : '#D32F2F' }]}>
                                        <View style={[styles.previewVegDot, { backgroundColor: itemData.isVegetarian ? '#0F8A65' : '#D32F2F' }]} />
                                    </View>
                                </View>

                                {/* ADD button over image */}
                                <View style={styles.previewAddButton}>
                                    <Text style={styles.previewAddButtonText}>ADD</Text>
                                </View>
                            </View>

                            {/* Content Section Below Image */}
                            <View style={styles.previewContentSection}>
                                {/* Pizza Name */}
                                <Text style={styles.previewName}>
                                    {itemData.name || 'Item Name'}
                                </Text>

                                {/* Rating and Time */}
                                <View style={styles.previewRatingContainer}>
                                    <View style={styles.previewRatingBadge}>
                                        <Text style={styles.previewRatingText}>★ 4.5</Text>
                                    </View>
                                    <Text style={styles.previewReviews}>(0)</Text>
                                    {itemData.preparationTime && (
                                        <Text style={styles.previewPrepTime}>• {itemData.preparationTime} min</Text>
                                    )}
                                </View>

                                {/* Description */}
                                <Text style={styles.previewDescription} numberOfLines={2}>
                                    {itemData.description || 'Item description will appear here...'}
                                </Text>

                                {/* Tags */}
                                {(itemData.isSpicy || itemData.isVegetarian) && (
                                    <View style={styles.previewTagsRow}>
                                        {itemData.isVegetarian && (
                                            <View style={styles.previewTag}>
                                                <MaterialIcons name="eco" size={12} color="#4CAF50" />
                                                <Text style={styles.previewTagText}>Vegetarian</Text>
                                            </View>
                                        )}
                                        {itemData.isSpicy && (
                                            <View style={styles.previewTag}>
                                                <MaterialIcons name="local-fire-department" size={12} color="#FF5722" />
                                                <Text style={styles.previewTagText}>Spicy</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Price Section */}
                                <View style={styles.previewPriceContainer}>
                                    <Text style={styles.previewPrice}>
                                        ${itemData.price || '0.00'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Bottom spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Menu Item</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#f4f4f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    headerRight: {
        width: 44,
    },

    content: {
        flex: 1,
    },
    form: {
        padding: 16,
    },

    // Section Style
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Input Fields
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 8,
    },
    required: {
        color: '#cb202d',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#2d2d2d',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    inputWithIcon: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 1,
    },
    inputWithPadding: {
        paddingLeft: 40,
    },

    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },

    // Category Selection
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    selectedCategory: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    selectedCategoryText: {
        color: '#fff',
    },

    // Image Upload
    imageUpload: {
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
    },
    imageUploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        marginTop: 8,
    },
    imageUploadSubtext: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 4,
    },

    // Options with Toggle Switch
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    optionInfo: {
        flex: 1,
        marginLeft: 4,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    optionSubtext: {
        fontSize: 13,
        color: '#8E8E93',
    },
    switch: {
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E0E0E0',
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: {
        backgroundColor: '#4CAF50',
    },
    switchThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },

    // Preview Card (matching MenuScreen style)
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
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
    previewImageSection: {
        position: 'relative',
        height: 200,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImageText: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    previewBadgesContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewVegIndicator: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    previewVegDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    previewAddButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#cb202d',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    previewAddButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.5,
    },
    previewContentSection: {
        padding: 16,
    },
    previewName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 6,
        lineHeight: 22,
    },
    previewRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    previewRatingBadge: {
        backgroundColor: '#0F8A65',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 1,
        marginRight: 6,
    },
    previewRatingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    previewReviews: {
        fontSize: 12,
        color: '#666',
        marginRight: 4,
    },
    previewPrepTime: {
        fontSize: 12,
        color: '#666',
    },
    previewDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    previewTagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    previewTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    previewTagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },
    previewPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    previewPrice: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d2d2d',
    },

    // Footer
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButton: {
        backgroundColor: '#cb202d',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});