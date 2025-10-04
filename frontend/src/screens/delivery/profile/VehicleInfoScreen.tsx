import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default function VehicleInfoScreen() {
    const [vehicleInfo, setVehicleInfo] = useState({
        type: 'Car',
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        color: 'Silver',
        licensePlate: 'ABC-123',
        insurance: 'State Farm - Policy #12345',
        registration: 'Valid until 12/2024',
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        setIsEditing(false);
        // Here you would save the vehicle info to backend
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🚗 Vehicle Information</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.vehicleCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Vehicle Details</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setIsEditing(!isEditing)}
                        >
                            <Text style={styles.editButtonText}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Vehicle Type</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={vehicleInfo.type}
                                    onChangeText={(text) => setVehicleInfo({ ...vehicleInfo, type: text })}
                                />
                            ) : (
                                <Text style={styles.value}>{vehicleInfo.type}</Text>
                            )}
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Make</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={vehicleInfo.make}
                                    onChangeText={(text) => setVehicleInfo({ ...vehicleInfo, make: text })}
                                />
                            ) : (
                                <Text style={styles.value}>{vehicleInfo.make}</Text>
                            )}
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Model</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={vehicleInfo.model}
                                    onChangeText={(text) => setVehicleInfo({ ...vehicleInfo, model: text })}
                                />
                            ) : (
                                <Text style={styles.value}>{vehicleInfo.model}</Text>
                            )}
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Year</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={vehicleInfo.year}
                                    onChangeText={(text) => setVehicleInfo({ ...vehicleInfo, year: text })}
                                    keyboardType="numeric"
                                />
                            ) : (
                                <Text style={styles.value}>{vehicleInfo.year}</Text>
                            )}
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Color</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={vehicleInfo.color}
                                    onChangeText={(text) => setVehicleInfo({ ...vehicleInfo, color: text })}
                                />
                            ) : (
                                <Text style={styles.value}>{vehicleInfo.color}</Text>
                            )}
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.label}>License Plate</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.textInput}
                                    value={vehicleInfo.licensePlate}
                                    onChangeText={(text) => setVehicleInfo({ ...vehicleInfo, licensePlate: text })}
                                />
                            ) : (
                                <Text style={styles.value}>{vehicleInfo.licensePlate}</Text>
                            )}
                        </View>
                    </View>

                    {isEditing && (
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.documentsCard}>
                    <Text style={styles.cardTitle}>Required Documents</Text>

                    <View style={styles.documentItem}>
                        <Text style={styles.documentIcon}>📋</Text>
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentTitle}>Vehicle Registration</Text>
                            <Text style={styles.documentStatus}>{vehicleInfo.registration}</Text>
                        </View>
                        <Text style={styles.documentStatus}>✅</Text>
                    </View>

                    <View style={styles.documentItem}>
                        <Text style={styles.documentIcon}>🛡️</Text>
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentTitle}>Insurance</Text>
                            <Text style={styles.documentStatus}>{vehicleInfo.insurance}</Text>
                        </View>
                        <Text style={styles.documentStatus}>✅</Text>
                    </View>

                    <View style={styles.documentItem}>
                        <Text style={styles.documentIcon}>🪪</Text>
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentTitle}>Driver's License</Text>
                            <Text style={styles.documentStatus}>Valid until 08/2026</Text>
                        </View>
                        <Text style={styles.documentStatus}>✅</Text>
                    </View>
                </View>

                <View style={styles.notificationCard}>
                    <Text style={styles.notificationTitle}>💡 Important Notice</Text>
                    <Text style={styles.notificationText}>
                        Keep your vehicle information and documents up to date to ensure uninterrupted delivery service.
                        You will be notified before any document expires.
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
    vehicleCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    editButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    infoGrid: {
        gap: 15,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    label: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        fontSize: 16,
        flex: 1,
        marginLeft: 10,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    documentsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    documentIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    documentInfo: {
        flex: 1,
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    documentStatus: {
        fontSize: 14,
        color: '#666',
    },
    notificationCard: {
        backgroundColor: '#fff3cd',
        padding: 20,
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    notificationText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 18,
    },
});