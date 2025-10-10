import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';

/**
 * Loader Component
 * 
 * A reusable loading indicator for displaying loading states.
 * Can be used inline or as a full-screen overlay.
 */

interface LoaderProps {
    visible?: boolean;
    size?: 'small' | 'large';
    color?: string;
    overlay?: boolean;
    text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    visible = true,
    size = 'large',
    color = '#FF6347',
    overlay = false,
    text,
}) => {
    if (!visible) return null;

    const content = (
        <View style={[styles.container, overlay && styles.overlay]}>
            <View style={styles.loaderBox}>
                <ActivityIndicator size={size} color={color} />
                {text && <Text style={styles.text}>{text}</Text>}
            </View>
        </View>
    );

    if (overlay) {
        return (
            <Modal transparent visible={visible} animationType="fade">
                {content}
            </Modal>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loaderBox: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 100,
    },
    text: {
        marginTop: 10,
        fontSize: 14,
        color: '#333333',
    },
});

export default Loader;
