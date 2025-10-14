import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

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

interface Props {
    visible: boolean;
    agent: DeliveryAgent | null;
    onClose: () => void;
    onApprove: (agentId: string) => void;
    onReject: (agentId: string, reason: string) => void;
    processing: boolean;
}

export default function AgentDetailModal({ visible, agent, onClose, onApprove, onReject, processing }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    if (!agent) return null;

    const getStatusColor = () => {
        if (agent.isRejected) return '#F44336';
        if (agent.isApproved) return '#4CAF50';
        return '#FF9800';
    };

    const getStatusText = () => {
        if (agent.isRejected) return 'Rejected';
        if (agent.isApproved) return 'Approved';
        return 'Pending';
    };

    const handleReject = () => {
        Alert.prompt(
            'Reject Application',
            'Please provide a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: (reason?: string) => {
                        if (reason && reason.trim()) {
                            onReject(agent._id, reason.trim());
                            setShowRejectDialog(false);
                        } else {
                            Alert.alert('Error', 'Please provide a rejection reason');
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const renderDocument = (title: string, document?: { imageUrl?: string; verified: boolean }) => {
        if (!document) return null;

        return (
            <View style={styles.documentCard}>
                <View style={styles.documentHeader}>
                    <View style={styles.documentTitleRow}>
                        <MaterialIcons name="description" size={20} color="#2196F3" />
                        <Text style={styles.documentTitle}>{title}</Text>
                    </View>
                    {document.verified && (
                        <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={14} color="#4CAF50" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>
                {document.imageUrl ? (
                    <TouchableOpacity
                        style={styles.documentImageContainer}
                        onPress={() => setSelectedImage(document.imageUrl!)}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: document.imageUrl }}
                            style={styles.documentImage}
                            resizeMode="cover"
                        />
                        <View style={styles.viewOverlay}>
                            <MaterialIcons name="zoom-in" size={24} color="#fff" />
                            <Text style={styles.viewText}>Tap to view</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.noDocumentContainer}>
                        <MaterialIcons name="image-not-supported" size={40} color="#E0E0E0" />
                        <Text style={styles.noDocumentText}>No document uploaded</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <>
            <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MaterialIcons name="close" size={24} color="#2d2d2d" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Delivery Agent Details</Text>
                        <View style={styles.headerRight} />
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            <Image
                                source={{
                                    uri: agent.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=cb202d&color=fff&size=200`,
                                }}
                                style={styles.profileImage}
                            />
                            <Text style={styles.agentName}>{agent.name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                    {getStatusText()}
                                </Text>
                            </View>
                            {agent.isRejected && agent.rejectionReason && (
                                <View style={styles.rejectionReasonContainer}>
                                    <MaterialIcons name="info" size={16} color="#F44336" />
                                    <Text style={styles.rejectionReasonText}>{agent.rejectionReason}</Text>
                                </View>
                            )}
                        </View>

                        {/* Contact Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="email" size={20} color="#666" />
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{agent.email}</Text>
                                </View>
                                <View style={styles.infoDivider} />
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="phone" size={20} color="#666" />
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{agent.phone}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Vehicle Information */}
                        {agent.vehicleInfo && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Vehicle Information</Text>
                                <View style={styles.infoCard}>
                                    <View style={styles.infoRow}>
                                        <MaterialIcons name="two-wheeler" size={20} color="#666" />
                                        <Text style={styles.infoLabel}>Type</Text>
                                        <Text style={styles.infoValue}>
                                            {agent.vehicleInfo.type.charAt(0).toUpperCase() + agent.vehicleInfo.type.slice(1)}
                                        </Text>
                                    </View>
                                    {agent.vehicleInfo.number && (
                                        <>
                                            <View style={styles.infoDivider} />
                                            <View style={styles.infoRow}>
                                                <MaterialIcons name="pin" size={20} color="#666" />
                                                <Text style={styles.infoLabel}>Number</Text>
                                                <Text style={styles.infoValue}>{agent.vehicleInfo.number}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Statistics */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Statistics</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <MaterialIcons name="local-shipping" size={24} color="#2196F3" />
                                    <Text style={styles.statValue}>{agent.totalDeliveries || 0}</Text>
                                    <Text style={styles.statLabel}>Deliveries</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <MaterialIcons name="star" size={24} color="#FFB800" />
                                    <Text style={styles.statValue}>
                                        {agent.rating?.average.toFixed(1) || '0.0'}
                                    </Text>
                                    <Text style={styles.statLabel}>Rating ({agent.rating?.count || 0})</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <MaterialIcons name="account-balance-wallet" size={24} color="#4CAF50" />
                                    <Text style={styles.statValue}>₹{agent.earnings?.total || 0}</Text>
                                    <Text style={styles.statLabel}>Earnings</Text>
                                </View>
                            </View>
                        </View>

                        {/* Documents */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Documents</Text>
                            {renderDocument('Driving License', agent.documents?.drivingLicense)}
                            {renderDocument('Aadhar Card', agent.documents?.aadharCard)}
                            {renderDocument('Vehicle RC', agent.documents?.vehicleRC)}
                        </View>

                        {/* Action Buttons */}
                        {agent.isApproved ? (
                            <View style={styles.actionsSection}>
                                <View style={styles.statusMessageContainer}>
                                    <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
                                    <Text style={styles.statusMessageTitle}>Agent Approved</Text>
                                    <Text style={styles.statusMessageText}>
                                        This delivery agent is approved and can accept orders.
                                    </Text>
                                </View>
                            </View>
                        ) : agent.isRejected ? (
                            <View style={styles.actionsSection}>
                                <View style={styles.statusMessageContainer}>
                                    <MaterialIcons name="cancel" size={48} color="#F44336" />
                                    <Text style={[styles.statusMessageTitle, { color: '#F44336' }]}>
                                        Application Rejected
                                    </Text>
                                    {agent.rejectionReason && (
                                        <Text style={styles.statusMessageText}>
                                            Reason: {agent.rejectionReason}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.actionsSection}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={handleReject}
                                    disabled={processing}
                                    activeOpacity={0.8}
                                >
                                    {processing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="cancel" size={20} color="#fff" />
                                            <Text style={styles.actionButtonText}>Reject Application</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.approveButton]}
                                    onPress={() => onApprove(agent._id)}
                                    disabled={processing}
                                    activeOpacity={0.8}
                                >
                                    {processing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="check-circle" size={20} color="#fff" />
                                            <Text style={styles.actionButtonText}>Approve Agent</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.bottomSpacing} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Image Viewer Modal */}
            <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                <View style={styles.imageViewerContainer}>
                    <TouchableOpacity style={styles.imageViewerClose} onPress={() => setSelectedImage(null)}>
                        <MaterialIcons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        letterSpacing: -0.3,
    },
    headerRight: {
        width: 40,
    },
    scrollContent: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#F0F0F0',
        marginBottom: 16,
    },
    agentName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    rejectionReasonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        maxWidth: width - 64,
    },
    rejectionReasonText: {
        flex: 1,
        fontSize: 13,
        color: '#F44336',
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '600',
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2d2d2d',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
    documentCard: {
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
    documentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    documentTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    documentImageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    documentImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F8F8F8',
    },
    viewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        alignItems: 'center',
        gap: 4,
    },
    viewText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    noDocumentContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
    },
    noDocumentText: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 8,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    statusMessageContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 16,
    },
    statusMessageTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#4CAF50',
        marginTop: 16,
        marginBottom: 8,
    },
    statusMessageText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    imageViewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 8,
    },
    fullImage: {
        width: width,
        height: height * 0.8,
    },
    bottomSpacing: {
        height: 40,
    },
});
