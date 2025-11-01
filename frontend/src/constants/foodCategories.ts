/**
 * Food Categories Constants
 * 
 * Central source of truth for all food categories used across the app.
 * Keep this in sync with backend Product model enum values.
 */

export interface FoodCategory {
    id: string;
    label: string;
    icon: string; // Emoji or icon name
    description?: string;
}

// All food categories
export const FOOD_CATEGORIES: readonly FoodCategory[] = [
    {
        id: 'pizza',
        label: 'Pizza',
        icon: '🍕',
        description: 'Delicious pizzas with various toppings'
    },
    {
        id: 'burger',
        label: 'Burger',
        icon: '🍔',
        description: 'Juicy burgers with fresh ingredients'
    },
    {
        id: 'grilled-sandwich',
        label: 'Grilled Sandwich',
        icon: '🥪',
        description: 'Hot and crispy grilled sandwiches'
    },
    {
        id: 'special-combo',
        label: 'Special Combo',
        icon: '🍱',
        description: 'Value combo meals'
    },
    {
        id: 'pasta',
        label: 'Pasta',
        icon: '🍝',
        description: 'Italian pasta varieties'
    },
    {
        id: 'noodles',
        label: 'Noodles',
        icon: '🍜',
        description: 'Asian style noodles'
    },
    {
        id: 'snacks',
        label: 'Snacks',
        icon: '🍿',
        description: 'Quick bites and snacks'
    },
    {
        id: 'milkshakes',
        label: 'Milkshakes',
        icon: '🥤',
        description: 'Thick and creamy milkshakes'
    },
    {
        id: 'cold-drinks',
        label: 'Cold Drinks',
        icon: '🥤',
        description: 'Refreshing cold beverages'
    },
    {
        id: 'rice-items',
        label: 'Rice Items',
        icon: '🍚',
        description: 'Rice-based dishes'
    },
    {
        id: 'sweets',
        label: 'Sweets',
        icon: '🍰',
        description: 'Desserts and sweet treats'
    },
    {
        id: 'sides',
        label: 'Sides',
        icon: '🍟',
        description: 'Side dishes and extras'
    },
] as const;

// Category IDs as type
export type CategoryId = typeof FOOD_CATEGORIES[number]['id'];

// Helper: Get category by ID
export const getCategoryById = (id: string): FoodCategory | undefined => {
    return FOOD_CATEGORIES.find(cat => cat.id === id);
};

// Helper: Get category label
export const getCategoryLabel = (id: string): string => {
    return getCategoryById(id)?.label || id;
};

// Helper: Get category icon
export const getCategoryIcon = (id: string): string => {
    return getCategoryById(id)?.icon || '🍽️';
};

// For admin filters (includes "All" option)
export const ADMIN_CATEGORY_FILTERS = [
    { id: 'all', label: 'All Items', icon: '📋' },
    ...FOOD_CATEGORIES,
] as const;

// For customer menu filters (includes "All" option)
export const CUSTOMER_CATEGORY_FILTERS = [
    { id: 'all', label: 'All', icon: '🍽️' },
    ...FOOD_CATEGORIES,
] as const;

// Categories that support multi-size pricing (only pizza for now)
export const MULTI_SIZE_CATEGORIES = ['pizza'] as const;

// Helper: Check if category supports multi-size pricing
export const isMultiSizeCategory = (categoryId: string): boolean => {
    return MULTI_SIZE_CATEGORIES.includes(categoryId as any);
};

// Export category IDs as array for validation
export const CATEGORY_IDS = FOOD_CATEGORIES.map(cat => cat.id);

export default FOOD_CATEGORIES;
