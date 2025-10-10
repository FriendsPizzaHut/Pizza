import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_ACCOUNTS } from '../../api/authService';
import { Loader } from '../common/Loader';
import { useToast } from '../common/Toast';

export default function Login() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { showError, showSuccess, Toast } = useToast();

    const handleLogin = async () => {
        // Validation
        if (!email.trim()) {
            setError('Please enter your email');
            showError('Please enter your email');
            return;
        }

        if (!password) {
            setError('Please enter your password');
            showError('Please enter your password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await login({ email: email.trim().toLowerCase(), password });
            showSuccess('Login successful!');
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoCredentials = (role: 'customer' | 'delivery' | 'admin') => {
        const account = DEMO_ACCOUNTS[role];
        setEmail(account.email);
        setPassword(account.password);
        setError('');
    };

    return (
        <>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header with Gradient */}
                    <LinearGradient
                        colors={['#FF6347', '#FFA500']}
                        style={styles.headerGradient}
                    >
                        <View style={styles.header}>
                            <Text style={styles.logo}>🍕</Text>
                            <Text style={styles.title}>Friends Pizza Hut</Text>
                            <Text style={styles.subtitle}>Welcome Back!</Text>
                        </View>
                    </LinearGradient>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Sign In</Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>⚠️ {error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={[styles.input, error && styles.inputError]}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setError('');
                                    }}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={[styles.input, error && styles.inputError]}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setError('');
                                    }}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Demo Accounts Section */}
                        <View style={styles.demoSection}>
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>Demo Accounts</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <Text style={styles.demoDescription}>
                                Try different user roles with these demo accounts:
                            </Text>

                            <TouchableOpacity
                                style={[styles.demoButton, styles.customerButton]}
                                onPress={() => fillDemoCredentials('customer')}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.demoButtonEmoji}>👤</Text>
                                <View style={styles.demoButtonContent}>
                                    <Text style={styles.demoButtonTitle}>Customer Account</Text>
                                    <Text style={styles.demoButtonEmail}>{DEMO_ACCOUNTS.customer.email}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.demoButton, styles.deliveryButton]}
                                onPress={() => fillDemoCredentials('delivery')}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.demoButtonEmoji}>🚚</Text>
                                <View style={styles.demoButtonContent}>
                                    <Text style={styles.demoButtonTitle}>Delivery Partner</Text>
                                    <Text style={styles.demoButtonEmail}>{DEMO_ACCOUNTS.delivery.email}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.demoButton, styles.adminButton]}
                                onPress={() => fillDemoCredentials('admin')}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.demoButtonEmoji}>👨‍💼</Text>
                                <View style={styles.demoButtonContent}>
                                    <Text style={styles.demoButtonTitle}>Restaurant Admin</Text>
                                    <Text style={styles.demoButtonEmail}>{DEMO_ACCOUNTS.admin.email}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Toast Messages */}
            {Toast}

            {/* Full Screen Loader */}
            <Loader visible={isLoading} overlay={true} text="Signing in..." />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 80,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -20,
        paddingTop: 30,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
        fontWeight: '500',
    },
    form: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        color: '#333',
    },
    inputError: {
        borderColor: '#F44336',
    },
    loginButton: {
        backgroundColor: '#FF6347',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#FF6347',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonDisabled: {
        backgroundColor: '#BDBDBD',
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    demoSection: {
        marginTop: 30,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    demoDescription: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    customerButton: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF6347',
    },
    deliveryButton: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    adminButton: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    demoButtonEmoji: {
        fontSize: 32,
        marginRight: 15,
    },
    demoButtonContent: {
        flex: 1,
    },
    demoButtonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    demoButtonEmail: {
        fontSize: 13,
        color: '#666',
    },
    demoButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#FF6347',
        fontWeight: 'bold',
    },
});