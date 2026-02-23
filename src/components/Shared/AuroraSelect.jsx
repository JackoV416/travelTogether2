import React from 'react';

export const AuroraSelect = ({
    label,
    options = [],
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-bold text-indigo-300 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`
                        w-full px-4 py-3 appearance-none
                        bg-slate-800/50 border border-white/10
                        rounded-xl text-white placeholder-slate-500
                        focus:outline-none focus:border-indigo-500/50
                        focus:ring-2 focus:ring-indigo-500/20
                        transition-all duration-300 cursor-pointer
                        hover:bg-slate-800/80
                        ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}
        </div>
    );
};

export default AuroraSelect;
