import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    joinedDate: string;
    totalOrders: number;
    totalSpent: number;
    role: 'customer' | 'delivery boy' | 'admin';
    address: string;
    favoriteItems: string[];
    orderHistory: {
        id: string;
        date: string;
        items: number;
        total: number;
        status: string;
    }[];
};

const UserManagementScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'customer' | 'delivery boy' | 'admin'>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

    // Mock data - Replace with API call
    const [users, setUsers] = useState<User[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234-567-8900',
            avatar: 'https://i.pravatar.cc/150?img=12',
            joinedDate: '2024-01-15',
            totalOrders: 45,
            totalSpent: 1250.50,
            role: 'customer',
            address: '123 Main St, Apt 4B, New York, NY 10001',
            favoriteItems: ['Margherita Pizza', 'Caesar Salad', 'Garlic Bread'],
            orderHistory: [
                { id: 'ORD001', date: '2024-03-20', items: 3, total: 45.99, status: 'Delivered' },
                { id: 'ORD002', date: '2024-03-15', items: 2, total: 32.50, status: 'Delivered' },
                { id: 'ORD003', date: '2024-03-10', items: 4, total: 67.25, status: 'Delivered' },
            ],
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 234-567-8901',
            avatar: 'https://i.pravatar.cc/150?img=23',
            joinedDate: '2024-02-10',
            totalOrders: 28,
            totalSpent: 825.75,
            role: 'customer',
            address: '456 Oak Ave, Suite 12, Brooklyn, NY 11201',
            favoriteItems: ['Pepperoni Pizza', 'Wings'],
            orderHistory: [
                { id: 'ORD004', date: '2024-03-19', items: 2, total: 38.50, status: 'Delivered' },
                { id: 'ORD005', date: '2024-03-12', items: 3, total: 52.00, status: 'Delivered' },
            ],
        },
        {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.j@example.com',
            phone: '+1 234-567-8902',
            avatar: 'https://i.pravatar.cc/150?img=33',
            joinedDate: '2023-11-20',
            totalOrders: 156,
            totalSpent: 0,
            role: 'delivery boy',
            address: '789 Pine Rd, Queens, NY 11354',
            favoriteItems: [],
            orderHistory: [],
        },
        {
            id: '4',
            name: 'Sarah Williams',
            email: 'sarah.w@example.com',
            phone: '+1 234-567-8903',
            avatar: 'https://i.pravatar.cc/150?img=47',
            joinedDate: '2024-03-01',
            totalOrders: 8,
            totalSpent: 215.50,
            role: 'customer',
            address: '321 Elm St, Manhattan, NY 10011',
            favoriteItems: ['Veggie Supreme', 'Mushroom Pizza'],
            orderHistory: [
                { id: 'ORD007', date: '2024-03-21', items: 3, total: 55.50, status: 'Delivered' },
            ],
        },
        {
            id: '5',
            name: 'Robert Brown',
            email: 'rob.brown@example.com',
            phone: '+1 234-567-8904',
            avatar: 'https://i.pravatar.cc/150?img=60',
            joinedDate: '2024-01-05',
            totalOrders: 0,
            totalSpent: 0,
            role: 'admin',
            address: '555 Broadway, Staten Island, NY 10301',
            favoriteItems: [],
            orderHistory: [],
        },
        {
            id: '6',
            name: 'Alex Turner',
            email: 'alex.turner@example.com',
            phone: '+1 234-567-8905',
            avatar: 'https://i.pravatar.cc/150?img=68',
            joinedDate: '2023-12-10',
            totalOrders: 234,
            totalSpent: 0,
            role: 'delivery boy',
            address: '890 Broadway, Manhattan, NY 10012',
            favoriteItems: [],
            orderHistory: [],
        },
        {
            id: '7',
            name: 'Emily Davis',
            email: 'emily.d@example.com',
            phone: '+1 234-567-8906',
            avatar: 'https://i.pravatar.cc/150?img=45',
            joinedDate: '2024-02-20',
            totalOrders: 0,
            totalSpent: 0,
            role: 'admin',
            address: '123 Admin Tower, NY 10001',
            favoriteItems: [],
            orderHistory: [],
        },
    ]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);
        const matchesFilter = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesFilter;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'customer': return '#2196F3';
            case 'delivery boy': return '#FF9800';
            case 'admin': return '#9C27B0';
            default: return '#999';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'customer': return 'person';
            case 'delivery boy': return 'delivery-dining';
            case 'admin': return 'admin-panel-settings';
            default: return 'person';
        }
    };

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setDetailsModalVisible(true);
    };

    const handleDeleteUser = (userId: string) => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setUsers(users.filter(user => user.id !== userId));
                        setDetailsModalVisible(false);
                        Alert.alert('Success', 'User has been deleted');
                    }
                }
            ]
        );
    };

    const renderUserCard = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => handleViewDetails(item)}
            activeOpacity={0.7}
        >
            {/* Top Section: Avatar, Name, Role */}
            <View style={styles.userCardTop}>
                <View style={styles.userCardHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    </View>

                    <View style={styles.userHeaderInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{item.name}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                                <MaterialIcons name={getRoleIcon(item.role)} size={12} color={getRoleColor(item.role)} />
                                <Text style={[styles.roleBadgeText, { color: getRoleColor(item.role) }]}>
                                    {item.role}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.userJoinedDate}>
                            Member since {new Date(item.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Middle Section: Contact Info */}
            <View style={styles.userCardMiddle}>
                <View style={styles.contactRow}>
                    <View style={styles.contactItem}>
                        <MaterialIcons name="email" size={14} color="#666" />
                        <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <MaterialIcons name="phone" size={14} color="#666" />
                        <Text style={styles.contactText}>{item.phone}</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Section: Stats */}
            <View style={styles.userCardBottom}>
                <View style={styles.statCardSmall}>
                    <View style={[styles.statIconBox, { backgroundColor: '#E3F2FD' }]}>
                        <MaterialIcons name="shopping-cart" size={16} color="#2196F3" />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statValue}>{item.totalOrders}</Text>
                        <Text style={styles.statLabel}>{item.role === 'delivery boy' ? 'Deliveries' : 'Total Orders'}</Text>
                    </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCardSmall}>
                    <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={[styles.statValue, { color: '#4CAF50' }]}>₹{item.totalSpent.toFixed(0)}</Text>
                        <Text style={styles.statLabel}>Total Spent</Text>
                    </View>
                </View>
            </View>
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

                    <ScrollView style={styles.modalContent}>
                        {/* User Profile Section */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileAvatar}>
                                <Image source={{ uri: selectedUser.avatar }} style={styles.profileAvatarImage} />
                            </View>
                            <Text style={styles.profileName}>{selectedUser.name}</Text>
                            <View style={[styles.profileRoleBadge, { backgroundColor: getRoleColor(selectedUser.role) + '20' }]}>
                                <MaterialIcons name={getRoleIcon(selectedUser.role)} size={16} color={getRoleColor(selectedUser.role)} />
                                <Text style={[styles.profileRoleText, { color: getRoleColor(selectedUser.role) }]}>
                                    {selectedUser.role.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {/* Statistics Cards */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialIcons name="shopping-cart" size={24} color="#2196F3" />
                                <Text style={styles.statCardValue}>{selectedUser.totalOrders}</Text>
                                <Text style={styles.statCardLabel}>{selectedUser.role === 'delivery boy' ? 'Deliveries' : 'Total Orders'}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                                <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
                                <Text style={styles.statCardValue}>₹{selectedUser.totalSpent.toFixed(0)}</Text>
                                <Text style={styles.statCardLabel}>Total Spent</Text>
                            </View>
                        </View>

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

                            <View style={styles.detailRow}>
                                <MaterialIcons name="location-on" size={18} color="#666" />
                                <View style={styles.detailRowContent}>
                                    <Text style={styles.detailLabel}>Address</Text>
                                    <Text style={styles.detailValue}>{selectedUser.address}</Text>
                                </View>
                            </View>
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
                                    <Text style={styles.detailValue}>{new Date(selectedUser.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <MaterialIcons name="badge" size={18} color="#666" />
                                <View style={styles.detailRowContent}>
                                    <Text style={styles.detailLabel}>User Role</Text>
                                    <Text style={styles.detailValue}>{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Favorite Items */}
                        {selectedUser.favoriteItems.length > 0 && (
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

                        {/* Order History */}
                        {selectedUser.orderHistory.length > 0 && (
                            <View style={styles.detailSection}>
                                <View style={styles.detailSectionHeader}>
                                    <MaterialIcons name="history" size={20} color="#cb202d" />
                                    <Text style={styles.detailSectionTitle}>Recent Orders</Text>
                                </View>
                                {selectedUser.orderHistory.map((order) => (
                                    <View key={order.id} style={styles.orderHistoryCard}>
                                        <View style={styles.orderHistoryHeader}>
                                            <Text style={styles.orderHistoryId}>{order.id}</Text>
                                            <Text style={[styles.orderHistoryStatus, { color: '#4CAF50' }]}>{order.status}</Text>
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
                                                <Text style={styles.orderHistoryDetailText}>{order.items} items</Text>
                                            </View>
                                            <View style={styles.orderHistoryDetailItem}>
                                                <MaterialIcons name="attach-money" size={12} color="#999" />
                                                <Text style={styles.orderHistoryDetailText}>₹{order.total.toFixed(0)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Bottom spacing */}
                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => handleDeleteUser(selectedUser.id)}
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>User Management</Text>
                    <Text style={styles.headerSubtitle}>{filteredUsers.length} users</Text>
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
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'all' && styles.filterChipActive]}
                        onPress={() => setFilterRole('all')}
                    >
                        <MaterialIcons name="people" size={16} color={filterRole === 'all' ? '#fff' : '#666'} />
                        <Text style={[styles.filterChipText, filterRole === 'all' && styles.filterChipTextActive]}>
                            All ({users.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'customer' && styles.filterChipActive]}
                        onPress={() => setFilterRole('customer')}
                    >
                        <MaterialIcons name="person" size={16} color={filterRole === 'customer' ? '#fff' : '#2196F3'} />
                        <Text style={[styles.filterChipText, filterRole === 'customer' && styles.filterChipTextActive]}>
                            Customers ({users.filter(u => u.role === 'customer').length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'delivery boy' && styles.filterChipActive]}
                        onPress={() => setFilterRole('delivery boy')}
                    >
                        <MaterialIcons name="delivery-dining" size={16} color={filterRole === 'delivery boy' ? '#fff' : '#FF9800'} />
                        <Text style={[styles.filterChipText, filterRole === 'delivery boy' && styles.filterChipTextActive]}>
                            Delivery Boys ({users.filter(u => u.role === 'delivery boy').length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterRole === 'admin' && styles.filterChipActive]}
                        onPress={() => setFilterRole('admin')}
                    >
                        <MaterialIcons name="admin-panel-settings" size={16} color={filterRole === 'admin' ? '#fff' : '#9C27B0'} />
                        <Text style={[styles.filterChipText, filterRole === 'admin' && styles.filterChipTextActive]}>
                            Admins ({users.filter(u => u.role === 'admin').length})
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* User List */}
            <FlatList
                data={filteredUsers}
                renderItem={renderUserCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.userList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="person-off" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No users found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                    </View>
                }
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
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
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
    viewDetailsButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    // Empty State
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
    profileAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileAvatarText: {
        fontSize: 36,
        fontWeight: '700',
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
