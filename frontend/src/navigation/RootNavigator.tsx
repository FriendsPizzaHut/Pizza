import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, loadAuthState, loadOnboardingState } from '../../redux/store';
import { restoreAuthState, setLoading } from '../../redux/slices/authSlice';
import { setOnboardingCompleted } from '../../redux/slices/onboardingSlice';
import { RootStackParamList } from '../types/navigation';

// Screen Imports
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import DeliveryNavigator from './DeliveryNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/common/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const dispatch = useDispatch();
    const { isAuthenticated, role, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
    const { isCompleted: onboardingCompleted, isLoading: onboardingLoading } = useSelector((state: RootState) => state.onboarding) as any;

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check onboarding status
                const onboardingState = await loadOnboardingState();
                dispatch(setOnboardingCompleted(onboardingState));

                // Check auth state
                const authState = await loadAuthState();
                if (authState?.token) {
                    dispatch(restoreAuthState({
                        token: authState.token,
                        role: authState.role,
                        name: authState.name,
                        email: authState.email,
                        userId: authState.userId,
                    }));
                } else {
                    dispatch(setLoading(false));
                }
            } catch (error) {
                console.error('Error initializing app:', error);
                dispatch(setLoading(false));
            }
        };

        initializeApp();
    }, [dispatch]);

    // Show loading while checking states
    if (authLoading || onboardingLoading) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!onboardingCompleted ? (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : !isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <>
                    {role === 'customer' && (
                        <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
                    )}
                    {role === 'delivery' && (
                        <Stack.Screen name="DeliveryApp" component={DeliveryNavigator} />
                    )}
                    {role === 'admin' && (
                        <Stack.Screen name="AdminApp" component={AdminNavigator} />
                    )}
                </>
            )}
        </Stack.Navigator>
    );
}