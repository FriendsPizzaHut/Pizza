/**
 * Expo App Configuration
 * 
 * This file dynamically loads environment variables and configures the app.
 * It extends the static app.json configuration.
 */

export default ({ config }) => {
    // Determine if we're in production
    const isProduction = process.env.APP_ENV === 'production';

    return {
        ...config,
        name: 'FriendsPizzaHut',
        slug: 'friendspizzahut',
        owner: 'friendspizza',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        newArchEnabled: true,

        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
        },

        // iOS Configuration
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.friendspizza.app',
            buildNumber: '1.0.0',
            infoPlist: {
                UIBackgroundModes: ['remote-notification'],
                NSCameraUsageDescription: 'This app needs access to the camera to upload photos.',
                NSPhotoLibraryUsageDescription:
                    'This app needs access to your photo library to select and upload images.',
                NSPhotoLibraryAddUsageDescription: 'This app needs access to save photos to your library.',
                NSMicrophoneUsageDescription: 'This app needs access to the microphone for video recording.',
                NSLocationWhenInUseUsageDescription:
                    'This app needs your location to provide delivery services.',
                NSLocationAlwaysAndWhenInUseUsageDescription:
                    'This app needs your location to track deliveries.',
            },
            googleServicesFile: './GoogleService-Info.plist',
        },

        // Android Configuration
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
            package: 'com.friendspizza.app',
            versionCode: 1,
            permissions: [
                'ACCESS_COARSE_LOCATION',
                'ACCESS_FINE_LOCATION',
                'CAMERA',
                'READ_EXTERNAL_STORAGE',
                'WRITE_EXTERNAL_STORAGE',
                'NOTIFICATIONS',
            ],
            googleServicesFile: './google-services.json',
        },

        // Web Configuration
        web: {
            favicon: './assets/favicon.png',
        },

        // Plugins
        plugins: [
            [
                'expo-notifications',
                {
                    icon: './assets/icon.png',
                    color: '#FF6347',
                    sounds: ['./assets/notification_sound.wav'],
                },
            ],
            [
                'expo-build-properties',
                {
                    android: {
                        compileSdkVersion: 35,
                        targetSdkVersion: 35,
                        buildToolsVersion: '35.0.0',
                    },
                    ios: {
                        deploymentTarget: '15.1',
                    },
                },
            ],
            './plugins/withRazorpay.js',
        ],

        // Extra configuration
        extra: {
            // API URLs
            apiUrlDevelopment: process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT || 'http://192.168.1.36:5000',
            apiUrlProduction:
                process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://pizzabackend-u9ui.onrender.com',

            // Payment Configuration
            razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',

            // Cloudinary Configuration
            cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
            cloudinaryApiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
            cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',

            // App Configuration
            environment: isProduction ? 'production' : 'development',
            enableAnalytics: isProduction,
            enableCrashReporting: isProduction,

            // Feature Flags
            features: {
                enablePushNotifications: true,
                enableLocationTracking: true,
                enableOfflineMode: true,
                enableRealtimeUpdates: true,
            },

            // EAS Configuration
            eas: {
                projectId: 'de50bb26-9718-4d80-b482-c5cf1b18407d',
            },
        },

        // Scheme for deep linking
        scheme: 'friendspizzahut',

        // Updates
        updates: {
            fallbackToCacheTimeout: 0,
            url: 'https://u.expo.dev/de50bb26-9718-4d80-b482-c5cf1b18407d',
        },

        // Runtime version for updates
        runtimeVersion: {
            policy: 'sdkVersion',
        },

        // Asset patterns
        assetBundlePatterns: ['**/*'],
    };
};
