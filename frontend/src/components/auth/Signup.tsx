/**
 * Signup/Register Component
 * 
 * Comprehensive signup form with:
 * - Real API integration
 * - Form validation
 * - Loading states
 * - Error handling
 * - Offline support
 * - Security features
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
    StatusBar,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { AuthStackParamList } from '../../types/navigation';
import { signupThunk } from '../../../redux/thunks/authThunks';
import { clearError } from '../../../redux/slices/authSlice';
import { RootState } from '../../../redux/store';
import { useNetwork } from '../../context/NetworkContext';
import { uploadImage, isLocalFileUri } from '../../utils/imageUpload';
import Avatar from '../common/Avatar';

const { width } = Dimensions.get('window');
type SignupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function Signup() {
    const navigation = useNavigation<SignupNavigationProp>();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);
    const { isConnected } = useNetwork();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    // Avatar state
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

    // Request image picker permissions
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                console.log('Image picker permission not granted');
            }
        })();
    }, []);

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
     * Validate form before submission
     */
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        // Phone validation (Indian format)
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (phoneDigits.length !== 10) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        } else if (!/^[6-9]/.test(phoneDigits)) {
            errors.phone = 'Phone number must start with 6-9';
        }

        // Password validation (must match backend requirements)
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } else {
            // Check for uppercase, lowercase, and number (backend requirement)
            const hasUppercase = /[A-Z]/.test(formData.password);
            const hasLowercase = /[a-z]/.test(formData.password);
            const hasNumber = /\d/.test(formData.password);

            if (!hasUppercase || !hasLowercase || !hasNumber) {
                errors.password = 'Password must contain uppercase, lowercase, and number';
            }
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handle signup submission
     */
    const handleSignup = async () => {
        // Check internet connection
        if (!isConnected) {
            Alert.alert(
                'No Internet Connection',
                'Please connect to WiFi or mobile data to create an account.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Validate form
        if (!validateForm()) {
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

            // Dispatch signup thunk
            const result = await dispatch(signupThunk({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.replace(/\D/g, ''),
                password: formData.password,
                role: 'customer', // Default role
                profileImage: profileImageUrl, // Include avatar URL (null if not uploaded)
            }) as any);

            // Check if signup was successful
            if (signupThunk.fulfilled.match(result)) {
                // Success - navigation handled by RootNavigator based on auth state
                console.log('✅ Signup successful');
            } else if (signupThunk.rejected.match(result)) {
                // Error - show alert
                const errorMessage = result.payload?.message || 'Signup failed. Please try again.';
                Alert.alert('Signup Failed', errorMessage, [{ text: 'OK' }]);
            }
        } catch (error: any) {
            console.error('Signup error:', error);
            Alert.alert(
                'Signup Failed',
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#cb202d" />
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
                    {/* Modern Header with Gradient */}
                    <LinearGradient
                        colors={['#cb202d', '#e63946', '#cb202d']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <View style={styles.headerDecoration}>
                            <View style={styles.circle1} />
                            <View style={styles.circle2} />
                            <View style={styles.circle3} />
                        </View>

                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.logo}>🍕</Text>
                            </View>
                            <Text style={styles.title}>Join Friends Pizza</Text>
                            <Text style={styles.subtitle}>Create your account to start ordering</Text>
                        </View>
                    </LinearGradient>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Offline Banner */}
                        {!isConnected && (
                            <View style={styles.offlineBanner}>
                                <MaterialIcons name="cloud-off" size={16} color="#FFFFFF" />
                                <Text style={styles.offlineText}>
                                    You're offline. Connect to internet to sign up.
                                </Text>
                            </View>
                        )}

                        {/* Global Error */}
                        {error && (
                            <View style={styles.errorBanner}>
                                <MaterialIcons name="error-outline" size={16} color="#e63946" />
                                <Text style={styles.errorBannerText}>{error}</Text>
                            </View>
                        )}

                        {/* Form */}
                        <View style={styles.form}>
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
                                            <MaterialIcons name="add-a-photo" size={20} color="#cb202d" />
                                            <Text style={styles.avatarButtonText}>
                                                {avatarImage ? 'Change' : 'Add Photo'}
                                            </Text>
                                        </TouchableOpacity>
                                        {avatarImage && (
                                            <TouchableOpacity
                                                style={[styles.avatarButton, styles.removeButton]}
                                                onPress={handleRemoveAvatar}
                                                disabled={isLoading || isUploadingAvatar}
                                            >
                                                <MaterialIcons name="delete" size={20} color="#e63946" />
                                                <Text style={[styles.avatarButtonText, { color: '#e63946' }]}>
                                                    Remove
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <Text style={styles.avatarHint}>
                                    {avatarImage
                                        ? 'Your profile picture will be uploaded when you create your account'
                                        : 'If you don\'t add a photo, we\'ll use your initials'}
                                </Text>
                            </View>

                            {/* Name Input */}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={[
                                    styles.inputContainer,
                                    validationErrors.name && styles.inputContainerError
                                ]}>
                                    <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#999"
                                        value={formData.name}
                                        onChangeText={(value) => handleInputChange('name', value)}
                                        editable={!isLoading}
                                        autoCapitalize="words"
                                    />
                                </View>
                                {validationErrors.name && (
                                    <Text style={styles.errorText}>
                                        <MaterialIcons name="error-outline" size={12} /> {validationErrors.name}
                                    </Text>
                                )}
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={[
                                    styles.inputContainer,
                                    validationErrors.email && styles.inputContainerError
                                ]}>
                                    <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#999"
                                        value={formData.email}
                                        onChangeText={(value) => handleInputChange('email', value)}
                                        editable={!isLoading}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                {validationErrors.email && (
                                    <Text style={styles.errorText}>
                                        <MaterialIcons name="error-outline" size={12} /> {validationErrors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Phone Input */}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={[
                                    styles.inputContainer,
                                    validationErrors.phone && styles.inputContainerError
                                ]}>
                                    <MaterialIcons name="phone" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 10-digit phone number"
                                        placeholderTextColor="#999"
                                        value={formData.phone}
                                        onChangeText={(value) => handleInputChange('phone', value)}
                                        editable={!isLoading}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>
                                {validationErrors.phone && (
                                    <Text style={styles.errorText}>
                                        <MaterialIcons name="error-outline" size={12} /> {validationErrors.phone}
                                    </Text>
                                )}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    validationErrors.password && styles.inputContainerError
                                ]}>
                                    <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Min 6 chars (uppercase, lowercase, number)"
                                        placeholderTextColor="#999"
                                        value={formData.password}
                                        onChangeText={(value) => handleInputChange('password', value)}
                                        editable={!isLoading}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <MaterialIcons
                                            name={showPassword ? 'visibility' : 'visibility-off'}
                                            size={20}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {validationErrors.password && (
                                    <Text style={styles.errorText}>
                                        <MaterialIcons name="error-outline" size={12} /> {validationErrors.password}
                                    </Text>
                                )}
                                {!validationErrors.password && formData.password && (
                                    <Text style={styles.helperText}>
                                        Example: Naitik@123 or Password1
                                    </Text>
                                )}
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    validationErrors.confirmPassword && styles.inputContainerError
                                ]}>
                                    <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Re-enter your password"
                                        placeholderTextColor="#999"
                                        value={formData.confirmPassword}
                                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                        editable={!isLoading}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <MaterialIcons
                                            name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                            size={20}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {validationErrors.confirmPassword && (
                                    <Text style={styles.errorText}>
                                        <MaterialIcons name="error-outline" size={12} /> {validationErrors.confirmPassword}
                                    </Text>
                                )}
                            </View>

                            {/* Signup Button */}
                            <TouchableOpacity
                                style={[
                                    styles.signupButton,
                                    ((isLoading || isUploadingAvatar) || !isConnected) && styles.signupButtonDisabled
                                ]}
                                onPress={handleSignup}
                                disabled={(isLoading || isUploadingAvatar) || !isConnected}
                            >
                                <LinearGradient
                                    colors={((isLoading || isUploadingAvatar) || !isConnected) ? ['#BDBDBD', '#BDBDBD'] : ['#cb202d', '#e63946']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.signupButtonGradient}
                                >
                                    {(isLoading || isUploadingAvatar) ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <ActivityIndicator color="#fff" />
                                            <Text style={styles.signupButtonText}>
                                                {isUploadingAvatar ? 'Uploading Photo...' : 'Creating Account...'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={styles.signupButtonText}>Create Account</Text>
                                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Login')}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.loginLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Delivery Partner Link */}
                            <View style={styles.deliveryLinkContainer}>
                                <TouchableOpacity
                                    style={styles.deliveryButton}
                                    onPress={() => navigation.navigate('DeliverySignup')}
                                    disabled={isLoading}
                                >
                                    <MaterialIcons name="delivery-dining" size={24} color="#0C7C59" />
                                    <View style={styles.deliveryButtonContent}>
                                        <Text style={styles.deliveryButtonTitle}>Become a Delivery Partner</Text>
                                        <Text style={styles.deliveryButtonSubtitle}>Register as delivery agent</Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },

    // Header Styles
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 50,
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    headerDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -80,
        right: -50,
    },
    circle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -40,
        left: -30,
    },
    circle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        top: 80,
        left: 40,
    },
    header: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logo: {
        fontSize: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.95,
        fontWeight: '400',
    },

    // Form Card Styles
    formCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        paddingTop: 28,
        paddingHorizontal: 24,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },

    // Banner Styles
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe5e5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#e63946',
    },
    errorBannerText: {
        color: '#e63946',
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },

    // Form Styles
    form: {
        flex: 1,
    },

    // Avatar Section Styles
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
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
        borderColor: '#cb202d',
        gap: 6,
    },
    removeButton: {
        borderColor: '#e63946',
    },
    avatarButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#cb202d',
    },
    avatarHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },

    inputWrapper: {
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
        paddingVertical: 4,
        backgroundColor: '#fafafa',
    },
    inputContainerFocused: {
        borderColor: '#cb202d',
        backgroundColor: '#fff',
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    inputContainerError: {
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
        paddingVertical: 14,
    },
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    errorText: {
        color: '#e63946',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    helperText: {
        color: '#666',
        fontSize: 11,
        marginTop: 4,
        marginLeft: 4,
        fontStyle: 'italic',
    },

    // Button Styles
    signupButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    signupButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    signupButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Footer Styles
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        color: '#cb202d',
        fontWeight: '700',
    },

    // Delivery Link Styles
    deliveryLinkContainer: {
        marginTop: 24,
    },
    deliveryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#c8e6c9',
        backgroundColor: '#f1f8f4',
    },
    deliveryButtonContent: {
        flex: 1,
        marginLeft: 12,
    },
    deliveryButtonTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0C7C59',
        marginBottom: 2,
    },
    deliveryButtonSubtitle: {
        fontSize: 12,
        color: '#0C7C59',
        opacity: 0.8,
    },
});
