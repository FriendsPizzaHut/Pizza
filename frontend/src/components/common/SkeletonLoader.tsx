/**
 * Skeleton Loader Components
 * 
 * Shimmer/skeleton loaders for smooth loading states
 * Provides instant feedback while data is being fetched
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

/**
 * Base Skeleton Component with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
}) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();

        return () => shimmer.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

/**
 * Skeleton Circle (for avatars, profile pictures)
 */
export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'borderRadius'>> = ({
    width = 50,
    height = 50,
    style,
}) => {
    return <Skeleton width={width} height={height} borderRadius={999} style={style} />;
};

/**
 * Skeleton Text Line
 */
interface SkeletonTextProps {
    lines?: number;
    lineHeight?: number;
    spacing?: number;
    lastLineWidth?: string | number;
    style?: StyleProp<ViewStyle>;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
    lines = 3,
    lineHeight = 16,
    spacing = 8,
    lastLineWidth = '60%',
    style,
}) => {
    return (
        <View style={[styles.skeletonTextContainer, style]}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    height={lineHeight}
                    width={index === lines - 1 ? lastLineWidth : '100%'}
                    style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
                />
            ))}
        </View>
    );
};

/**
 * Skeleton Card (for list items, cards)
 */
export const SkeletonCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.cardHeader}>
                <SkeletonCircle width={40} height={40} />
                <View style={styles.cardHeaderText}>
                    <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={12} />
                </View>
            </View>
            <SkeletonText lines={3} lineHeight={14} spacing={6} />
        </View>
    );
};

/**
 * Skeleton Image
 */
export const SkeletonImage: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 200,
    borderRadius = 8,
    style,
}) => {
    return <Skeleton width={width} height={height} borderRadius={borderRadius} style={style} />;
};

/**
 * Skeleton Button
 */
export const SkeletonButton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 48,
    borderRadius = 8,
    style,
}) => {
    return <Skeleton width={width} height={height} borderRadius={borderRadius} style={style} />;
};

/**
 * Skeleton List Item
 */
export const SkeletonListItem: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
    return (
        <View style={[styles.listItem, style]}>
            <SkeletonCircle width={50} height={50} />
            <View style={styles.listItemContent}>
                <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="50%" height={14} />
            </View>
        </View>
    );
};

/**
 * Skeleton Product Card (for menu items, products)
 */
export const SkeletonProductCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
    return (
        <View style={[styles.productCard, style]}>
            <SkeletonImage width="100%" height={150} borderRadius={8} />
            <View style={styles.productCardContent}>
                <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
                <View style={styles.productCardFooter}>
                    <Skeleton width={60} height={20} borderRadius={4} />
                    <Skeleton width={80} height={32} borderRadius={16} />
                </View>
            </View>
        </View>
    );
};

/**
 * Skeleton List (multiple items)
 */
interface SkeletonListProps {
    count?: number;
    type?: 'card' | 'list' | 'product';
    style?: StyleProp<ViewStyle>;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
    count = 5,
    type = 'list',
    style,
}) => {
    const renderItem = () => {
        switch (type) {
            case 'card':
                return <SkeletonCard />;
            case 'product':
                return <SkeletonProductCard />;
            case 'list':
            default:
                return <SkeletonListItem />;
        }
    };

    return (
        <View style={style}>
            {Array.from({ length: count }).map((_, index) => (
                <View key={index} style={{ marginBottom: 16 }}>
                    {renderItem()}
                </View>
            ))}
        </View>
    );
};

/**
 * Skeleton Screen (full screen loading state)
 */
export const SkeletonScreen: React.FC<{ type?: 'feed' | 'profile' | 'details' }> = ({
    type = 'feed',
}) => {
    if (type === 'profile') {
        return (
            <View style={styles.container}>
                <View style={styles.profileHeader}>
                    <SkeletonCircle width={100} height={100} />
                    <Skeleton width="60%" height={20} style={{ marginTop: 16, marginBottom: 8 }} />
                    <Skeleton width="40%" height={16} />
                </View>
                <SkeletonList count={3} type="card" style={{ padding: 16 }} />
            </View>
        );
    }

    if (type === 'details') {
        return (
            <View style={styles.container}>
                <SkeletonImage width="100%" height={250} borderRadius={0} />
                <View style={{ padding: 16 }}>
                    <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
                    <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
                    <SkeletonText lines={5} lineHeight={14} spacing={8} />
                    <SkeletonButton style={{ marginTop: 24 }} />
                </View>
            </View>
        );
    }

    // Default feed layout
    return (
        <View style={styles.container}>
            <SkeletonList count={5} type="card" style={{ padding: 16 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E1E1E1',
    },
    skeletonTextContainer: {
        width: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardHeaderText: {
        marginLeft: 12,
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    listItemContent: {
        marginLeft: 16,
        flex: 1,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productCardContent: {
        padding: 12,
    },
    productCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
});

export default Skeleton;
