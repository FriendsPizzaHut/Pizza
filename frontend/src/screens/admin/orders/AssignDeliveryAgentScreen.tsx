import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the route params type
type AssignDeliveryRouteProp = RouteProp<
    { AssignDelivery: { orderId: string; orderDetails: any } },
    'AssignDelivery'
>;

interface DeliveryAgent {
    id: string;
    name: string;
    phone: string;
    email: string;
    rating: number;
    totalDeliveries: number;
    activeDeliveries: number;
    maxDeliveries: number;
    vehicleType: string;
    vehicleNumber: string;
    status: 'online' | 'busy' | 'offline'; // online = available, busy = out for delivery, offline = not logged in
    currentLocation: string;
    distance: string;
    estimatedArrival: string;
    profileImage: string;
}

export default function AssignDeliveryAgentScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<AssignDeliveryRouteProp>();
    const { orderId, orderDetails } = route.params;

    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

    // Mock delivery agents data - in real app, fetch from backend
    const deliveryAgents: DeliveryAgent[] = [
        {
            id: 'DA-001',
            name: 'Mike Johnson',
            phone: '+1 (555) 234-5678',
            email: 'mike.johnson@delivery.com',
            rating: 4.8,
            totalDeliveries: 342,
            activeDeliveries: 1,
            maxDeliveries: 3,
            vehicleType: 'Motorcycle',
            vehicleNumber: 'ABC-1234',
            status: 'busy', // Currently out for delivery
            currentLocation: '2.5 km away',
            distance: '2.5 km',
            estimatedArrival: '8 mins',
            profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        },
        {
            id: 'DA-002',
            name: 'Sarah Chen',
            phone: '+1 (555) 345-6789',
            email: 'sarah.chen@delivery.com',
            rating: 4.9,
            totalDeliveries: 456,
            activeDeliveries: 0,
            maxDeliveries: 3,
            vehicleType: 'Scooter',
            vehicleNumber: 'XYZ-5678',
            status: 'online', // Online and available for delivery
            currentLocation: '1.2 km away',
            distance: '1.2 km',
            estimatedArrival: '5 mins',
            profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        },
        {
            id: 'DA-003',
            name: 'David Miller',
            phone: '+1 (555) 456-7890',
            email: 'david.miller@delivery.com',
            rating: 4.7,
            totalDeliveries: 289,
            activeDeliveries: 2,
            maxDeliveries: 3,
            vehicleType: 'Motorcycle',
            vehicleNumber: 'DEF-9012',
            status: 'busy', // Currently out for delivery (2 active orders)
            currentLocation: '3.8 km away',
            distance: '3.8 km',
            estimatedArrival: '12 mins',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        },
        {
            id: 'DA-004',
            name: 'Emma Davis',
            phone: '+1 (555) 567-8901',
            email: 'emma.davis@delivery.com',
            rating: 4.6,
            totalDeliveries: 198,
            activeDeliveries: 1,
            maxDeliveries: 2,
            vehicleType: 'Bicycle',
            vehicleNumber: 'BIC-3456',
            status: 'online', // Online and available (can take 1 more order)
            currentLocation: '4.5 km away',
            distance: '4.5 km',
            estimatedArrival: '15 mins',
            profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        },
        {
            id: 'DA-005',
            name: 'James Wilson',
            phone: '+1 (555) 678-9012',
            email: 'james.wilson@delivery.com',
            rating: 4.5,
            totalDeliveries: 156,
            activeDeliveries: 0,
            maxDeliveries: 3,
            vehicleType: 'Car',
            vehicleNumber: 'GHI-7890',
            status: 'offline', // Not logged in
            currentLocation: 'Offline',
            distance: 'N/A',
            estimatedArrival: 'N/A',
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        },
    ];

    const getStatusConfig = (status: DeliveryAgent['status']) => {
        switch (status) {
            case 'online':
                return { label: 'Online', color: '#4CAF50', bgColor: '#E8F5E9', icon: 'check-circle' };
            case 'busy':
                return { label: 'Out for Delivery', color: '#FF9800', bgColor: '#FFF3E0', icon: 'delivery-dining' };
            case 'offline':
                return { label: 'Offline', color: '#9E9E9E', bgColor: '#F5F5F5', icon: 'cancel' };
            default:
                return { label: status, color: '#666', bgColor: '#F5F5F5', icon: 'info' };
        }
    };

    const handleAssign = () => {
        if (!selectedAgent) {
            Alert.alert('No Agent Selected', 'Please select a delivery agent to assign this order.');
            return;
        }

        const agent = deliveryAgents.find((a) => a.id === selectedAgent);

        Alert.alert(
            'Confirm Assignment',
            `Assign order ${orderId} to ${agent?.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: () => {
                        // In real app, make API call to assign order
                        Alert.alert(
                            'Success',
                            `Order ${orderId} has been assigned to ${agent?.name}`,
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.goBack(),
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <MaterialIcons key={`full-${i}`} name="star" size={14} color="#FFB800" />
            );
        }
        if (hasHalfStar) {
            stars.push(
                <MaterialIcons key="half" name="star-half" size={14} color="#FFB800" />
            );
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Assign Delivery Agent</Text>
                        <Text style={styles.orderId}>Order {orderId}</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Info Card */}
                <View style={styles.orderInfoCard}>
                    <View style={styles.orderInfoHeader}>
                        <MaterialIcons name="receipt-long" size={20} color="#cb202d" />
                        <Text style={styles.orderInfoTitle}>Order Information</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Customer:</Text>
                        <Text style={styles.orderInfoValue}>{orderDetails?.customer || 'John Doe'}</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Delivery Address:</Text>
                        <Text style={styles.orderInfoValue}>{orderDetails?.deliveryAddress || '123 Main St, Apt 4B'}</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Total Amount:</Text>
                        <Text style={styles.orderInfoValue}>${orderDetails?.total?.toFixed(2) || '35.99'}</Text>
                    </View>
                </View>

                {/* Available Agents Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="delivery-dining" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>Available Delivery Agents</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>
                        Select an agent to assign this order
                    </Text>

                    {deliveryAgents.map((agent) => {
                        const statusConfig = getStatusConfig(agent.status);
                        const isSelected = selectedAgent === agent.id;
                        // Agent can be assigned if: online AND has capacity for more deliveries
                        const isAvailable = (agent.status === 'online' || agent.status === 'busy') && agent.activeDeliveries < agent.maxDeliveries;

                        return (
                            <TouchableOpacity
                                key={agent.id}
                                style={[
                                    styles.agentCard,
                                    isSelected && styles.agentCardSelected,
                                    !isAvailable && styles.agentCardDisabled,
                                ]}
                                onPress={() => {
                                    if (isAvailable) {
                                        setSelectedAgent(agent.id);
                                    } else {
                                        let message = '';
                                        if (agent.status === 'offline') {
                                            message = `${agent.name} is currently offline and not available for delivery.`;
                                        } else {
                                            message = `${agent.name} is at maximum capacity (${agent.activeDeliveries}/${agent.maxDeliveries} deliveries) and cannot take more orders.`;
                                        }
                                        Alert.alert('Agent Unavailable', message);
                                    }
                                }}
                                disabled={!isAvailable}
                                activeOpacity={0.7}
                            >
                                {/* Top Section with Profile */}
                                <View style={styles.agentTopSection}>
                                    <Image
                                        source={{ uri: agent.profileImage }}
                                        style={styles.agentImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.agentInfo}>
                                        <View style={styles.agentNameRow}>
                                            <Text style={styles.agentName}>{agent.name}</Text>
                                            {isSelected && (
                                                <View style={styles.selectedBadge}>
                                                    <MaterialIcons name="check" size={16} color="#fff" />
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.agentId}>{agent.id}</Text>
                                        <View style={styles.ratingRow}>
                                            <View style={styles.starsContainer}>
                                                {renderStars(agent.rating)}
                                            </View>
                                            <Text style={styles.ratingText}>{agent.rating.toFixed(1)}</Text>
                                            <Text style={styles.deliveriesText}>
                                                ({agent.totalDeliveries} deliveries)
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.agentDivider} />

                                {/* Status and Capacity */}
                                <View style={styles.agentDetailsSection}>
                                    <View style={styles.statusRow}>
                                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                                            <MaterialIcons
                                                name={statusConfig.icon as any}
                                                size={14}
                                                color={statusConfig.color}
                                            />
                                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                                {statusConfig.label}
                                            </Text>
                                        </View>
                                        <View style={styles.capacityBadge}>
                                            <Text style={styles.capacityText}>
                                                {agent.activeDeliveries}/{agent.maxDeliveries} orders
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Vehicle Info */}
                                    <View style={styles.vehicleRow}>
                                        <MaterialIcons name="two-wheeler" size={16} color="#666" />
                                        <Text style={styles.vehicleText}>
                                            {agent.vehicleType} • {agent.vehicleNumber}
                                        </Text>
                                    </View>

                                    {/* Location and ETA */}
                                    {agent.status !== 'offline' && (
                                        <View style={styles.locationRow}>
                                            <View style={styles.locationItem}>
                                                <MaterialIcons name="location-on" size={16} color="#FF6B35" />
                                                <Text style={styles.locationText}>{agent.distance}</Text>
                                            </View>
                                            <View style={styles.locationItem}>
                                                <MaterialIcons name="access-time" size={16} color="#2196F3" />
                                                <Text style={styles.locationText}>
                                                    ETA: {agent.estimatedArrival}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Contact Info */}
                                    <View style={styles.contactRow}>
                                        <TouchableOpacity style={styles.contactButton}>
                                            <MaterialIcons name="phone" size={16} color="#2196F3" />
                                            <Text style={styles.contactButtonText}>{agent.phone}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Assign Button */}
            {selectedAgent && (
                <View style={styles.assignButtonContainer}>
                    <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
                        <MaterialIcons name="person-add" size={20} color="#fff" />
                        <Text style={styles.assignButtonText}>
                            Assign to {deliveryAgents.find((a) => a.id === selectedAgent)?.name}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#f4f4f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    orderId: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    headerRight: {
        width: 44,
    },

    content: {
        flex: 1,
    },

    // Order Info Card
    orderInfoCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    orderInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    orderInfoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderInfoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    orderInfoValue: {
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },

    // Section
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 16,
    },

    // Agent Card
    agentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    agentCardSelected: {
        borderColor: '#cb202d',
        backgroundColor: '#FFF5F5',
    },
    agentCardDisabled: {
        opacity: 0.5,
    },
    agentTopSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    agentImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
    },
    agentInfo: {
        flex: 1,
    },
    agentNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    agentName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    selectedBadge: {
        backgroundColor: '#cb202d',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    agentId: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFB800',
        marginRight: 4,
    },
    deliveriesText: {
        fontSize: 12,
        color: '#8E8E93',
    },
    agentDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    agentDetailsSection: {
        gap: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    capacityBadge: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    capacityText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    vehicleText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    contactRow: {
        flexDirection: 'row',
        gap: 8,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    contactButtonText: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: '600',
    },

    // Assign Button
    assignButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    assignButton: {
        backgroundColor: '#cb202d',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
