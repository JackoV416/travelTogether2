import { useState, useEffect, useMemo } from 'react';
import { X, Search, CheckCircle, Globe, Lock, Link as LinkIcon, Copy, Check, Info } from 'lucide-react';
import { inputClasses, getLocalizedCountryName, getLocalizedCityName, getHolidayMap } from '../../utils/tripUtils';
import { useTranslation } from 'react-i18next';
import { buttonPrimary } from '../../constants/styles';
import { COUNTRIES_DATA } from '../../constants/appData';
import DateRangePicker from '../Shared/DateRangePicker';

const TripSettingsModal = ({ isOpen, onClose, trip, onUpdate, isDarkMode, globalSettings }) => {
    const { t } = useTranslation();
    const currentLang = globalSettings?.language || 'zh-TW';
    // Initialize form with array support for countries/cities, defaulting to current single value if array missing
    const [form, setForm] = useState({
        ...trip,
        countries: trip?.countries || (trip?.country ? [trip.country] : []),
        cities: trip?.cities || (trip?.city ? [trip.city] : []),
        isPublic: trip?.isPublic || false,
        publicModules: trip?.publicModules || {
            budget: true, // Default to true or false? Let's default false for privacy unless explicitly set
            packing: true,
            shopping: true,
            footprints: true,
            gallery: true
        }
    });

    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/trip/${trip.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [countrySearch, setCountrySearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    // Update form when trip prop changes
    useEffect(() => {
        if (trip) {
            queueMicrotask(() => setForm({
                ...trip,
                countries: trip.countries || (trip.country ? [trip.country] : []),
                cities: trip.cities || (trip.city ? [trip.city] : []),
                isPublic: trip.isPublic || false,
                publicModules: trip.publicModules || { budget: false, packing: false, shopping: false, footprints: false, gallery: false }
            }));
        }
    }, [trip]);

    const tripHolidays = useMemo(() => {
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
            cities: form.cities,
            isPublic: form.isPublic, // V1.3.0 Public Trip
            publicModules: form.publicModules // V1.9.8 Modular Public
        };
        onUpdate(updateData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">{t('trip.settings.title')}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">{t('trip.settings.name')}</label>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className={inputClasses(isDarkMode)}
                            placeholder={t('dashboard.search_placeholder') || "名稱"}
                        />
                    </div>

                    <div className={`md:col-span-2 p-4 rounded-xl border flex flex-col gap-4 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className={`p-3 rounded-full ${form.isPublic ? 'bg-indigo-500/20 text-indigo-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                    {form.isPublic ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="font-bold flex items-center gap-2 text-sm sm:text-base">
                                        {/* Matches phrasing in image: "私人存取" vs "公開行程" */}
                                        {form.isPublic ? '公開行程' : '私人存取'}
                                        {form.isPublic && <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 text-[10px] tracking-tight font-black animate-pulse">LIVE</span>}
                                    </div>
                                    <div className="text-[10px] sm:text-xs opacity-60 mt-0.5">
                                        {form.isPublic
                                            ? '擁有連結者可查看' // Subtext from image
                                            : t('trip.settings.private_desc')}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${form.isPublic ? 'bg-indigo-500' : 'bg-gray-600/30'}`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${form.isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {/* Copy Link Section (Only if public) */}
                        {form.isPublic && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg border border-dashed animate-fade-in ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                                <LinkIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                                <div className="flex-1 truncate text-[10px] font-mono opacity-50">
                                    {window.location.origin}/trip/{trip.id}
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20'}`}
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied ? '已複製' : '複製連結'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* V1.9.8 Modular Public Visibility Settings */}
                    {form.isPublic && (
                        <div className="md:col-span-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-indigo-500/20">
                            <h4 className="text-sm font-bold flex items-center gap-2 mb-4 text-indigo-500">
                                <Globe className="w-4 h-4" /> 公開頁面模組設定 (Modular Visibility)
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {['budget', 'packing', 'shopping', 'footprints', 'gallery'].map(module => (
                                    <label key={module} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={form.publicModules?.[module] === true}
                                                onChange={(e) => setForm(prev => ({
                                                    ...prev,
                                                    publicModules: { ...prev.publicModules, [module]: e.target.checked }
                                                }))}
                                            />
                                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                        </div>
                                        <span className="text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity capitalize">
                                            {t(`trip.tabs.${module}`, module)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-[10px] opacity-50 mt-3 flex items-center gap-1">
                                <Info className="w-3 h-3" /> 勾選後，訪客將可在公開頁面查看該分頁內容 (唯讀)。相簿需額外設定相片權限。
                            </p>
                        </div>
                    )}

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">{t('trip.settings.dates')}</label>
                        <DateRangePicker
                            startDate={form.startDate}
                            endDate={form.endDate}
                            onSelect={({ startDate, endDate }) => setForm({ ...form, startDate, endDate })}
                            isDarkMode={isDarkMode}
                            placeholder={t('trip.settings.select_dates')}
                            holidays={tripHolidays}
                        />
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">{t('trip.settings.countries')}</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                placeholder={t('trip.settings.search_countries')}
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
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">{t('trip.settings.cities')}</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                                placeholder={t('trip.settings.search_cities')}
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
                                <div className="p-4 text-center text-xs opacity-40">{t('trip.settings.city_hint')}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10 md:col-span-2">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">{t('common.cancel')}</button>
                        <button onClick={handleSave} className={buttonPrimary + " flex-1 py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>
                            {t('trip.settings.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripSettingsModal;
