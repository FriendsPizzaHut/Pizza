import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../../api/axiosInstance';
import AgentDetailModal from './AgentDetailModal';

interface DeliveryAgent {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
    vehicleInfo?: {
        type: string;
        number?: string;
    };
    isApproved: boolean;
    isRejected?: boolean;
    rejectionReason?: string;
    createdAt: string;
    status?: {
        isOnline: boolean;
        state: string;
    };
    documents?: {
        drivingLicense?: {
            imageUrl?: string;
            verified: boolean;
        };
        aadharCard?: {
            imageUrl?: string;
            verified: boolean;
        };
        vehicleRC?: {
            imageUrl?: string;
            verified: boolean;
        };
    };
    rating?: {
        average: number;
        count: number;
    };
    earnings?: {
        total: number;
        pending: number;
        paid: number;
    };
    totalDeliveries: number;
    availability?: {
        workingDays: string[];
    };
}

export default function DeliveryAgentApprovalsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [agents, setAgents] = useState<DeliveryAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchDeliveryAgents();
    }, []);

    const fetchDeliveryAgents = async () => {
        try {
            setLoading(true);
            console.log('📡 Fetching delivery agents for approval...');

            const response = await axiosInstance.get('/users?role=delivery');
            console.log('✅ Full response:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.success) {
                // Try different possible data structures
                let allAgents: DeliveryAgent[] = [];

                if (Array.isArray(response.data.data)) {
                    // If data is directly an array
                    allAgents = response.data.data;
                } else if (response.data.data && Array.isArray(response.data.data.users)) {
                    // If data.users is an array
                    allAgents = response.data.data.users;
                } else if (Array.isArray(response.data)) {
                    // If response.data itself is an array
                    allAgents = response.data;
                }

                console.log(`  - Found ${allAgents.length} delivery agents`);
                setAgents(allAgents);
            } else {
                console.log('⚠️ Unexpected response structure');
                setAgents([]);
            }
        } catch (error: any) {
            console.error('❌ Error fetching delivery agents:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error response:', error.response?.data);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to load delivery agents. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDeliveryAgents();
    };

    const handleApprove = (agent: DeliveryAgent) => {
        Alert.alert(
            'Approve Delivery Agent',
            `Are you sure you want to approve ${agent.name}? They will be able to accept delivery orders.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: () => updateApprovalStatus(agent._id, true),
                },
            ]
        );
    };

    const handleDisapprove = (agent: DeliveryAgent) => {
        Alert.alert(
            'Disapprove Delivery Agent',
            `Are you sure you want to disapprove ${agent.name}? They will not be able to accept orders.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Disapprove',
                    style: 'destructive',
                    onPress: () => updateApprovalStatus(agent._id, false),
                },
            ]
        );
    };

    const handleViewDetails = (agent: DeliveryAgent) => {
        setSelectedAgent(agent);
        setShowDetailModal(true);
    };

    const handleApproveFromModal = async (agentId: string) => {
        try {
            setProcessingId(agentId);
            console.log('🚀 [FRONTEND] Starting approval process');
            console.log(`  - Agent ID: ${agentId}`);
            console.log('  - API Endpoint: /users/' + agentId);
            console.log('  - Request Payload:', {
                isApproved: true,
                isRejected: false,
                rejectionReason: null,
            });

            const response = await axiosInstance.patch(`/users/${agentId}`, {
                isApproved: true,
                isRejected: false,
                rejectionReason: null,
                isActive: true, // Activate account when approving
            });

            console.log('✅ [FRONTEND] Agent approved - Response received');
            console.log('  - Response Status:', response.status);
            console.log('  - Response Data:', JSON.stringify(response.data, null, 2));
            console.log('  - Approval Fields in Response:', {
                isApproved: response.data?.data?.isApproved,
                isRejected: response.data?.data?.isRejected,
                rejectionReason: response.data?.data?.rejectionReason,
                isActive: response.data?.data?.isActive
            });

            // Update the selected agent state immediately
            if (selectedAgent && selectedAgent._id === agentId) {
                setSelectedAgent({
                    ...selectedAgent,
                    isApproved: true,
                    isRejected: false,
                    rejectionReason: undefined,
                });
            }

            Alert.alert('Success', 'Delivery agent approved successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        fetchDeliveryAgents();
                    },
                },
            ]);
        } catch (error: any) {
            console.error('❌ Error approving agent:', error.message);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to approve agent. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectFromModal = async (agentId: string, reason: string) => {
        try {
            setProcessingId(agentId);
            console.log('🚫 [FRONTEND] Starting rejection process');
            console.log(`  - Agent ID: ${agentId}`);
            console.log(`  - Rejection Reason: ${reason}`);
            console.log('  - API Endpoint: /users/' + agentId);
            console.log('  - Request Payload:', {
                isApproved: false,
                isRejected: true,
                rejectionReason: reason,
            });

            const response = await axiosInstance.patch(`/users/${agentId}`, {
                isApproved: false,
                isRejected: true,
                rejectionReason: reason,
                isActive: false, // Deactivate account when rejecting
            });

            console.log('✅ [FRONTEND] Agent rejected - Response received');
            console.log('  - Response Status:', response.status);
            console.log('  - Response Data:', JSON.stringify(response.data, null, 2));
            console.log('  - Rejection Fields in Response:', {
                isApproved: response.data?.data?.isApproved,
                isRejected: response.data?.data?.isRejected,
                rejectionReason: response.data?.data?.rejectionReason
            });

            // Update the selected agent state immediately
            if (selectedAgent && selectedAgent._id === agentId) {
                setSelectedAgent({
                    ...selectedAgent,
                    isApproved: false,
                    isRejected: true,
                    rejectionReason: reason,
                });
            }

            Alert.alert('Success', 'Delivery agent application rejected.', [
                {
                    text: 'OK',
                    onPress: () => {
                        fetchDeliveryAgents();
                    },
                },
            ]);
        } catch (error: any) {
            console.error('❌ Error rejecting agent:', error.message);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to reject agent. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setProcessingId(null);
        }
    };

    const updateApprovalStatus = async (agentId: string, isApproved: boolean) => {
        try {
            setProcessingId(agentId);
            console.log(`📝 Updating approval status for agent ${agentId} to ${isApproved}`);

            const response = await axiosInstance.patch(`/users/${agentId}`, {
                isApproved: isApproved,
                isRejected: false,
            });

            console.log('✅ Approval status updated:', response.data);

            Alert.alert(
                'Success',
                `Delivery agent ${isApproved ? 'approved' : 'disapproved'} successfully!`,
                [{ text: 'OK' }]
            );

            // Refresh the list
            fetchDeliveryAgents();
        } catch (error: any) {
            console.error('❌ Error updating approval status:', error.message);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update approval status. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setProcessingId(null);
        }
    };

    const pendingAgents = agents.filter(agent => !agent.isApproved && !agent.isRejected);
    const approvedAgents = agents.filter(agent => agent.isApproved);
    const rejectedAgents = agents.filter(agent => agent.isRejected);

    const renderAgentCard = (agent: DeliveryAgent) => {
        const isProcessing = processingId === agent._id;

        return (
            <View key={agent._id} style={styles.agentCard}>
                {/* Agent Info Section */}
                <View style={styles.agentHeader}>
                    <Image
                        source={{
                            uri: agent.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=cb202d&color=fff`,
                        }}
                        style={styles.agentImage}
                    />
                    <View style={styles.agentInfo}>
                        <View style={styles.agentNameRow}>
                            <Text style={styles.agentName}>{agent.name}</Text>
                            {agent.isApproved && (
                                <View style={styles.approvedBadge}>
                                    <MaterialIcons name="verified" size={16} color="#4CAF50" />
                                </View>
                            )}
                        </View>
                        <View style={styles.agentEmailRow}>
                            <MaterialIcons name="email" size={14} color="#666" />
                            <Text style={styles.agentEmail}>{agent.email}</Text>
                        </View>
                        <View style={styles.agentPhoneRow}>
                            <MaterialIcons name="phone" size={14} color="#666" />
                            <Text style={styles.agentPhone}>{agent.phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Vehicle Info */}
                {agent.vehicleInfo && (
                    <View style={styles.vehicleSection}>
                        <MaterialIcons name="two-wheeler" size={16} color="#666" />
                        <Text style={styles.vehicleText}>
                            {agent.vehicleInfo.type.charAt(0).toUpperCase() + agent.vehicleInfo.type.slice(1)} • {agent.vehicleInfo.number}
                        </Text>
                    </View>
                )}

                {/* Documents Status */}
                {agent.documents && (
                    <View style={styles.documentsSection}>
                        <Text style={styles.documentsSectionTitle}>Documents</Text>
                        <View style={styles.documentsRow}>
                            <View style={styles.documentItem}>
                                <MaterialIcons
                                    name={agent.documents.drivingLicense?.imageUrl ? 'check-circle' : 'cancel'}
                                    size={16}
                                    color={agent.documents.drivingLicense?.imageUrl ? '#4CAF50' : '#E0E0E0'}
                                />
                                <Text style={styles.documentItemText}>License</Text>
                            </View>
                            <View style={styles.documentItem}>
                                <MaterialIcons
                                    name={agent.documents.aadharCard?.imageUrl ? 'check-circle' : 'cancel'}
                                    size={16}
                                    color={agent.documents.aadharCard?.imageUrl ? '#4CAF50' : '#E0E0E0'}
                                />
                                <Text style={styles.documentItemText}>Aadhar</Text>
                            </View>
                            <View style={styles.documentItem}>
                                <MaterialIcons
                                    name={agent.documents.vehicleRC?.imageUrl ? 'check-circle' : 'cancel'}
                                    size={16}
                                    color={agent.documents.vehicleRC?.imageUrl ? '#4CAF50' : '#E0E0E0'}
                                />
                                <Text style={styles.documentItemText}>RC</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewDetailsButton]}
                        onPress={() => handleViewDetails(agent)}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="visibility" size={18} color="#2196F3" />
                        <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>View Details</Text>
                    </TouchableOpacity>
                    {agent.isApproved ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.disapproveButton]}
                            onPress={() => handleDisapprove(agent)}
                            disabled={isProcessing}
                            activeOpacity={0.8}
                        >
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name="cancel" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Revoke</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : agent.isRejected ? (
                        <View style={styles.rejectedIndicator}>
                            <MaterialIcons name="block" size={18} color="#F44336" />
                            <Text style={styles.rejectedText}>Rejected</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleApprove(agent)}
                            disabled={isProcessing}
                            activeOpacity={0.8}
                        >
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name="check-circle" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Quick Approve</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Delivery Agent Approvals</Text>
                    <Text style={styles.headerSubtitle}>
                        {pendingAgents.length} pending • {approvedAgents.length} approved • {rejectedAgents.length} rejected
                    </Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#cb202d" />
                    <Text style={styles.loadingText}>Loading delivery agents...</Text>
                </View>
            ) : agents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="people-outline" size={80} color="#E0E0E0" />
                    <Text style={styles.emptyTitle}>No Delivery Agents</Text>
                    <Text style={styles.emptyText}>
                        No delivery agents have registered yet.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#cb202d']}
                            tintColor="#cb202d"
                        />
                    }
                >
                    {/* Pending Approvals Section */}
                    {pendingAgents.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <MaterialIcons name="pending" size={20} color="#FF9800" />
                                    <Text style={styles.sectionTitle}>Pending Approvals</Text>
                                </View>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{pendingAgents.length}</Text>
                                </View>
                            </View>
                            {pendingAgents.map(renderAgentCard)}
                        </View>
                    )}

                    {/* Approved Agents Section */}
                    {approvedAgents.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <MaterialIcons name="verified" size={20} color="#4CAF50" />
                                    <Text style={styles.sectionTitle}>Approved Agents</Text>
                                </View>
                                <View style={[styles.countBadge, styles.countBadgeGreen]}>
                                    <Text style={styles.countText}>{approvedAgents.length}</Text>
                                </View>
                            </View>
                            {approvedAgents.map(renderAgentCard)}
                        </View>
                    )}

                    {/* Rejected Agents Section */}
                    {rejectedAgents.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <MaterialIcons name="block" size={20} color="#F44336" />
                                    <Text style={styles.sectionTitle}>Rejected Applications</Text>
                                </View>
                                <View style={[styles.countBadge, styles.countBadgeRed]}>
                                    <Text style={styles.countText}>{rejectedAgents.length}</Text>
                                </View>
                            </View>
                            {rejectedAgents.map(renderAgentCard)}
                        </View>
                    )}

                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}

            {/* Agent Detail Modal */}
            <AgentDetailModal
                visible={showDetailModal}
                agent={selectedAgent}
                onClose={() => setShowDetailModal(false)}
                onApprove={handleApproveFromModal}
                onReject={handleRejectFromModal}
                processing={processingId === selectedAgent?._id}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginTop: 2,
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
    },
    countBadge: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countBadgeGreen: {
        backgroundColor: '#4CAF50',
    },
    countBadgeRed: {
        backgroundColor: '#F44336',
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    agentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    agentHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    agentImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#F0F0F0',
    },
    agentInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    agentNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    agentName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    approvedBadge: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 2,
    },
    agentEmailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    agentEmail: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    agentPhoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    agentPhone: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    vehicleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    vehicleText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    documentsSection: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    documentsSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    documentsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    documentItemText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    disapproveButton: {
        backgroundColor: '#F44336',
    },
    viewDetailsButton: {
        backgroundColor: '#E3F2FD',
    },
    rejectedIndicator: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
        backgroundColor: '#FFEBEE',
    },
    rejectedText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F44336',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    bottomSpacing: {
        height: 24,
    },
});
