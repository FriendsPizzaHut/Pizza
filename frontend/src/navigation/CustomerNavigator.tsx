import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerTabParamList, CustomerStackParamList } from '../types/navigation';

// Main Tab Screens
import CustomerHomeScreen from '../screens/customer/main/HomeScreen';
import MenuScreen from '../screens/customer/main/MenuScreen';
import OrdersScreen from '../screens/customer/main/OrdersScreen';
import ProfileScreen from '../screens/customer/main/ProfileScreen';

// Sub-screens
import DeliveryAddressesScreen from '../screens/customer/profile/DeliveryAddressesScreen';
import PaymentMethodsScreen from '../screens/customer/profile/PaymentMethodsScreen';
import OrderHistoryScreen from '../screens/customer/profile/OrderHistoryScreen';
import AccountSettingsScreen from '../screens/customer/profile/AccountSettingsScreen';
import HelpSupportScreen from '../screens/customer/profile/HelpSupportScreen';
import CartScreen from '../screens/customer/menu/CartScreen';
import PizzaDetailsScreen from '../screens/customer/menu/PizzaDetailsScreen';
import CheckoutScreen from '../screens/customer/menu/CheckoutScreen';
import AddAddressScreen from '../screens/customer/menu/AddAddressScreen';
import EditAddressScreen from '../screens/customer/menu/EditAddressScreen';
import TrackOrderScreen from '../screens/customer/orders/TrackOrderScreen';
import OrderDetailsScreen from '../screens/customer/orders/OrderDetailsScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabs() {
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
                        case 'Menu':
                            iconName = focused ? 'restaurant' : 'restaurant-outline';
                            break;
                        case 'Orders':
                            iconName = focused ? 'receipt' : 'receipt-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF6B6B',
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
            <Tab.Screen name="Home" component={CustomerHomeScreen} />
            <Tab.Screen name="Menu" component={MenuScreen} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function CustomerNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />

            {/* Profile Sub-screens */}
            <Stack.Screen name="DeliveryAddresses" component={DeliveryAddressesScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

            {/* Menu Sub-screens */}
            <Stack.Screen name="PizzaDetails" component={PizzaDetailsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />

            {/* Address Management Sub-screens */}
            <Stack.Screen name="AddAddress" component={AddAddressScreen} />
            <Stack.Screen name="EditAddress" component={EditAddressScreen} />

            {/* Order Sub-screens */}
            <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        </Stack.Navigator>
    );
}