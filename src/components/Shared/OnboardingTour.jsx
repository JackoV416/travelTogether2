import React, { useMemo } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';

/**
 * V1.2.5: OnboardingTour Component (Localized)
 * Interactive step-by-step tutorial using react-joyride
 */

const OnboardingTour = ({ run = false, onComplete, isDarkMode = true }) => {
    const { t } = useTranslation();

    const steps = useMemo(() => [
        {
            target: 'body',
            content: (
                <div className="text-center p-2">
                    <div className="text-4xl mb-3">👋</div>
                    <h3 className="font-bold text-lg mb-2">{t('tour.welcome.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.welcome.desc')}</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="dashboard-header"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">🕹️ {t('tour.dashboard.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.dashboard.desc')}</p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '[data-tour="sync-status"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">☁️ {t('tour.sync.title')}</h3>
                    <p className="text-sm opacity-80">
                        {t('tour.sync.desc').split('<0>')[0]}
                        <span className="font-bold text-emerald-500">{t('tour.sync.desc').split('<0>')[1]?.split('</0>')[0] || "auto-saved"}</span>
                        {t('tour.sync.desc').split('</0>')[1]}
                    </p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '[data-tour="app-version"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">🚀 {t('tour.version.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.version.desc')}</p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '[data-tour="create-trip"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">🎒 {t('tour.create.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.create.desc')}</p>
                </div>
            ),
            placement: 'bottom',
            spotlightClicks: true,
        },
        {
            target: '[data-tour="smart-import"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">📥 {t('tour.smart_import.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.smart_import.desc')}</p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '[data-tour="trip-card"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">🎫 {t('tour.trip_card.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.trip_card.desc')}</p>
                </div>
            ),
            placement: 'auto',
        },
        {
            target: '[data-tour="widgets-section"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">📊 {t('tour.widgets.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.widgets.desc')}</p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '[data-tour="jarvis-chat"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">🤖 {t('tour.jarvis.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.jarvis.desc')}</p>
                </div>
            ),
            placement: 'top',
            spotlightClicks: true,
        },
        {
            target: '[data-tour="profile-menu"]',
            content: (
                <div className="p-2">
                    <h3 className="font-bold text-base mb-2">👤 {t('tour.profile.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.profile.desc')}</p>
                </div>
            ),
            placement: 'bottom-end',
        },
        {
            target: 'body',
            content: (
                <div className="text-center p-2">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-bold text-lg mb-2">{t('tour.ready.title')}</h3>
                    <p className="text-sm opacity-80">{t('tour.ready.desc')}</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
    ], [t]);

    const handleCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            localStorage.setItem('travelTogether_onboardingComplete', 'true');
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
