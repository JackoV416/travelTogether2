import React, { useState, useEffect } from 'react';
import { X, Map as MapIcon, Utensils, ShoppingBag, Bus, PlaneTakeoff, Hotel } from 'lucide-react';
import { inputClasses, formatDate, getWeekday } from '../../utils/tripUtils';
import { buttonPrimary } from '../../constants/styles';
import { CURRENCIES } from '../../constants/appData';

const AddActivityModal = ({ isOpen, onClose, onSave, isDarkMode, date, defaultType = 'spot', editData = null, members = [] }) => {
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [type, setType] = useState('spot');
    const [currency, setCurrency] = useState('HKD');
    const [payer, setPayer] = useState('');
    const [splitType, setSplitType] = useState('group');
    const [details, setDetails] = useState({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
    const [estPrice, setEstPrice] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setName(editData.name || editData.desc || ''); setCost(editData.cost || ''); setType(editData.type || editData.category || 'spot'); setCurrency(editData.currency || 'HKD');
                setPayer(editData.payer || members[0]?.name);
                setSplitType(editData.splitType || 'group');
                setDetails(editData.details || { isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
                setEstPrice(editData.estPrice || '');
            } else {
                // Reset for new item
                setName(''); setCost(''); setType(defaultType); setCurrency('HKD');
                setPayer(members[0]?.name || '');
                setSplitType('group');
                setDetails({ isRefund: false, refund: '', tax: '', taxCurrency: 'HKD', layover: false });
                setEstPrice('');
            }
        }
    }, [isOpen, editData, defaultType, members]);

    if (!isOpen) return null;

    const categories = [
        { id: 'spot', label: '景點', icon: MapIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'food', label: '餐廳', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'shopping', label: '購物', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { id: 'transport', label: '交通', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'flight', label: '航班', icon: PlaneTakeoff, color: 'text-sky-500', bg: 'bg-sky-500/10' },
        { id: 'hotel', label: '住宿', icon: Hotel, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-xl p-6 rounded-2xl ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-2xl tracking-tight">{editData ? '編輯行程項目' : '加入行程項目'}</h3>
                        {date && (
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

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">名稱</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="給這個行程一個名字..." className={inputClasses(isDarkMode)} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">時間</label>
                            <input type="time" value={details.time || ''} onChange={e => setDetails({ ...details, time: e.target.value })} className={inputClasses(isDarkMode)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">地點</label>
                            <input value={details.location || ''} onChange={e => setDetails({ ...details, location: e.target.value })} placeholder="輸入地點" className={inputClasses(isDarkMode)} />
                        </div>
                    </div>

                    {type === 'flight' && (
                        <div className="p-5 border rounded-2xl bg-gray-500/5 border-gray-500/10 transition-all hover:bg-gray-500/10">
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">航班資訊</label>
                            <div className="flex gap-4 items-center">
                                <input value={details.number || ''} onChange={e => setDetails({ ...details, number: e.target.value })} placeholder="航班編號 (如: BR198)" className={inputClasses(isDarkMode)} />
                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap bg-gray-500/10 px-4 py-3.5 rounded-xl border border-transparent hover:border-gray-500/20 transition-all">
                                    <input type="checkbox" checked={details.layover} onChange={e => setDetails({ ...details, layover: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                    需轉機
                                </label>
                            </div>
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
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                    <button onClick={() => { onSave({ id: editData?.id, name, cost: Number(cost), estPrice: Number(estPrice), currency, type, details, payer, splitType }); onClose(); }} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        {editData ? '儲存變更' : '確認加入'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddActivityModal;
