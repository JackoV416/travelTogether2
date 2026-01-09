// src/components/TripDetail/index.jsx
// TripDetail 主組件 - 負責數據加載，完全符合 React Hooks Rules

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Loader2 } from 'lucide-react';
import TripDetailContent from './TripDetailContent';

/**
 * TripDetail Wrapper Component
 * 
 * 負責：
 * 1. 從 Firebase 加載 trip 數據
 * 2. 管理 loading 狀態
 * 3. 確保 hooks 順序一致
 * 
 * 重要：所有 hooks 必須喺 component 最頂層，無 conditional hooks！
 */
const TripDetail = ({
    tripData,
    onBack,
    user,
    isDarkMode,
    setGlobalBg,
    isSimulation,
    globalSettings,
    exchangeRates,
    onOpenChat,
    isChatOpen
}) => {
    // ============================================
    // HOOKS 區域 - 所有 hooks 必須喺呢度！
    // ============================================

    // State hooks - 永遠以相同順序 call
    const [realTrip, setRealTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(!isSimulation);
    const [error, setError] = useState(null);

    // Effect hooks - 永遠以相同順序 call
    useEffect(() => {
        // Simulation mode 唔需要 fetch
        if (isSimulation) {
            setIsLoading(false);
            return;
        }

        // 需要 tripData.id 才能 fetch
        if (!tripData?.id) {
            setError('Invalid trip data');
            setIsLoading(false);
            return;
        }

        // 開始 loading
        setIsLoading(true);
        setError(null);

        // Firebase real-time listener
        const unsubscribe = onSnapshot(
            doc(db, "trips", tripData.id),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    setRealTrip({ id: docSnapshot.id, ...docSnapshot.data() });
                } else {
                    setError('Trip not found');
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Error fetching trip:', err);
                setError(err.message);
                setIsLoading(false);
            }
        );

        // Cleanup
        return () => unsubscribe();
    }, [tripData?.id, isSimulation]);

    // ============================================
    // RENDER 區域 - 所有 hooks 已經 call 完畢
    // ============================================

    // 確定最終嘅 trip 數據
    const trip = isSimulation ? tripData : realTrip;

    // Loading 狀態
    if (isLoading) {
        return (
            <div className="p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
                <div className="mt-4 text-sm opacity-70">載入行程中...</div>
            </div>
        );
    }

    // Error 狀態
    if (error) {
        return (
            <div className="p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4 text-lg">⚠️ {error}</div>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                >
                    返回
                </button>
            </div>
        );
    }

    // 無數據狀態
    if (!trip) {
        return (
            <div className="p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-yellow-500 mb-4 text-lg">⚠️ 無法載入行程數據</div>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                >
                    返回
                </button>
            </div>
        );
    }

    // 正常顯示
    return (
        <TripDetailContent
            trip={trip}
            tripData={tripData}
            onBack={onBack}
            user={user}
            isDarkMode={isDarkMode}
            setGlobalBg={setGlobalBg}
            isSimulation={isSimulation}
            globalSettings={globalSettings}
            exchangeRates={exchangeRates}
            onOpenChat={onOpenChat}
            isChatOpen={isChatOpen}
        />
    );
};

export default TripDetail;
