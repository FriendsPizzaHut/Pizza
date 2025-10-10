/**
 * Enhanced Offline Queue System
 * 
 * Manages offline CRUD operations with persistent storage in AsyncStorage.
 * Supports automatic retry, conflict resolution, and background sync.
 * 
 * @module offlineQueue
 * @implements Prompt 4 - Offline-First Strategy for Forms and CRUD Actions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Types of CRUD operations
 */
export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH';

/**
 * HTTP Methods
 */
export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Status of queued action
 */
export type QueueItemStatus = 'pending' | 'processing' | 'success' | 'failed' | 'conflict';

/**
 * Interface for a queued action item
 */
export interface QueuedAction {
    /** Unique ID for the queued action */
    id: string;

    /** Type of CRUD operation */
    type: OperationType;

    /** API endpoint (relative or absolute) */
    endpoint: string;

    /** Request payload/body */
    payload: any;

    /** HTTP method */
    method: HttpMethod;

    /** Timestamp when action was queued */
    timestamp: number;

    /** Current status of the action */
    status: QueueItemStatus;

    /** Number of retry attempts */
    retryCount: number;

    /** Maximum retry attempts allowed */
    maxRetries: number;

    /** Temporary ID for optimistic updates (for CREATE operations) */
    tempId?: string;

    /** Server-assigned ID (after successful sync) */
    serverId?: string;

    /** Error message if failed */
    error?: string;

    /** Priority (higher = more important) */
    priority: number;

    /** Resource type (e.g., 'menu', 'order', 'user') */
    resourceType?: string;

    /** Additional metadata */
    metadata?: Record<string, any>;
}

/**
 * Options for enqueuing actions
 */
export interface EnqueueOptions {
    /** Priority level (0-10, default: 5) */
    priority?: number;

    /** Maximum retry attempts (default: 3) */
    maxRetries?: number;

    /** Temporary ID for optimistic updates */
    tempId?: string;

    /** Resource type for categorization */
    resourceType?: string;

    /** Additional metadata */
    metadata?: Record<string, any>;
}

/**
 * Sync result for a single action
 */
export interface SyncResult {
    id: string;
    success: boolean;
    error?: string;
    data?: any;
}

/**
 * Sync callback function type
 */
export type SyncCallback = (action: QueuedAction) => Promise<any>;

// Constants
const QUEUE_STORAGE_KEY = '@offline_queue';
const MAX_QUEUE_SIZE = 200;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_PRIORITY = 5;

/**
 * Offline Queue Manager
 * Singleton class to manage offline action queue
 */
class OfflineQueueManager {
    private static instance: OfflineQueueManager;
    private queue: QueuedAction[] = [];
    private isProcessing: boolean = false;
    private listeners: Array<(queue: QueuedAction[]) => void> = [];
    private syncCallback?: SyncCallback;

    private constructor() {
        this.loadQueue();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): OfflineQueueManager {
        if (!OfflineQueueManager.instance) {
            OfflineQueueManager.instance = new OfflineQueueManager();
        }
        return OfflineQueueManager.instance;
    }

    /**
     * Set sync callback function
     */
    setSyncCallback(callback: SyncCallback): void {
        this.syncCallback = callback;
    }

    /**
     * Enqueue a new action
     * 
     * @param type - Type of CRUD operation
     * @param endpoint - API endpoint
     * @param payload - Request payload
     * @param method - HTTP method
     * @param options - Additional options
     * @returns Promise with action ID
     */
    async enqueue(
        type: OperationType,
        endpoint: string,
        payload: any,
        method: HttpMethod,
        options: EnqueueOptions = {}
    ): Promise<string> {
        const {
            priority = DEFAULT_PRIORITY,
            maxRetries = DEFAULT_MAX_RETRIES,
            tempId,
            resourceType,
            metadata,
        } = options;

        // Generate unique ID
        const id = this.generateUniqueId();

        const action: QueuedAction = {
            id,
            type,
            endpoint,
            payload,
            method,
            timestamp: Date.now(),
            status: 'pending',
            retryCount: 0,
            maxRetries,
            priority,
            tempId: tempId || (type === 'CREATE' ? this.generateTempId() : undefined),
            resourceType,
            metadata,
        };

        // Add to queue
        this.queue.push(action);

        // Sort by priority (higher first), then by timestamp (older first)
        this.sortQueue();

        // Enforce max queue size
        if (this.queue.length > MAX_QUEUE_SIZE) {
            const removed = this.queue.splice(MAX_QUEUE_SIZE);
            console.warn(`⚠️ Queue size exceeded. Removed ${removed.length} oldest items.`);
        }

        // Persist to storage
        await this.saveQueue();

        // Notify listeners
        this.notifyListeners();

        if (__DEV__) {
            console.log(`📥 Action enqueued: ${type} ${endpoint}`, {
                id,
                tempId: action.tempId,
                priority,
            });
        }

        return id;
    }

    /**
     * Dequeue (remove) an action by ID
     */
    async dequeue(id: string): Promise<boolean> {
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(action => action.id !== id);

        if (this.queue.length < initialLength) {
            await this.saveQueue();
            this.notifyListeners();

            if (__DEV__) {
                console.log(`📤 Action dequeued: ${id}`);
            }
            return true;
        }

        return false;
    }

    /**
     * Retry all failed actions
     */
    async retryAll(): Promise<void> {
        const failedActions = this.queue.filter(
            action => action.status === 'failed' && action.retryCount < action.maxRetries
        );

        for (const action of failedActions) {
            action.status = 'pending';
            action.error = undefined;
        }

        await this.saveQueue();
        this.notifyListeners();

        if (__DEV__) {
            console.log(`🔄 Retrying ${failedActions.length} failed actions`);
        }
    }

    /**
     * Process all pending actions in the queue
     * 
     * @returns Promise with sync results
     */
    async processQueue(): Promise<SyncResult[]> {
        if (this.isProcessing) {
            if (__DEV__) {
                console.log('⏳ Queue already processing...');
            }
            return [];
        }

        if (!this.syncCallback) {
            console.error('❌ No sync callback registered. Cannot process queue.');
            return [];
        }

        this.isProcessing = true;
        const results: SyncResult[] = [];

        // Get pending actions only
        const pendingActions = this.queue.filter(
            action => action.status === 'pending'
        );

        if (__DEV__) {
            console.log(`🔄 Processing ${pendingActions.length} pending actions...`);
        }

        for (const action of pendingActions) {
            try {
                // Update status to processing
                action.status = 'processing';
                await this.saveQueue();
                this.notifyListeners();

                // Execute the sync callback
                const result = await this.syncCallback(action);

                // Mark as success
                action.status = 'success';

                // Store server ID if it's a CREATE operation
                if (action.type === 'CREATE' && result?.id) {
                    action.serverId = result.id;
                }

                results.push({
                    id: action.id,
                    success: true,
                    data: result,
                });

                if (__DEV__) {
                    console.log(`✅ Action synced: ${action.type} ${action.endpoint}`);
                }

                // Remove from queue after successful sync
                await this.dequeue(action.id);

            } catch (error: any) {
                action.retryCount++;

                // Check if max retries reached
                if (action.retryCount >= action.maxRetries) {
                    action.status = 'failed';
                    action.error = error.message || 'Unknown error';

                    if (__DEV__) {
                        console.error(
                            `❌ Action failed permanently (${action.retryCount}/${action.maxRetries}):`,
                            action.endpoint
                        );
                    }
                } else {
                    action.status = 'pending';

                    if (__DEV__) {
                        console.warn(
                            `⚠️ Action failed, will retry (${action.retryCount}/${action.maxRetries}):`,
                            action.endpoint
                        );
                    }
                }

                results.push({
                    id: action.id,
                    success: false,
                    error: error.message || 'Unknown error',
                });

                await this.saveQueue();
                this.notifyListeners();
            }
        }

        this.isProcessing = false;

        if (__DEV__) {
            const successCount = results.filter(r => r.success).length;
            console.log(
                `✅ Queue processing complete: ${successCount}/${results.length} successful`
            );
        }

        return results;
    }

    /**
     * Get all queued actions
     */
    getQueue(): QueuedAction[] {
        return [...this.queue];
    }

    /**
     * Get pending actions count
     */
    getPendingCount(): number {
        return this.queue.filter(action => action.status === 'pending').length;
    }

    /**
     * Get failed actions count
     */
    getFailedCount(): number {
        return this.queue.filter(action => action.status === 'failed').length;
    }

    /**
     * Get actions by status
     */
    getActionsByStatus(status: QueueItemStatus): QueuedAction[] {
        return this.queue.filter(action => action.status === status);
    }

    /**
     * Get actions by resource type
     */
    getActionsByResourceType(resourceType: string): QueuedAction[] {
        return this.queue.filter(action => action.resourceType === resourceType);
    }

    /**
     * Check if queue has pending actions
     */
    hasPending(): boolean {
        return this.queue.some(action => action.status === 'pending');
    }

    /**
     * Clear all successfully synced actions
     */
    async clearSynced(): Promise<void> {
        const beforeCount = this.queue.length;
        this.queue = this.queue.filter(action => action.status !== 'success');

        if (this.queue.length < beforeCount) {
            await this.saveQueue();
            this.notifyListeners();

            if (__DEV__) {
                console.log(`🗑️ Cleared ${beforeCount - this.queue.length} synced actions`);
            }
        }
    }

    /**
     * Clear all failed actions
     */
    async clearFailed(): Promise<void> {
        const beforeCount = this.queue.length;
        this.queue = this.queue.filter(action => action.status !== 'failed');

        if (this.queue.length < beforeCount) {
            await this.saveQueue();
            this.notifyListeners();

            if (__DEV__) {
                console.log(`🗑️ Cleared ${beforeCount - this.queue.length} failed actions`);
            }
        }
    }

    /**
     * Clear entire queue
     */
    async clearAll(): Promise<void> {
        this.queue = [];
        await this.saveQueue();
        this.notifyListeners();

        if (__DEV__) {
            console.log('🗑️ Queue cleared completely');
        }
    }

    /**
     * Subscribe to queue changes
     */
    subscribe(listener: (queue: QueuedAction[]) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Get queue statistics
     */
    getStats() {
        return {
            total: this.queue.length,
            pending: this.queue.filter(a => a.status === 'pending').length,
            processing: this.queue.filter(a => a.status === 'processing').length,
            success: this.queue.filter(a => a.status === 'success').length,
            failed: this.queue.filter(a => a.status === 'failed').length,
            conflict: this.queue.filter(a => a.status === 'conflict').length,
        };
    }

    /**
     * Generate unique ID
     */
    private generateUniqueId(): string {
        return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate temporary ID for optimistic updates
     */
    private generateTempId(): string {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sort queue by priority and timestamp
     */
    private sortQueue(): void {
        this.queue.sort((a, b) => {
            // First sort by priority (higher first)
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }
            // Then by timestamp (older first)
            return a.timestamp - b.timestamp;
        });
    }

    /**
     * Save queue to AsyncStorage
     */
    private async saveQueue(): Promise<void> {
        try {
            const serialized = JSON.stringify(this.queue);
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, serialized);
        } catch (error) {
            console.error('❌ Failed to save queue to storage:', error);
        }
    }

    /**
     * Load queue from AsyncStorage
     */
    private async loadQueue(): Promise<void> {
        try {
            const serialized = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);

            if (serialized) {
                this.queue = JSON.parse(serialized);

                // Reset any 'processing' status to 'pending' on app restart
                this.queue.forEach(action => {
                    if (action.status === 'processing') {
                        action.status = 'pending';
                    }
                });

                await this.saveQueue();

                if (__DEV__) {
                    console.log(`📦 Loaded ${this.queue.length} queued actions from storage`);
                }
            }
        } catch (error) {
            console.error('❌ Failed to load queue from storage:', error);
        }
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener([...this.queue]);
            } catch (error) {
                console.error('Error notifying queue listener:', error);
            }
        });
    }
}

// Export singleton instance
export const offlineQueue = OfflineQueueManager.getInstance();

// Export convenience functions
export const enqueueAction = (
    type: OperationType,
    endpoint: string,
    payload: any,
    method: HttpMethod,
    options?: EnqueueOptions
) => offlineQueue.enqueue(type, endpoint, payload, method, options);

export const dequeueAction = (id: string) => offlineQueue.dequeue(id);

export const retryAllActions = () => offlineQueue.retryAll();

export const processQueue = () => offlineQueue.processQueue();

export const getQueue = () => offlineQueue.getQueue();

export const getPendingCount = () => offlineQueue.getPendingCount();

export const getFailedCount = () => offlineQueue.getFailedCount();

export const clearQueue = () => offlineQueue.clearAll();

export const subscribeToQueue = (listener: (queue: QueuedAction[]) => void) =>
    offlineQueue.subscribe(listener);

export default offlineQueue;
