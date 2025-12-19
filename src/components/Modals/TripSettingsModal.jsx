import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle } from 'lucide-react';
import { inputClasses, getLocalizedCountryName, getLocalizedCityName, getHolidayMap } from '../../utils/tripUtils';
import { buttonPrimary } from '../../constants/styles';
import { COUNTRIES_DATA } from '../../constants/appData';
import DateRangePicker from '../Shared/DateRangePicker';

const TripSettingsModal = ({ isOpen, onClose, trip, onUpdate, isDarkMode, globalSettings }) => {
    const currentLang = globalSettings?.language || 'zh-TW';
    // Initialize form with array support for countries/cities, defaulting to current single value if array missing
    const [form, setForm] = useState({
        ...trip,
        countries: trip?.countries || (trip?.country ? [trip.country] : []),
        cities: trip?.cities || (trip?.city ? [trip.city] : [])
    });

    const [countrySearch, setCountrySearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    // Update form when trip prop changes
    useEffect(() => {
        if (trip) {
            setForm({
                ...trip,
                countries: trip.countries || (trip.country ? [trip.country] : []),
                cities: trip.cities || (trip.city ? [trip.city] : [])
            });
        }
    }, [trip]);

    const tripHolidays = React.useMemo(() => {
        const homeHolidays = getHolidayMap(globalSettings?.countryCode || 'HK');
        // Use the first selected country for holidays
        const destCountry = form.countries?.[0] || form.country;
        const destHolidays = destCountry ? getHolidayMap(destCountry) : {};
        return { ...homeHolidays, ...destHolidays };
    }, [form.countries, form.country, globalSettings]);

    if (!isOpen) return null;

    // Derived Lists for UI
    const availableCities = (form.countries.length ? form.countries : Object.keys(COUNTRIES_DATA)).flatMap(country => (COUNTRIES_DATA[country]?.cities || []));

    const toggleSelection = (field, item) => {
        const currentList = form[field] || [];
        const isSelected = currentList.includes(item);
        const newList = isSelected
            ? currentList.filter(i => i !== item)
            : [...currentList, item];
        setForm(prev => ({ ...prev, [field]: newList }));
    };

    const filteredCountries = Object.keys(COUNTRIES_DATA)
        .filter(c => getLocalizedCountryName(c, currentLang).toLowerCase().includes(countrySearch.toLowerCase()) || c.toLowerCase().includes(countrySearch.toLowerCase()))
        .sort();

    const filteredCities = availableCities
        .filter(c => getLocalizedCityName(c, currentLang).toLowerCase().includes(citySearch.toLowerCase()) || c.toLowerCase().includes(citySearch.toLowerCase()))
        .sort();

    const handleSave = () => {
        // Prepare update object. Ensure legacy single fields are also updated for compatibility
        const updateData = {
            ...form,
            country: form.countries[0] || form.country, // Fallback to first selected
            city: form.cities[0] || form.city,          // Fallback to first selected
            countries: form.countries,
            cities: form.cities
        };
        onUpdate(updateData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">行程設定</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程名稱</label>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className={inputClasses(isDarkMode)}
                            placeholder="名稱"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">行程日期</label>
                        <DateRangePicker
                            startDate={form.startDate}
                            endDate={form.endDate}
                            onSelect={({ startDate, endDate }) => setForm({ ...form, startDate, endDate })}
                            isDarkMode={isDarkMode}
                            placeholder="選擇行程日期"
                            holidays={tripHolidays}
                        />
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">國家 (可多選)</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                placeholder="搜尋國家..."
                                className={inputClasses(isDarkMode) + " pl-10"}
                            />
                        </div>

                        {form.countries?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.countries.map(c => (
                                    <span key={c} className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
                                        {getLocalizedCountryName(c, currentLang)}
                                        <button onClick={() => toggleSelection('countries', c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className={`h-40 overflow-y-auto border rounded-xl p-1 custom-scrollbar ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {filteredCountries.map(c => {
                                const isSelected = form.countries?.includes(c);
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

                    {/* City Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">城市 (可多選)</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                                placeholder="搜尋城市..."
                                className={inputClasses(isDarkMode) + " pl-10"}
                            />
                            {citySearch && !filteredCities.includes(citySearch) && (
                                <button
                                    onClick={() => {
                                        setForm(prev => ({ ...prev, cities: [...(prev.cities || []), citySearch] }));
                                        setCitySearch("");
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-indigo-500 text-white text-xs rounded-md shadow-sm hover:bg-indigo-600 transition-all"
                                >
                                    +
                                </button>
                            )}
                        </div>

                        {form.cities?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.cities.map(c => (
                                    <span key={c} className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-bold flex items-center gap-1">
                                        {getLocalizedCityName(c, currentLang)}
                                        <button onClick={() => toggleSelection('cities', c)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className={`h-40 overflow-y-auto border rounded-xl p-1 custom-scrollbar ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {filteredCities.length > 0 ? filteredCities.map(c => {
                                const isSelected = form.cities?.includes(c);
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
                                <div className="p-4 text-center text-xs opacity-40">請先選擇國家，或直接輸入城市名稱</div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10 md:col-span-2">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">取消</button>
                        <button onClick={handleSave} className={buttonPrimary + " flex-1 py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>
                            儲存設定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripSettingsModal;
