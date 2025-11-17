/**
 * User Service
 * 
 * Handles user profile-related API calls
 */

import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UpdateProfileImageResponse {
    success: boolean;
    message: string;
    data: {
        profileImage: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: string;
            profileImage: string;
        };
    };
}

/**
 * Update user profile image
 * @param userId - User ID
 * @param profileImageUrl - Cloudinary URL of uploaded image
 * @returns Updated user data
 */
export const updateProfileImage = async (
    userId: string,
    profileImageUrl: string
): Promise<UpdateProfileImageResponse> => {
    try {
        const response = await apiClient.put(
            `/users/${userId}/profile-image`,
            { profileImage: profileImageUrl }
        );

        // Update stored user data
        const storedUser = await AsyncStorage.getItem('@user_data');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.profileImage = profileImageUrl;
            await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        }

        return response.data;
    } catch (error: any) {
        throw {
            message: error.response?.data?.message || 'Failed to update profile image',
            statusCode: error.response?.status || 500,
        };
    }
};

export default {
    updateProfileImage,
};
