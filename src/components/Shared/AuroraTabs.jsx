import React from 'react';

export const AuroraTabs = ({
    tabs = [],
    activeTab,
    onTabChange,
    className = ''
}) => {
    return (
        <div className={`flex overflow-x-auto scrollbar-hide py-2 px-1 gap-2 ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            relative group flex items-center px-5 py-2.5 rounded-full 
                            text-sm font-bold transition-all duration-300 transform
                            whitespace-nowrap select-none
                            ${isActive
                                ? 'text-white scale-105 shadow-lg shadow-indigo-500/25'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                        `}
                    >
                        {isActive && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 opacity-100" />
                        )}
                        {!isActive && (
                            <div className="absolute inset-0 rounded-full border border-white/5 bg-slate-900/40 backdrop-blur-sm transition-all group-hover:bg-slate-800/60" />
                        )}

                        <div className="relative flex items-center gap-2 z-10">
                            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse-slow' : 'opacity-70'}`} />}
                            <span>{tab.label}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default AuroraTabs;
