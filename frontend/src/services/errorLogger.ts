/**
 * Error Logger Service
 * 
 * Centralized error logging service that can integrate with Sentry or custom backend.
 * Handles error collection, formatting, and reporting.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Uncomment and install if using Sentry
// import * as Sentry from '@sentry/react-native';

interface ErrorLog {
    id: string;
    timestamp: number;
    message: string;
    stack?: string;
    context?: any;
    platform: string;
    platformVersion: string | number;
    userId?: string;
    severity: 'error' | 'warning' | 'info';
}

class ErrorLogger {
    private static instance: ErrorLogger;
    private isInitialized: boolean = false;
    private errorQueue: ErrorLog[] = [];
    private readonly MAX_QUEUE_SIZE = 50;
    private readonly STORAGE_KEY = '@error_logs';

    private constructor() { }

    static getInstance(): ErrorLogger {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }

    /**
     * Initialize the error logger
     * Set up Sentry or custom error tracking here
     */
    async initialize(config?: { sentryDsn?: string; environment?: string }): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // Initialize Sentry if DSN is provided
            if (config?.sentryDsn) {
                // Uncomment when using Sentry
                // Sentry.init({
                //     dsn: config.sentryDsn,
                //     environment: config.environment || (__DEV__ ? 'development' : 'production'),
                //     enableAutoSessionTracking: true,
                //     tracesSampleRate: 1.0,
                // });
            }

            // Load previous errors from storage
            await this.loadErrorsFromStorage();

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize ErrorLogger:', error);
        }
    }

    /**
     * Log an error
     */
    async logError(
        error: Error,
        context?: any,
        severity: 'error' | 'warning' | 'info' = 'error'
    ): Promise<void> {
        try {
            const errorLog: ErrorLog = {
                id: this.generateId(),
                timestamp: Date.now(),
                message: error.message,
                stack: error.stack,
                context,
                platform: Platform.OS,
                platformVersion: Platform.Version,
                severity,
            };

            // Add to queue
            this.errorQueue.push(errorLog);

            // Limit queue size
            if (this.errorQueue.length > this.MAX_QUEUE_SIZE) {
                this.errorQueue.shift();
            }

            // Log to console in development
            if (__DEV__) {
                console.error(`[${severity.toUpperCase()}]`, error.message, context);
            }

            // Send to Sentry if available
            // Uncomment when using Sentry
            // if (severity === 'error') {
            //     Sentry.captureException(error, {
            //         contexts: { custom: context },
            //     });
            // } else {
            //     Sentry.captureMessage(error.message, severity as any);
            // }

            // Save to storage
            await this.saveErrorsToStorage();

            // Send to custom backend (optional)
            // await this.sendToBackend(errorLog);
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    /**
     * Log a network error
     */
    async logNetworkError(error: any, request: any): Promise<void> {
        const errorMessage = error.message || 'Network request failed';
        const networkError = new Error(errorMessage);

        await this.logError(networkError, {
            type: 'network',
            url: request.url,
            method: request.method,
            status: error.response?.status,
            responseData: error.response?.data,
        });
    }

    /**
     * Log a warning
     */
    async logWarning(message: string, context?: any): Promise<void> {
        const warning = new Error(message);
        await this.logError(warning, context, 'warning');
    }

    /**
     * Log info
     */
    async logInfo(message: string, context?: any): Promise<void> {
        const info = new Error(message);
        await this.logError(info, context, 'info');
    }

    /**
     * Set user context for error tracking
     */
    setUserContext(userId: string, userData?: any): void {
        // Uncomment when using Sentry
        // Sentry.setUser({
        //     id: userId,
        //     ...userData,
        // });
    }

    /**
     * Clear user context
     */
    clearUserContext(): void {
        // Uncomment when using Sentry
        // Sentry.setUser(null);
    }

    /**
     * Get all logged errors
     */
    getErrorLogs(): ErrorLog[] {
        return [...this.errorQueue];
    }

    /**
     * Clear all logged errors
     */
    async clearErrorLogs(): Promise<void> {
        this.errorQueue = [];
        await AsyncStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save errors to AsyncStorage
     */
    private async saveErrorsToStorage(): Promise<void> {
        try {
            const serialized = JSON.stringify(this.errorQueue);
            await AsyncStorage.setItem(this.STORAGE_KEY, serialized);
        } catch (error) {
            console.error('Failed to save errors to storage:', error);
        }
    }

    /**
     * Load errors from AsyncStorage
     */
    private async loadErrorsFromStorage(): Promise<void> {
        try {
            const serialized = await AsyncStorage.getItem(this.STORAGE_KEY);
            if (serialized) {
                this.errorQueue = JSON.parse(serialized);
            }
        } catch (error) {
            console.error('Failed to load errors from storage:', error);
        }
    }

    /**
     * Send error to custom backend (optional)
     */
    private async sendToBackend(errorLog: ErrorLog): Promise<void> {
        // Implement custom backend logging here
        // Example:
        // try {
        //     await fetch('YOUR_BACKEND_URL/api/logs/errors', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(errorLog),
        //     });
        // } catch (error) {
        //     // Silent fail for logging endpoint
        // }
    }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Export class for testing
export default ErrorLogger;
