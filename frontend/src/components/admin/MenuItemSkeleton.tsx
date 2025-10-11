import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

/**
 * MenuItemSkeleton Component
 * 
 * Displays a shimmer loading skeleton that matches the MenuItemCard design
 * Used while menu items are being loaded from the backend
 */

export default function MenuItemSkeleton() {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Create shimmer animation loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.6, 0.3],
    });

    return (
        <View style={styles.itemCard}>
            {/* Top Section with Image and Info */}
            <View style={styles.topSection}>
                {/* Image Skeleton */}
                <View style={styles.itemImageContainer}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.itemImageSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                </View>

                {/* Info Skeleton */}
                <View style={styles.itemDetails}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.titleSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.idSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.descriptionSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Status Section Skeleton */}
            <View style={styles.statusSection}>
                <View style={styles.divider} />
                <View style={styles.statusRow}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.badgeSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.categoryBadgeSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Details Section Skeleton */}
            <View style={styles.detailsSection}>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.detailSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            styles.detailSkeleton,
                            { opacity: shimmerOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.shimmerGradient,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Action Buttons Skeleton */}
            <View style={styles.actionsSection}>
                <Animated.View
                    style={[
                        styles.shimmer,
                        styles.buttonSkeleton,
                        { opacity: shimmerOpacity, flex: 1 },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.shimmerGradient,
                            {
                                transform: [{ translateX: shimmerTranslate }],
                            },
                        ]}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.shimmer,
                        styles.buttonSkeleton,
                        { opacity: shimmerOpacity, flex: 1 },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.shimmerGradient,
                            {
                                transform: [{ translateX: shimmerTranslate }],
                            },
                        ]}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.shimmer,
                        styles.buttonSkeleton,
                        { opacity: shimmerOpacity, width: 44 },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.shimmerGradient,
                            {
                                transform: [{ translateX: shimmerTranslate }],
                            },
                        ]}
                    />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemCard: {
        backgroundColor: '#fbfbfbff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#F0F0F0',
    },
    itemImageSkeleton: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    titleSkeleton: {
        width: '80%',
        height: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    idSkeleton: {
        width: '40%',
        height: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    descriptionSkeleton: {
        width: '100%',
        height: 14,
        borderRadius: 7,
    },
    statusSection: {
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badgeSkeleton: {
        width: 100,
        height: 32,
        borderRadius: 8,
    },
    categoryBadgeSkeleton: {
        width: 60,
        height: 20,
        borderRadius: 10,
    },
    detailsSection: {
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    detailSkeleton: {
        flex: 1,
        height: 40,
        borderRadius: 8,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    buttonSkeleton: {
        height: 40,
        borderRadius: 12,
    },
    shimmer: {
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    shimmerGradient: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
});
