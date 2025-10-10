/**
 * Toast Notification Utility
 * 
 * Provides cross-platform toast notifications for user feedback
 * Works on both iOS and Android
 */

import { Platform, ToastAndroid, Alert } from 'react-native';

export type ToastDuration = 'short' | 'long';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Show a toast notification
 * 
 * @param message - Message to display
 * @param duration - Duration ('short' or 'long')
 * @param type - Type of toast (affects icon/color if supported)
 */
export const showToast = (
    message: string,
    duration: ToastDuration = 'short',
    type: ToastType = 'info'
): void => {
    const durationValue =
        duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG;

    if (Platform.OS === 'android') {
        // Android: Use native ToastAndroid
        ToastAndroid.show(message, durationValue);
    } else {
        // iOS: Use Alert as fallback (or you can integrate a toast library like react-native-toast-message)
        // For a better UX, consider using a dedicated toast library
        Alert.alert(
            type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
            message,
            [{ text: 'OK' }],
            { cancelable: true }
        );
    }
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string, duration?: ToastDuration): void => {
    showToast(`✅ ${message}`, duration, 'success');
};

/**
 * Show error toast
 */
export const showErrorToast = (message: string, duration?: ToastDuration): void => {
    showToast(`❌ ${message}`, duration, 'error');
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string, duration?: ToastDuration): void => {
    showToast(`ℹ️ ${message}`, duration, 'info');
};

/**
 * Show warning toast
 */
export const showWarningToast = (message: string, duration?: ToastDuration): void => {
    showToast(`⚠️ ${message}`, duration, 'warning');
};

/**
 * Show offline mode toast
 */
export const showOfflineToast = (): void => {
    showToast('📥 Saved locally. Will sync when back online.', 'short', 'info');
};

/**
 * Show sync success toast
 */
export const showSyncSuccessToast = (count: number = 1): void => {
    const message =
        count === 1
            ? 'Your offline changes have been synced.'
            : `${count} offline changes have been synced.`;
    showToast(`🔄 ${message}`, 'short', 'success');
};

/**
 * Show network restored toast
 */
export const showNetworkRestoredToast = (): void => {
    showToast('🌐 Network connection restored', 'short', 'success');
};

/**
 * Show network disconnected toast
 */
export const showNetworkDisconnectedToast = (): void => {
    showToast('📡 You are offline. Changes will be saved locally.', 'long', 'warning');
};

export default {
    show: showToast,
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast,
    warning: showWarningToast,
    offline: showOfflineToast,
    syncSuccess: showSyncSuccessToast,
    networkRestored: showNetworkRestoredToast,
    networkDisconnected: showNetworkDisconnectedToast,
};
