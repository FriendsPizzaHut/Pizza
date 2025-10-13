/**
 * Address Slice
 * 
 * Manages user addresses state with caching for performance optimization.
 * Reduces API calls by storing addresses in Redux.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Address {
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

interface AddressState {
    addresses: Address[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    selectedAddressId: string | null;
}

const initialState: AddressState = {
    addresses: [],
    isLoading: false,
    error: null,
    lastFetched: null,
    selectedAddressId: null,
};

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        // Set addresses from API
        setAddresses: (state, action: PayloadAction<Address[]>) => {
            state.addresses = action.payload;
            state.lastFetched = Date.now();
            state.error = null;

            // Auto-select default or first address
            if (!state.selectedAddressId && action.payload.length > 0) {
                const defaultAddr = action.payload.find(a => a.isDefault);
                state.selectedAddressId = defaultAddr?._id || action.payload[0]._id;
            }
        },

        // Add new address
        addAddress: (state, action: PayloadAction<Address>) => {
            state.addresses.push(action.payload);

            // If this is the first address or marked as default, select it
            if (state.addresses.length === 1 || action.payload.isDefault) {
                state.selectedAddressId = action.payload._id;
            }
        },

        // Update existing address
        updateAddress: (state, action: PayloadAction<Address>) => {
            const index = state.addresses.findIndex(a => a._id === action.payload._id);
            if (index !== -1) {
                state.addresses[index] = action.payload;

                // If set as default, unset others
                if (action.payload.isDefault) {
                    state.addresses.forEach((addr, i) => {
                        if (i !== index) {
                            addr.isDefault = false;
                        }
                    });
                    state.selectedAddressId = action.payload._id;
                }
            }
        },

        // Delete address
        deleteAddress: (state, action: PayloadAction<string>) => {
            state.addresses = state.addresses.filter(a => a._id !== action.payload);

            // If deleted address was selected, select first available
            if (state.selectedAddressId === action.payload && state.addresses.length > 0) {
                const defaultAddr = state.addresses.find(a => a.isDefault);
                state.selectedAddressId = defaultAddr?._id || state.addresses[0]._id;
            }
        },

        // Set default address
        setDefaultAddress: (state, action: PayloadAction<string>) => {
            state.addresses.forEach(addr => {
                addr.isDefault = addr._id === action.payload;
            });
            state.selectedAddressId = action.payload;
        },

        // Select address (for checkout)
        selectAddress: (state, action: PayloadAction<string>) => {
            state.selectedAddressId = action.payload;
        },

        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Set error
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        // Clear addresses (on logout)
        clearAddresses: (state) => {
            state.addresses = [];
            state.selectedAddressId = null;
            state.lastFetched = null;
            state.error = null;
            state.isLoading = false;
        },
    },
});

// Helper function to check cache validity (5 minutes)
export const isCacheValid = (lastFetched: number | null): boolean => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    return lastFetched !== null && (Date.now() - lastFetched < CACHE_DURATION);
};

export const {
    setAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    selectAddress,
    setLoading,
    setError,
    clearAddresses,
} = addressSlice.actions;

export default addressSlice.reducer;
