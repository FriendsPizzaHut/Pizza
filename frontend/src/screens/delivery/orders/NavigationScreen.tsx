import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function NavigationScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🗺️ Navigation</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>📍 Map View</Text>
                    <Text style={styles.mapSubtext}>Integrated navigation will be shown here</Text>
                </View>

                <View style={styles.destinationCard}>
                    <Text style={styles.destinationTitle}>Delivery Address</Text>
                    <Text style={styles.address}>123 Main Street, Apt 4B</Text>
                    <Text style={styles.city}>New York, NY 10001</Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.callButton}>
                            <Text style={styles.buttonText}>📞 Call Customer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.arrivedButton}>
                            <Text style={styles.buttonText}>✅ Mark as Arrived</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        margin: 20,
        borderRadius: 10,
    },
    mapText: {
        fontSize: 48,
        marginBottom: 10,
    },
    mapSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    destinationCard: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    destinationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    address: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    city: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    callButton: {
        backgroundColor: '#2196F3',
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    arrivedButton: {
        backgroundColor: '#4CAF50',
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});