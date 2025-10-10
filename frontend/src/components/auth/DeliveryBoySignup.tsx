/**
 * Delivery Boy Signup Component
 * 
 * Registration form for delivery boys with:
 * - Basic info (name, email, phone, password)
 * - Vehicle information
 * - Document uploads (driving license, Aadhar, RC)
 * - Availability settings
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthStackParamList } from '../../types/navigation';
import { signupThunk } from '../../../redux/thunks/authThunks';
import { clearError } from '../../../redux/slices/authSlice';
import { RootState } from '../../../redux/store';
import { useNetwork } from '../../context/NetworkContext';

type DeliverySignupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'DeliverySignup'>;

type VehicleType = 'bike' | 'scooter' | 'bicycle' | 'car';

const VEHICLE_TYPES: Array<{ value: VehicleType; label: string; icon: string }> = [
    { value: 'bike', label: '🏍️ Bike', icon: 'bicycle' },
    { value: 'scooter', label: '🛵 Scooter', icon: 'bicycle-outline' },
    { value: 'bicycle', label: '🚲 Bicycle', icon: 'bicycle-sharp' },
    { value: 'car', label: '🚗 Car', icon: 'car' },
];

export default function DeliveryBoySignup() {
    const navigation = useNavigation<DeliverySignupNavigationProp>();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);
    const { isConnected } = useNetwork();

    // Basic Information
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    // Vehicle Information
    const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');

    // Document Images
    const [drivingLicenseImage, setDrivingLicenseImage] = useState<string | null>(null);
    const [aadharImage, setAadharImage] = useState<string | null>(null);
    const [vehicleRCImage, setVehicleRCImage] = useState<string | null>(null);

    // Validation errors
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    /**
     * Request camera/gallery permissions
     */
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need camera roll permissions to upload documents.',
                    [{ text: 'OK' }]
                );
            }
        })();
    }, []);

    /**
     * Handle input change
     */
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Clear global error
        if (error) {
            dispatch(clearError());
        }
    };

    /**
     * Pick image from gallery
     */
    const pickImage = async (documentType: 'drivingLicense' | 'aadhar' | 'vehicleRC') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;

                switch (documentType) {
                    case 'drivingLicense':
                        setDrivingLicenseImage(imageUri);
                        if (validationErrors.drivingLicense) {
                            setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.drivingLicense;
                                return newErrors;
                            });
                        }
                        break;
                    case 'aadhar':
                        setAadharImage(imageUri);
                        if (validationErrors.aadhar) {
                            setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.aadhar;
                                return newErrors;
                            });
                        }
                        break;
                    case 'vehicleRC':
                        setVehicleRCImage(imageUri);
                        break;
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    /**
     * Remove uploaded image
     */
    const removeImage = (documentType: 'drivingLicense' | 'aadhar' | 'vehicleRC') => {
        switch (documentType) {
            case 'drivingLicense':
                setDrivingLicenseImage(null);
                break;
            case 'aadhar':
                setAadharImage(null);
                break;
            case 'vehicleRC':
                setVehicleRCImage(null);
                break;
        }
    };

    /**
     * Validate form before submission
     */
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Basic Info Validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (phoneDigits.length !== 10) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } else {
            const hasUppercase = /[A-Z]/.test(formData.password);
            const hasLowercase = /[a-z]/.test(formData.password);
            const hasNumber = /\d/.test(formData.password);

            if (!hasUppercase || !hasLowercase || !hasNumber) {
                errors.password = 'Password must contain uppercase, lowercase, and number';
            }
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Vehicle number is now optional
        if (vehicleNumber.trim() && !/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(vehicleNumber.toUpperCase().replace(/\s/g, ''))) {
            errors.vehicleNumber = 'Invalid vehicle number format (e.g., MH01AB1234)';
        }

        // Document Images Validation (Required)
        if (!drivingLicenseImage) {
            errors.drivingLicense = 'Please upload driving license image';
        }

        if (!aadharImage) {
            errors.aadhar = 'Please upload Aadhar card image';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handle signup submission
     */
    const handleSignup = async () => {
        if (!isConnected) {
            Alert.alert(
                'No Internet Connection',
                'Please connect to WiFi or mobile data to register.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill all required fields correctly.');
            return;
        }

        try {
            const signupData: any = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.replace(/\D/g, ''),
                password: formData.password,
                role: 'delivery',
                vehicleInfo: {
                    type: vehicleType,
                    ...(vehicleNumber.trim() && {
                        number: vehicleNumber.toUpperCase().replace(/\s/g, '')
                    }),
                    ...(vehicleModel.trim() && { model: vehicleModel.trim() }),
                },
                documents: {
                    ...(drivingLicenseImage && {
                        drivingLicense: { imageUrl: drivingLicenseImage }
                    }),
                    ...(aadharImage && {
                        aadharCard: { imageUrl: aadharImage }
                    }),
                    ...(vehicleRCImage && {
                        vehicleRC: { imageUrl: vehicleRCImage }
                    }),
                },
            };

            const result = await dispatch(signupThunk(signupData) as any);

            if (signupThunk.fulfilled.match(result)) {
                // Check if approval is required
                const response = result.payload;

                Alert.alert(
                    '✅ Registration Successful!',
                    response?.message || 'Your delivery partner account has been created successfully!\n\n⏳ Your account is pending admin approval. You will be notified once approved.\n\nYou can login after approval.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
            } else if (signupThunk.rejected.match(result)) {
                const errorMessage = result.payload?.message || 'Registration failed. Please try again.';
                Alert.alert('Registration Failed', errorMessage, [{ text: 'OK' }]);
            }
        } catch (error: any) {
            console.error('Delivery boy signup error:', error);
            Alert.alert(
                'Registration Failed',
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Join as Delivery Partner</Text>
                    <Text style={styles.subtitle}>
                        🚴 Start earning by delivering delicious pizzas!
                    </Text>
                </View>

                {/* Offline Banner */}
                {!isConnected && (
                    <View style={styles.offlineBanner}>
                        <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
                        <Text style={styles.offlineText}>
                            You're offline. Connect to internet to register.
                        </Text>
                    </View>
                )}

                {/* Global Error */}
                {error && (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={styles.errorBannerText}>{error}</Text>
                    </View>
                )}

                {/* Form */}
                <View style={styles.form}>
                    {/* Section: Basic Information */}
                    <Text style={styles.sectionTitle}>📋 Basic Information</Text>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <View style={[styles.inputContainer, validationErrors.name && styles.inputError]}>
                            <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94A3B8"
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                editable={!isLoading}
                                autoCapitalize="words"
                            />
                        </View>
                        {validationErrors.name && <Text style={styles.errorText}>{validationErrors.name}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <View style={[styles.inputContainer, validationErrors.email && styles.inputError]}>
                            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#94A3B8"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                editable={!isLoading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <View style={[styles.inputContainer, validationErrors.phone && styles.inputError]}>
                            <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="10-digit phone number"
                                placeholderTextColor="#94A3B8"
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                editable={!isLoading}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                        {validationErrors.phone && <Text style={styles.errorText}>{validationErrors.phone}</Text>}
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <View style={[styles.inputContainer, validationErrors.password && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Min 6 chars, uppercase, lowercase, number"
                                placeholderTextColor="#94A3B8"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                editable={!isLoading}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.password && <Text style={styles.errorText}>{validationErrors.password}</Text>}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <View style={[styles.inputContainer, validationErrors.confirmPassword && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter your password"
                                placeholderTextColor="#94A3B8"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                editable={!isLoading}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.confirmPassword && <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>}
                    </View>

                    {/* Section: Vehicle Information */}
                    <Text style={styles.sectionTitle}>🏍️ Vehicle Information</Text>

                    {/* Vehicle Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Type *</Text>
                        <View style={styles.vehicleTypeContainer}>
                            {VEHICLE_TYPES.map((vehicle) => (
                                <TouchableOpacity
                                    key={vehicle.value}
                                    style={[
                                        styles.vehicleTypeButton,
                                        vehicleType === vehicle.value && styles.vehicleTypeButtonActive
                                    ]}
                                    onPress={() => setVehicleType(vehicle.value)}
                                    disabled={isLoading}
                                >
                                    <Text style={[
                                        styles.vehicleTypeText,
                                        vehicleType === vehicle.value && styles.vehicleTypeTextActive
                                    ]}>
                                        {vehicle.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Vehicle Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Number (Optional)</Text>
                        <View style={[styles.inputContainer, validationErrors.vehicleNumber && styles.inputError]}>
                            <Ionicons name="car-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., MH01AB1234 (can add later)"
                                placeholderTextColor="#94A3B8"
                                value={vehicleNumber}
                                onChangeText={setVehicleNumber}
                                editable={!isLoading}
                                autoCapitalize="characters"
                            />
                        </View>
                        {validationErrors.vehicleNumber && <Text style={styles.errorText}>{validationErrors.vehicleNumber}</Text>}
                    </View>

                    {/* Vehicle Model (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Model (Optional)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="construct-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Honda Activa, Hero Splendor"
                                placeholderTextColor="#94A3B8"
                                value={vehicleModel}
                                onChangeText={setVehicleModel}
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    {/* Section: Documents */}
                    <Text style={styles.sectionTitle}>📄 Documents (Upload Images)</Text>

                    {/* Driving License Image */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Driving License Photo *</Text>
                        {drivingLicenseImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: drivingLicenseImage }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage('drivingLicense')}
                                >
                                    <Ionicons name="close-circle" size={30} color="#DC2626" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={() => pickImage('drivingLicense')}
                                >
                                    <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.uploadButton,
                                    validationErrors.drivingLicense && styles.uploadButtonError
                                ]}
                                onPress={() => pickImage('drivingLicense')}
                                disabled={isLoading}
                            >
                                <Ionicons name="camera-outline" size={32} color="#94A3B8" />
                                <Text style={styles.uploadButtonText}>Tap to upload driving license</Text>
                                <Text style={styles.uploadButtonSubtext}>JPG, PNG (Max 5MB)</Text>
                            </TouchableOpacity>
                        )}
                        {validationErrors.drivingLicense && (
                            <Text style={styles.errorText}>{validationErrors.drivingLicense}</Text>
                        )}
                    </View>

                    {/* Aadhar Card Image */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Aadhar Card Photo *</Text>
                        {aadharImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: aadharImage }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage('aadhar')}
                                >
                                    <Ionicons name="close-circle" size={30} color="#DC2626" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={() => pickImage('aadhar')}
                                >
                                    <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.uploadButton,
                                    validationErrors.aadhar && styles.uploadButtonError
                                ]}
                                onPress={() => pickImage('aadhar')}
                                disabled={isLoading}
                            >
                                <Ionicons name="camera-outline" size={32} color="#94A3B8" />
                                <Text style={styles.uploadButtonText}>Tap to upload Aadhar card</Text>
                                <Text style={styles.uploadButtonSubtext}>JPG, PNG (Max 5MB)</Text>
                            </TouchableOpacity>
                        )}
                        {validationErrors.aadhar && (
                            <Text style={styles.errorText}>{validationErrors.aadhar}</Text>
                        )}
                    </View>

                    {/* Vehicle RC Image (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle RC Photo (Optional)</Text>
                        {vehicleRCImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: vehicleRCImage }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage('vehicleRC')}
                                >
                                    <Ionicons name="close-circle" size={30} color="#DC2626" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={() => pickImage('vehicleRC')}
                                >
                                    <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => pickImage('vehicleRC')}
                                disabled={isLoading}
                            >
                                <Ionicons name="camera-outline" size={32} color="#94A3B8" />
                                <Text style={styles.uploadButtonText}>Tap to upload vehicle RC</Text>
                                <Text style={styles.uploadButtonSubtext}>JPG, PNG (Max 5MB)</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
                        <Text style={styles.infoText}>
                            📸 Upload clear photos of your documents. Your documents will be verified by our team within 24-48 hours. Vehicle number can be added later if needed.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, (isLoading || !isConnected) && styles.signupButtonDisabled]}
                        onPress={handleSignup}
                        disabled={isLoading || !isConnected}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.signupButtonText}>Register as Delivery Partner</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        lineHeight: 24,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorBannerText: {
        color: '#DC2626',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    form: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 24,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
    },
    inputError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: '#1E293B',
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    vehicleTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    vehicleTypeButton: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    vehicleTypeButtonActive: {
        borderColor: '#4CAF50',
        backgroundColor: '#F0FDF4',
    },
    vehicleTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    vehicleTypeTextActive: {
        color: '#4CAF50',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        marginLeft: 8,
        lineHeight: 18,
    },
    signupButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    signupButtonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: '#64748B',
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    uploadButton: {
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
    },
    uploadButtonError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    uploadButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 8,
    },
    uploadButtonSubtext: {
        fontSize: 12,
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
        height: 200,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    changeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
