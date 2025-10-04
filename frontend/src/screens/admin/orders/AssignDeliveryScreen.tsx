import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function AssignDeliveryScreen() {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

    const order = {
        id: '#ORD-12345',
        customer: 'John Doe',
        address: '123 Main Street, Apt 4B',
        total: 35.36,
        estimatedTime: '25 mins',
    };

    const availableDrivers = [
        {
            id: '1',
            name: 'Mike Johnson',
            rating: 4.8,
            deliveries: 145,
            distance: '2.1 km away',
            status: 'Available',
            vehicle: 'Honda Civic (Blue)',
        },
        {
            id: '2',
            name: 'Sarah Chen',
            rating: 4.9,
            deliveries: 189,
            distance: '1.5 km away',
            status: 'Available',
            vehicle: 'Toyota Camry (Silver)',
        },
        {
            id: '3',
            name: 'Alex Rodriguez',
            rating: 4.7,
            deliveries: 98,
            distance: '3.2 km away',
            status: 'Available',
            vehicle: 'Ford Focus (Red)',
        },
        {
            id: '4',
            name: 'Emma Wilson',
            rating: 4.6,
            deliveries: 76,
            distance: '2.8 km away',
            status: 'Completing Delivery',
            vehicle: 'Nissan Sentra (White)',
        },
    ];

    const handleAssignDriver = () => {
        if (selectedDriver) {
            // Handle driver assignment
            console.log('Assigning driver:', selectedDriver);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🚚 Assign Delivery</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.orderCard}>
                    <Text style={styles.orderTitle}>Order Summary</Text>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>{order.id}</Text>
                        <Text style={styles.customer}>{order.customer}</Text>
                        <Text style={styles.address}>{order.address}</Text>
                        <View style={styles.orderMeta}>
                            <Text style={styles.total}>Total: ${order.total}</Text>
                            <Text style={styles.time}>Est. Time: {order.estimatedTime}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.driversSection}>
                    <Text style={styles.sectionTitle}>Available Drivers</Text>

                    {availableDrivers.map((driver) => (
                        <TouchableOpacity
                            key={driver.id}
                            style={[
                                styles.driverCard,
                                selectedDriver === driver.id && styles.selectedDriverCard,
                                driver.status !== 'Available' && styles.unavailableDriverCard
                            ]}
                            onPress={() => driver.status === 'Available' && setSelectedDriver(driver.id)}
                            disabled={driver.status !== 'Available'}
                        >
                            <View style={styles.driverHeader}>
                                <View style={styles.driverInfo}>
                                    <Text style={[
                                        styles.driverName,
                                        driver.status !== 'Available' && styles.unavailableText
                                    ]}>
                                        {driver.name}
                                    </Text>
                                    <Text style={styles.driverVehicle}>{driver.vehicle}</Text>
                                </View>
                                <View style={styles.driverMeta}>
                                    <Text style={[
                                        styles.driverStatus,
                                        { color: driver.status === 'Available' ? '#4CAF50' : '#FF9800' }
                                    ]}>
                                        {driver.status}
                                    </Text>
                                    {selectedDriver === driver.id && (
                                        <Text style={styles.selectedIndicator}>✓ Selected</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.driverStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>⭐ {driver.rating}</Text>
                                    <Text style={styles.statLabel}>Rating</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{driver.deliveries}</Text>
                                    <Text style={styles.statLabel}>Deliveries</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{driver.distance}</Text>
                                    <Text style={styles.statLabel}>Distance</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedDriver && (
                    <View style={styles.assignSection}>
                        <TouchableOpacity style={styles.assignButton} onPress={handleAssignDriver}>
                            <Text style={styles.assignButtonText}>
                                Assign {availableDrivers.find(d => d.id === selectedDriver)?.name}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
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
        backgroundColor: '#2196F3',
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
    orderCard: {
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
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    orderInfo: {
        gap: 8,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    customer: {
        fontSize: 16,
        color: '#333',
    },
    address: {
        fontSize: 14,
        color: '#666',
    },
    orderMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    time: {
        fontSize: 14,
        color: '#666',
    },
    driversSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    driverCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedDriverCard: {
        borderColor: '#2196F3',
        backgroundColor: '#f3f9ff',
    },
    unavailableDriverCard: {
        opacity: 0.6,
        backgroundColor: '#f8f8f8',
    },
    driverHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    driverInfo: {
        flex: 1,
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    driverVehicle: {
        fontSize: 14,
        color: '#666',
    },
    driverMeta: {
        alignItems: 'flex-end',
    },
    driverStatus: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedIndicator: {
        fontSize: 12,
        color: '#2196F3',
        fontWeight: 'bold',
    },
    unavailableText: {
        color: '#999',
    },
    driverStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    assignSection: {
        marginTop: 10,
    },
    assignButton: {
        backgroundColor: '#2196F3',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});