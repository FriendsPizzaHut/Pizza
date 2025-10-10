/**
 * Optimistic Update Utilities
 * 
 * Provides utilities for handling optimistic UI updates with temporary IDs,
 * rollback on failure, and automatic ID replacement after successful sync.
 * 
 * @module optimisticUpdates
 * @implements Prompt 4 - UI Optimistic Updates
 */

/**
 * Generate a temporary ID for optimistic creates
 * Format: temp_timestamp_random
 */
export const generateTempId = (): string => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if an ID is a temporary ID
 */
export const isTempId = (id: string): boolean => {
    return typeof id === 'string' && id.startsWith('temp_');
};

/**
 * Pending status indicator for optimistic updates
 */
export enum PendingStatus {
    /** No pending operation */
    NONE = 'none',

    /** Item is being created */
    CREATING = 'creating',

    /** Item is being updated */
    UPDATING = 'updating',

    /** Item is being deleted */
    DELETING = 'deleting',

    /** Operation failed */
    FAILED = 'failed',

    /** Operation succeeded */
    SUCCESS = 'success',
}

/**
 * Enhanced item type with optimistic update metadata
 */
export interface OptimisticItem<T = any> {
    /** The actual item data */
    data: T;

    /** Pending operation status */
    pendingStatus: PendingStatus;

    /** Temporary ID (for CREATE operations) */
    tempId?: string;

    /** Server-assigned ID (after sync) */
    serverId?: string;

    /** Error message if operation failed */
    error?: string;

    /** Timestamp of last update */
    lastUpdated: number;

    /** Queue action ID for tracking */
    queueId?: string;
}

/**
 * Wrap an item with optimistic metadata
 */
export const wrapOptimistic = <T>(
    data: T,
    status: PendingStatus = PendingStatus.NONE,
    options?: {
        tempId?: string;
        serverId?: string;
        error?: string;
        queueId?: string;
    }
): OptimisticItem<T> => {
    return {
        data,
        pendingStatus: status,
        tempId: options?.tempId,
        serverId: options?.serverId,
        error: options?.error,
        lastUpdated: Date.now(),
        queueId: options?.queueId,
    };
};

/**
 * Unwrap optimistic item to get the data
 */
export const unwrapOptimistic = <T>(item: OptimisticItem<T>): T => {
    return item.data;
};

/**
 * Check if an optimistic item is pending
 */
export const isPending = (item: OptimisticItem): boolean => {
    return [
        PendingStatus.CREATING,
        PendingStatus.UPDATING,
        PendingStatus.DELETING,
    ].includes(item.pendingStatus);
};

/**
 * Check if an optimistic item has failed
 */
export const hasFailed = (item: OptimisticItem): boolean => {
    return item.pendingStatus === PendingStatus.FAILED;
};

/**
 * Check if an optimistic item is synced
 */
export const isSynced = (item: OptimisticItem): boolean => {
    return item.pendingStatus === PendingStatus.SUCCESS || item.pendingStatus === PendingStatus.NONE;
};

/**
 * Mark an optimistic item as pending create
 */
export const markAsCreating = <T>(
    item: OptimisticItem<T>,
    tempId?: string,
    queueId?: string
): OptimisticItem<T> => {
    return {
        ...item,
        pendingStatus: PendingStatus.CREATING,
        tempId: tempId || item.tempId || generateTempId(),
        queueId: queueId || item.queueId,
        lastUpdated: Date.now(),
        error: undefined,
    };
};

/**
 * Mark an optimistic item as pending update
 */
export const markAsUpdating = <T>(
    item: OptimisticItem<T>,
    queueId?: string
): OptimisticItem<T> => {
    return {
        ...item,
        pendingStatus: PendingStatus.UPDATING,
        queueId: queueId || item.queueId,
        lastUpdated: Date.now(),
        error: undefined,
    };
};

/**
 * Mark an optimistic item as pending delete
 */
export const markAsDeleting = <T>(
    item: OptimisticItem<T>,
    queueId?: string
): OptimisticItem<T> => {
    return {
        ...item,
        pendingStatus: PendingStatus.DELETING,
        queueId: queueId || item.queueId,
        lastUpdated: Date.now(),
        error: undefined,
    };
};

/**
 * Mark an optimistic item as successfully synced
 */
export const markAsSynced = <T>(
    item: OptimisticItem<T>,
    serverId?: string
): OptimisticItem<T> => {
    return {
        ...item,
        pendingStatus: PendingStatus.SUCCESS,
        serverId: serverId || item.serverId,
        lastUpdated: Date.now(),
        error: undefined,
        queueId: undefined,
    };
};

/**
 * Mark an optimistic item as failed
 */
export const markAsFailed = <T>(
    item: OptimisticItem<T>,
    error: string
): OptimisticItem<T> => {
    return {
        ...item,
        pendingStatus: PendingStatus.FAILED,
        error,
        lastUpdated: Date.now(),
    };
};

/**
 * Replace temporary ID with server ID in an optimistic item
 */
export const replaceTempId = <T extends { id?: string }>(
    item: OptimisticItem<T>,
    serverId: string
): OptimisticItem<T> => {
    return {
        ...item,
        data: {
            ...item.data,
            id: serverId,
        },
        serverId,
        tempId: item.tempId,
        pendingStatus: PendingStatus.SUCCESS,
        lastUpdated: Date.now(),
    };
};

/**
 * Merge server response with optimistic item
 */
export const mergeWithServerData = <T>(
    item: OptimisticItem<T>,
    serverData: T
): OptimisticItem<T> => {
    return {
        ...item,
        data: serverData,
        pendingStatus: PendingStatus.SUCCESS,
        lastUpdated: Date.now(),
        error: undefined,
        queueId: undefined,
    };
};

/**
 * Find item by temp ID in an array of optimistic items
 */
export const findByTempId = <T>(
    items: OptimisticItem<T>[],
    tempId: string
): OptimisticItem<T> | undefined => {
    return items.find(item => item.tempId === tempId);
};

/**
 * Find item by server ID in an array of optimistic items
 */
export const findByServerId = <T>(
    items: OptimisticItem<T>[],
    serverId: string
): OptimisticItem<T> | undefined => {
    return items.find(item => item.serverId === serverId);
};

/**
 * Find item by queue ID in an array of optimistic items
 */
export const findByQueueId = <T>(
    items: OptimisticItem<T>[],
    queueId: string
): OptimisticItem<T> | undefined => {
    return items.find(item => item.queueId === queueId);
};

/**
 * Filter out items marked for deletion
 */
export const filterDeleted = <T>(
    items: OptimisticItem<T>[]
): OptimisticItem<T>[] => {
    return items.filter(item => item.pendingStatus !== PendingStatus.DELETING);
};

/**
 * Sort items by pending status (pending items last)
 */
export const sortByPendingStatus = <T>(
    items: OptimisticItem<T>[]
): OptimisticItem<T>[] => {
    return [...items].sort((a, b) => {
        const aPending = isPending(a) ? 1 : 0;
        const bPending = isPending(b) ? 1 : 0;
        return aPending - bPending;
    });
};

/**
 * Get pending count from an array of optimistic items
 */
export const getPendingCount = <T>(items: OptimisticItem<T>[]): number => {
    return items.filter(isPending).length;
};

/**
 * Get failed count from an array of optimistic items
 */
export const getFailedCount = <T>(items: OptimisticItem<T>[]): number => {
    return items.filter(hasFailed).length;
};

/**
 * Optimistic Update Manager
 * Helper class for managing collections of optimistic items
 */
export class OptimisticManager<T extends { id?: string }> {
    private items: OptimisticItem<T>[] = [];

    constructor(initialItems: T[] = []) {
        this.items = initialItems.map(item => wrapOptimistic(item));
    }

    /**
     * Get all items
     */
    getAll(): OptimisticItem<T>[] {
        return [...this.items];
    }

    /**
     * Get all data (unwrapped)
     */
    getAllData(): T[] {
        return this.items.map(unwrapOptimistic);
    }

    /**
     * Add item optimistically (for CREATE)
     */
    addOptimistic(data: T, queueId?: string): string {
        const tempId = generateTempId();
        const item = wrapOptimistic(
            { ...data, id: tempId } as T,
            PendingStatus.CREATING,
            { tempId, queueId }
        );
        this.items.unshift(item); // Add to beginning
        return tempId;
    }

    /**
     * Update item optimistically (for UPDATE)
     */
    updateOptimistic(id: string, updates: Partial<T>, queueId?: string): boolean {
        const index = this.items.findIndex(
            item => item.data.id === id || item.tempId === id
        );

        if (index !== -1) {
            this.items[index] = markAsUpdating({
                ...this.items[index],
                data: { ...this.items[index].data, ...updates },
            }, queueId);
            return true;
        }

        return false;
    }

    /**
     * Delete item optimistically (for DELETE)
     */
    deleteOptimistic(id: string, queueId?: string): boolean {
        const index = this.items.findIndex(
            item => item.data.id === id || item.tempId === id
        );

        if (index !== -1) {
            this.items[index] = markAsDeleting(this.items[index], queueId);
            return true;
        }

        return false;
    }

    /**
     * Confirm sync success and replace temp ID with server ID
     */
    confirmSync(tempId: string, serverId: string, serverData?: T): boolean {
        const index = this.items.findIndex(item => item.tempId === tempId);

        if (index !== -1) {
            if (serverData) {
                this.items[index] = mergeWithServerData(this.items[index], serverData);
            } else {
                this.items[index] = replaceTempId(this.items[index], serverId);
            }
            return true;
        }

        return false;
    }

    /**
     * Mark item as failed
     */
    markFailed(id: string, error: string): boolean {
        const index = this.items.findIndex(
            item => item.data.id === id || item.tempId === id || item.queueId === id
        );

        if (index !== -1) {
            this.items[index] = markAsFailed(this.items[index], error);
            return true;
        }

        return false;
    }

    /**
     * Remove item completely
     */
    remove(id: string): boolean {
        const initialLength = this.items.length;
        this.items = this.items.filter(
            item => item.data.id !== id && item.tempId !== id && item.queueId !== id
        );
        return this.items.length < initialLength;
    }

    /**
     * Clean up synced and deleted items
     */
    cleanup(): void {
        this.items = this.items.filter(
            item =>
                item.pendingStatus !== PendingStatus.SUCCESS &&
                item.pendingStatus !== PendingStatus.DELETING
        );
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            total: this.items.length,
            pending: getPendingCount(this.items),
            failed: getFailedCount(this.items),
            synced: this.items.filter(isSynced).length,
        };
    }
}

export default {
    generateTempId,
    isTempId,
    wrapOptimistic,
    unwrapOptimistic,
    isPending,
    hasFailed,
    isSynced,
    markAsCreating,
    markAsUpdating,
    markAsDeleting,
    markAsSynced,
    markAsFailed,
    replaceTempId,
    mergeWithServerData,
    OptimisticManager,
};
