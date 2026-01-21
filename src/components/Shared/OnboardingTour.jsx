import React, { useMemo } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { TOUR_STEPS } from '../../contexts/TourContext';

/**
 * V1.6.1: OnboardingTour Component (Unified with TourContext)
 * Dynamically generates Joyride steps from the single source of truth: TOUR_STEPS
 */

const OnboardingTour = ({ run = false, onComplete, isDarkMode = true }) => {
    const { t } = useTranslation();

    // Convert TOUR_STEPS to Joyride-compatible format
    const steps = useMemo(() => {
        return TOUR_STEPS.map((step) => {
            // Determine placement based on step.position or use sensible defaults
            let placement = step.position || 'auto';
            if (step.isWelcome || step.isFinish) {
                placement = 'center';
            }

            // Determine target: null means 'body' (centered modal)
            const target = step.target || 'body';

            // Emoji mapping for step types
            const emojiMap = {
                general: step.isWelcome ? '👋' : '🎉',
                action: '🎒',
                navigation: '🎫',
                feature: '👥',
                ai: '🤖',
                budget: '💰',
            };
            const emoji = emojiMap[step.type] || '✨';

            return {
                target,
                content: (
                    <div className={step.isWelcome || step.isFinish ? 'text-center p-2' : 'p-2'}>
                        {(step.isWelcome || step.isFinish) && <div className="text-4xl mb-3">{emoji}</div>}
                        <h3 className={`font-bold ${step.isWelcome || step.isFinish ? 'text-lg' : 'text-base'} mb-2`}>
                            {!step.isWelcome && !step.isFinish && `${emoji} `}
                            {t(step.titleKey)}
                        </h3>
                        <p className="text-sm opacity-80">{t(step.descKey)}</p>
                    </div>
                ),
                placement,
                disableBeacon: step.isWelcome || step.isFinish,
                spotlightClicks: step.type === 'action',
            };
        });
    }, [t]);

    const handleCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            localStorage.setItem('travelTogether_onboardingComplete', 'true');
            localStorage.setItem('hasSeenTour', 'true');
            onComplete?.();
        }
    };

    const styles = {
        options: {
            zIndex: 10000,
            primaryColor: '#6366f1',
            backgroundColor: isDarkMode ? '#1e1e2e' : '#ffffff',
            textColor: isDarkMode ? '#e2e8f0' : '#1e293b',
            arrowColor: isDarkMode ? '#1e1e2e' : '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
        },
        tooltip: {
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        },
        buttonNext: {
            backgroundColor: '#6366f1',
            color: '#ffffff',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 'bold',
            fontSize: 14,
        },
        buttonBack: {
            color: isDarkMode ? '#94a3b8' : '#64748b',
            marginRight: 10,
        },
        buttonSkip: {
            color: isDarkMode ? '#64748b' : '#94a3b8',
        },
        spotlight: {
            borderRadius: 16,
        },
    };

    const locale = {
        back: t('common.back'),
        close: t('common.close'),
        last: t('common.close'),
        next: t('onboarding.next'),
        open: t('onboarding.start_now'),
        skip: t('common.skip'),
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            scrollToFirstStep
            spotlightClicks
            disableOverlayClose
            callback={handleCallback}
            styles={styles}
            locale={locale}
            floaterProps={{
                disableAnimation: false,
            }}
            scrollOffset={100}
        />
    );
};

export default OnboardingTour;
