import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    Alert,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/store';
import {
    setSearchQuery,
    setFilterRole,
    incrementPage,
    UserListItem,
} from '../../../../redux/slices/userManagementSlice';
import {
    fetchUsers,
    fetchUserDetails,
    deleteUserById,
    refreshUsers,
    loadMoreUsers,
} from '../../../../redux/thunks/userManagementThunks';

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const UserManagementScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const dispatch = useDispatch<AppDispatch>();

    // Redux state
    const {
        users,
        selectedUser,
        isLoading,
        isRefreshing,
        isLoadingDetails,
        error,
        searchQuery,
        filterRole,
        pagination,
        hasMore,
    } = useSelector((state: RootState) => state.userManagement);

    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Debounced search query
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

    // Fetch users on mount
    useEffect(() => {
        dispatch(fetchUsers({ refresh: true }));
    }, []);

    // Fetch users when debounced search or filter changes
    useEffect(() => {
        if (debouncedSearchQuery !== searchQuery) {
            dispatch(setSearchQuery(debouncedSearchQuery));
            dispatch(fetchUsers({ refresh: true }));
        }
    }, [debouncedSearchQuery]);

    // Refetch when filter changes
    useEffect(() => {
        dispatch(fetchUsers({ refresh: true }));
    }, [filterRole]);

    // Get role counts
    const roleCounts = useMemo(() => {
        return {
            all: pagination.total,
            customer: users.filter((u) => u.role === 'customer').length,
            delivery: users.filter((u) => u.role === 'delivery').length,
            admin: users.filter((u) => u.role === 'admin').length,
        };
    }, [users, pagination.total]);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'customer':
                return '#2196F3';
            case 'delivery':
                return '#FF9800';
            case 'admin':
                return '#9C27B0';
            default:
                return '#999';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'customer':
                return 'person';
            case 'delivery':
                return 'delivery-dining';
            case 'admin':
                return 'admin-panel-settings';
            default:
                return 'person';
        }
    };

    const handleViewDetails = useCallback((user: UserListItem) => {
        dispatch(fetchUserDetails(user._id));
        setDetailsModalVisible(true);
    }, [dispatch]);

    const handleDeleteUser = useCallback((userId: string) => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(deleteUserById(userId)).unwrap();
                            setDetailsModalVisible(false);
                            Alert.alert('Success', 'User has been deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        dispatch(refreshUsers());
    }, [dispatch]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            dispatch(incrementPage());
            dispatch(loadMoreUsers());
        }
    }, [hasMore, isLoading, dispatch]);

    const handleFilterChange = useCallback((role: 'all' | 'customer' | 'delivery' | 'admin') => {
        dispatch(setFilterRole(role));
    }, [dispatch]);

    // Skeleton loader for user cards
    const SkeletonUserCard = () => (
        <View style={styles.userCard}>
            <View style={styles.userCardTop}>
                <View style={styles.userCardHeader}>
                    <View style={[styles.avatar, { backgroundColor: '#E0E0E0' }]} />
                    <View style={styles.userHeaderInfo}>
                        <View style={{ width: 150, height: 18, backgroundColor: '#E0E0E0', borderRadius: 4, marginBottom: 8 }} />
                        <View style={{ width: 100, height: 12, backgroundColor: '#E0E0E0', borderRadius: 4 }} />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderUserCard = ({ item }: { item: UserListItem }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => handleViewDetails(item)}
            activeOpacity={0.7}
        >
            {/* Top Section: Avatar, Name, Role */}
            <View style={styles.userCardTop}>
                <View style={styles.userCardHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
                    </View>

                    <View style={styles.userHeaderInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View
                                style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}
                            >
                                <MaterialIcons
                                    name={getRoleIcon(item.role)}
                                    size={12}
                                    color={getRoleColor(item.role)}
                                />
                                <Text style={[styles.roleBadgeText, { color: getRoleColor(item.role) }]}>
                                    {item.role}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.userJoinedDate}>
                            Member since{' '}
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                            })}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Middle Section: Contact Info */}
            <View style={styles.userCardMiddle}>
                <View style={styles.contactRow}>
                    <View style={styles.contactItem}>
                        <MaterialIcons name="email" size={14} color="#666" />
                        <Text style={styles.contactText} numberOfLines={1}>
                            {item.email}
                        </Text>
                    </View>
                    <View style={styles.contactItem}>
                        <MaterialIcons name="phone" size={14} color="#666" />
                        <Text style={styles.contactText}>{item.phone}</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Section: Stats - Only show if available */}
            {(item.totalOrders !== undefined || item.totalDeliveries !== undefined) && (
                <View style={styles.userCardBottom}>
                    {item.role === 'customer' && item.totalOrders !== undefined && (
                        <>
                            <View style={styles.statCardSmall}>
                                <View style={[styles.statIconBox, { backgroundColor: '#E3F2FD' }]}>
                                    <MaterialIcons name="shopping-cart" size={16} color="#2196F3" />
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statValue}>{item.totalOrders}</Text>
                                    <Text style={styles.statLabel}>Total Orders</Text>
                                </View>
                            </View>

                            {item.totalSpent !== undefined && (
                                <>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statCardSmall}>
                                        <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                                            <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
                                        </View>
                                        <View style={styles.statInfo}>
                                            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                                                ₹{item.totalSpent.toFixed(0)}
                                            </Text>
                                            <Text style={styles.statLabel}>Total Spent</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </>
                    )}

                    {item.role === 'delivery' && item.totalDeliveries !== undefined && (
                        <View style={styles.statCardSmall}>
                            <View style={[styles.statIconBox, { backgroundColor: '#FFF3E0' }]}>
                                <MaterialIcons name="delivery-dining" size={16} color="#FF9800" />
                            </View>
                            <View style={styles.statInfo}>
                                <Text style={styles.statValue}>{item.totalDeliveries}</Text>
                                <Text style={styles.statLabel}>Deliveries</Text>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    const renderDetailsModal = () => {
        if (!selectedUser) return null;

        return (
            <Modal
                visible={detailsModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer} edges={['top']}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setDetailsModalVisible(false)}
                        >
                            <MaterialIcons name="close" size={24} color="#2d2d2d" />
                        </TouchableOpacity>
                        <View style={styles.modalHeaderCenter}>
                            <Text style={styles.modalHeaderTitle}>User Details</Text>
                            <Text style={styles.modalHeaderSubtitle}>Complete information</Text>
                        </View>
                        <View style={styles.modalHeaderRight} />
                    </View>

                    {isLoadingDetails ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#cb202d" />
                            <Text style={styles.loadingText}>Loading details...</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.modalContent}>
                            {/* User Profile Section */}
                            <View style={styles.profileSection}>
                                <View style={styles.profileAvatar}>
                                    <Image
                                        source={{ uri: selectedUser.profileImage }}
                                        style={styles.profileAvatarImage}
                                    />
                                </View>
                                <Text style={styles.profileName}>{selectedUser.name}</Text>
                                <View
                                    style={[
                                        styles.profileRoleBadge,
                                        { backgroundColor: getRoleColor(selectedUser.role) + '20' },
                                    ]}
                                >
                                    <MaterialIcons
                                        name={getRoleIcon(selectedUser.role)}
                                        size={16}
                                        color={getRoleColor(selectedUser.role)}
                                    />
                                    <Text
                                        style={[
                                            styles.profileRoleText,
                                            { color: getRoleColor(selectedUser.role) },
                                        ]}
                                    >
                                        {selectedUser.role.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            {/* Statistics Cards - Only show if data is available */}
                            {(selectedUser.totalOrders !== undefined ||
                                selectedUser.totalDeliveries !== undefined) && (
                                    <View style={styles.statsGrid}>
                                        {selectedUser.role === 'customer' && (
                                            <>
                                                {selectedUser.totalOrders !== undefined && (
                                                    <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                                                        <MaterialIcons name="shopping-cart" size={24} color="#2196F3" />
                                                        <Text style={styles.statCardValue}>
                                                            {selectedUser.totalOrders}
                                                        </Text>
                                                        <Text style={styles.statCardLabel}>Total Orders</Text>
                                                    </View>
                                                )}
                                                {selectedUser.totalSpent !== undefined && (
                                                    <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                                                        <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
                                                        <Text style={styles.statCardValue}>
                                                            ₹{selectedUser.totalSpent.toFixed(0)}
                                                        </Text>
                                                        <Text style={styles.statCardLabel}>Total Spent</Text>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                        {selectedUser.role === 'delivery' && selectedUser.totalDeliveries !== undefined && (
                                            <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                                                <MaterialIcons name="delivery-dining" size={24} color="#FF9800" />
                                                <Text style={styles.statCardValue}>{selectedUser.totalDeliveries}</Text>
                                                <Text style={styles.statCardLabel}>Total Deliveries</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                            {/* Contact Information */}
                            <View style={styles.detailSection}>
                                <View style={styles.detailSectionHeader}>
                                    <MaterialIcons name="contact-mail" size={20} color="#cb202d" />
                                    <Text style={styles.detailSectionTitle}>Contact Information</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialIcons name="email" size={18} color="#666" />
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>Email</Text>
                                        <Text style={styles.detailValue}>{selectedUser.email}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialIcons name="phone" size={18} color="#666" />
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>Phone</Text>
                                        <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                                    </View>
                                </View>

                                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                    <View style={styles.detailRow}>
                                        <MaterialIcons name="location-on" size={18} color="#666" />
                                        <View style={styles.detailRowContent}>
                                            <Text style={styles.detailLabel}>Address</Text>
                                            <Text style={styles.detailValue}>
                                                {selectedUser.addresses[0].street},{' '}
                                                {selectedUser.addresses[0].city}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Account Information */}
                            <View style={styles.detailSection}>
                                <View style={styles.detailSectionHeader}>
                                    <MaterialIcons name="person" size={20} color="#cb202d" />
                                    <Text style={styles.detailSectionTitle}>Account Information</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialIcons name="calendar-today" size={18} color="#666" />
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>Joined Date</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialIcons name="badge" size={18} color="#666" />
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>User Role</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Favorite Items - Only show if available */}
                            {selectedUser.favoriteItems && selectedUser.favoriteItems.length > 0 && (
                                <View style={styles.detailSection}>
                                    <View style={styles.detailSectionHeader}>
                                        <MaterialIcons name="favorite" size={20} color="#cb202d" />
                                        <Text style={styles.detailSectionTitle}>Favorite Items</Text>
                                    </View>
                                    <View style={styles.favoritesContainer}>
                                        {selectedUser.favoriteItems.map((item, index) => (
                                            <View key={index} style={styles.favoriteChip}>
                                                <MaterialIcons name="local-pizza" size={14} color="#cb202d" />
                                                <Text style={styles.favoriteChipText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Order History - Only show if available */}
                            {selectedUser.orderHistory && selectedUser.orderHistory.length > 0 && (
                                <View style={styles.detailSection}>
                                    <View style={styles.detailSectionHeader}>
                                        <MaterialIcons name="history" size={20} color="#cb202d" />
                                        <Text style={styles.detailSectionTitle}>Recent Orders</Text>
                                    </View>
                                    {selectedUser.orderHistory.map((order) => (
                                        <View key={order.id} style={styles.orderHistoryCard}>
                                            <View style={styles.orderHistoryHeader}>
                                                <Text style={styles.orderHistoryId}>{order.id}</Text>
                                                <Text style={[styles.orderHistoryStatus, { color: '#4CAF50' }]}>
                                                    {order.status}
                                                </Text>
                                            </View>
                                            <View style={styles.orderHistoryDetails}>
                                                <View style={styles.orderHistoryDetailItem}>
                                                    <MaterialIcons name="calendar-today" size={12} color="#999" />
                                                    <Text style={styles.orderHistoryDetailText}>
                                                        {new Date(order.date).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                <View style={styles.orderHistoryDetailItem}>
                                                    <MaterialIcons name="shopping-bag" size={12} color="#999" />
                                                    <Text style={styles.orderHistoryDetailText}>
                                                        {order.items} items
                                                    </Text>
                                                </View>
                                                <View style={styles.orderHistoryDetailItem}>
                                                    <MaterialIcons name="attach-money" size={12} color="#999" />
                                                    <Text style={styles.orderHistoryDetailText}>
                                                        ₹{order.total.toFixed(0)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Bottom spacing */}
                            <View style={{ height: 100 }} />
                        </ScrollView>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => handleDeleteUser(selectedUser._id)}
                        >
                            <MaterialIcons name="delete" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Delete User</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>User Management</Text>
                    <Text style={styles.headerSubtitle}>{pagination.total} users</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, email, or phone..."
                    placeholderTextColor="#999"
                    value={localSearchQuery}
                    onChangeText={setLocalSearchQuery}
                />
                {localSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setLocalSearchQuery('')}>
                        <MaterialIcons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'all' && styles.filterChipActive]}
                        onPress={() => handleFilterChange('all')}
                    >
                        <MaterialIcons
                            name="people"
                            size={16}
                            color={filterRole === 'all' ? '#fff' : '#666'}
                        />
                        <Text
                            style={[
                                styles.filterChipText,
                                filterRole === 'all' && styles.filterChipTextActive,
                            ]}
                        >
                            All ({pagination.total})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'customer' && styles.filterChipActive]}
                        onPress={() => handleFilterChange('customer')}
                    >
                        <MaterialIcons
                            name="person"
                            size={16}
                            color={filterRole === 'customer' ? '#fff' : '#2196F3'}
                        />
                        <Text
                            style={[
                                styles.filterChipText,
                                filterRole === 'customer' && styles.filterChipTextActive,
                            ]}
                        >
                            Customers
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'delivery' && styles.filterChipActive]}
                        onPress={() => handleFilterChange('delivery')}
                    >
                        <MaterialIcons
                            name="delivery-dining"
                            size={16}
                            color={filterRole === 'delivery' ? '#fff' : '#FF9800'}
                        />
                        <Text
                            style={[
                                styles.filterChipText,
                                filterRole === 'delivery' && styles.filterChipTextActive,
                            ]}
                        >
                            Delivery Boys
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'admin' && styles.filterChipActive]}
                        onPress={() => handleFilterChange('admin')}
                    >
                        <MaterialIcons
                            name="admin-panel-settings"
                            size={16}
                            color={filterRole === 'admin' ? '#fff' : '#9C27B0'}
                        />
                        <Text
                            style={[
                                styles.filterChipText,
                                filterRole === 'admin' && styles.filterChipTextActive,
                            ]}
                        >
                            Admins
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorBanner}>
                    <MaterialIcons name="error-outline" size={20} color="#F44336" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* User List */}
            <FlatList
                data={users}
                renderItem={renderUserCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.userList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#cb202d']}
                        tintColor="#cb202d"
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => {
                    if (isLoading && users.length > 0) {
                        return (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator size="small" color="#cb202d" />
                                <Text style={styles.footerLoaderText}>Loading more...</Text>
                            </View>
                        );
                    }
                    return null;
                }}
                ListEmptyComponent={() => {
                    if (isLoading) {
                        return (
                            <View>
                                <SkeletonUserCard />
                                <SkeletonUserCard />
                                <SkeletonUserCard />
                            </View>
                        );
                    }
                    return (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="person-off" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No users found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                        </View>
                    );
                }}
            />

            {/* User Details Modal */}
            {renderDetailsModal()}
        </SafeAreaView>
    );
};

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
        backgroundColor: '#fff',
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
    headerSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    headerRight: {
        width: 44,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 14,
        color: '#2d2d2d',
    },

    // Filters
    filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 6,
    },
    filterChipActive: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
    },

    // Error Banner
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: '#F44336',
        fontWeight: '500',
    },

    // User List
    userList: {
        padding: 16,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },

    // User Card Top - Avatar, Name, Status
    userCardTop: {
        padding: 16,
        paddingBottom: 12,
    },
    userCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    userHeaderInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
        gap: 4,
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    userJoinedDate: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },

    // User Card Middle - Contact Info
    userCardMiddle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    contactRow: {
        gap: 8,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    contactText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },

    // User Card Bottom - Stats
    userCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
    },
    statCardSmall: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    statLabel: {
        fontSize: 10,
        color: '#999',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
    },

    // Loading & Empty States
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    footerLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    footerLoaderText: {
        fontSize: 13,
        color: '#999',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 4,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalCloseButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeaderCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    modalHeaderSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    modalHeaderRight: {
        width: 44,
    },
    modalContent: {
        flex: 1,
    },

    // Profile Section
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    profileAvatar: {
        marginBottom: 16,
    },
    profileAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 12,
    },
    profileRoleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    profileRoleText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    statCardValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 8,
    },
    statCardLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    // Detail Sections
    detailSection: {
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 16,
    },
    detailSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginLeft: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailRowContent: {
        flex: 1,
        marginLeft: 12,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: '#2d2d2d',
        fontWeight: '500',
    },

    // Favorites
    favoritesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    favoriteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFEBEE',
    },
    favoriteChipText: {
        fontSize: 12,
        color: '#cb202d',
        fontWeight: '500',
        marginLeft: 4,
    },

    // Order History
    orderHistoryCard: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    orderHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderHistoryId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    orderHistoryStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderHistoryDetails: {
        flexDirection: 'row',
        gap: 16,
    },
    orderHistoryDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderHistoryDetailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },

    // Modal Footer
    modalFooter: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
});

export default UserManagementScreen;
