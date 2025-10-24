/**
 * Dashboard Socket Hook
 * 
 * Manages real-time Socket.IO updates for dashboard
 * Listens to order, payment, and delivery events
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import {
    incrementTodayOrders,
    incrementCompletedOrders,
    updateRevenue,
    addActivity,
    updateActiveDeliveries,
} from '../../redux/slices/dashboardSlice';
import io, { Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_OPTIONS } from '../config/socket.config';

let socket: Socket | null = null;

/**
 * Initialize socket connection
 */
const initializeSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, SOCKET_OPTIONS);

        socket.on('connect', () => {
            console.log('✅ Dashboard Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('❌ Dashboard Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }
    return socket;
};

/**
 * Custom hook to handle dashboard real-time updates
 */
export const useDashboardSocket = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const socketInstance = initializeSocket();

        // Listen for new orders
        socketInstance.on('order:new', (data: any) => {
            console.log('📦 New order received:', data.orderId);
            dispatch(incrementTodayOrders());
            dispatch(
                addActivity({
                    action: 'New order received',
                    time: 'Just now',
                    id: data.orderId,
                    icon: 'add-shopping-cart',
                    color: '#4CAF50',
                })
            );
        });

        // Listen for order status updates
        socketInstance.on('order:status:update', (data: any) => {
            console.log('📊 Order status updated:', data.orderId, data.status);

            if (data.status === 'delivered') {
                dispatch(incrementCompletedOrders());
                dispatch(
                    addActivity({
                        action: 'Order delivered',
                        time: 'Just now',
                        id: data.orderId,
                        icon: 'check-circle',
                        color: '#4CAF50',
                    })
                );
            }

            // Update active deliveries count
            if (data.activeDeliveriesCount !== undefined) {
                dispatch(updateActiveDeliveries(data.activeDeliveriesCount));
            }
        });

        // Listen for payment received events
        socketInstance.on('payment:received', (data: any) => {
            console.log('💰 Payment received:', data.amount);
            dispatch(updateRevenue(data.amount));
            dispatch(
                addActivity({
                    action: 'Payment received',
                    time: 'Just now',
                    id: data.paymentId,
                    icon: 'payments',
                    color: '#4CAF50',
                })
            );
        });

        // Listen for delivery agent status changes
        socketInstance.on('delivery:status:changed', (data: any) => {
            console.log('🚚 Delivery status changed:', data.agentName, data.status);
            if (data.status === 'online') {
                dispatch(
                    addActivity({
                        action: 'Driver went online',
                        time: 'Just now',
                        id: data.agentName,
                        icon: 'delivery-dining',
                        color: '#FF9800',
                    })
                );
            }
        });

        // Listen for new customer registrations
        socketInstance.on('customer:registered', (data: any) => {
            console.log('👤 New customer registered:', data.customerName);
            dispatch(
                addActivity({
                    action: 'New customer registered',
                    time: 'Just now',
                    id: data.customerName,
                    icon: 'person-add',
                    color: '#2196F3',
                })
            );
        });

        // Cleanup listeners on unmount
        return () => {
            socketInstance.off('order:new');
            socketInstance.off('order:status:update');
            socketInstance.off('payment:received');
            socketInstance.off('delivery:status:changed');
            socketInstance.off('customer:registered');
        };
    }, [dispatch]);
};

/**
 * Disconnect socket (call on app exit or logout)
 */
export const disconnectDashboardSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Dashboard socket disconnected');
    }
};
