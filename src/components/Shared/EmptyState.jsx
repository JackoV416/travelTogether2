import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    isDarkMode
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-dashed transition-all animate-fade-in ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className={`p-6 rounded-full mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                {Icon ? (
                    <Icon className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                ) : (
                    <Search className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                )}
            </div>

            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <p className={`max-w-xs mb-8 text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>

            <div className="flex flex-col sm:flex-row gap-3">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {actionLabel}
                    </button>
                )}

                {secondaryActionLabel && onSecondaryAction && (
                    <button
                        onClick={onSecondaryAction}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'}`}
                    >
                        {secondaryActionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
