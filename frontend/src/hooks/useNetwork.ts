import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Network Detection Hook
 * 
 * Monitors network connectivity and provides status updates.
 * Useful for offline functionality and user feedback.
 */

export interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
}

export const useNetwork = () => {
    const [networkState, setNetworkState] = useState<NetworkState>({
        isConnected: true,
        isInternetReachable: null,
        type: null,
    });

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setNetworkState({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
            });

            // Log network changes in development
            if (__DEV__) {
                console.log('📶 Network status:', {
                    isConnected: state.isConnected,
                    isInternetReachable: state.isInternetReachable,
                    type: state.type,
                });
            }
        });

        // Cleanup subscription
        return () => {
            unsubscribe();
        };
    }, []);

    // Fetch current network state
    const refresh = async (): Promise<NetworkState> => {
        const state = await NetInfo.fetch();
        const newState = {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
        };
        setNetworkState(newState);
        return newState;
    };

    return {
        ...networkState,
        refresh,
    };
};

export default useNetwork;
