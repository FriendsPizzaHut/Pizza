/**
 * Lazy Loading and Code Splitting Utilities
 * 
 * Implements dynamic imports, React.lazy, and Suspense
 * for optimal bundle splitting and loading performance
 */

import React, { Suspense, ComponentType, LazyExoticComponent, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { InteractionManager } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Enhanced Loading Component with animations
const EnhancedLoader = memo<{
    message?: string;
    size?: 'small' | 'large';
    color?: string;
    showMessage?: boolean;
}>(({
    message = 'Loading...',
    size = 'large',
    color = '#FF6347',
    showMessage = true
}) => (
    <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.loaderContainer}
    >
        <ActivityIndicator size={size} color={color} />
        {showMessage && (
            <Animated.Text
                entering={FadeIn.delay(200)}
                style={styles.loaderText}
            >
                {message}
            </Animated.Text>
        )}
    </Animated.View>
));

// Skeleton Loader for better perceived performance
const SkeletonLoader = memo<{
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}>(({ width = '100%', height = 20, borderRadius = 4, style }) => (
    <Animated.View
        entering={FadeIn.duration(300)}
        style={[
            styles.skeleton,
            { width, height, borderRadius },
            style
        ]}
    />
));

// Screen-specific skeleton loaders
const MenuScreenSkeleton = memo(() => (
    <View style={styles.skeletonContainer}>
        <View style={styles.skeletonHeader}>
            <SkeletonLoader width="60%" height={24} />
            <SkeletonLoader width="30%" height={20} />
        </View>
        <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                    <SkeletonLoader width="100%" height={120} borderRadius={8} />
                    <View style={styles.skeletonCardContent}>
                        <SkeletonLoader width="80%" height={16} />
                        <SkeletonLoader width="60%" height={14} />
                        <View style={styles.skeletonCardFooter}>
                            <SkeletonLoader width="40%" height={18} />
                            <SkeletonLoader width="30%" height={14} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    </View>
));

const OrdersScreenSkeleton = memo(() => (
    <View style={styles.skeletonContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.skeletonOrderCard}>
                <View style={styles.skeletonOrderHeader}>
                    <SkeletonLoader width="40%" height={18} />
                    <SkeletonLoader width="25%" height={16} borderRadius={12} />
                </View>
                <SkeletonLoader width="70%" height={14} />
                <SkeletonLoader width="50%" height={12} />
            </View>
        ))}
    </View>
));

// Lazy loading wrapper with enhanced error handling
interface LazyComponentOptions<T extends ComponentType<any> = ComponentType<any>> {
    loader: () => Promise<{ default: T }>;
    fallback?: React.ComponentType;
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    delay?: number;
    timeout?: number;
    retryAttempts?: number;
    preload?: boolean;
}

class LazyComponentManager {
    private static cache = new Map<string, LazyExoticComponent<any>>();
    private static preloadPromises = new Map<string, Promise<any>>();

    static createLazyComponent<T extends ComponentType<any>>(
        key: string,
        options: LazyComponentOptions<T>
    ): LazyExoticComponent<T> {
        // Return cached component if exists
        if (this.cache.has(key)) {
            return this.cache.get(key) as LazyExoticComponent<T>;
        }

        const {
            loader,
            delay = 0,
            timeout = 10000,
            retryAttempts = 3,
            preload = false
        } = options;

        // Enhanced loader with retry logic
        const enhancedLoader = async (): Promise<{ default: T }> => {
            let attempts = 0;
            let lastError: Error;

            while (attempts < retryAttempts) {
                try {
                    // Add delay if specified
                    if (delay > 0) {
                        await new Promise<void>(resolve => setTimeout(resolve, delay));
                    }

                    // Add timeout
                    const loadPromise = loader();
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error('Load timeout')), timeout);
                    });

                    const result = await Promise.race([loadPromise, timeoutPromise]);

                    // Wait for interactions to complete before rendering
                    await new Promise<void>(resolve => {
                        InteractionManager.runAfterInteractions(() => resolve());
                    });

                    return result;
                } catch (error) {
                    lastError = error as Error;
                    attempts++;

                    if (attempts < retryAttempts) {
                        // Exponential backoff
                        const backoffDelay = Math.min(1000 * Math.pow(2, attempts), 5000);
                        await new Promise<void>(resolve => setTimeout(resolve, backoffDelay));
                    }
                }
            }

            throw lastError!;
        };

        const lazyComponent = React.lazy(enhancedLoader);

        // Cache the component
        this.cache.set(key, lazyComponent);

        // Preload if requested
        if (preload) {
            this.preloadComponent(key, enhancedLoader);
        }

        return lazyComponent;
    }

    static preloadComponent(key: string, loader: () => Promise<any>): Promise<any> {
        if (this.preloadPromises.has(key)) {
            return this.preloadPromises.get(key)!;
        }

        const preloadPromise = loader().catch(error => {
            console.warn(`Failed to preload component ${key}:`, error);
            return null;
        });

        this.preloadPromises.set(key, preloadPromise);
        return preloadPromise;
    }

    static clearCache() {
        this.cache.clear();
        this.preloadPromises.clear();
    }
}

// Error Boundary for lazy components
interface LazyErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    retryCount: number;
}

class LazyErrorBoundary extends React.Component<
    {
        children: React.ReactNode;
        fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
        maxRetries?: number;
    },
    LazyErrorBoundaryState
> {
    constructor(props: any) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error: Error): Partial<LazyErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Lazy component error:', error, errorInfo);
    }

    retry = () => {
        const { maxRetries = 3 } = this.props;

        if (this.state.retryCount < maxRetries) {
            this.setState({
                hasError: false,
                error: null,
                retryCount: this.state.retryCount + 1
            });
        }
    };

    render() {
        if (this.state.hasError) {
            const { fallback: FallbackComponent } = this.props;

            if (FallbackComponent && this.state.error) {
                return <FallbackComponent error={this.state.error} retry={this.retry} />;
            }

            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Something went wrong loading this screen
                    </Text>
                    <Text style={styles.retryText} onPress={this.retry}>
                        Tap to retry ({this.props.maxRetries! - this.state.retryCount} attempts left)
                    </Text>
                </View>
            );
        }

        return this.props.children;
    }
}

// HOC for lazy loading with Suspense and error boundary
export function withLazyLoading<P extends object>(
    Component: LazyExoticComponent<ComponentType<P>>,
    options: {
        fallback?: React.ComponentType;
        errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
        skeletonLoader?: React.ComponentType;
        loadingMessage?: string;
    } = {}
) {
    const {
        fallback,
        errorFallback,
        skeletonLoader: SkeletonComponent,
        loadingMessage = 'Loading...'
    } = options;

    return memo<P>((props) => (
        <LazyErrorBoundary fallback={errorFallback}>
            <Suspense
                fallback={
                    SkeletonComponent ? (
                        <SkeletonComponent />
                    ) : fallback ? (
                        React.createElement(fallback)
                    ) : (
                        <EnhancedLoader message={loadingMessage} />
                    )
                }
            >
                <Component {...props} />
            </Suspense>
        </LazyErrorBoundary>
    ));
}

// Lazy-loaded screen definitions
export const LazyScreens = {
    // Customer Screens
    MenuScreen: LazyComponentManager.createLazyComponent(
        'MenuScreen',
        {
            loader: () => import('../screens/customer/main/MenuScreen'),
            preload: true // Preload this critical screen
        }
    ),

    OrdersScreen: LazyComponentManager.createLazyComponent(
        'OrdersScreen',
        {
            loader: () => import('../screens/customer/main/OrdersScreen'),
            preload: true
        }
    ),

    ProfileScreen: LazyComponentManager.createLazyComponent(
        'ProfileScreen',
        {
            loader: () => import('../screens/customer/main/ProfileScreen')
        }
    ),

    OrderDetailsScreen: LazyComponentManager.createLazyComponent(
        'OrderDetailsScreen',
        {
            loader: () => import('../screens/customer/orders/OrderDetailsScreen')
        }
    ),

    TrackOrderScreen: LazyComponentManager.createLazyComponent(
        'TrackOrderScreen',
        {
            loader: () => import('../screens/customer/orders/TrackOrderScreen')
        }
    ),

    PaymentMethodsScreen: LazyComponentManager.createLazyComponent(
        'PaymentMethodsScreen',
        {
            loader: () => import('../screens/customer/profile/PaymentMethodsScreen')
        }
    ),

    // Profile Screens
    AccountSettingsScreen: LazyComponentManager.createLazyComponent(
        'AccountSettingsScreen',
        {
            loader: () => import('../screens/customer/profile/AccountSettingsScreen')
        }
    ),

    DeliveryAddressesScreen: LazyComponentManager.createLazyComponent(
        'DeliveryAddressesScreen',
        {
            loader: () => import('../screens/customer/profile/DeliveryAddressesScreen')
        }
    ),

    OrderHistoryScreen: LazyComponentManager.createLazyComponent(
        'OrderHistoryScreen',
        {
            loader: () => import('../screens/customer/profile/OrderHistoryScreen')
        }
    ),

    HelpSupportScreen: LazyComponentManager.createLazyComponent(
        'HelpSupportScreen',
        {
            loader: () => import('../screens/customer/profile/HelpSupportScreen')
        }
    )
};

// Enhanced screen components with skeleton loaders
export const EnhancedLazyScreens = {
    MenuScreen: withLazyLoading(LazyScreens.MenuScreen, {
        skeletonLoader: MenuScreenSkeleton,
        loadingMessage: 'Loading menu...'
    }),

    OrdersScreen: withLazyLoading(LazyScreens.OrdersScreen, {
        skeletonLoader: OrdersScreenSkeleton,
        loadingMessage: 'Loading orders...'
    }),

    ProfileScreen: withLazyLoading(LazyScreens.ProfileScreen, {
        loadingMessage: 'Loading profile...'
    }),

    OrderDetailsScreen: withLazyLoading(LazyScreens.OrderDetailsScreen, {
        loadingMessage: 'Loading order details...'
    }),

    TrackOrderScreen: withLazyLoading(LazyScreens.TrackOrderScreen, {
        loadingMessage: 'Loading order tracking...'
    }),

    PaymentMethodsScreen: withLazyLoading(LazyScreens.PaymentMethodsScreen, {
        loadingMessage: 'Loading payment methods...'
    }),

    AccountSettingsScreen: withLazyLoading(LazyScreens.AccountSettingsScreen, {
        loadingMessage: 'Loading settings...'
    }),

    DeliveryAddressesScreen: withLazyLoading(LazyScreens.DeliveryAddressesScreen, {
        loadingMessage: 'Loading addresses...'
    }),

    OrderHistoryScreen: withLazyLoading(LazyScreens.OrderHistoryScreen, {
        skeletonLoader: OrdersScreenSkeleton,
        loadingMessage: 'Loading order history...'
    }),

    HelpSupportScreen: withLazyLoading(LazyScreens.HelpSupportScreen, {
        loadingMessage: 'Loading help...'
    })
};

// Preloading utilities
export const preloadCriticalScreens = async () => {
    // Using explicit static imports instead of dynamic template literals
    // Metro bundler requires static import paths
    const preloadPromises = [
        LazyComponentManager.preloadComponent('MenuScreen', () =>
            import('../screens/customer/main/MenuScreen')
        ),
        LazyComponentManager.preloadComponent('OrdersScreen', () =>
            import('../screens/customer/main/OrdersScreen')
        )
    ];

    try {
        await Promise.allSettled(preloadPromises);
        console.log('Critical screens preloaded successfully');
    } catch (error) {
        console.warn('Failed to preload some critical screens:', error);
    }
};

// Bundle size tracking
export const trackBundleLoad = (componentName: string) => {
    if (__DEV__) {
        const startTime = performance.now();

        return {
            onLoad: () => {
                const loadTime = performance.now() - startTime;
                console.log(`📦 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
            }
        };
    }

    return { onLoad: () => { } };
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loaderText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryText: {
        fontSize: 14,
        color: '#FF6347',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    skeleton: {
        backgroundColor: '#E0E0E0',
    },
    skeletonContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
    },
    skeletonHeader: {
        marginBottom: 24,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    skeletonCard: {
        width: '47%',
        marginBottom: 16,
    },
    skeletonCardContent: {
        padding: 12,
    },
    skeletonCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    skeletonOrderCard: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
    },
    skeletonOrderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});

export { LazyComponentManager, EnhancedLoader, SkeletonLoader };
export default EnhancedLazyScreens;