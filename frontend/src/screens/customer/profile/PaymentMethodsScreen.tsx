import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function PaymentMethodsScreen() {
    const paymentMethods = [
        {
            id: 1,
            type: 'card',
            name: 'Visa ending in 4242',
            icon: '💳',
            isDefault: true,
        },
        {
            id: 2,
            type: 'card',
            name: 'Mastercard ending in 8888',
            icon: '💳',
            isDefault: false,
        },
        {
            id: 3,
            type: 'digital',
            name: 'PayPal',
            icon: '💰',
            isDefault: false,
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>💳 Payment Methods</Text>
            </View>

            <ScrollView style={styles.content}>
                {paymentMethods.map((method) => (
                    <View key={method.id} style={styles.paymentCard}>
                        <View style={styles.paymentHeader}>
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentIcon}>{method.icon}</Text>
                                <View>
                                    <Text style={styles.paymentName}>{method.name}</Text>
                                    {method.isDefault && (
                                        <Text style={styles.defaultText}>Default Payment Method</Text>
                                    )}
                                </View>
                            </View>

                            {method.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.editButton}>
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            {!method.isDefault && (
                                <>
                                    <TouchableOpacity style={styles.setDefaultButton}>
                                        <Text style={styles.setDefaultButtonText}>Set Default</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteButton}>
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add Payment Method</Text>
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>💡 Payment Info</Text>
                    <Text style={styles.infoText}>
                        • All payment information is securely encrypted{'\n'}
                        • You can change your default payment method anytime{'\n'}
                        • Cash on delivery is also available for all orders
                    </Text>
                </View>
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
    paymentCard: {
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
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    defaultText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    defaultBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    defaultBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
        flex: 1,
    },
    editButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
    },
    setDefaultButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
        flex: 1,
    },
    setDefaultButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
        flex: 1,
    },
    deleteButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});