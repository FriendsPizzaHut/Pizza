import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryTabParamList, DeliveryStackParamList } from '../types/navigation';
import NotificationInitializer from '../components/common/NotificationInitializer';

// Main Tab Screens
import DeliveryHomeScreen from '../screens/delivery/main/HomeScreen';
import ActiveOrdersScreen from '../screens/delivery/main/ActiveOrdersScreen';
import DeliveryProfileScreen from '../screens/delivery/main/ProfileScreen';

// Sub-screens
import DeliveryOrderDetailsScreen from '../screens/delivery/orders/OrderDetailsScreen';
import NavigationScreen from '../screens/delivery/orders/NavigationScreen';
import CustomerContactScreen from '../screens/delivery/orders/CustomerContactScreen';
import PaymentCollectionScreen from '../screens/delivery/orders/PaymentCollectionScreen';
import DeliveryAccountSettingsScreen from '../screens/delivery/profile/AccountSettingsScreen';

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
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'ActiveOrders':
                            iconName = focused ? 'bicycle' : 'bicycle-outline';
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
            <Tab.Screen name="Home" component={DeliveryHomeScreen} />
            <Tab.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
            <Tab.Screen name="Profile" component={DeliveryProfileScreen} />
        </Tab.Navigator>
    );
}

export default function DeliveryNavigator() {
    return (
        <>
            <NotificationInitializer />
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
                <Stack.Screen
                    name="PaymentCollection"
                    component={PaymentCollectionScreen}
                    options={{
                        headerShown: false,
                        presentation: 'card',
                    }}
                />

                {/* Profile Sub-screens */}
                <Stack.Screen name="DeliverySettings" component={DeliveryAccountSettingsScreen} />
            </Stack.Navigator>
        </>
    );
}