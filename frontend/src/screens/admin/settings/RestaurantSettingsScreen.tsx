import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Switch, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getRestaurantSettings, updateRestaurantSettings, Topping } from '../../../services/restaurantSettingsService';

export default function RestaurantSettingsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [restaurantData, setRestaurantData] = useState({
        // Section 1: Restaurant Information
        name: '',
        phone: '',
        email: '',
        address: '',

        // Section 2: Order Configuration
        minOrderAmount: '',

        // Section 3: Pricing & Taxes
        taxRate: '',
        deliveryFee: '',
        freeDeliveryThreshold: '',
    });

    const [toppings, setToppings] = useState<Topping[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [isAddToppingModalVisible, setIsAddToppingModalVisible] = useState(false);
    const [newTopping, setNewTopping] = useState<{ name: string; category: 'vegetables' | 'meat' | 'cheese' | 'sauce'; price: string }>({
        name: '',
        category: 'vegetables',
        price: ''
    });
    const [editingTopping, setEditingTopping] = useState<{ index: number; topping: Topping } | null>(null);

    // Fetch settings on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const settings = await getRestaurantSettings();

            setRestaurantData({
                name: settings.name,
                phone: settings.phone,
                email: settings.email,
                address: settings.address,
                minOrderAmount: settings.minOrderAmount.toString(),
                taxRate: settings.taxRate.toString(),
                deliveryFee: settings.deliveryFee.toString(),
                freeDeliveryThreshold: settings.freeDeliveryThreshold.toString(),
            });

            setToppings(settings.availableToppings || []);

            console.log('✅ Restaurant settings loaded successfully');
        } catch (error: any) {
            console.error('❌ Failed to load settings:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to load restaurant settings',
                [{ text: 'Retry', onPress: fetchSettings }, { text: 'Cancel', style: 'cancel' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        // Validation
        if (!restaurantData.name.trim()) {
            Alert.alert('Validation Error', 'Restaurant name is required');
            return;
        }
        if (!restaurantData.phone.trim()) {
            Alert.alert('Validation Error', 'Phone number is required');
            return;
        }
        if (!restaurantData.email.trim()) {
            Alert.alert('Validation Error', 'Email is required');
            return;
        }
        if (!restaurantData.address.trim()) {
            Alert.alert('Validation Error', 'Address is required');
            return;
        }
        if (!restaurantData.minOrderAmount.trim()) {
            Alert.alert('Validation Error', 'Minimum order amount is required');
            return;
        }

        try {
            setIsSaving(true);

            await updateRestaurantSettings({
                name: restaurantData.name,
                phone: restaurantData.phone,
                email: restaurantData.email,
                address: restaurantData.address,
                minOrderAmount: restaurantData.minOrderAmount,
                taxRate: restaurantData.taxRate,
                deliveryFee: restaurantData.deliveryFee,
                freeDeliveryThreshold: restaurantData.freeDeliveryThreshold,
                availableToppings: toppings,
            });

            console.log('✅ Restaurant settings updated successfully');

            Alert.alert(
                'Success',
                'Restaurant settings have been updated successfully!',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('❌ Failed to update settings:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update settings. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTopping = () => {
        if (!newTopping.name.trim()) {
            Alert.alert('Error', 'Please enter topping name');
            return;
        }

        const price = parseFloat(newTopping.price);
        if (isNaN(price) || price < 0) {
            Alert.alert('Error', 'Please enter a valid price (0 or greater)');
            return;
        }

        setToppings([...toppings, { name: newTopping.name.trim(), category: newTopping.category, price, isActive: true }]);
        setNewTopping({ name: '', category: 'vegetables', price: '' });
        setIsAddToppingModalVisible(false);
    };

    const handleEditTopping = (index: number) => {
        setEditingTopping({ index, topping: { ...toppings[index] } });
    };

    const handleUpdateTopping = () => {
        if (!editingTopping) return;

        const updatedToppings = [...toppings];
        updatedToppings[editingTopping.index] = editingTopping.topping;
        setToppings(updatedToppings);
        setEditingTopping(null);
    };

    const handleToggleTopping = (index: number) => {
        const updatedToppings = [...toppings];
        updatedToppings[index].isActive = !updatedToppings[index].isActive;
        setToppings(updatedToppings);
    };

    const handleDeleteTopping = (index: number) => {
        Alert.alert(
            'Delete Topping',
            `Are you sure you want to delete "${toppings[index].name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedToppings = toppings.filter((_, i) => i !== index);
                        setToppings(updatedToppings);
                    },
                },
            ]
        );
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'vegetables': return '🥬';
            case 'meat': return '🍖';
            case 'cheese': return '🧀';
            case 'sauce': return '🍅';
            default: return '📦';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'vegetables': return '#4CAF50';
            case 'meat': return '#F44336';
            case 'cheese': return '#FF9800';
            case 'sauce': return '#E91E63';
            default: return '#9E9E9E';
        }
    };

    const groupedToppings = toppings.reduce((acc, topping, index) => {
        if (!acc[topping.category]) {
            acc[topping.category] = [];
        }
        acc[topping.category].push({ ...topping, index });
        return acc;
    }, {} as Record<string, Array<Topping & { index: number }>>);

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
                        <Text style={styles.headerTitle}>Restaurant Settings</Text>
                        <Text style={styles.headerSubtitle}>Manage your restaurant</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#cb202d" />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        {/* Section 1: Restaurant Information */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="store" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Restaurant Information</Text>
                            </View>
                            <Text style={styles.sectionDescription}>Basic details about your restaurant</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Restaurant Name <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.name}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, name: text })}
                                    placeholder="Enter restaurant name"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <MaterialIcons name="phone" size={20} color="#8E8E93" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithPadding]}
                                        value={restaurantData.phone}
                                        onChangeText={(text) => setRestaurantData({ ...restaurantData, phone: text })}
                                        placeholder="+91 98765 43210"
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <MaterialIcons name="email" size={20} color="#8E8E93" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithPadding]}
                                        value={restaurantData.email}
                                        onChangeText={(text) => setRestaurantData({ ...restaurantData, email: text })}
                                        placeholder="contact@restaurant.com"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <MaterialIcons name="location-on" size={20} color="#8E8E93" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputWithPadding, styles.textArea]}
                                        value={restaurantData.address}
                                        onChangeText={(text) => setRestaurantData({ ...restaurantData, address: text })}
                                        placeholder="Enter full address"
                                        placeholderTextColor="#999"
                                        multiline
                                        numberOfLines={2}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Section 2: Order Configuration */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="settings" size={20} color="#FF9800" />
                                <Text style={styles.sectionTitle}>Order Configuration</Text>
                            </View>
                            <Text style={styles.sectionDescription}>Set order limits</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Minimum Order Amount (₹) <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.minOrderAmount}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, minOrderAmount: text })}
                                    placeholder="100"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                                <Text style={styles.helperText}>Minimum order value required for checkout</Text>
                            </View>
                        </View>

                        {/* Section 3: Pricing & Taxes */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
                                <Text style={styles.sectionTitle}>Pricing & Taxes</Text>
                            </View>
                            <Text style={styles.sectionDescription}>Configure charges and fees</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tax Rate (%)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.taxRate}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, taxRate: text })}
                                    placeholder="8.5"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>Delivery Fee (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={restaurantData.deliveryFee}
                                        onChangeText={(text) => setRestaurantData({ ...restaurantData, deliveryFee: text })}
                                        placeholder="40"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                    />
                                </View>

                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>Free Delivery Above (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={restaurantData.freeDeliveryThreshold}
                                        onChangeText={(text) => setRestaurantData({ ...restaurantData, freeDeliveryThreshold: text })}
                                        placeholder="2490"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Section 4: Pizza Toppings Management */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="local-pizza" size={20} color="#cb202d" />
                                <Text style={styles.sectionTitle}>Pizza Toppings</Text>
                            </View>
                            <Text style={styles.sectionDescription}>
                                Manage available toppings for pizza customization
                            </Text>

                            {/* Add Topping Button */}
                            <TouchableOpacity
                                style={styles.addToppingButton}
                                onPress={() => setIsAddToppingModalVisible(true)}
                            >
                                <MaterialIcons name="add-circle" size={20} color="#cb202d" />
                                <Text style={styles.addToppingButtonText}>Add New Topping</Text>
                            </TouchableOpacity>

                            {/* Toppings List Grouped by Category */}
                            {Object.entries(groupedToppings).map(([category, categoryToppings]) => (
                                <View key={category} style={styles.toppingCategory}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryEmoji}>{getCategoryIcon(category)}</Text>
                                        <Text style={[styles.categoryTitle, { color: getCategoryColor(category) }]}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </Text>
                                        <Text style={styles.categoryCount}>({categoryToppings.length})</Text>
                                    </View>

                                    {categoryToppings.map((topping) => (
                                        <View key={topping.index} style={styles.toppingItem}>
                                            <View style={styles.toppingInfo}>
                                                <View>
                                                    <Text style={[
                                                        styles.toppingName,
                                                        !topping.isActive && styles.toppingNameInactive
                                                    ]}>
                                                        {topping.name}
                                                    </Text>
                                                    <Text style={styles.toppingPrice}>₹{topping.price}</Text>
                                                </View>
                                                {!topping.isActive && (
                                                    <Text style={styles.inactiveBadge}>Inactive</Text>
                                                )}
                                            </View>

                                            <View style={styles.toppingActions}>
                                                <Switch
                                                    value={topping.isActive}
                                                    onValueChange={() => handleToggleTopping(topping.index)}
                                                    trackColor={{ false: '#d1d1d1', true: '#cb202d' }}
                                                    thumbColor="#fff"
                                                />
                                                <TouchableOpacity
                                                    style={styles.iconButton}
                                                    onPress={() => handleEditTopping(topping.index)}
                                                >
                                                    <MaterialIcons name="edit" size={20} color="#2196F3" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.iconButton}
                                                    onPress={() => handleDeleteTopping(topping.index)}
                                                >
                                                    <MaterialIcons name="delete" size={20} color="#F44336" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))}

                            {toppings.length === 0 && (
                                <View style={styles.emptyState}>
                                    <MaterialIcons name="local-pizza" size={48} color="#d1d1d1" />
                                    <Text style={styles.emptyStateText}>No toppings added yet</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Add toppings that will be available for pizza customization
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Bottom spacing */}
                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>
            )}

            {/* Add Topping Modal */}
            <Modal
                visible={isAddToppingModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsAddToppingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Topping</Text>
                            <TouchableOpacity onPress={() => setIsAddToppingModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#2d2d2d" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Topping Name <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    value={newTopping.name}
                                    onChangeText={(text) => setNewTopping({ ...newTopping, name: text })}
                                    placeholder="e.g., Extra Cheese, Olives"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Price (₹) <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    value={newTopping.price}
                                    onChangeText={(text) => setNewTopping({ ...newTopping, price: text })}
                                    placeholder="e.g., 30"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                                <View style={styles.categorySelector}>
                                    {(['vegetables', 'meat', 'cheese', 'sauce'] as const).map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryOption,
                                                newTopping.category === cat && styles.categoryOptionSelected,
                                                { borderColor: getCategoryColor(cat) }
                                            ]}
                                            onPress={() => setNewTopping({ ...newTopping, category: cat })}
                                        >
                                            <Text style={styles.categoryEmoji}>{getCategoryIcon(cat)}</Text>
                                            <Text style={[
                                                styles.categoryOptionText,
                                                newTopping.category === cat && { color: getCategoryColor(cat) }
                                            ]}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => {
                                    setNewTopping({ name: '', category: 'vegetables', price: '' });
                                    setIsAddToppingModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonAdd]}
                                onPress={handleAddTopping}
                            >
                                <Text style={styles.modalButtonTextAdd}>Add Topping</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Topping Modal */}
            <Modal
                visible={editingTopping !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setEditingTopping(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Topping</Text>
                            <TouchableOpacity onPress={() => setEditingTopping(null)}>
                                <MaterialIcons name="close" size={24} color="#2d2d2d" />
                            </TouchableOpacity>
                        </View>

                        {editingTopping && (
                            <View style={styles.modalBody}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Topping Name <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editingTopping.topping.name}
                                        onChangeText={(text) =>
                                            setEditingTopping({
                                                ...editingTopping,
                                                topping: { ...editingTopping.topping, name: text }
                                            })
                                        }
                                        placeholder="e.g., Extra Cheese, Olives"
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Price (₹) <Text style={styles.required}>*</Text></Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editingTopping.topping.price.toString()}
                                        onChangeText={(text) =>
                                            setEditingTopping({
                                                ...editingTopping,
                                                topping: { ...editingTopping.topping, price: parseFloat(text) || 0 }
                                            })
                                        }
                                        placeholder="e.g., 30"
                                        placeholderTextColor="#999"
                                        keyboardType="decimal-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                                    <View style={styles.categorySelector}>
                                        {(['vegetables', 'meat', 'cheese', 'sauce'] as const).map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[
                                                    styles.categoryOption,
                                                    editingTopping.topping.category === cat && styles.categoryOptionSelected,
                                                    { borderColor: getCategoryColor(cat) }
                                                ]}
                                                onPress={() =>
                                                    setEditingTopping({
                                                        ...editingTopping,
                                                        topping: { ...editingTopping.topping, category: cat }
                                                    })
                                                }
                                            >
                                                <Text style={styles.categoryEmoji}>{getCategoryIcon(cat)}</Text>
                                                <Text style={[
                                                    styles.categoryOptionText,
                                                    editingTopping.topping.category === cat && { color: getCategoryColor(cat) }
                                                ]}>
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setEditingTopping(null)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonAdd]}
                                onPress={handleUpdateTopping}
                            >
                                <Text style={styles.modalButtonTextAdd}>Update Topping</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Save Button */}
            {!isLoading && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSaveSettings}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.saveButtonText}>Saving...</Text>
                            </>
                        ) : (
                            <>
                                <MaterialIcons name="check" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>Save Settings</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
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
    sectionDescription: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 16,
        marginTop: -4,
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
    helperText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 6,
        fontStyle: 'italic',
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
        height: 60,
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

    // Status Toggles
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    statusInfo: {
        flex: 1,
        marginLeft: 4,
    },
    statusTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    statusSubtext: {
        fontSize: 13,
        color: '#8E8E93',
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
        backgroundColor: '#999',
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // Loading States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#8E8E93',
    },

    // Topping Management Styles
    addToppingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#cb202d',
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 20,
        gap: 8,
    },
    addToppingButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#cb202d',
    },

    toppingCategory: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    categoryEmoji: {
        fontSize: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    categoryCount: {
        fontSize: 14,
        color: '#8E8E93',
    },

    toppingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    toppingInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toppingName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    toppingPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: 2,
    },
    toppingNameInactive: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    inactiveBadge: {
        fontSize: 11,
        color: '#fff',
        backgroundColor: '#999',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },

    toppingActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 13,
        color: '#B0B0B0',
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    modalBody: {
        padding: 20,
    },
    categorySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
    },
    categoryOptionSelected: {
        backgroundColor: '#FFF5F5',
    },
    categoryOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        paddingTop: 0,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    modalButtonTextCancel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    modalButtonAdd: {
        backgroundColor: '#cb202d',
    },
    modalButtonTextAdd: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});

