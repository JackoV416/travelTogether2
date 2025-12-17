import React from 'react';
import { Siren, Globe2 } from 'lucide-react';

const EmergencyTab = ({
    isDarkMode,
    countryInfo,
    globalSettings,
    emergencyInfoTitle,
    emergencyInfoContent,
    glassCard
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className={glassCard(isDarkMode) + " p-6 border-l-4 border-red-500"}>
                <h3 className="font-bold text-red-500 mb-4 flex gap-2">
                    <Siren className="w-5 h-5" /> 當地緊急電話
                </h3>
                <div className="text-3xl font-bold mb-2">{countryInfo.emergency}</div>
                <p className="opacity-70 text-sm">遇緊急狀況請優先撥打。</p>
            </div>
            <div className={glassCard(isDarkMode) + " p-6"}>
                <h3 className="font-bold mb-4 flex gap-2">
                    <Globe2 className="w-5 h-5" /> 駐當地辦事處 ({globalSettings.region})
                </h3>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="font-bold">{emergencyInfoTitle}</div>
                    <div className="text-2xl font-mono my-2">{emergencyInfoContent}</div>
                    <div className="text-sm opacity-70 mt-1">地址與電話請查閱外交部網站。</div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyTab;
