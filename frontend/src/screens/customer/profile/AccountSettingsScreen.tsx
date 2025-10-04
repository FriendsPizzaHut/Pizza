import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';

export default function AccountSettingsScreen() {
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⚙️ Account Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.textInput}
                            defaultValue="John Doe"
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.textInput}
                            defaultValue="john.doe@example.com"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.textInput}
                            defaultValue="+1 (555) 123-4567"
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>

                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Order Updates</Text>
                            <Text style={styles.settingDescription}>Get notified about order status changes</Text>
                        </View>
                        <Switch
                            value={notifications.orderUpdates}
                            onValueChange={(value) => setNotifications({ ...notifications, orderUpdates: value })}
                            trackColor={{ false: '#ccc', true: '#FF6B6B' }}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Promotions & Offers</Text>
                            <Text style={styles.settingDescription}>Receive special deals and discounts</Text>
                        </View>
                        <Switch
                            value={notifications.promotions}
                            onValueChange={(value) => setNotifications({ ...notifications, promotions: value })}
                            trackColor={{ false: '#ccc', true: '#FF6B6B' }}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Newsletter</Text>
                            <Text style={styles.settingDescription}>Weekly updates and news</Text>
                        </View>
                        <Switch
                            value={notifications.newsletter}
                            onValueChange={(value) => setNotifications({ ...notifications, newsletter: value })}
                            trackColor={{ false: '#ccc', true: '#FF6B6B' }}
                        />
                    </View>
                </View>

                {/* App Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Preferences</Text>

                    <TouchableOpacity style={styles.preferenceRow}>
                        <View>
                            <Text style={styles.settingTitle}>Language</Text>
                            <Text style={styles.settingValue}>{preferences.language}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.preferenceRow}>
                        <View>
                            <Text style={styles.settingTitle}>Currency</Text>
                            <Text style={styles.settingValue}>{preferences.currency}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.preferenceRow}>
                        <View>
                            <Text style={styles.settingTitle}>Theme</Text>
                            <Text style={styles.settingValue}>{preferences.theme}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Security */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>🔒 Change Password</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>🔐 Two-Factor Authentication</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Management</Text>

                    <TouchableOpacity style={styles.dangerButton}>
                        <Text style={styles.dangerButtonText}>🗑️ Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#FF6B6B',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginVertical: 8,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    inputGroup: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    settingValue: {
        fontSize: 14,
        color: '#FF6B6B',
        marginTop: 2,
    },
    preferenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    actionButtonText: {
        fontSize: 16,
        color: '#333',
    },
    dangerButton: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    dangerButtonText: {
        fontSize: 16,
        color: '#ff4444',
        fontWeight: '600',
    },
});