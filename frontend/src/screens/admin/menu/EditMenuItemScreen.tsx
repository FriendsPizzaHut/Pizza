import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { fetchProductByIdThunk, updateProductThunk, deleteProductThunk, refreshProductsThunk } from '../../../../redux/thunks/productThunks';
import { clearMessages } from '../../../../redux/slices/productSlice';
import { uploadImage, isLocalFileUri } from '../../../utils/imageUpload';
import { Product } from '../../../services/productService';
import { FOOD_CATEGORIES, CategoryId, isMultiSizeCategory } from '../../../constants/foodCategories';

export default function EditMenuItemScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    const dispatch = useDispatch<AppDispatch>();

    // Get itemId from route params
    const { itemId } = route.params as { itemId: string };

    // Redux state
    const { selectedProduct, isLoading, isUpdating, error } = useSelector((state: RootState) => state.product);

    // Local state
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        category: 'pizza' as CategoryId,
        // For pizza: multi-size pricing
        priceSmall: '',
        priceMedium: '',
        priceLarge: '',
        // For other items: single price
        price: '',
        imageUrl: '',
        isVegetarian: false,
        isAvailable: true,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Toppings state (only for pizza)
    const [toppings, setToppings] = useState<Array<{ name: string; category: 'vegetables' | 'meat' | 'cheese' | 'sauce' }>>([]);

    // Topping modal state
    const [showToppingModal, setShowToppingModal] = useState(false);
    const [selectedToppingCategory, setSelectedToppingCategory] = useState<'vegetables' | 'meat' | 'cheese' | 'sauce' | null>(null);

    const categories = FOOD_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => ({
        value: cat.id as CategoryId,
        label: cat.label,
        icon: cat.icon
    }));

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

    // Load product data on mount
    useEffect(() => {
        const loadProduct = async () => {
            await dispatch(fetchProductByIdThunk(itemId));
        };
        loadProduct();

        return () => {
            dispatch(clearMessages());
        };
    }, [dispatch, itemId]);

    // Update local state when product is loaded
    useEffect(() => {
        if (selectedProduct && selectedProduct._id === itemId) {
            const product = selectedProduct;

            // Handle pricing based on category
            let priceSmall = '', priceMedium = '', priceLarge = '', price = '';

            if (product.category === 'pizza' && typeof product.pricing === 'object') {
                priceSmall = product.pricing.small?.toString() || '';
                priceMedium = product.pricing.medium?.toString() || '';
                priceLarge = product.pricing.large?.toString() || '';
            } else if (typeof product.pricing === 'number') {
                price = product.pricing.toString();
            }

            setItemData({
                name: product.name,
                description: product.description,
                category: product.category,
                priceSmall,
                priceMedium,
                priceLarge,
                price,
                imageUrl: product.imageUrl,
                isVegetarian: product.isVegetarian || false,
                isAvailable: product.isAvailable !== false,
            });

            setSelectedImage(product.imageUrl);

            // Load toppings if pizza
            if (product.category === 'pizza' && product.toppings) {
                setToppings(product.toppings);
            }
        }
    }, [selectedProduct, itemId]);

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

    const handleAddTopping = (toppingName: string, category: 'vegetables' | 'meat' | 'cheese' | 'sauce') => {
        const exists = toppings.some(t => t.name === toppingName && t.category === category);
        if (!exists) {
            setToppings([...toppings, { name: toppingName, category }]);
        }
        setShowToppingModal(false);
        setSelectedToppingCategory(null);
    };

    const handleRemoveTopping = (index: number) => {
        setToppings(toppings.filter((_, i) => i !== index));
    };

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
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const removeImage = () => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove the current image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setSelectedImage(null);
                        setItemData({ ...itemData, imageUrl: '' });
                    }
                }
            ]
        );
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

        // Validate pricing based on category
        if (isMultiSizeCategory(itemData.category)) {
            const hasSmall = itemData.priceSmall && parseFloat(itemData.priceSmall) > 0;
            const hasMedium = itemData.priceMedium && parseFloat(itemData.priceMedium) > 0;
            const hasLarge = itemData.priceLarge && parseFloat(itemData.priceLarge) > 0;

            if (!hasSmall && !hasMedium && !hasLarge) {
                Alert.alert('Missing Pricing', 'Please enter at least one pizza size price');
                return false;
            }
        } else {
            if (!itemData.price || parseFloat(itemData.price) <= 0) {
                Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
                return false;
            }
        }

        return true;
    };

    const handleSaveChanges = async () => {
        // Clear previous messages
        dispatch(clearMessages());

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            // Upload image if it's a new local file
            let cloudinaryImageUrl = itemData.imageUrl;

            if (selectedImage && isLocalFileUri(selectedImage) && selectedImage !== itemData.imageUrl) {
                setIsUploadingImage(true);

                try {
                    cloudinaryImageUrl = await uploadImage(selectedImage, 'product');
                } catch (uploadError: any) {
                    setIsUploadingImage(false);
                    Alert.alert(
                        'Image Upload Failed',
                        `Failed to upload image: ${uploadError.message}\n\nWould you like to continue without updating the image?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Continue',
                                onPress: () => proceedWithSave(itemData.imageUrl)
                            }
                        ]
                    );
                    return;
                }

                setIsUploadingImage(false);
            } else if (selectedImage) {
                cloudinaryImageUrl = selectedImage;
            }

            await proceedWithSave(cloudinaryImageUrl);
        } catch (err: any) {
            setIsUploadingImage(false);
            Alert.alert('Error', err.message || 'Failed to update product');
        }
    };

    const proceedWithSave = async (imageUrl: string) => {
        // Prepare pricing based on category
        let pricing: number | { small?: number; medium?: number; large?: number };

        if (isMultiSizeCategory(itemData.category)) {
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
            pricing = parseFloat(itemData.price);
        }

        // Prepare update data
        const updateData: any = {
            name: itemData.name.trim(),
            description: itemData.description.trim(),
            category: itemData.category,
            pricing,
            imageUrl,
            isVegetarian: itemData.isVegetarian,
            isAvailable: itemData.isAvailable,
        };

        // Add toppings if pizza category and toppings exist
        if (itemData.category === 'pizza' && toppings.length > 0) {
            updateData.toppings = toppings;
        }

        try {
            const result: any = await dispatch(updateProductThunk(itemId, updateData));

            if (result.success) {
                // Refresh the products list
                await dispatch(refreshProductsThunk({ limit: 10 }));

                Alert.alert(
                    'Success',
                    'Menu item has been updated successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to update product');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update product');
        }
    };

    const handleDeleteItem = () => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this menu item? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result: any = await dispatch(deleteProductThunk(itemId));

                        if (result.success) {
                            // Refresh the products list
                            await dispatch(refreshProductsThunk({ limit: 10 }));

                            Alert.alert(
                                'Deleted',
                                'Menu item has been deleted successfully.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.goBack(),
                                    },
                                ]
                            );
                        } else {
                            Alert.alert('Error', result.error || 'Failed to delete product');
                        }
                    },
                },
            ]
        );
    };

    // Show loading state while fetching product
    if (isLoading && !selectedProduct) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#cb202d" />
                <Text style={styles.loadingText}>Loading product...</Text>
            </View>
        );
    }

    // Show error if product not found
    if (!isLoading && !selectedProduct) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <MaterialIcons name="error-outline" size={48} color="#999" />
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity style={styles.backToListButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backToListText}>Back to Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>Edit Menu Item</Text>
                        <Text style={styles.headerSubtitle}>Update item details</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={handleDeleteItem}
                    >
                        <MaterialIcons name="delete-outline" size={24} color="#F44336" />
                    </TouchableOpacity>
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
                                        {category.icon} {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Pricing & Time */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="attach-money" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Pricing</Text>
                        </View>

                        {isMultiSizeCategory(itemData.category) ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Small (10")</Text>
                                    <View style={styles.inputWithIcon}>
                                        <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputWithPadding]}
                                            value={itemData.priceSmall}
                                            onChangeText={(text) => setItemData({ ...itemData, priceSmall: text })}
                                            placeholder="0.00"
                                            placeholderTextColor="#999"
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                    <Text style={styles.helperText}>Leave empty if not available</Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Medium (12")</Text>
                                    <View style={styles.inputWithIcon}>
                                        <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputWithPadding]}
                                            value={itemData.priceMedium}
                                            onChangeText={(text) => setItemData({ ...itemData, priceMedium: text })}
                                            placeholder="0.00"
                                            placeholderTextColor="#999"
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                    <Text style={styles.helperText}>Leave empty if not available</Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Large (14")</Text>
                                    <View style={styles.inputWithIcon}>
                                        <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputWithPadding]}
                                            value={itemData.priceLarge}
                                            onChangeText={(text) => setItemData({ ...itemData, priceLarge: text })}
                                            placeholder="0.00"
                                            placeholderTextColor="#999"
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                    <Text style={styles.helperText}>Leave empty if not available</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Price (₹) <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <MaterialIcons name="attach-money" size={20} color="#8E8E93" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithPadding]}
                                        value={itemData.price}
                                        onChangeText={(text) => setItemData({ ...itemData, price: text })}
                                        placeholder="0"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Toppings (Pizza Only) */}
                    {itemData.category === 'pizza' && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="restaurant" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Toppings (Optional)</Text>
                            </View>

                            {toppings.map((topping, index) => (
                                <View key={`${topping.name}-${index}`} style={styles.toppingItem}>
                                    <View style={styles.toppingInfo}>
                                        <Text style={styles.toppingName}>{topping.name}</Text>
                                        <Text style={styles.toppingCategory}>{topping.category}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeToppingButton}
                                        onPress={() => handleRemoveTopping(index)}
                                    >
                                        <MaterialIcons name="close" size={16} color="#cb202d" />
                                    </TouchableOpacity>
                                </View>
                            ))}

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
                            <Text style={styles.sectionTitle}>Item Image</Text>
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
                            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                                <MaterialIcons name="add-photo-alternate" size={48} color="#94A3B8" />
                                <Text style={styles.uploadButtonText}>Upload Product Image</Text>
                                <Text style={styles.uploadButtonSubtext}>Tap to select from gallery</Text>
                            </TouchableOpacity>
                        )}
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
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage }}
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
                                {/* Pizza Name */}
                                <Text style={styles.previewName}>
                                    {itemData.name || 'Item Name'}
                                </Text>

                                {/* Rating and Time */}
                                <View style={styles.previewRatingContainer}>
                                    <View style={styles.previewRatingBadge}>
                                        <Text style={styles.previewRatingText}>★ {selectedProduct?.rating || 4.5}</Text>
                                    </View>
                                    <Text style={styles.previewReviews}>({selectedProduct?.salesCount || 0})</Text>
                                    <Text style={styles.previewPrepTime}>• {selectedProduct?.preparationTime || 15} min</Text>
                                </View>

                                {/* Description */}
                                <Text style={styles.previewDescription} numberOfLines={2}>
                                    {itemData.description || 'Item description will appear here...'}
                                </Text>

                                {/* Tags */}
                                {(itemData.isVegetarian || (itemData.category === 'pizza' && toppings.length > 0)) && (
                                    <View style={styles.previewTagsRow}>
                                        {itemData.isVegetarian && (
                                            <View style={styles.previewTag}>
                                                <MaterialIcons name="eco" size={12} color="#4CAF50" />
                                                <Text style={styles.previewTagText}>Vegetarian</Text>
                                            </View>
                                        )}
                                        {itemData.category === 'pizza' && toppings.length > 0 && (
                                            <View style={styles.previewTag}>
                                                <MaterialIcons name="restaurant" size={12} color="#FF9800" />
                                                <Text style={styles.previewTagText}>{toppings.length} Toppings</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Price Section */}
                                <View style={styles.previewPriceContainer}>
                                    <Text style={styles.previewPrice}>
                                        ${itemData.category === 'pizza'
                                            ? (itemData.priceSmall || itemData.priceMedium || itemData.priceLarge || '0.00')
                                            : (itemData.price || '0.00')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {/* Bottom spacing */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Floating Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, (isUpdating || isUploadingImage) && styles.saveButtonDisabled]}
                    onPress={handleSaveChanges}
                    disabled={isUpdating || isUploadingImage}
                >
                    {isUploadingImage ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.saveButtonText}>Uploading Image...</Text>
                        </>
                    ) : isUpdating ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.saveButtonText}>Saving...</Text>
                        </>
                    ) : (
                        <>
                            <MaterialIcons name="check" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
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
                        <View style={styles.modalHeader}>
                            {selectedToppingCategory ? (
                                <TouchableOpacity
                                    style={styles.modalBackButton}
                                    onPress={() => setSelectedToppingCategory(null)}
                                >
                                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                                </TouchableOpacity>
                            ) : (
                                <View style={{ width: 40 }} />
                            )}
                            <Text style={styles.modalTitle}>
                                {selectedToppingCategory ? selectedToppingCategory.charAt(0).toUpperCase() + selectedToppingCategory.slice(1) : 'Select Category'}
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => {
                                    setShowToppingModal(false);
                                    setSelectedToppingCategory(null);
                                }}
                            >
                                <MaterialIcons name="close" size={24} color="#2d2d2d" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={selectedToppingCategory ? styles.toppingGrid : styles.categoryList}>
                            {!selectedToppingCategory ? (
                                <>
                                    {Object.keys(toppingOptions).map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            style={styles.categoryCard}
                                            onPress={() => setSelectedToppingCategory(category as any)}
                                        >
                                            <Text style={styles.categoryCardIcon}>
                                                {category === 'vegetables' ? '🥬' : category === 'meat' ? '🍖' : category === 'cheese' ? '🧀' : '🍅'}
                                            </Text>
                                            <Text style={styles.categoryCardTitle}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </Text>
                                            <MaterialIcons name="chevron-right" size={24} color="#999" />
                                        </TouchableOpacity>
                                    ))}
                                </>
                            ) : (
                                <View style={styles.toppingGridContainer}>
                                    {toppingOptions[selectedToppingCategory].map((topping) => {
                                        const isSelected = toppings.some(t => t.name === topping.name && t.category === selectedToppingCategory);
                                        return (
                                            <TouchableOpacity
                                                key={topping.name}
                                                style={[styles.toppingChip, isSelected && styles.toppingChipSelected]}
                                                onPress={() => handleAddTopping(topping.name, selectedToppingCategory)}
                                            >
                                                <Text style={styles.toppingChipIcon}>{topping.icon}</Text>
                                                <Text style={[styles.toppingChipText, isSelected && styles.toppingChipTextSelected]}>
                                                    {topping.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </ScrollView>
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
    deleteIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
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

    // Image Upload styles (matching AddMenuItemScreen and DeliveryBoySignup)
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

    // Image Upload (old styles - keep for compatibility)
    currentImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    imageText: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#cb202d',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    changeImageText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
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

    // Statistics
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: '45%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
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
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // Loading and error states
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    backToListButton: {
        marginTop: 24,
        backgroundColor: '#cb202d',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backToListText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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

    // Preview image
    previewImage: {
        width: '100%',
        height: '100%',
    },
});