import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';

/**
 * Toast Component
 * 
 * A reusable toast notification component for displaying
 * success, error, info, and warning messages.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
}

interface ToastProps extends ToastConfig {
    visible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onClose,
    onHide,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
            onHide?.();
        });
    };

    if (!visible) return null;

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return styles.success;
            case 'error':
                return styles.error;
            case 'warning':
                return styles.warning;
            case 'info':
            default:
                return styles.info;
        }
    };

    const getEmoji = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                },
            ]}
        >
            <TouchableOpacity
                style={[styles.toast, getToastStyle()]}
                onPress={hideToast}
                activeOpacity={0.9}
            >
                <Text style={styles.emoji}>{getEmoji()}</Text>
                <Text style={styles.message}>{message}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Toast Manager Hook
let toastQueue: ToastConfig[] = [];
let showToastCallback: ((config: ToastConfig) => void) | null = null;

export const useToast = () => {
    const [currentToast, setCurrentToast] = useState<ToastConfig | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        showToastCallback = (config: ToastConfig) => {
            setCurrentToast(config);
            setVisible(true);
        };

        // Process queued toasts
        if (toastQueue.length > 0) {
            const nextToast = toastQueue.shift();
            if (nextToast) {
                showToastCallback(nextToast);
            }
        }

        return () => {
            showToastCallback = null;
        };
    }, []);

    const show = (config: ToastConfig) => {
        if (showToastCallback) {
            showToastCallback(config);
        } else {
            toastQueue.push(config);
        }
    };

    const hide = () => {
        setVisible(false);
    };

    const showSuccess = (message: string, duration?: number) => {
        show({ message, type: 'success', duration });
    };

    const showError = (message: string, duration?: number) => {
        show({ message, type: 'error', duration });
    };

    const showWarning = (message: string, duration?: number) => {
        show({ message, type: 'warning', duration });
    };

    const showInfo = (message: string, duration?: number) => {
        show({ message, type: 'info', duration });
    };

    return {
        Toast: currentToast ? (
            <Toast
                visible={visible}
                message={currentToast.message}
                type={currentToast.type}
                duration={currentToast.duration}
                onClose={hide}
                onHide={currentToast.onHide}
            />
        ) : null,
        show,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 20,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        maxWidth: width - 40,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    emoji: {
        fontSize: 20,
        marginRight: 10,
    },
    message: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    success: {
        backgroundColor: '#4CAF50',
    },
    error: {
        backgroundColor: '#F44336',
    },
    warning: {
        backgroundColor: '#FF9800',
    },
    info: {
        backgroundColor: '#2196F3',
    },
});

export default Toast;
