import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function DeliveryAddressesScreen() {
    const addresses = [
        {
            id: 1,
            title: 'Home',
            address: '123 Main Street, Apt 4B',
            city: 'New York, NY 10001',
            isDefault: true,
        },
        {
            id: 2,
            title: 'Work',
            address: '456 Business Ave, Suite 200',
            city: 'New York, NY 10002',
            isDefault: false,
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📍 Delivery Addresses</Text>
            </View>

            <ScrollView style={styles.content}>
                {addresses.map((address) => (
                    <View key={address.id} style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                            <Text style={styles.addressTitle}>{address.title}</Text>
                            {address.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultText}>DEFAULT</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.addressLine}>{address.address}</Text>
                        <Text style={styles.cityLine}>{address.city}</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.editButton}>
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            {!address.isDefault && (
                                <TouchableOpacity style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#FF6B6B',
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
        padding: 20,
    },
    addressCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    defaultBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    addressLine: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    cityLine: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        flex: 1,
    },
    editButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        flex: 1,
    },
    deleteButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});