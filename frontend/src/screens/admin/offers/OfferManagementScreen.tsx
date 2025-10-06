import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Offer {
    id: string;
    badge: string;
    title: string;
    subtitle: string;
    code: string;
    bgColor: string;
    gradientColors: readonly [string, string];
    isActive: boolean;
}

export default function OfferManagementScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    // Mock data - Replace with API call or storage
    const [offers, setOffers] = useState<Offer[]>([
        {
            id: '1',
            badge: '50% OFF',
            title: 'Mega Pizza Sale',
            subtitle: 'Get 50% off on all large pizzas Min order: ₹299',
            code: 'PIZZA50',
            bgColor: '#FF5722',
            gradientColors: ['#FF9800', '#FF5722'] as const,
            isActive: true,
        },
        {
            id: '2',
            badge: '₹100 OFF',
            title: 'Combo Special',
            subtitle: 'Save ₹100 on combo meals Min order: ₹499',
            code: 'COMBO100',
            bgColor: '#2196F3',
            gradientColors: ['#03A9F4', '#1976D2'] as const,
            isActive: true,
        },
        {
            id: '3',
            badge: '₹150 OFF',
            title: 'First Order Treat',
            subtitle: 'New customers get ₹150 off Min order: ₹399',
            code: 'FIRST150',
            bgColor: '#4CAF50',
            gradientColors: ['#8BC34A', '#388E3C'] as const,
            isActive: false,
        },
        {
            id: '4',
            badge: '30% OFF',
            title: 'Weekend Bonanza',
            subtitle: '30% discount on all orders Min order: ₹349',
            code: 'WEEKEND30',
            bgColor: '#9C27B0',
            gradientColors: ['#BA68C8', '#7B1FA2'] as const,
            isActive: true,
        },
        {
            id: '5',
            badge: 'BUY 1 GET 1',
            title: 'Double Delight',
            subtitle: 'Buy one pizza, get one free Min order: ₹399',
            code: 'BOGO',
            bgColor: '#F44336',
            gradientColors: ['#FF5252', '#D32F2F'] as const,
            isActive: false,
        },
    ]);

    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredOffers = offers.filter((offer) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return offer.isActive;
        if (filterStatus === 'inactive') return !offer.isActive;
        return true;
    });

    const handleToggleStatus = (id: string) => {
        setOffers((prev) =>
            prev.map((offer) =>
                offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
            )
        );
    };

    const handleDeleteOffer = (id: string, title: string) => {
        Alert.alert(
            'Delete Offer',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setOffers((prev) => prev.filter((offer) => offer.id !== id));
                        Alert.alert('Success', 'Offer deleted successfully');
                    },
                },
            ]
        );
    };

    const handleEditOffer = (offer: Offer) => {
        // Navigate to edit screen with offer data
        navigation.navigate('AddOffer', { offer });
    };

    const handleAddOffer = () => {
        navigation.navigate('AddOffer');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Offers</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddOffer}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScrollView}
                contentContainerStyle={styles.filterContainer}
            >
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filterStatus === 'all' && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterStatus('all')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="apps"
                        size={16}
                        color={filterStatus === 'all' ? '#fff' : '#666'}
                    />
                    <Text
                        style={[
                            styles.filterChipText,
                            filterStatus === 'all' && styles.filterChipTextActive,
                        ]}
                    >
                        All
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filterStatus === 'active' && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterStatus('active')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="check-circle"
                        size={16}
                        color={filterStatus === 'active' ? '#fff' : '#4CAF50'}
                    />
                    <Text
                        style={[
                            styles.filterChipText,
                            filterStatus === 'active' && styles.filterChipTextActive,
                        ]}
                    >
                        Active
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filterStatus === 'inactive' && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterStatus('inactive')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="pause-circle-filled"
                        size={16}
                        color={filterStatus === 'inactive' ? '#fff' : '#FF9800'}
                    />
                    <Text
                        style={[
                            styles.filterChipText,
                            filterStatus === 'inactive' && styles.filterChipTextActive,
                        ]}
                    >
                        Inactive
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Offers List */}
            <ScrollView
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {filteredOffers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="local-offer" size={64} color="#D0D0D0" />
                        <Text style={styles.emptyTitle}>No Offers Found</Text>
                        <Text style={styles.emptyText}>
                            {filterStatus === 'all'
                                ? 'Create your first offer to get started'
                                : `No ${filterStatus} offers available`}
                        </Text>
                        {filterStatus === 'all' && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={handleAddOffer}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="add" size={20} color="#fff" />
                                <Text style={styles.emptyButtonText}>Add Offer</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredOffers.map((offer) => (
                        <View key={offer.id} style={styles.offerCard}>
                            {/* Offer Preview */}
                            <TouchableOpacity
                                style={styles.offerPreview}
                                activeOpacity={0.9}
                                onPress={() => handleEditOffer(offer)}
                            >
                                <LinearGradient
                                    colors={offer.gradientColors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1.2, y: 1.2 }}
                                    style={styles.offerGradient}
                                >
                                    {/* Offer Badge */}
                                    <View style={styles.offerBadge}>
                                        <Text style={styles.offerBadgeText}>{offer.badge}</Text>
                                    </View>

                                    {/* Offer Content */}
                                    <View style={styles.offerContentArea}>
                                        <Text style={styles.offerTitle}>{offer.title}</Text>
                                        <Text style={styles.offerSubtitle} numberOfLines={2}>
                                            {offer.subtitle}
                                        </Text>

                                        {/* Code Section */}
                                        <View style={styles.codeSection}>
                                            <View style={styles.dottedBorder}>
                                                <Text style={styles.codeLabel}>USE CODE</Text>
                                                <Text style={styles.codeValue}>{offer.code}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Decorative pizza slice */}
                                    <Text style={styles.decorPizza}>🍕</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Offer Actions */}
                            <View style={styles.offerActions}>
                                {/* Status Badge */}
                                <View style={styles.offerInfo}>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            offer.isActive
                                                ? styles.statusBadgeActive
                                                : styles.statusBadgeInactive,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.statusDot,
                                                {
                                                    backgroundColor: offer.isActive
                                                        ? '#4CAF50'
                                                        : '#FF9800',
                                                },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color: offer.isActive ? '#4CAF50' : '#FF9800',
                                                },
                                            ]}
                                        >
                                            {offer.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.editButton]}
                                        onPress={() => handleEditOffer(offer)}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialIcons name="edit" size={18} color="#2196F3" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.toggleButton]}
                                        onPress={() => handleToggleStatus(offer.id)}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialIcons
                                            name={offer.isActive ? 'pause' : 'play-arrow'}
                                            size={18}
                                            color={offer.isActive ? '#FF9800' : '#4CAF50'}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => handleDeleteOffer(offer.id, offer.title)}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialIcons name="delete" size={18} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 50,
        backgroundColor: '#f4f4f2',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#cb202d',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    // Filters
    filterScrollView: {
        maxHeight: 50,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        height: 30,
        minWidth: 50,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterChipActive: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
        shadowOpacity: 0.2,
        elevation: 3,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
    },

    // List
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Offer Card
    offerCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    offerPreview: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    offerGradient: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        minHeight: 200,
        justifyContent: 'space-between',
        position: 'relative',
    },
    offerBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    offerBadgeText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    offerContentArea: {
        zIndex: 1,
    },
    offerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    offerSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.95,
        lineHeight: 18,
        marginBottom: 16,
    },
    codeSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
    },
    dottedBorder: {
        borderWidth: 1,
        borderColor: '#fff',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    codeLabel: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.8,
        fontWeight: '600',
        marginBottom: 4,
    },
    codeValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    decorPizza: {
        position: 'absolute',
        fontSize: 80,
        opacity: 0.15,
        right: -10,
        top: 40,
    },

    // Offer Actions
    offerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
    },
    offerInfo: {
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        gap: 6,
    },
    statusBadgeActive: {
        backgroundColor: '#E8F5E9',
    },
    statusBadgeInactive: {
        backgroundColor: '#FFF3E0',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    editButton: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    toggleButton: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
    },
    deleteButton: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#cb202d',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },

    bottomSpacing: {
        height: 80,
    },
});
