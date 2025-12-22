import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';

const SearchFilterBar = ({ onSearch, onSort, onFilter, currentSort, currentFilter }) => {
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
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                    placeholder="搜尋行程名稱、地點..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={currentSort}
                        onChange={(e) => onSort(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <option value="nearest">🕒 最近出發 (默認)</option>
                        <option value="date_asc">📅 日期 (舊→新)</option>
                        <option value="date_desc">📅 日期 (新→舊)</option>
                        <option value="name_asc">🔤 名稱 (A-Z)</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <select
                        value={currentFilter}
                        onChange={(e) => onFilter(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <option value="all">🌐 全部行程</option>
                        <option value="upcoming">🚀 即將開始</option>
                        <option value="active">✈️ 進行中</option>
                        <option value="completed">🏁 已結束</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>
        </div>
    );
};

export default SearchFilterBar;
