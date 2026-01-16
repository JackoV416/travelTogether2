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
    MessageCircle
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
    // Step 3: Tab Navigation
    {
        id: 'tab-nav',
        target: '[data-tour="tab-nav"]',
        titleKey: 'tour.tab_nav.title',
        descKey: 'tour.tab_nav.desc',
        page: 'trip-detail',
        position: 'top',
        icon: Navigation,
        type: 'navigation'
    },
    // Step 4: Add Activity / Plan Menu
    {
        id: 'plan-trip-menu',
        target: '[data-tour="plan-trip-menu"]',
        titleKey: 'tour.add_activity.title',
        descKey: 'tour.add_activity.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'left',
        icon: PlusCircle,
        type: 'action'
    },
    // Step 4.1: Add Activity Menu (Dropdown)
    {
        id: 'add-activity-menu',
        target: '[data-tour="add-activity-menu"]',
        titleKey: 'tour.add_activity_menu.title',
        descKey: 'tour.add_activity_menu.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'left',
        icon: Plus,
        type: 'action'
    },
    // Step 4.2: Add Activity Modal - Select Type
    {
        id: 'add-activity-types',
        target: '[data-tour="add-activity-types"]',
        titleKey: 'tour.add_activity_types.title',
        descKey: 'tour.add_activity_types.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'bottom',
        icon: Layers,
        type: 'action'
    },
    // Step 4.3: Add Activity Modal - Fill Form
    {
        id: 'add-activity-form',
        target: '[data-tour="add-activity-form"]',
        titleKey: 'tour.add_activity_form.title',
        descKey: 'tour.add_activity_form.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'top',
        icon: Plus,
        type: 'action'
    },

    // Step 5: Activity Card (Itinerary Item)
    {
        id: 'activity-card',
        target: '[data-tour="activity-card"]',
        titleKey: 'tour.activity_card.title',
        descKey: 'tour.activity_card.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'right',
        icon: Layers,
        type: 'feature'
    },
    // Step 6: View Switcher
    {
        id: 'view-switcher',
        target: '[data-tour="view-switcher"]',
        titleKey: 'tour.view_switcher.title',
        descKey: 'tour.view_switcher.desc',
        page: 'trip-detail',
        tab: 'itinerary',
        position: 'top',
        icon: Settings2,
        type: 'feature'
    },


    // Step 7: Ask Jarvis (Button)
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
    // Step 7.1: Jarvis Smart Guide Interface (Bento Menu)
    // Step 7.1: Jarvis Smart Guide Interface (Bento Menu)
    {
        id: 'jarvis-smart-guide',
        target: '[data-tour="jarvis-smart-guide"]',
        titleKey: 'tour.jarvis_smart_guide.title',
        descKey: 'tour.jarvis_smart_guide.desc',
        page: 'trip-detail',
        position: 'bottom',
        icon: Sparkles,
        type: 'ai'
    },
    // Step 7.2: Jarvis Chat Dialog
    {
        id: 'jarvis-chat',
        target: '[data-tour="chat-window"]',
        titleKey: 'tour.jarvis_chat.title',
        descKey: 'tour.jarvis_chat.desc',
        page: 'trip-detail',
        position: 'left',
        icon: MessageCircle,
        type: 'ai'
    },


    // Step 7.2: Group Chat
    {
        id: 'group-chat',
        target: '[data-tour="chat-window"]',
        titleKey: 'tour.group_chat.title',
        descKey: 'tour.group_chat.desc',
        page: 'trip-detail',
        position: 'left',
        icon: MessageCircle,
        type: 'feature'
    },
    // Step 8: Budget Tracking

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
    // Step 9: Add Expense
    {
        id: 'add-expense',
        target: '[data-tour="add-expense"]',
        titleKey: 'tour.add_expense.title',
        descKey: 'tour.add_expense.desc',
        page: 'trip-detail',
        tab: 'budget',
        position: 'top',
        icon: Plus,
        type: 'action'
    },
    // Step 10: Packing List
    {
        id: 'packing-content',
        target: '[data-tour="packing-content"]',
        titleKey: 'tour.packing_tab.title',
        descKey: 'tour.packing_tab.desc',
        page: 'trip-detail',
        tab: 'packing',
        position: 'top',
        icon: Backpack,
        type: 'packing'
    },
    // Step 11: Route Map
    {
        id: 'map-content',
        target: '[data-tour="map-content"]',
        titleKey: 'tour.map_tab.title',
        descKey: 'tour.map_tab.desc',
        page: 'trip-detail',
        tab: 'footprints',
        position: 'bottom',
        icon: Map,
        type: 'map'
    },
    // Step 12: Emergency Info
    {
        id: 'emergency-content',
        target: '[data-tour="emergency-content"]',
        titleKey: 'tour.emergency_tab.title',
        descKey: 'tour.emergency_tab.desc',
        page: 'trip-detail',
        tab: 'emergency',
        position: 'bottom',
        icon: AlertTriangle,
        type: 'emergency'
    },
    // Step 13: Finish
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
