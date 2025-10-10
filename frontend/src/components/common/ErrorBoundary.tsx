import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { errorLogger } from '../../services/errorLogger';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors to a central error logger (with Sentry support),
 * and displays a user-friendly fallback UI.
 */

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Store error info in state
        this.setState({ errorInfo });

        // Log to centralized error logger (Sentry, etc.)
        errorLogger.logError(error, {
            componentStack: errorInfo.componentStack,
            type: 'react-error-boundary',
        }, 'error');

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <View style={styles.container}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.content}>
                            <Text style={styles.emoji}>😕</Text>
                            <Text style={styles.title}>Oops! Something went wrong</Text>
                            <Text style={styles.message}>
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </Text>
                            <Text style={styles.subMessage}>
                                Don't worry, we've logged this error and our team will look into it.
                            </Text>

                            {__DEV__ && this.state.error && (
                                <View style={styles.debugBox}>
                                    <Text style={styles.debugTitle}>Error Details (Dev Mode):</Text>
                                    <ScrollView
                                        style={styles.debugScroll}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        <Text style={styles.debugText}>
                                            {this.state.error.stack || 'No stack trace available'}
                                        </Text>
                                    </ScrollView>
                                </View>
                            )}

                            {__DEV__ && this.state.errorInfo && (
                                <View style={styles.debugBox}>
                                    <Text style={styles.debugTitle}>Component Stack:</Text>
                                    <ScrollView
                                        style={styles.debugScroll}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        <Text style={styles.debugText}>
                                            {this.state.errorInfo.componentStack || 'No component stack available'}
                                        </Text>
                                    </ScrollView>
                                </View>
                            )}

                            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                                <Text style={styles.buttonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: '100%',
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    emoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24,
    },
    subMessage: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    debugBox: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    debugScroll: {
        maxHeight: 150,
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF6347',
        marginBottom: 10,
    },
    debugText: {
        fontSize: 12,
        color: '#333333',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    button: {
        backgroundColor: '#FF6347',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
        minWidth: 150,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ErrorBoundary;
