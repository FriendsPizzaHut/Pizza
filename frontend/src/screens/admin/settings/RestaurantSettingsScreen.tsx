import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function RestaurantSettingsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [restaurantData, setRestaurantData] = useState({
        name: "Friend's Pizza Hut",
        phone: '+1 (555) 123-4567',
        email: 'contact@friendspizzahut.com',
        address: '123 Pizza Street, New York, NY 10001',
        taxRate: '8.5',
        serviceCharge: '5',
        deliveryRadius: '10',
        minOrderAmount: '15',
        isOpen: true,
        acceptingOrders: true,
        autoAcceptOrders: false,
    });

    const handleSaveSettings = () => {
        Alert.alert(
            'Success',
            'Restaurant settings have been updated successfully!',
            [{ text: 'OK' }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Restaurant Settings</Text>
                        <Text style={styles.headerSubtitle}>Manage your restaurant</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    {/* Basic Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="store" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Restaurant Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={restaurantData.name}
                                onChangeText={(text) => setRestaurantData({ ...restaurantData, name: text })}
                                placeholder="Enter restaurant name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWithIcon}>
                                <MaterialIcons name="phone" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.inputWithPadding]}
                                    value={restaurantData.phone}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, phone: text })}
                                    placeholder="+1 (555) 123-4567"
                                    placeholderTextColor="#999"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWithIcon}>
                                <MaterialIcons name="email" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.inputWithPadding]}
                                    value={restaurantData.email}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, email: text })}
                                    placeholder="contact@restaurant.com"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWithIcon}>
                                <MaterialIcons name="location-on" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.inputWithPadding, styles.textArea]}
                                    value={restaurantData.address}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, address: text })}
                                    placeholder="Enter full address"
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Pricing Settings */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="attach-money" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Pricing & Charges</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Tax Rate (%)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.taxRate}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, taxRate: text })}
                                    placeholder="8.5"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Service Charge (%)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.serviceCharge}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, serviceCharge: text })}
                                    placeholder="5"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Delivery Settings */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="delivery-dining" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Delivery Settings</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Delivery Radius (km)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.deliveryRadius}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, deliveryRadius: text })}
                                    placeholder="10"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Min Order ($)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={restaurantData.minOrderAmount}
                                    onChangeText={(text) => setRestaurantData({ ...restaurantData, minOrderAmount: text })}
                                    placeholder="15"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Operating Status */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="schedule" size={20} color="#cb202d" />
                            <Text style={styles.sectionTitle}>Operating Status</Text>
                        </View>

                        <View style={styles.statusRow}>
                            <MaterialIcons name="store" size={20} color="#4CAF50" />
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusTitle}>Restaurant Open</Text>
                                <Text style={styles.statusSubtext}>Toggle restaurant status</Text>
                            </View>
                            <Switch
                                value={restaurantData.isOpen}
                                onValueChange={(value) => setRestaurantData({ ...restaurantData, isOpen: value })}
                                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.statusRow}>
                            <MaterialIcons name="shopping-cart" size={20} color="#2196F3" />
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusTitle}>Accepting Orders</Text>
                                <Text style={styles.statusSubtext}>Enable/disable new orders</Text>
                            </View>
                            <Switch
                                value={restaurantData.acceptingOrders}
                                onValueChange={(value) => setRestaurantData({ ...restaurantData, acceptingOrders: value })}
                                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={styles.statusRow}>
                            <MaterialIcons name="check-circle" size={20} color="#FF9800" />
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusTitle}>Auto-Accept Orders</Text>
                                <Text style={styles.statusSubtext}>Automatically accept incoming orders</Text>
                            </View>
                            <Switch
                                value={restaurantData.autoAcceptOrders}
                                onValueChange={(value) => setRestaurantData({ ...restaurantData, autoAcceptOrders: value })}
                                trackColor={{ false: '#E0E0E0', true: '#FF9800' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>

                    {/* Bottom spacing */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },

    // Header
    headerSafeArea: {
        backgroundColor: '#f4f4f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
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

    content: {
        flex: 1,
    },
    form: {
        padding: 16,
    },

    // Section Style
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
    },

    // Input Fields
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 8,
    },
    required: {
        color: '#cb202d',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#2d2d2d',
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    inputWithIcon: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 1,
    },
    inputWithPadding: {
        paddingLeft: 40,
    },

    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },

    // Status Toggles
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    statusInfo: {
        flex: 1,
        marginLeft: 4,
    },
    statusTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    statusSubtext: {
        fontSize: 13,
        color: '#8E8E93',
    },

    // Footer
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButton: {
        backgroundColor: '#cb202d',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
