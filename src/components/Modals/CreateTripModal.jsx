import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { inputClasses, getLocalizedCountryName, getLocalizedCityName, getHolidayMap } from '../../utils/tripUtils';
import { generateTripName } from '../../services/ai-parsing';
import { COUNTRIES_DATA } from '../../constants/appData';
import DateRangePicker from '../Shared/DateRangePicker';

const CreateTripModal = ({ isOpen, onClose, form, onInputChange, onMultiSelect, onAddCity, newCityInput, setNewCityInput, onSubmit, isDarkMode, globalSettings, user }) => {
    const { t } = useTranslation();
    const currentLang = globalSettings.language;
    const [countrySearch, setCountrySearch] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [generatingName, setGeneratingName] = useState(false);
    const [expandedContinents, setExpandedContinents] = useState([]);

    const toggleContinent = (cont) => {
        setExpandedContinents(prev =>
            prev.includes(cont) ? prev.filter(c => c !== cont) : [...prev, cont]
        );
    };

    // Calculate Holidays for Calendar - MUST be before any early return
    const holidays = React.useMemo(() => {
        const homeHolidays = getHolidayMap(globalSettings?.countryCode || 'HK', new Date().getFullYear());
        const destCountry = form?.countries?.[0];
        const destHolidays = destCountry ? getHolidayMap(destCountry, new Date().getFullYear()) : {};
        return { ...homeHolidays, ...destHolidays };
    }, [form?.countries, globalSettings]);

    const handleAiNameGen = async () => {
        const destinations = form.destinations || [];
        if (destinations.length === 0 || !destinations[0].country) return;
        setGeneratingName(true);
        try {
            // Build context from all destinations
            const allCities = destinations.flatMap(d => d.cities || []);
            const allCountries = destinations.map(d => d.country).filter(Boolean);

            const tripContext = {
                city: allCities[0],
                cities: allCities,
                country: allCountries[0],
                countries: allCountries,
                startDate: form.startDate,
                endDate: form.endDate
            };
            const name = await generateTripName(tripContext, user?.uid, currentLang);
            onInputChange('name', name);
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingName(false);
        }
    };


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

    // Filter and Group Countries by Continent
    const groupedCountries = React.useMemo(() => {
        const filtered = Object.keys(COUNTRIES_DATA)
            .filter(c =>
                getLocalizedCountryName(c, currentLang).toLowerCase().includes(countrySearch.toLowerCase()) ||
                c.toLowerCase().includes(countrySearch.toLowerCase())
            );

        const groups = {};
        filtered.forEach(c => {
            const continent = COUNTRIES_DATA[c]?.continent || 'Other';
            if (!groups[continent]) groups[continent] = [];
            groups[continent].push(c);
        });

        // Calculate continent hotness (max hotness of any country in it)
        const continentHotness = {};
        Object.keys(groups).forEach(continent => {
            continentHotness[continent] = Math.max(...groups[continent].map(c => COUNTRIES_DATA[c]?.hot || 0));
        });

        // Sort continents: 1. Home continent first, 2. Hotness descending
        const userHome = globalSettings?.countryCode || 'HK';
        const homeContinent = Object.keys(COUNTRIES_DATA).find(c => COUNTRIES_DATA[c].tz === userHome)?.continent;

        const sortedContinents = Object.keys(groups).sort((a, b) => {
            if (a === homeContinent) return -1;
            if (b === homeContinent) return 1;
            return continentHotness[b] - continentHotness[a];
        });

        const result = [];
        sortedContinents.forEach(continent => {
            result.push({ isHeader: true, label: continent });
            groups[continent].sort((a, b) => {
                const dataA = COUNTRIES_DATA[a];
                const dataB = COUNTRIES_DATA[b];

                // 1. Home country first
                const isHomeA = dataA.tz === userHome ? 1 : 0;
                const isHomeB = dataB.tz === userHome ? 1 : 0;
                if (isHomeA !== isHomeB) return isHomeB - isHomeA;

                // 2. Hotness descent
                const hotA = dataA.hot || 0;
                const hotB = dataB.hot || 0;
                if (hotA !== hotB) return hotB - hotA;

                // 3. Alphabetical fallback
                return getLocalizedCountryName(a, currentLang).localeCompare(getLocalizedCountryName(b, currentLang));
            }).forEach(c => {
                result.push({ isHeader: false, value: c });
            });
        });
        return result;
    }, [countrySearch, currentLang, globalSettings?.countryCode]);

    const filteredCities = availableCities
        .filter(c => getLocalizedCityName(c, currentLang).toLowerCase().includes(citySearch.toLowerCase()) || c.toLowerCase().includes(citySearch.toLowerCase()))
        .sort();

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
            <div data-tour="create-trip-modal" className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-2xl border-[1px] border-[var(--glass-border)] transition-all transform scale-100`}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">{t('trip.create_modal.title')}</h3>
                        <p className="text-sm opacity-60 mt-1 font-medium">{t('trip.create_modal.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">{t('trip.create_modal.trip_name')}</label>
                        <div className="relative">
                            <input
                                value={form.name}
                                onChange={e => onInputChange('name', e.target.value)}
                                placeholder={t('trip.create_modal.placeholder_name')}
                                className={inputClasses(isDarkMode) + " pr-10"}
                            />
                            <button
                                onClick={handleAiNameGen}
                                disabled={generatingName}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-500/10 text-indigo-500 transition-all disabled:opacity-50"
                                title="AI Magic Name"
                            >
                                {generatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Destinations Section */}
                    <div className="md:col-span-2 space-y-6" data-tour="create-trip-country">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold opacity-70 uppercase tracking-wider">{t('trip.create_modal.destinations')}</label>
                            <button
                                onClick={() => {
                                    const nextIdx = (form.destinations?.length || 0) + 1;
                                    const newDest = { id: Date.now(), country: '', cities: [] };
                                    onInputChange('destinations', [...(form.destinations || []), newDest]);
                                }}
                                className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                            >
                                <Sparkles className="w-3 h-3" />
                                {t('trip.create_modal.add_destination')}
                            </button>
                        </div>

                        {(form.destinations || [{ country: '', cities: [] }]).map((dest, dIdx) => {
                            const availableRowCities = dest.country ? (COUNTRIES_DATA[dest.country]?.cities || []) : [];

                            return (
                                <div key={dest.id || dIdx} className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-50 border-gray-200'} space-y-4`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest opacity-30">
                                            {t('trip.create_modal.destination')} {dIdx + 1}
                                        </span>
                                        {dIdx > 0 && (
                                            <button
                                                onClick={() => {
                                                    const newList = form.destinations.filter((_, i) => i !== dIdx);
                                                    onInputChange('destinations', newList);
                                                }}
                                                className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Country Picker for this row */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter ml-1">{t('trip.create_modal.dest_country')}</p>
                                            <div className="relative group">
                                                <input
                                                    value={dest.country ? getLocalizedCountryName(dest.country, currentLang) : ""}
                                                    readOnly
                                                    placeholder={t('trip.create_modal.placeholder_country')}
                                                    className={inputClasses(isDarkMode) + " cursor-pointer pr-10 focus:ring-0"}
                                                    onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        // Toggle dropdown logic could go here if using a popover, 
                                                        // but for brevity we'll use a local state or keep it simple
                                                    }}
                                                />
                                                {dest.country && (
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...form.destinations];
                                                            newList[dIdx] = { ...newList[dIdx], country: '', cities: [] };
                                                            onInputChange('destinations', newList);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Pill-based Country Selection categorised by Continent */}
                                            <div className={`space-y-4 p-2 max-h-60 overflow-y-auto custom-scrollbar border rounded-xl ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                                                {groupedCountries.filter(item => item.isHeader).map((header) => {
                                                    const continent = header.label;
                                                    const countries = groupedCountries.filter((item, idx, self) => {
                                                        const headerIdx = self.findIndex(s => s === header);
                                                        const nextHeaderIdx = self.findIndex((s, i) => i > headerIdx && s.isHeader);
                                                        return !item.isHeader && idx > headerIdx && (nextHeaderIdx === -1 || idx < nextHeaderIdx);
                                                    });

                                                    if (countries.length === 0) return null;

                                                    const isExpanded = expandedContinents.includes(continent);
                                                    const visibleCountries = isExpanded ? countries : countries.slice(0, 8);
                                                    const remainingCount = countries.length - 8;

                                                    return (
                                                        <div key={continent} className="space-y-2 mb-4">
                                                            <div className="flex justify-between items-center px-1">
                                                                <h4 className="text-[10px] font-black uppercase opacity-30 tracking-widest">
                                                                    {t(`continents.${continent}`) || continent}
                                                                </h4>
                                                            </div>

                                                            <div className="flex flex-wrap gap-1.5 px-0.5">
                                                                {visibleCountries.map(cItem => {
                                                                    const c = cItem.value;
                                                                    const isSelected = dest.country === c;
                                                                    return (
                                                                        <button
                                                                            key={c}
                                                                            onClick={() => {
                                                                                const newList = [...(form.destinations || [])];
                                                                                newList[dIdx] = { ...newList[dIdx], country: c, cities: [] };
                                                                                onInputChange('destinations', newList);
                                                                            }}
                                                                            className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1
                                                                                ${isSelected
                                                                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                                                                    : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                                                                                }`}
                                                                        >
                                                                            {getLocalizedCountryName(c, currentLang)}
                                                                            {isSelected && <CheckCircle className="w-2.5 h-2.5" />}
                                                                        </button>
                                                                    );
                                                                })}

                                                                {remainingCount > 0 && !isExpanded && (
                                                                    <button
                                                                        onClick={() => toggleContinent(continent)}
                                                                        className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border border-dashed transition-all
                                                                            ${isDarkMode ? 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
                                                                    >
                                                                        {t('trip.create_modal.show_more', { count: remainingCount })}
                                                                    </button>
                                                                )}

                                                                {isExpanded && countries.length > 8 && (
                                                                    <button
                                                                        onClick={() => toggleContinent(continent)}
                                                                        className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border border-dashed transition-all
                                                                            ${isDarkMode ? 'border-gray-700 text-gray-500 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                                                                    >
                                                                        {t('trip.create_modal.show_less')}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* City Picker for this row */}
                                        <div className={`space-y-2 transition-all duration-300 ${!dest.country ? 'opacity-30 pointer-events-none' : ''}`}>
                                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter ml-1">{t('trip.create_modal.main_city')}</p>
                                            <div className="relative group">
                                                <input
                                                    placeholder={dest.country ? t('trip.create_modal.placeholder_city') : t('trip.create_modal.select_country_first')}
                                                    className={inputClasses(isDarkMode) + " pr-10"}
                                                    onChange={(e) => {
                                                        // Local search could be added here
                                                    }}
                                                />
                                            </div>

                                            {/* Pill-based City List */}
                                            <div className={`p-3 max-h-48 overflow-y-auto border rounded-xl custom-scrollbar ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                                                {availableRowCities.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {availableRowCities.map(city => {
                                                            const isSelected = dest.cities?.includes(city);
                                                            return (
                                                                <button
                                                                    key={city}
                                                                    onClick={() => {
                                                                        const currentCities = dest.cities || [];
                                                                        const newList = [...form.destinations];
                                                                        const newCities = isSelected
                                                                            ? currentCities.filter(ic => ic !== city)
                                                                            : [...currentCities, city];
                                                                        newList[dIdx] = { ...newList[dIdx], cities: newCities };
                                                                        onInputChange('destinations', newList);
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5
                                                                        ${isSelected
                                                                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                                                                            : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`
                                                                        }`}
                                                                >
                                                                    {getLocalizedCityName(city, currentLang)}
                                                                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[60px] flex items-center justify-center text-[10px] opacity-40 italic">
                                                        {!dest.country ? t('trip.create_modal.no_country_selected') : t('trip.create_modal.no_cities')}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selected City Chips (Inside row) */}
                                            {dest.cities?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {dest.cities.map(c => (
                                                        <span key={c} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 text-[10px] font-bold flex items-center gap-1">
                                                            {getLocalizedCityName(c, currentLang)}
                                                            <button onClick={() => {
                                                                const newList = [...form.destinations];
                                                                newList[dIdx] = { ...newList[dIdx], cities: dest.cities.filter(city => city !== c) };
                                                                onInputChange('destinations', newList);
                                                            }}><X className="w-2.5 h-2.5" /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-2 md:col-span-2" data-tour="create-trip-dates">
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider ml-1">{t('trip.create_modal.trip_dates')}</label>
                        <DateRangePicker
                            startDate={form.startDate}
                            endDate={form.endDate}
                            onSelect={({ startDate, endDate }) => {
                                onInputChange('startDate', startDate);
                                onInputChange('endDate', endDate);
                            }}
                            isDarkMode={isDarkMode}
                            placeholder={t('trip.create_modal.placeholder_dates')}
                            holidays={holidays}
                        />
                    </div>

                    {/* V1.3.1: AI Generation Toggle */}
                    <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer" onClick={() => onInputChange('isAI', !form.isAI)}>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isAI ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                            {form.isAI && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                                {t('trip.create_modal.ai_label')}
                            </h4>
                            <p className="text-xs opacity-60">{t('trip.create_modal.ai_desc')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-10 pt-6 border-t border-gray-500/10">
                    <button onClick={onClose} className="flex-1 px-4 py-3.5 rounded-xl border border-gray-500/30 font-bold opacity-70 hover:opacity-100 hover:bg-gray-500/5 transition-all">{t('common.cancel')}</button>
                    <button onClick={onSubmit} className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-95">{t('trip.create_modal.create_btn')}</button>
                </div>
            </div>
        </div>
    );
};

export default CreateTripModal;
