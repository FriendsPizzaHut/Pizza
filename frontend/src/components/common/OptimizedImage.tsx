/**
 * Optimized Image Loading and Caching System
 * 
 * Fast image loading with progressive enhancement,
 * intelligent caching, and Cloudinary optimizations
 */

import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import {
    Image,
    View,
    StyleSheet,
    ImageStyle,
    ViewStyle,
    Dimensions,
    Platform,
    ImageProps
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Image cache interface
interface CachedImage {
    uri: string;
    localPath?: string;
    timestamp: number;
    size: number;
    format: string;
}

// Image loading states
type ImageLoadingState = 'loading' | 'loaded' | 'error' | 'placeholder';

// Image cache manager
class ImageCacheManager {
    private static instance: ImageCacheManager;
    private cache = new Map<string, CachedImage>();
    private maxCacheSize = 100 * 1024 * 1024; // 100MB
    private currentCacheSize = 0;
    private readonly CACHE_KEY = 'image_cache_v1';

    static getInstance(): ImageCacheManager {
        if (!ImageCacheManager.instance) {
            ImageCacheManager.instance = new ImageCacheManager();
        }
        return ImageCacheManager.instance;
    }

    async initialize() {
        try {
            const cached = await AsyncStorage.getItem(this.CACHE_KEY);
            if (cached) {
                const cacheData = JSON.parse(cached);
                this.cache = new Map(cacheData.entries);
                this.currentCacheSize = cacheData.size;

                // Clean expired entries
                this.cleanExpiredEntries();
            }
        } catch (error) {
            console.warn('Failed to initialize image cache:', error);
        }
    }

    private cleanExpiredEntries() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > maxAge) {
                this.cache.delete(key);
                this.currentCacheSize -= entry.size;
            }
        }
    }

    private async persistCache() {
        try {
            const cacheData = {
                entries: Array.from(this.cache.entries()),
                size: this.currentCacheSize
            };
            await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to persist image cache:', error);
        }
    }

    getCachedImage(uri: string): CachedImage | null {
        return this.cache.get(uri) || null;
    }

    async cacheImage(uri: string, imageData: Partial<CachedImage>) {
        const entry: CachedImage = {
            uri,
            timestamp: Date.now(),
            size: imageData.size || 0,
            format: imageData.format || 'unknown',
            localPath: imageData.localPath
        };

        // Check if we need to clear space
        if (this.currentCacheSize + entry.size > this.maxCacheSize) {
            await this.clearOldEntries(entry.size);
        }

        this.cache.set(uri, entry);
        this.currentCacheSize += entry.size;

        // Persist every 10 entries
        if (this.cache.size % 10 === 0) {
            this.persistCache();
        }
    }

    private async clearOldEntries(requiredSpace: number) {
        const entries = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.timestamp - b.timestamp);

        let freedSpace = 0;
        for (const [key, entry] of entries) {
            this.cache.delete(key);
            this.currentCacheSize -= entry.size;
            freedSpace += entry.size;

            if (freedSpace >= requiredSpace) {
                break;
            }
        }
    }

    clearCache() {
        this.cache.clear();
        this.currentCacheSize = 0;
        AsyncStorage.removeItem(this.CACHE_KEY);
    }

    getCacheStats() {
        return {
            size: this.currentCacheSize,
            count: this.cache.size,
            maxSize: this.maxCacheSize
        };
    }
}

// Cloudinary URL optimization
export class CloudinaryOptimizer {
    private static baseTransformations = {
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
        gravity: 'auto'
    };

    static optimizeUrl(url: string, options: {
        width?: number;
        height?: number;
        quality?: number | 'auto';
        format?: string | 'auto';
        crop?: string;
        blur?: number;
        progressive?: boolean;
    } = {}): string {
        if (!url || !url.includes('cloudinary.com')) {
            return url;
        }

        const {
            width,
            height,
            quality = 'auto',
            format = 'auto',
            crop = 'fill',
            blur,
            progressive = true
        } = options;

        let transformations = [];

        // Add responsive sizing
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);

        // Add quality optimization
        transformations.push(`q_${quality}`);

        // Add format optimization
        transformations.push(`f_${format}`);

        // Add crop mode
        transformations.push(`c_${crop}`);

        // Add progressive loading
        if (progressive) transformations.push('fl_progressive');

        // Add blur for placeholders
        if (blur) transformations.push(`e_blur:${blur}`);

        // Device pixel ratio optimization
        const pixelRatio = Platform.select({
            ios: 2,
            android: 2,
            default: 1
        });
        transformations.push(`dpr_${pixelRatio}`);

        const transformString = transformations.join(',');

        // Insert transformations into Cloudinary URL
        return url.replace('/upload/', `/upload/${transformString}/`);
    }

    static generatePlaceholderUrl(url: string, blur = 50): string {
        return this.optimizeUrl(url, {
            width: 50,
            quality: 30,
            blur,
            progressive: false
        });
    }

    static generateResponsiveUrls(url: string): {
        thumbnail: string;
        small: string;
        medium: string;
        large: string;
        placeholder: string;
    } {
        return {
            thumbnail: this.optimizeUrl(url, { width: 150, height: 150 }),
            small: this.optimizeUrl(url, { width: 300 }),
            medium: this.optimizeUrl(url, { width: 600 }),
            large: this.optimizeUrl(url, { width: 1200 }),
            placeholder: this.generatePlaceholderUrl(url)
        };
    }
}

// Progressive Image Component
interface ProgressiveImageProps extends Omit<ImageProps, 'source' | 'style'> {
    source: { uri: string } | number;
    style?: ImageStyle;
    placeholderSource?: { uri: string } | number;
    fadeInDuration?: number;
    blurRadius?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    onLoadStart?: () => void;
    onLoadEnd?: () => void;
    onError?: (error: any) => void;
    enableCache?: boolean;
    optimizeForDevice?: boolean;
    showLoadingIndicator?: boolean;
    fallbackIcon?: string;
}

export const ProgressiveImage = memo<ProgressiveImageProps>(({
    source,
    style,
    placeholderSource,
    fadeInDuration = 300,
    blurRadius = 0,
    resizeMode = 'cover',
    onLoadStart,
    onLoadEnd,
    onError,
    enableCache = true,
    optimizeForDevice = true,
    showLoadingIndicator = true,
    fallbackIcon = '🖼️',
    ...props
}) => {
    const [loadingState, setLoadingState] = useState<ImageLoadingState>('loading');
    const [imageUri, setImageUri] = useState<string>('');
    const [placeholderUri, setPlaceholderUri] = useState<string>('');

    const opacity = useSharedValue(0);
    const placeholderOpacity = useSharedValue(1);
    const cacheManager = useRef(ImageCacheManager.getInstance());

    // Initialize cache
    useEffect(() => {
        cacheManager.current.initialize();
    }, []);

    // Process image source
    useEffect(() => {
        if (typeof source === 'number') {
            setImageUri('');
            setLoadingState('loaded');
            return;
        }

        const uri = source.uri;

        if (optimizeForDevice && uri.includes('cloudinary.com')) {
            // Get optimized URLs
            const optimizedUrls = CloudinaryOptimizer.generateResponsiveUrls(uri);

            // Determine best size based on style
            const imageWidth = getImageWidth(style);
            let optimizedUri = optimizedUrls.medium;

            if (imageWidth <= 150) optimizedUri = optimizedUrls.thumbnail;
            else if (imageWidth <= 300) optimizedUri = optimizedUrls.small;
            else if (imageWidth <= 600) optimizedUri = optimizedUrls.medium;
            else optimizedUri = optimizedUrls.large;

            setImageUri(optimizedUri);
            setPlaceholderUri(optimizedUrls.placeholder);
        } else {
            setImageUri(uri);
            if (placeholderSource && typeof placeholderSource !== 'number') {
                setPlaceholderUri(placeholderSource.uri);
            }
        }
    }, [source, style, optimizeForDevice, placeholderSource]);

    // Handle image loading
    const handleLoadStart = useCallback(() => {
        setLoadingState('loading');
        onLoadStart?.();
    }, [onLoadStart]);

    const handleLoadEnd = useCallback(() => {
        setLoadingState('loaded');
        opacity.value = withTiming(1, { duration: fadeInDuration });
        placeholderOpacity.value = withTiming(0, { duration: fadeInDuration });
        onLoadEnd?.();

        // Cache the image
        if (enableCache && imageUri) {
            cacheManager.current.cacheImage(imageUri, {
                size: 0, // We don't have size info in RN
                format: 'unknown'
            });
        }
    }, [onLoadEnd, fadeInDuration, enableCache, imageUri, opacity, placeholderOpacity]);

    const handleError = useCallback((error: any) => {
        setLoadingState('error');
        placeholderOpacity.value = withTiming(1, { duration: 200 });
        onError?.(error);
    }, [onError, placeholderOpacity]);

    // Animated styles
    const imageAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    const placeholderAnimatedStyle = useAnimatedStyle(() => ({
        opacity: placeholderOpacity.value
    }));

    const loadingAnimatedStyle = useAnimatedStyle(() => ({
        opacity: loadingState === 'loading' ? 1 : 0
    }));

    return (
        <View style={[styles.imageContainer, style]}>
            {/* Placeholder Image */}
            {placeholderUri && (
                <Animated.View style={[StyleSheet.absoluteFill, placeholderAnimatedStyle]}>
                    <Image
                        source={{ uri: placeholderUri }}
                        style={[StyleSheet.absoluteFill]}
                        resizeMode={resizeMode}
                        blurRadius={10}
                    />
                </Animated.View>
            )}

            {/* Main Image */}
            {typeof source === 'number' ? (
                <Image
                    source={source}
                    style={[StyleSheet.absoluteFill]}
                    resizeMode={resizeMode}
                    {...props}
                />
            ) : imageUri ? (
                <Animated.View style={[StyleSheet.absoluteFill, imageAnimatedStyle]}>
                    <Image
                        source={{ uri: imageUri }}
                        style={[StyleSheet.absoluteFill]}
                        resizeMode={resizeMode}
                        onLoadStart={handleLoadStart}
                        onLoadEnd={handleLoadEnd}
                        onError={handleError}
                        blurRadius={blurRadius}
                        {...props}
                    />
                </Animated.View>
            ) : null}

            {/* Loading Indicator */}
            {showLoadingIndicator && (
                <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
                    <View style={styles.loadingPlaceholder}>
                        <Animated.Text style={styles.loadingIcon}>
                            {loadingState === 'error' ? '❌' : fallbackIcon}
                        </Animated.Text>
                    </View>
                </Animated.View>
            )}
        </View>
    );
});

// Smart Image component with automatic optimization
interface SmartImageProps extends ProgressiveImageProps {
    category?: 'menu' | 'profile' | 'thumbnail' | 'hero';
    priority?: 'low' | 'normal' | 'high';
}

export const SmartImage = memo<SmartImageProps>(({
    category = 'menu',
    priority = 'normal',
    ...props
}) => {
    // Automatic optimization based on category
    const optimizedProps = useMemo(() => {
        const baseProps = { ...props };

        switch (category) {
            case 'menu':
                return {
                    ...baseProps,
                    fadeInDuration: 200,
                    optimizeForDevice: true,
                    enableCache: true,
                    showLoadingIndicator: true
                };
            case 'thumbnail':
                return {
                    ...baseProps,
                    fadeInDuration: 150,
                    optimizeForDevice: true,
                    enableCache: true,
                    showLoadingIndicator: false
                };
            case 'hero':
                return {
                    ...baseProps,
                    fadeInDuration: 400,
                    optimizeForDevice: true,
                    enableCache: true,
                    showLoadingIndicator: true
                };
            case 'profile':
                return {
                    ...baseProps,
                    fadeInDuration: 250,
                    optimizeForDevice: true,
                    enableCache: true,
                    showLoadingIndicator: false
                };
            default:
                return baseProps;
        }
    }, [category, props]);

    return <ProgressiveImage {...optimizedProps} />;
});

// Utility functions
function getImageWidth(style: any): number {
    if (!style) return SCREEN_WIDTH;

    const width = StyleSheet.flatten(style)?.width;
    if (typeof width === 'number') return width;
    if (typeof width === 'string' && width.endsWith('%')) {
        return SCREEN_WIDTH * (parseFloat(width) / 100);
    }

    return SCREEN_WIDTH;
}

// Preloading utilities
export const preloadImages = async (urls: string[], options: {
    concurrency?: number;
    timeout?: number;
} = {}) => {
    const { concurrency = 3, timeout = 10000 } = options;
    const chunks = [];

    // Split URLs into chunks for concurrent loading
    for (let i = 0; i < urls.length; i += concurrency) {
        chunks.push(urls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
        const preloadPromises = chunk.map(url =>
            new Promise<void>((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('Timeout')), timeout);

                Image.prefetch(url)
                    .then(() => {
                        clearTimeout(timer);
                        resolve();
                    })
                    .catch(error => {
                        clearTimeout(timer);
                        reject(error);
                    });
            })
        );

        try {
            await Promise.allSettled(preloadPromises);
        } catch (error) {
            console.warn('Image preloading failed:', error);
        }
    }
};

const styles = StyleSheet.create({
    imageContainer: {
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 245, 245, 0.8)',
    },
    loadingPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    loadingIcon: {
        fontSize: 24,
    },
});

export { ImageCacheManager };
export default { ProgressiveImage, SmartImage, CloudinaryOptimizer };