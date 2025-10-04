import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryTabParamList, DeliveryStackParamList } from '../types/navigation';

// Main Tab Screens
import DeliveryDashboardScreen from '../screens/delivery/main/DashboardScreen';
import ActiveOrdersScreen from '../screens/delivery/main/ActiveOrdersScreen';
import DeliveryOrderHistoryScreen from '../screens/delivery/main/OrderHistoryScreen';
import DeliveryProfileScreen from '../screens/delivery/main/ProfileScreen';

// Sub-screens
import DeliveryOrderDetailsScreen from '../screens/delivery/orders/OrderDetailsScreen';
import NavigationScreen from '../screens/delivery/orders/NavigationScreen';
import CustomerContactScreen from '../screens/delivery/orders/CustomerContactScreen';
import EarningsHistoryScreen from '../screens/delivery/profile/EarningsHistoryScreen';
import VehicleInfoScreen from '../screens/delivery/profile/VehicleInfoScreen';
import DeliverySettingsScreen from '../screens/delivery/profile/DeliverySettingsScreen';

const Tab = createBottomTabNavigator<DeliveryTabParamList>();
const Stack = createNativeStackNavigator<DeliveryStackParamList>();

function DeliveryTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'speedometer' : 'speedometer-outline';
                            break;
                        case 'ActiveOrders':
                            iconName = focused ? 'bicycle' : 'bicycle-outline';
                            break;
                        case 'OrderHistory':
                            iconName = focused ? 'time' : 'time-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4CAF50',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DeliveryDashboardScreen} />
            <Tab.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
            <Tab.Screen name="OrderHistory" component={DeliveryOrderHistoryScreen} />
            <Tab.Screen name="Profile" component={DeliveryProfileScreen} />
        </Tab.Navigator>
    );
}

export default function DeliveryNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} />

            {/* Order Sub-screens */}
            <Stack.Screen name="OrderDetails" component={DeliveryOrderDetailsScreen} />
            <Stack.Screen name="Navigation" component={NavigationScreen} />
            <Stack.Screen name="CustomerContact" component={CustomerContactScreen} />

            {/* Profile Sub-screens */}
            <Stack.Screen name="EarningsHistory" component={EarningsHistoryScreen} />
            <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
            <Stack.Screen name="DeliverySettings" component={DeliverySettingsScreen} />
        </Stack.Navigator>
    );
}