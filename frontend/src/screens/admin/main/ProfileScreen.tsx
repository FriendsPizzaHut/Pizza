import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { logoutThunk } from '../../../../redux/thunks/authThunks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { name, email, role, isLoading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout from admin panel?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(logoutThunk() as any);
                            console.log('✅ Admin logged out successfully');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    const profileOptions = [
        {
            title: 'Restaurant Settings',
            icon: 'store',
            iconType: 'MaterialIcons' as const,
            color: '#cb202d',
            bgColor: '#FFEBEE',
            action: () => navigation.navigate('RestaurantSettings'),
        },
        {
            title: 'User Management',
            icon: 'people',
            iconType: 'MaterialIcons' as const,
            color: '#2196F3',
            bgColor: '#E3F2FD',
            action: () => navigation.navigate('UserManagement'),
        },
        {
            title: 'Delivery Agent Approvals',
            icon: 'delivery-dining',
            iconType: 'MaterialIcons' as const,
            color: '#9C27B0',
            bgColor: '#F3E5F5',
            action: () => navigation.navigate('DeliveryAgentApprovals'),
        },
        {
            title: 'Manage Offers',
            icon: 'local-offer',
            iconType: 'MaterialIcons' as const,
            color: '#FF9800',
            bgColor: '#FFF3E0',
            action: () => navigation.navigate('OfferManagement'),
        },
        {
            title: 'Account Settings',
            icon: 'settings',
            iconType: 'MaterialIcons' as const,
            color: '#4CAF50',
            bgColor: '#E8F5E9',
            action: () => navigation.navigate('AccountSettings'),
        },
    ];

    const appOptions = [
        {
            title: 'Notifications',
            icon: 'notifications',
            iconType: 'MaterialIcons' as const,
            color: '#9C27B0',
            bgColor: '#F3E5F5',
            hasSwitch: true,
        },
        {
            title: 'Help & Support',
            icon: 'help-circle',
            iconType: 'MaterialCommunityIcons' as const,
            color: '#607D8B',
            bgColor: '#ECEFF1',
            hasSwitch: false,
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Clean Centered Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.8}
                    onPress={() => console.log('Edit Profile')}
                >
                    <MaterialIcons name="edit" size={18} color="#2d2d2d" />
                </TouchableOpacity>

                {/* Centered Profile Section */}
                <View style={styles.profileSection}>
                    {/* Profile Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                            <MaterialIcons name="camera-alt" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Info */}
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{name || 'Admin'}</Text>
                        <View style={styles.roleBadge}>
                            <MaterialIcons name="admin-panel-settings" size={14} color="#cb202d" />
                            <Text style={styles.roleText}>Administrator</Text>
                        </View>
                        <Text style={styles.userEmail}>{email || 'admin@pizzahut.com'}</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Menu Options */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Management</Text>

                    {profileOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuButton}
                            onPress={option.action}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuButtonLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
                                    {option.iconType === 'MaterialIcons' ? (
                                        <MaterialIcons name={option.icon as any} size={20} color={option.color} />
                                    ) : (
                                        <MaterialCommunityIcons name={option.icon as any} size={20} color={option.color} />
                                    )}
                                </View>
                                <Text style={styles.menuButtonText}>{option.title}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* App Settings */}
                <View style={styles.appInfoSection}>
                    <Text style={styles.sectionTitle}>App Settings</Text>

                    {appOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuButton}
                            activeOpacity={0.8}
                        >
                            <View style={styles.menuButtonLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
                                    {option.iconType === 'MaterialIcons' ? (
                                        <MaterialIcons name={option.icon as any} size={20} color={option.color} />
                                    ) : (
                                        <MaterialCommunityIcons name={option.icon as any} size={20} color={option.color} />
                                    )}
                                </View>
                                <Text style={styles.menuButtonText}>{option.title}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.menuButton}>
                        <View style={styles.menuButtonLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialIcons name="info" size={20} color="#2196F3" />
                            </View>
                            <Text style={styles.menuButtonText}>About App</Text>
                        </View>
                        <Text style={styles.versionText}>v1.0.0</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <View style={styles.menuButtonLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                                <MaterialIcons name="star-rate" size={20} color="#FF9800" />
                            </View>
                            <Text style={styles.menuButtonText}>Rate Us</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <MaterialIcons name="logout" size={20} color="#fff" />
                        <Text style={styles.logoutButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

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
    header: {
        backgroundColor: '#f4f4f2',
        paddingTop: 50,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    editButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#F8F8F8',
        borderRadius: 22,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#cb202d',
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    profileInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 8,
        gap: 4,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#cb202d',
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '400',
    },
    content: {
        flex: 1,
    },
    menuSection: {
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    menuButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
    },
    appInfoSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    versionText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    logoutSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    logoutButton: {
        backgroundColor: '#cb202d',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    bottomSpacing: {
        height: 40,
    },
});