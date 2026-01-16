import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    Layout,
    PlusCircle,
    Layers,
    Navigation,
    Calendar,
    MousePointer2,
    Settings2,
    BrainCircuit,
    Wallet,
    Plus,
    Backpack,
    Map,
    AlertTriangle,
    Sparkles,
    MessageCircle,
    Users
} from 'lucide-react';

/**
 * TourContext - Manages the interactive product tour state
 * Provides tour control across the entire app
 */
const TourContext = createContext(null);

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        // [DEBUG] Log the reason why valid context is missing
        console.warn('useTour() called outside of TourProvider! Check Component Tree.');

        // Return safe fallback to prevent app crash
        return {
            isActive: false,
            currentStep: 0,
            currentStepData: null,
            isMockMode: false,
            startTour: () => console.warn('TourProvider missing: startTour ignored'),
            endTour: () => { },
            nextStep: () => { },
            prevStep: () => { },
            goToStep: () => { },
            skipTour: () => { },
            steps: []
        };
    }
    return context;
};

// Tour step definitions with navigation
export const TOUR_STEPS = [
    // Step 0: Welcome
    {
        id: 'welcome',
        target: null,
        titleKey: 'tour.welcome.title',
        descKey: 'tour.welcome.desc',
        page: null,
        isWelcome: true,
        type: 'general'
    },
    // Step 1: Create Your First Trip
    {
        id: 'create-trip',
        target: '[data-tour="create-trip"]',
        titleKey: 'tour.create_trip.title',
        descKey: 'tour.create_trip.desc',
        page: 'dashboard',
        position: 'right',
        icon: Plus,
        type: 'action'
    },
    // Step 1.1: Create Trip Modal - Country
    {
        id: 'create-trip-country',
        target: '[data-tour="create-trip-country"]',
        titleKey: 'tour.create_trip_country.title',
        descKey: 'tour.create_trip_country.desc',
        page: 'dashboard',
        position: 'bottom',
        icon: Map,
        type: 'action'
    },
    // Step 1.2: Create Trip Modal - Dates
    {
        id: 'create-trip-dates',
        target: '[data-tour="create-trip-dates"]',
        titleKey: 'tour.create_trip_dates.title',
        descKey: 'tour.create_trip_dates.desc',
        page: 'dashboard',
        position: 'top',
        icon: Calendar,
        type: 'action'
    },
    // Step 2: Trip Card
    {
        id: 'trip-card',
        target: '[data-tour="trip-card"]',
        titleKey: 'tour.trip_card.title',
        descKey: 'tour.trip_card.desc',
        page: 'dashboard',
        position: 'right',
        action: 'click',
        icon: Layers,
        type: 'navigation'
    },
    // Step 3: Invite Members (NEW)
    {
        id: 'invite-members',
        target: '[data-tour="invite-members"]',
        titleKey: 'tour.invite_members.title',
        descKey: 'tour.invite_members.desc',
        page: 'trip-detail',
        position: 'bottom',
        icon: Users,
        type: 'feature'
    },
    // Step 4: Ask Jarvis (AI)
    {
        id: 'ask-jarvis',
        target: '[data-tour="ask-jarvis-daily"]',
        titleKey: 'tour.ask_jarvis.title',
        descKey: 'tour.ask_jarvis.desc',
        page: 'trip-detail',
        position: 'left',
        icon: BrainCircuit,
        type: 'ai'
    },
    // Step 5: Budget (Brief Mention)
    {
        id: 'budget-content',
        target: '[data-tour="budget-content"]',
        titleKey: 'tour.budget_tab.title',
        descKey: 'tour.budget_tab.desc',
        page: 'trip-detail',
        tab: 'budget',
        position: 'top',
        icon: Wallet,
        type: 'budget'
    },
    // Step 6: Finish
    {
        id: 'finish',
        target: null,
        titleKey: 'tour.finish.title',
        descKey: 'tour.finish.desc',
        page: null,
        isFinish: true,
        type: 'general'
    }
];

export const TourProvider = ({ children, onNavigate }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMockMode, setIsMockMode] = useState(false);


    const currentStepData = TOUR_STEPS[currentStep];

    const startTour = useCallback(() => {
        setCurrentStep(0);
        setIsActive(true);
        setIsMockMode(true);
        localStorage.setItem('hasSeenTour', 'false');
    }, []);

    const startTourAt = useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < TOUR_STEPS.length) {
            setCurrentStep(stepIndex);
            setIsActive(true);
            setIsMockMode(true);
        }
    }, []);

    const endTour = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        setIsMockMode(false);
        localStorage.setItem('hasSeenTour', 'true');

        // Final navigation back to dashboard
        if (onNavigate) {
            onNavigate('dashboard');
        }
    }, [onNavigate]);

    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
            const nextStepData = TOUR_STEPS[currentStep + 1];

            // Handle navigation if needed
            if (onNavigate) {
                onNavigate(nextStepData);
            }

            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    }, [currentStep, onNavigate, endTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            const prevStepData = TOUR_STEPS[currentStep - 1];

            if (onNavigate) {
                onNavigate(prevStepData);
            }

            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep, onNavigate]);

    const skipTour = useCallback(() => {
        endTour();
    }, [endTour]);

    const goToStep = useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < TOUR_STEPS.length) {
            const stepData = TOUR_STEPS[stepIndex];
            if (onNavigate) {
                onNavigate(stepData);
            }
            setCurrentStep(stepIndex);
        }
    }, [onNavigate]);

    // Check if should show tour on first visit
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

        // If they haven't seen the tour and just finished onboarding, start tour
        if (hasSeenOnboarding === 'true' && hasSeenTour !== 'true') {
            // Don't auto-start, let the welcome modal handle it
        }
    }, []);

    const value = {
        isActive,
        currentStep,
        currentStepData,
        totalSteps: TOUR_STEPS.length,
        isMockMode,
        startTour,
        startTourAt,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        goToStep,
        steps: TOUR_STEPS
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};

export default TourContext;
