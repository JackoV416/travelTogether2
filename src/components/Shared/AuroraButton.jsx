import React from 'react';
import { Loader2 } from 'lucide-react';

export const AuroraButton = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconRight,
    className = '',
    ...props
}) => {
    const baseStyles = `
        relative inline-flex items-center justify-center gap-2.5
        font-bold rounded-full transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        active:scale-[0.98]
    `;

    const sizeStyles = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        xl: 'px-10 py-5 text-lg',
    };

    const variantStyles = {
        primary: `
            bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600
            hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-500
            text-white shadow-xl shadow-indigo-600/30
            hover:shadow-indigo-500/40 hover:-translate-y-0.5
        `,
        secondary: `
            bg-slate-800/60 border border-white/10
            hover:bg-slate-700/60 hover:border-indigo-500/30
            text-slate-200 hover:text-white
            backdrop-blur-xl
        `,
        ghost: `
            bg-transparent hover:bg-indigo-500/10
            text-slate-400 hover:text-indigo-400
        `,
        outline: `
            bg-transparent border-2 border-indigo-500/50
            hover:border-indigo-400 hover:bg-indigo-500/10
            text-indigo-400 hover:text-indigo-300
        `,
    };

    return (
        <button
            className={`
                ${baseStyles}
                ${sizeStyles[size]}
                ${variantStyles[variant]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : icon ? (
                <span className="transition-transform group-hover:scale-110">
                    {/* Handle both Element (node) and Component (func) */}
                    {React.isValidElement(icon) ? icon : React.createElement(icon, { className: "w-4 h-4" })}
                </span>
            ) : null}
            <span>{children}</span>
            {iconRight && !loading && (
                <span className="transition-all group-hover:translate-x-0.5">
                    {React.isValidElement(iconRight) ? iconRight : React.createElement(iconRight, { className: "w-4 h-4" })}
                </span>
            )}
        </button>
    );
};

export default AuroraButton;
