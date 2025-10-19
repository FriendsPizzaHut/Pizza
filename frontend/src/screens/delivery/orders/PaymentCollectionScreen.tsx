import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Dimensions, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryStackParamList } from '../../../types/navigation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../../api/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<DeliveryStackParamList>;
type PaymentCollectionRouteProp = RouteProp<DeliveryStackParamList, 'PaymentCollection'>;
type PaymentMethod = 'cash' | 'upi';

export default function PaymentCollectionScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<PaymentCollectionRouteProp>();
    const params = route.params;
    const userId = useSelector((state: RootState) => state.auth.userId);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [isCollecting, setIsCollecting] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);

    const handlePaymentCollection = async (method: 'cash' | 'upi') => {
        setIsCollecting(true);

        try {
            console.log('💰 [PAYMENT] Collecting payment:', {
                orderId: params.orderId,
                method,
                amount: params.totalAmount
            });

            // Step 1: Create payment record
            // For COD orders: paymentMethod='cod', collectionMethod='cash'|'upi'
            const paymentResponse = await axiosInstance.post('/payments', {
                order: params.orderId,
                user: userId,
                amount: params.totalAmount,
                paymentMethod: 'cod', // Order payment method
                collectionMethod: method, // How payment was collected (cash/upi)
                paymentStatus: 'completed',
            });

            console.log('✅ [PAYMENT] Payment record created:', paymentResponse.data);

            // Step 2: Update order payment status to completed (but keep order status as out_for_delivery)
            await axiosInstance.patch(`/orders/${params.orderId}/status`, {
                status: 'out_for_delivery', // Keep same status
                paymentStatus: 'completed'   // Mark payment as collected
            });

            console.log('✅ [PAYMENT] Payment marked as collected');

            setPaymentCompleted(true);
            setIsCollecting(false);

            Alert.alert(
                'Payment Collected! 🎉',
                `${method === 'cash' ? 'Cash' : 'UPI'} payment of ₹${params.totalAmount.toFixed(2)} has been collected successfully!\n\nNow swipe to complete the delivery.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back to active orders - agent will see "Slide to Complete" button
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('❌ [PAYMENT] Error:', error.message);
            setIsCollecting(false);
            Alert.alert(
                'Payment Failed',
                error.response?.data?.message || 'Failed to process payment. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleCashCollection = () => {
        Alert.alert(
            'Collect Cash Payment',
            `Confirm you have received ₹${params.totalAmount.toFixed(2)} from ${params.customerName}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Cash Received',
                    onPress: () => handlePaymentCollection('cash')
                }
            ]
        );
    };

    const handleUPIPayment = () => {
        Alert.alert(
            'UPI/QR Payment',
            `Has customer paid ₹${params.totalAmount.toFixed(2)} via UPI?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Payment Received',
                    onPress: () => handlePaymentCollection('upi')
                }
            ]
        );
    };

    const renderQRScanner = () => (
        <View style={styles.scannerContainer}>
            <View style={styles.qrCard}>
                <View style={styles.qrFrame}>
                    {isCollecting ? (
                        <View style={styles.scanningIndicator}>
                            <MaterialIcons name="qr-code-scanner" size={60} color="#E23744" />
                            <View style={styles.processingDots}>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                            <Text style={styles.scanningText}>Processing Payment...</Text>
                        </View>
                    ) : (
                        <View style={styles.qrPlaceholder}>
                            <View style={styles.qrCodeBox}>
                                <MaterialIcons name="qr-code-2" size={160} color="#2d2d2d" />
                            </View>
                            <Text style={styles.qrInstructions}>
                                Ask customer to scan this QR code
                            </Text>
                            <Text style={styles.qrSubtext}>
                                via any UPI app (GPay, PhonePe, Paytm)
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, isCollecting && styles.disabledButton]}
                onPress={handleUPIPayment}
                disabled={isCollecting}
            >
                {isCollecting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>
                    {isCollecting ? 'Processing Payment...' : 'Confirm UPI Payment'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderCashCollection = () => (
        <View style={styles.cashContainer}>
            <View style={styles.cashCard}>
                <View style={styles.cashIconContainer}>
                    <MaterialIcons name="payments" size={48} color="#E23744" />
                </View>
                <Text style={styles.cashTitle}>Collect Cash Payment</Text>
                <Text style={styles.cashSubtitle}>Ensure you have exact change</Text>

                <View style={styles.denominationTips}>
                    <Text style={styles.tipsTitle}>💡 Tip: Common denominations</Text>
                    <View style={styles.denominationRow}>
                        <View style={styles.denominationChip}>
                            <Text style={styles.denominationText}>₹500</Text>
                        </View>
                        <View style={styles.denominationChip}>
                            <Text style={styles.denominationText}>₹200</Text>
                        </View>
                        <View style={styles.denominationChip}>
                            <Text style={styles.denominationText}>₹100</Text>
                        </View>
                        <View style={styles.denominationChip}>
                            <Text style={styles.denominationText}>₹50</Text>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, isCollecting && styles.disabledButton]}
                onPress={handleCashCollection}
                disabled={isCollecting}
            >
                {isCollecting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>
                    {isCollecting ? 'Processing...' : 'Confirm Cash Received'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Collect Payment</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Info Card */}
                <View style={styles.orderInfoCard}>
                    <View style={styles.orderHeader}>
                        <View style={styles.orderIdContainer}>
                            <MaterialIcons name="receipt" size={20} color="#E23744" />
                            <Text style={styles.orderId}>{params.orderNumber}</Text>
                        </View>
                        <View style={styles.codBadge}>
                            <MaterialIcons name="money" size={14} color="#FF9800" />
                            <Text style={styles.codText}>COD</Text>
                        </View>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.customerSection}>
                    <Text style={styles.sectionLabel}>CUSTOMER DETAILS</Text>
                    <View style={styles.customerCard}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                            style={styles.customerImage}
                            resizeMode="cover"
                        />
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{params.customerName}</Text>
                            <View style={styles.addressRow}>
                                <MaterialIcons name="location-on" size={14} color="#999" />
                                <Text style={styles.deliveryAddress}>{params.deliveryAddress}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Amount to Collect */}
                <View style={styles.amountSection}>
                    <View style={styles.amountCard}>
                        <View style={styles.amountHeader}>
                            <MaterialIcons name="account-balance-wallet" size={24} color="#E23744" />
                            <Text style={styles.amountLabel}>Amount to Collect</Text>
                        </View>
                        <Text style={styles.amountValue}>₹{params.totalAmount.toFixed(2)}</Text>
                        <View style={styles.amountBreakdown}>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Order Total</Text>
                                <Text style={styles.breakdownValue}>₹{params.totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Method Toggle */}
                <View style={styles.toggleSection}>
                    <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                paymentMethod === 'cash' && styles.activeToggleButton
                            ]}
                            onPress={() => setPaymentMethod('cash')}
                        >
                            <View style={[
                                styles.toggleIconContainer,
                                paymentMethod === 'cash' && styles.activeToggleIconContainer
                            ]}>
                                <MaterialIcons
                                    name="money"
                                    size={24}
                                    color={paymentMethod === 'cash' ? '#fff' : '#E23744'}
                                />
                            </View>
                            <Text style={[
                                styles.toggleText,
                                paymentMethod === 'cash' && styles.activeToggleText
                            ]}>
                                Cash
                            </Text>
                            {paymentMethod === 'cash' && (
                                <MaterialIcons name="check-circle" size={20} color="#E23744" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                paymentMethod === 'upi' && styles.activeToggleButton
                            ]}
                            onPress={() => setPaymentMethod('upi')}
                        >
                            <View style={[
                                styles.toggleIconContainer,
                                paymentMethod === 'upi' && styles.activeToggleIconContainer
                            ]}>
                                <MaterialIcons
                                    name="qr-code-scanner"
                                    size={24}
                                    color={paymentMethod === 'upi' ? '#fff' : '#E23744'}
                                />
                            </View>
                            <Text style={[
                                styles.toggleText,
                                paymentMethod === 'upi' && styles.activeToggleText
                            ]}>
                                UPI / QR
                            </Text>
                            {paymentMethod === 'upi' && (
                                <MaterialIcons name="check-circle" size={20} color="#E23744" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Payment Interface */}
                <View style={styles.paymentInterface}>
                    {paymentMethod === 'upi' ? renderQRScanner() : renderCashCollection()}
                </View>

                {/* Order Summary */}
                <View style={styles.orderSummarySection}>
                    <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
                    <View style={styles.orderSummaryCard}>
                        {params.orderItems.map((item, index) => (
                            <View key={index} style={styles.orderItemRow}>
                                <View style={styles.itemDot} />
                                <Text style={styles.orderItem}>
                                    {item.quantity}x {item.name} - ₹{item.price.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    headerRight: {
        width: 36,
    },

    // ScrollView
    scrollView: {
        flex: 1,
    },

    // Order Info Card
    orderInfoCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderId: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    codBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    codText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF9800',
    },

    // Section Label
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#999',
        letterSpacing: 0.5,
        marginBottom: 12,
    },

    // Customer Section
    customerSection: {
        marginTop: 12,
        marginHorizontal: 16,
    },
    customerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    customerImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 4,
    },
    deliveryAddress: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        flex: 1,
    },

    // Amount Section
    amountSection: {
        marginTop: 12,
        marginHorizontal: 16,
    },
    amountCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    amountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    amountLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#E23744',
        marginBottom: 12,
    },
    amountBreakdown: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#666',
    },
    breakdownValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
    },

    // Toggle Section
    toggleSection: {
        marginTop: 12,
        marginHorizontal: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    toggleButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activeToggleButton: {
        borderColor: '#E23744',
        backgroundColor: '#FFF5F5',
    },
    toggleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    activeToggleIconContainer: {
        backgroundColor: '#E23744',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginTop: 4,
    },
    activeToggleText: {
        color: '#E23744',
    },

    // Payment Interface
    paymentInterface: {
        marginTop: 12,
        marginHorizontal: 16,
    },

    // QR Scanner
    scannerContainer: {
        alignItems: 'center',
    },
    qrCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    qrFrame: {
        width: width * 0.65,
        height: width * 0.65,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    qrPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCodeBox: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    qrInstructions: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        textAlign: 'center',
        marginTop: 16,
    },
    qrSubtext: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginTop: 6,
    },
    scanningIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    processingDots: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E23744',
    },
    scanningText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E23744',
        marginTop: 12,
    },

    // Cash Collection
    cashContainer: {
        alignItems: 'center',
    },
    cashCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cashIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cashTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2d2d2d',
        textAlign: 'center',
        marginBottom: 6,
    },
    cashSubtitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    denominationTips: {
        width: '100%',
        backgroundColor: '#FFF9E6',
        borderRadius: 8,
        padding: 12,
    },
    tipsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    denominationRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    denominationChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    denominationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d2d2d',
    },

    // Action Button
    actionButton: {
        width: '100%',
        backgroundColor: '#E23744',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
        shadowColor: '#E23744',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: '#CCC',
        shadowOpacity: 0.1,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },

    // Order Summary
    orderSummarySection: {
        marginTop: 12,
        marginHorizontal: 16,
    },
    orderSummaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E23744',
        marginRight: 10,
    },
    orderItem: {
        fontSize: 14,
        color: '#2d2d2d',
        flex: 1,
    },

    bottomSpacing: {
        height: 20,
    },
});