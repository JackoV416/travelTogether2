import React, { useState, useEffect } from 'react';
import { X, Map as MapIcon, Utensils, ShoppingBag, Bus, PlaneTakeoff, Hotel, Shirt, Sparkles, Smartphone, FileText, Pill, Package, Trash2, ArrowRight, Clock } from 'lucide-react';
import { inputClasses, formatDate, getWeekday } from '../../utils/tripUtils';
import { buttonPrimary } from '../../constants/styles';
import { CURRENCIES, MODAL_LABELS } from '../../constants/appData';

const AddActivityModal = ({ isOpen, onClose, onSave, onDelete, isDarkMode, date, defaultType = 'spot', editData = null, members = [], trip = {}, language = 'zh-TW' }) => {
    // i18n helper
    const t = (key) => MODAL_LABELS[key]?.[language] || MODAL_LABELS[key]?.['zh-TW'] || key;
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [type, setType] = useState('spot');
    const [currency, setCurrency] = useState('HKD');
    const [payer, setPayer] = useState('');
    const [splitType, setSplitType] = useState('group');
    const [details, setDetails] = useState({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false, time: '', location: '' });
    const [estPrice, setEstPrice] = useState('');
    const [category, setCategory] = useState('misc');

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setName(editData.name || ''); // CRITICAL: Restore name for edit
                setCost(editData.cost || ''); setType(editData.type || editData.category || 'spot'); setCurrency(editData.currency || 'HKD');
                setPayer(editData.payer || members[0]?.name);
                setSplitType(editData.splitType || 'group');
                setDetails(editData.details || { isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false, time: '', location: '' });
                setEstPrice(editData.estPrice || '');
                setCategory(editData.category || 'misc');
            } else {
                // Reset for new item
                setName(''); setCost(''); setType(defaultType); setCurrency('HKD');
                setPayer(members[0]?.name || '');
                setSplitType('group');
                setDetails({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false, time: '', location: '' });
                setEstPrice('');
                setCategory('misc');
            }
        }
    }, [isOpen, editData, defaultType, members]);

    if (!isOpen) return null;

    const categories = [
        { id: 'spot', label: t('spot'), icon: MapIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'food', label: t('food'), icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'shopping', label: t('shopping'), icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { id: 'transport', label: t('transport'), icon: Bus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'flight', label: t('flight'), icon: PlaneTakeoff, color: 'text-sky-500', bg: 'bg-sky-500/10' },
        { id: 'hotel', label: t('hotel'), icon: Hotel, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
    ];

    const packingCategories = [
        { id: 'clothes', label: t('clothes'), icon: Shirt },
        { id: 'toiletries', label: t('toiletries'), icon: Sparkles },
        { id: 'electronics', label: t('electronics'), icon: Smartphone },
        { id: 'documents', label: t('documents'), icon: FileText },
        { id: 'medicine', label: t('medicine'), icon: Pill },
        { id: 'misc', label: t('misc'), icon: Package }
    ];

    const isPacking = type === 'packing' || defaultType === 'packing';

    const handleAIInspiration = () => {
        const city = trip.city || '當地';
        const country = trip.country || '';

        const spots = {
            '東京': ['淺草寺 雷門', 'SHIBUYA SKY', '東京迪士尼海洋'],
            '大阪': ['日本環球影城 USJ', '登別溫泉', '道頓堀 散食'],
            '京都': ['金閣寺', '伏見稻荷大社', '嵐山 渡月橋'],
            '首爾': ['景福宮 韓服體驗', 'N首爾塔', '明洞 購物'],
            '台北': ['台北 101', '故宮博物院', '九份 慢活'],
            '當地': [`${city} 熱門景點`, `${city} 必去地標`, `探索 ${city}`]
        };

        const foods = {
            '東京': ['一蘭拉麵 澀谷分店', '敘敘苑 燒肉', '築地外市場 壽司'],
            '大阪': ['蟹道樂 本店', '味乃家 大阪燒', '黑門市場'],
            '京都': ['三嶋亭 壽喜燒', '中村藤吉 宇治抹茶', '菊乃井 懷石'],
            '台北': ['鼎泰豐 信義店', '饒河夜市 胡椒餅', '馬辣 火鍋'],
            '當地': [`${city} 評選餐廳`, `${city} 地道美食`, `人氣早餐店`]
        };

        const flightPrefix = country === '日本' ? 'CX' : country === '台灣' ? 'BR' : 'TR';
        const hotelName = city ? `${city} ${isDarkMode ? 'Grand' : 'Park'} Hotel` : '豪華酒店 / 民宿';

        if (type === 'food') {
            const list = foods[city] || foods['當地'];
            setName(list[Math.floor(Math.random() * list.length)]);
        } else if (type === 'spot') {
            const list = spots[city] || spots['當地'];
            setName(list[Math.floor(Math.random() * list.length)]);
        } else if (type === 'flight') {
            setName(`${flightPrefix}${Math.floor(Math.random() * 800 + 100)}`);
        } else if (type === 'hotel') {
            setName(hotelName);
        } else {
            setName(`${city} 精選行程`);
        }
    };

    const getPlaceholder = (itemType, itemCategory, packing) => {
        if (packing) {
            const map = {
                clothes: "例如: 發熱內衣, 羽絨, 運動鞋...",
                toiletries: "例如: 牙刷, 洗面奶, 防曬乳...",
                electronics: "例如: 行動電源, 相機, 萬能插頭...",
                documents: "例如: 護照副本, 保險單, 酒店預約信...",
                medicine: "例如: 止痛藥, 感冒藥, 胃藥...",
                misc: "輸入行李項目名稱..."
            };
            return map[itemCategory] || "輸入行李項目名稱...";
        }
        const typeMap = {
            spot: "例如: 代代木公園, 台北101...",
            food: "例如: 一蘭拉麵, 築地市場...",
            shopping: "例如: 澀谷109, 多慶屋...",
            transport: "例如: 東京地鐵, 機場接送...",
            flight: "例如: 長榮航空 BR198...",
            hotel: "例如: 希爾頓酒店, 民宿...",
            immigration: "例如: 成田入境大廳, 海關檢查..."
        };
        return typeMap[itemType] || "給這個行程一個名字...";
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-xl p-6 rounded-2xl ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-2xl tracking-tight">
                            {editData ? (isPacking ? '編輯行李項目' : '編輯行程項目') : (isPacking ? '加入行李項目' : '加入行程項目')}
                        </h3>
                        {date && !isPacking && (
                            <div className="text-sm font-medium opacity-60 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {formatDate(date)}（{getWeekday(date)}）
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                {!isPacking ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setType(cat.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${type === cat.id ? `${isDarkMode ? 'bg-gray-800 border-gray-600 ring-2 ring-indigo-500/50' : 'bg-white border-gray-300 ring-2 ring-indigo-500/20'} shadow-lg transform scale-105` : 'border-transparent opacity-60 hover:opacity-100 hover:bg-gray-500/5'} `}
                            >
                                <div className={`p-2 rounded-full mb-2 ${type === cat.id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}>
                                    <cat.icon className={`w-6 h-6 ${type === cat.id ? 'text-indigo-500' : ''}`} />
                                </div>
                                <span className={`text-[11px] font-bold ${type === cat.id ? 'text-indigo-500' : ''}`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                        {packingCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${category === cat.id ? `${isDarkMode ? 'bg-gray-800 border-gray-600 ring-2 ring-indigo-500/50' : 'bg-white border-gray-300 ring-2 ring-indigo-500/20'} shadow-lg transform scale-105` : 'border-transparent opacity-60 hover:opacity-100 hover:bg-gray-500/5'} `}
                            >
                                <div className={`p-2 rounded-full mb-2 ${category === cat.id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}>
                                    <cat.icon className={`w-6 h-6 ${category === cat.id ? 'text-indigo-500' : ''}`} />
                                </div>
                                <span className={`text-[11px] font-bold ${category === cat.id ? 'text-indigo-500' : ''}`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider">{t('name')}</label>
                            {!isPacking && (
                                <button
                                    onClick={handleAIInspiration}
                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${isDarkMode ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                                >
                                    <Sparkles className="w-2.5 h-2.5" /> {t('aiInspiration')}
                                </button>
                            )}
                        </div>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={getPlaceholder(type, category, isPacking)}
                            className={inputClasses(isDarkMode)}
                        />
                    </div>

                    {!isPacking && (
                        <div className="space-y-5">
                            {/* Time Section - Improved 3-column layout */}
                            <div className={`p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{language === 'en' ? 'Time & Duration' : '時間設定'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1.5 ml-1">{t('startTime')}</label>
                                        <input
                                            type="time"
                                            value={details.time || ''}
                                            onChange={e => {
                                                const newTime = e.target.value;
                                                if (newTime && details.duration) {
                                                    const [h, m] = newTime.split(':').map(Number);
                                                    const endMins = h * 60 + m + Number(details.duration);
                                                    const endH = Math.floor(endMins / 60) % 24;
                                                    const endM = endMins % 60;
                                                    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                                                    setDetails({ ...details, time: newTime, endTime });
                                                } else {
                                                    setDetails({ ...details, time: newTime });
                                                }
                                            }}
                                            className={inputClasses(isDarkMode) + " text-center text-sm"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1.5 ml-1">{t('duration')}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="15"
                                                value={details.duration || ''}
                                                onChange={e => {
                                                    const newDuration = e.target.value;
                                                    if (details.time && newDuration) {
                                                        const [h, m] = details.time.split(':').map(Number);
                                                        const endMins = h * 60 + m + Number(newDuration);
                                                        const endH = Math.floor(endMins / 60) % 24;
                                                        const endM = endMins % 60;
                                                        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                                                        setDetails({ ...details, duration: newDuration, endTime });
                                                    } else {
                                                        setDetails({ ...details, duration: newDuration });
                                                    }
                                                }}
                                                placeholder="60"
                                                className={inputClasses(isDarkMode) + " text-center pr-10 text-sm"}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">{t('minutes')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                                            {t('endTime')} <span className="opacity-40 normal-case">({t('optional')})</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={details.endTime || ''}
                                            onChange={e => {
                                                const newEndTime = e.target.value;
                                                if (details.time && newEndTime) {
                                                    const [sh, sm] = details.time.split(':').map(Number);
                                                    const [eh, em] = newEndTime.split(':').map(Number);
                                                    let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                                                    if (durationMins < 0) durationMins += 24 * 60;
                                                    setDetails({ ...details, endTime: newEndTime, duration: String(durationMins) });
                                                } else {
                                                    setDetails({ ...details, endTime: newEndTime });
                                                }
                                            }}
                                            className={inputClasses(isDarkMode) + " text-center text-sm"}
                                        />
                                    </div>
                                </div>
                                {/* Time Summary Badge */}
                                {details.time && details.duration && (
                                    <div className={`mt-3 text-xs font-medium px-3 py-2 rounded-lg text-center ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                        ⏱️ {details.time} → {details.endTime || '??:??'} ({details.duration} {t('minutes')})
                                    </div>
                                )}
                            </div>

                            {(type === 'transport' || type === 'flight' || type === 'immigration') ? (
                                <div className="col-span-2 p-4 rounded-xl border border-gray-500/10 bg-gray-500/5 mt-2 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="p-1 rounded bg-indigo-500/10 text-indigo-500"><Bus className="w-3 h-3" /></div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{type === 'immigration' ? '入境詳情 (Immigration)' : '路線詳情 (Route)'}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                                        {/* Divider for desktop */}
                                        <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <ArrowRight className="w-3 h-3 text-gray-400" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 出發地 (Origin)
                                            </label>
                                            <input value={details.location || ''} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="例如: Tokyo" className={inputClasses(isDarkMode)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 目的地 (Arrival)
                                            </label>
                                            <input value={details.arrival || ''} onChange={e => setDetails({ ...details, arrival: e.target.value })} placeholder="例如: Osaka" className={inputClasses(isDarkMode)} />
                                        </div>
                                    </div>

                                    {type === 'flight' && (
                                        <div className="pt-4 mt-2 border-t border-gray-500/10 space-y-4">
                                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">{language === 'en' ? 'Flight Details' : '航班詳情'}</label>
                                            <div className="flex gap-4 items-center">
                                                <input value={details.number || ''} onChange={e => setDetails({ ...details, number: e.target.value })} placeholder={language === 'en' ? 'Flight No. (e.g. BR198)' : '航班編號 (如: BR198)'} className={inputClasses(isDarkMode)} />
                                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap bg-gray-500/10 px-4 py-3.5 rounded-xl border border-transparent hover:border-gray-500/20 transition-all hover:bg-gray-500/20">
                                                    <input type="checkbox" checked={details.layover} onChange={e => setDetails({ ...details, layover: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                                    {language === 'en' ? 'Layover' : '需轉機'}
                                                </label>
                                            </div>

                                            {/* Gate & Baggage Details */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        {language === 'en' ? 'Dep Gate' : '離境閘口'}
                                                    </label>
                                                    <input
                                                        value={details.gate || ''}
                                                        onChange={e => setDetails({ ...details, gate: e.target.value })}
                                                        placeholder="T1 Gate 62"
                                                        className={inputClasses(isDarkMode) + " text-sm"}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                        {language === 'en' ? 'Arr Gate' : '抵達閘口'}
                                                    </label>
                                                    <input
                                                        value={details.arrivalGate || ''}
                                                        onChange={e => setDetails({ ...details, arrivalGate: e.target.value })}
                                                        placeholder="T2 Gate 15"
                                                        className={inputClasses(isDarkMode) + " text-sm"}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                                                        🧳 {language === 'en' ? 'Baggage' : '行李帶'}
                                                    </label>
                                                    <input
                                                        value={details.baggageClaim || ''}
                                                        onChange={e => setDetails({ ...details, baggageClaim: e.target.value })}
                                                        placeholder="Belt 5"
                                                        className={inputClasses(isDarkMode) + " text-sm"}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">地點</label>
                                    <input value={details.location || ''} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="輸入地點" className={inputClasses(isDarkMode)} />
                                </div>
                            )}

                            {type === 'hotel' && (
                                <div className="col-span-2 pt-2 border-t border-gray-500/10">
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                        住宿晚數
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={details.duration || '1'}
                                            onChange={e => setDetails({ ...details, duration: e.target.value })}
                                            placeholder="住宿晚數 (例如: 3)"
                                            className={inputClasses(isDarkMode) + " w-24 text-center"}
                                        />
                                        <span className="text-sm opacity-60 font-bold">晚 (Nights)</span>
                                        <p className="text-[10px] opacity-40 ml-auto max-w-[150px]">系統將自動在後續日期的行程中顯示此酒店</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cost Section */}
                    {defaultType !== 'shopping_plan' && (
                        <div className="p-5 border rounded-2xl bg-gray-500/5 border-gray-500/10 space-y-5 transition-all hover:bg-gray-500/10">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">金額</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-mono">$</span>
                                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" className={inputClasses(isDarkMode) + " pl-8"} />
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">貨幣</label>
                                    <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClasses(isDarkMode) + " appearance-none cursor-pointer text-center"}>{Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}</select>
                                </div>
                            </div>

                            {(type === 'shopping' || type === 'hotel' || type === 'flight') && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-500/10">
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預估稅金</label>
                                        <input placeholder="0" type="number" className={inputClasses(isDarkMode) + " text-sm"} value={details.tax} onChange={e => setDetails({ ...details, tax: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預估退稅</label>
                                        <input placeholder="0" type="number" className={inputClasses(isDarkMode) + " text-sm"} value={details.refund} onChange={e => setDetails({ ...details, refund: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {cost > 0 && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-500/10">
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">付款人</label>
                                        <select value={payer} onChange={e => setPayer(e.target.value)} className={inputClasses(isDarkMode) + " py-2 text-sm cursor-pointer"}>{members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">分攤方式</label>
                                        <select value={splitType} onChange={e => setSplitType(e.target.value)} className={inputClasses(isDarkMode) + " py-2 text-sm cursor-pointer"}><option value="group">多人均分</option><option value="me">個人支出</option></select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {defaultType === 'shopping_plan' && (
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">預計價格</label>
                            <input type="number" value={estPrice} onChange={e => setEstPrice(e.target.value)} placeholder="輸入預計價格" className={inputClasses(isDarkMode)} />
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-500/10">
                    {editData && onDelete && (
                        <button
                            onClick={() => onDelete(editData.id)}
                            className="px-4 py-3.5 rounded-xl border border-red-500/50 text-red-500 font-bold hover:bg-red-500/10 transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">{t('cancel')}</button>
                    <button onClick={() => {
                        if (!name.trim()) return alert(language === 'en' ? "Please enter a name" : "請輸入名稱");
                        // CRITICAL: Spread original editData FIRST to preserve all fields
                        // Then override with form fields (edits)
                        const payload = {
                            ...(editData || {}), // Preserve ALL original fields
                            id: editData?.id,
                            _index: editData?._index, // Pass index for legacy support
                            // Form fields (these will override original values)
                            name,
                            cost: Number(cost),
                            estPrice: Number(estPrice),
                            currency,
                            type,
                            details,
                            payer,
                            splitType,
                            category
                        };
                        console.log('[AddActivityModal] onSave payload:', JSON.stringify(payload, null, 2));
                        console.log('[AddActivityModal] details.time:', details.time);
                        onSave(payload);
                        onClose();
                    }} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        {editData ? t('save') : t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddActivityModal;
