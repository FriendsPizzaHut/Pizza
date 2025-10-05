/**
 * Design System - Typography & Color System
 * Consistent design tokens for the entire application
 */

// =================== TYPOGRAPHY SYSTEM ===================

export const Typography = {
    // REGULAR (400 weight)
    regular: {
        text900: { fontSize: 27, fontWeight: '400' as const },
        text800: { fontSize: 24, fontWeight: '400' as const },
        text700: { fontSize: 21, fontWeight: '400' as const },
        text600: { fontSize: 19, fontWeight: '400' as const },
        text500: { fontSize: 17, fontWeight: '400' as const },
        text400: { fontSize: 15, fontWeight: '400' as const },
        text300: { fontSize: 13, fontWeight: '400' as const },
        text200: { fontSize: 12, fontWeight: '400' as const },
        text100: { fontSize: 11, fontWeight: '400' as const },
    },

    // MEDIUM (500 weight)
    medium: {
        text900: { fontSize: 27, fontWeight: '500' as const },
        text800: { fontSize: 24, fontWeight: '500' as const },
        text700: { fontSize: 21, fontWeight: '500' as const },
        text600: { fontSize: 19, fontWeight: '500' as const },
        text500: { fontSize: 17, fontWeight: '500' as const },
        text400: { fontSize: 15, fontWeight: '500' as const },
        text300: { fontSize: 13, fontWeight: '500' as const },
        text200: { fontSize: 12, fontWeight: '500' as const },
        text100: { fontSize: 11, fontWeight: '500' as const },
    },

    // SEMIBOLD (600 weight)
    semibold: {
        text900: { fontSize: 27, fontWeight: '600' as const },
        text800: { fontSize: 24, fontWeight: '600' as const },
        text700: { fontSize: 21, fontWeight: '600' as const },
        text600: { fontSize: 19, fontWeight: '600' as const },
        text500: { fontSize: 17, fontWeight: '600' as const },
        text400: { fontSize: 15, fontWeight: '600' as const },
        text300: { fontSize: 13, fontWeight: '600' as const },
        text200: { fontSize: 12, fontWeight: '600' as const },
        text100: { fontSize: 11, fontWeight: '600' as const },
    },
};

// =================== COLOR SYSTEM ===================

export const Colors = {
    // RED SHADES (#E23744 base)
    red: {
        red100: '#FEF1F2', // Lightest
        red200: '#FCE2E3',
        red300: '#F8BCC0',
        red400: '#F3969D',
        red500: '#E23744', // Base color
        red600: '#D1283A',
        red700: '#B21E2F',
        red800: '#941523',
        red900: '#770C18', // Darkest
    },

    // YELLOW SHADES (#F8D149 base)
    yellow: {
        yellow100: '#FFFBEB',
        yellow200: '#FEF5D7',
        yellow300: '#FDEBA6',
        yellow400: '#FBE175',
        yellow500: '#F8D149', // Base color
        yellow600: '#E6BD2A',
        yellow700: '#D4A91C',
        yellow800: '#B8940F',
        yellow900: '#9C7F07',
    },

    // BLUE SHADES (#2781E7 base)
    blue: {
        blue100: '#EFF6FF',
        blue200: '#DBEAFE',
        blue300: '#BFDBFE',
        blue400: '#93C5FD',
        blue500: '#2781E7', // Base color
        blue600: '#1E6BD4',
        blue700: '#1656C1',
        blue800: '#0D41AE',
        blue900: '#062D9B',
    },

    // TEAL SHADES (#009999 base)
    teal: {
        teal100: '#F0FDFA',
        teal200: '#CCFBF1',
        teal300: '#99F6E4',
        teal400: '#5EEAD4',
        teal500: '#009999', // Base color
        teal600: '#008080',
        teal700: '#006666',
        teal800: '#004D4D',
        teal900: '#003333',
    },

    // COAL SHADES (#1C1C1C base)
    coal: {
        coal100: '#F7F7F7',
        coal200: '#E3E3E3',
        coal300: '#CDCDCD',
        coal400: '#B4B4B4',
        coal500: '#1C1C1C', // Base color
        coal600: '#191919',
        coal700: '#161616',
        coal800: '#121212',
        coal900: '#0F0F0F',
    },

    // GREY SHADES (#4F4F4F base)
    grey: {
        grey100: '#F9F9F9',
        grey200: '#F0F0F0',
        grey300: '#D9D9D9',
        grey400: '#BFBFBF',
        grey500: '#4F4F4F', // Base color
        grey600: '#404040',
        grey700: '#333333',
        grey800: '#262626',
        grey900: '#1A1A1A',
    },

    // SEMANTIC COLORS (using the design system colors)
    primary: '#E23744',    // red500
    secondary: '#2781E7',  // blue500
    success: '#009999',    // teal500
    warning: '#F8D149',    // yellow500
    error: '#E23744',      // red500

    // NEUTRAL COLORS
    background: '#F9F9F9',  // grey100
    surface: '#FFFFFF',
    text: {
        primary: '#1C1C1C',   // coal500
        secondary: '#4F4F4F', // grey500
        tertiary: '#BFBFBF',  // grey400
        disabled: '#D9D9D9',  // grey300
    },
    border: {
        light: '#F0F0F0',    // grey200
        medium: '#D9D9D9',   // grey300
        dark: '#BFBFBF',     // grey400
    }
};

// =================== SPACING SYSTEM ===================

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// =================== BORDER RADIUS SYSTEM ===================

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
};

// =================== SHADOW SYSTEM ===================

export const Shadows = {
    sm: {
        shadowColor: Colors.coal.coal500,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: Colors.coal.coal500,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: Colors.coal.coal500,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    xl: {
        shadowColor: Colors.coal.coal500,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 6,
    },
};

// =================== HELPER FUNCTIONS ===================

/**
 * Get typography style by category and size
 */
export const getTypography = (category: keyof typeof Typography, size: string) => {
    return Typography[category][size as keyof typeof Typography[typeof category]] || Typography.regular.text400;
};

/**
 * Get color by category and shade
 */
export const getColor = (category: keyof typeof Colors, shade?: string) => {
    if (shade && typeof Colors[category] === 'object' && Colors[category][shade as keyof typeof Colors[typeof category]]) {
        return Colors[category][shade as keyof typeof Colors[typeof category]];
    }
    return Colors[category] as string;
};

/**
 * Create consistent button styles
 */
export const createButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const baseStyle = {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    };

    switch (variant) {
        case 'primary':
            return {
                ...baseStyle,
                backgroundColor: Colors.primary,
            };
        case 'secondary':
            return {
                ...baseStyle,
                backgroundColor: Colors.secondary,
            };
        case 'outline':
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: Colors.primary,
            };
        default:
            return baseStyle;
    }
};

/**
 * Create consistent card styles
 */
export const createCardStyle = (elevation: 'sm' | 'md' | 'lg' = 'md') => {
    return {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        ...Shadows[elevation],
    };
};