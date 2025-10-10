/**
 * Menu Slice with Optimistic Updates
 * 
 * Example Redux slice demonstrating offline-first CRUD operations
 * with optimistic UI updates, temporary IDs, and automatic sync.
 * 
 * @module menuSlice
 * @implements Prompt 4 - Optimistic UI Updates
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../src/api/apiClient';
import { MENU_ENDPOINTS } from '../../src/api/endpoints';
import { offlineQueue } from '../../src/utils/offlineQueue';
import {
    OptimisticItem,
    OptimisticManager,
    generateTempId,
    wrapOptimistic,
    markAsCreating,
    markAsUpdating,
    markAsDeleting,
    markAsSynced,
    markAsFailed,
    PendingStatus,
} from '../../src/utils/optimisticUpdates';

/**
 * Menu Item Interface
 */
export interface MenuItem {
    id?: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    available?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Menu State Interface
 */
interface MenuState {
    items: OptimisticItem<MenuItem>[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
    lastFetch: number | null;
}

/**
 * Initial State
 */
const initialState: MenuState = {
    items: [],
    categories: [],
    isLoading: false,
    error: null,
    lastFetch: null,
};

/**
 * Async Thunks
 */

// Fetch all menu items
export const fetchMenuItems = createAsyncThunk(
    'menu/fetchMenuItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(MENU_ENDPOINTS.GET_ALL);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu items');
        }
    }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
    'menu/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(MENU_ENDPOINTS.GET_CATEGORIES);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

// Create menu item (with offline support)
export const createMenuItem = createAsyncThunk(
    'menu/createMenuItem',
    async (menuItem: Omit<MenuItem, 'id'>, { rejectWithValue, dispatch }) => {
        try {
            // Generate temp ID for optimistic update
            const tempId = generateTempId();

            // Optimistic update happens in reducer
            // Just make the API call (will be queued if offline)
            const response = await apiClient.post(
                MENU_ENDPOINTS.GET_ALL,
                menuItem,
                {
                    tempId,
                    resourceType: 'menu',
                } as any
            );

            return {
                tempId,
                item: response.data,
            };
        } catch (error: any) {
            // If queued for offline, return temp ID for tracking
            if (error.isQueued) {
                return {
                    tempId: error.queueId,
                    queued: true,
                };
            }

            return rejectWithValue(
                error.response?.data?.message || 'Failed to create menu item'
            );
        }
    }
);

// Update menu item (with offline support)
export const updateMenuItem = createAsyncThunk(
    'menu/updateMenuItem',
    async (
        { id, updates }: { id: string; updates: Partial<MenuItem> },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiClient.put(
                MENU_ENDPOINTS.GET_BY_ID(id),
                updates,
                {
                    resourceType: 'menu',
                } as any
            );

            return response.data;
        } catch (error: any) {
            if (error.isQueued) {
                return { id, updates, queued: true };
            }

            return rejectWithValue(
                error.response?.data?.message || 'Failed to update menu item'
            );
        }
    }
);

// Delete menu item (with offline support)
export const deleteMenuItem = createAsyncThunk(
    'menu/deleteMenuItem',
    async (id: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(MENU_ENDPOINTS.GET_BY_ID(id), {
                resourceType: 'menu',
            } as any);

            return id;
        } catch (error: any) {
            if (error.isQueued) {
                return { id, queued: true };
            }

            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete menu item'
            );
        }
    }
);

/**
 * Menu Slice
 */
const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        /**
         * Add menu item optimistically (for offline creates)
         */
        addMenuItemOptimistic: (
            state,
            action: PayloadAction<{ menuItem: MenuItem; tempId: string; queueId?: string }>
        ) => {
            const { menuItem, tempId, queueId } = action.payload;

            const optimisticItem = markAsCreating(
                wrapOptimistic({ ...menuItem, id: tempId }),
                tempId,
                queueId
            );

            state.items.unshift(optimisticItem);
        },

        /**
         * Update menu item optimistically (for offline updates)
         */
        updateMenuItemOptimistic: (
            state,
            action: PayloadAction<{ id: string; updates: Partial<MenuItem>; queueId?: string }>
        ) => {
            const { id, updates, queueId } = action.payload;

            const index = state.items.findIndex(
                item => item.data.id === id || item.tempId === id
            );

            if (index !== -1) {
                state.items[index] = markAsUpdating(
                    {
                        ...state.items[index],
                        data: { ...state.items[index].data, ...updates },
                    },
                    queueId
                );
            }
        },

        /**
         * Delete menu item optimistically (for offline deletes)
         */
        deleteMenuItemOptimistic: (
            state,
            action: PayloadAction<{ id: string; queueId?: string }>
        ) => {
            const { id, queueId } = action.payload;

            const index = state.items.findIndex(
                item => item.data.id === id || item.tempId === id
            );

            if (index !== -1) {
                state.items[index] = markAsDeleting(state.items[index], queueId);
            }
        },

        /**
         * Confirm sync success and replace temp ID
         */
        confirmMenuItemSync: (
            state,
            action: PayloadAction<{ tempId: string; serverItem: MenuItem }>
        ) => {
            const { tempId, serverItem } = action.payload;

            const index = state.items.findIndex(item => item.tempId === tempId);

            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    data: serverItem,
                    serverId: serverItem.id,
                    pendingStatus: PendingStatus.SUCCESS,
                    error: undefined,
                };
            }
        },

        /**
         * Mark menu item as failed
         */
        markMenuItemFailed: (
            state,
            action: PayloadAction<{ id: string; error: string }>
        ) => {
            const { id, error } = action.payload;

            const index = state.items.findIndex(
                item => item.data.id === id || item.tempId === id || item.queueId === id
            );

            if (index !== -1) {
                state.items[index] = markAsFailed(state.items[index], error);
            }
        },

        /**
         * Remove failed item
         */
        removeFailedMenuItem: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.items = state.items.filter(
                item => item.data.id !== id && item.tempId !== id && item.queueId !== id
            );
        },

        /**
         * Clear all menu items
         */
        clearMenuItems: state => {
            state.items = [];
            state.lastFetch = null;
        },
    },
    extraReducers: builder => {
        /**
         * Fetch Menu Items
         */
        builder.addCase(fetchMenuItems.pending, state => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMenuItems.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload.map((item: MenuItem) => wrapOptimistic(item));
            state.lastFetch = Date.now();
        });
        builder.addCase(fetchMenuItems.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        /**
         * Fetch Categories
         */
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.categories = action.payload;
        });

        /**
         * Create Menu Item
         */
        builder.addCase(createMenuItem.pending, (state, action) => {
            // Optimistic update
            const menuItem = action.meta.arg;
            const tempId = generateTempId();

            const optimisticItem = markAsCreating(
                wrapOptimistic({ ...menuItem, id: tempId } as MenuItem),
                tempId
            );

            state.items.unshift(optimisticItem);
        });
        builder.addCase(createMenuItem.fulfilled, (state, action: any) => {
            if (action.payload.queued) {
                // Item is queued for offline sync
                return;
            }

            // Replace temp item with server item
            const { tempId, item } = action.payload;
            const index = state.items.findIndex(i => i.tempId === tempId);

            if (index !== -1) {
                state.items[index] = wrapOptimistic(item);
            }
        });
        builder.addCase(createMenuItem.rejected, (state, action: any) => {
            const tempId = action.meta.arg.id;
            const index = state.items.findIndex(i => i.tempId === tempId);

            if (index !== -1) {
                state.items[index] = markAsFailed(
                    state.items[index],
                    action.payload as string || 'Failed to create item'
                );
            }
        });

        /**
         * Update Menu Item
         */
        builder.addCase(updateMenuItem.pending, (state, action) => {
            const { id, updates } = action.meta.arg;
            const index = state.items.findIndex(item => item.data.id === id);

            if (index !== -1) {
                state.items[index] = markAsUpdating({
                    ...state.items[index],
                    data: { ...state.items[index].data, ...updates },
                });
            }
        });
        builder.addCase(updateMenuItem.fulfilled, (state, action: any) => {
            if (action.payload.queued) {
                return;
            }

            const item = action.payload;
            const index = state.items.findIndex(i => i.data.id === item.id);

            if (index !== -1) {
                state.items[index] = markAsSynced(
                    { ...state.items[index], data: item },
                    item.id
                );
            }
        });
        builder.addCase(updateMenuItem.rejected, (state, action: any) => {
            const { id } = action.meta.arg;
            const index = state.items.findIndex(i => i.data.id === id);

            if (index !== -1) {
                state.items[index] = markAsFailed(
                    state.items[index],
                    action.payload as string || 'Failed to update item'
                );
            }
        });

        /**
         * Delete Menu Item
         */
        builder.addCase(deleteMenuItem.pending, (state, action) => {
            const id = action.meta.arg;
            const index = state.items.findIndex(item => item.data.id === id);

            if (index !== -1) {
                state.items[index] = markAsDeleting(state.items[index]);
            }
        });
        builder.addCase(deleteMenuItem.fulfilled, (state, action: any) => {
            if (action.payload.queued) {
                return;
            }

            const id = typeof action.payload === 'string' ? action.payload : action.payload.id;
            state.items = state.items.filter(item => item.data.id !== id);
        });
        builder.addCase(deleteMenuItem.rejected, (state, action: any) => {
            const id = action.meta.arg;
            const index = state.items.findIndex(i => i.data.id === id);

            if (index !== -1) {
                state.items[index] = markAsFailed(
                    state.items[index],
                    action.payload as string || 'Failed to delete item'
                );
            }
        });
    },
});

/**
 * Export Actions
 */
export const {
    addMenuItemOptimistic,
    updateMenuItemOptimistic,
    deleteMenuItemOptimistic,
    confirmMenuItemSync,
    markMenuItemFailed,
    removeFailedMenuItem,
    clearMenuItems,
} = menuSlice.actions;

/**
 * Selectors
 */
export const selectAllMenuItems = (state: { menu: MenuState }) =>
    state.menu.items.filter(item => item.pendingStatus !== PendingStatus.DELETING);

export const selectMenuItemById = (state: { menu: MenuState }, id: string) =>
    state.menu.items.find(item => item.data.id === id || item.tempId === id);

export const selectPendingMenuItems = (state: { menu: MenuState }) =>
    state.menu.items.filter(
        item =>
            item.pendingStatus === PendingStatus.CREATING ||
            item.pendingStatus === PendingStatus.UPDATING ||
            item.pendingStatus === PendingStatus.DELETING
    );

export const selectFailedMenuItems = (state: { menu: MenuState }) =>
    state.menu.items.filter(item => item.pendingStatus === PendingStatus.FAILED);

export const selectMenuCategories = (state: { menu: MenuState }) => state.menu.categories;

export const selectMenuItemsByCategory = (state: { menu: MenuState }, category: string) =>
    state.menu.items.filter(
        item =>
            item.data.category === category &&
            item.pendingStatus !== PendingStatus.DELETING
    );

export const selectMenuLoading = (state: { menu: MenuState }) => state.menu.isLoading;

export const selectMenuError = (state: { menu: MenuState }) => state.menu.error;

/**
 * Export Reducer
 */
export default menuSlice.reducer;
