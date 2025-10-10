# 🚀 Performance Optimization Integration Guide

## Overview
This guide shows how to integrate all the performance optimizations into your React Native Expo pizza app to achieve "Swiggy/Zomato/Hotstar-level" performance.

## Quick Integration Checklist

### 1. App.tsx Integration
```tsx
import React from 'react';
import { PerformanceProvider, initializePerformance } from './src/utils/performanceInit';
import { PerformanceDevTools } from './src/utils/performanceTesting';

// Initialize performance systems at app start
initializePerformance().then(() => {
    console.log('🚀 Performance systems initialized');
});

export default function App() {
    return (
        <PerformanceProvider>
            {/* Your existing app content */}
        </PerformanceProvider>
    );
}
```

### 2. Package.json Dependencies
Add these to your package.json:
```json
{
    "dependencies": {
        "zustand": "^4.4.7",
        "react-native-reanimated": "~3.15.0"
    },
    "devDependencies": {
        "@welldone-software/why-did-you-render": "^8.0.1"
    }
}
```

### 3. Metro Configuration
Update metro.config.js for better bundle optimization:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable bundle splitting
config.transformer.getTransformOptions = async () => ({
    transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
    },
});

// Optimize for performance
config.resolver.platforms = ['native', 'android', 'ios'];

module.exports = config;
```

## Component Migration Guide

### High-Performance Lists
Replace FlatList with UltraOptimizedList:

**Before:**
```tsx
<FlatList
    data={menuItems}
    renderItem={({ item }) => <MenuItem item={item} />}
    keyExtractor={item => item.id}
/>
```

**After:**
```tsx
import { UltraOptimizedList } from '../components/common/UltraOptimizedList';

<UltraOptimizedList
    data={menuItems}
    renderItem={({ item }) => <MenuItem item={item} />}
    keyExtractor={item => item.id}
    performanceConfig={{
        enableVirtualization: true,
        batchSize: 10,
        targetFPS: 60
    }}
/>
```

### Optimized Images
Replace Image with OptimizedImage:

**Before:**
```tsx
<Image source={{ uri: item.image }} style={styles.image} />
```

**After:**
```tsx
import { OptimizedImage } from '../components/common/OptimizedImage';

<OptimizedImage
    source={{ uri: item.image }}
    style={styles.image}
    progressive
    cloudinaryOptimizations={{
        quality: 'auto',
        format: 'auto',
        width: 300
    }}
/>
```

### State Management Migration
Replace Redux with Zustand for real-time data:

**Before (Redux):**
```tsx
const menuItems = useSelector(state => state.menu.items);
const dispatch = useDispatch();
```

**After (Zustand):**
```tsx
import { useAppStore } from '../stores/appStore';

const menuItems = useAppStore(state => state.menuItems);
const setMenuItems = useAppStore(state => state.setMenuItems);
```

### Lazy Loading Implementation
Replace direct imports with lazy loading:

**Before:**
```tsx
import MenuScreen from './screens/MenuScreen';
```

**After:**
```tsx
import { createLazyScreen } from '../utils/lazyLoading';

const MenuScreen = createLazyScreen(() => import('./screens/MenuScreen'));
```

## Performance Testing Integration

### Development Testing
Add to your development workflow:

```tsx
// In your development component or debug screen
import { PerformanceDevTools } from '../utils/performanceTesting';

// Add buttons for testing
<Button title="Run Performance Tests" onPress={PerformanceDevTools.runTestSuite} />
<Button title="Stress Test" onPress={PerformanceDevTools.triggerStressTest} />
```

### Automated Testing
Add to your CI/CD pipeline:

```javascript
// performance.test.js
import { PerformanceTestSuite } from '../src/utils/performanceTesting';

describe('Performance Tests', () => {
    it('should maintain 60fps under load', async () => {
        const testSuite = new PerformanceTestSuite();
        const results = await testSuite.runAllTests();
        
        // Check critical tests pass
        expect(results.get('High Load List Rendering').success).toBe(true);
        expect(results.get('Real-time Socket Updates').success).toBe(true);
    });
});
```

## Real-Time Updates Integration

### Socket Manager Setup
```tsx
import { getSocketManager } from '../services/socketManager';

// In your app initialization
const socketManager = getSocketManager();
socketManager.connect('ws://your-api-url');

// Listen for batched updates
socketManager.on('orders_batch_update', (orders) => {
    useAppStore.getState().updateOrders(orders);
});
```

### Background Tasks
```tsx
import { backgroundTaskManager } from '../utils/backgroundTasks';

// Schedule background sync
backgroundTaskManager.scheduleTask({
    name: 'Order Sync',
    priority: 'high',
    data: { lastSync: Date.now() },
    processor: async (data) => {
        // Sync orders in background
        return await syncOrdersWithServer(data.lastSync);
    }
});
```

## Performance Monitoring Setup

### Real-Time Monitoring
```tsx
import { performanceMonitor } from '../utils/performance';

// Start monitoring
performanceMonitor.startMonitoring();

// Get real-time metrics
const metrics = performanceMonitor.getCurrentMetrics();
console.log(`FPS: ${metrics.fps}, Memory: ${metrics.memory.used}MB`);
```

### Production Analytics
```tsx
// Send performance data to analytics
performanceMonitor.onPerformanceIssue((issue) => {
    if (!__DEV__) {
        // Send to Crashlytics, Sentry, etc.
        analytics.track('performance_issue', {
            type: issue.type,
            severity: issue.severity,
            metrics: issue.metrics
        });
    }
});
```

## Critical Performance Configurations

### Device-Specific Optimization
The system automatically detects device capabilities and adjusts:

- **High-end devices**: Full animations, 60fps target, aggressive caching
- **Mid-range devices**: Reduced animations, 45fps target, balanced caching  
- **Low-end devices**: Minimal animations, 30fps target, conservative caching

### Memory Management
```tsx
// Configure memory thresholds
performanceMonitor.configure({
    memoryThresholds: {
        warning: 100, // MB
        critical: 200, // MB
        emergency: 300 // MB
    }
});
```

## Testing Scenarios

### Load Testing
```typescript
// Test with 1000+ menu items
const largeDataset = Array.from({ length: 1000 }, generateMenuItem);
useAppStore.getState().setMenuItems(largeDataset);
```

### Network Stress Testing
```typescript
// Test with poor network conditions
socketManager.simulateNetworkConditions({
    latency: 2000, // 2s delay
    packetLoss: 0.1, // 10% packet loss
    bandwidth: 'slow-3g'
});
```

### Offline Testing
```typescript
// Test offline functionality
useAppStore.getState().setOnlineStatus(false);
// Perform actions that should queue
// Go back online and verify sync
useAppStore.getState().setOnlineStatus(true);
```

## Performance Targets

### Target Metrics
- **FPS**: 60fps on high-end, 45fps on mid-range, 30fps minimum
- **Memory**: <200MB for main screens, <500MB peak
- **Startup Time**: <3 seconds cold start, <1 second warm start
- **Navigation**: <200ms screen transitions
- **Image Loading**: Progressive loading, <2 seconds for grid
- **Real-time Updates**: <100ms for socket updates, batched processing

### Monitoring Alerts
Set up alerts for:
- FPS drops below 30
- Memory usage >300MB
- Startup time >5 seconds
- Navigation time >500ms
- Socket update lag >200ms

## Production Deployment

### Release Checklist
- [ ] Performance tests pass
- [ ] Memory leaks resolved
- [ ] Image optimization enabled
- [ ] Bundle size optimized
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Background sync tested
- [ ] Offline mode validated

### Gradual Rollout
1. Enable for 5% of users
2. Monitor performance metrics
3. Increase to 25% if stable
4. Full rollout if no issues

## Troubleshooting Common Issues

### Performance Issues
1. **Low FPS**: Check for unnecessary re-renders with Why Did You Render
2. **High Memory**: Use Memory Leak Detector to find leaks
3. **Slow Navigation**: Verify lazy loading is working
4. **Poor Image Loading**: Check Cloudinary configuration

### Development Tools
- Use `PerformanceDevTools` for manual testing
- Enable Flipper performance plugin
- Use React Native Performance Monitor
- Profile with Chrome DevTools

## Advanced Optimizations

### Custom Optimizations
```tsx
// Add custom performance optimizations
performanceMonitor.addCustomMetric('custom_render_time', () => {
    // Your custom performance measurement
});
```

### Platform-Specific Tweaks
```tsx
import { Platform } from 'react-native';

const config = {
    android: {
        // Android-specific optimizations
        enableHermes: true,
        enableTTI: true
    },
    ios: {
        // iOS-specific optimizations  
        enableFabric: true,
        enableTurboModules: true
    }
}[Platform.OS];
```

This comprehensive integration guide ensures your pizza app achieves enterprise-level performance comparable to top apps like Swiggy, Zomato, and Hotstar. 🚀