/**
 * Network Banner Component
 * 
 * Displays a banner at the top of the screen when internet connection is lost
 * Shows sync status when connection is restored
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useNetwork } from '../../context/NetworkContext';
import { requestQueue } from '../../utils/requestQueue';

interface NetworkBannerProps {
    position?: 'top' | 'bottom';
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({ position = 'top' }) => {
    const { isConnected, isInternetReachable, isSlowConnection } = useNetwork();
    const [showBanner, setShowBanner] = useState(false);
    const [bannerMessage, setBannerMessage] = useState('');
    const [bannerType, setBannerType] = useState<'offline' | 'slow' | 'syncing' | 'online'>('offline');
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Subscribe to queue changes
        const unsubscribe = requestQueue.subscribe(queue => {
            const pending = queue.filter(r => r.status === 'pending').length;
            setPendingCount(pending);
        });

        // Get initial pending count
        const stats = requestQueue.getStats();
        setPendingCount(stats.pending);

        return unsubscribe;
    }, []);

    useEffect(() => {
        let shouldShow = false;
        let message = '';
        let type: 'offline' | 'slow' | 'syncing' | 'online' = 'offline';

        if (isConnected === false) {
            // Offline
            shouldShow = true;
            message = pendingCount > 0
                ? `No internet connection • ${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} queued`
                : 'No internet connection';
            type = 'offline';
        } else if (isInternetReachable === false) {
            // Connected but no internet
            shouldShow = true;
            message = 'Connected but no internet access';
            type = 'offline';
        } else if (isSlowConnection) {
            // Slow connection
            shouldShow = true;
            message = 'Slow connection detected';
            type = 'slow';
        } else if (pendingCount > 0 && isConnected) {
            // Syncing queued requests
            shouldShow = true;
            message = `Syncing ${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'}...`;
            type = 'syncing';
        }

        setShowBanner(shouldShow);
        setBannerMessage(message);
        setBannerType(type);

        if (shouldShow) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: position === 'top' ? -100 : 100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isConnected, isInternetReachable, isSlowConnection, pendingCount, slideAnim, position]);

    // Auto-hide syncing banner after 3 seconds
    useEffect(() => {
        if (bannerType === 'syncing' && pendingCount === 0) {
            const timer = setTimeout(() => {
                setShowBanner(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [bannerType, pendingCount]);

    if (!showBanner && pendingCount === 0) {
        return null;
    }

    const getBannerStyle = () => {
        switch (bannerType) {
            case 'offline':
                return styles.bannerOffline;
            case 'slow':
                return styles.bannerSlow;
            case 'syncing':
                return styles.bannerSyncing;
            case 'online':
                return styles.bannerOnline;
            default:
                return styles.bannerOffline;
        }
    };

    const getIcon = () => {
        switch (bannerType) {
            case 'offline':
                return '📡';
            case 'slow':
                return '🐌';
            case 'syncing':
                return '🔄';
            case 'online':
                return '✅';
            default:
                return '📡';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                position === 'top' ? styles.containerTop : styles.containerBottom,
                getBannerStyle(),
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Text style={styles.icon}>{getIcon()}</Text>
            <Text style={styles.text}>{bannerMessage}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    containerTop: {
        top: 0,
        paddingTop: Platform.OS === 'ios' ? 50 : 12,
    },
    containerBottom: {
        bottom: 0,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    },
    bannerOffline: {
        backgroundColor: '#DC3545',
    },
    bannerSlow: {
        backgroundColor: '#FFC107',
    },
    bannerSyncing: {
        backgroundColor: '#17A2B8',
    },
    bannerOnline: {
        backgroundColor: '#28A745',
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
});

export default NetworkBanner;
