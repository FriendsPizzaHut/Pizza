import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_EVENTS } from '../api/endpoints';

/**
 * Socket.io Service
 * 
 * Manages WebSocket connection for real-time updates.
 * Handles authentication, reconnection, and event subscriptions.
 */

class SocketService {
    private socket: Socket | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private eventListeners: Map<string, Set<Function>> = new Map();

    /**
     * Get Socket URL
     */
    private getSocketUrl(): string {
        const isDevelopment = __DEV__;
        return isDevelopment
            ? process.env.EXPO_PUBLIC_SOCKET_URL_DEVELOPMENT || 'http://localhost:5000'
            : process.env.EXPO_PUBLIC_SOCKET_URL_PRODUCTION || 'https://pizzabackend-u9ui.onrender.com';
    }

    /**
     * Initialize Socket Connection
     */
    async connect(userId?: string): Promise<void> {
        if (this.socket?.connected) {
            return;
        }

        try {
            // Get auth token
            const authState = await AsyncStorage.getItem('authState');
            let token: string | null = null;

            if (authState) {
                const parsed = JSON.parse(authState);
                token = parsed.token;
            }

            // Create socket connection
            this.socket = io(this.getSocketUrl(), {
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: this.maxReconnectAttempts,
                auth: {
                    token,
                    userId,
                },
                query: {
                    platform: 'mobile',
                },
            });

            // Setup event handlers
            this.setupEventHandlers();

        } catch (error) {
            console.error('Socket connection error:', error);
        }
    }

    /**
     * Setup Socket Event Handlers
     */
    private setupEventHandlers(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error: Error) => {
            this.reconnectAttempts++;

            // Only log error if we haven't exceeded max attempts (reduce noise)
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                if (__DEV__ && this.reconnectAttempts === 1) {
                    console.warn('🔌 Socket connection failed (will retry in background)');
                }
            } else {
                console.warn('⚠️ Socket connection unavailable after multiple attempts');
                this.disconnect();
            }
        });

        this.socket.on(SOCKET_EVENTS.ERROR, (error: any) => {
            console.error('Socket error:', error);
        });

        // Order events
        this.socket.on(SOCKET_EVENTS.ORDER_CREATED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.ORDER_CREATED, data);
        });

        this.socket.on(SOCKET_EVENTS.ORDER_UPDATED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.ORDER_UPDATED, data);
        });

        this.socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.ORDER_STATUS_CHANGED, data);
        });

        this.socket.on(SOCKET_EVENTS.ORDER_ASSIGNED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.ORDER_ASSIGNED, data);
        });

        // Delivery events
        this.socket.on(SOCKET_EVENTS.DELIVERY_LOCATION_UPDATED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.DELIVERY_LOCATION_UPDATED, data);
        });

        this.socket.on(SOCKET_EVENTS.DELIVERY_ARRIVED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.DELIVERY_ARRIVED, data);
        });

        // Notification events
        this.socket.on(SOCKET_EVENTS.NOTIFICATION_RECEIVED, (data: any) => {
            this.notifyListeners(SOCKET_EVENTS.NOTIFICATION_RECEIVED, data);
        });
    }

    /**
     * Disconnect Socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.eventListeners.clear();
        }
    }

    /**
     * Subscribe to Event
     */
    on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)?.add(callback);
    }

    /**
     * Unsubscribe from Event
     */
    off(event: string, callback: Function): void {
        this.eventListeners.get(event)?.delete(callback);
    }

    /**
     * Notify all listeners of an event
     */
    private notifyListeners(event: string, data: any): void {
        this.eventListeners.get(event)?.forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }

    /**
     * Emit Event to Server
     */
    emit(event: string, data?: any): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit event:', event);
        }
    }

    /**
     * Join Room
     */
    joinRoom(room: string): void {
        this.emit('join', { room });
    }

    /**
     * Leave Room
     */
    leaveRoom(room: string): void {
        this.emit('leave', { room });
    }

    /**
     * Check if socket is connected
     */
    isSocketConnected(): boolean {
        return this.isConnected && this.socket?.connected === true;
    }

    /**
     * Get Socket Instance (for advanced usage)
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
