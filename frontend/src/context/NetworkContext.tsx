/**
 * Network Context
 * 
 * Provides real-time network status monitoring using @react-native-community/netinfo
 * Tracks connection status, type, and quality across the entire app
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NetworkContextType {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    connectionType: NetInfoStateType;
    isSlowConnection: boolean;
    networkState: NetInfoState | null;
    checkConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
    children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
    const [connectionType, setConnectionType] = useState<NetInfoStateType>('unknown' as NetInfoStateType);
    const [isSlowConnection, setIsSlowConnection] = useState<boolean>(false);
    const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

    /**
     * Handle network state changes
     */
    const handleNetworkChange = useCallback((state: NetInfoState) => {
        setNetworkState(state);
        setIsConnected(state.isConnected ?? false);
        setIsInternetReachable(state.isInternetReachable);
        setConnectionType(state.type);

        // Determine if connection is slow (2G or slow 3G)
        const isSlow =
            state.type === 'cellular' &&
            (state.details?.cellularGeneration === '2g' ||
                state.details?.cellularGeneration === '3g');
        setIsSlowConnection(isSlow);

        // Store connection status
        AsyncStorage.setItem('@network_status', JSON.stringify({
            isConnected: state.isConnected,
            isInternetReachable: state.isInternetReachable,
            connectionType: state.type,
            timestamp: Date.now(),
        })).catch(err => console.error('Failed to store network status:', err));

        // Log network changes in development
        if (__DEV__) {
            console.log('📡 Network Status Changed:', {
                connected: state.isConnected,
                reachable: state.isInternetReachable,
                type: state.type,
                slow: isSlow,
            });
        }
    }, []);

    /**
     * Manually check connection status
     */
    const checkConnection = useCallback(async () => {
        try {
            const state = await NetInfo.fetch();
            handleNetworkChange(state);
        } catch (error) {
            console.error('Failed to check network connection:', error);
        }
    }, [handleNetworkChange]);

    /**
     * Initialize network monitoring
     */
    useEffect(() => {
        // Fetch initial network state
        NetInfo.fetch().then(handleNetworkChange);

        // Subscribe to network changes
        const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

        // Load previous network status from storage
        AsyncStorage.getItem('@network_status')
            .then(stored => {
                if (stored) {
                    const status = JSON.parse(stored);
                    // Use stored status if less than 1 minute old
                    if (Date.now() - status.timestamp < 60000) {
                        setIsConnected(status.isConnected);
                        setIsInternetReachable(status.isInternetReachable);
                        setConnectionType(status.connectionType);
                    }
                }
            })
            .catch(err => console.error('Failed to load network status:', err));

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [handleNetworkChange]);

    const value: NetworkContextType = {
        isConnected,
        isInternetReachable,
        connectionType,
        isSlowConnection,
        networkState,
        checkConnection,
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
};

/**
 * Hook to access network context
 */
export const useNetwork = (): NetworkContextType => {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};

/**
 * HOC to inject network props into a component
 */
export const withNetwork = <P extends object>(
    Component: React.ComponentType<P & NetworkContextType>
) => {
    return (props: P) => {
        const networkContext = useNetwork();
        return <Component {...props} {...networkContext} />;
    };
};

export default NetworkContext;
