/**
 * Avatar Component
 * 
 * Displays user avatar:
 * - Shows profile image if available
 * - Shows initials with colored background if no image
 * - Customizable size
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { getAvatarData } from '../../utils/avatarUtils';

interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: number;
    style?: ViewStyle;
    fontSize?: number;
}

export default function Avatar({
    name,
    imageUrl,
    size = 80,
    style,
    fontSize
}: AvatarProps) {
    const avatarData = getAvatarData(name, imageUrl);
    const calculatedFontSize = fontSize || size * 0.4;

    if (avatarData.type === 'image') {
        return (
            <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
                <Image
                    source={{ uri: avatarData.content }}
                    style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
                    resizeMode="cover"
                />
            </View>
        );
    }

    // Initials
    return (
        <View
            style={[
                styles.container,
                styles.initialsContainer,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: avatarData.color,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.initials,
                    { fontSize: calculatedFontSize },
                ]}
            >
                {avatarData.content}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    initialsContainer: {
        // Additional styles for initials container
    },
    image: {
        // Image covers the entire container
    },
    initials: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
