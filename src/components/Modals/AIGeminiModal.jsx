import React, { useState, useEffect } from 'react';
import { BrainCircuit, X, Loader2, List, BusFront, Wallet, TrainFront, Car, Route } from 'lucide-react';
// import { generateAISuggestions } from '../../services/ai'; // If we were using the real one
import { inputClasses } from '../../utils/tripHelpers';

const AIGeminiModal = ({ isOpen, onClose, onApply, isDarkMode, contextCity, existingItems }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary'); // itinerary, transport, budget

    // Mock "Unlimited API" Logic
    const generateEnhancedAI = async (city) => {
        await new Promise(r => setTimeout(r, 1500)); // Simulate API/Thinking time

        // Dynamic mock data based on city
        const isJapan = city === "Tokyo" || city === "Osaka" || city === "Kyoto";
        const currency = isJapan ? "JPY" : "HKD";
        const rate = isJapan ? 20 : 1;

        return {
            itinerary: [
                { time: "09:00", name: `${city} 必去早市`, desc: "體驗當地早餐文化，推薦海鮮丼", cost: 150 * rate, currency, type: "food" },
                { time: "11:00", name: `${city} 歷史博物館`, desc: "了解城市歷史與文化背景", cost: 80 * rate, currency, type: "spot" },
                { time: "13:00", name: "米其林推薦午餐", desc: "當地排隊名店，建議提早預約", cost: 300 * rate, currency, type: "food" },
                { time: "15:00", name: "特色商店街購物", desc: "購買伴手禮與特色工藝品", cost: 500 * rate, currency, type: "shopping" },
                { time: "18:00", name: "夜景展望台", desc: "俯瞰全城絕美夜景", cost: 100 * rate, currency, type: "spot" },
            ],
            transport: [
                { type: "metro", name: "地鐵一日券", price: `${currency} ${45 * rate}`, desc: "最划算選擇，涵蓋主要景點", recommended: true },
                { type: "taxi", name: "計程車/Uber", price: `約 ${currency} ${200 * rate}/趟`, desc: "適合多人分攤，節省時間" },
                { type: "walk", name: "步行漫遊", price: "免費", desc: "市中心景點集中，適合步行" }
            ],
            budget: {
                total: 2000 * rate,
                breakdown: [
                    { label: "餐飲", amt: 600 * rate, percent: 30 },
                    { label: "購物", amt: 1000 * rate, percent: 50 },
                    { label: "交通", amt: 200 * rate, percent: 10 },
                    { label: "門票", amt: 200 * rate, percent: 10 },
                ]
            }
        };
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setResult(null);
            generateEnhancedAI(contextCity || "Tokyo")
                .then(res => { setResult(res); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [isOpen, contextCity]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden transform scale-100 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                            <BrainCircuit className="w-6 h-6 text-indigo-500" /> AI 智能領隊
                        </h3>
                        <p className="text-xs opacity-60 mt-1">針對 {contextCity} 為您生成的深度分析</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-500/10 rounded-full"><X className="w-5 h-5 opacity-50" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                            <div className="text-center">
                                <p className="font-bold">AI 正在思考中...</p>
                                <p className="text-xs opacity-50">正在分析數百萬筆旅遊數據</p>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            {/* Tabs */}
                            <div className="flex p-1 bg-gray-500/10 rounded-xl">
                                {[{ id: 'itinerary', label: '行程建議', icon: List }, { id: 'transport', label: '交通分析', icon: BusFront }, { id: 'budget', label: '預算預估', icon: Wallet }].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-lg scale-[1.02]' : 'opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                                    >
                                        <t.icon className="w-4 h-4" /> {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Itinerary Tab */}
                            {activeTab === 'itinerary' && (
                                <div className="space-y-3 animate-fade-in">
                                    {result.itinerary.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-gray-500/10 hover:bg-gray-500/5 transition-colors group">
                                            <div className="font-mono text-sm font-bold text-indigo-400 pt-1">{item.time}</div>
                                            <div className="flex-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {item.name}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === 'food' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>{item.type === 'food' ? '美食' : '景點'}</span>
                                                </div>
                                                <p className="text-sm opacity-70 mt-1">{item.desc}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-sm">{item.currency} {item.cost}</div>
                                                <button className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mt-1">加入</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Transport Tab */}
                            {activeTab === 'transport' && (
                                <div className="grid grid-cols-1 gap-3 animate-fade-in">
                                    {result.transport.map((t, i) => (
                                        <div key={i} className={`p-4 rounded-xl border flex items-center gap-4 ${t.recommended ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-500/10'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'metro' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                {t.type === 'metro' ? <TrainFront className="w-5 h-5" /> : t.type === 'taxi' ? <Car className="w-5 h-5" /> : <Route className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {t.name}
                                                    {t.recommended && <span className="text-[10px] bg-indigo-500 text-white px-2 rounded-full">推薦</span>}
                                                </div>
                                                <p className="text-xs opacity-70">{t.desc}</p>
                                            </div>
                                            <div className="font-mono font-bold text-sm">{t.price}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Budget Tab */}
                            {activeTab === 'budget' && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="text-center p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/20">
                                        <p className="opacity-70 text-sm mb-1">預估單日總花費</p>
                                        <div className="text-4xl font-bold font-mono text-indigo-400">{result.itinerary[0].currency} {result.budget.total}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {result.budget.breakdown.map((b, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-gray-500/10 bg-gray-500/5">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="opacity-70 text-sm">{b.label}</span>
                                                    <span className="font-bold text-lg">{b.percent}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${b.percent}%` }}></div>
                                                </div>
                                                <div className="text-right mt-2 text-xs opacity-50 font-mono">${b.amt}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-500/10 bg-gray-50/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100">關閉</button>
                    <button onClick={() => { onApply(result?.itinerary); onClose(); }} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!result}>
                        將行程加入
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIGeminiModal;
