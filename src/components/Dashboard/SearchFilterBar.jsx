import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchFilterBar = ({ onSearch, onSort, onFilter, currentSort, currentFilter }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, onSearch]);

    return (
        <div className="flex flex-col md:flex-row gap-4 lg:items-center justify-between mb-6 animate-fade-in-up">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-indigo-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-12 py-2.5 rounded-xl leading-5 
                             bg-slate-900/40 dark:bg-slate-900/60 
                             border border-white/5 
                             text-gray-900 dark:text-gray-100 placeholder-gray-500 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 
                             transition-all backdrop-blur-2xl shadow-xl hover:bg-slate-900/50"
                    placeholder={t('dashboard.search_placeholder') || '搜尋行程名稱、地點...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-40">
                    <span className="text-[10px] font-black border border-current px-1 rounded-md text-slate-400">⌘ K</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={currentSort}
                        onChange={(e) => onSort(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2.5 rounded-xl 
                                 bg-slate-900/40 dark:bg-slate-900/60 
                                 border border-white/5 
                                 text-sm font-bold text-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                                 cursor-pointer hover:bg-slate-900/50 transition-colors backdrop-blur-2xl shadow-xl"
                    >
                        <option value="nearest">🕒 {t('sort.nearest') || '最近出發'}</option>
                        <option value="date_asc">📅 {t('sort.date_asc') || '日期 ⬆️'}</option>
                        <option value="date_desc">📅 {t('sort.date_desc') || '日期 ⬇️'}</option>
                        <option value="name_asc">🔤 {t('sort.name_asc') || '名稱 A-Z'}</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <select
                        value={currentFilter}
                        onChange={(e) => onFilter(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2.5 rounded-xl 
                                 bg-slate-900/40 dark:bg-slate-900/60 
                                 border border-white/5 
                                 text-sm font-bold text-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                                 cursor-pointer hover:bg-slate-900/50 transition-colors backdrop-blur-2xl shadow-xl"
                    >
                        <option value="all">🌐 {t('filter.all') || '全部行程'}</option>
                        <option value="upcoming">🚀 {t('filter.upcoming') || '即將開始'}</option>
                        <option value="active">✈️ {t('filter.active') || '進行中'}</option>
                        <option value="completed">🏁 {t('filter.completed') || '已結束'}</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default SearchFilterBar;

