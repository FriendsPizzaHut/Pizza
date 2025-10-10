/**
 * Ultra-High Performance List Components
 * 
 * Advanced FlatList components optimized for 60+ FPS rendering,
 * memory efficiency, and smooth animations
 */

import React, { useCallback, useMemo, memo, useRef, useEffect, useState } from 'react';
import {
    FlatList,
    FlatListProps,
    View,
    StyleSheet,
    Text,
    RefreshControl,
    Dimensions,
    InteractionManager,
    ViewabilityConfig,
    ViewToken,
    PixelRatio,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutDown
} from 'react-native-reanimated';
import { performanceMonitor, MemoryLeakDetector, throttle, debounce } from '../../utils/performance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIXEL_RATIO = PixelRatio.get();

// Performance configurations based on device capabilities
const PERFORMANCE_CONFIGS = {
    memory: {
        maxToRenderPerBatch: 5,
        windowSize: 10,
        initialNumToRender: 8,
        removeClippedSubviews: true,
        updateCellsBatchingPeriod: 100,
    },
    speed: {
        maxToRenderPerBatch: 15,
        windowSize: 21,
        initialNumToRender: 15,
        removeClippedSubviews: false,
        updateCellsBatchingPeriod: 50,
    },
    balanced: {
        maxToRenderPerBatch: 10,
        windowSize: 16,
        initialNumToRender: 12,
        removeClippedSubviews: true,
        updateCellsBatchingPeriod: 75,
    },
};

interface UltraOptimizedListProps<T> {
    data: T[];
    renderItem: (item: T, index: number, isVisible?: boolean) => React.ReactElement;
    keyExtractor?: (item: T, index: number) => string;

    // Layout optimization
    itemHeight?: number;
    estimatedItemSize?: number;
    numColumns?: number;

    // Performance modes
    performanceMode?: keyof typeof PERFORMANCE_CONFIGS;
    enableAnimations?: boolean;
    enableVirtualization?: boolean;

    // Memory optimization
    recycleItems?: boolean;
    maxCachedItems?: number;
    preloadThreshold?: number;

    // Visual customization
    emptyMessage?: string;
    emptyIcon?: string;
    showPerformanceStats?: boolean;

    // Callbacks
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;

    // Style
    style?: any;
    contentContainerStyle?: any;
}

/**
 * Ultra-optimized FlatList with advanced performance features
 */
export function UltraOptimizedList<T extends { id?: string | number }>({
    data,
    renderItem,
    keyExtractor,
    itemHeight,
    estimatedItemSize = 80,
    numColumns = 1,
    performanceMode = 'balanced',
    enableAnimations = true,
    enableVirtualization = true,
    recycleItems = true,
    maxCachedItems = 50,
    preloadThreshold = 2,
    emptyMessage = 'No items to display',
    emptyIcon = '📭',
    showPerformanceStats = __DEV__,
    onRefresh,
    isRefreshing = false,
    onEndReached,
    onEndReachedThreshold = 0.1,
    onViewableItemsChanged,
    style,
    contentContainerStyle,
}: UltraOptimizedListProps<T>) {
    const listRef = useRef<FlatList<T>>(null);
    const viewabilityConfig = useRef<ViewabilityConfig>({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 100,
        waitForInteraction: true,
    });

    // Performance tracking
    const [renderStats, setRenderStats] = useState({
        renderCount: 0,
        averageRenderTime: 0,
        memoryUsage: 0,
    });

    const [visibleItems, setVisibleItems] = useState<Set<string | number>>(new Set());
    const itemCache = useRef<Map<string | number, React.ReactElement>>(new Map());
    const mountTime = useRef(Date.now());

    // Performance configuration
    const config = PERFORMANCE_CONFIGS[performanceMode];

    // Track component lifecycle for memory leaks
    useEffect(() => {
        MemoryLeakDetector.track('UltraOptimizedList');
        return () => MemoryLeakDetector.untrack('UltraOptimizedList');
    }, []);

    // Memoized key extractor with performance optimization
    const memoizedKeyExtractor = useCallback(
        (item: T, index: number) => {
            if (keyExtractor) {
                return keyExtractor(item, index);
            }

            // Try to use item ID if available
            if (item && typeof item === 'object' && 'id' in item) {
                return String(item.id);
            }

            // Fallback to index (not recommended for dynamic lists)
            return `item-${index}`;
        },
        [keyExtractor]
    );

    // Optimized render item with caching and visibility tracking
    const memoizedRenderItem = useCallback(
        ({ item, index }: { item: T; index: number }) => {
            const key = memoizedKeyExtractor(item, index);
            const isVisible = visibleItems.has(key);

            // Use cached item if recycling is enabled
            if (recycleItems && itemCache.current.has(key)) {
                const cachedItem = itemCache.current.get(key);
                if (cachedItem) return cachedItem;
            }

            const startTime = performance.now();

            let renderedItem: React.ReactElement;

            if (enableAnimations && isVisible) {
                renderedItem = (
                    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                        {renderItem(item, index, isVisible)}
                    </Animated.View>
                );
            } else {
                renderedItem = renderItem(item, index, isVisible);
            }

            // Cache the rendered item
            if (recycleItems) {
                itemCache.current.set(key, renderedItem);

                // Limit cache size for memory efficiency
                if (itemCache.current.size > maxCachedItems) {
                    const firstKey = itemCache.current.keys().next().value;
                    if (firstKey !== undefined) {
                        itemCache.current.delete(firstKey);
                    }
                }
            }

            const renderTime = performance.now() - startTime;

            // Update render stats in development
            if (__DEV__ && renderTime > 5) {
                console.warn(`Slow render for item ${key}: ${renderTime.toFixed(2)}ms`);
            }

            return renderedItem;
        },
        [renderItem, enableAnimations, visibleItems, recycleItems, maxCachedItems, memoizedKeyExtractor]
    );

    // Optimized getItemLayout for fixed height items
    const getItemLayout = useMemo(() => {
        if (!itemHeight) return undefined;

        return (_data: any, index: number) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
        });
    }, [itemHeight]);

    // Throttled viewability change handler
    const handleViewableItemsChanged = useCallback(
        throttle((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
            const newVisibleItems = new Set<string | number>();

            info.viewableItems.forEach(viewableItem => {
                const key = memoizedKeyExtractor(viewableItem.item, viewableItem.index || 0);
                newVisibleItems.add(key);
            });

            setVisibleItems(newVisibleItems);

            // Call external handler
            onViewableItemsChanged?.(info);

            // Performance monitoring
            if (showPerformanceStats) {
                const metrics = performanceMonitor.getCurrentMetrics();
                setRenderStats(prev => ({
                    renderCount: prev.renderCount + 1,
                    averageRenderTime: (prev.averageRenderTime + metrics.renderTime) / 2,
                    memoryUsage: metrics.memory.used,
                }));
            }
        }, 100),
        [memoizedKeyExtractor, onViewableItemsChanged, showPerformanceStats]
    );

    // Empty list component with animation
    const ListEmptyComponent = useMemo(
        () => (
            <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>{emptyIcon}</Text>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
                {showPerformanceStats && (
                    <Text style={styles.statsText}>
                        Component mounted in {Date.now() - mountTime.current}ms
                    </Text>
                )}
            </Animated.View>
        ),
        [emptyMessage, emptyIcon, showPerformanceStats]
    );

    // Performance stats header
    const PerformanceHeader = useMemo(() => {
        if (!showPerformanceStats || !__DEV__) return null;

        return (
            <View style={styles.performanceHeader}>
                <Text style={styles.performanceText}>
                    Renders: {renderStats.renderCount} |
                    Avg: {renderStats.averageRenderTime.toFixed(1)}ms |
                    Memory: {renderStats.memoryUsage}MB |
                    Mode: {performanceMode}
                </Text>
            </View>
        );
    }, [renderStats, performanceMode, showPerformanceStats]);

    // Pull to refresh control
    const refreshControl = useMemo(
        () => onRefresh ? (
            <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#FF6347"
                colors={['#FF6347']}
                progressBackgroundColor="#FFFFFF"
            />
        ) : undefined,
        [onRefresh, isRefreshing]
    );

    // Optimized end reached handler
    const handleEndReached = useCallback(
        debounce(() => {
            onEndReached?.();
        }, 200),
        [onEndReached]
    );

    return (
        <View style={[styles.container, style]}>
            {PerformanceHeader}
            <FlatList
                ref={listRef}
                data={data}
                renderItem={memoizedRenderItem}
                keyExtractor={memoizedKeyExtractor}
                getItemLayout={getItemLayout}
                numColumns={numColumns}

                // Performance optimizations
                removeClippedSubviews={enableVirtualization && config.removeClippedSubviews}
                maxToRenderPerBatch={config.maxToRenderPerBatch}
                updateCellsBatchingPeriod={config.updateCellsBatchingPeriod}
                initialNumToRender={config.initialNumToRender}
                windowSize={config.windowSize}

                // Memory optimizations
                disableVirtualization={!enableVirtualization}
                legacyImplementation={false}

                // Interaction optimizations
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}

                // Viewability tracking
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig.current}

                // Pagination
                onEndReached={handleEndReached}
                onEndReachedThreshold={onEndReachedThreshold}

                // Empty state
                ListEmptyComponent={ListEmptyComponent}

                // Pull to refresh
                refreshControl={refreshControl}

                // Styling
                style={styles.list}
                contentContainerStyle={[
                    data.length === 0 && styles.emptyContentContainer,
                    contentContainerStyle
                ]}

                // Performance monitoring
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    if (__DEV__) {
                        console.log(`List layout: ${height}px`);
                    }
                }}
            />
        </View>
    );
}

/**
 * Virtualized Grid List for menu items with images
 */
export const VirtualizedGridList = <T extends { id: string | number; image?: string }>({
    data,
    renderItem,
    numColumns = 2,
    itemHeight = 200,
    ...props
}: UltraOptimizedListProps<T> & { numColumns?: number }) => (
    <UltraOptimizedList
        data={data}
        renderItem={renderItem}
        numColumns={numColumns}
        itemHeight={itemHeight}
        performanceMode="speed"
        enableVirtualization={true}
        preloadThreshold={4}
        {...props}
    />
);

/**
 * Memory-optimized list for large datasets
 */
export const MemoryOptimizedList = <T extends { id: string | number }>({
    data,
    renderItem,
    ...props
}: UltraOptimizedListProps<T>) => (
    <UltraOptimizedList
        data={data}
        renderItem={renderItem}
        performanceMode="memory"
        enableVirtualization={true}
        recycleItems={true}
        maxCachedItems={20}
        enableAnimations={false}
        {...props}
    />
);

/**
 * Animated list for smooth transitions
 */
export const AnimatedOptimizedList = memo(<T extends { id: string | number }>({
    data,
    renderItem,
    ...props
}: UltraOptimizedListProps<T>) => (
    <UltraOptimizedList
        data={data}
        renderItem={renderItem}
        performanceMode="balanced"
        enableAnimations={true}
        enableVirtualization={true}
        {...props}
    />
));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
        minHeight: SCREEN_HEIGHT * 0.5,
    },
    emptyContentContainer: {
        flexGrow: 1,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 24,
    },
    performanceHeader: {
        backgroundColor: '#000000',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    performanceText: {
        color: '#00FF00',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    statsText: {
        marginTop: 8,
        fontSize: 12,
        color: '#666666',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});

export default UltraOptimizedList;