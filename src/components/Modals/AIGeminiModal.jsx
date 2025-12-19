import React, { useState, useEffect } from 'react';
import { BrainCircuit, X, Loader2, List, BusFront, Wallet, TrainFront, Car, Route, ShoppingBag, Sparkles, CheckSquare, Square, Plus, PackageCheck, Check, ArrowRightLeft } from 'lucide-react';
import {
    generateShoppingSuggestions,
    generateFullItinerary,
    HOTEL_DB
} from '../../services/ai';
import {
    generateItineraryWithGemini,
    suggestTransportBetweenSpots,
    getLocationDetails,
    askTravelAI,
    generateShoppingWithGemini,
    generatePackingList
} from '../../services/ai-parsing';
import { CURRENCIES } from '../../constants/appData';
import {
    getTimeDiff, getLocalCityTime, getWeatherForecast,
    buildDailyReminder, getUserInitial, inputClasses,
    formatDuration
} from '../../utils/tripUtils'; // Fixed import path

const SHOPPING_CATEGORIES = [
    { id: 'food', label: '🍱 美食伴手禮', types: ['food', 'snack', 'alcohol'] },
    { id: 'cosmetic', label: '💄 藥妝護膚', types: ['cosmetic', 'skincare'] },
    { id: 'fashion', label: '👗 服飾時尚', types: ['clothing', 'fashion', 'accessory'] },
    { id: 'electronics', label: '⚡ 電器3C', types: ['electronics', 'gadget'] },
    { id: 'souvenir', label: '🎁 特色紀念品', types: ['gift', 'souvenir', 'craft'] },
    { id: 'lifestyle', label: '🏠 生活雜貨', types: ['lifestyle', 'home', 'shopping'] }
];

const ITINERARY_PREFS = [
    { id: 'rest', label: '多啲休息時間', icon: '💤', desc: '唔好咁趕，多啲自由時間' },
    { id: 'souvenir', label: '買手信行程', icon: '🎁', desc: '推薦必買伴手禮店' },
];

const INTENSITY_PREFS = [
    { id: 'culture', label: '🏛️ 歷史文化', desc: '古蹟、博物館、寺廟' },
    { id: 'nature', label: '🌲 自然景觀', desc: '公園、山岳、湖泊' },
    { id: 'foodie', label: '🍜 美食巡禮', desc: '排隊名店、道地小食' },
    { id: 'shopping', label: '🛍️ 購物商圈', desc: '百貨公司、藥妝、市集' }
];

const AIGeminiModal = ({
    isOpen,
    onClose,
    onApply,
    onAddItem,
    isDarkMode,
    contextCity = "Tokyo",
    trip = null,
    weatherData = null,
    mode = 'full'
}) => {
    // V0.22: Coming Soon removed - Full functionality restored
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState(mode === 'shopping' ? 'shopping' : (mode === 'packing' ? 'packing' : 'itinerary'));
    const [shoppingStep, setShoppingStep] = useState('selection'); // selection -> result
    const [itineraryStep, setItineraryStep] = useState('preferences'); // Changed from selection to preferences (survey)
    const [packingStep, setPackingStep] = useState('selection'); // result only
    const [inputText, setInputText] = useState('');
    const [progress, setProgress] = useState(0);
    const [selectedCats, setSelectedCats] = useState(['food', 'cosmetic']);
    const [selectedPrefs, setSelectedPrefs] = useState(['culture', 'foodie']);
    const [intensities, setIntensities] = useState({
        culture: 2,
        nature: 2,
        foodie: 2,
        shopping: 2
    });
    const [logistics, setLogistics] = useState({
        flightInfo: '',
        hotelStatus: 'none',
        budget: 'mid',
        selectedHotel: null,
        transportMode: 'public',
        visitedPlaces: ''
    });

    const [selectedTransports, setSelectedTransports] = useState({}); // { itemId: optionIndex }
    const [selections, setSelections] = useState({ itinerary: [], shopping: [], transport: [], packing: [] });
    const [analyzingFile, setAnalyzingFile] = useState(false);
    const [fileResults, setFileResults] = useState(null);

    useEffect(() => {
        if (isOpen && mode === 'shopping') setActiveTab('shopping');
        else if (isOpen && mode === 'full') setActiveTab('itinerary');
    }, [isOpen, mode]);

    // Simulated Progress Effect
    useEffect(() => {
        let timer;
        if (loading) {
            setProgress(0);
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev < 30) return prev + 2;
                    if (prev < 60) return prev + 1;
                    if (prev < 85) return prev + 0.5;
                    if (prev < 95) return prev + 0.1;
                    return prev;
                });
            }, 100);
        } else {
            setProgress(100);
            setTimeout(() => setProgress(0), 500);
        }
        return () => clearInterval(timer);
    }, [loading]);

    // Toggle between real Gemini API and mock data
    const [useRealAI, setUseRealAI] = useState(true);

    // Enhanced AI Logic - Uses Real Gemini API when available
    const generateEnhancedAI = async (city, text = null) => {
        // Calculate trip days dynamically
        const start = trip?.startDate ? new Date(trip.startDate) : new Date();
        const end = trip?.endDate ? new Date(trip.endDate) : new Date();
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalDays = Math.max(1, Math.min(diffDays, 14));

        const currency = trip?.currency || 'JPY';
        const rate = CURRENCIES[currency]?.rate || 1;

        // Try real Gemini API first
        if (useRealAI) {
            try {
                console.log("[AI] 🚀 Using REAL Gemini API for all features...");

                const [geminiResult, shoppingData, packingData] = await Promise.all([
                    generateItineraryWithGemini({
                        city,
                        days: totalDays,
                        preferences: selectedPrefs,
                        visitedPlaces: logistics.visitedPlaces.split(/[,，\n]/).filter(p => p.trim()),
                        existingItinerary: trip?.itinerary || {},
                        budget: logistics.budget,
                        travelStyle: 'balanced'
                    }),
                    generateShoppingWithGemini(city, []).catch(() => generateShoppingSuggestions(city)),
                    generatePackingList(trip || { city, itinerary: {} }, weatherData?.[city] || { temp: "24°C", desc: "Sunny" })
                ]);

                // Transform Gemini result to expected format
                const flatItinerary = [];
                if (geminiResult.itinerary) {
                    geminiResult.itinerary.forEach((day, dayIdx) => {
                        (day.items || []).forEach((item, itemIdx) => {
                            flatItinerary.push({
                                ...item,
                                id: item.id || `ai-it-${dayIdx + 1}-${itemIdx}`,
                                day: day.day || dayIdx + 1
                            });
                        });
                    });
                }

                return {
                    itinerary: flatItinerary.length > 0 ? flatItinerary : await generateFullItinerary(city, totalDays, selectedPrefs),
                    transport: geminiResult.transport || [
                        { id: 'ai-tr-1', type: "metro", name: "地鐵一日券", price: `${currency} ${Math.floor(600 * rate)}`, desc: "最划算", recommended: true }
                    ],
                    budget: geminiResult.budget || { total: 15000 * rate, breakdown: [] },
                    shopping: (shoppingData || []).map((item, idx) => ({ ...item, id: `ai-shp-${idx}` })),
                    packing: (packingData || []).map((item, idx) => ({ ...item, id: `ai-pkg-${idx}` })),
                    tips: geminiResult.tips || [],
                    source: 'gemini-api'
                };
            } catch (error) {
                console.warn("[AI] Gemini API failed, falling back to mock data:", error.message);
            }
        }

        // Fallback to mock data
        console.log("[AI] Using mock data...");
        const [_, shoppingData, packingData] = await Promise.all([
            new Promise(r => setTimeout(r, 1500)),
            generateShoppingSuggestions(city),
            generatePackingList(trip || { city, itinerary: {} }, weatherData?.[city] || { temp: "24°C", desc: "Sunny" })
        ]);

        const itinerary = await generateFullItinerary(city, totalDays, selectedPrefs);

        return {
            itinerary,
            transport: [
                { id: 'ai-tr-1', type: "metro", name: "地鐵/捷運一日券", price: `${currency} ${45 * rate}`, desc: "最划算選擇，涵蓋主要景點", recommended: true },
                { id: 'ai-tr-2', type: "bus", name: "市區觀光巴士", price: `${currency} ${30 * rate}`, desc: "漫遊市區，適合短途接駁" },
                { id: 'ai-tr-3', type: "taxi", name: "的士/Uber", price: `約 ${currency} ${200 * rate}/趟`, desc: "適合多人分攤，節省時間" },
                { id: 'ai-tr-4', type: "rental", name: "自駕租車", price: `約 ${currency} ${800 * rate}/日`, desc: "自由度最高，適合郊區行程" }
            ],
            budget: {
                total: 1500 * rate * totalDays,
                breakdown: [
                    { label: "餐飲", amt: 500 * rate * totalDays, percent: 33 },
                    { label: "交通", amt: 200 * rate * totalDays, percent: 13 },
                    { label: "門票", amt: 300 * rate * totalDays, percent: 20 },
                    { label: "購物預留", amt: 500 * rate * totalDays, percent: 34 },
                ]
            },
            shopping: (shoppingData || []).map((item, idx) => ({ ...item, id: `ai-shp-${idx}` })),
            packing: (packingData || []).map((item, idx) => ({ ...item, id: `ai-pkg-${idx}` })),
            source: 'mock-data'
        };
    };

    const initSelections = (data) => {
        // Default select all itinerary items and recommended transport
        const itIds = data.itinerary.map(i => i.id);
        const trIds = data.transport.filter(t => t.recommended).map(t => t.id);
        const shpIds = data.shopping ? data.shopping.map(i => i.id) : [];
        const pkgIds = data.packing ? data.packing.map(i => i.id) : [];
        setSelections({ itinerary: itIds, transport: trIds, shopping: shpIds, packing: pkgIds });
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(false);
            setResult(null);
            setInputText('');
            setSelections({ itinerary: [], transport: [], shopping: [], packing: [] });

            if (mode === 'shopping') {
                setShoppingStep('selection');
                setActiveTab('shopping');
            } else if (mode === 'packing') {
                // Auto-trigger packing analysis for better UX
                handlePackingAnalyze();
            } else {
                setItineraryStep('selection');
                setActiveTab('itinerary');
            }
        }
    }, [isOpen, mode]);

    const handleItineraryAnalyze = async (isQuick = false) => {
        setLoading(true);
        try {
            const res = await generateEnhancedAI(contextCity || "Tokyo", inputText);
            setResult(res);
            if (res.itinerary && Array.isArray(res.itinerary)) {
                setSelections(prev => ({
                    ...prev,
                    itinerary: res.itinerary.map(i => i.id)
                }));
            }
            setItineraryStep('result');
            setActiveTab('itinerary');
        } catch (err) {
            console.error("AI Generation Exception:", err);
            // Internal Alert/Error UI could be added here
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingFile(true);
        try {
            const { parseImageDirectly } = await import('../../services/ai-parsing');
            const results = await parseImageDirectly(file, { city: contextCity });
            setFileResults(results);

            // Auto-fill logic from candidates
            const flight = results.find(r => r.type === 'flight');
            if (flight) {
                setLogistics(prev => ({
                    ...prev,
                    flightInfo: `${flight.name} [${flight.time || ''}] ${flight.details?.location || ''}`.trim()
                }));
            }

            const hotel = results.find(r => r.type === 'hotel');
            if (hotel) {
                setLogistics(prev => ({ ...prev, hotelStatus: 'booked' }));
            }

        } catch (err) {
            console.error("SmartImport Error:", err);
        } finally {
            setAnalyzingFile(false);
        }
    };

    const togglePref = (id) => {
        setSelectedPrefs(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleShoppingAnalyze = async () => {
        setLoading(true);
        try {
            const res = await generateEnhancedAI(contextCity || "Tokyo", "shopping_focus");
            if (res.shopping) {
                setResult(prev => ({ ...(prev || {}), ...res }));
                setSelections(prev => ({ ...prev, shopping: res.shopping.map(i => i.id) }));
                setActiveTab('shopping');
                setShoppingStep('result');
            }
        } catch (err) {
            console.error("Shopping AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePackingAnalyze = async () => {
        setLoading(true);
        try {
            const res = await generateEnhancedAI(contextCity || "Tokyo", "packing_focus");
            if (res.packing) {
                setResult(prev => ({ ...(prev || {}), ...res }));
                setSelections(prev => ({ ...prev, packing: res.packing.map(i => i.id) }));
                setActiveTab('packing');
                setPackingStep('result');
            }
        } catch (err) {
            console.error("Packing AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCat = (id) => {
        if (selectedCats.includes(id)) setSelectedCats(prev => prev.filter(c => c !== id));
        else setSelectedCats(prev => [...prev, id]);
    };

    const toggleSelection = (section, id) => {
        setSelections(prev => {
            const list = prev[section] || [];
            if (list.includes(id)) return { ...prev, [section]: list.filter(i => i !== id) };
            return { ...prev, [section]: [...list, id] };
        });
    };

    const toggleSelectAll = (section, allIds) => {
        setSelections(prev => {
            const current = prev[section] || [];
            if (current.length === allIds.length) return { ...prev, [section]: [] }; // Deselect All
            return { ...prev, [section]: allIds }; // Select All
        });
    };

    const handleApply = () => {
        // Collect selected items
        if (mode === 'shopping') {
            onApply(result.shopping.filter(i => selections.shopping.includes(i.id)));
        } else if (mode === 'packing') {
            onApply(result.packing.filter(i => selections.packing.includes(i.id)));
        } else {
            // Full mode: Return an object with all selections
            const allSelected = {
                itinerary: (result.itinerary || []).filter(i => selections.itinerary.includes(i.id)).map(item => {
                    // Apply selected transport if any
                    if (item.type === 'transport' && item.details?.options && selectedTransports[item.id] !== undefined) {
                        const opt = item.details.options[selectedTransports[item.id]];
                        return {
                            ...item,
                            name: opt.name,
                            cost: opt.cost,
                            currency: opt.currency,
                            details: { ...item.details, desc: opt.desc }
                        };
                    }
                    return item;
                }),
                transport: (result.transport || []).filter(i => (selections.transport || []).includes(i.id)),
                shopping: (result.shopping || []).filter(i => (selections.shopping || []).includes(i.id)),
                packing: (result.packing || []).filter(i => (selections.packing || []).includes(i.id))
            };
            onApply(allSelected);
        }
        onClose();
    };

    // Helper to calculate Stats
    const getSelectionCount = (section) => (selections[section] || []).length;

    if (!isOpen) return null;


    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-2xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} ${isDarkMode ? 'bg-[#0f111a] text-white border border-gray-800' : 'bg-white text-gray-900'}`}>

                {/* Header */}
                <div className="p-5 border-b border-gray-500/10 flex items-center justify-between bg-gradient-to-r from-indigo-600/10 to-purple-600/10 backdrop-blur-md z-10">
                    <div>
                        <h3 className="font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                            {mode === 'shopping' ? <ShoppingBag className="w-6 h-6 text-purple-500" /> : mode === 'packing' ? <PackageCheck className="w-6 h-6 text-indigo-500" /> : <BrainCircuit className="w-6 h-6 text-indigo-500" />}
                            {mode === 'shopping' ? 'AI 購物助手' : mode === 'packing' ? 'AI 行李顧問' : 'AI 智能領隊'}
                        </h3>
                        <p className="text-xs opacity-60 mt-1">針對 {contextCity} 為您生成的深度分析</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-500/10 rounded-full"><X className="w-5 h-5 opacity-50" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                    {loading ? (
                        <AIProgressOverlay
                            text="AI 正在思考中..."
                            subtext="正在分析數百萬筆旅遊數據並查找最新資訊"
                            progress={progress}
                        />
                    ) : ((mode === 'itinerary' || mode === 'full' || mode === 'packing') && (itineraryStep === 'selection' && activeTab === 'itinerary')) ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-bold">{mode === 'packing' ? '準備好出發了嗎？' : '您需要什麼幫助？'}</h4>
                                <p className="text-sm opacity-60">{mode === 'packing' ? '我可以自動為您準備清單，或分析您的具體需求' : '選擇以下任一方式，讓 AI 為您打造完美行程'}</p>
                            </div>

                            {/* Visual Option Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setItineraryStep('preferences')}
                                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${isDarkMode ? 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20' : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'}`}
                                >
                                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-white shadow-sm'}`}>
                                        <Sparkles className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">客製化行程</div>
                                        <div className="text-[10px] opacity-60 mt-1">深度自選，AI 精準規劃</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab('shopping');
                                        setShoppingStep('selection');
                                    }}
                                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${isDarkMode ? 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20' : 'border-purple-200 bg-purple-50 hover:bg-purple-100'}`}
                                >
                                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-white shadow-sm'}`}>
                                        <ShoppingBag className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">購物清單</div>
                                        <div className="text-[10px] opacity-60 mt-1">必買伴手禮推薦</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        // Trigger packing generation
                                        setLoading(true);
                                        setProgress(10);
                                        const cityKey = contextCity || trip?.city || "Tokyo";
                                        // Pass the city-specific weather or a fallback
                                        const cityWeather = weatherData?.[cityKey] || weatherData?.Tokyo || { temp: "24°C", desc: "Sunny" };
                                        generatePackingList(trip || { city: cityKey, itinerary: {} }, cityWeather)
                                            .then(res => {
                                                if (!res || res.length === 0) {
                                                    console.warn("[AI] Packing list returned empty");
                                                }
                                                const structured = (res || []).map((item, idx) => ({ ...item, id: `ai-pkg-${idx}` }));
                                                setResult(prev => ({ ...(prev || {}), packing: structured }));
                                                setSelections(prev => ({ ...prev, packing: structured.map(i => i.id) }));
                                                setActiveTab('packing');
                                                setPackingStep('result');
                                                setLoading(false);
                                            })
                                            .catch(err => {
                                                console.error("[AI] Packing list error:", err);
                                                setLoading(false);
                                            });
                                    }}
                                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}
                                >
                                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-white shadow-sm'}`}>
                                        <PackageCheck className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">智能行李</div>
                                        <div className="text-[10px] opacity-60 mt-1">根據天氣自動打包</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        // Expand to show text input area
                                        setItineraryStep('text-input');
                                    }}
                                    className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${isDarkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-white/5' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                                >
                                    <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <BrainCircuit className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold opacity-80 text-sm">SmartImport</div>
                                        <div className="text-[10px] opacity-50 mt-1">匯入資料客製規劃</div>
                                    </div>
                                </button>
                            </div>

                            <div className="pt-2 flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="text-sm font-bold opacity-50 hover:opacity-100 flex items-center gap-2 transition-opacity"
                                >
                                    <Plus className="w-4 h-4" /> 我想手動新增行程
                                </button>
                                <button
                                    onClick={() => setItineraryStep('preferences')}
                                    className="text-xs opacity-40 hover:opacity-100 transition-opacity ml-4"
                                >
                                    重設偏好 ⚙️
                                </button>
                            </div>
                        </div>
                    ) : itineraryStep === 'preferences' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-bold">自訂行程風格 (強度矩陣)</h4>
                                <p className="text-sm opacity-60">調整各項目的比重，讓 AI 了解您的口味</p>
                            </div>

                            <div className="space-y-6 bg-gray-500/5 p-4 rounded-2xl border border-gray-500/10">
                                {INTENSITY_PREFS.map(pref => (
                                    <div key={pref.id} className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">{pref.label}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${intensities[pref.id] === 1 ? 'bg-gray-500/20 text-gray-500' :
                                                intensities[pref.id] === 2 ? 'bg-indigo-500/20 text-indigo-500' :
                                                    'bg-rose-500/20 text-rose-500'
                                                }`}>
                                                {intensities[pref.id] === 1 ? '低 (Low)' : intensities[pref.id] === 2 ? '中 (Mid)' : '高 (High)'}
                                            </span>
                                        </div>
                                        <div className="relative h-2 flex items-center">
                                            <div className="absolute inset-0 bg-gray-500/20 rounded-full h-1 my-auto"></div>
                                            <div className="absolute inset-0 flex justify-between px-1">
                                                {[1, 2, 3].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setIntensities(prev => ({ ...prev, [pref.id]: val }))}
                                                        className={`w-4 h-4 rounded-full border-2 transform -translate-y-1.5 transition-all shadow-sm ${intensities[pref.id] === val
                                                            ? 'bg-indigo-500 border-indigo-400 scale-125 z-10'
                                                            : 'bg-white border-gray-300 hover:border-indigo-300'
                                                            }`}
                                                    ></button>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[10px] opacity-40 px-1 italic">{pref.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs font-bold opacity-70 ml-1">其他細節偏好</div>
                                <div className="flex flex-wrap gap-2">
                                    {ITINERARY_PREFS.map(pref => (
                                        <button
                                            key={pref.id}
                                            onClick={() => togglePref(pref.id)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${selectedPrefs.includes(pref.id) ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-gray-500/10 opacity-60'
                                                }`}
                                        >
                                            {pref.icon} {pref.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setItineraryStep('logistics')}
                                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    下一步：物流與去過的景點 <ArrowRightLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : itineraryStep === 'logistics' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-bold">最後確認物流資訊</h4>
                                <p className="text-sm opacity-60">提供機票與酒店狀態，AI 能更精準對接行程</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-70 ml-1">✈️ 機票資訊 (選填)</label>
                                    <textarea
                                        value={logistics.flightInfo}
                                        onChange={(e) => setLogistics(prev => ({ ...prev, flightInfo: e.target.value }))}
                                        placeholder="貼上機票或酒店資訊，或利用下方「智能匯入」..."
                                        className={`w-full h-20 p-3 rounded-xl border resize-none text-sm transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold opacity-50 ml-1">📍 曾經去過嘅地方 (AI 會避開呢度)</label>
                                        <input
                                            type="text"
                                            value={logistics.visitedPlaces}
                                            onChange={(e) => setLogistics(prev => ({ ...prev, visitedPlaces: e.target.value }))}
                                            placeholder="例如：清水寺, 環球影城..."
                                            className={`w-full p-3 rounded-xl border text-sm transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                        />
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="ai-file-upload"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            accept="image/*,.pdf"
                                        />
                                        <label
                                            htmlFor="ai-file-upload"
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${analyzingFile ? 'opacity-50 cursor-not-allowed bg-indigo-500/5' : 'hover:border-indigo-500 hover:bg-indigo-500/5'} ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}
                                        >
                                            {analyzingFile ? (
                                                <div className="w-full py-2">
                                                    <div className="flex items-center justify-center gap-2 mb-3">
                                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                                        <span className="font-bold text-xs text-indigo-500">智能匯入 (SmartImport) 解析中 ({Math.floor(progress)}%)...</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-gray-500/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 transition-all duration-300"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block font-bold text-xs text-indigo-500">智能匯入 (SmartImport)</span>
                                                        <span className="block text-[9px] opacity-40 uppercase tracking-widest">掉張圖或者 PDF 俾我，自動幫你填位</span>
                                                    </div>
                                                </>
                                            )}
                                        </label>

                                        {fileResults && (
                                            <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
                                                <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                                                    <Check size={14} /> 解析成功！已自動填入相關資料
                                                </div>
                                                <div className="text-[10px] opacity-60 mt-1">
                                                    偵測到: {fileResults.map(r => r.name).join(', ')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-70 ml-1">🏨 住宿狀態</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setLogistics(prev => ({ ...prev, hotelStatus: 'booked' }))}
                                            className={`py-3 rounded-xl border font-bold text-sm transition-all ${logistics.hotelStatus === 'booked' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                        >
                                            已訂好酒店
                                        </button>
                                        <button
                                            onClick={() => setLogistics(prev => ({ ...prev, hotelStatus: 'none' }))}
                                            className={`py-3 rounded-xl border font-bold text-sm transition-all ${logistics.hotelStatus === 'none' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                        >
                                            仲未搵到住宿
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-70 ml-1">🚗 市內交通偏好</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setLogistics(prev => ({ ...prev, transportMode: 'public' }))}
                                            className={`py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${logistics.transportMode === 'public' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                        >
                                            <TrainFront className="w-4 h-4" /> 大眾運輸
                                        </button>
                                        <button
                                            onClick={() => setLogistics(prev => ({ ...prev, transportMode: 'driving' }))}
                                            className={`py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${logistics.transportMode === 'driving' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                        >
                                            <Car className="w-4 h-4" /> 自駕 / 的士
                                        </button>
                                    </div>
                                </div>

                                {logistics.hotelStatus === 'none' && (
                                    <div className="space-y-4 animate-slide-up">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold opacity-70 ml-1">💰 住宿預算案偏好</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['budget', 'mid', 'luxury'].map(b => (
                                                    <button
                                                        key={b}
                                                        onClick={() => setLogistics(prev => ({ ...prev, budget: b, selectedHotel: null }))}
                                                        className={`py-2 rounded-lg border font-bold text-[10px] capitalize transition-all ${logistics.budget === b ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-gray-500/10'}`}
                                                    >
                                                        {b === 'budget' ? '經濟' : b === 'mid' ? '舒適' : '奢華'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold opacity-70 ml-1">✨ AI 為您精選的最佳住宿</label>
                                            <div className="space-y-3">
                                                {(() => {
                                                    const cityName = trip?.city || contextCity || "Tokyo";
                                                    const hotelKey = Object.keys(HOTEL_DB).find(k =>
                                                        cityName.toLowerCase().includes(k.toLowerCase()) ||
                                                        k.toLowerCase().includes(cityName.toLowerCase())
                                                    );
                                                    const hotels = (HOTEL_DB[hotelKey] || []).filter(h => h.budget === logistics.budget);

                                                    if (hotels.length === 0) {
                                                        return (
                                                            <div className="text-center py-6 opacity-50">
                                                                <p className="text-sm">暫無 {logistics.budget === 'budget' ? '經濟' : logistics.budget === 'mid' ? '舒適' : '奢華'} 級別住宿資料</p>
                                                                <p className="text-xs mt-1">試試其他預算範圍？</p>
                                                            </div>
                                                        );
                                                    }

                                                    return hotels.map(hotel => (
                                                        <div
                                                            key={hotel.id}
                                                            onClick={() => setLogistics(prev => ({ ...prev, selectedHotel: hotel }))}
                                                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${logistics.selectedHotel?.id === hotel.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="font-bold text-sm flex items-center gap-2">
                                                                        {hotel.name}
                                                                        <span className="text-[10px] text-yellow-500">⭐ {hotel.rating}</span>
                                                                    </div>
                                                                    <div className="text-[10px] opacity-50">{hotel.location} · {hotel.price}</div>
                                                                </div>
                                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${logistics.selectedHotel?.id === hotel.id ? 'bg-indigo-500 border-transparent shadow-sm' : 'border-gray-300'}`}>
                                                                    {logistics.selectedHotel?.id === hotel.id && <Check size={10} className="text-white" />}
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] opacity-70 mb-2 leading-relaxed">{hotel.desc}</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {hotel.facilities.map(f => (
                                                                    <span key={f} className="text-[8px] px-1.5 py-0.5 bg-gray-500/10 rounded-md opacity-70">{f}</span>
                                                                ))}
                                                            </div>
                                                            <div className="mt-2 text-[9px] bg-indigo-500/10 text-indigo-400 p-2 rounded italic">
                                                                💬 "{hotel.reviews}"
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setItineraryStep('preferences')}
                                    className={`flex-1 py-3 rounded-xl border font-bold transition-all ${isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    返回
                                </button>
                                <button
                                    onClick={() => handleItineraryAnalyze(false)}
                                    className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95"
                                >
                                    開始分析行程
                                </button>
                            </div>
                        </div>
                    ) : itineraryStep === 'text-input' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-bold">SmartImport 文字資料</h4>
                                <p className="text-sm opacity-60">AI 會根據您提供的內容生成客製化建議</p>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="例如：貼上機票資訊、飯店地址、或是想去的景點清單..."
                                    className={`w-full h-36 p-4 rounded-xl border resize-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                />
                                <p className="text-[10px] opacity-50 px-1">貼上的資料會被 AI 用於優化推薦內容，如班機時間、飯店入住等</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setItineraryStep('selection')}
                                        className={`flex-1 py-3 rounded-xl border font-bold transition-all ${isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        返轉頭
                                    </button>
                                    <button
                                        onClick={() => handleItineraryAnalyze(false)}
                                        disabled={!inputText.trim()}
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        開始分析
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (activeTab === 'shopping' && shoppingStep === 'selection') ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-bold">你想搵邊類商品？</h4>
                                <p className="text-sm opacity-60">揀返你有興趣嘅類別，等 AI 幫你精準推薦</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SHOPPING_CATEGORIES.map(cat => (
                                    <label key={cat.id} className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedCats.includes(cat.id) ? 'bg-indigo-500/10 border-indigo-500/50' : 'border-gray-500/10 hover:bg-gray-500/5'}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCats.includes(cat.id) ? 'bg-indigo-500 border-transparent' : 'border-gray-400'}`}>
                                            {selectedCats.includes(cat.id) && <Sparkles className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={selectedCats.includes(cat.id)} onChange={() => toggleCat(cat.id)} />
                                        <span className="font-bold">{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setActiveTab('itinerary'); setItineraryStep('selection'); }} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}>返回</button>
                                <button onClick={handleShoppingAnalyze} className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedCats.length === 0}>
                                    開始分析
                                </button>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            {/* Tabs */}
                            <div className="flex p-1 bg-gray-500/10 rounded-xl">
                                {(mode === 'shopping'
                                    ? [{ id: 'shopping', label: '購物推薦', icon: ShoppingBag }]
                                    : (mode === 'packing'
                                        ? [{ id: 'packing', label: '行李清單', icon: PackageCheck }]
                                        : [{ id: 'itinerary', label: '行程建議', icon: List }, { id: 'packing', label: '行李清單', icon: PackageCheck }, { id: 'transport', label: '交通分析', icon: BusFront }, { id: 'budget', label: '預算預估', icon: Wallet }, { id: 'shopping', label: '購物推薦', icon: ShoppingBag }])
                                ).map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-lg scale-[1.02]' : 'opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                                    >
                                        <t.icon className="w-4 h-4" /> {t.label}
                                        {selections[t.id] && selections[t.id].length > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded-full ml-1">{selections[t.id].length}</span>}
                                    </button>
                                ))}
                            </div>

                            {/* Itinerary Tab */}
                            {activeTab === 'itinerary' && Array.isArray(result.itinerary) && result.itinerary.length > 0 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex justify-between items-center px-2 mb-2">
                                        <span className="text-xs font-bold opacity-60">分日行程建議 (共 {result.itinerary.length} 項)</span>
                                        <button
                                            onClick={() => toggleSelectAll('itinerary', result.itinerary.map(i => i.id))}
                                            className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                                        >
                                            {selections.itinerary.length === result.itinerary.length ? '取消全選' : '全選'}
                                        </button>
                                    </div>

                                    {Array.from({ length: Math.max(...result.itinerary.map(i => i.day)) || 1 }, (_, i) => i + 1).map(dayNum => (
                                        <div key={dayNum} className="space-y-3">
                                            <div className="flex items-center gap-2 px-2">
                                                <div className="h-[1px] flex-1 bg-indigo-500/20"></div>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Day {dayNum}</span>
                                                <div className="h-[1px] flex-1 bg-indigo-500/20"></div>
                                            </div>
                                            {result.itinerary.filter(i => i.day === dayNum).sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => toggleSelection('itinerary', item.id)}
                                                    className={`flex gap-4 items-start p-4 rounded-xl border transition-all cursor-pointer group ${selections.itinerary.includes(item.id) ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                                >
                                                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selections.itinerary.includes(item.id) ? 'bg-indigo-500 border-transparent' : 'border-gray-300'}`}>
                                                        {selections.itinerary.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="font-mono text-sm font-bold text-indigo-400 pt-1 w-12">{item.time}</div>
                                                    <div className="flex-1">
                                                        <div className="font-bold flex items-center gap-2">
                                                            {item.name}
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === 'food' ? 'bg-orange-500/10 text-orange-400' :
                                                                item.type === 'transport' ? 'bg-indigo-500/10 text-indigo-400' :
                                                                    'bg-blue-500/10 text-blue-400'
                                                                }`}>{
                                                                    item.type === 'food' ? '美食' :
                                                                        item.type === 'transport' ? '交通' :
                                                                            '景點'
                                                                }</span>
                                                            {item.smartTag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">{item.smartTag}</span>}
                                                        </div>
                                                        {/* Transport Options if available */}
                                                        {item.type === 'transport' && item.details?.options && (
                                                            <div className="mt-3 space-y-2">
                                                                <div className="text-[10px] font-bold opacity-50 mb-1 flex items-center gap-1">
                                                                    <ArrowRightLeft className="w-3 h-3" /> 可選交通方式：
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    {item.details.options.map((opt, idx) => {
                                                                        const isSelected = selectedTransports[item.id] === undefined ? idx === 0 : selectedTransports[item.id] === idx;
                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedTransports(prev => ({ ...prev, [item.id]: idx }));
                                                                                }}
                                                                                className={`p-2 rounded-lg border text-[10px] flex justify-between items-center transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/20' : 'border-gray-500/10 opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-500' : 'border-gray-400'}`}>
                                                                                        {isSelected && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                                                                                    </div>
                                                                                    <span className="font-bold">{opt.name}</span>
                                                                                    <span className="opacity-60">{opt.desc}</span>
                                                                                    {(opt.distance || opt.duration) && (
                                                                                        <span className="text-[9px] bg-gray-500/10 px-1.5 py-0.5 rounded text-indigo-400 font-mono">
                                                                                            {opt.distance && `${opt.distance}`}
                                                                                            {opt.distance && opt.duration && ' · '}
                                                                                            {opt.duration && `${formatDuration(opt.duration)}`}
                                                                                            {opt.steps && ` · ${opt.steps} 步`}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="font-mono font-bold text-indigo-400">{opt.currency} {opt.cost}</div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="text-[9px] opacity-40 italic mt-1">＊AI 已根據您的偏好優先排好首選方式，點擊可更換</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-sm">{item.currency} {item.cost.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Itinerary Tab - Empty/Quota Exceeded State */}
                            {activeTab === 'itinerary' && (!Array.isArray(result.itinerary) || result.itinerary.length === 0) && (
                                <div className="text-center py-12 opacity-60">
                                    <p className="text-lg font-bold">暫時無法生成行程建議</p>
                                    <p className="text-sm mt-2">AI 限額已用完，請稍後再試。</p>
                                </div>
                            )}

                            {/* Transport Tab */}
                            {activeTab === 'transport' && (
                                <div className="grid grid-cols-1 gap-3 animate-fade-in">
                                    <div className="text-xs opacity-50 p-2 text-center bg-yellow-500/10 text-yellow-500 rounded-lg">注意：交通建議僅供參考，不直接加入行程表</div>
                                    {(result?.transport || []).map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => toggleSelection('transport', t.id)}
                                            className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selections.transport?.includes(t.id) ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-500/10 hover:bg-gray-500/5'} ${t.recommended ? 'shadow-sm' : ''}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selections.transport?.includes(t.id) ? 'bg-indigo-500 border-transparent' : 'border-gray-300'}`}>
                                                {selections.transport?.includes(t.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'metro' ? 'bg-blue-500/10 text-blue-500' : t.type === 'bus' ? 'bg-green-500/10 text-green-500' : t.type === 'taxi' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                {t.type === 'metro' ? <TrainFront className="w-5 h-5" /> : t.type === 'bus' ? <BusFront className="w-5 h-5" /> : t.type === 'taxi' ? <Car className="w-5 h-5" /> : <Route className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {t.name}
                                                    {t.recommended && <span className="text-[10px] bg-indigo-500 text-white px-2 rounded-full font-black uppercase tracking-tighter">AI 推薦</span>}
                                                    {(t.distance || t.duration) && (
                                                        <span className="text-[9px] text-indigo-400 font-mono opacity-80">
                                                            {t.distance && `${t.distance}`}
                                                            {t.distance && t.duration && ' · '}
                                                            {t.duration && `${formatDuration(t.duration)}`}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs opacity-70">
                                                    {t.desc}
                                                    {t.steps && <span className="ml-2 text-indigo-400/60">(約 {t.steps} 步)</span>}
                                                </p>
                                            </div>
                                            <div className="font-mono font-bold text-sm text-indigo-500">{t.price}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Budget Tab */}
                            {activeTab === 'budget' && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="text-center p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/20">
                                        <p className="opacity-70 text-sm mb-1">總花費預估 ({trip?.currency || 'JPY'})</p>
                                        <div className="text-4xl font-bold font-mono text-indigo-400">
                                            {result.itinerary && result.itinerary[0]?.currency || 'JPY'} {Number(result.budget?.total || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(result.budget?.breakdown || []).map((b, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-gray-500/10 bg-gray-500/5">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="opacity-70 text-xs">{b.label}</span>
                                                    <span className="font-bold text-sm text-indigo-400">{b.percent}%</span>
                                                </div>
                                                <div className="text-right mt-1 text-sm font-bold font-mono">
                                                    {result.itinerary && result.itinerary[0]?.currency || 'JPY'} {Number(b.amt || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Shopping Tab */}
                            {activeTab === 'shopping' && result.shopping && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold opacity-60 flex items-center gap-2">
                                            <ShoppingBag size={14} className="text-purple-500" />
                                            AI 精選購物清單 (共 {result.shopping.length} 項)
                                        </span>
                                        <button
                                            onClick={() => toggleSelectAll('shopping', result.shopping.map(i => i.id))}
                                            className="text-xs text-purple-500 hover:underline font-bold"
                                        >
                                            {selections.shopping.length === result.shopping.length ? '取消全選' : '全選'}
                                        </button>
                                    </div>

                                    {/* Group by category if possible, or just list with better labels */}
                                    {['food', 'cosmetic', 'fashion', 'electronics', 'medicine', 'alcohol', 'gift'].map(catType => {
                                        const items = result.shopping.filter(i => i.type === catType || (catType === 'food' && i.type === 'alcohol'));
                                        if (items.length === 0) return null;

                                        const catLabel = SHOPPING_CATEGORIES.find(c => c.types.includes(catType))?.label || "🎁 其他精選";

                                        return (
                                            <div key={catType} className="space-y-3">
                                                <div className="flex items-center gap-2 px-2">
                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{catLabel}</span>
                                                    <div className="h-[1px] flex-1 bg-purple-500/10"></div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => toggleSelection('shopping', item.id)}
                                                            className={`flex gap-4 items-center p-4 rounded-xl border transition-all cursor-pointer group ${selections.shopping.includes(item.id) ? 'border-purple-500 bg-purple-500/5' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selections.shopping.includes(item.id) ? 'bg-purple-500 border-transparent' : 'border-gray-300'}`}>
                                                                {selections.shopping.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-sm">{item.name}</div>
                                                                <div className="text-[10px] opacity-60 truncate">{item.desc}</div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="font-mono font-bold text-xs text-purple-400">{item.estPrice}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="pt-4 flex justify-center">
                                        <button
                                            onClick={handleShoppingAnalyze}
                                            className="text-xs font-bold text-purple-500/60 hover:text-purple-500 flex items-center gap-2 transition-all p-2 rounded-lg hover:bg-purple-500/5"
                                        >
                                            <Sparkles className="w-4 h-4" /> 換一批推薦 / 探索更多
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Packing Tab */}
                            {activeTab === 'packing' && result.packing && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold opacity-60 flex items-center gap-2">
                                            <PackageCheck size={14} className="text-indigo-500" />
                                            智能行李清單
                                        </span>
                                        <button
                                            onClick={() => toggleSelectAll('packing', result.packing.map(i => i.id))}
                                            className="text-xs text-indigo-500 hover:underline font-bold"
                                        >
                                            {selections.packing.length === result.packing.length ? '取消全選' : '全選'}
                                        </button>
                                    </div>

                                    {/* Group Packing by Category */}
                                    {Array.from(new Set(result.packing.map(i => i.category))).map(cat => (
                                        <div key={cat} className="space-y-3">
                                            <div className="px-2">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{cat}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
                                                {result.packing.filter(i => i.category === cat).map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleSelection('packing', item.id)}
                                                        className={`flex gap-3 items-center p-3 rounded-xl border transition-all cursor-pointer group ${selections.packing.includes(item.id) ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${selections.packing.includes(item.id) ? 'bg-indigo-500 border-transparent' : 'border-gray-300'}`}>
                                                            {selections.packing.includes(item.id) && <CheckSquare className="w-2 h-2 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-xs truncate">{item.name}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-500/10 bg-gray-50/5 flex justify-end gap-3 z-10">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100">取消</button>
                    {result && (
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={getSelectionCount('itinerary') === 0 && getSelectionCount('shopping') === 0 && getSelectionCount('packing') === 0}
                        >
                            <Plus className="w-4 h-4" />
                            加入已選項目 ({activeTab === 'shopping' ? getSelectionCount('shopping') : (activeTab === 'packing' ? getSelectionCount('packing') : getSelectionCount('itinerary'))})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Unified Progress Overlay Component (Outside to prevent flicker)
const AIProgressOverlay = ({ text, subtext, progress }) => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in w-full max-w-xs mx-auto">
        <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-indigo-500/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{Math.floor(progress)}%</span>
            </div>
        </div>
        <div className="text-center w-full space-y-1">
            <p className="font-bold text-sm text-indigo-900 dark:text-indigo-100">{text}</p>
            <p className="text-[10px] opacity-40 px-2 leading-tight">{subtext}</p>
            <div className="mt-4 w-full h-1.5 bg-gray-500/10 rounded-full overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    </div>
);

export default AIGeminiModal;
