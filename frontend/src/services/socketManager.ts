/**
 * Optimized Socket Management for Real-Tim        this.config = {
            url: config.url,
            options: {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                batchSize: 10,
                batchDelay: 100,
                ...config.options
            }
        };

        this.batchSize = this.config.options?.batchSize ?? 10;
        this.batchDelay = this.config.options?.batchDelay ?? 100; * Batches socket updates, prevents UI freezing,
 * and provides smooth real-time experience
 */

import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../stores/appStore';
import { throttle, debounce, batchUpdates } from '../utils/performance';

export interface SocketConfig {
    url: string;
    options?: {
        timeout?: number;
        retryAttempts?: number;
        retryDelay?: number;
        batchSize?: number;
        batchDelay?: number;
    };
}

export interface SocketUpdate {
    type: string;
    data: any;
    timestamp: number;
    priority: 'high' | 'normal' | 'low';
}

class OptimizedSocketManager {
    private socket: Socket | null = null;
    private config: SocketConfig;
    private isConnected = false;
    private isReconnecting = false;
    private updateQueue: SocketUpdate[] = [];
    private processingBatch = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private batchTimer: NodeJS.Timeout | null = null;

    // Performance optimizations
    private batchSize = 10;
    private batchDelay = 100; // ms
    private lastActivity = 0;

    constructor(config: SocketConfig) {
        this.config = {
            ...config,
            options: {
                timeout: 5000,
                retryAttempts: 5,
                retryDelay: 2000,
                batchSize: 10,
                batchDelay: 100,
                ...config.options
            }
        };

        this.batchSize = this.config.options?.batchSize ?? 10;
        this.batchDelay = this.config.options?.batchDelay ?? 100;

        // Throttled update processor to prevent UI freezing
        this.processUpdatesThrottled = throttle(this.processUpdates.bind(this), 50);

        // Debounced connection status updater
        this.updateConnectionStatusDebounced = debounce(this.updateConnectionStatus.bind(this), 200);
    }

    /**
     * Connect to socket server
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (this.socket?.connected) {
                    resolve();
                    return;
                }

                const store = useAppStore.getState();
                store.setSocketStatus(false, true);

                this.socket = io(this.config.url, {
                    timeout: this.config.options!.timeout,
                    forceNew: true,
                    transports: ['websocket', 'polling'],
                    upgrade: true,
                    autoConnect: true
                });

                this.setupEventListeners();

                this.socket.on('connect', () => {
                    this.isConnected = true;
                    this.isReconnecting = false;
                    this.reconnectAttempts = 0;
                    this.lastActivity = Date.now();

                    store.setSocketStatus(true, false);
                    store.updateSocketActivity();

                    console.log('🔌 Socket connected successfully');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('🔌 Socket connection error:', error);
                    this.handleReconnection();
                    reject(error);
                });

            } catch (error) {
                console.error('🔌 Socket initialization error:', error);
                reject(error);
            }
        });
    }

    /**
     * Setup optimized event listeners
     */
    private setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            this.isConnected = false;
            this.updateConnectionStatusDebounced();

            if (reason !== 'io client disconnect') {
                this.handleReconnection();
            }
        });

        this.socket.on('reconnect', () => {
            console.log('🔌 Socket reconnected');
            this.isConnected = true;
            this.isReconnecting = false;
            this.reconnectAttempts = 0;
            this.updateConnectionStatusDebounced();
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔌 Reconnection attempt ${attemptNumber}`);
            this.reconnectAttempts = attemptNumber;
        });

        this.socket.on('reconnect_failed', () => {
            console.error('🔌 Socket reconnection failed');
            this.isReconnecting = false;
            this.updateConnectionStatusDebounced();
        });

        // Real-time data events with optimized batching
        this.socket.on('order_update', (data) => {
            this.queueUpdate({
                type: 'order_update',
                data,
                timestamp: Date.now(),
                priority: 'high'
            });
        });

        this.socket.on('menu_update', (data) => {
            this.queueUpdate({
                type: 'menu_update',
                data,
                timestamp: Date.now(),
                priority: 'normal'
            });
        });

        this.socket.on('shop_status', (data) => {
            this.queueUpdate({
                type: 'shop_status',
                data,
                timestamp: Date.now(),
                priority: 'high'
            });
        });

        this.socket.on('delivery_agents', (data) => {
            this.queueUpdate({
                type: 'delivery_agents',
                data,
                timestamp: Date.now(),
                priority: 'low'
            });
        });

        this.socket.on('notification', (data) => {
            this.queueUpdate({
                type: 'notification',
                data,
                timestamp: Date.now(),
                priority: 'high'
            });
        });

        // Performance monitoring
        this.socket.on('pong', () => {
            this.lastActivity = Date.now();
        });

        // Heartbeat to keep connection alive
        setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('ping');
            }
        }, 30000);
    }

    /**
     * Queue update for batch processing
     */
    private queueUpdate(update: SocketUpdate) {
        this.updateQueue.push(update);
        this.lastActivity = Date.now();

        // Process immediately if high priority or queue is full
        if (update.priority === 'high' || this.updateQueue.length >= this.batchSize) {
            this.processUpdatesThrottled();
        } else {
            // Schedule batch processing
            this.scheduleBatchProcessing();
        }
    }

    /**
     * Schedule batch processing with debouncing
     */
    private scheduleBatchProcessing() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }

        this.batchTimer = setTimeout(() => {
            this.processUpdatesThrottled();
        }, this.batchDelay);
    }

    /**
     * Process queued updates in batches
     */
    private processUpdates() {
        if (this.processingBatch || this.updateQueue.length === 0) return;

        this.processingBatch = true;

        try {
            // Sort by priority and timestamp
            const sortedUpdates = [...this.updateQueue].sort((a, b) => {
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return a.timestamp - b.timestamp;
            });

            // Group updates by type for more efficient processing
            const groupedUpdates = sortedUpdates.reduce((acc, update) => {
                if (!acc[update.type]) acc[update.type] = [];
                acc[update.type].push(update);
                return acc;
            }, {} as Record<string, SocketUpdate[]>);

            // Create batch update functions
            const batchFunctions: Array<() => void> = [];
            const store = useAppStore.getState();

            Object.entries(groupedUpdates).forEach(([type, updates]) => {
                switch (type) {
                    case 'order_update':
                        batchFunctions.push(() => {
                            updates.forEach(update => {
                                store.updateOrder(update.data.id, update.data);
                            });
                        });
                        break;

                    case 'menu_update':
                        batchFunctions.push(() => {
                            updates.forEach(update => {
                                store.updateMenuItem(update.data.id, update.data);
                            });
                        });
                        break;

                    case 'shop_status':
                        batchFunctions.push(() => {
                            const latestUpdate = updates[updates.length - 1];
                            store.updateShopStatus(latestUpdate.data.status);
                            if (latestUpdate.data.estimatedDeliveryTime) {
                                store.setEstimatedDeliveryTime(latestUpdate.data.estimatedDeliveryTime);
                            }
                        });
                        break;

                    case 'delivery_agents':
                        batchFunctions.push(() => {
                            const latestUpdate = updates[updates.length - 1];
                            store.setDeliveryAgentsCount(latestUpdate.data.count);
                        });
                        break;

                    case 'notification':
                        batchFunctions.push(() => {
                            updates.forEach(update => {
                                store.addNotification({
                                    title: update.data.title,
                                    message: update.data.message,
                                    type: update.data.type || 'info',
                                    read: false
                                });
                            });
                        });
                        break;
                }
            });

            // Execute all batch functions using React's batching
            if (batchFunctions.length > 0) {
                batchUpdates(batchFunctions);
            }

            // Clear processed updates
            this.updateQueue = [];

            // Update socket activity
            store.updateSocketActivity();

        } catch (error) {
            console.error('🔌 Error processing socket updates:', error);
        } finally {
            this.processingBatch = false;

            // Clear batch timer
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
                this.batchTimer = null;
            }
        }
    }

    /**
     * Handle connection failures and reconnection
     */
    private handleReconnection() {
        if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }

        this.isReconnecting = true;
        const store = useAppStore.getState();
        store.setSocketStatus(false, true);

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        this.reconnectTimer = setTimeout(() => {
            console.log(`🔌 Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            this.connect().catch(() => {
                this.reconnectAttempts++;
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.handleReconnection();
                } else {
                    console.error('🔌 Max reconnection attempts reached');
                    this.isReconnecting = false;
                    store.setSocketStatus(false, false);
                }
            });
        }, delay);
    }

    /**
     * Update connection status in store
     */
    private updateConnectionStatus() {
        const store = useAppStore.getState();
        store.setSocketStatus(this.isConnected, this.isReconnecting);
    }

    /**
     * Emit event to server
     */
    emit(event: string, data?: any): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
            this.lastActivity = Date.now();
        } else {
            console.warn(`🔌 Cannot emit ${event}: Socket not connected`);
        }
    }

    /**
     * Join a room
     */
    joinRoom(roomId: string): void {
        this.emit('join_room', { roomId });
    }

    /**
     * Leave a room
     */
    leaveRoom(roomId: string): void {
        this.emit('leave_room', { roomId });
    }

    /**
     * Disconnect socket
     */
    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.isConnected = false;
        this.isReconnecting = false;
        this.updateConnectionStatus();
    }

    /**
     * Get connection stats
     */
    getConnectionStats() {
        return {
            connected: this.isConnected,
            reconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
            lastActivity: this.lastActivity,
            queueLength: this.updateQueue.length,
            processingBatch: this.processingBatch
        };
    }

    // Throttled and debounced methods
    private processUpdatesThrottled: () => void;
    private updateConnectionStatusDebounced: () => void;
}

// Global socket manager instance
let socketManager: OptimizedSocketManager | null = null;

/**
 * Initialize socket manager
 */
export function initializeSocket(config: SocketConfig): OptimizedSocketManager {
    if (socketManager) {
        socketManager.disconnect();
    }

    socketManager = new OptimizedSocketManager(config);
    return socketManager;
}

/**
 * Get current socket manager instance
 */
export function getSocketManager(): OptimizedSocketManager | null {
    return socketManager;
}

/**
 * Connect to socket server
 */
export async function connectSocket(): Promise<void> {
    if (!socketManager) {
        throw new Error('Socket manager not initialized');
    }

    return socketManager.connect();
}

/**
 * Disconnect from socket server
 */
export function disconnectSocket(): void {
    if (socketManager) {
        socketManager.disconnect();
    }
}

/**
 * Custom hook for socket connection status
 */
export function useSocketStatus() {
    const { socketConnected, socketReconnecting } = useAppStore(state => ({
        socketConnected: state.realTime.socketConnected,
        socketReconnecting: state.realTime.socketReconnecting
    }));

    return {
        connected: socketConnected,
        reconnecting: socketReconnecting,
        stats: socketManager?.getConnectionStats() || null
    };
}

export default OptimizedSocketManager;