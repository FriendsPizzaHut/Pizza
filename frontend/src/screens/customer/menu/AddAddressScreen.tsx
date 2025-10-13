/**
 * AddAddressScreen.tsx
 * 
 * Screen for adding a new delivery address with form validation
 * and real-time input feedback.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CustomerStackParamList } from '../../../types/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { addAddress as addAddressAction, setLoading, setError } from '../../../../redux/slices/addressSlice';
import apiClient from '../../../api/apiClient';

type AddAddressRouteProp = RouteProp<CustomerStackParamList, 'AddAddress'>;

const ADDRESS_LABELS = ['Home', 'Work', 'Hotel', 'Other'];

export default function AddAddressScreen() {
    const route = useRoute<AddAddressRouteProp>();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const userId = useSelector((state: RootState) => state.auth.userId);
    const { fromScreen } = route.params || {};

    // Form state
    const [label, setLabel] = useState('Home');
    const [street, setStreet] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    // Validate individual field
    const validateField = (field: string, value: string): string => {
        switch (field) {
            case 'street':
                if (!value.trim()) return 'Street address is required';
                if (value.length < 5) return 'Street address is too short';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                if (value.length < 2) return 'City name is too short';
                return '';
            case 'state':
                if (!value.trim()) return 'State is required';
                if (value.length < 2) return 'State name is too short';
                return '';
            case 'pincode':
                if (!value.trim()) return 'Pincode is required';
                if (!/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
                return '';
            default:
                return '';
        }
    };

    // Handle field blur
    const handleBlur = (field: string, value: string) => {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors = {
            street: validateField('street', street),
            city: validateField('city', city),
            state: validateField('state', state),
            pincode: validateField('pincode', pincode),
        };

        setErrors(newErrors);

        return !Object.values(newErrors).some(error => error !== '');
    };

    // Save address
    const handleSave = async () => {
        if (isSaving) return;

        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors and try again');
            return;
        }

        setIsSaving(true);
        dispatch(setLoading(true));

        try {
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.post(`/users/${userId}/address`, {
                label,
                street: street.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim(),
                landmark: landmark.trim() || undefined,
                isDefault,
            });

            if (response.data?.success && response.data?.data?.address) {
                // Update Redux cache
                dispatch(addAddressAction(response.data.data.address));

                Alert.alert(
                    'Success',
                    'Address added successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (fromScreen === 'Checkout') {
                                    (navigation as any).navigate('Checkout', { cartTotal: 0 });
                                } else {
                                    navigation.goBack();
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Add address error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add address. Please try again.';
            dispatch(setError(errorMessage));
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
            dispatch(setLoading(false));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Address</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                {/* Address Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address Type</Text>
                    <View style={styles.labelChips}>
                        {ADDRESS_LABELS.map((labelOption) => (
                            <TouchableOpacity
                                key={labelOption}
                                style={[
                                    styles.labelChip,
                                    label === labelOption && styles.labelChipSelected,
                                ]}
                                onPress={() => setLabel(labelOption)}
                            >
                                <Text
                                    style={[
                                        styles.labelChipText,
                                        label === labelOption && styles.labelChipTextSelected,
                                    ]}
                                >
                                    {labelOption}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Street Address */}
                <View style={styles.section}>
                    <Text style={styles.inputLabel}>
                        Street Address <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, styles.textArea, errors.street && styles.inputError]}
                        value={street}
                        onChangeText={setStreet}
                        onBlur={() => handleBlur('street', street)}
                        placeholder="e.g., 123 Main Street, Apt 4B"
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={2}
                    />
                    {errors.street ? (
                        <Text style={styles.errorText}>{errors.street}</Text>
                    ) : null}
                </View>

                {/* Landmark */}
                <View style={styles.section}>
                    <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={landmark}
                        onChangeText={setLandmark}
                        placeholder="e.g., Near Central Park, Behind Mall"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* City and State Row */}
                <View style={styles.row}>
                    <View style={[styles.section, styles.halfWidth]}>
                        <Text style={styles.inputLabel}>
                            City <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.city && styles.inputError]}
                            value={city}
                            onChangeText={setCity}
                            onBlur={() => handleBlur('city', city)}
                            placeholder="e.g., Mumbai"
                            placeholderTextColor="#9ca3af"
                        />
                        {errors.city ? (
                            <Text style={styles.errorText}>{errors.city}</Text>
                        ) : null}
                    </View>

                    <View style={[styles.section, styles.halfWidth]}>
                        <Text style={styles.inputLabel}>
                            State <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.state && styles.inputError]}
                            value={state}
                            onChangeText={setState}
                            onBlur={() => handleBlur('state', state)}
                            placeholder="e.g., Maharashtra"
                            placeholderTextColor="#9ca3af"
                        />
                        {errors.state ? (
                            <Text style={styles.errorText}>{errors.state}</Text>
                        ) : null}
                    </View>
                </View>

                {/* Pincode */}
                <View style={styles.section}>
                    <Text style={styles.inputLabel}>
                        Pincode <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, errors.pincode && styles.inputError]}
                        value={pincode}
                        onChangeText={setPincode}
                        onBlur={() => handleBlur('pincode', pincode)}
                        placeholder="e.g., 400001"
                        placeholderTextColor="#9ca3af"
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                    {errors.pincode ? (
                        <Text style={styles.errorText}>{errors.pincode}</Text>
                    ) : null}
                </View>

                {/* Set as Default */}
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setIsDefault(!isDefault)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                        {isDefault && (
                            <MaterialIcons name="check" size={16} color="#fff" />
                        )}
                    </View>
                    <Text style={styles.checkboxLabel}>Set as default address</Text>
                </TouchableOpacity>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <MaterialIcons name="info-outline" size={20} color="#0C7C59" />
                    <Text style={styles.infoText}>
                        Your address will be used for delivery. Make sure all details are correct.
                    </Text>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.8}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="check" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Address</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Extra space for keyboard and button
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'center',
    },
    headerPlaceholder: {
        width: 40,
    },

    // Section
    section: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 12,
    },

    // Label Chips
    labelChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    labelChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    labelChipSelected: {
        backgroundColor: '#f0fdf4',
        borderColor: '#0C7C59',
    },
    labelChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#686b78',
    },
    labelChipTextSelected: {
        color: '#0C7C59',
    },

    // Input Fields
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#2d2d2d',
        backgroundColor: '#f8f8f8',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
    },

    // Row Layout
    row: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
    },
    halfWidth: {
        flex: 1,
        paddingHorizontal: 0,
    },

    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#d4d5d9',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#0C7C59',
        borderColor: '#0C7C59',
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2d2d2d',
    },

    // Info Box
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#d1fae5',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginTop: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#065f46',
        lineHeight: 18,
    },

    // Footer
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#0C7C59',
        paddingVertical: 16,
        borderRadius: 12,
    },
    saveButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    bottomSpacing: {
        height: 20,
    },
});
