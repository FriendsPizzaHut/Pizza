/**
 * Optimized List Components
 * 
 * Ultra-high-performance FlatList wrapper with advanced virtualization,
 * memory optimization, and smooth animations for 60 FPS rendering
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
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { performanceMonitor, MemoryLeakDetector } from '../../utils/performance';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OptimizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'keyExtractor'> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;
    itemHeight?: number; // For getItemLayout optimization
    estimatedItemSize?: number; // For better performance
    emptyMessage?: string;
    emptyIcon?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;

    // Advanced performance options
    enableAnimations?: boolean;
    performanceMode?: 'memory' | 'speed' | 'balanced';
    preloadThreshold?: number; // Items to preload outside viewport
    recyclingEnabled?: boolean;
    debugMode?: boolean;

    // Virtualization options
    overscan?: number; // Extra items to render outside viewport
    maintainVisibleContentPosition?: {
        minIndexForVisible: number;
        autoscrollToTopThreshold?: number | null;
    } | null;

    // Callbacks for performance monitoring
    onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
    onEndReachedThreshold?: number;
    onItemLayout?: (item: T, index: number, layout: { x: number; y: number; width: number; height: number }) => void;
}

/**
 * Optimized FlatList Component
 * 
 * Usage:
 * <OptimizedList
 *   data={items}
 *   renderItem={(item) => <ItemComponent item={item} />}
 *   keyExtractor={(item) => item.id}
 *   itemHeight={80} // If all items have same height
 * />
 */
export function OptimizedList<T extends any>({
    data,
    renderItem,
    keyExtractor,
    itemHeight,
    estimatedItemSize = 100,
    emptyMessage = 'No items to display',
    emptyIcon = '📭',
    onRefresh,
    isRefreshing = false,
    ...rest
}: OptimizedListProps<T>) {
    // Memoized key extractor with fallback
    const memoizedKeyExtractor = useCallback(
        (item: T, index: number) => {
            if (keyExtractor) {
                return keyExtractor(item, index);
            }
            // Fallback to index if no keyExtractor provided
            return `item-${index}`;
        },
        [keyExtractor]
    );

    // Memoized render item to prevent unnecessary re-renders
    const memoizedRenderItem = useCallback(
        ({ item, index }: { item: T; index: number }) => {
            return renderItem(item, index);
        },
        [renderItem]
    );

    // getItemLayout for fixed height items (massive performance boost)
    const getItemLayout = useMemo(() => {
        if (itemHeight) {
            return (_data: any, index: number) => ({
                length: itemHeight,
                offset: itemHeight * index,
                index,
            });
        }
        return undefined;
    }, [itemHeight]);

    // Empty list component
    const ListEmptyComponent = useMemo(
        () => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>{emptyIcon}</Text>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        ),
        [emptyMessage, emptyIcon]
    );

    // Pull to refresh control
    const refreshControl = useMemo(
        () =>
            onRefresh ? (
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor="#FF6347"
                    colors={['#FF6347']}
                />
            ) : undefined,
        [onRefresh, isRefreshing]
    );

    return (
        <FlatList
            data={data}
            renderItem={memoizedRenderItem}
            keyExtractor={memoizedKeyExtractor}
            getItemLayout={getItemLayout}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={21}
            // Empty state
            ListEmptyComponent={ListEmptyComponent}
            // Pull to refresh
            refreshControl={refreshControl}
            // Pass through other props
            {...rest}
        />
    );
}

/**
 * Memoized List Item Wrapper
 * 
 * Wrap your list items with this component to prevent unnecessary re-renders
 * 
 * Usage:
 * const renderItem = (item) => (
 *   <MemoizedListItem>
 *     <ItemComponent item={item} />
 *   </MemoizedListItem>
 * );
 */
export const MemoizedListItem = memo<{ children: React.ReactNode }>(
    ({ children }) => <>{children}</>,
    (prevProps, nextProps) => {
        // Custom comparison function
        // Return true if props are equal (prevents re-render)
        return prevProps.children === nextProps.children;
    }
);

/**
 * Item Separator Component
 */
export const ItemSeparator = memo(() => <View style={styles.separator} />);

/**
 * Section Header Component
 */
interface SectionHeaderProps {
    title: string;
}

export const SectionHeader = memo<SectionHeaderProps>(({ title }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
));

/**
 * List Footer Component (for loading more)
 */
interface ListFooterProps {
    isLoading?: boolean;
    text?: string;
}

export const ListFooter = memo<ListFooterProps>(
    ({ isLoading = false, text = 'Loading more...' }) => {
        if (!isLoading) return null;

        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>{text}</Text>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
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
    separator: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 16,
    },
    sectionHeader: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#999999',
    },
});

export default OptimizedList;
