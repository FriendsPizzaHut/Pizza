import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import store from './redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { NetworkProvider } from './src/context/NetworkContext';
import { NetworkBanner } from './src/components/common/NetworkBanner';
import { errorLogger } from './src/services/errorLogger';
import { initializeApiClient } from './src/api/apiClient';

// ⚡ Performance imports
import { PerformanceProvider, performanceSystem } from './src/utils/performanceInit';
// Note: PerformanceDevTools import disabled due to export issue - can be accessed via global in dev
// import PerformanceTestingModule from './src/utils/performanceTesting';

// Initialize Why Did You Render in development (local dev only, not EAS builds)
// Disabled for EAS builds due to compatibility issues with React Native hooks
if (__DEV__ && !process.env.EAS_BUILD) {
  import('./src/utils/whyDidYouRender').catch(() => {
    // Silently fail if WDYR can't be loaded
    console.log('Why Did You Render not loaded');
  });
}

function AppContent() {
  useEffect(() => {
    // Initialize error logger
    errorLogger.initialize({
      environment: __DEV__ ? 'development' : 'production',
      // sentryDsn: 'YOUR_SENTRY_DSN',
    });

    // Initialize API client (handles offline queue and cache)
    initializeApiClient();

    // Initialize performance systems
    performanceSystem.initialize()
      .then(() => {
        console.log('🚀 Performance systems initialized successfully');
      })
      .catch((error: Error) => {
        console.error('❌ Performance initialization failed:', error);
      });

    if (__DEV__) {
      console.log('🚀 App initialized with error handling, offline support, and performance optimization');

      // Performance tools are available via dynamic import
      console.log('📊 Dev performance tools available:');
      console.log('- Access via: import("./src/utils/performanceTesting").then(m => m.PerformanceDevTools.runTestSuite())');
      console.log('- Or via browser console after dynamic import');
    }
  }, []);

  return (
    <>
      <RootNavigator />
      <NetworkBanner position="top" />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* ⚡ PERFORMANCE OPTIMIZATION: Wrap entire app with performance provider */}
      <PerformanceProvider>
        <Provider store={store}>
          <NetworkProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer>
                  <AppContent />
                </NavigationContainer>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </NetworkProvider>
        </Provider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}
