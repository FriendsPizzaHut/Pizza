import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getRestaurantSettings, updateRestaurantSettings } from '../../../services/restaurantSettingsService';

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

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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

                        {/* Bottom spacing */}
                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>
            )}

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
});
