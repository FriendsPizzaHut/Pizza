import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';

export default function DeliverySettingsScreen() {
    const [settings, setSettings] = useState({
        notifications: {
            newOrders: true,
            orderUpdates: true,
            earnings: false,
            promotions: true,
        },
        availability: {
            workingHours: 'Flexible',
            maxDistance: '5 miles',
            preferredAreas: ['Downtown', 'University District'],
        },
        preferences: {
            acceptCashOrders: true,
            acceptLargeOrders: true,
            prioritizeHighTips: false,
        },
    });

    const updateNotificationSetting = (key: keyof typeof settings.notifications, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: value }
        }));
    };

    const updatePreferenceSetting = (key: keyof typeof settings.preferences, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            preferences: { ...prev.preferences, [key]: value }
        }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⚙️ Delivery Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔔 Notifications</Text>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>New Order Alerts</Text>
                            <Text style={styles.settingDescription}>Get notified when new orders are available</Text>
                        </View>
                        <Switch
                            value={settings.notifications.newOrders}
                            onValueChange={(value) => updateNotificationSetting('newOrders', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>Order Updates</Text>
                            <Text style={styles.settingDescription}>Notifications about order status changes</Text>
                        </View>
                        <Switch
                            value={settings.notifications.orderUpdates}
                            onValueChange={(value) => updateNotificationSetting('orderUpdates', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>Earnings Updates</Text>
                            <Text style={styles.settingDescription}>Daily and weekly earnings summaries</Text>
                        </View>
                        <Switch
                            value={settings.notifications.earnings}
                            onValueChange={(value) => updateNotificationSetting('earnings', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>Promotions</Text>
                            <Text style={styles.settingDescription}>Special bonuses and incentive notifications</Text>
                        </View>
                        <Switch
                            value={settings.notifications.promotions}
                            onValueChange={(value) => updateNotificationSetting('promotions', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>
                </View>

                {/* Availability Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🕐 Availability</Text>

                    <TouchableOpacity style={styles.settingButton}>
                        <View>
                            <Text style={styles.settingLabel}>Working Hours</Text>
                            <Text style={styles.settingValue}>{settings.availability.workingHours}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingButton}>
                        <View>
                            <Text style={styles.settingLabel}>Maximum Delivery Distance</Text>
                            <Text style={styles.settingValue}>{settings.availability.maxDistance}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingButton}>
                        <View>
                            <Text style={styles.settingLabel}>Preferred Areas</Text>
                            <Text style={styles.settingValue}>{settings.availability.preferredAreas.join(', ')}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Order Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📦 Order Preferences</Text>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>Accept Cash Orders</Text>
                            <Text style={styles.settingDescription}>Accept orders with cash payment</Text>
                        </View>
                        <Switch
                            value={settings.preferences.acceptCashOrders}
                            onValueChange={(value) => updatePreferenceSetting('acceptCashOrders', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>Accept Large Orders</Text>
                            <Text style={styles.settingDescription}>Orders with 5+ items or $50+ total</Text>
                        </View>
                        <Switch
                            value={settings.preferences.acceptLargeOrders}
                            onValueChange={(value) => updatePreferenceSetting('acceptLargeOrders', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingLabel}>Prioritize High-Tip Orders</Text>
                            <Text style={styles.settingDescription}>Show orders with higher tips first</Text>
                        </View>
                        <Switch
                            value={settings.preferences.prioritizeHighTips}
                            onValueChange={(value) => updatePreferenceSetting('prioritizeHighTips', value)}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        />
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔧 Account</Text>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>📱 Update Contact Information</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>🔒 Change Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>📄 Terms & Privacy Policy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
                        <Text style={[styles.actionButtonText, styles.dangerText]}>⚠️ Deactivate Account</Text>
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
        backgroundColor: '#4CAF50',
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
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
    settingButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingValue: {
        fontSize: 14,
        color: '#4CAF50',
        marginTop: 2,
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    actionButton: {
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
        backgroundColor: '#ffebee',
    },
    dangerText: {
        color: '#d32f2f',
    },
});