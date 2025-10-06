import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, StatusBar, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

export default function AccountSettingsScreen() {
    const navigation = useNavigation();
    const { name, email } = useSelector((state: RootState) => state.auth);

    // Personal Information State
    const [personalInfo, setPersonalInfo] = useState({
        fullName: name || 'Admin User',
        email: email || 'admin@pizzahut.com',
        phone: '+91 98765 43210',
    });

    const [originalPersonalInfo] = useState({
        fullName: name || 'Admin User',
        email: email || 'admin@pizzahut.com',
        phone: '+91 98765 43210',
    });

    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promotions: false,
        newsletter: true,
    });

    const [preferences, setPreferences] = useState({
        language: 'English',
        currency: 'USD',
        theme: 'Light',
    });

    // Check if personal info has changed
    const hasPersonalInfoChanged =
        personalInfo.fullName !== originalPersonalInfo.fullName ||
        personalInfo.email !== originalPersonalInfo.email ||
        personalInfo.phone !== originalPersonalInfo.phone;

    const handleSavePersonalInfo = () => {
        // Here you would typically make an API call to save the data
        Alert.alert(
            'Success',
            'Personal information updated successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Update original values to match current
                        // In real app, this would be done after successful API response
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Account Settings</Text>
                    <View style={styles.placeholder} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Personal Information */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#FFF3E0', '#FFE0B2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="person" size={20} color="#FF8F00" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>Personal Information</Text>
                    </LinearGradient>

                    <View style={styles.inputRow}>
                        <MaterialIcons name="person" size={20} color="#FF8F00" />
                        <TextInput
                            style={styles.inputField}
                            value={personalInfo.fullName}
                            onChangeText={(text) => setPersonalInfo({ ...personalInfo, fullName: text })}
                            placeholder="Enter your full name"
                            placeholderTextColor="#8E8E93"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <MaterialIcons name="email" size={20} color="#FF8F00" />
                        <TextInput
                            style={styles.inputField}
                            value={personalInfo.email}
                            onChangeText={(text) => setPersonalInfo({ ...personalInfo, email: text })}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            placeholderTextColor="#8E8E93"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <MaterialIcons name="phone" size={20} color="#FF8F00" />
                        <TextInput
                            style={styles.inputField}
                            value={personalInfo.phone}
                            onChangeText={(text) => setPersonalInfo({ ...personalInfo, phone: text })}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            placeholderTextColor="#8E8E93"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButtonSimple, !hasPersonalInfoChanged && styles.saveButtonDisabled]}
                        onPress={hasPersonalInfoChanged ? handleSavePersonalInfo : undefined}
                        activeOpacity={hasPersonalInfoChanged ? 0.8 : 1}
                        disabled={!hasPersonalInfoChanged}
                    >
                        <MaterialIcons
                            name="save"
                            size={18}
                            color={hasPersonalInfoChanged ? "#4CAF50" : "#9E9E9E"}
                        />
                        <Text style={[styles.saveButtonTextSimple, !hasPersonalInfoChanged && styles.saveButtonTextDisabled]}>
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Notification Settings */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#E3F2FD', '#BBDEFB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="notifications" size={20} color="#1976D2" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>Notifications</Text>
                    </LinearGradient>

                    <View style={styles.switchRow}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="delivery-dining" size={20} color="#4CAF50" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Order Updates</Text>
                                <Text style={styles.settingValue}>Get notified about order status changes</Text>
                            </View>
                        </View>
                        <Switch
                            value={notifications.orderUpdates}
                            onValueChange={(value) => setNotifications({ ...notifications, orderUpdates: value })}
                            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                            thumbColor={notifications.orderUpdates ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="local-offer" size={20} color="#FF9800" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Promotions & Offers</Text>
                                <Text style={styles.settingValue}>Receive special deals and discounts</Text>
                            </View>
                        </View>
                        <Switch
                            value={notifications.promotions}
                            onValueChange={(value) => setNotifications({ ...notifications, promotions: value })}
                            trackColor={{ false: '#E0E0E0', true: '#FF9800' }}
                            thumbColor={notifications.promotions ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="mail-outline" size={20} color="#2196F3" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Newsletter</Text>
                                <Text style={styles.settingValue}>Weekly updates and news</Text>
                            </View>
                        </View>
                        <Switch
                            value={notifications.newsletter}
                            onValueChange={(value) => setNotifications({ ...notifications, newsletter: value })}
                            trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                            thumbColor={notifications.newsletter ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* App Preferences */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#FCE4EC', '#F8BBD0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="tune" size={20} color="#C2185B" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>App Preferences</Text>
                    </LinearGradient>

                    <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="language" size={20} color="#C2185B" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Language</Text>
                                <Text style={styles.settingValue}>{preferences.language}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="attach-money" size={20} color="#C2185B" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Currency</Text>
                                <Text style={styles.settingValue}>{preferences.currency}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="palette" size={20} color="#C2185B" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Theme</Text>
                                <Text style={styles.settingValue}>{preferences.theme}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                {/* Security */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#E8F5E9', '#C8E6C9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="security" size={20} color="#388E3C" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>Security</Text>
                    </LinearGradient>

                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="lock" size={20} color="#388E3C" />
                            <Text style={styles.actionButtonText}>Change Password</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="verified-user" size={20} color="#388E3C" />
                            <Text style={styles.actionButtonText}>Two-Factor Authentication</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                {/* Account Management */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#FFEBEE', '#FFCDD2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="manage-accounts" size={20} color="#D32F2F" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>Account Management</Text>
                    </LinearGradient>

                    <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="delete-outline" size={20} color="#ff4444" />
                            <Text style={styles.dangerButtonText}>Delete Account</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
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
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
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
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    colorfulSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        borderRadius: 12,
    },
    sectionIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    colorfulSectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d2d2d',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingInfo: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    preferenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginLeft: 12,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    dangerButtonText: {
        fontSize: 16,
        color: '#ff4444',
        fontWeight: '500',
        marginLeft: 12,
    },
    bottomSpacing: {
        height: 30,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonTextDisabled: {
        color: '#9E9E9E',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
    saveButtonSimple: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 16,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
    },
    saveButtonTextSimple: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4CAF50',
        marginLeft: 6,
    },
});
