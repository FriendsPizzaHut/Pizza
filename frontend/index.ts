import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';

import App from './App';

// Register background message handler
// This MUST be called outside of the app lifecycle (before registerRootComponent)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔔 [BACKGROUND-DEBUG] Background message received!');
    console.log('📦 [BACKGROUND-DEBUG] Full message:', JSON.stringify(remoteMessage, null, 2));
    console.log('📋 [BACKGROUND-DEBUG] Notification:', remoteMessage.notification);
    console.log('📦 [BACKGROUND-DEBUG] Data:', remoteMessage.data);
    console.log('⏰ [BACKGROUND-DEBUG] Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // You can perform any background tasks here
    // Firebase will automatically display the notification
    // You can customize the notification here if needed

    return Promise.resolve();
});

console.log('✅ [FIREBASE-DEBUG] Background message handler registered at:', new Date().toISOString());

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
