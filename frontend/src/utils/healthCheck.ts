/**
 * Backend Health Check Utility
 * 
 * Verifies backend connectivity and provides detailed diagnostics.
 * Handles network errors, timeouts, and server crashes gracefully.
 */

import axios, { AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import ENV from '../config/environment';

export interface HealthCheckResult {
    success: boolean;
    status: 'healthy' | 'unhealthy' | 'timeout' | 'network_error' | 'unreachable';
    message: string;
    details?: {
        responseTime?: number;
        serverVersion?: string;
        environment?: string;
        timestamp?: string;
        error?: string;
    };
}

/**
 * Check if device has internet connectivity
 */
export const checkInternetConnection = async (): Promise<boolean> => {
    try {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected === true && netInfo.isInternetReachable === true;
    } catch (error) {
        console.error('NetInfo error:', error);
        return false;
    }
};

/**
 * Perform comprehensive backend health check
 */
export const checkBackendHealth = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();

    try {
        // Step 1: Check internet connectivity first
        const hasInternet = await checkInternetConnection();
        if (!hasInternet) {
            return {
                success: false,
                status: 'network_error',
                message: 'No internet connection. Please check your network settings.',
                details: {
                    error: 'Device is offline',
                },
            };
        }

        // Step 2: Ping backend health endpoint
        const response = await axios.get(`${ENV.API_URL.replace('/api', '')}/health`, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseTime = Date.now() - startTime;

        // Step 3: Validate response
        if (response.status === 200 && response.data) {
            return {
                success: true,
                status: 'healthy',
                message: 'Backend is healthy and reachable',
                details: {
                    responseTime,
                    serverVersion: response.data.version || 'unknown',
                    environment: response.data.environment || 'unknown',
                    timestamp: response.data.timestamp || new Date().toISOString(),
                },
            };
        }

        return {
            success: false,
            status: 'unhealthy',
            message: 'Backend responded but returned unexpected data',
            details: {
                responseTime,
                error: 'Invalid health check response',
            },
        };

    } catch (error) {
        const responseTime = Date.now() - startTime;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            // Handle timeout
            if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
                return {
                    success: false,
                    status: 'timeout',
                    message: 'Backend request timed out. Server might be slow or down.',
                    details: {
                        responseTime,
                        error: 'Request timeout after 10 seconds',
                    },
                };
            }

            // Handle network errors (server unreachable)
            if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
                return {
                    success: false,
                    status: 'unreachable',
                    message: `Backend is unreachable at ${ENV.API_URL}. Please check if server is running.`,
                    details: {
                        responseTime,
                        error: `Connection refused or server not found (${axiosError.code})`,
                    },
                };
            }

            // Handle HTTP errors (500, 503, etc.)
            if (axiosError.response) {
                return {
                    success: false,
                    status: 'unhealthy',
                    message: `Backend returned error: ${axiosError.response.status} ${axiosError.response.statusText}`,
                    details: {
                        responseTime,
                        error: `HTTP ${axiosError.response.status}: ${axiosError.message}`,
                    },
                };
            }

            // Generic network error
            return {
                success: false,
                status: 'network_error',
                message: 'Network error occurred while checking backend',
                details: {
                    responseTime,
                    error: axiosError.message,
                },
            };
        }

        // Unknown error
        return {
            success: false,
            status: 'unhealthy',
            message: 'Unknown error occurred during health check',
            details: {
                responseTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        };
    }
};

/**
 * Check if backend is reachable (quick check)
 * Use this for fast connectivity tests
 */
export const isBackendReachable = async (): Promise<boolean> => {
    try {
        const result = await checkBackendHealth();
        return result.success;
    } catch {
        return false;
    }
};

/**
 * Get backend connection diagnostics (for debugging)
 */
export const getConnectionDiagnostics = async (): Promise<{
    internetConnected: boolean;
    backendReachable: boolean;
    healthCheck: HealthCheckResult;
    apiUrl: string;
    socketUrl: string;
}> => {
    const internetConnected = await checkInternetConnection();
    const healthCheck = await checkBackendHealth();
    const backendReachable = healthCheck.success;

    return {
        internetConnected,
        backendReachable,
        healthCheck,
        apiUrl: ENV.API_URL,
        socketUrl: ENV.SOCKET_URL,
    };
};

/**
 * Log connection diagnostics to console (development only)
 */
export const logConnectionDiagnostics = async (): Promise<void> => {
    if (!__DEV__) return;

    console.log('🔍 Running Connection Diagnostics...\n');

    const diagnostics = await getConnectionDiagnostics();

    console.log('📊 Diagnostics Results:');
    console.log('├─ Internet Connected:', diagnostics.internetConnected ? '✅' : '❌');
    console.log('├─ Backend Reachable:', diagnostics.backendReachable ? '✅' : '❌');
    console.log('├─ API URL:', diagnostics.apiUrl);
    console.log('├─ Socket URL:', diagnostics.socketUrl);
    console.log('└─ Health Check:', diagnostics.healthCheck.status);

    if (diagnostics.healthCheck.details) {
        console.log('\n📈 Health Check Details:');
        Object.entries(diagnostics.healthCheck.details).forEach(([key, value]) => {
            console.log(`   ├─ ${key}:`, value);
        });
    }

    console.log('\n💡 Message:', diagnostics.healthCheck.message);

    // Provide actionable advice
    if (!diagnostics.internetConnected) {
        console.warn('\n⚠️ Action Required: Enable WiFi or mobile data');
    } else if (!diagnostics.backendReachable) {
        console.warn('\n⚠️ Action Required: Start backend server or update API_URL in environment.ts');
        console.warn('   Run: cd backend && npm start');
    } else {
        console.log('\n✅ All systems operational!');
    }
};

export default {
    checkBackendHealth,
    isBackendReachable,
    getConnectionDiagnostics,
    logConnectionDiagnostics,
    checkInternetConnection,
};
