/**
 * Notification Debug Screen
 * 
 * Comprehensive testing and debugging for push notifications
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../redux/store';
import NotificationService from '../../../services/notifications/NotificationService';
import apiClient from '../../../api/apiClient';

export default function NotificationDebugScreen() {
    const { userId, role } = useSelector((state: RootState) => state.auth);
    const [logs, setLogs] = useState<string[]>([]);
    const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
    const [pushToken, setPushToken] = useState<string>('');
    const [deviceInfo, setDeviceInfo] = useState<any>({});

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [logMessage, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    useEffect(() => {
        loadDebugInfo();
    }, []);

    const loadDebugInfo = async () => {
        addLog('📊 Loading debug information...');

        // Device info
        const info = {
            isDevice: Device.isDevice,
            deviceName: Device.deviceName,
            platform: Platform.OS,
            osVersion: Device.osVersion,
            brand: Device.brand,
            modelName: Device.modelName,
        };
        setDeviceInfo(info);
        addLog(`📱 Device: ${info.brand} ${info.modelName} (${info.platform} ${info.osVersion})`);
        addLog(`🔍 Is Physical Device: ${info.isDevice}`);

        // Permission status
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setPermissionStatus(status);
            addLog(`🔐 Permission Status: ${status}`);
        } catch (error) {
            addLog(`❌ Error getting permission: ${error}`);
        }

        // Push token
        const token = NotificationService.getCurrentToken();
        if (token) {
            setPushToken(token);
            addLog(`🎫 Current Token: ${token.substring(0, 30)}...`);
        } else {
            addLog('⚠️ No push token found');
        }

        // Notification channels (Android)
        if (Platform.OS === 'android') {
            try {
                const channels = await Notifications.getNotificationChannelsAsync();
                addLog(`📋 Notification Channels: ${channels.length}`);
                channels.forEach(ch => {
                    addLog(`   - ${ch.id}: ${ch.name} (${ch.importance})`);
                });
            } catch (error) {
                addLog(`❌ Error getting channels: ${error}`);
            }
        }

        addLog('✅ Debug info loaded');
    };

    // Test 1: Check Permissions
    const testPermissions = async () => {
        addLog('🧪 TEST 1: Checking Permissions...');
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            addLog(`Current status: ${existingStatus}`);

            if (existingStatus !== 'granted') {
                addLog('Requesting permissions...');
                const { status } = await Notifications.requestPermissionsAsync();
                addLog(`New status: ${status}`);
                setPermissionStatus(status);
            } else {
                addLog('✅ Permissions already granted');
                setPermissionStatus(existingStatus);
            }
        } catch (error) {
            addLog(`❌ Permission test failed: ${error}`);
        }
    };

    // Test 2: Get Push Token
    const testPushToken = async () => {
        addLog('🧪 TEST 2: Getting Push Token...');
        try {
            const token = await NotificationService.getExpoPushToken();
            if (token) {
                setPushToken(token);
                addLog(`✅ Token received: ${token.substring(0, 30)}...`);
                addLog(`Token length: ${token.length}`);
                addLog(`Valid format: ${token.startsWith('ExponentPushToken[')}`);
            } else {
                addLog('❌ Failed to get token');
            }
        } catch (error) {
            addLog(`❌ Token test failed: ${error}`);
        }
    };

    // Test 3: Schedule Local Notification (Immediate)
    const testLocalNotification = async () => {
        addLog('🧪 TEST 3: Scheduling Local Notification...');
        try {
            await NotificationService.showLocalNotification(
                '🧪 Local Test',
                'This is a local notification - if you see this, listeners work!',
                { type: 'order:new', orderId: 'test-local-123' }
            );
            addLog('✅ Local notification scheduled');
            addLog('⏰ Should appear in 1-2 seconds');
        } catch (error) {
            addLog(`❌ Local notification failed: ${error}`);
        }
    };

    // Test 4: Register Token with Backend
    const testBackendRegistration = async () => {
        addLog('🧪 TEST 4: Registering Token with Backend...');
        try {
            if (!pushToken) {
                addLog('❌ No push token available - run Test 2 first');
                return;
            }

            if (!userId || !role) {
                addLog('❌ User not logged in');
                return;
            }

            addLog(`User ID: ${userId}`);
            addLog(`Role: ${role}`);
            addLog(`Token: ${pushToken.substring(0, 30)}...`);

            const result = await NotificationService.registerDeviceToken(userId, role as any);
            if (result) {
                addLog('✅ Token registered with backend');
            } else {
                addLog('❌ Backend registration failed');
            }
        } catch (error) {
            addLog(`❌ Backend test failed: ${error}`);
        }
    };

    // Test 5: Send Test Notification from Backend
    const testBackendPing = async () => {
        addLog('🧪 TEST 5: Sending Test from Backend...');
        try {
            if (!pushToken) {
                addLog('❌ No push token - run Test 2 first');
                return;
            }

            addLog('📤 Calling backend ping endpoint...');
            const response = await apiClient.post('/device-tokens/ping', {
                token: pushToken,
                title: '🧪 Backend Test',
                body: `Test from backend at ${new Date().toLocaleTimeString()}`
            });

            if (response.data.success) {
                addLog('✅ Backend sent notification');
                addLog('⏰ Wait 5-30 seconds for delivery...');
            } else {
                addLog(`❌ Backend error: ${JSON.stringify(response.data)}`);
            }
        } catch (error: any) {
            addLog(`❌ Ping failed: ${error.message}`);
            if (error.response) {
                addLog(`Response: ${JSON.stringify(error.response.data)}`);
            }
        }
    };

    // Test 6: Listen for Notifications
    const testListeners = async () => {
        addLog('🧪 TEST 6: Testing Notification Listeners...');
        addLog('🎧 Setting up temporary listeners...');

        const receivedListener = Notifications.addNotificationReceivedListener(notification => {
            addLog('📬 NOTIFICATION RECEIVED!');
            addLog(`Title: ${notification.request.content.title}`);
            addLog(`Body: ${notification.request.content.body}`);
            addLog(`Data: ${JSON.stringify(notification.request.content.data)}`);
            Alert.alert(
                '📬 Notification Received!',
                `Title: ${notification.request.content.title}\n\nListeners are working!`,
                [{ text: 'OK' }]
            );
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            addLog('👆 NOTIFICATION TAPPED!');
            addLog(`Data: ${JSON.stringify(response.notification.request.content.data)}`);
            Alert.alert('👆 Notification Tapped!', 'Tap handler is working!');
        });

        addLog('✅ Temporary listeners active');
        addLog('🧪 Now send a test notification (Test 3 or 5)');

        // Clean up after 2 minutes
        setTimeout(() => {
            receivedListener.remove();
            responseListener.remove();
            addLog('🧹 Temporary listeners removed');
        }, 120000);
    };

    // Test 7: Full Flow Test
    const testFullFlow = async () => {
        addLog('🧪 TEST 7: Running Full Flow Test...');
        addLog('Step 1: Checking permissions...');
        await testPermissions();

        await new Promise(resolve => setTimeout(resolve, 1000));

        addLog('Step 2: Getting push token...');
        await testPushToken();

        await new Promise(resolve => setTimeout(resolve, 1000));

        addLog('Step 3: Registering with backend...');
        await testBackendRegistration();

        await new Promise(resolve => setTimeout(resolve, 1000));

        addLog('Step 4: Setting up listeners...');
        await testListeners();

        await new Promise(resolve => setTimeout(resolve, 1000));

        addLog('Step 5: Sending local test...');
        await testLocalNotification();

        addLog('✅ Full flow complete - watch for notifications!');
    };

    const clearLogs = () => {
        setLogs([]);
        addLog('🧹 Logs cleared');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>🔔 Notification Debug Center</Text>

                {/* Device Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📱 Device Information</Text>
                    <Text style={styles.infoText}>Device: {deviceInfo.brand} {deviceInfo.modelName}</Text>
                    <Text style={styles.infoText}>Platform: {deviceInfo.platform} {deviceInfo.osVersion}</Text>
                    <Text style={styles.infoText}>Is Physical: {deviceInfo.isDevice ? 'Yes ✅' : 'No ❌'}</Text>
                    <Text style={styles.infoText}>Permission: {permissionStatus}</Text>
                </View>

                {/* Current Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎫 Current Status</Text>
                    <Text style={styles.infoText}>User ID: {userId || 'Not logged in'}</Text>
                    <Text style={styles.infoText}>Role: {role || 'N/A'}</Text>
                    <Text style={styles.infoText}>
                        Token: {pushToken ? `${pushToken.substring(0, 20)}...` : 'No token'}
                    </Text>
                </View>

                {/* Test Buttons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🧪 Individual Tests</Text>

                    <TouchableOpacity style={styles.button} onPress={testPermissions}>
                        <Text style={styles.buttonText}>1️⃣ Test Permissions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testPushToken}>
                        <Text style={styles.buttonText}>2️⃣ Get Push Token</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testLocalNotification}>
                        <Text style={styles.buttonText}>3️⃣ Send Local Notification</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testBackendRegistration}>
                        <Text style={styles.buttonText}>4️⃣ Register with Backend</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testBackendPing}>
                        <Text style={styles.buttonText}>5️⃣ Send from Backend (Ping)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testListeners}>
                        <Text style={styles.buttonText}>6️⃣ Test Listeners</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={testFullFlow}
                    >
                        <Text style={styles.buttonText}>🚀 Run Full Test Flow</Text>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={loadDebugInfo}>
                        <Text style={styles.buttonText}>🔄 Reload Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={clearLogs}>
                        <Text style={styles.buttonText}>🧹 Clear Logs</Text>
                    </TouchableOpacity>
                </View>

                {/* Logs */}
                <View style={styles.logsSection}>
                    <Text style={styles.sectionTitle}>📋 Debug Logs</Text>
                    {logs.length === 0 ? (
                        <Text style={styles.infoText}>No logs yet. Run some tests!</Text>
                    ) : (
                        logs.map((log, index) => (
                            <Text key={index} style={styles.logText}>{log}</Text>
                        ))
                    )}
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
    scrollView: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#FF6B35',
        marginTop: 10,
    },
    secondaryButton: {
        backgroundColor: '#6c757d',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    logsSection: {
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        padding: 16,
        marginBottom: 32,
    },
    logText: {
        fontSize: 12,
        color: '#00ff00',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});
