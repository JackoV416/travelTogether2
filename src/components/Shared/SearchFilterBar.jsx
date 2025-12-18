import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const SearchFilterBar = ({
    searchValue,
    onSearchChange,
    placeholder = "搜尋...",
    filters = [], // Array of { key: string, label: string, options: [{value, label}] }
    activeFilters = {},
    onFilterChange,
    onClearFilters,
    isDarkMode
}) => {

    // Check if any filter is active
    const hasActiveFilters = Object.values(activeFilters).some(val => val !== 'all' && val !== '');

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-4 animate-fade-in">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none"
                    style={{ color: isDarkMode !== false ? '#6b7280' : '#9ca3af' }}
                />
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all text-sm font-medium border shadow-sm"
                    style={{
                        backgroundColor: isDarkMode !== false ? '#1f2937' : '#ffffff',
                        borderColor: isDarkMode !== false ? '#4b5563' : '#e5e7eb',
                        color: isDarkMode !== false ? '#ffffff' : '#111827'
                    }}
                />
                {searchValue && (
                    <button
                        onClick={() => onSearchChange('')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode !== false ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                        <X className="w-3 h-3 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Filters */}
            {filters.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                    {filters.map((filter) => (
                        <div key={filter.key} className="relative group min-w-fit">
                            <select
                                value={activeFilters[filter.key] || 'all'}
                                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                className={`appearance-none pl-3 pr-8 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${activeFilters[filter.key] && activeFilters[filter.key] !== 'all'
                                    ? (isDarkMode ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600')
                                    : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
                                    }`}
                            >
                                <option value="all" className={isDarkMode ? 'bg-gray-900 text-white' : ''}>{filter.label}: 全部</option>
                                {filter.options.map((opt) => (
                                    <option key={opt.value} value={opt.value} className={isDarkMode ? 'bg-gray-900 text-white' : ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <Filter className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${activeFilters[filter.key] && activeFilters[filter.key] !== 'all' ? 'text-indigo-500' : 'text-gray-400'
                                }`} />
                        </div>
                    ))}

                    {/* Clear All Filters Button */}
                    {hasActiveFilters && onClearFilters && (
                        <button
                            onClick={onClearFilters}
                            className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap dark:hover:bg-red-900/20"
                        >
                            清除篩選
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchFilterBar;
