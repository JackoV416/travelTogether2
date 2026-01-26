import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, X, Globe, Wallet, Sparkles, Filter, MapPin, Sun } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName } from '../../utils/tripUtils';
import { COUNTRY_CODE_MAP, COUNTRIES_DATA } from '../../constants/countries';

// Helper function outside component or inside
const getContinent = (code) => {
    if (code === 'All') return 'All';
    // 1. Try Code -> Full Name
    const fullName = COUNTRY_CODE_MAP[code];
    if (fullName && COUNTRIES_DATA[fullName]) return COUNTRIES_DATA[fullName].continent;
    // 2. Try Full Name direct match
    if (COUNTRIES_DATA[code]) return COUNTRIES_DATA[code].continent;
    return 'Other';
};

/**
 * FilterMenu - Premium Trip.com style filter bar
 * Consolidated into a single "Filters" button with a tabbed popover menu.
 * Includes Active Filter Pills for quick visibility and removal.
 */
const FilterMenu = ({
    isDarkMode,
    countries,
    cities,
    themes,
    filters,
    onFilterChange,
}) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // Helper for Country Names
    const getCountryName = (code) => {
        const fullName = COUNTRY_CODE_MAP[code] || code;
        return getLocalizedCountryName(fullName, currentLang);
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('destination'); // 'destination', 'budget', 'themes'
    const popoverRef = useRef(null);

    // Budget Slider State
    const [budgetRange, setBudgetRange] = useState([0, 50000]); // Max 50k
    const MAX_BUDGET = 50000;

    // V1.6.0: Global Expansion UI State
    const [expandedContinents, setExpandedContinents] = useState([]);
    const toggleContinent = (cont) => {
        setExpandedContinents(prev =>
            prev.includes(cont) ? prev.filter(c => c !== cont) : [...prev, cont]
        );
    };

    useEffect(() => {
        // Sync internal slider state when external filter changes
        if (filters.budget === 'All') {
            setBudgetRange(prev => {
                // Prevent infinite loop by checking if state actually needs to change
                if (prev[0] === 0 && prev[1] === MAX_BUDGET) return prev;
                return [0, MAX_BUDGET];
            });
        }
        // If needed, map complex logic here later
    }, [filters.budget]);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper for Tab Styles
    const getTabStyle = (tabName) => `
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300
            ${activeTab === tabName
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105'
            : isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
        }
            `;

    // Active Filter Count Calculation
    const activeCount = filters.country.length +
        filters.city.length +
        (filters.budget !== 'All' ? 1 : 0) +
        filters.theme.length +
        (filters.season ? 1 : 0);

    const FilterPill = ({ label, onRemove }) => (
        <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight transition-all border animate-scale-in
                ${isDarkMode
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:scale-105 shadow-lg shadow-indigo-500/5'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                }`}
        >
            <span>{label}</span>
            <X className="w-3 h-3 opacity-60 hover:opacity-100" />
        </button>
    );

    // Use all available countries from constant to ensure consistency with Create Trip
    const uniqueCountryCodes = Object.keys(COUNTRIES_DATA);

    return (
        <div className="relative flex items-center gap-2 z-[60]" ref={popoverRef}>
            {/* Active Filter Pills (Visible Outside) */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[300px]">
                {filters.country.map(c => (
                    <FilterPill
                        key={c}
                        label={getCountryName(c)}
                        onRemove={() => onFilterChange('country', c)}
                    />
                ))}
                {filters.city.map(c => (
                    <FilterPill
                        key={c}
                        label={getLocalizedCityName(c, currentLang)}
                        onRemove={() => onFilterChange('city', c)}
                    />
                ))}

                {filters.budget !== 'All' && (
                    <FilterPill
                        label={t(`filter_menu.budget_level.${filters.budget}`) || filters.budget}
                        onRemove={() => onFilterChange('budget', 'All')}
                    />
                )}
                {filters.theme.map(theme => (
                    <FilterPill
                        key={theme}
                        label={t('themes.' + theme)}
                        onRemove={() => onFilterChange('theme', theme)}
                    />
                ))}
            </div>

            {/* Main Trigger Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 border
                    ${isMenuOpen || activeCount > 0
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/20 scale-105'
                        : `bg-slate-900/40 border-white/5 ${isDarkMode ? 'text-indigo-400' : 'text-gray-700'} hover:bg-slate-900/60 backdrop-blur-xl`
                    }
                `}
            >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{t('filter_menu.more_filters') || 'Filters'}</span>
                {activeCount > 0 && (
                    <span className="flex items-center justify-center bg-white text-indigo-600 w-5 h-5 rounded-full text-[10px] font-black shadow-sm">
                        {activeCount}
                    </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Tabbed Popover Menu */}
            {isMenuOpen && (
                <div className={`absolute top-full mt-3 right-0 z-[70] w-80 sm:w-96 rounded-2xl shadow-2xl border backdrop-blur-3xl animate-scale-in origin-top-right overflow-hidden shadow-black/60
                    ${isDarkMode ? 'bg-slate-900/90 border-white/5' : 'bg-white/95 border-gray-200'}
                `}>
                    {/* Header / Tabs */}
                    <div className={`grid grid-cols-4 gap-1 p-1.5 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <button onClick={() => setActiveTab('destination')} className={getTabStyle('destination')}>
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate">{t('filter_menu.destination') || 'Dest'}</span>
                        </button>
                        <button onClick={() => setActiveTab('budget')} className={getTabStyle('budget')}>
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="truncate">{t('filter_menu.budget') || 'Budget'}</span>
                        </button>
                        <button onClick={() => setActiveTab('themes')} className={getTabStyle('themes')}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="truncate">{t('filter_menu.themes') || 'Themes'}</span>
                        </button>
                        <button onClick={() => setActiveTab('season')} className={getTabStyle('season')}>
                            <Sun className="w-3.5 h-3.5" />
                            <span className="truncate">{t('filter_menu.season') || 'Season'}</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">

                        {/* 1. Destination Content */}
                        {activeTab === 'destination' && (
                            <div className="space-y-4 animate-fade-in">
                                {Object.entries(
                                    uniqueCountryCodes.reduce((acc, code) => {
                                        const continent = getContinent(code);
                                        if (!acc[continent]) acc[continent] = [];
                                        acc[continent].push(code);
                                        return acc;
                                    }, {})
                                ).sort(([a], [b]) => {
                                    const order = ['Asia', 'Europe', 'North America', 'Oceania', 'Global', 'Other'];
                                    return order.indexOf(a) - order.indexOf(b);
                                }).map(([continent, codes]) => {
                                    const sortedCodes = [...codes].sort((a, b) => {
                                        // Handle both Code and Name for Hot sorting
                                        const nameA = COUNTRY_CODE_MAP[a] || a;
                                        const nameB = COUNTRY_CODE_MAP[b] || b;
                                        const hotA = COUNTRIES_DATA[nameA]?.hot || 0;
                                        const hotB = COUNTRIES_DATA[nameB]?.hot || 0;
                                        return hotB - hotA;
                                    });

                                    const isExpanded = expandedContinents.includes(continent);
                                    const visibleCodes = isExpanded ? sortedCodes : sortedCodes.slice(0, 10);
                                    const remainingCount = sortedCodes.length - 10;

                                    return (
                                        <div key={continent} className="mb-5 last:mb-0">
                                            <h4 className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-max mb-3 tracking-widest">
                                                {t(`continents.${continent}`) || continent}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {visibleCodes.map(code => (
                                                    <button
                                                        key={code}
                                                        onClick={() => onFilterChange('country', code)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border animate-scale-in
                                                            ${filters.country.includes(code)
                                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                                                                : `border-white/5 ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                                                            }`}
                                                    >
                                                        {getCountryName(code)}
                                                    </button>
                                                ))}

                                                {remainingCount > 0 && !isExpanded && (
                                                    <button
                                                        onClick={() => toggleContinent(continent)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-dashed
                                                            ${isDarkMode ? 'border-white/10 text-indigo-400 hover:bg-white/10' : 'border-gray-300 text-indigo-600 hover:bg-gray-50'}`}
                                                    >
                                                        {t('filter_menu.show_more', { count: remainingCount }) || `+${remainingCount} More`}
                                                    </button>
                                                )}

                                                {isExpanded && sortedCodes.length > 10 && (
                                                    <button
                                                        onClick={() => toggleContinent(continent)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-dashed
                                                            ${isDarkMode ? 'border-white/10 text-slate-500 hover:bg-white/10' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        {t('filter_menu.show_less') || 'Show Less'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filters.country.length > 0 && (
                                    <div className="animate-slide-up bg-slate-800/20 p-3 rounded-2xl border border-white/5">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-indigo-400" />
                                            {t('filter_menu.selected_countries') || 'Selected Areas'}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cities.map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => onFilterChange('city', city)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 animate-scale-in
                                                        ${filters.city.includes(city)
                                                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                                            : `border-white/5 ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                                                        }`}
                                                >
                                                    {getLocalizedCityName(city, currentLang)}
                                                    {filters.city.includes(city) && <Check className="w-3 h-3 animate-pulse" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. Budget Content (Range Slider) */}
                        {activeTab === 'budget' && (
                            <div className="space-y-6 animate-fade-in px-2 py-2">
                                <div className="text-center space-y-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">{t('filter_menu.price_range', { currency: 'HKD' }) || 'Price Scope'}</div>
                                    <div className="text-3xl font-black text-white drop-shadow-lg shadow-indigo-500/50">
                                        <span className="text-indigo-500 text-xl mr-1">$</span>
                                        {budgetRange[0].toLocaleString()} - {budgetRange[1] === MAX_BUDGET ? '50,000+' : budgetRange[1].toLocaleString()}
                                    </div>
                                </div>

                                {/* Slider UI Refined */}
                                <div className="relative h-2.5 bg-slate-800 rounded-full mt-6 shadow-inner">
                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_BUDGET}
                                        step="1000"
                                        value={budgetRange[1]}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setBudgetRange([0, val]);
                                        }}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-lg shadow-indigo-500/20"
                                        style={{ width: `${(budgetRange[1] / MAX_BUDGET) * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute h-5 w-5 bg-white rounded-full shadow-xl top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-4 border-indigo-600 transition-transform active:scale-125 hover:scale-110 z-10"
                                        style={{ left: `${(budgetRange[1] / MAX_BUDGET) * 100}%` }}
                                    ></div>
                                </div>

                                {/* Preset Grid */}
                                <div className="grid grid-cols-3 gap-3 mt-6">
                                    {[
                                        { label: 'Budget', max: 5000, icon: '🎫' },
                                        { label: 'Standard', max: 15000, icon: '🏨' },
                                        { label: 'Luxury', max: 50000, icon: '💎' }
                                    ].map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                setBudgetRange([0, preset.max]);
                                                const val = preset.max <= 5000 ? 'Cheap' : preset.max <= 15000 ? 'Moderate' : 'Luxury';
                                                onFilterChange('budget', val);
                                            }}
                                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group
                                                ${(filters.budget === 'Cheap' && preset.max === 5000) ||
                                                    (filters.budget === 'Moderate' && preset.max === 15000) ||
                                                    (filters.budget === 'Luxury' && preset.max === 50000)
                                                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl shadow-indigo-600/20 scale-105'
                                                    : `border-white/5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:scale-105`
                                                }`}
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-tight">{t(`filter_menu.budget_level.${preset.label}`) || preset.label}</span>
                                            <span className="text-[9px] font-bold opacity-60 font-mono">${preset.max / 1000}k</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Themes Content */}
                        {activeTab === 'themes' && (
                            <div className="animate-fade-in space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-max mb-4 tracking-widest">{t('filter_menu.rating_select') || 'Rating'}</h4>
                                    <div className="flex gap-3">
                                        {[4.0, 4.5, 4.8].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => onFilterChange('rating', filters.rating === r ? 'All' : r)}
                                                className={`px-4 py-2 rounded-xl border text-sm font-black transition-all flex items-center gap-2
                                                    ${filters.rating === r
                                                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/10 scale-105'
                                                        : `border-white/5 bg-slate-800/40 hover:bg-slate-800 text-slate-300`
                                                    }`}
                                            >
                                                <span className="text-yellow-400">★</span> <span>{r}+</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-max mb-4 tracking-widest">{t('filter_menu.theme_select') || 'Style'}</h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {themes.map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => onFilterChange('theme', theme)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border animate-scale-in flex items-center gap-1.5
                                                    ${filters.theme.includes(theme)
                                                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/20 scale-105'
                                                        : `border-white/5 bg-slate-800/40 hover:bg-slate-800 text-slate-300`
                                                    }`}
                                            >
                                                {theme === 'All' ? t('common.all') : t('themes.' + theme)}
                                                {filters.theme.includes(theme) && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Season Content */}
                        {activeTab === 'season' && (
                            <div className="animate-fade-in p-2">
                                <h4 className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-max mb-4 tracking-widest">{t('filter_menu.season') || 'Season'}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['spring', 'summer', 'autumn', 'winter'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => onFilterChange('season', filters.season === s ? null : s)}
                                            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 group
                                                ${filters.season === s
                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-xl shadow-indigo-500/20 scale-105'
                                                    : `border-white/5 ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-gray-100/50 hover:bg-gray-100 text-gray-600'} hover:scale-105`
                                                }`}
                                        >
                                            <span className="text-3xl filter drop-shadow-md">{
                                                s === 'spring' ? '🌸' : s === 'summer' ? '☀️' : s === 'autumn' ? '🍁' : '❄️'
                                            }</span>
                                            <span className="text-sm font-bold mt-1">{t(`filter_menu.seasons.${s}`)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className={`p-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-slate-900/80 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'border-gray-100 bg-gray-50/50'}`}>
                        {(filters.country.length > 0 || filters.budget !== 'All' || filters.theme.length > 0 || filters.season) ? (
                            <button
                                onClick={() => {
                                    onFilterChange('clear');
                                    setIsMenuOpen(false);
                                    setBudgetRange([0, MAX_BUDGET]);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                {t('filter_menu.clear')}
                            </button>
                        ) : <div />}


                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className={`px-8 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-xl
                                ${isDarkMode ? 'bg-white text-slate-900 hover:bg-indigo-50 shadow-white/5 hover:scale-105' : 'bg-black text-white hover:bg-gray-800'}`}
                        >
                            {t('common.close') || 'Done'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
