/**
 * Date Formatting Utilities
 * 
 * Provides helper functions for formatting dates and times.
 */

/**
 * Format date to readable string
 * @param date Date object or string
 * @param format Format type
 */
export const formatDate = (
    date: Date | string,
    format: 'short' | 'long' | 'time' | 'datetime' | 'relative' = 'short'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    switch (format) {
        case 'short':
            // Example: 12/25/2023
            return dateObj.toLocaleDateString();

        case 'long':
            // Example: December 25, 2023
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

        case 'time':
            // Example: 3:30 PM
            return dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });

        case 'datetime':
            // Example: Dec 25, 2023 at 3:30 PM
            return `${dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })} at ${dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })}`;

        case 'relative':
            return formatRelativeTime(dateObj);

        default:
            return dateObj.toLocaleDateString();
    }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format delivery time estimate
 */
export const formatDeliveryTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours}h ${remainingMinutes}m`;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return (
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
    );
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear()
    );
};

/**
 * Get time of day greeting
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

/**
 * Format order placed time
 */
export const formatOrderTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isToday(dateObj)) {
        return `Today at ${formatDate(dateObj, 'time')}`;
    }

    if (isYesterday(dateObj)) {
        return `Yesterday at ${formatDate(dateObj, 'time')}`;
    }

    return formatDate(dateObj, 'datetime');
};

export default {
    formatDate,
    formatRelativeTime,
    formatDeliveryTime,
    isToday,
    isYesterday,
    getGreeting,
    formatOrderTime,
};
