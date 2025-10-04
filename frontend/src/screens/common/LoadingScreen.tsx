import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>🍕</Text>
            <Text style={styles.title}>Friends Pizza Hut</Text>
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
            <Text style={styles.subtitle}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    loader: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});