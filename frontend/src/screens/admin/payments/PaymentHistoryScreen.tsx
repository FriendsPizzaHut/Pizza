import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    StatusBar,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axiosInstance from '../../../api/axiosInstance';

interface Payment {
    _id: string;
    order: string | { _id: string; orderNumber: string };
    user: string | { _id: string; name: string; email: string };
    amount: number;
    paymentMethod: 'card' | 'upi' | 'cod' | 'cash' | 'wallet';
    collectionMethod?: 'cash' | 'upi' | 'card';
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentGateway: 'razorpay' | 'cash' | 'manual';
    transactionId?: string;
    razorpayPaymentId?: string;
    createdAt: string;
    updatedAt: string;
}

interface DeliveryAgent {
    _id: string;
    name: string;
    totalCashCollected: number;
    deliveryCount: number;
}

export default function PaymentHistoryScreen() {
    const navigation = useNavigation();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'cash' | 'online' | 'cod'>('all');
    const [showAgentsModal, setShowAgentsModal] = useState(false);

    // Summary statistics
    const [stats, setStats] = useState({
        totalRevenue: 0,
        cashCollections: 0,
        onlinePayments: 0,
        codOrders: 0,
        totalTransactions: 0,
    });

    useEffect(() => {
        fetchPayments();
        fetchCashCollectionsByAgent();
    }, []);

    useEffect(() => {
        filterPayments();
        calculateStats();
    }, [payments, selectedFilter]);

    const fetchPayments = async () => {
        try {
            setIsLoading(true);

            const response = await axiosInstance.get('/payments', {
                params: {
                    limit: 100,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                }
            });

            if (response.data.success) {
                setPayments(response.data.data || []);
            }
        } catch (error: any) {
            console.error('❌ Error fetching payments:', error);

            // Handle rate limiting error specifically
            if (error?.status === 429 || error?.code === 'ERR_BAD_REQUEST') {
                Alert.alert(
                    'Rate Limit Exceeded',
                    'Too many requests. Please wait a moment and try again.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to load payment history');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCashCollectionsByAgent = async () => {
        try {
            const response = await axiosInstance.get('/payments/cash-collections-by-agent');

            if (response.data.success) {
                setDeliveryAgents(response.data.data || []);
            }
        } catch (error: any) {
            console.error('❌ Error fetching cash collections:', error);

            // Don't show alert for cash collections error, just log it
            // The main payment data is more important
            if (error?.status !== 429) {
                // Only log non-rate-limit errors
                console.warn('Cash collections unavailable');
            }
        }
    };

    const filterPayments = () => {
        let filtered = [...payments];

        if (selectedFilter === 'cash') {
            filtered = payments.filter(p => p.collectionMethod === 'cash');
        } else if (selectedFilter === 'online') {
            filtered = payments.filter(p =>
                p.paymentMethod !== 'cod' && p.paymentGateway !== 'cash'
            );
        } else if (selectedFilter === 'cod') {
            filtered = payments.filter(p => p.paymentMethod === 'cod');
        }

        setFilteredPayments(filtered);
    };

    const calculateStats = () => {
        const totalRevenue = payments
            .filter(p => p.paymentStatus === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const cashCollections = payments
            .filter(p => p.collectionMethod === 'cash' && p.paymentStatus === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const onlinePayments = payments
            .filter(p => p.paymentMethod !== 'cod' && p.paymentGateway !== 'cash' && p.paymentStatus === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const codOrders = payments
            .filter(p => p.paymentMethod === 'cod')
            .length;

        setStats({
            totalRevenue,
            cashCollections,
            onlinePayments,
            codOrders,
            totalTransactions: payments.length,
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchPayments(), fetchCashCollectionsByAgent()]);
        setIsRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'card':
                return 'credit-card';
            case 'upi':
                return 'qr-code';
            case 'cod':
                return 'money';
            case 'wallet':
                return 'account-balance-wallet';
            default:
                return 'payment';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'failed':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    const renderPaymentCard = (payment: Payment) => (
        <TouchableOpacity
            key={payment._id}
            style={styles.paymentCard}
            activeOpacity={0.7}
            onPress={() => {
                const orderInfo = typeof payment.order === 'string'
                    ? payment.order
                    : payment.order.orderNumber || payment.order._id;

                const collectionInfo = payment.collectionMethod
                    ? `Collection: ${payment.collectionMethod.toUpperCase()}\n`
                    : '';

                Alert.alert(
                    'Payment Details',
                    `Order ID: ${orderInfo}\n` +
                    `Amount: ₹${payment.amount.toFixed(2)}\n` +
                    `Method: ${payment.paymentMethod.toUpperCase()}\n` +
                    collectionInfo +
                    `Status: ${payment.paymentStatus.toUpperCase()}\n` +
                    `Transaction ID: ${payment.transactionId || payment.razorpayPaymentId || 'N/A'}`
                );
            }}
        >
            <View style={styles.paymentCardHeader}>
                <View style={styles.paymentMethodBadge}>
                    <MaterialIcons
                        name={getPaymentMethodIcon(payment.paymentMethod) as any}
                        size={20}
                        color="#fff"
                    />
                </View>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentAmount}>₹{payment.amount.toFixed(2)}</Text>
                    <Text style={styles.paymentDate}>{formatDate(payment.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.paymentStatus) }]}>
                    <Text style={styles.statusText}>{payment.paymentStatus}</Text>
                </View>
            </View>

            <View style={styles.paymentCardBody}>
                <View style={styles.paymentDetail}>
                    <Text style={styles.paymentLabel}>Method:</Text>
                    <Text style={styles.paymentValue}>
                        {payment.paymentMethod.toUpperCase()}
                        {payment.collectionMethod && ` (${payment.collectionMethod.toUpperCase()})`}
                    </Text>
                </View>
                {payment.transactionId && (
                    <View style={styles.paymentDetail}>
                        <Text style={styles.paymentLabel}>Transaction ID:</Text>
                        <Text style={styles.paymentValue} numberOfLines={1}>
                            {payment.transactionId}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderCashCollectionsModal = () => (
        <Modal
            visible={showAgentsModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowAgentsModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Cash Collections by Agent</Text>
                        <TouchableOpacity
                            onPress={() => setShowAgentsModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <MaterialIcons name="close" size={24} color="#2d2d2d" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {deliveryAgents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No cash collections yet</Text>
                            </View>
                        ) : (
                            deliveryAgents.map((agent) => (
                                <View key={agent._id} style={styles.agentCard}>
                                    <View style={styles.agentInfo}>
                                        <MaterialCommunityIcons name="account-circle" size={40} color="#cb202d" />
                                        <View style={styles.agentDetails}>
                                            <Text style={styles.agentName}>{agent.name}</Text>
                                            <Text style={styles.agentDeliveries}>
                                                {agent.deliveryCount} deliveries
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.agentCash}>
                                        <Text style={styles.agentCashLabel}>Cash to Collect</Text>
                                        <Text style={styles.agentCashAmount}>
                                            ₹{agent.totalCashCollected.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowAgentsModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment History</Text>
                <TouchableOpacity
                    style={styles.cashButton}
                    onPress={() => setShowAgentsModal(true)}
                >
                    <MaterialCommunityIcons name="cash-multiple" size={24} color="#cb202d" />
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsContent}
                >
                    <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialIcons name="account-balance-wallet" size={16} color="#4CAF50" />
                        <Text style={styles.statValue}>₹{stats.totalRevenue.toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Total Revenue</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                        <MaterialIcons name="money" size={16} color="#FF9800" />
                        <Text style={styles.statValue}>₹{stats.cashCollections.toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Cash Collections</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                        <MaterialIcons name="credit-card" size={16} color="#2196F3" />
                        <Text style={styles.statValue}>₹{stats.onlinePayments.toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Online Payments</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
                        <MaterialIcons name="receipt" size={16} color="#9C27B0" />
                        <Text style={styles.statValue}>{stats.totalTransactions}</Text>
                        <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                </ScrollView>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                {['all', 'cash', 'online', 'cod'].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterButton,
                            selectedFilter === filter && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedFilter(filter as any)}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            selectedFilter === filter && styles.filterButtonTextActive
                        ]}>
                            {filter.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Payments List */}
            <ScrollView
                style={styles.paymentsList}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#cb202d" />
                        <Text style={styles.loadingText}>Loading payments...</Text>
                    </View>
                ) : filteredPayments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="receipt-long" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Payments Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedFilter !== 'all'
                                ? `No ${selectedFilter} payments yet`
                                : 'Payments will appear here once orders are placed'
                            }
                        </Text>
                    </View>
                ) : (
                    filteredPayments.map(renderPaymentCard)
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Cash Collections Modal */}
            {renderCashCollectionsModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    cashButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    statsContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        alignItems: 'center',
    },
    statCard: {
        minWidth: 110,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 3,
        marginBottom: 1,
    },
    statLabel: {
        fontSize: 9,
        color: '#666',
        textAlign: 'center',
        lineHeight: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    filterButtonActive: {
        backgroundColor: '#cb202d',
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    paymentsList: {
        flex: 1,
        padding: 16,
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentMethodBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#cb202d',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    paymentDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
    },
    paymentCardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    paymentDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 13,
        color: '#666',
    },
    paymentValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'right',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 40,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBody: {
        padding: 20,
    },
    agentCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    agentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    agentDetails: {
        marginLeft: 12,
        flex: 1,
    },
    agentName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    agentDeliveries: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    agentCash: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    agentCashLabel: {
        fontSize: 12,
        color: '#666',
    },
    agentCashAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4CAF50',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    modalButton: {
        backgroundColor: '#cb202d',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
