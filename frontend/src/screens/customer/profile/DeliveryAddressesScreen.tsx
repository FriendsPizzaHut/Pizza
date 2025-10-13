/**
 * DeliveryAddressesScreen.tsx
 * 
 * Displays all saved delivery addresses with improved UI.
 * Navigates to AddAddressScreen for adding and EditAddressScreen for editing.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../../../redux/store';
import {
    setAddresses,
    deleteAddress as deleteAddressAction,
    setDefaultAddress as setDefaultAddressAction,
    setLoading,
    setError
} from '../../../../redux/slices/addressSlice';
import { CustomerStackParamList } from '../../../types/navigation';
import apiClient from '../../../api/apiClient';

type DeliveryAddressesScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'DeliveryAddresses'>;

interface Address {
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

export default function DeliveryAddressesScreen() {
    const navigation = useNavigation<DeliveryAddressesScreenNavigationProp>();
    const dispatch = useDispatch<AppDispatch>();

    const { addresses, isLoading } = useSelector((state: RootState) => state.address);
    const userId = useSelector((state: RootState) => state.auth.userId);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch addresses from API (via user data)
    const fetchAddresses = useCallback(async () => {
        if (!userId) return;

        try {
            dispatch(setLoading(true));
            const response = await apiClient.get(`/users/${userId}`);
            dispatch(setAddresses(response.data.data.address || []));
        } catch (error: any) {
            dispatch(setError(error.response?.data?.message || 'Failed to fetch addresses'));
            Alert.alert('Error', 'Failed to load addresses');
        } finally {
            dispatch(setLoading(false));
        }
    }, [userId, dispatch]); useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAddresses();
        setRefreshing(false);
    };

    const handleAddAddress = () => {
        navigation.navigate('AddAddress', { fromScreen: 'ManageAddresses' });
    };

    const handleEditAddress = (address: Address) => {
        navigation.navigate('EditAddress', { addressId: address._id, fromScreen: 'ManageAddresses' });
    };

    const handleDeleteAddress = (address: Address) => {
        Alert.alert(
            'Delete Address',
            `Are you sure you want to delete this ${address.label} address?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (userId) {
                            try {
                                dispatch(setLoading(true));
                                await apiClient.delete(`/users/${userId}/address/${address._id}`);
                                dispatch(deleteAddressAction(address._id));
                                Alert.alert('Success', 'Address deleted successfully');
                            } catch (error: any) {
                                Alert.alert('Error', error.response?.data?.message || 'Failed to delete address');
                            } finally {
                                dispatch(setLoading(false));
                            }
                        }
                    }
                }
            ]
        );
    };

    const handleSetDefault = async (address: Address) => {
        if (address.isDefault) {
            return; // Already default
        }

        if (userId) {
            try {
                dispatch(setLoading(true));
                await apiClient.patch(`/users/${userId}/address/${address._id}/default`);
                dispatch(setDefaultAddressAction(address._id));
            } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Failed to set default address');
            } finally {
                dispatch(setLoading(false));
            }
        }
    };

    const getIconName = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home':
                return 'home';
            case 'work':
                return 'work';
            case 'hotel':
                return 'hotel';
            default:
                return 'location-on';
        }
    };

    if (isLoading && addresses.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Delivery Addresses</Text>
                        <View style={styles.placeholder} />
                    </View>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#cb202d" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Delivery Addresses</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                        <MaterialIcons name="add" size={24} color="#cb202d" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#cb202d']}
                        tintColor="#cb202d"
                    />
                }
            >
                {/* Addresses Count */}
                {addresses.length > 0 && (
                    <View style={styles.addressesCountContainer}>
                        <Text style={styles.addressesCount}>
                            {addresses.length} {addresses.length === 1 ? 'Address' : 'Addresses'}
                        </Text>
                    </View>
                )}

                {/* Empty State */}
                {addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="location-off" size={64} color="#E0E0E0" />
                        <Text style={styles.emptyTitle}>No Addresses Saved</Text>
                        <Text style={styles.emptyText}>
                            Add a delivery address to get started
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={handleAddAddress}>
                            <MaterialIcons name="add" size={20} color="#fff" />
                            <Text style={styles.emptyButtonText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Address Cards
                    addresses.map((item) => {
                        const iconName = getIconName(item.label);
                        const isDefault = item.isDefault;

                        return (
                            <TouchableOpacity
                                key={item._id}
                                style={[styles.addressCard, isDefault && styles.defaultAddressCard]}
                                onPress={() => handleSetDefault(item)}
                                activeOpacity={0.8}
                            >
                                {/* Default Badge */}
                                {isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <MaterialIcons name="check-circle" size={14} color="#fff" />
                                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                    </View>
                                )}

                                {/* Address Content */}
                                <View style={styles.addressContent}>
                                    {/* Icon and Label */}
                                    <View style={styles.labelRow}>
                                        <View style={[styles.iconContainer, { backgroundColor: isDefault ? '#FFEBEE' : '#F5F5F5' }]}>
                                            <MaterialIcons
                                                name={iconName}
                                                size={20}
                                                color={isDefault ? '#cb202d' : '#666'}
                                            />
                                        </View>
                                        <Text style={[styles.labelText, isDefault && styles.defaultLabelText]}>
                                            {item.label}
                                        </Text>
                                    </View>

                                    {/* Address Details */}
                                    <View style={styles.addressDetails}>
                                        <Text style={styles.streetText}>
                                            {item.street}
                                            {item.landmark ? `, ${item.landmark}` : ''}
                                        </Text>
                                        <Text style={styles.cityText}>
                                            {item.city}, {item.state} - {item.pincode}
                                        </Text>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleEditAddress(item)}
                                        >
                                            <MaterialIcons name="edit" size={18} color="#666" />
                                            <Text style={styles.actionButtonText}>Edit</Text>
                                        </TouchableOpacity>

                                        {!isDefault && (
                                            <>
                                                <View style={styles.actionDivider} />
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => handleDeleteAddress(item)}
                                                >
                                                    <MaterialIcons name="delete-outline" size={18} color="#cb202d" />
                                                    <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}

                                        {!isDefault && (
                                            <>
                                                <View style={styles.actionDivider} />
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => handleSetDefault(item)}
                                                >
                                                    <MaterialIcons name="check-circle-outline" size={18} color="#4CAF50" />
                                                    <Text style={[styles.actionButtonText, styles.defaultText]}>Set Default</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

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

    // Header Styles
    header: {
        backgroundColor: '#f4f4f2',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 0,
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: 40,
    },

    // Content Styles
    content: {
        flex: 1,
        backgroundColor: '#f4f4f2',
        paddingHorizontal: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f2',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },

    // Address Count
    addressesCountContainer: {
        paddingVertical: 16,
    },
    addressesCount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Address Card Styles
    addressCard: {
        backgroundColor: '#fbfbfbff',
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    defaultAddressCard: {
        borderWidth: 1.5,
        borderColor: '#cb202d',
    },
    defaultBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#cb202d',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
        gap: 4,
    },
    defaultBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    addressContent: {
        padding: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    labelText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    defaultLabelText: {
        color: '#cb202d',
    },

    // Address Details
    addressDetails: {
        marginBottom: 16,
    },
    streetText: {
        fontSize: 14,
        color: '#2d2d2d',
        lineHeight: 20,
        marginBottom: 4,
    },
    cityText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    deleteText: {
        color: '#cb202d',
    },
    defaultText: {
        color: '#4CAF50',
    },
    actionDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#F0F0F0',
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2d2d2d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cb202d',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 20,
    },
});
