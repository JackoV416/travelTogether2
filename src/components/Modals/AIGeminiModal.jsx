import React, { useState, useEffect } from 'react';
import { BrainCircuit, X, Loader2, List, BusFront, Wallet, TrainFront, Car, Route, ShoppingBag, Sparkles, CheckSquare, Square, Plus, PackageCheck, Check, ArrowRightLeft } from 'lucide-react';
import {
    generateShoppingSuggestions,
    generatePackingList,
    generateFullItinerary,
    HOTEL_DB
} from '../../services/ai';
import { CURRENCIES } from '../../constants/appData';
import { inputClasses } from '../../utils/tripUtils'; // Fixed import path

const SHOPPING_CATEGORIES = [
    { id: 'food', label: '🍱 美食/伴手禮', types: ['food', 'alcohol'] },
    { id: 'cosmetic', label: '💄 藥妝/護膚', types: ['cosmetic'] },
    { id: 'fashion', label: '👗 服飾/時尚', types: ['clothing', 'fashion'] },
    { id: 'electronics', label: '⚡ 電器/3C', types: ['electronics'] },
    { id: 'others', label: '🎁 其他雜貨', types: ['gift', 'lifestyle', 'shopping'] }
];

const ITINERARY_PREFS = [
    { id: 'rest', label: '多啲休息時間', icon: '💤', desc: '唔好咁趕，多啲自由時間' },
    { id: 'shopping', label: '購物行程', icon: '🛍️', desc: '主要去商場、購物街' },
    { id: 'souvenir', label: '買手信行程', icon: '🎁', desc: '推薦必買伴手禮店' },
    { id: 'culture', label: '深度文化之旅', icon: '🏛️', desc: '參觀名勝古蹟、博物館' },
    { id: 'foodie', label: '美食巡禮', icon: '🍜', desc: '專攻排隊名店與地道小吃' }
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
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState(mode === 'shopping' ? 'shopping' : (mode === 'packing' ? 'packing' : 'itinerary'));
    const [shoppingStep, setShoppingStep] = useState('selection'); // selection -> result
    const [itineraryStep, setItineraryStep] = useState('selection'); // selection -> preferences -> logistics -> result
    const [packingStep, setPackingStep] = useState('selection'); // result only
    const [inputText, setInputText] = useState('');
    const [selectedCats, setSelectedCats] = useState(['food', 'cosmetic']);
    const [selectedPrefs, setSelectedPrefs] = useState(['culture', 'foodie']);
    const [logistics, setLogistics] = useState({
        flightInfo: '',
        hotelStatus: 'none',
        budget: 'mid',
        selectedHotel: null,
        transportMode: 'public'
    });

    const [selections, setSelections] = useState({ itinerary: [], shopping: [], transport: [], packing: [] });
    const [analyzingFile, setAnalyzingFile] = useState(false);
    const [fileResults, setFileResults] = useState(null);

    useEffect(() => {
        if (isOpen && mode === 'shopping') setActiveTab('shopping');
        else if (isOpen && mode === 'full') setActiveTab('itinerary');
    }, [isOpen, mode]);

    // Mock "Unlimited API" Logic
    const generateEnhancedAI = async (city, text = null) => {
        // Parallel fetch for efficiency
        const [_, shoppingData, packingData] = await Promise.all([
            new Promise(r => setTimeout(r, 1500)), // Simulate API/Thinking time
            generateShoppingSuggestions(city),
            generatePackingList(trip || { city, itinerary: {} }, weatherData?.[city] || { temp: "24°C", desc: "Sunny" })
        ]);

        // Calculate trip days dynamically
        const start = trip?.startDate ? new Date(trip.startDate) : new Date();
        const end = trip?.endDate ? new Date(trip.endDate) : new Date();
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalDays = Math.max(1, Math.min(diffDays, 14)); // Cap at 14 days for sanity

        const itinerary = await generateFullItinerary(city, totalDays, selectedPrefs);

        // Placeholder for currency and rate if not defined elsewhere
        const currency = trip?.currency || 'NTD';
        const rate = CURRENCIES[currency]?.rate || 1;

        return {
            itinerary,
            transport: [
                { id: 'ai-tr-1', type: "metro", name: "地鐵一日券", price: `${currency} ${45 * rate}`, desc: "最划算選擇，涵蓋主要景點", recommended: true },
                { id: 'ai-tr-2', type: "bus", name: "市中心觀光巴士", price: `${currency} ${30 * rate}`, desc: "漫遊市區，適合短途接駁" },
                { id: 'ai-tr-3', type: "taxi", name: "計程車/Uber", price: `約 ${currency} ${200 * rate}/趟`, desc: "適合多人分攤，節省時間" }
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
            packing: (packingData || []).map((item, idx) => ({ ...item, id: `ai-pkg-${idx}` }))
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
                setItineraryStep('selection'); // Allow input for packing too
                setActiveTab('packing');
            } else {
                setItineraryStep('selection');
                setActiveTab('itinerary');
            }
        }
    }, [isOpen, mode]);

    const handleItineraryAnalyze = (isQuick = false) => {
        setLoading(true);
        const days = trip?.days || 3;

        generateFullItinerary(contextCity || "Tokyo", days, isQuick ? [] : selectedPrefs, logistics)
            .then(res => {
                setResult(res);
                if (res.itinerary) {
                    setSelections(prev => ({
                        ...prev,
                        itinerary: res.itinerary.map(i => i.id)
                    }));
                }
                setItineraryStep('result');
                setActiveTab('itinerary');
                setLoading(false);
            })
            .catch(err => {
                console.error("AI Generation Status Exception:", err);
                setLoading(false);
            });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingFile(true);
        try {
            const { parseTripImage } = await import('../../services/ai');
            const results = await parseTripImage(file);
            setFileResults(results);

            // Auto-fill flight info if found
            const flight = results.find(r => r.type === 'flight');
            if (flight) {
                setLogistics(prev => ({
                    ...prev,
                    flightInfo: `${flight.name} (${flight.details.location})`
                }));
            }

            // Auto-fill hotel if found
            const hotel = results.find(r => r.type === 'hotel');
            if (hotel) {
                setLogistics(prev => ({ ...prev, hotelStatus: 'booked' }));
            }

        } catch (err) {
            console.error("File Analysis Error:", err);
        } finally {
            setAnalyzingFile(false);
        }
    };

    const togglePref = (id) => {
        setSelectedPrefs(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleShoppingAnalyze = () => {
        setLoading(true);
        const mappedCats = selectedCats.flatMap(catId => {
            const found = SHOPPING_CATEGORIES.find(c => c.id === catId);
            return found ? found.types : [];
        });

        generateShoppingSuggestions(contextCity || "Tokyo", mappedCats)
            .then(res => {
                const structured = res.map((item, idx) => ({ ...item, id: `ai-shp-${idx}` }));
                setResult(prev => ({ ...(prev || {}), shopping: structured }));
                setSelections(prev => ({ ...prev, shopping: structured.map(i => i.id) }));
                setActiveTab('shopping');
                setShoppingStep('result');
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handlePackingAnalyze = () => {
        setLoading(true);
        generatePackingList(trip || { itinerary: {} }, weatherData)
            .then(res => {
                const structured = res.map((item, idx) => ({ ...item, id: `ai-pkg-${idx}` }));
                setResult(prev => ({ ...(prev || {}), packing: structured }));
                setSelections(prev => ({ ...prev, packing: structured.map(i => i.id) }));
                setActiveTab('packing');
                setPackingStep('result');
                setLoading(false);
            })
            .catch(() => setLoading(false));
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
                itinerary: (result.itinerary || []).filter(i => selections.itinerary.includes(i.id)),
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
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden transform scale-100 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
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
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                            <div className="text-center">
                                <p className="font-bold">AI 正在思考中...</p>
                                <p className="text-xs opacity-50">正在分析數百萬筆旅遊數據</p>
                            </div>
                        </div>
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
                                    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-white shadow-sm'}`}>
                                        <Sparkles className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">客製化行程</div>
                                        <div className="text-[10px] opacity-60 mt-1">自選偏好，精準規劃</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab('shopping');
                                        setShoppingStep('selection');
                                    }}
                                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${isDarkMode ? 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20' : 'border-purple-200 bg-purple-50 hover:bg-purple-100'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-white shadow-sm'}`}>
                                        <ShoppingBag className="w-8 h-8 text-purple-500" />
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
                                        const cityKey = contextCity || "Tokyo";
                                        const cityWeather = weatherData?.[cityKey] || { temp: "24°C", desc: "Sunny" };
                                        generatePackingList(trip || { city: cityKey, itinerary: {} }, cityWeather)
                                            .then(res => {
                                                const structured = res.map((item, idx) => ({ ...item, id: `ai-pkg-${idx}` }));
                                                setResult(prev => ({ ...(prev || {}), packing: structured }));
                                                setSelections(prev => ({ ...prev, packing: structured.map(i => i.id) }));
                                                setActiveTab('packing');
                                                setPackingStep('result');
                                                setLoading(false);
                                            });
                                    }}
                                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-white shadow-sm'}`}>
                                        <PackageCheck className="w-8 h-8 text-emerald-500" />
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
                                    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <BrainCircuit className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold opacity-80">深度分析</div>
                                        <div className="text-[10px] opacity-50 mt-1">貼上資料客製規劃</div>
                                    </div>
                                </button>
                            </div>

                            <div className="pt-2 flex justify-center">
                                <button
                                    onClick={() => {
                                        onClose();
                                        if (onAddItem) onAddItem();
                                    }}
                                    className="text-sm font-bold opacity-50 hover:opacity-100 flex items-center gap-2 transition-opacity"
                                >
                                    <Plus className="w-4 h-4" /> 我想手動新增行程項目
                                </button>
                            </div>
                        </div>
                    ) : itineraryStep === 'preferences' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-bold">您的旅行偏好是？</h4>
                                <p className="text-sm opacity-60">AI 會根據您的選擇來調整行程的節奏與內容</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {ITINERARY_PREFS.map(pref => (
                                    <button
                                        key={pref.id}
                                        onClick={() => togglePref(pref.id)}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${selectedPrefs.includes(pref.id) ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-500/10 hover:bg-gray-500/5'}`}
                                    >
                                        <div className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-500/10 rounded-full">{pref.icon}</div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{pref.label}</div>
                                            <div className="text-xs opacity-50">{pref.desc}</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPrefs.includes(pref.id) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                                            {selectedPrefs.includes(pref.id) && <Check size={12} className="text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setItineraryStep('selection')}
                                    className={`flex-1 py-3 rounded-xl border font-bold transition-all ${isDarkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    返回
                                </button>
                                <button
                                    onClick={() => setItineraryStep('logistics')}
                                    className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95"
                                >
                                    下一步 (物流資訊)
                                </button>
                                <button // Direct bypass for quick generation if needed, or we just force logistics
                                    onClick={() => setItineraryStep('logistics')}
                                    className="hidden"
                                >
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
                                        placeholder="貼上機票號碼或時間，或由下方上傳憑證..."
                                        className={`w-full h-24 p-4 rounded-xl border resize-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                    />

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
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${analyzingFile ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 hover:bg-indigo-500/5'} ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}
                                        >
                                            {analyzingFile ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                                    <span className="text-sm font-medium">深度解析中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 text-indigo-500" />
                                                    <span className="text-sm font-medium">上傳機票/酒店收據 (Image/PDF)</span>
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
                                                {(HOTEL_DB[Object.keys(HOTEL_DB).find(k => (trip?.city || contextCity || "Tokyo").toLowerCase().includes(k.toLowerCase()))] || [])
                                                    .filter(h => h.budget === logistics.budget)
                                                    .map(hotel => (
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
                                                    ))
                                                }
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
                                <h4 className="text-lg font-bold">貼上您的行程資料</h4>
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
                                        返回
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
                                <h4 className="text-lg font-bold">您想尋找什麼類型的商品？</h4>
                                <p className="text-sm opacity-60">選擇感興趣的類別，讓 AI 為您精準推薦</p>
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
                            {activeTab === 'itinerary' && (
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
                                                                    {item.details.options.map((opt, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className={`p-2 rounded-lg border text-[10px] flex justify-between items-center transition-all ${idx === 0 ? 'border-indigo-500/30 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-gray-500/10 opacity-60 hover:opacity-100 hover:bg-gray-500/5'}`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-bold">{opt.name}</span>
                                                                                <span className="opacity-60">{opt.desc}</span>
                                                                            </div>
                                                                            <div className="font-mono font-bold text-indigo-400">{opt.currency} {opt.cost}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-[9px] opacity-40 italic mt-1">＊AI 已根據您的偏好優先排好首選方式</div>
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

                            {/* Transport Tab */}
                            {activeTab === 'transport' && (
                                <div className="grid grid-cols-1 gap-3 animate-fade-in">
                                    <div className="text-xs opacity-50 p-2 text-center bg-yellow-500/10 text-yellow-500 rounded-lg">注意：交通建議僅供參考，不直接加入行程表</div>
                                    {result.transport.map((t) => (
                                        <div key={t.id} className={`p-4 rounded-xl border flex items-center gap-4 ${t.recommended ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-500/10'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'metro' ? 'bg-blue-500/10 text-blue-500' : t.type === 'bus' ? 'bg-green-500/10 text-green-500' : t.type === 'taxi' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                {t.type === 'metro' ? <TrainFront className="w-5 h-5" /> : t.type === 'bus' ? <BusFront className="w-5 h-5" /> : t.type === 'taxi' ? <Car className="w-5 h-5" /> : <Route className="w-5 h-5" />}
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
                                                <div className="text-right mt-2 text-xs opacity-50 font-mono">${b.amt}</div>
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

export default AIGeminiModal;
