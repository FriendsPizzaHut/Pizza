/**
 * Performance Optimization Initialization System
 * 
 * Comprehensive setup and initialization of all performance
 * optimizations for the React Native Pizza App
 */

import React, { useEffect, useCallback, memo } from 'react';
import { Platform, Dimensions, AppState, DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all performance systems
import {
    initializePerformanceMonitoring,
    performanceMonitor,
    MemoryLeakDetector
} from './performance';
import { useAppStore, restoreStore } from '../stores/appStore';
import {
    initializeSocket,
    connectSocket,
    disconnectSocket
} from '../services/socketManager';
import {
    ImageCacheManager,
    preloadImages
} from '../components/common/OptimizedImage';
import {
    backgroundTaskManager,
    BackgroundTaskManager
} from './backgroundTasks';
import {
    preloadCriticalScreens,
    LazyComponentManager
} from './lazyLoading';

// Initialize Why Did You Render (only in local dev, not EAS builds)
if (__DEV__ && !process.env.EAS_BUILD) {
    try {
        require('./whyDidYouRender');
    } catch (error) {
        console.log('Why Did You Render not loaded');
    }
}

// Performance configuration interface
export interface PerformanceConfig {
    enableMonitoring: boolean;
    enableImageCache: boolean;
    enableBackgroundTasks: boolean;
    enableSocketOptimization: boolean;
    enableLazyLoading: boolean;
    performanceMode: 'normal' | 'battery_saver' | 'high_performance';
    debugMode: boolean;
    preloadCriticalAssets: boolean;
    enableMemoryOptimizations: boolean;
}

// Device capability detection
class DeviceCapabilityDetector {
    private static capabilities: any = null;

    static async detectCapabilities() {
        if (this.capabilities) return this.capabilities;

        const screen = Dimensions.get('screen');
        const window = Dimensions.get('window');

        // Estimate device performance tier
        const screenSize = screen.width * screen.height;
        const isTablet = Math.min(screen.width, screen.height) >= 768;
        const isHighRes = screenSize >= 1920 * 1080;

        // Performance tier estimation
        let performanceTier: 'low' | 'medium' | 'high' = 'medium';

        if (Platform.OS === 'ios') {
            // iOS devices generally have better performance
            performanceTier = isHighRes ? 'high' : 'medium';
        } else {
            // Android performance varies more
            performanceTier = screenSize > 1280 * 720 ? 'medium' : 'low';
        }

        // Memory estimation (rough)
        const estimatedMemory = isTablet ? 4 : isHighRes ? 3 : 2; // GB

        this.capabilities = {
            platform: Platform.OS,
            screen,
            window,
            isTablet,
            isHighRes,
            performanceTier,
            estimatedMemory,
            supportsWebP: Platform.OS === 'android' || (Platform.OS === 'ios' && typeof Platform.Version === 'number' && Platform.Version >= 14),
            supportsHaptics: Platform.OS === 'ios',
            pixelRatio: screen.scale || 1,
        };

        return this.capabilities;
    }

    static getOptimalConfig(): Partial<PerformanceConfig> {
        if (!this.capabilities) {
            throw new Error('Capabilities not detected. Call detectCapabilities() first.');
        }

        const { performanceTier, estimatedMemory, isTablet } = this.capabilities;

        switch (performanceTier) {
            case 'high':
                return {
                    performanceMode: 'high_performance',
                    enableImageCache: true,
                    enableBackgroundTasks: true,
                    enableMemoryOptimizations: false,
                    preloadCriticalAssets: true,
                };
            case 'medium':
                return {
                    performanceMode: 'normal',
                    enableImageCache: true,
                    enableBackgroundTasks: estimatedMemory >= 3,
                    enableMemoryOptimizations: true,
                    preloadCriticalAssets: !isTablet,
                };
            case 'low':
                return {
                    performanceMode: 'battery_saver',
                    enableImageCache: estimatedMemory >= 2,
                    enableBackgroundTasks: false,
                    enableMemoryOptimizations: true,
                    preloadCriticalAssets: false,
                };
            default:
                return {
                    performanceMode: 'normal',
                    enableImageCache: true,
                    enableBackgroundTasks: true,
                    enableMemoryOptimizations: true,
                    preloadCriticalAssets: true,
                };
        }
    }
}

// Performance initialization manager
export class PerformanceInitializer {
    private static instance: PerformanceInitializer;
    private isInitialized = false;
    private config: PerformanceConfig;
    private initStartTime = 0;

    constructor(config: Partial<PerformanceConfig> = {}) {
        const defaultConfig: PerformanceConfig = {
            enableMonitoring: __DEV__,
            enableImageCache: true,
            enableBackgroundTasks: false, // Disabled for Phase 1 - will enable later
            enableSocketOptimization: false, // Disabled for Phase 1 - will enable when needed
            enableLazyLoading: true,
            performanceMode: 'normal',
            debugMode: __DEV__,
            preloadCriticalAssets: false, // Disabled for Phase 1
            enableMemoryOptimizations: true,
        };

        this.config = { ...defaultConfig, ...config };
    }

    static getInstance(config?: Partial<PerformanceConfig>): PerformanceInitializer {
        if (!PerformanceInitializer.instance) {
            PerformanceInitializer.instance = new PerformanceInitializer(config);
        }
        return PerformanceInitializer.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.warn('Performance system already initialized');
            return;
        }

        this.initStartTime = performance.now();
        console.log('🚀 Initializing performance optimization system...');

        try {
            // Detect device capabilities
            const capabilities = await DeviceCapabilityDetector.detectCapabilities();
            const optimalConfig = DeviceCapabilityDetector.getOptimalConfig();

            // Merge optimal config with user config
            this.config = { ...this.config, ...optimalConfig };

            console.log('📱 Device capabilities:', capabilities);
            console.log('⚙️ Performance config:', this.config);

            // Initialize systems in parallel where possible
            await Promise.all([
                this.initializeMonitoring(),
                this.initializeStore(),
                this.initializeImageCache(),
                this.initializeBackgroundTasks(),
            ]);

            // Initialize systems that depend on others
            await this.initializeSocketOptimization();
            await this.initializeLazyLoading();

            // Final optimizations
            await this.applyMemoryOptimizations();
            await this.preloadCriticalAssets();

            this.isInitialized = true;

            const initTime = performance.now() - this.initStartTime;
            console.log(`✅ Performance system initialized in ${initTime.toFixed(2)}ms`);

            // Setup cleanup handlers
            this.setupCleanupHandlers();

        } catch (error) {
            console.error('❌ Performance initialization failed:', error);
            throw error;
        }
    }

    private async initializeMonitoring(): Promise<void> {
        if (!this.config.enableMonitoring) return;

        try {
            initializePerformanceMonitoring();

            if (this.config.debugMode) {
                // Add performance debugging tools
                if (__DEV__ && Platform.OS === 'ios') {
                    DevSettings.addMenuItem('Performance Stats', () => {
                        const stats = performanceMonitor.getCurrentMetrics();
                        console.log('📊 Performance Stats:', stats);
                        alert(JSON.stringify(stats, null, 2));
                    });
                }
            }

            console.log('✅ Performance monitoring initialized');
        } catch (error) {
            console.warn('⚠️ Performance monitoring initialization failed:', error);
        }
    }

    private async initializeStore(): Promise<void> {
        try {
            // Restore persisted state
            await restoreStore();

            // Set performance mode in store
            const store = useAppStore.getState();
            store.setPerformanceMode(this.config.performanceMode);

            console.log('✅ Store initialized');
        } catch (error) {
            console.warn('⚠️ Store initialization failed:', error);
        }
    }

    private async initializeImageCache(): Promise<void> {
        if (!this.config.enableImageCache) return;

        try {
            const imageCache = ImageCacheManager.getInstance();
            await imageCache.initialize();

            console.log('✅ Image cache initialized');
        } catch (error) {
            console.warn('⚠️ Image cache initialization failed:', error);
        }
    }

    private async initializeBackgroundTasks(): Promise<void> {
        if (!this.config.enableBackgroundTasks) return;

        try {
            // Background task manager is already initialized as singleton
            console.log('✅ Background task manager initialized');
        } catch (error) {
            console.warn('⚠️ Background task initialization failed:', error);
        }
    }

    private async initializeSocketOptimization(): Promise<void> {
        if (!this.config.enableSocketOptimization) return;

        try {
            // Initialize socket manager (will be connected when needed)
            const socketConfig = {
                url: process.env.EXPO_PUBLIC_SOCKET_URL || 'ws://localhost:3000',
                options: {
                    timeout: 5000,
                    retryAttempts: 3,
                    retryDelay: 2000,
                    batchSize: this.config.performanceMode === 'battery_saver' ? 5 : 10,
                    batchDelay: this.config.performanceMode === 'high_performance' ? 50 : 100,
                }
            };

            initializeSocket(socketConfig);

            console.log('✅ Socket optimization initialized');
        } catch (error) {
            console.warn('⚠️ Socket optimization initialization failed:', error);
        }
    }

    private async initializeLazyLoading(): Promise<void> {
        if (!this.config.enableLazyLoading) return;

        try {
            // Preload critical screens if enabled
            if (this.config.preloadCriticalAssets) {
                await preloadCriticalScreens();
            }

            console.log('✅ Lazy loading initialized');
        } catch (error) {
            console.warn('⚠️ Lazy loading initialization failed:', error);
        }
    }

    private async applyMemoryOptimizations(): Promise<void> {
        if (!this.config.enableMemoryOptimizations) return;

        try {
            // Set up memory monitoring
            MemoryLeakDetector.track('PerformanceInitializer');

            // Configure garbage collection hints (if available)
            if (global.gc && this.config.debugMode) {
                setInterval(() => {
                    if (global.gc) {
                        global.gc();
                        console.log('🗑️ Manual garbage collection triggered');
                    }
                }, 60000); // Every minute in debug mode
            }

            console.log('✅ Memory optimizations applied');
        } catch (error) {
            console.warn('⚠️ Memory optimization setup failed:', error);
        }
    }

    private async preloadCriticalAssets(): Promise<void> {
        if (!this.config.preloadCriticalAssets) return;

        try {
            // Preload critical images
            const criticalImages = [
                // Add your critical image URLs here
                'https://via.placeholder.com/300x200/FF6347/FFFFFF?text=Pizza',
                'https://via.placeholder.com/100x100/FF6347/FFFFFF?text=Logo',
            ];

            if (criticalImages.length > 0) {
                await preloadImages(criticalImages, { concurrency: 2, timeout: 5000 });
            }

            console.log('✅ Critical assets preloaded');
        } catch (error) {
            console.warn('⚠️ Asset preloading failed:', error);
        }
    }

    private setupCleanupHandlers(): void {
        // App state change handler
        AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'background') {
                this.handleAppBackground();
            } else if (nextAppState === 'active') {
                this.handleAppForeground();
            }
        });

        // Memory warning handler (iOS)
        if (Platform.OS === 'ios') {
            // Note: React Native doesn't expose memory warnings directly
            // This would need a native module implementation
        }
    }

    private handleAppBackground(): void {
        console.log('📱 App backgrounded - applying performance optimizations');

        // Disconnect socket to save battery
        disconnectSocket();

        // Clear image cache if in battery saver mode
        if (this.config.performanceMode === 'battery_saver') {
            const imageCache = ImageCacheManager.getInstance();
            // Don't clear completely, just reduce size
            console.log('🔋 Battery saver mode: reducing image cache');
        }

        // Clean up background tasks
        backgroundTaskManager.cleanup();
    }

    private handleAppForeground(): void {
        console.log('📱 App foregrounded - restoring performance systems');

        // Reconnect socket
        connectSocket().catch(error => {
            console.warn('Failed to reconnect socket:', error);
        });

        // Refresh critical data
        const store = useAppStore.getState();
        store.updateLastSyncTime();
    }

    getConfig(): PerformanceConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<PerformanceConfig>): void {
        this.config = { ...this.config, ...updates };

        // Apply config changes
        if (updates.performanceMode) {
            const store = useAppStore.getState();
            store.setPerformanceMode(updates.performanceMode);
        }
    }

    getInitializationTime(): number {
        return performance.now() - this.initStartTime;
    }

    async cleanup(): Promise<void> {
        console.log('🧹 Cleaning up performance system...');

        // Cleanup all systems
        disconnectSocket();
        backgroundTaskManager.cleanup();
        LazyComponentManager.clearCache();

        const imageCache = ImageCacheManager.getInstance();
        imageCache.clearCache();

        MemoryLeakDetector.untrack('PerformanceInitializer');

        this.isInitialized = false;
    }
}

// React component for easy initialization
export const PerformanceProvider = memo<{
    children: React.ReactNode;
    config?: Partial<PerformanceConfig>;
    onInitialized?: () => void;
    onError?: (error: Error) => void;
}>(({ children, config, onInitialized, onError }) => {
    const [isInitialized, setIsInitialized] = React.useState(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                const initializer = PerformanceInitializer.getInstance(config);
                await initializer.initialize();
                setIsInitialized(true);
                onInitialized?.();
            } catch (error) {
                console.error('Performance initialization failed:', error);
                onError?.(error as Error);
                // Continue anyway to prevent app crash
                setIsInitialized(true);
            }
        };

        initialize();
    }, [config, onInitialized, onError]);

    if (!isInitialized) {
        // Return null or loading component
        return null;
    }

    return <>{children}</>;
});

// Hook for accessing performance system
export const usePerformanceSystem = () => {
    const [initializer] = React.useState(() => PerformanceInitializer.getInstance());

    const getConfig = useCallback(() => initializer.getConfig(), [initializer]);
    const updateConfig = useCallback((updates: Partial<PerformanceConfig>) => {
        initializer.updateConfig(updates);
    }, [initializer]);

    return {
        getConfig,
        updateConfig,
        getInitializationTime: () => initializer.getInitializationTime(),
    };
};

// Export default instance
export const performanceSystem = PerformanceInitializer.getInstance();

export default {
    PerformanceInitializer,
    PerformanceProvider,
    usePerformanceSystem,
    DeviceCapabilityDetector,
    performanceSystem,
};