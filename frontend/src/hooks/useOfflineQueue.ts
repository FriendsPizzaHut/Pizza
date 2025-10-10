import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetwork } from './useNetwork';
import apiClient from '../api/apiClient';

/**
 * Offline Queue System
 * 
 * Manages offline operations and syncs them when connection is restored.
 * Useful for orders, cart updates, and other mutations.
 */

export interface QueuedRequest {
    id: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    headers?: Record<string, string>;
    timestamp: number;
    retries: number;
    maxRetries: number;
}

const QUEUE_STORAGE_KEY = 'offline_queue';
const MAX_RETRIES = 3;

export const useOfflineQueue = () => {
    const [queue, setQueue] = useState<QueuedRequest[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const { isConnected } = useNetwork();

    /**
     * Load queue from AsyncStorage
     */
    const loadQueue = useCallback(async () => {
        try {
            const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            if (storedQueue) {
                const parsedQueue: QueuedRequest[] = JSON.parse(storedQueue);
                setQueue(parsedQueue);
            }
        } catch (error) {
            console.error('Error loading offline queue:', error);
        }
    }, []);

    /**
     * Save queue to AsyncStorage
     */
    const saveQueue = useCallback(async (newQueue: QueuedRequest[]) => {
        try {
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
            setQueue(newQueue);
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }, []);

    /**
     * Add request to queue
     */
    const addToQueue = useCallback(
        async (
            url: string,
            method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
            data?: any,
            headers?: Record<string, string>
        ): Promise<string> => {
            const request: QueuedRequest = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                url,
                method,
                data,
                headers,
                timestamp: Date.now(),
                retries: 0,
                maxRetries: MAX_RETRIES,
            };

            const newQueue = [...queue, request];
            await saveQueue(newQueue);

            if (__DEV__) {
                console.log('📥 Added to offline queue:', request);
            }

            return request.id;
        },
        [queue, saveQueue]
    );

    /**
     * Remove request from queue
     */
    const removeFromQueue = useCallback(
        async (requestId: string) => {
            const newQueue = queue.filter((req) => req.id !== requestId);
            await saveQueue(newQueue);

            if (__DEV__) {
                console.log('📤 Removed from offline queue:', requestId);
            }
        },
        [queue, saveQueue]
    );

    /**
     * Process a single queued request
     */
    const processRequest = async (request: QueuedRequest): Promise<boolean> => {
        try {
            await apiClient.request({
                url: request.url,
                method: request.method,
                data: request.data,
                headers: request.headers,
            });

            if (__DEV__) {
                console.log('✅ Successfully processed queued request:', request.id);
            }

            return true;
        } catch (error) {
            console.error('❌ Error processing queued request:', error);
            return false;
        }
    };

    /**
     * Sync all queued requests
     */
    const syncQueue = useCallback(async () => {
        if (!isConnected || isSyncing || queue.length === 0) {
            return;
        }

        setIsSyncing(true);

        if (__DEV__) {
            console.log('🔄 Syncing offline queue. Items:', queue.length);
        }

        const remainingQueue: QueuedRequest[] = [];

        for (const request of queue) {
            const success = await processRequest(request);

            if (success) {
                // Request succeeded, remove from queue
                continue;
            } else {
                // Request failed, increment retries
                request.retries++;

                if (request.retries < request.maxRetries) {
                    // Keep in queue for retry
                    remainingQueue.push(request);
                } else {
                    // Max retries reached, log and discard
                    console.error('Max retries reached for request:', request.id);
                }
            }
        }

        await saveQueue(remainingQueue);
        setIsSyncing(false);

        if (__DEV__) {
            console.log('✅ Queue sync complete. Remaining items:', remainingQueue.length);
        }
    }, [isConnected, isSyncing, queue, saveQueue]);

    /**
     * Clear entire queue
     */
    const clearQueue = useCallback(async () => {
        await saveQueue([]);
        if (__DEV__) {
            console.log('🗑️ Offline queue cleared');
        }
    }, [saveQueue]);

    /**
     * Get queue size
     */
    const getQueueSize = useCallback(() => {
        return queue.length;
    }, [queue]);

    // Load queue on mount
    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    // Auto-sync when connection is restored
    useEffect(() => {
        if (isConnected && queue.length > 0 && !isSyncing) {
            syncQueue();
        }
    }, [isConnected, queue.length, isSyncing, syncQueue]);

    return {
        queue,
        isSyncing,
        addToQueue,
        removeFromQueue,
        syncQueue,
        clearQueue,
        getQueueSize,
    };
};

export default useOfflineQueue;
