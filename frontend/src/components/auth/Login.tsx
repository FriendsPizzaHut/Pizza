import React, { useState, useRef, useCallback } from 'react';
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
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../common/Loader';
import { useToast } from '../common/Toast';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function Login() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    bounces={false}
                >
                    <View style={{ flex: 1 }}>
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
                                <Text style={styles.title}>Friends Pizza Hut</Text>
                                <Text style={styles.subtitle}>Delicious food, delivered to you</Text>
                            </View>
                        </LinearGradient>

                        {/* Login Form Card */}
                        <View style={styles.formCard}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>Welcome Back!</Text>
                                <Text style={styles.formSubtitle}>Sign in to continue ordering</Text>
                            </View>

                            <View style={styles.form}>
                                {/* Email Input */}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={[
                                        styles.inputContainer,
                                        error && styles.inputContainerError
                                    ]}>
                                        <MaterialIcons
                                            name="email"
                                            size={20}
                                            color="#999"
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
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
                                            autoComplete="off"
                                            textContentType="none"
                                            editable={!isLoading}
                                            returnKeyType="next"
                                            blurOnSubmit={false}
                                            autoFocus={false}
                                            importantForAutofill="no"
                                        />
                                    </View>
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={[
                                        styles.inputContainer,
                                        error && styles.inputContainerError
                                    ]}>
                                        <MaterialIcons
                                            name="lock"
                                            size={20}
                                            color="#999"
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            value={password}
                                            onChangeText={(text) => {
                                                setPassword(text);
                                                setError('');
                                            }}
                                            placeholder="Enter your password"
                                            placeholderTextColor="#999"
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            textContentType="none"
                                            editable={!isLoading}
                                            returnKeyType="done"
                                            onSubmitEditing={handleLogin}
                                            autoFocus={false}
                                            importantForAutofill="no"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <MaterialIcons
                                                name={showPassword ? "visibility" : "visibility-off"}
                                                size={20}
                                                color="#999"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Error Message */}
                                {error ? (
                                    <View style={styles.errorContainer}>
                                        <MaterialIcons name="error-outline" size={16} color="#e63946" />
                                        <Text style={styles.errorText}>{error}</Text>
                                    </View>
                                ) : null}

                                {/* Forgot Password Link */}
                                <TouchableOpacity style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>

                                {/* Login Button */}
                                <TouchableOpacity
                                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={isLoading ? ['#BDBDBD', '#BDBDBD'] : ['#cb202d', '#e63946']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginButtonGradient}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={styles.loginButtonText}>Sign In</Text>
                                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Sign Up Link */}
                            <View style={styles.signupContainer}>
                                <Text style={styles.signupText}>New to Friends Pizza? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                                    <Text style={styles.signupLink}>Create Account</Text>
                                </TouchableOpacity>
                            </View>
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
        top: 100,
        left: 40,
    },
    header: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logo: {
        fontSize: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
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
        paddingTop: 32,
        paddingHorizontal: 24,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    formHeader: {
        marginBottom: 28,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '400',
    },

    // Form Styles
    form: {
        marginBottom: 16,
    },
    inputWrapper: {
        marginBottom: 20,
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

    // Error Styles
    errorContainer: {
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
    errorText: {
        color: '#e63946',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },

    // Forgot Password
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#cb202d',
        fontWeight: '600',
    },

    // Login Button
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    loginButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Sign Up Section
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#cb202d',
        fontWeight: '700',
    },
});