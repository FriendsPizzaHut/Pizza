/**
 * Avatar Utility Functions
 * 
 * Handles avatar-related operations:
 * - Generate initials from name
 * - Generate consistent color from name
 * - Format avatar data
 */

/**
 * Generate initials from name
 * - If single word: returns first letter (e.g., "Naitik" -> "N")
 * - If multiple words: returns first letter of first and last word (e.g., "Naitik Kumar" -> "NK")
 * 
 * @param name - User's full name
 * @returns Initials (1-2 characters)
 */
export const generateInitials = (name: string): string => {
    if (!name || typeof name !== 'string') {
        return '?';
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
        return '?';
    }

    const words = trimmedName.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 0) {
        return '?';
    }

    if (words.length === 1) {
        // Single word: return first letter
        return words[0][0].toUpperCase();
    }

    // Multiple words: return first letter of first and last word
    const firstInitial = words[0][0].toUpperCase();
    const lastInitial = words[words.length - 1][0].toUpperCase();
    return firstInitial + lastInitial;
};

/**
 * Generate a consistent color based on name
 * Uses simple hash to generate color from string
 * 
 * @param name - User's name
 * @returns Hex color code
 */
export const getAvatarColor = (name: string): string => {
    if (!name || typeof name !== 'string') {
        return '#999999'; // Default gray
    }

    // Predefined color palette for avatars (professional, distinguishable colors)
    const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#FFA07A', // Light Salmon
        '#98D8C8', // Mint
        '#F7DC6F', // Yellow
        '#BB8FCE', // Purple
        '#85C1E2', // Sky Blue
        '#F8B739', // Orange
        '#52B788', // Green
        '#E63946', // Dark Red
        '#457B9D', // Steel Blue
        '#F77F00', // Burnt Orange
        '#06AED5', // Cyan
        '#DD1C1A', // Crimson
    ];

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Map hash to color index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

/**
 * Check if avatar is an image URL or initials
 * 
 * @param avatar - Avatar string (URL or initials)
 * @returns true if URL, false if initials
 */
export const isAvatarUrl = (avatar: string | null | undefined): boolean => {
    if (!avatar) {
        return false;
    }
    return avatar.startsWith('http://') || avatar.startsWith('https://');
};

/**
 * Get display avatar data
 * Returns object with type, content, and color
 * 
 * @param name - User's name
 * @param avatar - Avatar URL or null
 * @returns Avatar display data
 */
export const getAvatarData = (name: string, avatar?: string | null): {
    type: 'image' | 'initials';
    content: string;
    color: string;
} => {
    if (avatar && isAvatarUrl(avatar)) {
        return {
            type: 'image',
            content: avatar,
            color: '#ffffff', // Not used for images
        };
    }

    return {
        type: 'initials',
        content: generateInitials(name),
        color: getAvatarColor(name),
    };
};
