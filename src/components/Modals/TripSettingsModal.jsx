import React, { useState, useEffect } from 'react';
import { X, Calendar, MoveRight } from 'lucide-react';
import { inputClasses } from '../../utils/tripUtils';
import { buttonPrimary } from '../../constants/styles';
import { COUNTRIES_DATA } from '../../constants/appData';

const TripSettingsModal = ({ isOpen, onClose, trip, onUpdate, isDarkMode }) => {
    const [form, setForm] = useState(trip);
    useEffect(() => { if (trip) setForm(trip) }, [trip]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-xl p-8 rounded-2xl ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">行程設定</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">行程名稱</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClasses(isDarkMode)} placeholder="名稱" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程日期</label>
                        <div className="flex items-center gap-2 p-1 border rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                            <div className="flex-1 relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="date"
                                    value={form.startDate}
                                    max={form.endDate}
                                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full bg-transparent border-none py-3 pl-10 pr-2 text-sm font-medium focus:ring-0 cursor-pointer"
                                />
                            </div>
                            <div className="opacity-30"><MoveRight className="w-4 h-4" /></div>
                            <div className="flex-1 relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-hover:text-indigo-500 transition-colors" />
                                <input
                                    type="date"
                                    value={form.endDate}
                                    min={form.startDate}
                                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                                    className="w-full bg-transparent border-none py-3 pl-10 pr-2 text-sm font-medium focus:ring-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">國家</label>
                            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>{Object.keys(COUNTRIES_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}</select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">城市</label>
                            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClasses(isDarkMode)} placeholder="城市" />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                        <button onClick={() => { onUpdate(form); onClose(); }} className={buttonPrimary + " flex-1 py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>儲存設定</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripSettingsModal;
