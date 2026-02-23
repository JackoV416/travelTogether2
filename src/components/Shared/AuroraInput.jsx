import React from 'react';

export const AuroraInput = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-bold text-slate-300">
                    {label}
                </label>
            )}
            <input
                className={`
                    w-full px-4 py-3
                    bg-slate-800/50 border border-white/10
                    rounded-xl text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500/50
                    focus:ring-2 focus:ring-indigo-500/20
                    transition-all duration-300
                    ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}
        </div>
    );
};

export default AuroraInput;
