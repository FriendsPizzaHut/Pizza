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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { signupThunk } from '../../../redux/thunks/authThunks';
import { clearError } from '../../../redux/slices/authSlice';
import { RootState } from '../../../redux/store';
import { useNetwork } from '../../context/NetworkContext';

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
            // Dispatch signup thunk
            const result = await dispatch(signupThunk({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.replace(/\D/g, ''),
                password: formData.password,
                role: 'customer', // Default role
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join us and start ordering delicious pizzas!
                    </Text>
                </View>

                {/* Offline Banner */}
                {!isConnected && (
                    <View style={styles.offlineBanner}>
                        <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
                        <Text style={styles.offlineText}>
                            You're offline. Connect to internet to sign up.
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
                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.name && styles.inputError
                        ]}>
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
                        {validationErrors.name && (
                            <Text style={styles.errorText}>{validationErrors.name}</Text>
                        )}
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.email && styles.inputError
                        ]}>
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
                                autoCorrect={false}
                            />
                        </View>
                        {validationErrors.email && (
                            <Text style={styles.errorText}>{validationErrors.email}</Text>
                        )}
                    </View>

                    {/* Phone Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.phone && styles.inputError
                        ]}>
                            <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 10-digit phone number"
                                placeholderTextColor="#94A3B8"
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                editable={!isLoading}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                        {validationErrors.phone && (
                            <Text style={styles.errorText}>{validationErrors.phone}</Text>
                        )}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.password && styles.inputError
                        ]}>
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
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.password && (
                            <Text style={styles.errorText}>{validationErrors.password}</Text>
                        )}
                        {!validationErrors.password && (
                            <Text style={styles.helperText}>
                                Example: Naitik@123 or Password1
                            </Text>
                        )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[
                            styles.inputContainer,
                            validationErrors.confirmPassword && styles.inputError
                        ]}>
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
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.confirmPassword && (
                            <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
                        )}
                    </View>

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[
                            styles.signupButton,
                            (isLoading || !isConnected) && styles.signupButtonDisabled
                        ]}
                        onPress={handleSignup}
                        disabled={isLoading || !isConnected}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Delivery Partner Link */}
                    <View style={styles.deliveryLinkContainer}>
                        <View style={styles.divider} />
                        <TouchableOpacity
                            style={styles.deliveryButton}
                            onPress={() => navigation.navigate('DeliverySignup')}
                            disabled={isLoading}
                        >
                            <Ionicons name="bicycle" size={20} color="#4CAF50" />
                            <Text style={styles.deliveryButtonText}>
                                Want to become a delivery partner? Register here
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#4CAF50" />
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
        paddingBottom: 40, // Extra padding to prevent keyboard overlap
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
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
    helperText: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    signupButton: {
        backgroundColor: '#FF6347',
        borderRadius: 12,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#FF6347',
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
        color: '#FF6347',
    },
    deliveryLinkContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        width: '100%',
        marginBottom: 24,
    },
    deliveryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#4CAF50',
        gap: 8,
    },
    deliveryButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4CAF50',
        flex: 1,
        textAlign: 'center',
    },
});
