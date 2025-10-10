import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { registerStart, registerSuccess, registerFailure } from '../../../redux/slices/authSlice';
import { register } from '../../api/authService';
import { RootState, saveAuthState } from '../../../redux/store';
import { Loader } from '../common';
import { isValidEmail, isValidPhone, validatePassword, isValidName } from '../../utils/validators';
import { UserRole } from '../../types/auth';

/**
 * Register Screen Component
 * 
 * Allows new users to create an account with role selection.
 */

const Register: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

    // Error state
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    /**
     * Validate form fields
     */
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        // Name validation
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (!isValidName(name)) {
            newErrors.name = 'Please enter a valid name';
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Phone validation
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!isValidPhone(phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.errors[0];
            }
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle Register
     */
    const handleRegister = async () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        dispatch(registerStart());

        try {
            const response = await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                password,
                role: selectedRole,
            });

            // Save to Redux
            dispatch(
                registerSuccess({
                    token: response.data.token,
                    role: response.data.user.role,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    userId: response.data.user.id,
                })
            );

            // Save to AsyncStorage
            await saveAuthState({
                token: response.data.token,
                role: response.data.user.role,
                name: response.data.user.name,
                email: response.data.user.email,
                userId: response.data.user.id,
            });

            // Show success message
            Alert.alert(
                'Registration Successful',
                'Your account has been created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigation will be handled by RootNavigator based on role
                        },
                    },
                ]
            );
        } catch (error: any) {
            dispatch(registerFailure());
            Alert.alert('Registration Failed', error.message || 'Please try again');
        }
    };

    /**
     * Quick Fill Demo Account
     */
    const fillDemoAccount = (role: UserRole) => {
        setName(`${role.charAt(0).toUpperCase()}${role.slice(1)} User`);
        setEmail(`${role}@demo.com`);
        setPhone('+91 9876543210');
        setPassword(`${role}123`);
        setConfirmPassword(`${role}123`);
        setSelectedRole(role);
        setErrors({});
    };

    /**
     * Navigate to Login
     */
    const goToLogin = () => {
        navigation.navigate('Login' as never);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                {/* Role Selection */}
                <View style={styles.roleContainer}>
                    <Text style={styles.label}>I am a:</Text>
                    <View style={styles.roleButtons}>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                selectedRole === 'customer' && styles.roleButtonActive,
                                { borderColor: '#FF6347' },
                            ]}
                            onPress={() => setSelectedRole('customer')}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    selectedRole === 'customer' && styles.roleButtonTextActive,
                                ]}
                            >
                                🛒 Customer
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                selectedRole === 'delivery' && styles.roleButtonActive,
                                { borderColor: '#4CAF50' },
                            ]}
                            onPress={() => setSelectedRole('delivery')}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    selectedRole === 'delivery' && styles.roleButtonTextActive,
                                ]}
                            >
                                🚚 Delivery
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                selectedRole === 'admin' && styles.roleButtonActive,
                                { borderColor: '#2196F3' },
                            ]}
                            onPress={() => setSelectedRole('admin')}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    selectedRole === 'admin' && styles.roleButtonTextActive,
                                ]}
                            >
                                👨‍💼 Admin
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="John Doe"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            autoCapitalize="words"
                            editable={!isLoading}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="john@example.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            placeholder="+91 9876543210"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                if (errors.phone) setErrors({ ...errors, phone: undefined });
                            }}
                            keyboardType="phone-pad"
                            editable={!isLoading}
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Enter password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            secureTextEntry
                            editable={!isLoading}
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        <Text style={styles.helperText}>
                            Must be 8+ characters with uppercase, lowercase, number & special character
                        </Text>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.inputError]}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword)
                                    setErrors({ ...errors, confirmPassword: undefined });
                            }}
                            secureTextEntry
                            editable={!isLoading}
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                    </View>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={[
                        styles.registerButton,
                        isLoading && styles.buttonDisabled,
                        { backgroundColor: getRoleColor(selectedRole) },
                    ]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader visible={true} size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.registerButtonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Demo Account Buttons */}
                <View style={styles.demoContainer}>
                    <Text style={styles.demoTitle}>Quick Fill (Testing Only)</Text>
                    <View style={styles.demoButtons}>
                        <TouchableOpacity
                            style={[styles.demoButton, { backgroundColor: '#FF6347' }]}
                            onPress={() => fillDemoAccount('customer')}
                        >
                            <Text style={styles.demoButtonText}>Customer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.demoButton, { backgroundColor: '#4CAF50' }]}
                            onPress={() => fillDemoAccount('delivery')}
                        >
                            <Text style={styles.demoButtonText}>Delivery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.demoButton, { backgroundColor: '#2196F3' }]}
                            onPress={() => fillDemoAccount('admin')}
                        >
                            <Text style={styles.demoButtonText}>Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={goToLogin}>
                        <Text style={styles.linkText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

/**
 * Get role-specific color
 */
const getRoleColor = (role: UserRole): string => {
    switch (role) {
        case 'customer':
            return '#FF6347';
        case 'delivery':
            return '#4CAF50';
        case 'admin':
            return '#2196F3';
        default:
            return '#FF6347';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
    },
    roleContainer: {
        marginBottom: 24,
    },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    roleButtonActive: {
        backgroundColor: '#F5F5F5',
    },
    roleButtonText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: '#333333',
        fontWeight: 'bold',
    },
    form: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333333',
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#F44336',
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: 4,
    },
    helperText: {
        color: '#999999',
        fontSize: 12,
        marginTop: 4,
    },
    registerButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    demoContainer: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 12,
        textAlign: 'center',
    },
    demoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    demoButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    demoButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#666666',
    },
    linkText: {
        fontSize: 14,
        color: '#FF6347',
        fontWeight: 'bold',
    },
});

export default Register;
