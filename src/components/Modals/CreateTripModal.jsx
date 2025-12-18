import React, { useState } from 'react';
import { X, Search, CheckCircle, Calendar, MoveRight } from 'lucide-react';
import { inputClasses, getLocalizedCountryName, getLocalizedCityName } from '../../utils/tripUtils';
import { COUNTRIES_DATA } from '../../constants/appData';

const CreateTripModal = ({ isOpen, onClose, form, onInputChange, onMultiSelect, onAddCity, newCityInput, setNewCityInput, onSubmit, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings.language;
    const [countrySearch, setCountrySearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    if (!isOpen) return null;

    const availableCities = (form.countries.length ? form.countries : Object.keys(COUNTRIES_DATA)).flatMap(country => (COUNTRIES_DATA[country]?.cities || []));

    // Handle Toggle Selection (Add/Remove)
    const toggleSelection = (field, item) => {
        const currentList = form[field] || [];
        const isSelected = currentList.includes(item);
        const newList = isSelected
            ? currentList.filter(i => i !== item)
            : [...currentList, item];
        onMultiSelect(field, newList);
    };

    // Filter Options
    const filteredCountries = Object.keys(COUNTRIES_DATA)
        .filter(c => getLocalizedCountryName(c, currentLang).toLowerCase().includes(countrySearch.toLowerCase()) || c.toLowerCase().includes(countrySearch.toLowerCase()))
        .sort();

    const filteredCities = availableCities
        .filter(c => getLocalizedCityName(c, currentLang).toLowerCase().includes(citySearch.toLowerCase()) || c.toLowerCase().includes(citySearch.toLowerCase()))
        .sort();

    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
            <div className={`w-full max-w-3xl rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all transform scale-100`}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">建立新行程</h3>
                        <p className="text-sm opacity-60 mt-1 font-medium">多選國家與城市，或輸入自訂目的地。</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程名稱</label>
                        <input value={form.name} onChange={e => onInputChange('name', e.target.value)} placeholder="如：歐洲文化深度遊" className={inputClasses(isDarkMode)} />
                    </div>

                    {/* Country Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">目的地國家</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                placeholder="搜尋國家..."
                                className={inputClasses(isDarkMode) + " pl-10"}
                            />
                        </div>

                        {/* Selected Countries Chips */}
                        {form.countries.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.countries.map(c => (
                                    <span key={c} className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
                                        {getLocalizedCountryName(c, currentLang)}
                                        <button onClick={() => toggleSelection('countries', c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Dropdown Options (Scrollable) */}
                        <div className={`h-32 overflow-y-auto border rounded-xl p-1 custom-scrollbar ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {filteredCountries.map(c => {
                                const isSelected = form.countries.includes(c);
                                return (
                                    <div
                                        key={c}
                                        onClick={() => toggleSelection('countries', c)}
                                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-indigo-500 text-white shadow-sm' : 'hover:bg-gray-500/10 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span>{getLocalizedCountryName(c, currentLang)}</span>
                                        {isSelected && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* City Search */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">主要城市</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                                placeholder="搜尋城市..."
                                className={inputClasses(isDarkMode) + " pl-10"}
                            />
                            {/* Add Custom City Button (Inline) */}
                            {citySearch && !filteredCities.includes(citySearch) && (
                                <button
                                    onClick={() => { onAddCity(citySearch); setCitySearch(""); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-indigo-500 text-white text-xs rounded-md shadow-sm hover:bg-indigo-600 transition-all"
                                >
                                    + 加入 "{citySearch}"
                                </button>
                            )}
                        </div>

                        {/* Selected Cities Chips */}
                        {form.cities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.cities.map(c => (
                                    <span key={c} className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-bold flex items-center gap-1">
                                        {getLocalizedCityName(c, currentLang)}
                                        <button onClick={() => toggleSelection('cities', c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Dropdown Options (Scrollable) */}
                        <div className={`h-32 overflow-y-auto border rounded-xl p-1 custom-scrollbar ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {filteredCities.length > 0 ? filteredCities.map(c => {
                                const isSelected = form.cities.includes(c);
                                return (
                                    <div
                                        key={c}
                                        onClick={() => toggleSelection('cities', c)}
                                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-purple-500 text-white shadow-sm' : 'hover:bg-gray-500/10 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span>{getLocalizedCityName(c, currentLang)}</span>
                                        {isSelected && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                );
                            }) : (
                                <div className="p-4 text-center text-xs opacity-40">無相關城市，請輸入並點擊「加入」</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程日期</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] opacity-50 ml-1">開始日期</span>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    max={form.endDate || undefined}
                                    onChange={e => onInputChange('startDate', e.target.value)}
                                    style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                                    className={`w-full py-3 px-4 text-sm font-medium cursor-pointer rounded-xl appearance-none ${isDarkMode ? 'bg-gray-800 text-white border-gray-600 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : 'bg-white text-gray-900 border-gray-300'} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] opacity-50 ml-1">結束日期</span>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    min={form.startDate || undefined}
                                    onChange={e => onInputChange('endDate', e.target.value)}
                                    style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                                    className={`w-full py-3 px-4 text-sm font-medium cursor-pointer rounded-xl appearance-none ${isDarkMode ? 'bg-gray-800 text-white border-gray-600 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : 'bg-white text-gray-900 border-gray-300'} border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10">
                    <button onClick={onClose} className="flex-1 px-4 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                    <button onClick={onSubmit} className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-95">建立行程 🚀</button>
                </div>
            </div>
        </div>
    );
};

export default CreateTripModal;
