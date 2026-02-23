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
    Users,
    FileInput,
    LayoutDashboard,
    Globe,
    User,
    Grid,
    UserPlus,
    ShoppingBag,
    Image,
    Shield,
    Siren
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
    // Step 1: Explore Community (Dashboard)
    {
        id: 'explore-community',
        target: '[data-tour="explore-community"]',
        titleKey: 'tour.explore_community.title',
        descKey: 'tour.explore_community.desc',
        page: 'dashboard',
        position: 'bottom',
        icon: Globe,
        type: 'feature'
    },
    // Step 2: Switch to My Trips (Dashboard)
    {
        id: 'my-trips-view',
        target: '[data-tour="my-trips-view"]',
        titleKey: 'tour.my_trips_view.title',
        descKey: 'tour.my_trips_view.desc',
        page: 'dashboard',
        position: 'bottom',
        icon: LayoutDashboard,
        type: 'feature'
    },
    // Step 3: Smart Import (Dashboard)
    {
        id: 'smart-import',
        target: '[data-tour="smart-import"]',
        titleKey: 'tour.smart_import.title',
        descKey: 'tour.smart_import.desc',
        page: 'dashboard',
        position: 'bottom',
        icon: FileInput,
        type: 'feature'
    },
    // Step 4: Create Your First Trip
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
    // Step 4.1: Create Trip Modal - Country
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
    // Step 4.2: Create Trip Modal - Dates
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
    // Step 4.3: Create Trip Modal - AI
    {
        id: 'create-trip-ai',
        target: '[data-tour="create-trip-ai"]',
        titleKey: 'tour.create_trip_ai.title',
        descKey: 'tour.create_trip_ai.desc',
        page: 'dashboard',
        position: 'bottom',
        icon: Sparkles,
        type: 'action'
    },
    // Step 5: Trip Card
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
    // Step 5.1: Trip Header (Trip Detail)
    {
        id: 'trip-header',
        target: '[data-tour="trip-header"]',
        titleKey: 'tour.trip_header.title',
        descKey: 'tour.trip_header.desc',
        page: 'trip-detail',
        position: 'bottom',
        icon: Layout,
        type: 'general'
    },
    // Step 5.2: Add Item (Trip Detail)
    {
        id: 'add-item',
        target: '[data-tour="add-item"]',
        titleKey: 'tour.add_item.title',
        descKey: 'tour.add_item.desc',
        page: 'trip-detail',
        position: 'left',
        icon: PlusCircle,
        type: 'action'
    },
    // Step 5.3: Itinerary Tab Content (Trip Detail)
    {
        id: 'itinerary-tab',
        target: '[data-tour="itinerary-content"]',
        titleKey: 'tour.itinerary_tab.title',
        descKey: 'tour.itinerary_tab.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'top',
        icon: Calendar,
        type: 'feature'
    },
    // Step 5.4: Budget Tab (Trip Detail)
    {
        id: 'budget-tab',
        target: '[data-tour="budget-content"]',
        titleKey: 'tour.budget_tab.title',
        descKey: 'tour.budget_tab.desc',
        page: 'trip-detail',
        tab: 'budget',
        position: 'top',
        icon: Wallet,
        type: 'feature'
    },
    // Step 5.5: Packing Tab (Trip Detail)
    {
        id: 'packing-tab',
        target: '[data-tour="packing-content"]',
        titleKey: 'tour.packing_tab.title',
        descKey: 'tour.packing_tab.desc',
        page: 'trip-detail',
        tab: 'packing',
        position: 'top',
        icon: ShoppingBag,
        type: 'feature'
    },
    // Step 5.6: Gallery Tab (Trip Detail)
    {
        id: 'gallery-tab',
        target: '[data-tour="gallery-content"]',
        titleKey: 'tour.gallery_tab.title',
        descKey: 'tour.gallery_tab.desc',
        page: 'trip-detail',
        tab: 'gallery',
        position: 'top',
        icon: Image,
        type: 'feature'
    },
    // Step 5.7: Emergency Tab (Trip Detail)
    {
        id: 'emergency-tab',
        target: '[data-tour="emergency-content"]',
        titleKey: 'tour.emergency_tab.title',
        descKey: 'tour.emergency_tab.desc',
        page: 'trip-detail',
        tab: 'emergency',
        position: 'top',
        icon: Siren,
        type: 'feature'
    },
    // Step 6: Profile - Header
    {
        id: 'profile-header',
        target: '[data-tour="profile-header"]',
        titleKey: 'tour.profile_header.title',
        descKey: 'tour.profile_header.desc',
        page: 'profile',
        position: 'bottom',
        icon: User,
        type: 'general'
    },
    // Step 7: Profile - Tabs
    {
        id: 'profile-tabs',
        target: '[data-tour="profile-tabs"]',
        titleKey: 'tour.profile_tabs.title',
        descKey: 'tour.profile_tabs.desc',
        page: 'profile',
        position: 'top',
        icon: Grid,
        type: 'navigation'
    },
    // Step 8: Add Friend (Mock Profile)
    {
        id: 'add-friend',
        target: '[data-tour="add-friend-btn"]',
        titleKey: 'tour.add_friend.title',
        descKey: 'tour.add_friend.desc',
        page: 'mock-profile',
        position: 'left',
        icon: UserPlus,
        type: 'action'
    },
    // Step 9: Profile - Private Chat
    {
        id: 'private-chat',
        target: '[data-tour="private-chat-btn"]',
        titleKey: 'tour.private_chat.title',
        descKey: 'tour.private_chat.desc',
        page: 'mock-profile',
        position: 'left',
        icon: MessageCircle,
        type: 'feature'
    },
    // Step 10: Jarvis AI Chat (Dashboard)
    {
        id: 'jarvis-chat',
        target: '[data-tour="jarvis-chat"]',
        titleKey: 'tour.jarvis_chat.title',
        descKey: 'tour.jarvis_chat.desc',
        page: 'dashboard',
        position: 'left',
        icon: BrainCircuit,
        type: 'feature'
    },
    // Step 11: Friends & Chat (Dashboard - Chat Modal)
    {
        id: 'friends-chat',
        target: '[data-tour="chat-window"]',
        titleKey: 'tour.friends_chat.title',
        descKey: 'tour.friends_chat.desc',
        page: 'dashboard',
        position: 'top',
        icon: Users,
        type: 'feature'
    },
    // Step 12: Finish
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

            // Delay step change to allow navigation and DOM update
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 500); // Wait for page transition
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
