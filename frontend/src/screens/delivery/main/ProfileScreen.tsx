import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeliveryStackParamList } from '../../../types/navigation';
import { RootState } from '../../../../redux/store';
import { logoutThunk } from '../../../../redux/thunks/authThunks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type NavigationProp = NativeStackNavigationProp<DeliveryStackParamList>;

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp>();
    const { name, email, isLoading } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? You will be marked as offline.',
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
                            console.log('✅ Delivery boy logged out and marked offline');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Clean Centered Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('DeliverySettings')}
                >
                    <MaterialIcons name="edit" size={18} color="#2d2d2d" />
                </TouchableOpacity>

                {/* Centered Profile Section */}
                <View style={styles.profileSection}>
                    {/* Profile Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                            <MaterialIcons name="camera-alt" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Info */}
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{name || 'Delivery Partner'}</Text>
                        <Text style={styles.userPhone}>+91 98765 43210</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Active • Available</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Account Settings */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.navigate('DeliverySettings')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.menuButtonLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialIcons name="settings" size={20} color="#2196F3" />
                            </View>
                            <Text style={styles.menuButtonText}>Account Settings</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfoSection}>
                    <Text style={styles.sectionTitle}>App</Text>

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

                    <TouchableOpacity style={styles.menuButton}>
                        <View style={styles.menuButtonLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                                <MaterialIcons name="policy" size={20} color="#9C27B0" />
                            </View>
                            <Text style={styles.menuButtonText}>Privacy Policy</Text>
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
        backgroundColor: '#4CAF50',
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
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    userPhone: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    content: {
        flex: 1,
    },

    // Menu Section
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

    // App Info Section
    appInfoSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    versionText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },

    // Logout Section
    logoutSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    logoutButton: {
        backgroundColor: '#E23744',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#E23744',
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