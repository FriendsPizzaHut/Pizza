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
    StatusBar,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AuthStackParamList } from '../../types/navigation';
import { signupThunk } from '../../../redux/thunks/authThunks';
import { clearError } from '../../../redux/slices/authSlice';
import { RootState } from '../../../redux/store';
import { useNetwork } from '../../context/NetworkContext';
import { uploadImage, isLocalFileUri } from '../../utils/imageUpload';
import Avatar from '../common/Avatar';

type DeliverySignupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'DeliverySignup'>;

type VehicleType = 'bike' | 'scooter' | 'bicycle' | 'car';

const { width } = Dimensions.get('window');

const VEHICLE_TYPES: Array<{ value: VehicleType; label: string; icon: string }> = [
    { value: 'bike', label: 'Bike', icon: 'motorcycle' },
    { value: 'scooter', label: 'Scooter', icon: 'moped' },
    { value: 'bicycle', label: 'Bicycle', icon: 'pedal-bike' },
    { value: 'car', label: 'Car', icon: 'directions-car' },
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

    // Avatar state
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
     * Handle avatar image selection
     */
    const handleAvatarPick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for avatar
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setAvatarImage(result.assets[0].uri);
            }
        } catch (error: any) {
            console.error('Error picking avatar:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    /**
     * Remove avatar image
     */
    const handleRemoveAvatar = () => {
        setAvatarImage(null);
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
            // Upload avatar to Cloudinary if selected
            let profileImageUrl = null;

            if (avatarImage && isLocalFileUri(avatarImage)) {
                setIsUploadingAvatar(true);
                console.log('📤 Uploading avatar to Cloudinary...');

                try {
                    profileImageUrl = await uploadImage(avatarImage, 'avatar');
                    console.log('✅ Avatar uploaded successfully:', profileImageUrl);
                } catch (uploadError: any) {
                    console.error('❌ Avatar upload failed:', uploadError);
                    setIsUploadingAvatar(false);

                    // Ask user if they want to continue without avatar
                    const shouldContinue = await new Promise<boolean>((resolve) => {
                        Alert.alert(
                            'Avatar Upload Failed',
                            `Failed to upload avatar: ${uploadError.message}\n\nWould you like to continue without a profile picture?`,
                            [
                                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                                { text: 'Continue', onPress: () => resolve(true) },
                            ]
                        );
                    });

                    if (!shouldContinue) {
                        return;
                    }
                }

                setIsUploadingAvatar(false);
            }

            // Upload documents to Cloudinary if selected
            let uploadedDrivingLicense = drivingLicenseImage;
            let uploadedAadhar = aadharImage;
            let uploadedVehicleRC = vehicleRCImage;

            if (drivingLicenseImage && isLocalFileUri(drivingLicenseImage)) {
                uploadedDrivingLicense = await uploadImage(drivingLicenseImage, 'document');
            }
            if (aadharImage && isLocalFileUri(aadharImage)) {
                uploadedAadhar = await uploadImage(aadharImage, 'document');
            }
            if (vehicleRCImage && isLocalFileUri(vehicleRCImage)) {
                uploadedVehicleRC = await uploadImage(vehicleRCImage, 'document');
            }

            const signupData: any = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.replace(/\D/g, ''),
                password: formData.password,
                role: 'delivery',
                profileImage: profileImageUrl, // Include avatar URL (null if not uploaded)
                vehicleInfo: {
                    type: vehicleType,
                    ...(vehicleNumber.trim() && {
                        number: vehicleNumber.toUpperCase().replace(/\s/g, '')
                    }),
                    ...(vehicleModel.trim() && { model: vehicleModel.trim() }),
                },
                documents: {
                    ...(uploadedDrivingLicense && {
                        drivingLicense: { imageUrl: uploadedDrivingLicense }
                    }),
                    ...(uploadedAadhar && {
                        aadharCard: { imageUrl: uploadedAadhar }
                    }),
                    ...(uploadedVehicleRC && {
                        vehicleRC: { imageUrl: uploadedVehicleRC }
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                nestedScrollEnabled={true}
                bounces={false}
            >
                <StatusBar barStyle="light-content" backgroundColor="#0C7C59" />
                {/* Gradient Header */}
                <LinearGradient
                    colors={['#0C7C59', '#0F9D6E', '#0C7C59']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    {/* Decorative circles */}
                    <View style={[styles.decorativeCircle, styles.circle1]} />
                    <View style={[styles.decorativeCircle, styles.circle2]} />
                    <View style={[styles.decorativeCircle, styles.circle3]} />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Logo Container */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>🚚</Text>
                    </View>

                    {/* Header Text */}
                    <Text style={styles.headerTitle}>Become a Delivery Partner</Text>
                    <Text style={styles.headerSubtitle}>
                        Start earning by delivering happiness
                    </Text>
                </LinearGradient>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Offline Banner */}
                    {!isConnected && (
                        <View style={styles.offlineBanner}>
                            <MaterialIcons name="cloud-off" size={16} color="#FFFFFF" />
                            <Text style={styles.offlineText}>
                                You're offline. Connect to internet to register.
                            </Text>
                        </View>
                    )}

                    {/* Global Error */}
                    {error && (
                        <View style={styles.errorBanner}>
                            <MaterialIcons name="error-outline" size={18} color="#e63946" />
                            <Text style={styles.errorBannerText}>{error}</Text>
                        </View>
                    )}
                    {/* Section: Basic Information */}
                    <Text style={styles.sectionTitle}>📋 Basic Information</Text>

                    {/* Avatar Section (Optional) */}
                    <View style={styles.avatarSection}>
                        <Text style={styles.avatarLabel}>Profile Picture (Optional)</Text>
                        <View style={styles.avatarContainer}>
                            <Avatar
                                name={formData.name || 'User'}
                                imageUrl={avatarImage}
                                size={100}
                            />
                            <View style={styles.avatarActions}>
                                <TouchableOpacity
                                    style={styles.avatarButton}
                                    onPress={handleAvatarPick}
                                    disabled={isLoading || isUploadingAvatar}
                                >
                                    <MaterialIcons name="add-a-photo" size={18} color="#0C7C59" />
                                    <Text style={styles.avatarButtonText}>
                                        {avatarImage ? 'Change' : 'Add Photo'}
                                    </Text>
                                </TouchableOpacity>
                                {avatarImage && (
                                    <TouchableOpacity
                                        style={[styles.avatarButton, styles.removeAvatarButton]}
                                        onPress={handleRemoveAvatar}
                                        disabled={isLoading || isUploadingAvatar}
                                    >
                                        <MaterialIcons name="delete" size={18} color="#e63946" />
                                        <Text style={[styles.avatarButtonText, { color: '#e63946' }]}>
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <Text style={styles.avatarHint}>
                            {avatarImage
                                ? 'Your profile picture will be uploaded when you register'
                                : 'If you don\'t add a photo, we\'ll use your initials'}
                        </Text>
                    </View>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.name && styles.inputError
                        ]}>
                            <MaterialIcons
                                name="person"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
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
                        {validationErrors.name && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.name}</Text>
                            </View>
                        )}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.email && styles.inputError
                        ]}>
                            <MaterialIcons
                                name="email"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="your.email@example.com"
                                placeholderTextColor="#94A3B8"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                editable={!isLoading}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {validationErrors.email && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.email}</Text>
                            </View>
                        )}
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.phone && styles.inputError
                        ]}>
                            <MaterialIcons
                                name="phone"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
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
                        {validationErrors.phone && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.phone}</Text>
                            </View>
                        )}
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.password && styles.inputError
                        ]}>
                            <MaterialIcons
                                name="lock"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Create a strong password"
                                placeholderTextColor="#94A3B8"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                editable={!isLoading}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <MaterialIcons
                                    name={showPassword ? 'visibility' : 'visibility-off'}
                                    size={22}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.password ? (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.password}</Text>
                            </View>
                        ) : (
                            <Text style={styles.helperText}>Min 6 chars with uppercase, lowercase & number</Text>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.confirmPassword && styles.inputError
                        ]}>
                            <MaterialIcons
                                name="lock"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
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
                                <MaterialIcons
                                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                    size={22}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.confirmPassword && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
                            </View>
                        )}
                    </View>

                    {/* Section: Vehicle Information */}
                    <Text style={styles.sectionTitle}>🏍️ Vehicle Information</Text>

                    {/* Vehicle Type */}
                    <View style={[styles.inputGroup, { marginBottom: 24 }]}>
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
                                    <MaterialIcons
                                        name={vehicle.icon as any}
                                        size={20}
                                        color={vehicleType === vehicle.value ? '#0C7C59' : '#94A3B8'}
                                    />
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
                        <View style={[
                            styles.inputContainer,
                            validationErrors.vehicleNumber && styles.inputError
                        ]}>
                            <MaterialIcons
                                name="directions-car"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., MH01AB1234"
                                placeholderTextColor="#94A3B8"
                                value={vehicleNumber}
                                onChangeText={setVehicleNumber}
                                editable={!isLoading}
                                autoCapitalize="characters"
                            />
                        </View>
                        {validationErrors.vehicleNumber && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.vehicleNumber}</Text>
                            </View>
                        )}
                    </View>

                    {/* Vehicle Model (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Model (Optional)</Text>
                        <View style={[
                            styles.inputContainer
                        ]}>
                            <MaterialIcons
                                name="build"
                                size={22}
                                color="#94A3B8"
                                style={styles.inputIcon}
                            />
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
                    <Text style={styles.sectionTitle}>📄 Document Verification</Text>
                    <Text style={styles.sectionDescription}>
                        Upload clear photos of your documents for verification
                    </Text>

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
                                    <MaterialIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={() => pickImage('drivingLicense')}
                                >
                                    <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change Photo</Text>
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
                                <View style={styles.uploadIconContainer}>
                                    <MaterialIcons name="camera-alt" size={40} color="#0C7C59" />
                                </View>
                                <Text style={styles.uploadButtonText}>Tap to upload driving license</Text>
                                <Text style={styles.uploadButtonSubtext}>JPG, PNG • Max 5MB</Text>
                            </TouchableOpacity>
                        )}
                        {validationErrors.drivingLicense && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.drivingLicense}</Text>
                            </View>
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
                                    <MaterialIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={() => pickImage('aadhar')}
                                >
                                    <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change Photo</Text>
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
                                <View style={styles.uploadIconContainer}>
                                    <MaterialIcons name="camera-alt" size={40} color="#0C7C59" />
                                </View>
                                <Text style={styles.uploadButtonText}>Tap to upload Aadhar card</Text>
                                <Text style={styles.uploadButtonSubtext}>JPG, PNG • Max 5MB</Text>
                            </TouchableOpacity>
                        )}
                        {validationErrors.aadhar && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={14} color="#e63946" />
                                <Text style={styles.errorText}>{validationErrors.aadhar}</Text>
                            </View>
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
                                    <MaterialIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={() => pickImage('vehicleRC')}
                                >
                                    <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                                    <Text style={styles.changeImageText}>Change Photo</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => pickImage('vehicleRC')}
                                disabled={isLoading}
                            >
                                <View style={styles.uploadIconContainer}>
                                    <MaterialIcons name="camera-alt" size={40} color="#0C7C59" />
                                </View>
                                <Text style={styles.uploadButtonText}>Tap to upload vehicle RC</Text>
                                <Text style={styles.uploadButtonSubtext}>JPG, PNG • Max 5MB</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <MaterialIcons name="info" size={22} color="#0C7C59" />
                        <Text style={styles.infoText}>
                            Your documents will be verified within 24-48 hours. You'll receive a notification once approved.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, ((isLoading || isUploadingAvatar) || !isConnected) && styles.signupButtonDisabled]}
                        onPress={handleSignup}
                        disabled={(isLoading || isUploadingAvatar) || !isConnected}
                    >
                        {(isLoading || isUploadingAvatar) ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <ActivityIndicator color="#FFFFFF" size="small" />
                                <Text style={styles.signupButtonText}>
                                    {isUploadingAvatar ? 'Uploading Photo...' : 'Registering...'}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.signupButtonText}>Register as Delivery Partner</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                            <Text style={styles.loginLink}>Sign In →</Text>
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
        backgroundColor: '#fafafa',
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 50,
        paddingHorizontal: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle1: {
        width: 200,
        height: 200,
        top: -100,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        top: 100,
        right: -75,
    },
    circle3: {
        width: 100,
        height: 100,
        top: 50,
        left: -50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    logoEmoji: {
        fontSize: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 10,
        flex: 1,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5f5',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ffe5e5',
    },
    errorBannerText: {
        color: '#e63946',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 10,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 24,
        marginBottom: 16,
    },

    // Avatar Section Styles
    avatarSection: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
        paddingVertical: 20,
        backgroundColor: '#f0fdf4',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1fae5',
    },
    avatarLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarActions: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    avatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#0C7C59',
        gap: 6,
    },
    removeAvatarButton: {
        borderColor: '#e63946',
    },
    avatarButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0C7C59',
    },
    avatarHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },

    sectionDescription: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 16,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fafafa',
        height: 56,
    },
    inputFocused: {
        borderColor: '#0C7C59',
        backgroundColor: '#FFFFFF',
        shadowColor: '#0C7C59',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputError: {
        borderColor: '#e63946',
        backgroundColor: '#fff5f5',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2d2d2d',
        paddingVertical: 0,
    },
    eyeIcon: {
        padding: 8,
        marginLeft: 4,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginLeft: 4,
    },
    errorText: {
        color: '#e63946',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        flex: 1,
    },
    helperText: {
        color: '#999',
        fontSize: 11,
        marginTop: 6,
        marginLeft: 4,
    },
    vehicleTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    vehicleTypeButton: {
        flex: 1,
        minWidth: '47%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    vehicleTypeButtonActive: {
        borderColor: '#0C7C59',
        backgroundColor: '#f1f8f4',
        shadowColor: '#0C7C59',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    vehicleTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    vehicleTypeTextActive: {
        color: '#0C7C59',
    },
    uploadButton: {
        backgroundColor: '#fafafa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
    },
    uploadButtonError: {
        borderColor: '#e63946',
        backgroundColor: '#fff5f5',
    },
    uploadIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f8f4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginTop: 4,
        textAlign: 'center',
    },
    uploadButtonSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fafafa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    imagePreview: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e63946',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0C7C59',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    changeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f1f8f4',
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#0C7C59',
        marginLeft: 10,
        lineHeight: 19,
        fontWeight: '500',
    },
    signupButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 8,
        backgroundColor: '#0C7C59',
        shadowColor: '#0C7C59',
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
        fontSize: 17,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0C7C59',
    },
});
