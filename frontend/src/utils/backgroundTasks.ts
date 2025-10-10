/**
 * Background Task Optimization System
 * 
 * Moves heavy computations off UI thread using InteractionManager,
 * Web Workers simulation, and intelligent task scheduling
 */

import React from 'react';
import { InteractionManager, Platform } from 'react-native';
import { performanceMonitor, throttle, debounce } from '../utils/performance';

// Task priority levels
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

// Task status
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Background task interface
export interface BackgroundTask<T = any> {
    id: string;
    name: string;
    priority: TaskPriority;
    status: TaskStatus;
    data: any;
    processor: (data: any) => Promise<T> | T;
    timeout?: number;
    retries?: number;
    onProgress?: (progress: number) => void;
    onComplete?: (result: T) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
}

// Task scheduler for managing background operations
class BackgroundTaskScheduler {
    private static instance: BackgroundTaskScheduler;
    private tasks = new Map<string, BackgroundTask>();
    private runningTasks = new Set<string>();
    private maxConcurrentTasks = Platform.OS === 'ios' ? 3 : 2; // iOS handles more concurrent tasks better
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;

    static getInstance(): BackgroundTaskScheduler {
        if (!BackgroundTaskScheduler.instance) {
            BackgroundTaskScheduler.instance = new BackgroundTaskScheduler();
        }
        return BackgroundTaskScheduler.instance;
    }

    constructor() {
        this.startProcessor();
    }

    /**
     * Schedule a background task
     */
    scheduleTask<T>(task: Omit<BackgroundTask<T>, 'id' | 'status' | 'createdAt'>): string {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const backgroundTask: BackgroundTask<T> = {
            id: taskId,
            status: 'pending',
            createdAt: Date.now(),
            retries: 3,
            timeout: 30000,
            ...task,
        };

        this.tasks.set(taskId, backgroundTask);

        if (__DEV__) {
            console.log(`📝 Scheduled background task: ${task.name} (${taskId})`);
        }

        return taskId;
    }

    /**
     * Cancel a background task
     */
    cancelTask(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task) return false;

        if (task.status === 'running') {
            task.status = 'cancelled';
            task.onCancel?.();
            this.runningTasks.delete(taskId);
        } else if (task.status === 'pending') {
            task.status = 'cancelled';
            task.onCancel?.();
        }

        this.tasks.delete(taskId);

        if (__DEV__) {
            console.log(`❌ Cancelled background task: ${task.name} (${taskId})`);
        }

        return true;
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId: string): TaskStatus | null {
        return this.tasks.get(taskId)?.status || null;
    }

    /**
     * Get all tasks by status
     */
    getTasksByStatus(status: TaskStatus): BackgroundTask[] {
        return Array.from(this.tasks.values()).filter(task => task.status === status);
    }

    /**
     * Start the task processor
     */
    private startProcessor() {
        if (this.processingInterval) return;

        this.processingInterval = setInterval(() => {
            this.processTasks();
        }, 100); // Check for tasks every 100ms
    }

    /**
     * Process pending tasks based on priority and concurrency limits
     */
    private async processTasks() {
        if (this.isProcessing) return;
        if (this.runningTasks.size >= this.maxConcurrentTasks) return;

        const pendingTasks = this.getTasksByStatus('pending')
            .sort((a, b) => {
                // Sort by priority first, then by creation time
                const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return a.createdAt - b.createdAt;
            });

        const tasksToRun = pendingTasks.slice(0, this.maxConcurrentTasks - this.runningTasks.size);

        for (const task of tasksToRun) {
            this.executeTask(task);
        }
    }

    /**
     * Execute a background task
     */
    private async executeTask<T>(task: BackgroundTask<T>) {
        if (task.status !== 'pending') return;

        task.status = 'running';
        task.startedAt = Date.now();
        this.runningTasks.add(task.id);

        if (__DEV__) {
            console.log(`🚀 Starting background task: ${task.name} (${task.id})`);
        }

        try {
            // Wait for interactions to complete before starting heavy computation
            await new Promise<void>(resolve => {
                InteractionManager.runAfterInteractions(resolve);
            });

            // Execute task with timeout
            const result = await this.executeWithTimeout(task);

            // Task completed successfully
            task.status = 'completed';
            task.completedAt = Date.now();
            task.onComplete?.(result);

            if (__DEV__) {
                const duration = task.completedAt - task.startedAt!;
                console.log(`✅ Completed background task: ${task.name} in ${duration}ms`);
            }

        } catch (error) {
            console.error(`❌ Background task failed: ${task.name}`, error);

            // Retry logic
            if (task.retries && task.retries > 0) {
                task.retries--;
                task.status = 'pending';
                task.startedAt = undefined;

                if (__DEV__) {
                    console.log(`🔄 Retrying background task: ${task.name} (${task.retries} retries left)`);
                }
            } else {
                task.status = 'failed';
                task.completedAt = Date.now();
                task.onError?.(error as Error);
            }
        } finally {
            this.runningTasks.delete(task.id);

            // Clean up completed/failed tasks after some time
            if (task.status === 'completed' || task.status === 'failed') {
                setTimeout(() => {
                    this.tasks.delete(task.id);
                }, 60000); // Clean up after 1 minute
            }
        }
    }

    /**
     * Execute task with timeout
     */
    private async executeWithTimeout<T>(task: BackgroundTask<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Task timeout: ${task.name}`));
            }, task.timeout || 30000);

            try {
                const result = task.processor(task.data);

                if (result instanceof Promise) {
                    result
                        .then(resolve)
                        .catch(reject)
                        .finally(() => clearTimeout(timeoutId));
                } else {
                    clearTimeout(timeoutId);
                    resolve(result);
                }
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Get scheduler statistics
     */
    getStats() {
        const tasks = Array.from(this.tasks.values());
        return {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            running: tasks.filter(t => t.status === 'running').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            failed: tasks.filter(t => t.status === 'failed').length,
            cancelled: tasks.filter(t => t.status === 'cancelled').length,
            runningTaskIds: Array.from(this.runningTasks),
        };
    }

    /**
     * Clear all completed and failed tasks
     */
    cleanup() {
        const toDelete = Array.from(this.tasks.entries())
            .filter(([, task]) => task.status === 'completed' || task.status === 'failed')
            .map(([id]) => id);

        toDelete.forEach(id => this.tasks.delete(id));

        if (__DEV__) {
            console.log(`🧹 Cleaned up ${toDelete.length} completed/failed tasks`);
        }
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
}

// High-level API for common background tasks
export class BackgroundTaskManager {
    private scheduler = BackgroundTaskScheduler.getInstance();

    /**
     * Process large JSON data in background
     */
    processLargeJSON<T>(
        data: any,
        processor: (data: any) => T,
        options: {
            priority?: TaskPriority;
            onProgress?: (progress: number) => void;
            onComplete?: (result: T) => void;
            onError?: (error: Error) => void;
        } = {}
    ): string {
        return this.scheduler.scheduleTask({
            name: 'JSON Processing',
            priority: options.priority || 'normal',
            data,
            processor: (jsonData) => {
                performanceMonitor.markRenderStart();
                try {
                    const result = processor(jsonData);
                    performanceMonitor.markRenderEnd('JSON Processing');
                    return result;
                } catch (error) {
                    performanceMonitor.markRenderEnd('JSON Processing');
                    throw error;
                }
            },
            onProgress: options.onProgress,
            onComplete: options.onComplete,
            onError: options.onError,
        });
    }

    /**
     * Calculate complex data transformations
     */
    calculateData<T>(
        data: any,
        calculator: (data: any) => T,
        options: {
            priority?: TaskPriority;
            timeout?: number;
            onComplete?: (result: T) => void;
            onError?: (error: Error) => void;
        } = {}
    ): string {
        return this.scheduler.scheduleTask({
            name: 'Data Calculation',
            priority: options.priority || 'normal',
            timeout: options.timeout || 15000,
            data,
            processor: calculator,
            onComplete: options.onComplete,
            onError: options.onError,
        });
    }

    /**
     * Process images in background
     */
    processImages(
        images: string[],
        processor: (images: string[]) => any,
        options: {
            priority?: TaskPriority;
            onProgress?: (progress: number) => void;
            onComplete?: (result: any) => void;
            onError?: (error: Error) => void;
        } = {}
    ): string {
        return this.scheduler.scheduleTask({
            name: 'Image Processing',
            priority: options.priority || 'low',
            timeout: 60000, // Longer timeout for image processing
            data: images,
            processor: async (imageList) => {
                const total = imageList.length;
                const results = [];

                for (let i = 0; i < total; i++) {
                    const result = await processor([imageList[i]]);
                    results.push(result);

                    // Report progress
                    const progress = ((i + 1) / total) * 100;
                    options.onProgress?.(progress);

                    // Yield control periodically
                    if (i % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                }

                return results;
            },
            onComplete: options.onComplete,
            onError: options.onError,
        });
    }

    /**
     * Sync data in background
     */
    syncData<T>(
        syncFunction: () => Promise<T> | T,
        options: {
            priority?: TaskPriority;
            retries?: number;
            onComplete?: (result: T) => void;
            onError?: (error: Error) => void;
        } = {}
    ): string {
        return this.scheduler.scheduleTask({
            name: 'Data Sync',
            priority: options.priority || 'high',
            retries: options.retries || 3,
            timeout: 30000,
            data: null,
            processor: syncFunction,
            onComplete: options.onComplete,
            onError: options.onError,
        });
    }

    /**
     * Cancel a task
     */
    cancelTask(taskId: string): boolean {
        return this.scheduler.cancelTask(taskId);
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId: string): TaskStatus | null {
        return this.scheduler.getTaskStatus(taskId);
    }

    /**
     * Get scheduler statistics
     */
    getStats() {
        return this.scheduler.getStats();
    }

    /**
     * Schedule a generic background task
     */
    scheduleTask<T>(config: {
        name: string;
        priority: TaskPriority;
        data: any;
        processor: (data: any) => T | Promise<T>;
        onComplete?: (result: T) => void;
        onError?: (error: Error) => void;
    }): string {
        return this.scheduler.scheduleTask(config);
    }

    /**
     * Cleanup completed tasks
     */
    cleanup() {
        this.scheduler.cleanup();
    }
}

// Optimized data processing utilities
export const DataProcessor = {
    /**
     * Chunk large arrays for processing
     */
    chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    },

    /**
     * Process array in chunks with yielding
     */
    async processArrayInChunks<T, R>(
        array: T[],
        processor: (chunk: T[]) => R[],
        options: {
            chunkSize?: number;
            yieldInterval?: number;
            onProgress?: (progress: number) => void;
        } = {}
    ): Promise<R[]> {
        const { chunkSize = 10, yieldInterval = 5, onProgress } = options;
        const chunks = this.chunkArray(array, chunkSize);
        const results: R[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunkResults = processor(chunks[i]);
            results.push(...chunkResults);

            // Report progress
            const progress = ((i + 1) / chunks.length) * 100;
            onProgress?.(progress);

            // Yield control periodically
            if (i % yieldInterval === 0) {
                await new Promise(resolve => {
                    InteractionManager.runAfterInteractions(() => resolve(undefined));
                });
            }
        }

        return results;
    },

    /**
     * Debounced data processor
     */
    createDebouncedProcessor<T, R>(
        processor: (data: T) => R,
        delay: number
    ): (data: T) => void {
        return debounce(processor, delay);
    },

    /**
     * Throttled data processor
     */
    createThrottledProcessor<T, R>(
        processor: (data: T) => R,
        interval: number
    ): (data: T) => void {
        return throttle(processor, interval);
    },
};

// Global background task manager instance
export const backgroundTaskManager = new BackgroundTaskManager();

// React hooks for background tasks
export const useBackgroundTask = () => {
    const scheduleTask = React.useCallback(<T>(
        processor: (data: any) => T | Promise<T>,
        data: any,
        options: {
            name?: string;
            priority?: TaskPriority;
            onComplete?: (result: T) => void;
            onError?: (error: Error) => void;
        } = {}
    ) => {
        return backgroundTaskManager.scheduleTask({
            name: options.name || 'Background Task',
            priority: options.priority || 'normal',
            data,
            processor,
            onComplete: options.onComplete,
            onError: options.onError,
        });
    }, []);

    const cancelTask = React.useCallback((taskId: string) => {
        return backgroundTaskManager.cancelTask(taskId);
    }, []);

    const getStats = React.useCallback(() => {
        return backgroundTaskManager.getStats();
    }, []);

    return {
        scheduleTask,
        cancelTask,
        getStats,
    };
};

export default BackgroundTaskManager;