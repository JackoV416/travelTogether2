import React from 'react';


/**
 * EmptyState
 * A reusable component to handle "no data" situations with a premium look.
 * @param {LucideIcon} icon - The Lucide icon component to display
 * @param {string} title - Main title
 * @param {string} description - Supporting text
 * @param {Object} action - Optional { label, onClick, icon } for a CTA button
 * @param {string} className - Additional classes for the container
 */
const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    isDarkMode,
    mini = false,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${mini ? 'p-6' : 'p-12'} text-center rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50/30'} ${className}`}>
            {Icon && (
                <div className={`${mini ? 'w-12 h-12 mb-3' : 'w-20 h-20 mb-6'} rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'} flex items-center justify-center animate-float`}>
                    <Icon className={`${mini ? 'w-6 h-6' : 'w-10 h-10'} ${isDarkMode ? 'text-indigo-400/80' : 'text-indigo-500/60'}`} />
                </div>
            )}

            <h3 className={`font-bold ${mini ? 'text-sm mb-1' : 'text-xl mb-2'} ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {title}
            </h3>

            <p className={`${mini ? 'text-[10px] mb-4' : 'text-gray-500 mb-8 max-w-sm'} leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className={`flex items-center gap-2 ${mini ? 'px-4 py-1.5 text-xs rounded-xl' : 'px-6 py-3 rounded-2xl'} bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group`}
                >
                    {action.icon && <action.icon className={`${mini ? 'w-3 h-3' : 'w-4 h-4'} group-hover:rotate-12 transition-transform`} />}
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
