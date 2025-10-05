import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountSettingsScreen() {
    const navigation = useNavigation();
    const { name, email } = useSelector((state: RootState) => state.auth);

    // Personal Information State
    const [personalInfo, setPersonalInfo] = useState({
        fullName: name || 'Delivery Partner',
        email: email || 'partner@example.com',
        phone: '+91 98765 43210',
    });

    const [originalPersonalInfo] = useState({
        fullName: name || 'Delivery Partner',
        email: email || 'partner@example.com',
        phone: '+91 98765 43210',
    });

    // Check if personal info has changed
    const hasPersonalInfoChanged =
        personalInfo.fullName !== originalPersonalInfo.fullName ||
        personalInfo.email !== originalPersonalInfo.email ||
        personalInfo.phone !== originalPersonalInfo.phone;

    const handleSavePersonalInfo = () => {
        Alert.alert(
            'Success',
            'Personal information updated successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // In real app, this would update after successful API response
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
                        colors={['#E8F5E9', '#C8E6C9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="person" size={20} color="#4CAF50" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>Personal Information</Text>
                    </LinearGradient>

                    <View style={styles.inputRow}>
                        <MaterialIcons name="person" size={20} color="#4CAF50" />
                        <TextInput
                            style={styles.inputField}
                            value={personalInfo.fullName}
                            onChangeText={(text) => setPersonalInfo({ ...personalInfo, fullName: text })}
                            placeholder="Enter your full name"
                            placeholderTextColor="#8E8E93"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <MaterialIcons name="email" size={20} color="#4CAF50" />
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
                        <MaterialIcons name="phone" size={20} color="#4CAF50" />
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

                {/* Uploaded Documents */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#E3F2FD', '#BBDEFB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.colorfulSectionHeader}
                    >
                        <View style={styles.sectionIconContainer}>
                            <MaterialIcons name="description" size={20} color="#1976D2" />
                        </View>
                        <Text style={styles.colorfulSectionTitle}>Uploaded Documents</Text>
                    </LinearGradient>

                    <TouchableOpacity style={styles.documentRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="badge" size={20} color="#4CAF50" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>ID Proof</Text>
                                <Text style={styles.settingValue}>Aadhaar Card - Verified ✓</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.documentRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="directions-car" size={20} color="#2196F3" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Driving License</Text>
                                <Text style={styles.settingValue}>DL-1420110012345 - Verified ✓</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.documentRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="verified" size={20} color="#FF9800" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Vehicle RC</Text>
                                <Text style={styles.settingValue}>Registration Certificate - Verified ✓</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.documentRow} activeOpacity={0.7}>
                        <View style={styles.settingLeft}>
                            <MaterialIcons name="health-and-safety" size={20} color="#9C27B0" />
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Vehicle Insurance</Text>
                                <Text style={styles.settingValue}>Valid till Dec 2025 - Verified ✓</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

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
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    colorfulSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    sectionIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    colorfulSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    inputField: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#2d2d2d',
        padding: 0,
    },
    saveButtonSimple: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginVertical: 16,
        paddingVertical: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#F5F5F5',
    },
    saveButtonTextSimple: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4CAF50',
    },
    saveButtonTextDisabled: {
        color: '#9E9E9E',
    },
    documentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
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
        fontSize: 15,
        fontWeight: '600',
        color: '#2d2d2d',
        marginBottom: 2,
    },
    settingValue: {
        fontSize: 13,
        color: '#8E8E93',
    },
    bottomSpacing: {
        height: 40,
    },
});
