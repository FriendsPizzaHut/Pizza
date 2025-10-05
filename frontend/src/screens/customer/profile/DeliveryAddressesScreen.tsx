import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export default function DeliveryAddressesScreen() {
    const navigation = useNavigation();

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
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Clean Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Delivery Addresses</Text>
                    <View style={styles.placeholder} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Add New Address Button at Top */}
                <TouchableOpacity style={styles.addAddressButton}>
                    <View style={styles.addAddressContent}>
                        <View style={styles.addIconContainer}>
                            <MaterialIcons name="add-location-alt" size={24} color="#cb202d" />
                        </View>
                        <Text style={styles.addAddressText}>Add New Address</Text>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </View>
                </TouchableOpacity>

                {/* Saved Addresses */}
                <Text style={styles.sectionTitle}>Saved Addresses</Text>

                {addresses.map((address) => (
                    <View key={address.id} style={styles.addressCard}>
                        <View style={styles.addressContent}>
                            <View style={styles.addressLeft}>
                                <View style={styles.addressTypeIcon}>
                                    <MaterialIcons
                                        name={address.title === 'Home' ? 'home' : 'business'}
                                        size={20}
                                        color={address.isDefault ? '#cb202d' : '#666'}
                                    />
                                </View>
                                <View style={styles.addressDetails}>
                                    <View style={styles.addressTitleRow}>
                                        <Text style={styles.addressTitle}>{address.title}</Text>
                                        {address.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultText}>DEFAULT</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.addressLine} numberOfLines={2}>
                                        {address.address}, {address.city}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.addressActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <MaterialIcons name="edit" size={18} color="#666" />
                                </TouchableOpacity>
                                {!address.isDefault && (
                                    <TouchableOpacity style={[styles.actionButton, styles.deleteAction]}>
                                        <MaterialIcons name="delete-outline" size={18} color="#ff4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    addAddressButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addAddressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    addIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addAddressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 12,
        marginLeft: 4,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    addressLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    addressTypeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addressDetails: {
        flex: 1,
    },
    addressTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: '#cb202d',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    defaultText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    addressLine: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    addressActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAction: {
        backgroundColor: '#FFEBEE',
    },
    bottomSpacing: {
        height: 40,
    },
});