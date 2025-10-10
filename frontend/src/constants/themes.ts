/**
 * Role-Based Themes
 * 
 * Theme configurations for different user roles.
 * Each role has a distinct color scheme for better UX.
 */

import { UserRole } from '../types/auth';

export interface Theme {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    disabled: string;
    placeholder: string;
}

// Customer Theme - Orange/Tomato
export const CUSTOMER_THEME: Theme = {
    primary: '#FF6347', // Tomato
    primaryDark: '#E04A2E',
    primaryLight: '#FF8567',
    secondary: '#FFA500', // Orange
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    border: '#E0E0E0',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
};

// Delivery Theme - Green
export const DELIVERY_THEME: Theme = {
    primary: '#4CAF50', // Green
    primaryDark: '#388E3C',
    primaryLight: '#66BB6A',
    secondary: '#8BC34A', // Light Green
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    border: '#E0E0E0',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
};

// Admin Theme - Blue
export const ADMIN_THEME: Theme = {
    primary: '#2196F3', // Blue
    primaryDark: '#1976D2',
    primaryLight: '#42A5F5',
    secondary: '#03A9F4', // Light Blue
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    border: '#E0E0E0',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
};

// Get theme by role
export const getThemeByRole = (role: UserRole | null): Theme => {
    switch (role) {
        case 'customer':
            return CUSTOMER_THEME;
        case 'delivery':
            return DELIVERY_THEME;
        case 'admin':
            return ADMIN_THEME;
        default:
            return CUSTOMER_THEME; // Default to customer theme
    }
};

// Common colors (role-agnostic)
export const COMMON_COLORS = {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
};

// Gradients
export const GRADIENTS = {
    customer: ['#FF6347', '#FFA500'],
    delivery: ['#4CAF50', '#8BC34A'],
    admin: ['#2196F3', '#03A9F4'],
};

export default {
    CUSTOMER_THEME,
    DELIVERY_THEME,
    ADMIN_THEME,
    getThemeByRole,
    COMMON_COLORS,
    GRADIENTS,
};
