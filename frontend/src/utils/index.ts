/**
 * Utilities Index
 * 
 * Central export point for all utility functions.
 */

export * from './dateFormatter';
export * from './calculations';
export * from './validators';
export * from './toast';

// Offline Queue - exported directly to avoid conflicts
export { offlineQueue, enqueueAction, dequeueAction, retryAllActions, processQueue, getQueue, clearQueue, subscribeToQueue } from './offlineQueue';
export type { QueuedAction, EnqueueOptions, SyncResult, OperationType, HttpMethod, QueueItemStatus } from './offlineQueue';

// Optimistic Updates - exported directly to avoid conflicts
export { OptimisticManager, PendingStatus } from './optimisticUpdates';
export type { OptimisticItem } from './optimisticUpdates';
export * as optimisticUtils from './optimisticUpdates';

// Example usage:
// import { formatDate, calculateCartTotal, isValidEmail } from '@/utils';
