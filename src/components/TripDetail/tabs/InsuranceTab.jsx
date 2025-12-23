import React from 'react';
import { Lock, Shield, ArrowUpRight } from 'lucide-react';

const InsuranceTab = ({
    isDarkMode,
    countryInfo,
    globalSettings,
    myInsurance,
    setMyInsurance,
    onSaveInsurance,
    insuranceSuggestions,
    insuranceResources,
    inputClasses,
    buttonPrimary,
    glassCard,
    isSimulation
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className={glassCard(isDarkMode) + " p-6"}>
                <h3 className="font-bold mb-4 flex gap-2">
                    <Lock className="w-5 h-5" /> 私人保險 (僅自己可見)
                </h3>
                <div className="space-y-4">
                    <input
                        value={myInsurance.provider || ''}
                        onChange={e => !isSimulation && setMyInsurance({ ...myInsurance, provider: e.target.value })}
                        placeholder="保險公司"
                        className={inputClasses(isDarkMode)}
                        readOnly={isSimulation}
                    />
                    <input
                        value={myInsurance.policyNo || ''}
                        onChange={e => !isSimulation && setMyInsurance({ ...myInsurance, policyNo: e.target.value })}
                        placeholder="保單號碼"
                        className={inputClasses(isDarkMode)}
                        readOnly={isSimulation}
                    />
                    <input
                        value={myInsurance.phone || ''}
                        onChange={e => !isSimulation && setMyInsurance({ ...myInsurance, phone: e.target.value })}
                        placeholder="緊急聯絡電話"
                        className={inputClasses(isDarkMode)}
                        readOnly={isSimulation}
                    />
                    <button
                        onClick={onSaveInsurance}
                        disabled={isSimulation}
                        className={`w-full py-3.5 flex items-center justify-center gap-2 mt-4 transition-all shadow-lg active:scale-[0.98] text-sm font-bold border border-white/10 rounded-xl ${isSimulation
                            ? 'bg-white/5 text-white/30 cursor-not-allowed shadow-none border-dashed'
                            : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-indigo-500/20'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        {isSimulation ? "教學展示 (唯讀模式)" : "儲存資料"}
                    </button>
                </div>
            </div>
            <div className={glassCard(isDarkMode) + " p-6"}>
                <h3 className="font-bold mb-4 flex gap-2">
                    <Shield className="w-5 h-5" /> 建議與狀態
                </h3>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm mb-4">
                    {countryInfo.insuranceInfo}
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                    {insuranceSuggestions[globalSettings.region]?.map(s => (
                        <span key={s} className="px-3 py-1 bg-white/10 border rounded-full text-sm">{s}</span>
                    ))}
                </div>
                <div className="space-y-2">
                    {insuranceResources
                        .filter(item => item.region === globalSettings.region || item.region === 'Global')
                        .map(item => (
                            <a
                                key={item.title}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-sm px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
                            >
                                <span>{item.title}</span>
                                <ArrowUpRight className="w-4 h-4 opacity-60" />
                            </a>
                        ))}
                </div>
                <div className="text-[11px] opacity-60 mt-3">
                    Jarvis 建議：依所在地先完成 Visit Japan Web 等官方登錄，再補上涵蓋醫療與航班延誤的保單。
                </div>
            </div>
        </div>
    );
};

export default InsuranceTab;
