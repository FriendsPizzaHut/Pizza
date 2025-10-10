/**
 * Optimized Global State Management with Zustand
 * 
 * Lightweight, fast state management for real-time data,
 * socket updates, and app-wide state with performance optimizations
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for different state slices
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'delivery' | 'admin';
    avatar?: string;
}

export interface Order {
    id: string;
    customerId: string;
    items: OrderItem[];
    status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    available: boolean;
    preparationTime: number;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
    read: boolean;
}

// Real-time state interface
export interface RealTimeState {
    // Socket connection status
    socketConnected: boolean;
    socketReconnecting: boolean;
    lastSocketActivity: number;

    // Real-time data
    activeOrders: Order[];
    onlineDeliveryAgents: number;
    shopStatus: 'open' | 'closed' | 'busy';
    estimatedDeliveryTime: number;

    // Live updates queue (for batching)
    pendingUpdates: Array<{
        type: string;
        data: any;
        timestamp: number;
    }>;
}

// App state interface
export interface AppState {
    // User state
    user: User | null;
    isAuthenticated: boolean;
    authToken: string | null;

    // UI state
    isLoading: boolean;
    error: string | null;
    notifications: AppNotification[];

    // Data state
    menuItems: MenuItem[];
    orders: Order[];
    cart: OrderItem[];
    cartTotal: number;

    // Network state
    isOnline: boolean;
    lastSyncTime: number;

    // Real-time state
    realTime: RealTimeState;

    // Performance state
    performanceMode: 'normal' | 'battery_saver' | 'high_performance';
    renderOptimizations: boolean;
}

// Actions interface
export interface AppActions {
    // Auth actions
    setUser: (user: User | null) => void;
    setAuthToken: (token: string | null) => void;
    logout: () => void;

    // UI actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;

    // Data actions
    setMenuItems: (items: MenuItem[]) => void;
    updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
    setOrders: (orders: Order[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (id: string, updates: Partial<Order>) => void;

    // Cart actions
    addToCart: (item: OrderItem) => void;
    removeFromCart: (id: string) => void;
    updateCartItem: (id: string, quantity: number) => void;
    clearCart: () => void;
    calculateCartTotal: () => void;

    // Network actions
    setOnlineStatus: (online: boolean) => void;
    updateLastSyncTime: () => void;

    // Real-time actions
    setSocketStatus: (connected: boolean, reconnecting?: boolean) => void;
    updateSocketActivity: () => void;
    setActiveOrders: (orders: Order[]) => void;
    updateShopStatus: (status: 'open' | 'closed' | 'busy') => void;
    setDeliveryAgentsCount: (count: number) => void;
    setEstimatedDeliveryTime: (time: number) => void;
    addPendingUpdate: (update: { type: string; data: any }) => void;
    processPendingUpdates: () => void;

    // Performance actions
    setPerformanceMode: (mode: 'normal' | 'battery_saver' | 'high_performance') => void;
    toggleRenderOptimizations: () => void;

    // Batch actions for better performance
    batchUpdate: (updates: Array<() => void>) => void;
}

// Initial state
const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    authToken: null,
    isLoading: false,
    error: null,
    notifications: [],
    menuItems: [],
    orders: [],
    cart: [],
    cartTotal: 0,
    isOnline: true,
    lastSyncTime: 0,
    realTime: {
        socketConnected: false,
        socketReconnecting: false,
        lastSocketActivity: 0,
        activeOrders: [],
        onlineDeliveryAgents: 0,
        shopStatus: 'closed',
        estimatedDeliveryTime: 30,
        pendingUpdates: []
    },
    performanceMode: 'normal',
    renderOptimizations: true
};

// Create the store with middleware for performance
export const useAppStore = create<AppState & AppActions>()(
    devtools(
        subscribeWithSelector(
            persist(
                immer((set, get) => ({
                    ...initialState,

                    // Auth actions
                    setUser: (user) => set((state) => {
                        state.user = user;
                        state.isAuthenticated = !!user;
                    }),

                    setAuthToken: (token) => set((state) => {
                        state.authToken = token;
                        if (token) {
                            AsyncStorage.setItem('authToken', token);
                        } else {
                            AsyncStorage.removeItem('authToken');
                        }
                    }),

                    logout: () => set((state) => {
                        state.user = null;
                        state.isAuthenticated = false;
                        state.authToken = null;
                        state.cart = [];
                        state.cartTotal = 0;
                        state.orders = [];
                        AsyncStorage.multiRemove(['authToken', 'user', 'cart']);
                    }),

                    // UI actions
                    setLoading: (loading) => set((state) => {
                        state.isLoading = loading;
                    }),

                    setError: (error) => set((state) => {
                        state.error = error;
                    }),

                    addNotification: (notification) => set((state) => {
                        const newNotification: AppNotification = {
                            ...notification,
                            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            timestamp: Date.now(),
                            read: false
                        };
                        state.notifications.unshift(newNotification);

                        // Keep only last 50 notifications for performance
                        if (state.notifications.length > 50) {
                            state.notifications = state.notifications.slice(0, 50);
                        }
                    }),

                    markNotificationRead: (id) => set((state) => {
                        const notification = state.notifications.find(n => n.id === id);
                        if (notification) {
                            notification.read = true;
                        }
                    }),

                    clearNotifications: () => set((state) => {
                        state.notifications = [];
                    }),

                    // Data actions
                    setMenuItems: (items) => set((state) => {
                        state.menuItems = items;
                    }),

                    updateMenuItem: (id, updates) => set((state) => {
                        const item = state.menuItems.find(item => item.id === id);
                        if (item) {
                            Object.assign(item, updates);
                        }
                    }),

                    setOrders: (orders) => set((state) => {
                        state.orders = orders;
                    }),

                    addOrder: (order) => set((state) => {
                        const existingIndex = state.orders.findIndex(o => o.id === order.id);
                        if (existingIndex >= 0) {
                            state.orders[existingIndex] = order;
                        } else {
                            state.orders.unshift(order);
                        }
                    }),

                    updateOrder: (id, updates) => set((state) => {
                        const order = state.orders.find(order => order.id === id);
                        if (order) {
                            Object.assign(order, updates);
                            order.updatedAt = new Date().toISOString();
                        }
                    }),

                    // Cart actions
                    addToCart: (item) => set((state) => {
                        const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
                        if (existingItem) {
                            existingItem.quantity += item.quantity;
                        } else {
                            state.cart.push(item);
                        }

                        // Recalculate total
                        state.cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    }),

                    removeFromCart: (id) => set((state) => {
                        state.cart = state.cart.filter(item => item.id !== id);
                        state.cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    }),

                    updateCartItem: (id, quantity) => set((state) => {
                        const item = state.cart.find(item => item.id === id);
                        if (item) {
                            if (quantity <= 0) {
                                state.cart = state.cart.filter(item => item.id !== id);
                            } else {
                                item.quantity = quantity;
                            }
                            state.cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                        }
                    }),

                    clearCart: () => set((state) => {
                        state.cart = [];
                        state.cartTotal = 0;
                    }),

                    calculateCartTotal: () => set((state) => {
                        state.cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    }),

                    // Network actions
                    setOnlineStatus: (online) => set((state) => {
                        state.isOnline = online;
                    }),

                    updateLastSyncTime: () => set((state) => {
                        state.lastSyncTime = Date.now();
                    }),

                    // Real-time actions
                    setSocketStatus: (connected, reconnecting = false) => set((state) => {
                        state.realTime.socketConnected = connected;
                        state.realTime.socketReconnecting = reconnecting;
                        if (connected) {
                            state.realTime.lastSocketActivity = Date.now();
                        }
                    }),

                    updateSocketActivity: () => set((state) => {
                        state.realTime.lastSocketActivity = Date.now();
                    }),

                    setActiveOrders: (orders) => set((state) => {
                        state.realTime.activeOrders = orders;
                    }),

                    updateShopStatus: (status) => set((state) => {
                        state.realTime.shopStatus = status;
                    }),

                    setDeliveryAgentsCount: (count) => set((state) => {
                        state.realTime.onlineDeliveryAgents = count;
                    }),

                    setEstimatedDeliveryTime: (time) => set((state) => {
                        state.realTime.estimatedDeliveryTime = time;
                    }),

                    addPendingUpdate: (update) => set((state) => {
                        state.realTime.pendingUpdates.push({
                            ...update,
                            timestamp: Date.now()
                        });

                        // Keep only last 100 pending updates
                        if (state.realTime.pendingUpdates.length > 100) {
                            state.realTime.pendingUpdates = state.realTime.pendingUpdates.slice(-100);
                        }
                    }),

                    processPendingUpdates: () => set((state) => {
                        // Process all pending updates in batch
                        const updates = state.realTime.pendingUpdates;
                        state.realTime.pendingUpdates = [];

                        // Group updates by type for better performance
                        const groupedUpdates = updates.reduce((acc, update) => {
                            if (!acc[update.type]) acc[update.type] = [];
                            acc[update.type].push(update);
                            return acc;
                        }, {} as Record<string, any[]>);

                        // Apply grouped updates
                        Object.entries(groupedUpdates).forEach(([type, typeUpdates]) => {
                            switch (type) {
                                case 'order_update':
                                    typeUpdates.forEach(update => {
                                        const order = state.orders.find(o => o.id === update.data.id);
                                        if (order) {
                                            Object.assign(order, update.data);
                                        }
                                    });
                                    break;
                                case 'menu_update':
                                    typeUpdates.forEach(update => {
                                        const item = state.menuItems.find(i => i.id === update.data.id);
                                        if (item) {
                                            Object.assign(item, update.data);
                                        }
                                    });
                                    break;
                            }
                        });
                    }),

                    // Performance actions
                    setPerformanceMode: (mode) => set((state) => {
                        state.performanceMode = mode;
                    }),

                    toggleRenderOptimizations: () => set((state) => {
                        state.renderOptimizations = !state.renderOptimizations;
                    }),

                    // Batch actions for better performance
                    batchUpdate: (updates) => set((state) => {
                        updates.forEach(update => update());
                    })
                })),
                {
                    name: 'pizza-app-store',
                    version: 1,
                    partialize: (state: AppState & AppActions) => ({
                        performanceMode: state.performanceMode,
                        renderOptimizations: state.renderOptimizations
                    }),
                    storage: createJSONStorage(() => AsyncStorage)
                }
            )
        )
    )
);

// Selectors for optimized component subscriptions
export const useAuth = () => useAppStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    authToken: state.authToken
}));

export const useCart = () => useAppStore(state => ({
    cart: state.cart,
    cartTotal: state.cartTotal,
    addToCart: state.addToCart,
    removeFromCart: state.removeFromCart,
    updateCartItem: state.updateCartItem,
    clearCart: state.clearCart
}));

export const useOrders = () => useAppStore(state => ({
    orders: state.orders,
    activeOrders: state.realTime.activeOrders,
    addOrder: state.addOrder,
    updateOrder: state.updateOrder
}));

export const useMenuItems = () => useAppStore(state => ({
    menuItems: state.menuItems,
    setMenuItems: state.setMenuItems,
    updateMenuItem: state.updateMenuItem
}));

export const useRealTime = () => useAppStore(state => ({
    socketConnected: state.realTime.socketConnected,
    socketReconnecting: state.realTime.socketReconnecting,
    shopStatus: state.realTime.shopStatus,
    onlineDeliveryAgents: state.realTime.onlineDeliveryAgents,
    estimatedDeliveryTime: state.realTime.estimatedDeliveryTime,
    setSocketStatus: state.setSocketStatus,
    updateShopStatus: state.updateShopStatus,
    setDeliveryAgentsCount: state.setDeliveryAgentsCount,
    setEstimatedDeliveryTime: state.setEstimatedDeliveryTime
}));

export const useNotifications = () => useAppStore(state => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    markNotificationRead: state.markNotificationRead,
    clearNotifications: state.clearNotifications
}));

export const usePerformance = () => useAppStore(state => ({
    performanceMode: state.performanceMode,
    renderOptimizations: state.renderOptimizations,
    setPerformanceMode: state.setPerformanceMode,
    toggleRenderOptimizations: state.toggleRenderOptimizations
}));

// Performance-optimized hooks for specific data slices
export const useOrderById = (orderId: string) =>
    useAppStore(state => state.orders.find(order => order.id === orderId));

export const useMenuItemById = (itemId: string) =>
    useAppStore(state => state.menuItems.find(item => item.id === itemId));

export const useCartItemCount = () =>
    useAppStore(state => state.cart.reduce((total, item) => total + item.quantity, 0));

export const useUnreadNotificationsCount = () =>
    useAppStore(state => state.notifications.filter(n => !n.read).length);

// Persistence helpers
export const persistStore = async () => {
    const state = useAppStore.getState();
    try {
        await AsyncStorage.multiSet([
            ['cart', JSON.stringify(state.cart)],
            ['user', JSON.stringify(state.user)],
            ['performanceMode', state.performanceMode]
        ]);
    } catch (error) {
        console.error('Error persisting store:', error);
    }
};

export const restoreStore = async () => {
    try {
        const [cart, user, performanceMode] = await AsyncStorage.multiGet([
            'cart',
            'user',
            'performanceMode'
        ]);

        const state = useAppStore.getState();

        if (cart[1]) {
            const cartData = JSON.parse(cart[1]);
            cartData.forEach((item: OrderItem) => state.addToCart(item));
        }

        if (user[1]) {
            const userData = JSON.parse(user[1]);
            state.setUser(userData);
        }

        if (performanceMode[1]) {
            state.setPerformanceMode(performanceMode[1] as any);
        }
    } catch (error) {
        console.error('Error restoring store:', error);
    }
};

export default useAppStore;