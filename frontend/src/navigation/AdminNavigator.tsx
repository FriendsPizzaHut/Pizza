import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList, AdminStackParamList } from '../types/navigation';

// Main Tab Screens
import AdminDashboardScreen from '../screens/admin/main/DashboardScreen';
import OrderManagementScreen from '../screens/admin/main/OrderManagementScreen';
import MenuManagementScreen from '../screens/admin/main/MenuManagementScreen';
import AnalyticsScreen from '../screens/admin/main/AnalyticsScreen';
import NotificationsScreen from '../screens/admin/main/NotificationsScreen';

// Sub-screens
import AdminOrderDetailsScreen from '../screens/admin/orders/OrderDetailsScreen';
import AssignDeliveryScreen from '../screens/admin/orders/AssignDeliveryScreen';
import AssignDeliveryAgentScreen from '../screens/admin/orders/AssignDeliveryAgentScreen';
import AddMenuItemScreen from '../screens/admin/menu/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/admin/menu/EditMenuItemScreen';
import CategoryManagementScreen from '../screens/admin/menu/CategoryManagementScreen';
import SalesReportsScreen from '../screens/admin/analytics/SalesReportsScreen';
import DeliveryAnalyticsScreen from '../screens/admin/analytics/DeliveryAnalyticsScreen';
import StaffManagementScreen from '../screens/admin/management/StaffManagementScreen';
import RestaurantSettingsScreen from '../screens/admin/management/RestaurantSettingsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'grid' : 'grid-outline';
                            break;
                        case 'OrderManagement':
                            iconName = focused ? 'list' : 'list-outline';
                            break;
                        case 'MenuManagement':
                            iconName = focused ? 'restaurant' : 'restaurant-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2196F3',
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
            <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
            <Tab.Screen name="OrderManagement" component={OrderManagementScreen} />
            <Tab.Screen name="MenuManagement" component={MenuManagementScreen} />
            <Tab.Screen
                name="Profile"
                component={AnalyticsScreen}
                options={{
                    tabBarLabel: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
}

export default function AdminNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="AdminTabs" component={AdminTabs} />

            {/* Main Screens */}
            <Stack.Screen name="Notifications" component={NotificationsScreen} />

            {/* Order Management Sub-screens */}
            <Stack.Screen name="OrderDetails" component={AdminOrderDetailsScreen} />
            <Stack.Screen name="AssignDelivery" component={AssignDeliveryScreen} />
            <Stack.Screen name="AssignDeliveryAgent" component={AssignDeliveryAgentScreen} />

            {/* Menu Management Sub-screens */}
            <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
            <Stack.Screen name="EditMenuItem" component={EditMenuItemScreen} />
            <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />

            {/* Analytics Sub-screens */}
            <Stack.Screen name="SalesReports" component={SalesReportsScreen} />
            <Stack.Screen name="DeliveryAnalytics" component={DeliveryAnalyticsScreen} />

            {/* Management Sub-screens */}
            <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />
            <Stack.Screen name="RestaurantSettings" component={RestaurantSettingsScreen} />
        </Stack.Navigator>
    );
}