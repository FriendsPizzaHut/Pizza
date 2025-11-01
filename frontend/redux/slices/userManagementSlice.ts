import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserListItem {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'delivery' | 'admin';
    profileImage: string;
    createdAt: string;
    isActive: boolean;
    isApproved?: boolean;
    isRejected?: boolean;
    // Customer specific
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string;
    // Delivery specific
    totalDeliveries?: number;
    vehicleInfo?: {
        type: string;
        number: string;
    };
    status?: {
        isOnline: boolean;
        lastOnline: string;
    };
}

export interface UserDetails extends UserListItem {
    addresses?: any[];
    favoriteItems?: string[];
    orderHistory?: {
        id: string;
        date: string;
        items: number;
        total: number;
        status: string;
    }[];
    activeDeliveries?: number;
}

export interface UserManagementState {
    users: UserListItem[];
    selectedUser: UserDetails | null;
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingDetails: boolean;
    error: string | null;
    searchQuery: string;
    filterRole: 'all' | 'customer' | 'delivery' | 'admin';
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    hasMore: boolean;
}

const initialState: UserManagementState = {
    users: [],
    selectedUser: null,
    isLoading: false,
    isRefreshing: false,
    isLoadingDetails: false,
    error: null,
    searchQuery: '',
    filterRole: 'all',
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
    hasMore: true,
};

const userManagementSlice = createSlice({
    name: 'userManagement',
    initialState,
    reducers: {
        // Loading states
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setRefreshing: (state, action: PayloadAction<boolean>) => {
            state.isRefreshing = action.payload;
        },
        setLoadingDetails: (state, action: PayloadAction<boolean>) => {
            state.isLoadingDetails = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // Users list
        setUsers: (state, action: PayloadAction<{ users: UserListItem[]; pagination: any }>) => {
            state.users = action.payload.users;
            state.pagination = action.payload.pagination;
            state.hasMore = action.payload.pagination.page < action.payload.pagination.totalPages;
            state.isLoading = false;
            state.isRefreshing = false;
            state.error = null;
        },

        // Append users for pagination
        appendUsers: (state, action: PayloadAction<{ users: UserListItem[]; pagination: any }>) => {
            state.users = [...state.users, ...action.payload.users];
            state.pagination = action.payload.pagination;
            state.hasMore = action.payload.pagination.page < action.payload.pagination.totalPages;
            state.isLoading = false;
        },

        // Selected user details
        setSelectedUser: (state, action: PayloadAction<UserDetails | null>) => {
            state.selectedUser = action.payload;
            state.isLoadingDetails = false;
        },

        // Search and filter
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.pagination.page = 1; // Reset to page 1 on new search
        },
        setFilterRole: (state, action: PayloadAction<'all' | 'customer' | 'delivery' | 'admin'>) => {
            state.filterRole = action.payload;
            state.pagination.page = 1; // Reset to page 1 on filter change
        },

        // Delete user
        removeUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter(user => user._id !== action.payload);
            state.pagination.total -= 1;
            if (state.selectedUser?._id === action.payload) {
                state.selectedUser = null;
            }
        },

        // Reset state
        resetUserManagement: (state) => {
            return initialState;
        },

        // Increment page for pagination
        incrementPage: (state) => {
            state.pagination.page += 1;
        },
    },
});

export const {
    setLoading,
    setRefreshing,
    setLoadingDetails,
    setError,
    setUsers,
    appendUsers,
    setSelectedUser,
    setSearchQuery,
    setFilterRole,
    removeUser,
    resetUserManagement,
    incrementPage,
} = userManagementSlice.actions;

export default userManagementSlice.reducer;
