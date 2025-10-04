import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OnboardingState {
    isCompleted: boolean;
    currentSlide: number;
    isLoading: boolean;
}

const initialState: OnboardingState = {
    isCompleted: false,
    currentSlide: 0,
    isLoading: true, // Start with loading to check AsyncStorage
};

const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
            state.isCompleted = action.payload;
            state.isLoading = false;
        },
        setCurrentSlide: (state, action: PayloadAction<number>) => {
            state.currentSlide = action.payload;
        },
        nextSlide: (state) => {
            state.currentSlide += 1;
        },
        completeOnboarding: (state) => {
            state.isCompleted = true;
            state.currentSlide = 0;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setOnboardingCompleted,
    setCurrentSlide,
    nextSlide,
    completeOnboarding,
    setLoading,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;