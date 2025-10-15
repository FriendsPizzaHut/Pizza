// /frontend/src/hooks/useDeliveryOrders.ts
/**
 * Custom hook for managing delivery agent orders
 * Handles real-time updates via Socket.IO
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface DeliveryOrder {
    id: string;
    _id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    profileImage?: string;
    restaurant: string;
    restaurantAddress: string;
    restaurantPhone: string;
    deliveryAddress: string;
    distance: string;
    estimatedTime: string;
    status: 'ready' | 'out_for_delivery' | 'delivered' | 'awaiting_payment';
    total: string;
    totalAmount: number;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    earnings: string;
    orderTime: Date;
    currentStep: number;
    paymentMethod: 'online' | 'cod';
    paymentStatus: string;
}

export const useDeliveryOrders = () => {
    const [orders, setOrders] = useState<DeliveryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const userId = useSelector((state: RootState) => state.auth.userId);
    const socketRef = useRef<Socket | null>(null);

    // 🔥 Socket URL Configuration (same as admin)
    const SOCKET_URL = __DEV__
        ? (Constants.expoConfig?.extra?.apiUrlDevelopment || 'http://localhost:5000').replace(/\/api\/v1$/, '')
        : (Constants.expoConfig?.extra?.apiUrlProduction || 'https://pizzabackend-u9ui.onrender.com').replace(/\/api\/v1$/, '');

    console.log('🔌 [SOCKET CONFIG] Delivery Agent Socket Configuration:');
    console.log('  - Environment:', __DEV__ ? 'development' : 'production');
    console.log('  - Socket URL:', SOCKET_URL);
    console.log('  - Raw apiUrlDevelopment:', Constants.expoConfig?.extra?.apiUrlDevelopment);

    // Fetch orders from API
    const fetchOrders = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            console.log('📡 [FETCH ORDERS] Fetching delivery agent orders...');

            const response = await axiosInstance.get('/orders/delivery-agent/my-orders');

            console.log('✅ [FETCH ORDERS] Response:', response.data);

            if (response.data.success && response.data.data?.orders) {
                // Transform orders to ensure deliveryAddress is a string
                const transformedOrders = response.data.data.orders.map((order: any) => ({
                    ...order,
                    deliveryAddress: typeof order.deliveryAddress === 'string'
                        ? order.deliveryAddress
                        : `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} ${order.deliveryAddress?.pincode || ''}`.trim()
                }));

                setOrders(transformedOrders);
                console.log(`   - Loaded ${transformedOrders.length} orders`);
            }
        } catch (err: any) {
            console.error('❌ [FETCH ORDERS] Error:', err.message);
            setError(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchOrders(false);
    }, [fetchOrders]);

    // Handle new order assignment
    const handleNewOrderAssignment = useCallback((data: any) => {
        console.log('🆕 [SOCKET] New order assigned!');
        console.log('  - Order ID:', data.orderId);
        console.log('  - Order Number:', data.orderNumber);
        console.log('  - Customer:', data.customer?.name);
        console.log('  - Status:', data.status);
        console.log('  - Full data:', JSON.stringify(data, null, 2));

        const newOrder: DeliveryOrder = {
            id: data.orderNumber,
            _id: data.orderId,
            customerName: data.customer?.name || 'Customer',
            customerPhone: data.customer?.phone || 'N/A',
            customerEmail: data.customer?.email,
            profileImage: data.customer?.profileImage,
            restaurant: 'Pizza Palace',
            restaurantAddress: '123 Restaurant St.',
            restaurantPhone: '+1 (555) 111-2222',
            deliveryAddress: typeof data.deliveryAddress === 'string'
                ? data.deliveryAddress
                : `${data.deliveryAddress?.street || ''}, ${data.deliveryAddress?.city || ''}, ${data.deliveryAddress?.state || ''} ${data.deliveryAddress?.pincode || ''}`.trim(),
            distance: '2.5 km',
            estimatedTime: '15 mins',
            status: data.status || 'ready',
            total: `₹${data.totalAmount?.toFixed(2) || '0.00'}`,
            totalAmount: data.totalAmount || 0,
            items: data.items?.map((item: any) => ({
                name: item.productSnapshot?.name || item.product?.name || item.name || 'Item',
                quantity: item.quantity || 1,
                price: item.subtotal ? item.subtotal / item.quantity : (item.price || 0)
            })) || [],
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            deliveryFee: data.deliveryFee || 0,
            discount: data.discount || 0,
            earnings: `₹${((data.totalAmount || 0) * 0.1).toFixed(2)}`,
            orderTime: data.assignedAt || new Date(),
            currentStep: 1,
            paymentMethod: data.paymentMethod === 'cash' ? 'cod' : (data.paymentMethod || 'online'),
            paymentStatus: data.paymentStatus || 'pending',
        };

        // Add to orders list (prepend - newest first)
        setOrders(prev => {
            console.log('✅ [SOCKET] Adding new order to list');
            console.log('  - Current orders count:', prev.length);
            console.log('  - New orders count:', prev.length + 1);
            return [newOrder, ...prev];
        });

        // Optional: Show notification
        // You can implement a toast/notification here
    }, []);

    // Handle order status update
    const handleOrderStatusUpdate = useCallback((data: any) => {
        console.log('📝 [SOCKET] Order status updated:', data);

        setOrders(prev =>
            prev.map(order =>
                order._id === data.orderId || order.id === data.orderNumber
                    ? { ...order, status: data.status, currentStep: data.status === 'delivered' ? 3 : order.currentStep }
                    : order
            )
        );
    }, []);

    // Setup Socket.IO listeners
    useEffect(() => {
        if (!userId) return;

        console.log('🔌 [SOCKET] Setting up delivery agent socket listeners...');
        console.log('  - User ID:', userId);
        console.log('  - Connecting to:', SOCKET_URL);

        // Create socket connection with same config as admin
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        // Connection established
        socket.on('connect', () => {
            console.log('✅ [SOCKET] Socket connected successfully!');
            console.log('  - Socket ID:', socket.id);
            console.log('  - Transport:', socket.io.engine.transport.name);
            console.log('📍 [SOCKET] Registering as delivery agent...');

            // Register with server
            socket.emit('register', {
                userId: userId,
                role: 'delivery'
            });
            console.log('  - Registration sent with userId:', userId);
            console.log('  - Role: delivery');
        });

        // Registration confirmed
        socket.on('registered', (data) => {
            console.log('✅ [SOCKET] Registration confirmed by server!');
            console.log('  - Response:', JSON.stringify(data, null, 2));
        });

        // Listen for new order assignments
        socket.on('order:assigned', handleNewOrderAssignment);

        // Listen for order status updates
        socket.on('order:status:update', handleOrderStatusUpdate);
        socket.on('order:status:changed', handleOrderStatusUpdate); // Alternative event name

        // Disconnect event
        socket.on('disconnect', (reason) => {
            console.log('❌ [SOCKET] Disconnected');
            console.log('  - Reason:', reason);
        });

        // Connection error handling
        socket.on('connect_error', (error) => {
            console.error('❌ [SOCKET] Connection error:');
            console.error('  - Error:', error.message);
            console.error('  - Socket URL was:', SOCKET_URL);
        });

        // Cleanup
        return () => {
            console.log('🔌 [SOCKET] Cleaning up delivery agent socket listeners...');
            if (socket) {
                socket.off('connect');
                socket.off('registered');
                socket.off('order:assigned');
                socket.off('order:status:update');
                socket.off('order:status:changed');
                socket.off('connect_error');
                socket.off('disconnect');
                socket.disconnect();
            }
        };
    }, [userId, SOCKET_URL, handleNewOrderAssignment, handleOrderStatusUpdate]);

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchOrders();
        }
    }, [userId, fetchOrders]);

    // Update order status locally and sync with backend
    const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
        try {
            console.log(`📝 [UPDATE STATUS] Order: ${orderId}, Status: ${status}`);

            // Optimistic update
            setOrders(prev =>
                prev.map(order =>
                    order._id === orderId
                        ? {
                            ...order,
                            status: status as any,
                            currentStep: status === 'out_for_delivery' ? 2 : status === 'delivered' ? 3 : order.currentStep
                        }
                        : order
                )
            );

            // Sync with backend
            await axiosInstance.patch(`/orders/${orderId}/status`, { status });

            console.log('✅ [UPDATE STATUS] Status updated successfully');
        } catch (err: any) {
            console.error('❌ [UPDATE STATUS] Error:', err.message);
            // Revert optimistic update on error
            await fetchOrders(false);
            throw err;
        }
    }, [fetchOrders]);

    // Remove order from list (after delivery)
    const removeOrder = useCallback((orderId: string) => {
        setOrders(prev => prev.filter(order => order._id !== orderId));
    }, []);

    return {
        orders,
        loading,
        error,
        refreshing,
        fetchOrders,
        onRefresh,
        updateOrderStatus,
        removeOrder,
    };
};
