import React from 'react';
import { Plus, Upload } from 'lucide-react';
import { glassCard } from '../../utils/tripUtils';
import { DEFAULT_BG_IMAGE } from '../../constants/appData';

/**
 * DashboardHeader - The top banner/header of the Dashboard
 * @param {boolean} isDarkMode - Dark mode state
 * @param {string} selectedCountryImg - Background image URL
 * @param {Function} setIsCreateModalOpen - Open create modal
 * @param {Function} setForm - Reset form
 * @param {Function} setSelectedCountryImg - Reset background
 * @param {Function} setIsSmartImportModalOpen - Open import modal
 * @param {Function} setIsSmartExportOpen - Open export modal
 */
const DashboardHeader = ({
    isDarkMode,
    selectedCountryImg,
    setIsCreateModalOpen,
    setForm,
    setSelectedCountryImg,
    setIsSmartImportModalOpen,
    setIsSmartExportOpen
}) => {
    return (
        <div className={glassCard(isDarkMode) + " p-6 md:p-8 relative overflow-hidden transition-all duration-1000"}>
            <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000" style={{ backgroundImage: `url(${selectedCountryImg})` }}></div>
            <div className="relative z-10 flex flex-col gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Plus className="w-6 h-6 text-indigo-500" /> 建立新行程
                </h2>
                <p className="opacity-80 text-sm max-w-xl">
                    使用彈窗快速建立，支援多國多城與自訂城市。背景會依選擇自動切換。
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 btn-hover-glow"
                    >
                        <Plus className="w-4 h-4" /> 打開建立視窗
                    </button>
                    <button
                        onClick={() => { setForm({ name: '', countries: [], cities: [], startDate: '', endDate: '' }); setSelectedCountryImg(DEFAULT_BG_IMAGE); }}
                        className="px-4 py-3 rounded-xl border border-white/30 text-sm hover:bg-white/10 transition-all"
                    >
                        重設預覽
                    </button>
                    <button
                        onClick={() => setIsSmartImportModalOpen(true)}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm flex items-center gap-2 btn-hover-glow"
                    >
                        <Upload className="w-4 h-4" /> 智能匯入
                    </button>
                    <button
                        onClick={() => setIsSmartExportOpen(true)}
                        className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-100 font-bold text-sm hover:bg-purple-500/30 transition-all"
                    >
                        匯出行程
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
