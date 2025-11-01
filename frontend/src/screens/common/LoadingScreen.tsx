import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    ActivityIndicator,
    Easing,
    Image,
} from 'react-native';

export default function LoadingScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.9)).current;

    // Bubble animations
    const bubble1 = useRef(new Animated.Value(0)).current;
    const bubble2 = useRef(new Animated.Value(0)).current;
    const bubble3 = useRef(new Animated.Value(0)).current;
    const bubble4 = useRef(new Animated.Value(0)).current;
    const bubble5 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Bubble animations - floating up
        const createBubbleAnimation = (bubble: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(bubble, {
                        toValue: 1,
                        duration: 4000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(bubble, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        createBubbleAnimation(bubble1, 0).start();
        createBubbleAnimation(bubble2, 800).start();
        createBubbleAnimation(bubble3, 1600).start();
        createBubbleAnimation(bubble4, 2400).start();
        createBubbleAnimation(bubble5, 3200).start();
    }, []);

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.container}>
                {/* Animated Bubbles Background */}
                <Animated.View
                    style={[
                        styles.bubble,
                        styles.bubble1,
                        {
                            opacity: bubble1.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.3, 0.6, 0],
                            }),
                            transform: [
                                {
                                    translateY: bubble1.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -800],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.bubble,
                        styles.bubble2,
                        {
                            opacity: bubble2.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.4, 0.7, 0],
                            }),
                            transform: [
                                {
                                    translateY: bubble2.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -900],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.bubble,
                        styles.bubble3,
                        {
                            opacity: bubble3.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.3, 0.5, 0],
                            }),
                            transform: [
                                {
                                    translateY: bubble3.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -850],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.bubble,
                        styles.bubble4,
                        {
                            opacity: bubble4.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.4, 0.6, 0],
                            }),
                            transform: [
                                {
                                    translateY: bubble4.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -750],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.bubble,
                        styles.bubble5,
                        {
                            opacity: bubble5.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.3, 0.7, 0],
                            }),
                            transform: [
                                {
                                    translateY: bubble5.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -820],
                                    }),
                                },
                            ],
                        },
                    ]}
                />

                {/* Main Content */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../../assets/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Friends Pizza Hut</Text>
                    <Text style={styles.subtitle}>Delicious food, delivered to you</Text>

                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#cb202d" style={styles.spinner} />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                </Animated.View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    // Bubbles
    bubble: {
        position: 'absolute',
        borderRadius: 9999,
        backgroundColor: '#cb202d',
    },
    bubble1: {
        width: 80,
        height: 80,
        bottom: -80,
        left: '10%',
    },
    bubble2: {
        width: 120,
        height: 120,
        bottom: -120,
        right: '5%',
    },
    bubble3: {
        width: 60,
        height: 60,
        bottom: -60,
        left: '70%',
    },
    bubble4: {
        width: 100,
        height: 100,
        bottom: -100,
        left: '40%',
    },
    bubble5: {
        width: 70,
        height: 70,
        bottom: -70,
        right: '35%',
    },
    // Content
    content: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 3,
        borderColor: '#cb202d',
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        fontWeight: '400',
        marginBottom: 40,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    spinner: {
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d2d2d',
    },
});