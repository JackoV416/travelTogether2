import React from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';

/**
 * V1.2.4: OnboardingTour Component
 * Interactive step-by-step tutorial using react-joyride
 * 
 * Usage:
 * <OnboardingTour run={showTour} onComplete={() => setShowTour(false)} isDarkMode={isDarkMode} />
 */

const TOUR_STEPS = [
    {
        target: 'body',
        content: (
            <div className="text-center p-2">
                <div className="text-4xl mb-3">👋</div>
                <h3 className="font-bold text-lg mb-2">歡迎黎到 Travel Together!</h3>
                <p className="text-sm opacity-80">我係 <span className="text-indigo-400 font-bold">Jarvis</span>，你嘅私人旅遊助理。等我帶你快速睇吓點用呢個 App！</p>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="dashboard-header"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">🕹️ 指揮中心</h3>
                <p className="text-sm opacity-80">這是你的旅遊主控台。所有行程、快捷功能同設定都以此為起點。</p>
            </div>
        ),
        placement: 'bottom',
    },
    {
        target: '[data-tour="sync-status"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">☁️ 自動雲端同步</h3>
                <p className="text-sm opacity-80">
                    放心！你嘅所有更改都會 <span className="font-bold text-emerald-500">自動儲存</span> 上雲端。<br />
                    手機、電腦隨時同步，唔驚無咗資料！
                </p>
            </div>
        ),
        placement: 'top',
    },
    {
        target: '[data-tour="app-version"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">🚀 版本更新教學</h3>
                <p className="text-sm opacity-80 mb-2">這是目前版本。如果發現功能有問題或者係舊版：</p>
                <div className="space-y-2 bg-black/5 dark:bg-white/5 p-2 rounded-lg text-xs">
                    <div>
                        <span className="font-bold block">💻 電腦版:</span>
                        按 <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">Ctrl/Cmd</kbd> + <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">Shift</kbd> + <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">R</kbd> 強制刷新
                    </div>
                    <div>
                        <span className="font-bold block">📱 手機版 (App/Web):</span>
                        直接 <span className="font-bold text-indigo-400">Kill App</span> (向上滑走關閉) 再重新進入即可！
                    </div>
                </div>
            </div>
        ),
        placement: 'top',
    },
    {
        target: '[data-tour="create-trip"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">🎒 建立新行程</h3>
                <p className="text-sm opacity-80">
                    想去多個城市？<br />
                    支援 <span className="font-bold">多國多城市</span> 設定，一次過 Plan 晒成個歐洲之旅都得！
                </p>
            </div>
        ),
        placement: 'bottom',
        spotlightClicks: true,
    },
    {
        target: '[data-tour="smart-import"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">📥 懶人 Smart Import</h3>
                <p className="text-sm opacity-80">懶得打字？直接 Upload 機票 PDF、酒店確認信或者 Cap 圖，我幫你自動填行程！</p>
            </div>
        ),
        placement: 'bottom',
    },
    {
        target: '[data-tour="trip-card"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">🎫 智能行程卡</h3>
                <p className="text-sm opacity-80 mb-2">點擊卡片進入詳情。Pro Tip：</p>
                <ul className="list-disc list-inside text-xs space-y-1 opacity-90">
                    <li>加入 <b>航班/酒店</b> 自動生成入境接駁卡</li>
                    <li>智能計算 <b>步行路線</b></li>
                    <li>自動生成 <b>行李清單</b></li>
                </ul>
            </div>
        ),
        placement: 'auto',
    },
    {
        target: '[data-tour="widgets-section"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">📊 旅遊資訊中心</h3>
                <p className="text-sm opacity-80">即時匯率、天氣預報、旅遊新聞，全部喺晒度，出發前睇一睇！</p>
            </div>
        ),
        placement: 'top',
    },
    {
        target: '[data-tour="jarvis-chat"]',
        content: (
            <div className="p-2">
                <h3 className="font-bold text-base mb-2">🤖 問 Jarvis</h3>
                <p className="text-sm opacity-80">有疑難雜症？唔識 Plan 行程？<br />隨時撳呢個掣搵我 Jarvis 傾計啦！</p>
            </div>
        ),
        placement: 'top',
        spotlightClicks: true,
    },
    {
        target: 'body',
        content: (
            <div className="text-center p-2">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-lg mb-2">準備好開始啦！</h3>
                <p className="text-sm opacity-80">記住，去 <span className="font-bold">Settings</span> 可以隨時重播呢個教學。<br />祝你旅途愉快！✨</p>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
    },
];

const OnboardingTour = ({ run = false, onComplete, isDarkMode = true }) => {
    const handleCallback = (data) => {
        const { status, action } = data;

        // Tour finished or skipped
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            // Save to localStorage that user has completed onboarding
            localStorage.setItem('travelTogether_onboardingComplete', 'true');
            onComplete?.();
        }
    };

    const styles = {
        options: {
            zIndex: 10000,
            primaryColor: '#6366f1', // Indigo
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
        tooltipContent: {
            padding: 0,
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
        back: '上一步',
        close: '關閉',
        last: '完成',
        next: '下一步',
        open: '開始',
        skip: '跳過',
    };

    return (
        <Joyride
            steps={TOUR_STEPS}
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
