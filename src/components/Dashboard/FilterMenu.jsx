import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, X, Globe, Wallet, Sparkles, Filter, MapPin } from 'lucide-react';
import { getLocalizedCountryName, getLocalizedCityName } from '../../utils/tripUtils'; // Added getLocalizedCityName
import { COUNTRY_CODE_MAP, COUNTRIES_DATA } from '../../constants/countries';

// ... existing imports ...

// Helper function outside component or inside
const getContinent = (code) => {
    if (code === 'All') return 'All';
    const fullName = COUNTRY_CODE_MAP[code];
    if (!fullName) return 'Other';
    return COUNTRIES_DATA[fullName]?.continent || 'Other';
};

/**
            * FilterMenu - Premium Trip.com style filter bar
            * Consolidated into a single "Filters" button with a tabbed popover menu.
            * Includes Active Filter Pills for quick visibility and removal.
            *
            * V1.3.11 Updates:
            * - Fixed Z-index issue (blocked by posts)
            * - Added Budget Range Slider (Trip.com style)
 * - Improved Country/City Localization (JP -> Japan)
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('destination'); // 'destination', 'budget', 'themes'
    const popoverRef = useRef(null);
    const currentLang = i18n.language;

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
            setBudgetRange([0, MAX_BUDGET]);
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
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${activeTab === tabName
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
            : isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'
        }
            `;

    // Calculate active filter count
    const activeCount = [
        filters.country.length > 0,
        filters.city.length > 0,
        filters.budget !== 'All',
        filters.theme.length > 0
    ].filter(Boolean).length;

    // Helper to resolve country name from code (JP -> Japan (日本))
    const getFullCountryName = (code) => {
        if (code === 'All') return t('common.all');
        const fullName = COUNTRY_CODE_MAP[code] || code;
        return getLocalizedCountryName(fullName, currentLang);
    };

    // Helper to render pill
    const FilterPill = ({ label, onRemove }) => (
        <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border animate-scale-in
                ${isDarkMode
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                }`}
        >
            <span>{label}</span>
            <X className="w-3 h-3 opacity-60 hover:opacity-100" />
        </button>
    );

    // Initial Country List (unique codes)
    const uniqueCountryCodes = [...new Set(countries)];

    return (
        <div className="relative flex items-center gap-2 z-[60]" ref={popoverRef}> {/* High Z-Index */}
            {/* Active Filter Pills (Visible Outside) */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[300px]">
                {filters.country.map(c => (
                    <FilterPill
                        key={c}
                        label={getFullCountryName(c)}
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
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border
                    ${isMenuOpen || activeCount > 0
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-700`
                    }
                `}
            >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{t('filter_menu.more_filters') || 'Filters'}</span>
                {activeCount > 0 && (
                    <span className="flex items-center justify-center bg-white text-indigo-600 w-5 h-5 rounded-full text-xs font-bold shadow-sm">
                        {activeCount}
                    </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Tabbed Popover Menu */}
            {isMenuOpen && (
                <div className={`absolute top-full mt-2 right-0 z-[70] w-80 sm:w-96 rounded-2xl shadow-2xl border backdrop-blur-xl animate-scale-in origin-top-right overflow-hidden
                    ${isDarkMode ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200'}
                `}>
                    {/* Header / Tabs */}
                    <div className={`flex items-center p-2 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                        <button onClick={() => setActiveTab('destination')} className={`${getTabStyle('destination')} flex-1 justify-center`}>
                            <Globe className="w-3.5 h-3.5" />
                            {t('filter_menu.destination') || 'Dest'}
                        </button>
                        <button onClick={() => setActiveTab('budget')} className={`${getTabStyle('budget')} flex-1 justify-center`}>
                            <Wallet className="w-3.5 h-3.5" />
                            {t('filter_menu.budget') || 'Budget'}
                        </button>
                        <button onClick={() => setActiveTab('themes')} className={`${getTabStyle('themes')} flex-1 justify-center`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            {t('filter_menu.themes') || 'Themes'}
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">

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
                                    // Custom sort order
                                    const order = ['Asia', 'Europe', 'North America', 'Oceania', 'Global', 'Other'];
                                    return order.indexOf(a) - order.indexOf(b);
                                }).map(([continent, codes]) => {
                                    // Sort by hot score
                                    const sortedCodes = [...codes].sort((a, b) => {
                                        const hotA = COUNTRIES_DATA[COUNTRY_CODE_MAP[a]]?.hot || 0;
                                        const hotB = COUNTRIES_DATA[COUNTRY_CODE_MAP[b]]?.hot || 0;
                                        return hotB - hotA;
                                    });

                                    const isExpanded = expandedContinents.includes(continent);
                                    const visibleCodes = isExpanded ? sortedCodes : sortedCodes.slice(0, 10);
                                    const remainingCount = sortedCodes.length - 10;

                                    return (
                                        <div key={continent} className="mb-4 last:mb-0">
                                            <h4 className="text-xs font-bold uppercase opacity-50 mb-2 tracking-wider sticky top-0 bg-inherit z-10">
                                                {t(`continents.${continent}`) || continent}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {visibleCodes.map(code => (
                                                    <button
                                                        key={code}
                                                        onClick={() => onFilterChange('country', code)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border animate-scale-in
                                                            ${filters.country.includes(code)
                                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                                                : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                                                            }`}
                                                    >
                                                        {getFullCountryName(code)}
                                                    </button>
                                                ))}

                                                {remainingCount > 0 && !isExpanded && (
                                                    <button
                                                        onClick={() => toggleContinent(continent)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-dashed
                                                            ${isDarkMode ? 'border-white/20 text-indigo-400 hover:bg-white/5' : 'border-gray-300 text-indigo-600 hover:bg-gray-50'}`}
                                                    >
                                                        + {t('filter_menu.show_more', { count: remainingCount }) || `${remainingCount} More`}
                                                    </button>
                                                )}

                                                {isExpanded && sortedCodes.length > 10 && (
                                                    <button
                                                        onClick={() => toggleContinent(continent)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-dashed
                                                            ${isDarkMode ? 'border-white/20 text-gray-400 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        {t('filter_menu.show_less') || 'Show Less'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filters.country.length > 0 && (
                                    <div className="animate-slide-up">
                                        <div className="h-px bg-current opacity-10 mb-3" />
                                        <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            {t('filter_menu.selected_countries') || 'Selected Countries'}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {cities.map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => onFilterChange('city', city)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 animate-scale-in
                                                        ${filters.city.includes(city)
                                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                                            : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                                                        }`}
                                                >
                                                    {getLocalizedCityName(city, currentLang)}
                                                    {filters.city.includes(city) && <Check className="w-3 h-3" />}
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
                                <div className="text-center space-y-1">
                                    <div className="text-sm opacity-60">{t('filter_menu.price_range', { currency: 'HKD' }) || 'Price Range (HKD)'}</div>
                                    <div className="text-2xl font-bold font-mono text-indigo-500">
                                        ${budgetRange[0].toLocaleString()} - ${budgetRange[1] === MAX_BUDGET ? '50,000+' : budgetRange[1].toLocaleString()}
                                    </div>
                                </div>

                                {/* Range Slider UI */}
                                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4">
                                    {/* Simple Range Implementation for now */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_BUDGET}
                                        step="1000"
                                        value={budgetRange[1]}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setBudgetRange([0, val]); // Currently simplify to 0 - Max
                                        }}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div
                                        className="absolute h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${(budgetRange[1] / MAX_BUDGET) * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute h-4 w-4 bg-indigo-600 rounded-full shadow-md top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white dark:border-gray-900"
                                        style={{ left: `${(budgetRange[1] / MAX_BUDGET) * 100}%` }}
                                    ></div>
                                </div>

                                {/* Preset Buttons */}
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {[
                                        { label: 'Budget', max: 5000 },
                                        { label: 'Standard', max: 15000 },
                                        { label: 'Luxury', max: 50000 }
                                    ].map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                setBudgetRange([0, preset.max]);
                                                // Map range to preset value strings for backward compatibility if needed, 
                                                // or pass actual range up. For now sticking to preset logic mapping:
                                                const val = preset.max <= 5000 ? 'Cheap' : preset.max <= 15000 ? 'Moderate' : 'Luxury';
                                                onFilterChange('budget', val);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors
                                                ${(filters.budget === 'Cheap' && preset.max === 5000) ||
                                                    (filters.budget === 'Moderate' && preset.max === 15000) ||
                                                    (filters.budget === 'Luxury' && preset.max === 50000)
                                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                                    : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`
                                                }`}
                                        >
                                            {t(`filter_menu.budget_level.${preset.label}`) || preset.label}
                                            <div className="font-normal opacity-60 mt-0.5">&lt; ${preset.max.toLocaleString()}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Themes Content */}
                        {activeTab === 'themes' && (
                            <div className="animate-fade-in relative">
                                {/* Rating Filter (New) */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider">{t('filter_menu.rating_select') || 'Rating'}</h4>
                                    <div className="flex gap-2">
                                        {[4.0, 4.5, 4.8].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => onFilterChange('rating', filters.rating === r ? 'All' : r)}
                                                className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors flex items-center gap-1
                                                    ${filters.rating === r
                                                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500'
                                                        : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`
                                                    }`}
                                            >
                                                <span>★ {r}+</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider">{t('filter_menu.theme_select') || 'Select Themes'}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {themes.map(theme => (
                                        <button
                                            key={theme}
                                            onClick={() => onFilterChange('theme', theme)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border animate-scale-in flex items-center gap-1.5
                                                ${filters.theme.includes(theme)
                                                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                                                    : `border-transparent ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`
                                                }`}
                                        >
                                            {theme === 'All' ? t('common.all') : t('themes.' + theme)}
                                            {filters.theme.includes(theme) && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className={`p-3 border-t flex justify-between items-center ${isDarkMode ? 'border-white/10 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                        {(filters.country !== 'All' || filters.budget !== 'All' || filters.theme !== 'All') ? (
                            <button
                                onClick={() => {
                                    onFilterChange('clear');
                                    setIsMenuOpen(false);
                                    setBudgetRange([0, MAX_BUDGET]);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                {t('filter_menu.clear')}
                            </button>
                        ) : <div></div>}


                        <div className="flex gap-2">
                            {/* Apply Button specifically for Slider if needed, but we auto-apply for now or rely on specific action. 
                                 Actually for slider usually a confirmation is better UX, but fitting into existing flow: */}
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                            >
                                {t('common.close') || 'Done'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterMenu;
