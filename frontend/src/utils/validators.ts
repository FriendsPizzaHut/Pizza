/**
 * Validation Utilities
 * 
 * Provides helper functions for validating user inputs.
 */

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone: string): boolean => {
    // Matches: 10 digits, optionally starting with +91 or 0
    const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validate password strength
 */
export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate name (no numbers or special characters except spaces, hyphens, apostrophes)
 */
export const isValidName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
};

/**
 * Validate Indian PIN code
 */
export const isValidPinCode = (pinCode: string): boolean => {
    const pinCodeRegex = /^[1-9][0-9]{5}$/;
    return pinCodeRegex.test(pinCode);
};

/**
 * Validate coupon code format
 */
export const isValidCouponCode = (code: string): boolean => {
    // Alphanumeric, 4-20 characters
    const couponRegex = /^[A-Z0-9]{4,20}$/;
    return couponRegex.test(code.toUpperCase());
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: any): boolean => {
    return !isNaN(value) && Number(value) > 0;
};

/**
 * Validate quantity (integer between min and max)
 */
export const isValidQuantity = (
    quantity: any,
    min: number = 1,
    max: number = 99
): boolean => {
    const num = Number(quantity);
    return Number.isInteger(num) && num >= min && num <= max;
};

/**
 * Validate date (must be in future)
 */
export const isFutureDate = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() > Date.now();
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/**
 * Validate string length
 */
export const isValidLength = (
    str: string,
    min: number,
    max?: number
): boolean => {
    const length = str.trim().length;
    if (max !== undefined) {
        return length >= min && length <= max;
    }
    return length >= min;
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\D/g, '');

    if (cleaned.length < 13 || cleaned.length > 19) {
        return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

/**
 * Validate CVV
 */
export const isValidCVV = (cvv: string): boolean => {
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(cvv);
};

/**
 * Sanitize string (remove special characters)
 */
export const sanitizeString = (str: string): string => {
    return str.replace(/[^\w\s-]/gi, '');
};

/**
 * Validate address
 */
export interface AddressValidation {
    isValid: boolean;
    errors: string[];
}

export const validateAddress = (address: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
}): AddressValidation => {
    const errors: string[] = [];

    if (!isRequired(address.street) || !isValidLength(address.street || '', 5)) {
        errors.push('Street address must be at least 5 characters');
    }

    if (!isRequired(address.city) || !isValidLength(address.city || '', 2)) {
        errors.push('City must be at least 2 characters');
    }

    if (!isRequired(address.state) || !isValidLength(address.state || '', 2)) {
        errors.push('State must be at least 2 characters');
    }

    if (!isValidPinCode(address.pinCode || '')) {
        errors.push('Invalid PIN code');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export default {
    isValidEmail,
    isValidPhone,
    validatePassword,
    isValidName,
    isValidPinCode,
    isValidCouponCode,
    isValidUrl,
    isPositiveNumber,
    isValidQuantity,
    isFutureDate,
    isRequired,
    isValidLength,
    isValidCreditCard,
    isValidCVV,
    sanitizeString,
    validateAddress,
};
