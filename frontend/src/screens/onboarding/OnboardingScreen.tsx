import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import OnboardingCarousel from '../../components/onboarding/OnboardingCarousel';

export default function OnboardingScreen() {
    const { currentSlide } = useSelector((state: RootState) => state.onboarding) as any;

    return <OnboardingCarousel currentSlide={currentSlide} />;
}