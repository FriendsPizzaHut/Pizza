/**
 * Request Queue Manager
 * 
 * Manages offline API requests by queuing them in AsyncStorage
 * and automatically retrying when network connection is restored.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import { errorLogger } from '../services/errorLogger';

export interface QueuedRequest {
    id: string;
    config: AxiosRequestConfig;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
    status: 'pending' | 'processing' | 'failed' | 'success';
    error?: string;
    priority: number; // Higher = more important
}

interface QueueOptions {
    maxRetries?: number;
    priority?: number;
}

const QUEUE_STORAGE_KEY = '@request_queue';
const MAX_QUEUE_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;

/**
 * Request Queue Manager Class
 */
class RequestQueueManager {
    private static instance: RequestQueueManager;
    private queue: QueuedRequest[] = [];
    private isProcessing: boolean = false;
    private listeners: Array<(queue: QueuedRequest[]) => void> = [];

    private constructor() {
        this.loadQueue();
    }

    static getInstance(): RequestQueueManager {
        if (!RequestQueueManager.instance) {
            RequestQueueManager.instance = new RequestQueueManager();
        }
        return RequestQueueManager.instance;
    }

    /**
     * Add request to queue
     */
    async enqueue(
        config: AxiosRequestConfig,
        options: QueueOptions = {}
    ): Promise<string> {
        const { maxRetries = DEFAULT_MAX_RETRIES, priority = 0 } = options;

        const request: QueuedRequest = {
            id: this.generateId(),
            config,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries,
            status: 'pending',
            priority,
        };

        // Add to queue
        this.queue.push(request);

        // Sort by priority (higher first) and timestamp (older first)
        this.queue.sort((a, b) => {
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
        });

        // Limit queue size
        if (this.queue.length > MAX_QUEUE_SIZE) {
            this.queue = this.queue.slice(0, MAX_QUEUE_SIZE);
        }

        // Save to storage
        await this.saveQueue();

        // Notify listeners
        this.notifyListeners();

        if (__DEV__) {
            console.log(`📥 Request queued: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return request.id;
    }

    /**
     * Process all pending requests in queue
     */
    async processQueue(
        requestHandler: (config: AxiosRequestConfig) => Promise<any>
    ): Promise<void> {
        if (this.isProcessing) {
            if (__DEV__) {
                console.log('⏳ Queue already processing...');
            }
            return;
        }

        this.isProcessing = true;
        const pendingRequests = this.queue.filter(req => req.status === 'pending');

        if (__DEV__) {
            console.log(`🔄 Processing queue: ${pendingRequests.length} pending requests`);
        }

        for (const request of pendingRequests) {
            try {
                // Update status to processing
                request.status = 'processing';
                await this.saveQueue();
                this.notifyListeners();

                // Execute request
                await requestHandler(request.config);

                // Mark as success
                request.status = 'success';

                if (__DEV__) {
                    console.log(`✅ Request completed: ${request.config.method?.toUpperCase()} ${request.config.url}`);
                }

                // Remove from queue after success
                await this.remove(request.id);
            } catch (error: any) {
                request.retryCount++;

                if (request.retryCount >= request.maxRetries) {
                    request.status = 'failed';
                    request.error = error.message || 'Request failed';

                    if (__DEV__) {
                        console.error(`❌ Request failed permanently: ${request.config.url}`, error);
                    }

                    // Log error
                    errorLogger.logError(
                        new Error(`Queued request failed: ${request.config.url}`),
                        { request, error: error.message }
                    );
                } else {
                    request.status = 'pending';

                    if (__DEV__) {
                        console.warn(
                            `⚠️ Request failed (retry ${request.retryCount}/${request.maxRetries}): ${request.config.url}`
                        );
                    }
                }

                await this.saveQueue();
                this.notifyListeners();
            }
        }

        this.isProcessing = false;

        if (__DEV__) {
            console.log('✅ Queue processing complete');
        }
    }

    /**
     * Remove request from queue by ID
     */
    async remove(id: string): Promise<void> {
        this.queue = this.queue.filter(req => req.id !== id);
        await this.saveQueue();
        this.notifyListeners();
    }

    /**
     * Clear all failed requests
     */
    async clearFailed(): Promise<void> {
        this.queue = this.queue.filter(req => req.status !== 'failed');
        await this.saveQueue();
        this.notifyListeners();
    }

    /**
     * Clear entire queue
     */
    async clear(): Promise<void> {
        this.queue = [];
        await this.saveQueue();
        this.notifyListeners();
    }

    /**
     * Get all queued requests
     */
    getQueue(): QueuedRequest[] {
        return [...this.queue];
    }

    /**
     * Get queue statistics
     */
    getStats(): {
        total: number;
        pending: number;
        processing: number;
        failed: number;
        success: number;
    } {
        return {
            total: this.queue.length,
            pending: this.queue.filter(req => req.status === 'pending').length,
            processing: this.queue.filter(req => req.status === 'processing').length,
            failed: this.queue.filter(req => req.status === 'failed').length,
            success: this.queue.filter(req => req.status === 'success').length,
        };
    }

    /**
     * Check if queue has pending requests
     */
    hasPending(): boolean {
        return this.queue.some(req => req.status === 'pending');
    }

    /**
     * Subscribe to queue changes
     */
    subscribe(listener: (queue: QueuedRequest[]) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save queue to AsyncStorage
     */
    private async saveQueue(): Promise<void> {
        try {
            const serialized = JSON.stringify(this.queue);
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, serialized);
        } catch (error) {
            console.error('Failed to save request queue:', error);
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

                // Reset processing status on app restart
                this.queue.forEach(req => {
                    if (req.status === 'processing') {
                        req.status = 'pending';
                    }
                });

                await this.saveQueue();

                if (__DEV__) {
                    console.log(`📦 Loaded ${this.queue.length} queued requests`);
                }
            }
        } catch (error) {
            console.error('Failed to load request queue:', error);
        }
    }

    /**
     * Notify all listeners of queue changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener([...this.queue]);
            } catch (error) {
                console.error('Queue listener error:', error);
            }
        });
    }
}

// Export singleton instance
export const requestQueue = RequestQueueManager.getInstance();

// Export class for testing
export default RequestQueueManager;
