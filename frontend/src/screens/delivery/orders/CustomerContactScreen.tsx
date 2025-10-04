import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export default function CustomerContactScreen() {
    const customer = {
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, Apt 4B',
        orderNumber: '#ORD-12345',
    };

    const handleCall = () => {
        Linking.openURL(`tel:${customer.phone}`);
    };

    const handleSMS = () => {
        Linking.openURL(`sms:${customer.phone}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📞 Customer Contact</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.customerCard}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <Text style={styles.orderNumber}>{customer.orderNumber}</Text>
                    <Text style={styles.address}>{customer.address}</Text>
                </View>

                <View style={styles.contactOptions}>
                    <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                        <Text style={styles.contactIcon}>📞</Text>
                        <Text style={styles.contactText}>Call Customer</Text>
                        <Text style={styles.contactSubtext}>{customer.phone}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactButton} onPress={handleSMS}>
                        <Text style={styles.contactIcon}>💬</Text>
                        <Text style={styles.contactText}>Send Message</Text>
                        <Text style={styles.contactSubtext}>Quick SMS</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.quickMessages}>
                    <Text style={styles.sectionTitle}>Quick Messages</Text>

                    <TouchableOpacity style={styles.messageButton}>
                        <Text style={styles.messageText}>🚚 "I'm on my way to your location"</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.messageButton}>
                        <Text style={styles.messageText}>📍 "I've arrived at your address"</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.messageButton}>
                        <Text style={styles.messageText}>🔍 "I'm having trouble finding your location"</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.messageButton}>
                        <Text style={styles.messageText}>✅ "Your order has been delivered"</Text>
                    </TouchableOpacity>
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
        padding: 20,
    },
    customerCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    customerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    orderNumber: {
        fontSize: 16,
        color: '#4CAF50',
        marginBottom: 10,
    },
    address: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    contactOptions: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    contactButton: {
        backgroundColor: '#fff',
        flex: 1,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactIcon: {
        fontSize: 32,
        marginBottom: 10,
    },
    contactText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    contactSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    quickMessages: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    messageButton: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    messageText: {
        fontSize: 14,
        color: '#333',
    },
});