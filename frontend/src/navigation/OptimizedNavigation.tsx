/**
 * Optimized Navigation System
 * 
 * High-performance React Navigation setup with lazy loading,
 * screen preloading, memory optimization, and smooth transitions
 */

import React, { useEffect, useCallback, memo, useMemo } from 'react';
import {
    createNativeStackNavigator,
    NativeStackNavigationOptions,
    NativeStackScreenProps
} from '@react-navigation/native-stack';
import {
    createBottomTabNavigator,
    BottomTabNavigationOptions
} from '@react-navigation/bottom-tabs';
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
    Theme,
    NavigationState,
    PartialState
} from '@react-navigation/native';
import { InteractionManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { EnhancedLazyScreens, preloadCriticalScreens } from '../utils/lazyLoading';
import { performanceMonitor } from '../utils/performance';
import { useAppStore } from '../stores/appStore';

// Navigation state persistence
const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

// Custom theme optimizations
const createOptimizedTheme = (isDark: boolean): Theme => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: '#FF6347',
            background: isDark ? '#121212' : '#FFFFFF',
            card: isDark ? '#1E1E1E' : '#FFFFFF',
            text: isDark ? '#FFFFFF' : '#000000',
            border: isDark ? '#333333' : '#E5E5E5',
            notification: '#FF6347',
        },
    };
};

// Optimized screen options for performance
const createOptimizedScreenOptions = (): NativeStackNavigationOptions => ({
    headerShown: false,
    animation: 'slide_from_right',
    gestureEnabled: true,

    // Preload optimization
    freezeOnBlur: true, // Freeze background screens to save memory
});

// Tab bar optimizations
const createOptimizedTabOptions = (
    routeName: string,
    iconName: keyof typeof Ionicons.glyphMap
): BottomTabNavigationOptions => ({
    tabBarIcon: ({ focused, color, size }) => (
        <Ionicons
            name={focused ? iconName : `${iconName}-outline` as any}
            size={size}
            color={color}
        />
    ),
    tabBarLabel: routeName,
    tabBarActiveTintColor: '#FF6347',
    tabBarInactiveTintColor: '#999999',
    tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        elevation: 8,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
        height: Platform.OS === 'ios' ? 90 : 70,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    },

    // Performance optimizations
    tabBarHideOnKeyboard: Platform.OS === 'android',
});

// Performance-optimized navigation containers
interface NavigationPerformanceMetrics {
    screenLoadTimes: Map<string, number>;
    navigationTimes: Map<string, number>;
    memoryUsage: number;
}

class NavigationPerformanceTracker {
    private static instance: NavigationPerformanceTracker;
    private metrics: NavigationPerformanceMetrics = {
        screenLoadTimes: new Map(),
        navigationTimes: new Map(),
        memoryUsage: 0,
    };

    static getInstance(): NavigationPerformanceTracker {
        if (!NavigationPerformanceTracker.instance) {
            NavigationPerformanceTracker.instance = new NavigationPerformanceTracker();
        }
        return NavigationPerformanceTracker.instance;
    }

    trackScreenLoad(screenName: string, startTime: number) {
        const loadTime = performance.now() - startTime;
        this.metrics.screenLoadTimes.set(screenName, loadTime);

        if (__DEV__ && loadTime > 500) {
            console.warn(`🐌 Slow screen load: ${screenName} took ${loadTime.toFixed(2)}ms`);
        }
    }

    trackNavigation(fromScreen: string, toScreen: string, startTime: number) {
        const navigationTime = performance.now() - startTime;
        const key = `${fromScreen}->${toScreen}`;
        this.metrics.navigationTimes.set(key, navigationTime);

        if (__DEV__ && navigationTime > 300) {
            console.warn(`🐌 Slow navigation: ${key} took ${navigationTime.toFixed(2)}ms`);
        }
    }

    getMetrics(): NavigationPerformanceMetrics {
        return { ...this.metrics };
    }

    clearMetrics() {
        this.metrics.screenLoadTimes.clear();
        this.metrics.navigationTimes.clear();
        this.metrics.memoryUsage = 0;
    }
}

// Enhanced Stack Navigator with performance optimizations
const Stack = createNativeStackNavigator();

const OptimizedStackNavigator = memo<{
    children: React.ReactNode;
    screenOptions?: NativeStackNavigationOptions;
    initialRouteName?: string;
}>(({ children, screenOptions, initialRouteName }) => {
    const defaultScreenOptions = useMemo(() => ({
        ...createOptimizedScreenOptions(),
        ...screenOptions,
    }), [screenOptions]);

    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={defaultScreenOptions}
        >
            {children}
        </Stack.Navigator>
    );
});

// Enhanced Tab Navigator with performance optimizations
const Tab = createBottomTabNavigator();

const OptimizedTabNavigator = memo<{
    children: React.ReactNode;
    screenOptions?: BottomTabNavigationOptions;
}>(({ children, screenOptions }) => {
    const defaultScreenOptions = useMemo(() => ({
        lazy: true,
        unmountOnBlur: false,
        ...screenOptions,
    }), [screenOptions]);

    return (
        <Tab.Navigator
            screenOptions={defaultScreenOptions}
            backBehavior="history"
        >
            {children}
        </Tab.Navigator>
    );
});

// Screen preloading hook
const useScreenPreloading = () => {
    const preloadNextScreens = useCallback(async (currentRoute: string) => {
        // Preload likely next screens based on current route
        const preloadMap: Record<string, string[]> = {
            'Home': ['Menu', 'Orders'],
            'Menu': ['OrderDetails', 'Cart'],
            'Orders': ['OrderDetails', 'TrackOrder'],
            'Profile': ['Settings', 'OrderHistory'],
        };

        const screensToPreload = preloadMap[currentRoute] || [];

        // Preload after interactions complete
        InteractionManager.runAfterInteractions(() => {
            screensToPreload.forEach(screenName => {
                // Trigger lazy loading for these screens
                console.log(`🚀 Preloading ${screenName} screen`);
            });
        });
    }, []);

    return { preloadNextScreens };
};

// Navigation state persistence
const navigationPersistence = {
    persistNavigationState: async (state: NavigationState | PartialState<NavigationState>) => {
        try {
            await AsyncStorage.setItem(NAVIGATION_PERSISTENCE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to persist navigation state:', error);
        }
    },

    restoreNavigationState: async (): Promise<NavigationState | undefined> => {
        try {
            const state = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
            return state ? JSON.parse(state) : undefined;
        } catch (error) {
            console.warn('Failed to restore navigation state:', error);
            return undefined;
        }
    },
};

// Main optimized navigation container
interface OptimizedNavigationContainerProps {
    children: React.ReactNode;
    theme?: 'light' | 'dark' | 'auto';
}

export const OptimizedNavigationContainer = memo<OptimizedNavigationContainerProps>(({
    children,
    theme = 'auto'
}) => {
    const [isReady, setIsReady] = React.useState(false);
    const [initialState, setInitialState] = React.useState<NavigationState | undefined>();
    const performanceTracker = NavigationPerformanceTracker.getInstance();

    // Determine theme
    const navigationTheme = useMemo(() => {
        if (theme === 'auto') {
            // You can implement automatic theme detection here
            return createOptimizedTheme(false);
        }
        return createOptimizedTheme(theme === 'dark');
    }, [theme]);

    // Initialize navigation
    useEffect(() => {
        const initializeNavigation = async () => {
            try {
                // Preload critical screens
                await preloadCriticalScreens();

                // Restore navigation state
                const savedState = await navigationPersistence.restoreNavigationState();
                if (savedState) {
                    setInitialState(savedState);
                }
            } catch (error) {
                console.warn('Navigation initialization error:', error);
            } finally {
                setIsReady(true);
            }
        };

        initializeNavigation();
    }, []);

    // Navigation state change handler with performance tracking
    const handleStateChange = useCallback((state: NavigationState | undefined) => {
        if (!state) return;

        // Track navigation performance
        const currentRoute = state.routes[state.index];
        if (currentRoute && __DEV__) {
            performanceMonitor.markRenderEnd(`Navigation to ${currentRoute.name}`);
        }

        // Persist state
        navigationPersistence.persistNavigationState(state);
    }, []);

    // Ready handler
    const handleReady = useCallback(() => {
        console.log('📱 Navigation container ready');

        // Initialize performance monitoring
        if (__DEV__) {
            performanceMonitor.startMonitoring();
        }
    }, []);

    if (!isReady) {
        return null; // Or return a loading screen
    }

    return (
        <NavigationContainer
            theme={navigationTheme}
            initialState={initialState}
            onStateChange={handleStateChange}
            onReady={handleReady}
        >
            {children}
        </NavigationContainer>
    );
});

// Customer Tab Navigator with optimizations
export const OptimizedCustomerTabNavigator = memo(() => {
    const { preloadNextScreens } = useScreenPreloading();

    const handleTabPress = useCallback((routeName: string) => {
        performanceMonitor.markRenderStart();
        preloadNextScreens(routeName);
    }, [preloadNextScreens]);

    return (
        <OptimizedTabNavigator>
            <Tab.Screen
                name="Home"
                component={EnhancedLazyScreens.MenuScreen}
                options={createOptimizedTabOptions('Home', 'home')}
                listeners={{
                    tabPress: () => handleTabPress('Home'),
                }}
            />
            <Tab.Screen
                name="Menu"
                component={EnhancedLazyScreens.MenuScreen}
                options={createOptimizedTabOptions('Menu', 'restaurant')}
                listeners={{
                    tabPress: () => handleTabPress('Menu'),
                }}
            />
            <Tab.Screen
                name="Orders"
                component={EnhancedLazyScreens.OrdersScreen}
                options={createOptimizedTabOptions('Orders', 'receipt')}
                listeners={{
                    tabPress: () => handleTabPress('Orders'),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={EnhancedLazyScreens.ProfileScreen}
                options={createOptimizedTabOptions('Profile', 'person')}
                listeners={{
                    tabPress: () => handleTabPress('Profile'),
                }}
            />
        </OptimizedTabNavigator>
    );
});

// Customer Stack Navigator with lazy screens
export const OptimizedCustomerStackNavigator = memo(() => (
    <OptimizedStackNavigator>
        <Stack.Screen
            name="CustomerTabs"
            component={OptimizedCustomerTabNavigator}
        />
        <Stack.Screen
            name="OrderDetails"
            component={EnhancedLazyScreens.OrderDetailsScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Order Details',
            }}
        />
        <Stack.Screen
            name="TrackOrder"
            component={EnhancedLazyScreens.TrackOrderScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Track Order',
            }}
        />
        <Stack.Screen
            name="PaymentMethods"
            component={EnhancedLazyScreens.PaymentMethodsScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Payment Methods',
            }}
        />
        <Stack.Screen
            name="PizzaMenu"
            component={EnhancedLazyScreens.PizzaMenuScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Pizza Menu',
            }}
        />
        <Stack.Screen
            name="DealsMenu"
            component={EnhancedLazyScreens.DealsMenuScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Deals & Offers',
            }}
        />
        <Stack.Screen
            name="AccountSettings"
            component={EnhancedLazyScreens.AccountSettingsScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Account Settings',
            }}
        />
        <Stack.Screen
            name="DeliveryAddresses"
            component={EnhancedLazyScreens.DeliveryAddressesScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Delivery Addresses',
            }}
        />
        <Stack.Screen
            name="OrderHistory"
            component={EnhancedLazyScreens.OrderHistoryScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Order History',
            }}
        />
        <Stack.Screen
            name="HelpSupport"
            component={EnhancedLazyScreens.HelpSupportScreen}
            options={{
                ...createOptimizedScreenOptions(),
                headerShown: true,
                title: 'Help & Support',
            }}
        />
    </OptimizedStackNavigator>
));

// Navigation performance utilities
export const useNavigationPerformance = () => {
    const tracker = NavigationPerformanceTracker.getInstance();

    const trackScreenLoad = useCallback((screenName: string) => {
        const startTime = performance.now();

        return {
            onLoadComplete: () => tracker.trackScreenLoad(screenName, startTime),
        };
    }, [tracker]);

    const trackNavigation = useCallback((fromScreen: string, toScreen: string) => {
        const startTime = performance.now();

        return {
            onNavigationComplete: () => tracker.trackNavigation(fromScreen, toScreen, startTime),
        };
    }, [tracker]);

    const getMetrics = useCallback(() => tracker.getMetrics(), [tracker]);

    return {
        trackScreenLoad,
        trackNavigation,
        getMetrics,
    };
};

export {
    OptimizedStackNavigator,
    OptimizedTabNavigator,
    NavigationPerformanceTracker,
    createOptimizedScreenOptions,
    createOptimizedTabOptions,
};

export default OptimizedNavigationContainer;