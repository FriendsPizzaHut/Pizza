/**
 * Performance Monitoring and Debugging Utilities
 * 
 * Provides comprehensive performance monitoring, FPS tracking,
 * memory usage analysis, and render optimization debugging
 */

import { Platform, InteractionManager } from 'react-native';
import React from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
    fps: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    renderTime: number;
    jsThreadBlocked: boolean;
    timestamp: number;
}

// Performance monitoring class
class PerformanceMonitor {
    private isMonitoring = false;
    private frameCount = 0;
    private lastFrameTime = 0;
    private fpsHistory: number[] = [];
    private renderStartTime = 0;
    private debugMode = __DEV__;

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring || !this.debugMode) return;

        this.isMonitoring = true;
        this.monitorFrameRate();
        this.monitorJSThread();

        console.log('🚀 Performance monitoring started');
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('⏹️ Performance monitoring stopped');
    }

    /**
     * Monitor frame rate using requestAnimationFrame
     */
    private monitorFrameRate() {
        if (!this.isMonitoring) return;

        const currentTime = performance.now();

        if (this.lastFrameTime > 0) {
            const frameDuration = currentTime - this.lastFrameTime;
            const fps = 1000 / frameDuration;

            this.fpsHistory.push(fps);
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }

            // Log low FPS warnings
            if (fps < 50 && this.frameCount % 60 === 0) {
                console.warn(`⚠️ Low FPS detected: ${fps.toFixed(1)} FPS`);
            }
        }

        this.lastFrameTime = currentTime;
        this.frameCount++;

        requestAnimationFrame(() => this.monitorFrameRate());
    }

    /**
     * Monitor JS thread blocking
     */
    private monitorJSThread() {
        if (!this.isMonitoring) return;

        const startTime = Date.now();

        InteractionManager.runAfterInteractions(() => {
            const endTime = Date.now();
            const delay = endTime - startTime;

            // Log if JS thread was blocked for more than 16ms (60fps threshold)
            if (delay > 16) {
                console.warn(`⚠️ JS Thread blocked for ${delay}ms`);
            }

            // Schedule next check
            setTimeout(() => this.monitorJSThread(), 1000);
        });
    }

    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics {
        const avgFps = this.fpsHistory.length > 0
            ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
            : 60;

        return {
            fps: Math.round(avgFps),
            memory: this.getMemoryUsage(),
            renderTime: performance.now() - this.renderStartTime,
            jsThreadBlocked: avgFps < 55,
            timestamp: Date.now()
        };
    }

    /**
     * Get memory usage (platform specific)
     */
    private getMemoryUsage() {
        if (Platform.OS === 'web' && (performance as any).memory) {
            const memory = (performance as any).memory;
            return {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
            };
        }

        // Fallback for mobile platforms
        return {
            used: 0,
            total: 0,
            percentage: 0
        };
    }

    /**
     * Mark render start time
     */
    markRenderStart() {
        this.renderStartTime = performance.now();
    }

    /**
     * Mark render end time and log if slow
     */
    markRenderEnd(componentName: string) {
        const renderTime = performance.now() - this.renderStartTime;

        if (renderTime > 16) {
            console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
    }

    /**
     * Profile a function execution time
     */
    profile<T>(functionName: string, fn: () => T): T {
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        if (executionTime > 5) {
            console.log(`⏱️ ${functionName}: ${executionTime.toFixed(2)}ms`);
        }

        return result;
    }

    /**
     * Profile async function execution time
     */
    async profileAsync<T>(functionName: string, fn: () => Promise<T>): Promise<T> {
        const startTime = performance.now();
        const result = await fn();
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        if (executionTime > 10) {
            console.log(`⏱️ ${functionName} (async): ${executionTime.toFixed(2)}ms`);
        }

        return result;
    }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance profiling decorator for class methods
 */
export function profileMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        return performanceMonitor.profile(`${target.constructor.name}.${propertyName}`, () => {
            return method.apply(this, args);
        });
    };
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Batch updates utility for React state updates
 */
export function batchUpdates(updates: (() => void)[]): void {
    // Use React's unstable_batchedUpdates if available
    if (typeof (React as any)?.unstable_batchedUpdates === 'function') {
        (React as any).unstable_batchedUpdates(() => {
            updates.forEach(update => update());
        });
    } else {
        // Fallback to setTimeout batching
        setTimeout(() => {
            updates.forEach(update => update());
        }, 0);
    }
}

/**
 * Memory leak detection utility
 */
export class MemoryLeakDetector {
    private static instances = new Map<string, number>();

    static track(componentName: string) {
        const count = this.instances.get(componentName) || 0;
        this.instances.set(componentName, count + 1);

        if (count > 50) {
            console.warn(`🚨 Possible memory leak in ${componentName}: ${count} instances`);
        }
    }

    static untrack(componentName: string) {
        const count = this.instances.get(componentName) || 0;
        if (count > 0) {
            this.instances.set(componentName, count - 1);
        }
    }

    static getReport(): Record<string, number> {
        return Object.fromEntries(this.instances);
    }
}

/**
 * Bundle size analyzer utility
 */
export function analyzeBundleSize() {
    if (__DEV__ && typeof window !== 'undefined') {
        const scripts = Array.from(document.scripts);
        const totalSize = scripts.reduce((total, script) => {
            if (script.src) {
                // This is a rough estimation
                return total + (script.innerHTML?.length || 0);
            }
            return total;
        }, 0);

        console.log(`📦 Estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    }
}

/**
 * Render optimization utilities
 */
export const RenderUtils = {
    /**
     * Check if re-render is necessary for object props
     */
    shallowEqual(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    },

    /**
     * Deep comparison for complex objects (use sparingly)
     */
    deepEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true;

        if (obj1 == null || obj2 == null) return false;

        if (typeof obj1 !== typeof obj2) return false;

        if (typeof obj1 !== 'object') return obj1 === obj2;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!this.deepEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    }
};

/**
 * Initialize performance monitoring in development
 */
export function initializePerformanceMonitoring() {
    if (__DEV__) {
        performanceMonitor.startMonitoring();

        // Log performance metrics every 10 seconds
        setInterval(() => {
            const metrics = performanceMonitor.getCurrentMetrics();
            console.log('📊 Performance Metrics:', {
                fps: `${metrics.fps} FPS`,
                memory: `${metrics.memory.used}MB (${metrics.memory.percentage}%)`,
                jsBlocked: metrics.jsThreadBlocked ? '🔴' : '🟢'
            });
        }, 10000);

        // Log memory leak detection report every 30 seconds
        setInterval(() => {
            const report = MemoryLeakDetector.getReport();
            const leaks = Object.entries(report).filter(([, count]) => count > 10);

            if (leaks.length > 0) {
                console.warn('🚨 Potential memory leaks detected:', leaks);
            }
        }, 30000);
    }
}