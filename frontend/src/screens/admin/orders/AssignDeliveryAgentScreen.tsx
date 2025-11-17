import React, { useState, useEffect, useRef } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../../api/axiosInstance';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { SOCKET_URL, SOCKET_OPTIONS } from '../../../config/socket.config';

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
    profileImage: string;
    isOnline: boolean;
    isApproved: boolean; // Only show approved agents
}

export default function AssignDeliveryAgentScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<AssignDeliveryRouteProp>();
    const { orderId, orderDetails } = route.params;
    const { userId } = useSelector((state: RootState) => state.auth);

    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    // Format address object to string
    const formatAddress = (address: any): string => {
        if (!address) return 'N/A';
        if (typeof address === 'string') return address;

        const parts = [
            address.street,
            address.city,
            address.state,
            address.pincode || address.zipCode
        ].filter(Boolean);

        return parts.join(', ') || 'N/A';
    };

    // Format customer name
    const getCustomerName = (): string => {
        if (orderDetails?.user?.name) return orderDetails.user.name;
        if (orderDetails?.customer?.name) return orderDetails.customer.name;
        if (orderDetails?.customer && typeof orderDetails.customer === 'string') return orderDetails.customer;
        return 'Customer';
    };

    const customerName = getCustomerName();
    const deliveryAddress = formatAddress(orderDetails?.deliveryAddress);
    const totalAmount = orderDetails?.totalAmount || orderDetails?.total || 0;

    // Fetch delivery agents from API
    useEffect(() => {
        fetchDeliveryAgents();
    }, []);

    // ✅ Socket connection for real-time agent status updates
    useEffect(() => {
        if (!userId) {
            return;
        }

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            // Register as admin to join admin room
            socket.emit('register', {
                userId: userId,
                role: 'admin'
            });
        });

        socket.on('registered', (data) => {
            // Registration confirmed - listening for status updates
        });

        socket.on('disconnect', () => {
        });

        socket.on('connect_error', (error) => {
            console.error('❌ [ADMIN-ASSIGN] Connection error:', error.message);
        });

        // ✅ Listen for delivery agent status changes
        socket.on('delivery:agent:status:update', (data: any) => {
            setDeliveryAgents(prevAgents => {
                const updated = prevAgents.map(agent => {
                    if (agent.id === data.deliveryAgentId) {
                        const newStatus: 'online' | 'busy' | 'offline' =
                            data.state === 'free' ? 'online' :
                                data.state === 'busy' ? 'busy' : 'offline';

                        return {
                            ...agent,
                            isOnline: data.isOnline,
                            status: newStatus
                        };
                    }
                    return agent;
                });

                return updated;
            });
        });

        return () => {
            socket.off('connect');
            socket.off('registered');
            socket.off('disconnect');
            socket.off('delivery:agent:status:update');
            socket.disconnect();
        };
    }, [userId]);

    const fetchDeliveryAgents = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get('/users/delivery-agents/all');

            if (response.data.success && response.data.data.agents) {
                // Filter to show only approved agents
                const approvedAgents = response.data.data.agents.filter(
                    (agent: DeliveryAgent) => agent.isApproved === true
                );
                setDeliveryAgents(approvedAgents);
            }
        } catch (error: any) {
            console.error('❌ Error fetching delivery agents:', error.message);
            Alert.alert(
                'Error',
                'Failed to load delivery agents. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Delivery agents are now fetched from API in useEffect

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

    const handleAssign = async () => {
        if (!selectedAgent) {
            Alert.alert('No Agent Selected', 'Please select a delivery agent to assign this order.');
            return;
        }

        const agent = deliveryAgents.find((a) => a.id === selectedAgent);
        if (!agent) return;

        // Check if agent is busy and show warning
        if (agent.status === 'busy') {
            Alert.alert(
                'Agent is Busy',
                `${agent.name} is currently out for delivery with ${agent.activeDeliveries} active order(s). Do you still want to assign this order?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Assign Anyway',
                        style: 'destructive',
                        onPress: () => performAssignment(agent),
                    },
                ]
            );
        } else {
            // Agent is online and available - proceed with confirmation
            Alert.alert(
                'Confirm Assignment',
                `Assign order ${orderId} to ${agent.name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Assign',
                        onPress: () => performAssignment(agent),
                    },
                ]
            );
        }
    };

    const performAssignment = async (agent: DeliveryAgent) => {
        try {
            setAssigning(true);

            const response = await axiosInstance.patch(`/orders/${orderDetails._id || orderDetails.id}/assign-delivery`, {
                deliveryAgentId: agent.id
            });

            Alert.alert(
                'Success',
                `Order ${orderId} has been assigned to ${agent.name}`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ Error assigning order:', error.message);
            Alert.alert(
                'Assignment Failed',
                error.response?.data?.message || 'Failed to assign delivery agent. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setAssigning(false);
        }
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
                    {/* Header with gradient-like background */}
                    <View style={styles.orderInfoHeader}>
                        <View style={styles.orderInfoHeaderLeft}>
                            <View style={styles.orderIconContainer}>
                                <MaterialIcons name="receipt-long" size={24} color="#cb202d" />
                            </View>
                            <View>
                                <Text style={styles.orderInfoTitle}>Order Information</Text>
                                <Text style={styles.orderIdText}>#{orderId}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.orderInfoDivider} />

                    {/* Customer Info */}
                    <View style={styles.orderInfoSection}>
                        <View style={styles.infoIconRow}>
                            <View style={styles.infoIconCircle}>
                                <MaterialIcons name="person" size={18} color="#2196F3" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Customer</Text>
                                <Text style={styles.infoValue}>{customerName}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.orderInfoSection}>
                        <View style={styles.infoIconRow}>
                            <View style={styles.infoIconCircle}>
                                <MaterialIcons name="location-on" size={18} color="#FF6B35" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Delivery Address</Text>
                                <Text style={styles.infoValue}>{deliveryAddress}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Total Amount */}
                    <View style={styles.orderInfoSection}>
                        <View style={styles.infoIconRow}>
                            <View style={styles.infoIconCircle}>
                                <MaterialIcons name="account-balance-wallet" size={18} color="#4CAF50" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Total Amount</Text>
                                <Text style={styles.infoValueAmount}>₹{totalAmount.toFixed(0)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Currently Assigned Agent Section (if order is already assigned) */}
                {orderDetails.status === 'assigned' && orderDetails.deliveryAgent && (
                    <View style={styles.section}>
                        <View style={styles.currentAssignmentCard}>
                            <View style={styles.currentAssignmentHeader}>
                                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                                <Text style={styles.currentAssignmentTitle}>Currently Assigned</Text>
                            </View>
                            <View style={styles.currentAssignmentBody}>
                                <View style={styles.currentAgentInfo}>
                                    <MaterialIcons name="person" size={20} color="#2E7D32" />
                                    <Text style={styles.currentAgentName}>
                                        {orderDetails.deliveryAgent.name || orderDetails.deliveryAgentDetails?.name}
                                    </Text>
                                </View>
                                <View style={styles.currentAgentInfo}>
                                    <MaterialIcons name="phone" size={20} color="#2E7D32" />
                                    <Text style={styles.currentAgentPhone}>
                                        {orderDetails.deliveryAgent.phone || orderDetails.deliveryAgentDetails?.phone}
                                    </Text>
                                </View>
                                {orderDetails.deliveryAgentDetails?.vehicleNumber && (
                                    <View style={styles.currentAgentInfo}>
                                        <MaterialIcons name="two-wheeler" size={20} color="#2E7D32" />
                                        <Text style={styles.currentAgentVehicle}>
                                            {orderDetails.deliveryAgentDetails.vehicleNumber}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.reassignmentWarning}>
                                <MaterialIcons name="info" size={16} color="#FF9800" />
                                <Text style={styles.reassignmentWarningText}>
                                    Selecting a new agent will reassign this order
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Available Agents Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="delivery-dining" size={20} color="#cb202d" />
                        <Text style={styles.sectionTitle}>
                            {orderDetails.status === 'assigned' ? 'Reassign to Another Agent' : 'Approved Delivery Agents'}
                        </Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>
                        Only approved agents are shown • Select one to {orderDetails.status === 'assigned' ? 'reassign' : 'assign'} this order
                    </Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#cb202d" />
                            <Text style={styles.loadingText}>Loading delivery agents...</Text>
                        </View>
                    ) : deliveryAgents.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="person-off" size={64} color="#E0E0E0" />
                            <Text style={styles.emptyTitle}>No Approved Agents Available</Text>
                            <Text style={styles.emptyText}>
                                There are no approved delivery agents available for assignment. Please approve delivery agents first.
                            </Text>
                        </View>
                    ) : (
                        deliveryAgents.map((agent) => {
                            const statusConfig = getStatusConfig(agent.status);
                            const isSelected = selectedAgent === agent.id;
                            // Check if this agent is currently assigned to this order
                            const isCurrentlyAssigned = orderDetails.status === 'assigned' &&
                                orderDetails.deliveryAgent &&
                                (orderDetails.deliveryAgent._id === agent.id || orderDetails.deliveryAgent.id === agent.id);
                            // Agent can be assigned if: online AND has capacity for more deliveries
                            const isAvailable = (agent.status === 'online' || agent.status === 'busy') && agent.activeDeliveries < agent.maxDeliveries;

                            return (
                                <TouchableOpacity
                                    key={agent.id}
                                    style={[
                                        styles.agentCard,
                                        isSelected && styles.agentCardSelected,
                                        !isAvailable && styles.agentCardDisabled,
                                        isCurrentlyAssigned && styles.agentCardCurrentlyAssigned,
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
                                                {isCurrentlyAssigned && (
                                                    <View style={styles.currentlyAssignedBadge}>
                                                        <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
                                                        <Text style={styles.currentlyAssignedText}>Current</Text>
                                                    </View>
                                                )}
                                                {isSelected && !isCurrentlyAssigned && (
                                                    <View style={styles.selectedBadge}>
                                                        <MaterialIcons name="check" size={16} color="#fff" />
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.agentEmailRow}>
                                                <MaterialIcons name="email" size={14} color="#666" />
                                                <Text style={styles.agentEmail}>{agent.email}</Text>
                                            </View>
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
                                                <MaterialIcons name="assignment" size={14} color="#666" />
                                                <Text style={styles.capacityText}>
                                                    {agent.activeDeliveries} {agent.activeDeliveries === 1 ? 'order' : 'orders'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Vehicle Info */}
                                        <View style={styles.vehicleRow}>
                                            <MaterialIcons name="two-wheeler" size={16} color="#666" />
                                            <Text style={styles.vehicleText}>
                                                {agent.vehicleType.charAt(0).toUpperCase() + agent.vehicleType.slice(1)} • {agent.vehicleNumber}
                                            </Text>
                                        </View>

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
                        })
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Assign Button */}
            {selectedAgent && !loading && (
                <View style={styles.assignButtonContainer}>
                    <TouchableOpacity
                        style={[styles.assignButton, assigning && styles.buttonDisabled]}
                        onPress={handleAssign}
                        disabled={assigning}
                    >
                        {assigning ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="person-add" size={20} color="#fff" />
                                <Text style={styles.assignButtonText}>
                                    Assign to {deliveryAgents.find((a) => a.id === selectedAgent)?.name}
                                </Text>
                            </>
                        )}
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
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    orderInfoHeader: {
        backgroundColor: '#FFF5F5',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    orderInfoHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#cb202d',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    orderInfoTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    orderIdText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#cb202d',
        letterSpacing: 0.5,
    },
    orderInfoDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    orderInfoSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8',
    },
    infoIconRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    infoIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        lineHeight: 22,
    },
    infoValueAmount: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4CAF50',
        letterSpacing: -0.5,
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
    agentCardCurrentlyAssigned: {
        borderColor: '#4CAF50',
        backgroundColor: '#F1F8F4',
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
    currentlyAssignedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    currentlyAssignedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4CAF50',
    },
    agentEmailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    agentEmail: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
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
    buttonDisabled: {
        opacity: 0.6,
    },

    // Loading and Empty States
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Currently Assigned Agent Card
    currentAssignmentCard: {
        backgroundColor: '#E8F5E9',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: '#4CAF50',
        ...Platform.select({
            ios: {
                shadowColor: '#4CAF50',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    currentAssignmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#A5D6A7',
    },
    currentAssignmentTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2E7D32',
    },
    currentAssignmentBody: {
        gap: 12,
        marginBottom: 16,
    },
    currentAgentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
    },
    currentAgentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
    },
    currentAgentPhone: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2E7D32',
    },
    currentAgentVehicle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2E7D32',
    },
    reassignmentWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    reassignmentWarningText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#E65100',
        flex: 1,
    },
});
