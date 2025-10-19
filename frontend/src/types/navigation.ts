// Navigation Type Definitions
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: undefined;
    CustomerApp: undefined;
    DeliveryApp: undefined;
    AdminApp: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    DeliverySignup: undefined;
    ForgotPassword: undefined;
};

export type CustomerTabParamList = {
    Home: undefined;
    Menu: undefined;
    Orders: undefined;
    Profile: undefined;
};

export type CustomerStackParamList = {
    CustomerTabs: undefined;
    // Profile Sub-screens
    DeliveryAddresses: undefined;
    ManageAddresses: undefined;
    PaymentMethods: undefined;
    ManageCards: undefined;
    OrderHistory: undefined;
    OrderDetails: { orderId: string };
    AccountSettings: undefined;
    NotificationSettings: undefined;
    HelpSupport: undefined;
    // Menu Sub-screens
    PizzaMenu: undefined;
    SidesMenu: undefined;
    DrinksMenu: undefined;
    DealsMenu: undefined;
    PizzaDetails: { pizzaId: string };
    ItemDetails: { itemId: string }; // For non-pizza items (sides, beverages, desserts)
    SideDetails: { sideId: string };
    DrinkDetails: { drinkId: string };
    Cart: undefined;
    Checkout: undefined;
    // Address Management Sub-screens
    AddAddress: { fromScreen?: 'Checkout' | 'ManageAddresses' };
    EditAddress: { addressId: string; fromScreen?: 'Checkout' | 'ManageAddresses' };
    ManageAddress: { fromScreen?: 'Checkout' | 'Profile' };
    // Order Sub-screens
    TrackOrder: { orderId: string };
};

export type DeliveryTabParamList = {
    Home: undefined;
    ActiveOrders: undefined;
    Profile: undefined;
};

export type DeliveryStackParamList = {
    DeliveryTabs: undefined;
    // Order Sub-screens
    OrderDetails: { orderId: string };
    Navigation: { orderId: string; address: string };
    CustomerContact: { orderId: string; customerPhone: string };
    PaymentCollection: {
        orderId: string;
        orderNumber: string;
        customerName: string;
        customerPhone: string;
        totalAmount: number;
        orderItems: Array<{ name: string; quantity: number; price: number }>;
        deliveryAddress: string;
    };
    // Profile Sub-screens
    DeliverySettings: undefined;
    SupportTickets: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    OrderManagement: undefined;
    MenuManagement: undefined;
    Profile: undefined;
};

export type AdminStackParamList = {
    AdminTabs: undefined;
    // Main Screens
    Notifications: undefined;
    // Debug Screens
    NotificationDebug: undefined;
    // Order Management Sub-screens
    OrderDetails: { orderId: string };
    AssignDelivery: { orderId: string };
    AssignDeliveryAgent: { orderId: string; orderDetails: any };
    // Menu Management Sub-screens
    AddMenuItem: undefined;
    EditMenuItem: { itemId: string };
    CategoryManagement: undefined;
    // Analytics Sub-screens
    SalesReports: undefined;
    DeliveryAnalytics: undefined;
    CustomerInsights: undefined;
    // Staff Management Sub-screens
    StaffManagement: undefined;
    DeliveryPartners: undefined;
    RestaurantSettings: undefined;
    AccountSettings: undefined;
    UserManagement: undefined;
    DeliveryAgentApprovals: undefined;
    OfferManagement: undefined;
    AddOffer: { offer?: any } | undefined;
};