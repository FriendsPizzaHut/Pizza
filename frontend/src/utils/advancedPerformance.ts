/**
 * Advanced Performance Utilities Collection
 * 
 * Comprehensive set of utilities for debouncing, batching,
 * error handling, retry mechanisms, and smooth UX
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { InteractionManager, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced debounce with immediate option and cancellation
export function createAdvancedDebounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options: {
        immediate?: boolean;
        maxWait?: number;
        leading?: boolean;
        trailing?: boolean;
    } = {}
): T & { cancel: () => void; flush: () => void; pending: () => boolean } {
    const {
        immediate = false,
        maxWait,
        leading = false,
        trailing = true
    } = options;

    let timeoutId: NodeJS.Timeout | null = null;
    let maxTimeoutId: NodeJS.Timeout | null = null;
    let lastCallTime = 0;
    let lastInvokeTime = 0;
    let lastArgs: Parameters<T> | undefined;
    let result: ReturnType<T>;

    function invokeFunc(): ReturnType<T> {
        const args = lastArgs!;
        lastArgs = undefined;
        lastInvokeTime = Date.now();
        result = func.apply(null, args);
        return result;
    }

    function leadingEdge(): ReturnType<T> {
        lastInvokeTime = Date.now();
        timeoutId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc() : result;
    }

    function remainingWait(time: number): number {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;

        return maxWait !== undefined
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    }

    function shouldInvoke(time: number): boolean {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;

        return (
            lastCallTime === 0 ||
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
        );
    }

    function timerExpired(): ReturnType<T> | undefined {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timeoutId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time: number): ReturnType<T> {
        timeoutId = null;

        if (trailing && lastArgs) {
            return invokeFunc();
        }
        lastArgs = undefined;
        return result;
    }

    function cancel() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        if (maxTimeoutId !== null) {
            clearTimeout(maxTimeoutId);
        }
        lastInvokeTime = 0;
        lastCallTime = 0;
        lastArgs = undefined;
        timeoutId = null;
        maxTimeoutId = null;
    }

    function flush(): ReturnType<T> {
        return timeoutId === null ? result : trailingEdge(Date.now());
    }

    function pending(): boolean {
        return timeoutId !== null;
    }

    function debounced(...args: Parameters<T>): ReturnType<T> {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastArgs = args;
        lastCallTime = time;

        if (isInvoking) {
            if (timeoutId === null) {
                return leadingEdge();
            }
            if (maxWait !== undefined) {
                timeoutId = setTimeout(timerExpired, wait);
                maxTimeoutId = setTimeout(timerExpired, maxWait);
                return leading ? invokeFunc() : result;
            }
        }
        if (timeoutId === null) {
            timeoutId = setTimeout(timerExpired, wait);
        }
        return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = pending;

    return debounced as unknown as T & { cancel: () => void; flush: () => void; pending: () => boolean };
}

// Smart retry mechanism with exponential backoff
export interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    jitter?: boolean;
    retryCondition?: (error: any, attempt: number) => boolean;
    onRetry?: (error: any, attempt: number) => void;
}

export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        baseDelay = 1000,
        maxDelay = 30000,
        backoffFactor = 2,
        jitter = true,
        retryCondition = () => true,
        onRetry
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts || !retryCondition(error, attempt)) {
                throw error;
            }

            const delay = Math.min(
                baseDelay * Math.pow(backoffFactor, attempt - 1),
                maxDelay
            );

            const finalDelay = jitter
                ? delay + Math.random() * delay * 0.1
                : delay;

            onRetry?.(error, attempt);

            await new Promise(resolve => setTimeout(resolve, finalDelay));
        }
    }

    throw lastError;
}

// Intelligent batching system
export class BatchProcessor<T, R> {
    private batch: T[] = [];
    private timer: NodeJS.Timeout | null = null;
    private readonly processor: (items: T[]) => Promise<R[]> | R[];
    private readonly batchSize: number;
    private readonly batchDelay: number;
    private readonly onBatchComplete?: (results: R[], items: T[]) => void;
    private readonly onError?: (error: Error, items: T[]) => void;

    constructor(options: {
        processor: (items: T[]) => Promise<R[]> | R[];
        batchSize?: number;
        batchDelay?: number;
        onBatchComplete?: (results: R[], items: T[]) => void;
        onError?: (error: Error, items: T[]) => void;
    }) {
        this.processor = options.processor;
        this.batchSize = options.batchSize || 10;
        this.batchDelay = options.batchDelay || 100;
        this.onBatchComplete = options.onBatchComplete;
        this.onError = options.onError;
    }

    add(item: T): void {
        this.batch.push(item);

        if (this.batch.length >= this.batchSize) {
            this.processBatch();
        } else {
            this.scheduleBatch();
        }
    }

    addMany(items: T[]): void {
        this.batch.push(...items);

        if (this.batch.length >= this.batchSize) {
            this.processBatch();
        } else {
            this.scheduleBatch();
        }
    }

    flush(): void {
        if (this.batch.length > 0) {
            this.processBatch();
        }
    }

    private scheduleBatch(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.processBatch();
        }, this.batchDelay);
    }

    private async processBatch(): Promise<void> {
        if (this.batch.length === 0) return;

        const itemsToProcess = [...this.batch];
        this.batch = [];

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        try {
            const results = await this.processor(itemsToProcess);
            this.onBatchComplete?.(results, itemsToProcess);
        } catch (error) {
            this.onError?.(error as Error, itemsToProcess);
        }
    }

    clear(): void {
        this.batch = [];
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    getPendingCount(): number {
        return this.batch.length;
    }
}

// Circuit breaker pattern for error resilience
export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';

    constructor(
        private threshold: number = 5,
        private timeout: number = 60000,
        private onStateChange?: (state: string) => void
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime >= this.timeout) {
                this.state = 'half-open';
                this.onStateChange?.('half-open');
            } else {
                throw new Error('Circuit breaker is open');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = 'closed';
        this.onStateChange?.('closed');
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'open';
            this.onStateChange?.('open');
        }
    }

    getState(): string {
        return this.state;
    }

    reset(): void {
        this.failures = 0;
        this.state = 'closed';
        this.lastFailureTime = 0;
        this.onStateChange?.('closed');
    }
}

// Performance-aware data cache
export class PerformanceCache<T> {
    private cache = new Map<string, { data: T; timestamp: number; hits: number }>();
    private maxSize: number;
    private ttl: number;

    constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    set(key: string, data: T): void {
        // Remove expired entries
        this.cleanup();

        // Remove least recently used if at capacity
        if (this.cache.size >= this.maxSize) {
            const lruKey = this.findLRU();
            if (lruKey) {
                this.cache.delete(lruKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            hits: 0
        });
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Update hit count and timestamp for LRU
        entry.hits++;
        entry.timestamp = Date.now();

        return entry.data;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }

    private findLRU(): string | null {
        let lruKey: string | null = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                lruKey = key;
            }
        }

        return lruKey;
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl,
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                hits: entry.hits,
                age: Date.now() - entry.timestamp
            }))
        };
    }
}

// React hooks for performance utilities
export const useAdvancedDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    options?: {
        immediate?: boolean;
        maxWait?: number;
        leading?: boolean;
        trailing?: boolean;
    }
) => {
    const debouncedCallback = useRef<T & { cancel: () => void; flush: () => void; pending: () => boolean } | null>(null);

    useEffect(() => {
        debouncedCallback.current = createAdvancedDebounce(callback, delay, options);

        return () => {
            debouncedCallback.current?.cancel();
        };
    }, [callback, delay, options]);

    return debouncedCallback.current!;
};

export const useBatchProcessor = <T, R>(
    processor: (items: T[]) => Promise<R[]> | R[],
    options?: {
        batchSize?: number;
        batchDelay?: number;
        onBatchComplete?: (results: R[], items: T[]) => void;
        onError?: (error: Error, items: T[]) => void;
    }
) => {
    const batchProcessorRef = useRef<BatchProcessor<T, R> | null>(null);

    useEffect(() => {
        batchProcessorRef.current = new BatchProcessor({
            processor,
            ...options
        });

        return () => {
            batchProcessorRef.current?.clear();
        };
    }, [processor, options]);

    return {
        add: (item: T) => batchProcessorRef.current?.add(item),
        addMany: (items: T[]) => batchProcessorRef.current?.addMany(items),
        flush: () => batchProcessorRef.current?.flush(),
        getPendingCount: () => batchProcessorRef.current?.getPendingCount() || 0
    };
};

export const useCircuitBreaker = (
    threshold = 5,
    timeout = 60000
) => {
    const circuitBreakerRef = useRef<CircuitBreaker | null>(null);
    const [state, setState] = useState<string>('closed');

    useEffect(() => {
        circuitBreakerRef.current = new CircuitBreaker(
            threshold,
            timeout,
            setState
        );
    }, [threshold, timeout]);

    const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
        if (!circuitBreakerRef.current) {
            throw new Error('Circuit breaker not initialized');
        }
        return circuitBreakerRef.current.execute(operation);
    }, []);

    const reset = useCallback(() => {
        circuitBreakerRef.current?.reset();
    }, []);

    return { execute, reset, state };
};

export const usePerformanceCache = <T>(maxSize = 100, ttl = 300000) => {
    const cacheRef = useRef<PerformanceCache<T> | null>(null);

    useEffect(() => {
        cacheRef.current = new PerformanceCache<T>(maxSize, ttl);
    }, [maxSize, ttl]);

    return {
        set: (key: string, data: T) => cacheRef.current?.set(key, data),
        get: (key: string) => cacheRef.current?.get(key) || null,
        has: (key: string) => cacheRef.current?.has(key) || false,
        delete: (key: string) => cacheRef.current?.delete(key) || false,
        clear: () => cacheRef.current?.clear(),
        getStats: () => cacheRef.current?.getStats()
    };
};

// App state optimization hook
export const useAppStateOptimization = () => {
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const isBackground = appState === 'background';
    const isInactive = appState === 'inactive';
    const isActive = appState === 'active';

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
    }, []);

    return {
        appState,
        isBackground,
        isInactive,
        isActive,
        shouldReduceActivity: isBackground || isInactive
    };
};

export default {
    createAdvancedDebounce,
    retryWithBackoff,
    BatchProcessor,
    CircuitBreaker,
    PerformanceCache,
    useAdvancedDebounce,
    useBatchProcessor,
    useCircuitBreaker,
    usePerformanceCache,
    useAppStateOptimization
};