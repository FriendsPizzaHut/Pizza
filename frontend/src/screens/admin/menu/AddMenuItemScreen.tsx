import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, StatusBar, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { createProductThunk } from '../../../../redux/thunks/productThunks';
import { clearMessages } from '../../../../redux/slices/productSlice';
import { uploadImage, isLocalFileUri } from '../../../utils/imageUpload';

export default function AddMenuItemScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const dispatch = useDispatch<AppDispatch>();
    const { isCreating, error, successMessage } = useSelector((state: RootState) => state.product);

    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        category: 'pizza' as 'pizza' | 'sides' | 'beverages' | 'desserts',
        // For pizza: multi-size pricing
        priceSmall: '',
        priceMedium: '',
        priceLarge: '',
        // For other items: single price
        price: '',
        imageUrl: '', // Temporary - will be replaced with actual image picker
        isVegetarian: false,
        isAvailable: true,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Image upload state
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Toppings state (only for pizza)
    const [toppings, setToppings] = useState<Array<{ name: string; category: 'vegetables' | 'meat' | 'cheese' | 'sauce' }>>([]);

    // Topping modal state
    const [showToppingModal, setShowToppingModal] = useState(false);
    const [selectedToppingCategory, setSelectedToppingCategory] = useState<'vegetables' | 'meat' | 'cheese' | 'sauce' | null>(null);

    const categories: Array<{ value: 'pizza' | 'sides' | 'beverages' | 'desserts', label: string }> = [
        { value: 'pizza', label: 'Pizzas' },
        { value: 'sides', label: 'Sides' },
        { value: 'beverages', label: 'Beverages' },
        { value: 'desserts', label: 'Desserts' },
    ];

    // Topping options by category
    const toppingOptions = {
        vegetables: [
            { name: 'Mushrooms', icon: '🍄' },
            { name: 'Onions', icon: '🧅' },
            { name: 'Bell Peppers', icon: '🫑' },
            { name: 'Olives', icon: '🫒' },
            { name: 'Tomatoes', icon: '🍅' },
            { name: 'Spinach', icon: '🥬' },
            { name: 'Jalapenos', icon: '🌶️' },
            { name: 'Pineapple', icon: '🍍' },
        ],
        meat: [
            { name: 'Pepperoni', icon: '🍖' },
            { name: 'Sausage', icon: '🌭' },
            { name: 'Bacon', icon: '🥓' },
            { name: 'Ham', icon: '🍖' },
            { name: 'Chicken', icon: '🍗' },
            { name: 'Beef', icon: '🥩' },
        ],
        cheese: [
            { name: 'Mozzarella', icon: '🧀' },
            { name: 'Parmesan', icon: '🧀' },
            { name: 'Cheddar', icon: '🧀' },
            { name: 'Feta', icon: '🧀' },
            { name: 'Ricotta', icon: '🧀' },
            { name: 'Goat Cheese', icon: '🧀' },
        ],
        sauce: [
            { name: 'Marinara', icon: '🍅' },
            { name: 'BBQ Sauce', icon: '🍖' },
            { name: 'Pesto', icon: '🌿' },
            { name: 'Alfredo', icon: '🥛' },
            { name: 'Ranch', icon: '🥗' },
            { name: 'Buffalo', icon: '🌶️' },
        ],
    };

    const handleAddTopping = (toppingName: string, category: 'vegetables' | 'meat' | 'cheese' | 'sauce') => {
        // Check if topping already exists
        const exists = toppings.some(t => t.name === toppingName && t.category === category);
        if (!exists) {
            setToppings([...toppings, { name: toppingName, category }]);
        }
        setShowToppingModal(false);
        setSelectedToppingCategory(null);
    };

    // Request image picker permissions
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need camera roll permissions to upload product images.',
                    [{ text: 'OK' }]
                );
            }
        })();
    }, []);

    // Clear messages when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearMessages());
        };
    }, [dispatch]);

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                // Also update imageUrl in itemData for preview
                setItemData({ ...itemData, imageUrl: result.assets[0].uri });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setItemData({ ...itemData, imageUrl: '' });
    };

    const validateForm = (): boolean => {
        if (!itemData.name.trim()) {
            Alert.alert('Missing Information', 'Please enter item name');
            return false;
        }
        if (!itemData.description.trim()) {
            Alert.alert('Missing Information', 'Please enter item description');
            return false;
        }

        // Validate image
        if (!selectedImage) {
            Alert.alert('Missing Information', 'Please select a product image');
            return false;
        }

        // Validate pricing based on category
        if (itemData.category === 'pizza') {
            // For pizza, at least one size must have a price
            const hasSmall = itemData.priceSmall && parseFloat(itemData.priceSmall) > 0;
            const hasMedium = itemData.priceMedium && parseFloat(itemData.priceMedium) > 0;
            const hasLarge = itemData.priceLarge && parseFloat(itemData.priceLarge) > 0;

            if (!hasSmall && !hasMedium && !hasLarge) {
                Alert.alert('Missing Pricing', 'Please enter at least one pizza size price');
                return false;
            }
        } else {
            // For other items, validate single price
            if (!itemData.price || parseFloat(itemData.price) <= 0) {
                Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
                return false;
            }
        }

        // Image is optional for now (will use default or selected image)
        // Prep time will be auto-assigned by backend
        return true;
    };

    const handleSaveItem = async () => {
        // Clear previous messages
        dispatch(clearMessages());

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            // Upload image to Cloudinary if it's a local file
            let cloudinaryImageUrl = '';

            if (selectedImage && isLocalFileUri(selectedImage)) {
                setIsUploadingImage(true);
                console.log('📤 Uploading image to Cloudinary...');

                try {
                    cloudinaryImageUrl = await uploadImage(selectedImage, 'product');
                    console.log('✅ Image uploaded successfully:', cloudinaryImageUrl);
                } catch (uploadError: any) {
                    setIsUploadingImage(false);
                    Alert.alert(
                        'Image Upload Failed',
                        `Failed to upload image: ${uploadError.message}\n\nWould you like to continue without an image?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Continue',
                                onPress: () => {
                                    // Continue with default placeholder
                                    cloudinaryImageUrl = 'https://via.placeholder.com/400x300?text=Menu+Item';
                                    proceedWithSave(cloudinaryImageUrl);
                                }
                            }
                        ]
                    );
                    return;
                }

                setIsUploadingImage(false);
            } else if (selectedImage) {
                // Already a cloud URL (http/https)
                cloudinaryImageUrl = selectedImage;
            } else if (itemData.imageUrl.trim()) {
                // Use provided URL
                cloudinaryImageUrl = itemData.imageUrl.trim();
            } else {
                // Use placeholder
                cloudinaryImageUrl = 'https://via.placeholder.com/400x300?text=Menu+Item';
            }

            await proceedWithSave(cloudinaryImageUrl);
        } catch (err: any) {
            setIsUploadingImage(false);
            Alert.alert('Error', err.message || 'Failed to create product');
        }
    };

    const proceedWithSave = async (imageUrl: string) => {
        // Prepare pricing based on category
        let pricing: number | { small?: number; medium?: number; large?: number };

        if (itemData.category === 'pizza') {
            // For pizza: create object with available sizes
            pricing = {};
            if (itemData.priceSmall && parseFloat(itemData.priceSmall) > 0) {
                pricing.small = parseFloat(itemData.priceSmall);
            }
            if (itemData.priceMedium && parseFloat(itemData.priceMedium) > 0) {
                pricing.medium = parseFloat(itemData.priceMedium);
            }
            if (itemData.priceLarge && parseFloat(itemData.priceLarge) > 0) {
                pricing.large = parseFloat(itemData.priceLarge);
            }
        } else {
            // For other items: single price
            pricing = parseFloat(itemData.price);
        }

        // Prepare product data
        const productData: any = {
            name: itemData.name.trim(),
            description: itemData.description.trim(),
            category: itemData.category,
            pricing,
            imageUrl, // Use Cloudinary URL
            isVegetarian: itemData.isVegetarian,
            isAvailable: itemData.isAvailable,
            // preparationTime will be auto-assigned by backend based on category
        };

        // Add toppings if pizza category and toppings exist
        if (itemData.category === 'pizza' && toppings.length > 0) {
            productData.toppings = toppings;
        }

        try {
            const result: any = await dispatch(createProductThunk(productData));

            if (result.success) {
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
            } else {
                Alert.alert('Error', result.error || 'Failed to create product');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create product');
        }
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
                            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
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
                                    key={category.value}
                                    style={[
                                        styles.categoryButton,
                                        itemData.category === category.value && styles.selectedCategory
                                    ]}
                                    onPress={() => setItemData({ ...itemData, category: category.value })}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        itemData.category === category.value && styles.selectedCategoryText
                                    ]}>
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Pricing */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="attach-money" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Pricing</Text>
                        </View>

                        {itemData.category === 'pizza' ? (
                            // Multi-size pricing for pizza
                            <>
                                <Text style={styles.label}>Pizza Sizes <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.helperText}>Enter price for at least one size</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.sizeLabel}>Small (10")</Text>
                                    <View style={styles.inputWithIcon}>
                                        <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputWithPadding]}
                                            value={itemData.priceSmall}
                                            onChangeText={(text) => setItemData({ ...itemData, priceSmall: text })}
                                            placeholder="9.99"
                                            placeholderTextColor="#999"
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.sizeLabel}>Medium (12")</Text>
                                    <View style={styles.inputWithIcon}>
                                        <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputWithPadding]}
                                            value={itemData.priceMedium}
                                            onChangeText={(text) => setItemData({ ...itemData, priceMedium: text })}
                                            placeholder="14.99"
                                            placeholderTextColor="#999"
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.sizeLabel}>Large (16")</Text>
                                    <View style={styles.inputWithIcon}>
                                        <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputWithPadding]}
                                            value={itemData.priceLarge}
                                            onChangeText={(text) => setItemData({ ...itemData, priceLarge: text })}
                                            placeholder="18.99"
                                            placeholderTextColor="#999"
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </View>

                                <Text style={styles.helperText}>Preparation time: ~20 minutes</Text>
                            </>
                        ) : (
                            // Single price for other items
                            <View style={styles.inputGroup}>
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
                                <Text style={styles.helperText}>
                                    Preparation time: ~{
                                        itemData.category === 'sides' ? '10' :
                                            itemData.category === 'beverages' ? '2' : '5'
                                    } minutes
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Toppings (Pizza Only) */}
                    {itemData.category === 'pizza' && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="restaurant" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Pizza Toppings (Optional)</Text>
                            </View>
                            <Text style={[styles.helperText, { marginBottom: 12 }]}>Add toppings to customize your pizza</Text>

                            {/* Toppings List */}
                            {toppings.map((topping, index) => (
                                <View key={index} style={styles.toppingItem}>
                                    <View style={styles.toppingInfo}>
                                        <Text style={styles.toppingName}>{topping.name}</Text>
                                        <Text style={styles.toppingCategory}>
                                            {topping.category.charAt(0).toUpperCase() + topping.category.slice(1)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const newToppings = toppings.filter((_, i) => i !== index);
                                            setToppings(newToppings);
                                        }}
                                        style={styles.removeToppingButton}
                                    >
                                        <MaterialIcons name="close" size={18} color="#cb202d" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Add Topping Button */}
                            <TouchableOpacity
                                style={styles.addToppingButton}
                                onPress={() => setShowToppingModal(true)}
                            >
                                <MaterialIcons name="add" size={20} color="#cb202d" />
                                <Text style={styles.addToppingText}>Add Topping</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Image Upload */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="image" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Item Image <Text style={styles.required}>*</Text></Text>
                        </View>

                        {selectedImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={removeImage}
                                    style={styles.removeImageButton}
                                >
                                    <MaterialIcons name="close" size={20} color="#cb202d" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleImagePick}
                                    style={styles.changeImageButtonOverlay}
                                >
                                    <MaterialIcons name="edit" size={16} color="#fff" />
                                    <Text style={styles.changeImageTextOverlay}>Change Image</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={handleImagePick}
                                disabled={isCreating}
                            >
                                <MaterialIcons name="add-photo-alternate" size={48} color="#94A3B8" />
                                <Text style={styles.uploadButtonText}>Upload Product Image</Text>
                                <Text style={styles.uploadButtonSubtext}>Tap to select from gallery</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.helperText}>Upload a clear photo of the menu item. Recommended size: 800x600px</Text>
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
                                {selectedImage || itemData.imageUrl ? (
                                    <Image
                                        source={{ uri: selectedImage || itemData.imageUrl || 'https://via.placeholder.com/400x300?text=Menu+Item' }}
                                        style={styles.previewImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.previewImagePlaceholder}>
                                        <MaterialIcons name="image" size={48} color="#ccc" />
                                        <Text style={styles.previewImageText}>Preview Image</Text>
                                    </View>
                                )}

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
                                {/* Item Name */}
                                <Text style={styles.previewName}>
                                    {itemData.name || 'Item Name'}
                                </Text>

                                {/* Rating (prep time will be auto-assigned) */}
                                <View style={styles.previewRatingContainer}>
                                    <View style={styles.previewRatingBadge}>
                                        <Text style={styles.previewRatingText}>★ 4.0</Text>
                                    </View>
                                    <Text style={styles.previewReviews}>(New Item)</Text>
                                </View>

                                {/* Description */}
                                <Text style={styles.previewDescription} numberOfLines={2}>
                                    {itemData.description || 'Item description will appear here...'}
                                </Text>

                                {/* Tags */}
                                {itemData.isVegetarian && (
                                    <View style={styles.previewTagsRow}>
                                        <View style={styles.previewTag}>
                                            <MaterialIcons name="eco" size={12} color="#4CAF50" />
                                            <Text style={styles.previewTagText}>Vegetarian</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Price Section */}
                                <View style={styles.previewPriceContainer}>
                                    {itemData.category === 'pizza' ? (
                                        // Show price range for pizza
                                        <Text style={styles.previewPrice}>
                                            {(() => {
                                                const prices = [
                                                    itemData.priceSmall ? parseFloat(itemData.priceSmall) : null,
                                                    itemData.priceMedium ? parseFloat(itemData.priceMedium) : null,
                                                    itemData.priceLarge ? parseFloat(itemData.priceLarge) : null,
                                                ].filter((p): p is number => p !== null && !isNaN(p));

                                                if (prices.length === 0) return '₹0';
                                                if (prices.length === 1) return `₹${prices[0].toFixed(0)}`;

                                                const minPrice = Math.min(...prices);
                                                const maxPrice = Math.max(...prices);
                                                return `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}`;
                                            })()}
                                        </Text>
                                    ) : (
                                        // Show single price for other items
                                        <Text style={styles.previewPrice}>
                                            ${itemData.price || '0.00'}
                                        </Text>
                                    )}
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
                <TouchableOpacity
                    style={[styles.saveButton, (isCreating || isUploadingImage) && styles.saveButtonDisabled]}
                    onPress={handleSaveItem}
                    disabled={isCreating || isUploadingImage}
                >
                    {isUploadingImage ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.saveButtonText}>Uploading Image...</Text>
                        </>
                    ) : isCreating ? (
                        <>
                            <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Creating...</Text>
                        </>
                    ) : (
                        <>
                            <MaterialIcons name="check" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Menu Item</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Topping Selection Modal */}
            <Modal
                visible={showToppingModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowToppingModal(false);
                    setSelectedToppingCategory(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {!selectedToppingCategory ? (
                            // Category Selection View
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select Topping Category</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowToppingModal(false)}
                                        style={styles.modalCloseButton}
                                    >
                                        <MaterialIcons name="close" size={24} color="#2d2d2d" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.categoryList}>
                                    <TouchableOpacity
                                        style={styles.categoryCard}
                                        onPress={() => setSelectedToppingCategory('vegetables')}
                                    >
                                        <Text style={styles.categoryCardIcon}>🥬</Text>
                                        <Text style={styles.categoryCardTitle}>Vegetables</Text>
                                        <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.categoryCard}
                                        onPress={() => setSelectedToppingCategory('meat')}
                                    >
                                        <Text style={styles.categoryCardIcon}>🍖</Text>
                                        <Text style={styles.categoryCardTitle}>Meat</Text>
                                        <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.categoryCard}
                                        onPress={() => setSelectedToppingCategory('cheese')}
                                    >
                                        <Text style={styles.categoryCardIcon}>🧀</Text>
                                        <Text style={styles.categoryCardTitle}>Cheese</Text>
                                        <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.categoryCard}
                                        onPress={() => setSelectedToppingCategory('sauce')}
                                    >
                                        <Text style={styles.categoryCardIcon}>🍅</Text>
                                        <Text style={styles.categoryCardTitle}>Sauce</Text>
                                        <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        ) : (
                            // Topping Selection View
                            <>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        onPress={() => setSelectedToppingCategory(null)}
                                        style={styles.modalBackButton}
                                    >
                                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>
                                        {selectedToppingCategory.charAt(0).toUpperCase() + selectedToppingCategory.slice(1)}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowToppingModal(false);
                                            setSelectedToppingCategory(null);
                                        }}
                                        style={styles.modalCloseButton}
                                    >
                                        <MaterialIcons name="close" size={24} color="#2d2d2d" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.toppingGrid}>
                                    <View style={styles.toppingGridContainer}>
                                        {toppingOptions[selectedToppingCategory].map((topping, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.toppingChip,
                                                    toppings.some(t => t.name === topping.name) && styles.toppingChipSelected
                                                ]}
                                                onPress={() => handleAddTopping(topping.name, selectedToppingCategory)}
                                            >
                                                <Text style={styles.toppingChipIcon}>{topping.icon}</Text>
                                                <Text style={[
                                                    styles.toppingChipText,
                                                    toppings.some(t => t.name === topping.name) && styles.toppingChipTextSelected
                                                ]}>
                                                    {topping.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    helperText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
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

    // Image Upload styles (matching DeliveryBoySignup)
    uploadButton: {
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 12,
    },
    uploadButtonSubtext: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 4,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    imagePreview: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FFFFFF',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    changeImageButtonOverlay: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cb202d',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#cb202d',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    changeImageTextOverlay: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
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
    previewImage: {
        width: '100%',
        height: '100%',
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
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // Size labels for pizza pricing
    sizeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 6,
    },

    // Toppings styles
    toppingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    toppingInfo: {
        flex: 1,
    },
    toppingName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    toppingCategory: {
        fontSize: 12,
        color: '#8E8E93',
        textTransform: 'capitalize',
    },
    removeToppingButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFE5E7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToppingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#cb202d',
        borderStyle: 'dashed',
        padding: 12,
        borderRadius: 8,
        gap: 6,
    },
    addToppingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#cb202d',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'center',
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryList: {
        padding: 16,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    categoryCardIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    categoryCardTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    toppingGrid: {
        padding: 16,
    },
    toppingGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    toppingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        gap: 6,
    },
    toppingChipSelected: {
        backgroundColor: '#FFE5E7',
        borderColor: '#cb202d',
    },
    toppingChipIcon: {
        fontSize: 18,
    },
    toppingChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    toppingChipTextSelected: {
        color: '#cb202d',
    },
});