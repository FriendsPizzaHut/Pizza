/**
 * useOfflineSync Hook
 * 
 * Automatically syncs queued offline actions when network reconnects.
 * Provides real-time status of sync operations and queue state.
 * 
 * @module useOfflineSync
 * @implements Prompt 4 - Automatic Sync When Back Online
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { offlineQueue, QueuedAction, SyncResult } from '../utils/offlineQueue';
import * as toastUtils from '../utils/toast';

export interface OfflineSyncState {
    /** Whether sync is currently in progress */
    isSyncing: boolean;

    /** Queue of pending actions */
    queue: QueuedAction[];

    /** Number of pending actions */
    pendingCount: number;

    /** Number of failed actions */
    failedCount: number;

    /** Last sync timestamp */
    lastSync: number | null;

    /** Last sync results */
    lastSyncResults: SyncResult[] | null;

    /** Whether there are any pending actions */
    hasPending: boolean;
}

export interface UseOfflineSyncReturn extends OfflineSyncState {
    /** Manually trigger sync */
    syncNow: () => Promise<void>;

    /** Retry all failed actions */
    retryFailed: () => Promise<void>;

    /** Clear all failed actions */
    clearFailed: () => Promise<void>;

    /** Clear all synced actions */
    clearSynced: () => Promise<void>;

    /** Get queue statistics */
    getStats: () => {
        total: number;
        pending: number;
        processing: number;
        success: number;
        failed: number;
        conflict: number;
    };
}

/**
 * Hook for managing offline sync operations
 * 
 * @param options - Configuration options
 * @returns Offline sync state and control functions
 */
export const useOfflineSync = (options?: {
    /** Auto-sync on mount if network is available */
    autoSyncOnMount?: boolean;

    /** Show toast notifications for sync events */
    showNotifications?: boolean;
}): UseOfflineSyncReturn => {
    const {
        autoSyncOnMount = true,
        showNotifications = true,
    } = options || {};

    const { isConnected } = useNetwork();
    const [isSyncing, setIsSyncing] = useState(false);
    const [queue, setQueue] = useState<QueuedAction[]>([]);
    const [lastSync, setLastSync] = useState<number | null>(null);
    const [lastSyncResults, setLastSyncResults] = useState<SyncResult[] | null>(null);

    const wasOfflineRef = useRef(!isConnected);
    const hasSyncedOnMount = useRef(false);

    /**
     * Update queue state from offline queue
     */
    const updateQueue = useCallback(() => {
        const currentQueue = offlineQueue.getQueue();
        setQueue(currentQueue);
    }, []);

    /**
     * Sync queued actions
     */
    const syncNow = useCallback(async () => {
        if (isSyncing) {
            if (__DEV__) {
                console.log('⏳ Sync already in progress...');
            }
            return;
        }

        if (!isConnected) {
            if (showNotifications) {
                toastUtils.showToast('Cannot sync while offline', 'short', 'warning');
            }
            return;
        }

        const pendingCount = offlineQueue.getPendingCount();
        if (pendingCount === 0) {
            if (__DEV__) {
                console.log('✅ No pending actions to sync');
            }
            return;
        }

        setIsSyncing(true);

        try {
            if (__DEV__) {
                console.log(`🔄 Starting sync of ${pendingCount} actions...`);
            }

            const results = await offlineQueue.processQueue();

            setLastSync(Date.now());
            setLastSyncResults(results);
            updateQueue();

            const successCount = results.filter(r => r.success).length;
            const failedCount = results.filter(r => !r.success).length;

            if (__DEV__) {
                console.log(`✅ Sync complete: ${successCount} succeeded, ${failedCount} failed`);
            }

            if (showNotifications && successCount > 0) {
                toastUtils.showSyncSuccessToast(successCount);
            }

            if (showNotifications && failedCount > 0) {
                toastUtils.showToast(
                    `${failedCount} ${failedCount === 1 ? 'action' : 'actions'} failed to sync`,
                    'long',
                    'error'
                );
            }

        } catch (error) {
            console.error('❌ Sync error:', error);

            if (showNotifications) {
                toastUtils.showToast('Failed to sync offline changes', 'short', 'error');
            }
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, isConnected, showNotifications, updateQueue]);

    /**
     * Retry all failed actions
     */
    const retryFailed = useCallback(async () => {
        await offlineQueue.retryAll();
        updateQueue();

        if (isConnected) {
            await syncNow();
        } else if (showNotifications) {
            toastUtils.showToast('Actions marked for retry. Will sync when online.', 'short', 'info');
        }
    }, [isConnected, syncNow, showNotifications, updateQueue]);

    /**
     * Clear all failed actions
     */
    const clearFailed = useCallback(async () => {
        await offlineQueue.clearFailed();
        updateQueue();

        if (showNotifications) {
            toastUtils.showToast('Failed actions cleared', 'short', 'info');
        }
    }, [showNotifications, updateQueue]);

    /**
     * Clear all synced actions
     */
    const clearSynced = useCallback(async () => {
        await offlineQueue.clearSynced();
        updateQueue();
    }, [updateQueue]);

    /**
     * Get queue statistics
     */
    const getStats = useCallback(() => {
        return offlineQueue.getStats();
    }, []);

    // Subscribe to queue changes
    useEffect(() => {
        updateQueue();

        const unsubscribe = offlineQueue.subscribe((updatedQueue) => {
            setQueue(updatedQueue);
        });

        return () => {
            unsubscribe();
        };
    }, [updateQueue]);

    // Auto-sync when network comes back online
    useEffect(() => {
        if (isConnected && wasOfflineRef.current) {
            // Network just came back online
            if (__DEV__) {
                console.log('🌐 Network restored - triggering auto-sync');
            }

            if (showNotifications) {
                toastUtils.showNetworkRestoredToast();
            }

            // Sync after a short delay to ensure connection is stable
            const timer = setTimeout(() => {
                syncNow();
            }, 1000);

            return () => clearTimeout(timer);
        }

        wasOfflineRef.current = !isConnected;
    }, [isConnected, syncNow, showNotifications]);

    // Auto-sync on mount if requested
    useEffect(() => {
        if (autoSyncOnMount && !hasSyncedOnMount.current && isConnected) {
            hasSyncedOnMount.current = true;

            // Sync after a short delay
            const timer = setTimeout(() => {
                const pending = offlineQueue.getPendingCount();
                if (pending > 0) {
                    if (__DEV__) {
                        console.log(`📦 Found ${pending} pending actions on mount - syncing...`);
                    }
                    syncNow();
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [autoSyncOnMount, isConnected, syncNow]);

    return {
        isSyncing,
        queue,
        pendingCount: offlineQueue.getPendingCount(),
        failedCount: offlineQueue.getFailedCount(),
        lastSync,
        lastSyncResults,
        hasPending: offlineQueue.hasPending(),
        syncNow,
        retryFailed,
        clearFailed,
        clearSynced,
        getStats,
    };
};

export default useOfflineSync;
