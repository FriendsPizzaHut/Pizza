import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';

export default function RestaurantSettingsScreen() {
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [settings, setSettings] = useState({
        general: {
            restaurantName: 'Friends Pizza Hut',
            address: '123 Main Street, City, State 12345',
            phone: '+1 (555) 123-4567',
            email: 'info@friendspizzahut.com',
            isOpen: true,
            deliveryRadius: '5',
            minimumOrder: '15.00',
        },
        hours: {
            monday: { open: '10:00', close: '23:00', closed: false },
            tuesday: { open: '10:00', close: '23:00', closed: false },
            wednesday: { open: '10:00', close: '23:00', closed: false },
            thursday: { open: '10:00', close: '23:00', closed: false },
            friday: { open: '10:00', close: '24:00', closed: false },
            saturday: { open: '10:00', close: '24:00', closed: false },
            sunday: { open: '11:00', close: '22:00', closed: false },
        },
        delivery: {
            deliveryFee: '2.99',
            freeDeliveryThreshold: '25.00',
            deliveryTime: '30-45',
            maxDeliveryDistance: '5',
            enableDelivery: true,
            enablePickup: true,
        },
        payment: {
            acceptCash: true,
            acceptCard: true,
            acceptDigitalWallet: true,
            taxRate: '8.5',
            serviceFee: '1.50',
            tipSuggestions: ['15%', '18%', '20%', '25%'],
        },
        notifications: {
            orderNotifications: true,
            deliveryNotifications: true,
            promotionalEmails: true,
            smsNotifications: true,
            pushNotifications: true,
        },
    });

    const categories = [
        { key: 'general', label: '🏪 General', icon: '🏪' },
        { key: 'hours', label: '🕐 Hours', icon: '🕐' },
        { key: 'delivery', label: '🚚 Delivery', icon: '🚚' },
        { key: 'payment', label: '💳 Payment', icon: '💳' },
        { key: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    ];

    const handleSaveSettings = () => {
        Alert.alert('Settings Saved', 'Your restaurant settings have been updated successfully.');
    };

    const updateSetting = (category: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [key]: value,
            },
        }));
    };

    const renderGeneralSettings = () => (
        <View>
            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Restaurant Information</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Restaurant Name</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.general.restaurantName}
                        onChangeText={(text) => updateSetting('general', 'restaurantName', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={settings.general.address}
                        onChangeText={(text) => updateSetting('general', 'address', text)}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.general.phone}
                            onChangeText={(text) => updateSetting('general', 'phone', text)}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.general.email}
                            onChangeText={(text) => updateSetting('general', 'email', text)}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Operation Settings</Text>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>Restaurant Open</Text>
                        <Text style={styles.switchSubtext}>Accept new orders</Text>
                    </View>
                    <Switch
                        value={settings.general.isOpen}
                        onValueChange={(value) => updateSetting('general', 'isOpen', value)}
                    />
                </View>

                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Delivery Radius (km)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.general.deliveryRadius}
                            onChangeText={(text) => updateSetting('general', 'deliveryRadius', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.inputLabel}>Minimum Order ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.general.minimumOrder}
                            onChangeText={(text) => updateSetting('general', 'minimumOrder', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderHoursSettings = () => (
        <View>
            <Text style={styles.groupTitle}>Operating Hours</Text>
            {Object.entries(settings.hours).map(([day, hours]) => (
                <View key={day} style={styles.hourRow}>
                    <View style={styles.dayInfo}>
                        <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                        <Switch
                            value={!hours.closed}
                            onValueChange={(value) => updateSetting('hours', day, { ...hours, closed: !value })}
                        />
                    </View>
                    {!hours.closed && (
                        <View style={styles.timeInputs}>
                            <TextInput
                                style={styles.timeInput}
                                value={hours.open}
                                onChangeText={(text) => updateSetting('hours', day, { ...hours, open: text })}
                                placeholder="10:00"
                            />
                            <Text style={styles.timeSeparator}>to</Text>
                            <TextInput
                                style={styles.timeInput}
                                value={hours.close}
                                onChangeText={(text) => updateSetting('hours', day, { ...hours, close: text })}
                                placeholder="23:00"
                            />
                        </View>
                    )}
                    {hours.closed && (
                        <Text style={styles.closedText}>Closed</Text>
                    )}
                </View>
            ))}
        </View>
    );

    const renderDeliverySettings = () => (
        <View>
            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Service Options</Text>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>Enable Delivery</Text>
                        <Text style={styles.switchSubtext}>Allow customers to order delivery</Text>
                    </View>
                    <Switch
                        value={settings.delivery.enableDelivery}
                        onValueChange={(value) => updateSetting('delivery', 'enableDelivery', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>Enable Pickup</Text>
                        <Text style={styles.switchSubtext}>Allow customers to pick up orders</Text>
                    </View>
                    <Switch
                        value={settings.delivery.enablePickup}
                        onValueChange={(value) => updateSetting('delivery', 'enablePickup', value)}
                    />
                </View>
            </View>

            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Delivery Configuration</Text>

                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Delivery Fee ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.delivery.deliveryFee}
                            onChangeText={(text) => updateSetting('delivery', 'deliveryFee', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.inputLabel}>Free Delivery Threshold ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.delivery.freeDeliveryThreshold}
                            onChangeText={(text) => updateSetting('delivery', 'freeDeliveryThreshold', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Delivery Time (minutes)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.delivery.deliveryTime}
                            onChangeText={(text) => updateSetting('delivery', 'deliveryTime', text)}
                            placeholder="30-45"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.inputLabel}>Max Distance (km)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.delivery.maxDeliveryDistance}
                            onChangeText={(text) => updateSetting('delivery', 'maxDeliveryDistance', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPaymentSettings = () => (
        <View>
            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Payment Methods</Text>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>💵 Cash Payments</Text>
                    <Switch
                        value={settings.payment.acceptCash}
                        onValueChange={(value) => updateSetting('payment', 'acceptCash', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>💳 Card Payments</Text>
                    <Switch
                        value={settings.payment.acceptCard}
                        onValueChange={(value) => updateSetting('payment', 'acceptCard', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>📱 Digital Wallets</Text>
                    <Switch
                        value={settings.payment.acceptDigitalWallet}
                        onValueChange={(value) => updateSetting('payment', 'acceptDigitalWallet', value)}
                    />
                </View>
            </View>

            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Fees & Taxes</Text>

                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Tax Rate (%)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.payment.taxRate}
                            onChangeText={(text) => updateSetting('payment', 'taxRate', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.inputLabel}>Service Fee ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.payment.serviceFee}
                            onChangeText={(text) => updateSetting('payment', 'serviceFee', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderNotificationSettings = () => (
        <View>
            <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Notification Preferences</Text>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>📋 Order Notifications</Text>
                        <Text style={styles.switchSubtext}>Get notified of new orders</Text>
                    </View>
                    <Switch
                        value={settings.notifications.orderNotifications}
                        onValueChange={(value) => updateSetting('notifications', 'orderNotifications', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>🚚 Delivery Notifications</Text>
                        <Text style={styles.switchSubtext}>Get delivery status updates</Text>
                    </View>
                    <Switch
                        value={settings.notifications.deliveryNotifications}
                        onValueChange={(value) => updateSetting('notifications', 'deliveryNotifications', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>📧 Promotional Emails</Text>
                        <Text style={styles.switchSubtext}>Receive marketing emails</Text>
                    </View>
                    <Switch
                        value={settings.notifications.promotionalEmails}
                        onValueChange={(value) => updateSetting('notifications', 'promotionalEmails', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>💬 SMS Notifications</Text>
                        <Text style={styles.switchSubtext}>Receive text messages</Text>
                    </View>
                    <Switch
                        value={settings.notifications.smsNotifications}
                        onValueChange={(value) => updateSetting('notifications', 'smsNotifications', value)}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>🔔 Push Notifications</Text>
                        <Text style={styles.switchSubtext}>Receive app notifications</Text>
                    </View>
                    <Switch
                        value={settings.notifications.pushNotifications}
                        onValueChange={(value) => updateSetting('notifications', 'pushNotifications', value)}
                    />
                </View>
            </View>
        </View>
    );

    const renderCurrentSettings = () => {
        switch (selectedCategory) {
            case 'general':
                return renderGeneralSettings();
            case 'hours':
                return renderHoursSettings();
            case 'delivery':
                return renderDeliverySettings();
            case 'payment':
                return renderPaymentSettings();
            case 'notifications':
                return renderNotificationSettings();
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⚙️ Restaurant Settings</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
                contentContainerStyle={styles.categorySelectorContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.key && styles.selectedCategoryButton
                        ]}
                        onPress={() => setSelectedCategory(category.key)}
                    >
                        <Text style={[
                            styles.categoryButtonText,
                            selectedCategory === category.key && styles.selectedCategoryButtonText
                        ]}>
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.content}>
                {renderCurrentSettings()}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                    <Text style={styles.saveButtonText}>💾 Save Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#455A64',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    categorySelector: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categorySelectorContent: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
    },
    selectedCategoryButton: {
        backgroundColor: '#455A64',
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedCategoryButtonText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    settingGroup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
    inputRow: {
        flexDirection: 'row',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    switchInfo: {
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    switchSubtext: {
        fontSize: 14,
        color: '#666',
    },
    hourRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dayInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timeInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
        width: 70,
        textAlign: 'center',
        fontSize: 14,
    },
    timeSeparator: {
        marginHorizontal: 10,
        color: '#666',
    },
    closedText: {
        marginLeft: 20,
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    saveButton: {
        backgroundColor: '#455A64',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});