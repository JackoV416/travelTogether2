import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName, getHolidayMap } from '../../utils/tripUtils';
import { generateTripName } from '../../services/ai-parsing';
import { COUNTRIES_DATA } from '../../constants/appData';
import DateRangePicker from '../Shared/DateRangePicker';
import { AuroraModal, AuroraButton, AuroraInput } from '../Shared/AuroraComponents';

const CreateTripModal = ({ isOpen, onClose, form, onInputChange, onMultiSelect, onSubmit, isDarkMode, globalSettings, user }) => {
    const { t } = useTranslation();
    const currentLang = globalSettings.language;
    const [countrySearch, setCountrySearch] = useState("");
    const [generatingName, setGeneratingName] = useState(false);
    const [expandedContinents, setExpandedContinents] = useState([]);

    const toggleContinent = (cont) => {
        setExpandedContinents(prev =>
            prev.includes(cont) ? prev.filter(c => c !== cont) : [...prev, cont]
        );
    };

    // Calculate Holidays
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

    // Grouping Logic
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

        const continentHotness = {};
        Object.keys(groups).forEach(continent => {
            continentHotness[continent] = Math.max(...groups[continent].map(c => COUNTRIES_DATA[c]?.hot || 0));
        });

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
                const isHomeA = dataA.tz === userHome ? 1 : 0;
                const isHomeB = dataB.tz === userHome ? 1 : 0;
                if (isHomeA !== isHomeB) return isHomeB - isHomeA;
                const hotA = dataA.hot || 0;
                const hotB = dataB.hot || 0;
                if (hotA !== hotB) return hotB - hotA;
                return getLocalizedCountryName(a, currentLang).localeCompare(getLocalizedCountryName(b, currentLang));
            }).forEach(c => {
                result.push({ isHeader: false, value: c });
            });
        });
        return result;
    }, [countrySearch, currentLang, globalSettings?.countryCode]);

    return (
        <AuroraModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('trip.create_modal.title')}
            size="xl"
            footer={
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3.5 rounded-xl border border-white/10 font-bold text-slate-300 hover:bg-white/5 transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                    <AuroraButton
                        onClick={onSubmit}
                        className="flex-1"
                        size="lg"
                    >
                        {t('trip.create_modal.create_btn')}
                    </AuroraButton>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Trip Name */}
                <div className="md:col-span-2 relative">
                    <AuroraInput
                        label={t('trip.create_modal.trip_name')}
                        value={form.name}
                        onChange={e => onInputChange('name', e.target.value)}
                        placeholder={t('trip.create_modal.placeholder_name')}
                    />
                    <button
                        onClick={handleAiNameGen}
                        disabled={generatingName}
                        className="absolute right-3 top-[2.1rem] p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-all disabled:opacity-50"
                        title="AI Magic Name"
                    >
                        {generatingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </button>
                </div>

                {/* 2. Destinations */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{t('trip.create_modal.destinations')}</label>
                        <button
                            onClick={() => {
                                const newDest = { id: Date.now(), country: '', cities: [] };
                                onInputChange('destinations', [...(form.destinations || []), newDest]);
                            }}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            {t('trip.create_modal.add_destination')}
                        </button>
                    </div>

                    {(form.destinations || [{ country: '', cities: [] }]).map((dest, dIdx) => {
                        const availableRowCities = dest.country ? (COUNTRIES_DATA[dest.country]?.cities || []) : [];

                        return (
                            <div key={dest.id || dIdx} className="p-6 rounded-2xl bg-slate-800/40 border border-white/5 space-y-5 relative">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-30 text-white">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Country Selection */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-indigo-200/50 uppercase tracking-tighter ml-1">{t('trip.create_modal.dest_country')}</p>

                                        {/* Selected Country Display */}
                                        <div className="relative group">
                                            <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center justify-between">
                                                <span className={!dest.country ? 'text-slate-500' : ''}>
                                                    {dest.country ? getLocalizedCountryName(dest.country, currentLang) : t('trip.create_modal.placeholder_country')}
                                                </span>
                                                {dest.country && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newList = [...form.destinations];
                                                            newList[dIdx] = { ...newList[dIdx], country: '', cities: [] };
                                                            onInputChange('destinations', newList);
                                                        }}
                                                        className="opacity-50 hover:opacity-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Country List */}
                                        <div className="space-y-4 p-2 max-h-60 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-slate-900/30">
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
                                                    <div key={continent} className="space-y-2 mb-3">
                                                        <h4 className="px-1 text-[10px] font-black uppercase text-indigo-200/30 tracking-widest">
                                                            {t(`continents.${continent}`) || continent}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5">
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
                                                                                : 'border-transparent bg-white/5 hover:bg-white/10 text-slate-300'
                                                                            }`}
                                                                    >
                                                                        {getLocalizedCountryName(c, currentLang)}
                                                                        {isSelected && <CheckCircle className="w-2.5 h-2.5" />}
                                                                    </button>
                                                                );
                                                            })}
                                                            {remainingCount > 0 && !isExpanded && (
                                                                <button onClick={() => toggleContinent(continent)} className="px-2.5 py-1.5 rounded-full text-[11px] font-bold border border-dashed border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all">
                                                                    +{remainingCount}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* City Selection */}
                                    <div className={`space-y-3 transition-all duration-300 ${!dest.country ? 'opacity-30 pointer-events-none' : ''}`}>
                                        <p className="text-[10px] font-bold text-indigo-200/50 uppercase tracking-tighter ml-1">{t('trip.create_modal.main_city')}</p>

                                        <div className="p-3 max-h-60 overflow-y-auto border border-white/5 rounded-xl custom-scrollbar bg-slate-900/30 min-h-[160px]">
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
                                                                        ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                                                                        : 'border-transparent bg-white/5 hover:bg-white/10 text-slate-400'
                                                                    }`}
                                                            >
                                                                {getLocalizedCityName(city, currentLang)}
                                                                {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-[10px] opacity-40 italic text-slate-400">
                                                    {!dest.country ? t('trip.create_modal.no_country_selected') : t('trip.create_modal.no_cities')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. Dates */}
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider ml-1">{t('trip.create_modal.trip_dates')}</label>
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

                {/* 4. AI Toggle */}
                <div className="md:col-span-2">
                    <div
                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${form.isAI ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50'}`}
                        onClick={() => onInputChange('isAI', !form.isAI)}
                    >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isAI ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
                            {form.isAI && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-bold flex items-center gap-2 ${form.isAI ? 'text-indigo-300' : 'text-slate-300'}`}>
                                <Sparkles className={`w-4 h-4 ${form.isAI ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                                {t('trip.create_modal.ai_label')}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">{t('trip.create_modal.ai_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuroraModal>
    );
};

export default CreateTripModal;
