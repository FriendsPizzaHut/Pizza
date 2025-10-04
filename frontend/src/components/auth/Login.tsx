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
} from 'react-native';
import { useDispatch } from 'react-redux';
// Navigation will be handled by the parent component through Redux state
import { loginStart, loginSuccess, loginFailure, DEMO_CREDENTIALS } from '../../../redux/slices/authSlice';
import { saveAuthState } from '../../../redux/store';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);
        dispatch(loginStart());

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check demo credentials
            let matchedUser: any = null;
            let userRole: string | null = null;

            Object.entries(DEMO_CREDENTIALS).forEach(([role, creds]) => {
                if (creds.email === email && creds.password === password) {
                    matchedUser = creds.userData;
                    userRole = role;
                }
            });

            if (matchedUser) {
                // Save auth state to AsyncStorage
                await saveAuthState(matchedUser);

                // Update Redux state
                dispatch(loginSuccess(matchedUser));

                // Navigation will be handled automatically by the app layout
                // based on the Redux auth state change
            } else {
                dispatch(loginFailure());
                Alert.alert('Error', 'Invalid credentials. Please try demo accounts.');
            }
        } catch (error) {
            dispatch(loginFailure());
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoCredentials = (role: 'customer' | 'delivery' | 'admin') => {
        const creds = DEMO_CREDENTIALS[role];
        setEmail(creds.email);
        setPassword(creds.password);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.logo}>🍕</Text>
                    <Text style={styles.title}>Friends Pizza Hut</Text>
                    <Text style={styles.subtitle}>Welcome Back!</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.demoSection}>
                    <Text style={styles.demoTitle}>Demo Accounts</Text>
                    <Text style={styles.demoDescription}>
                        Try different user roles with these demo accounts:
                    </Text>

                    <TouchableOpacity
                        style={[styles.demoButton, styles.customerButton]}
                        onPress={() => fillDemoCredentials('customer')}
                        disabled={isLoading}
                    >
                        <Text style={styles.demoButtonText}>👤 Customer Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.demoButton, styles.deliveryButton]}
                        onPress={() => fillDemoCredentials('delivery')}
                        disabled={isLoading}
                    >
                        <Text style={styles.demoButtonText}>🚚 Delivery Partner</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.demoButton, styles.adminButton]}
                        onPress={() => fillDemoCredentials('admin')}
                        disabled={isLoading}
                    >
                        <Text style={styles.demoButtonText}>👨‍💼 Restaurant Admin</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    loginButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    demoSection: {
        marginTop: 20,
    },
    demoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    demoDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    demoButton: {
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
    },
    customerButton: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    deliveryButton: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
    },
    adminButton: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
    },
    demoButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});