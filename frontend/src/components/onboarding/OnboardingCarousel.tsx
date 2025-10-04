import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
// Navigation handled by parent component
import { completeOnboarding, nextSlide, setCurrentSlide } from '../../../redux/slices/onboardingSlice';
import { saveOnboardingState } from '../../../redux/store';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
}

const onboardingSlides: OnboardingSlide[] = [
    {
        id: 1,
        title: 'Order Delicious Pizza',
        subtitle: 'Fresh & Hot',
        description: 'Browse our menu and order your favorite pizzas with just a few taps. Get fresh, hot pizza delivered right to your door.',
        icon: '🍕',
        color: '#FF6B6B',
    },
    {
        id: 2,
        title: 'Fast Delivery',
        subtitle: 'Track in Real-time',
        description: 'Our delivery team ensures your pizza reaches you quickly. Track your order in real-time and get live updates.',
        icon: '🚚',
        color: '#4ECDC4',
    },
    {
        id: 3,
        title: 'Manage Your Business',
        subtitle: 'Admin Dashboard',
        description: 'Restaurant owners can manage orders, menu, and delivery partners all from one powerful dashboard.',
        icon: '📊',
        color: '#45B7D1',
    },
];

interface OnboardingCarouselProps {
    currentSlide: number;
}

export default function OnboardingCarousel({ currentSlide }: OnboardingCarouselProps) {
    const dispatch = useDispatch();
    const scrollViewRef = React.useRef<ScrollView>(null);

    const handleNext = () => {
        if (currentSlide < onboardingSlides.length - 1) {
            const nextIndex = currentSlide + 1;
            dispatch(nextSlide());
            scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        }
    };

    const handleSkip = async () => {
        await saveOnboardingState(true);
        dispatch(completeOnboarding());
        // Navigation handled by parent component
    };

    const handleGetStarted = async () => {
        await saveOnboardingState(true);
        dispatch(completeOnboarding());
        // Navigation handled by parent component
    };

    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        dispatch(setCurrentSlide(slideIndex));
    };

    const renderSlide = (slide: OnboardingSlide, index: number) => (
        <View key={slide.id} style={[styles.slide, { backgroundColor: slide.color }]}>
            <View style={styles.slideContent}>
                <Text style={styles.icon}>{slide.icon}</Text>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={styles.scrollView}
            >
                {onboardingSlides.map((slide, index) => renderSlide(slide, index))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {onboardingSlides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentSlide ? styles.activeDot : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                {currentSlide < onboardingSlides.length - 1 ? (
                    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleGetStarted} style={styles.getStartedButton}>
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width,
        height: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    slideContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 100,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.9,
    },
    description: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#333',
    },
    inactiveDot: {
        backgroundColor: '#ccc',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    skipButton: {
        padding: 15,
    },
    skipText: {
        fontSize: 16,
        color: '#666',
    },
    nextButton: {
        backgroundColor: '#333',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    nextText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    getStartedButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    getStartedText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});