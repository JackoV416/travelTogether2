/**
 * Aurora Design System Components - V2.0
 * Reusable UI components with Aurora gradient styling
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * AuroraButton - Primary action button with gradient and hover effects
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {boolean} fullWidth - Full width button
 * @param {React.ReactNode} icon - Leading icon
 * @param {React.ReactNode} iconRight - Trailing icon
 */
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
                <span className="transition-transform group-hover:scale-110">{icon}</span>
            ) : null}
            <span>{children}</span>
            {iconRight && !loading && (
                <span className="transition-all group-hover:translate-x-0.5">{iconRight}</span>
            )}
        </button>
    );
};

/**
 * FloatingCard - Elevated card with hover lift effect
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {boolean} hover - Enable hover lift effect
 * @param {boolean} glow - Show aurora glow on hover
 * @param {string} glowColor - Custom glow color class
 */
export const FloatingCard = ({
    children,
    padding = 'md',
    hover = true,
    glow = false,
    glowColor = 'from-violet-500/10 via-indigo-500/10 to-cyan-500/10',
    className = '',
    ...props
}) => {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    };

    return (
        <div
            className={`
                relative overflow-hidden
                bg-slate-900/50 dark:bg-slate-900/60
                border border-white/5 hover:border-indigo-500/20
                rounded-3xl backdrop-blur-xl
                shadow-lg hover:shadow-xl
                transition-all duration-500
                ${hover ? 'hover:-translate-y-1' : ''}
                ${paddingStyles[padding]}
                ${className}
            `}
            {...props}
        >
            {glow && (
                <div className={`
                    absolute inset-0 bg-gradient-to-br ${glowColor}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500
                    pointer-events-none
                `} />
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
};

/**
 * AuroraGradientText - Text with aurora gradient
 * @param {string} as - HTML element type
 */
export const AuroraGradientText = ({
    children,
    as: Component = 'span',
    className = '',
    ...props
}) => {
    return (
        <Component
            className={`
                bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400
                bg-clip-text text-transparent
                ${className}
            `}
            {...props}
        >
            {children}
        </Component>
    );
};

/**
 * AuroraBadge - Small badge/tag with aurora styling
 * @param {string} variant - 'default' | 'success' | 'warning' | 'error' | 'info'
 */
export const AuroraBadge = ({
    children,
    variant = 'default',
    icon,
    className = '',
    ...props
}) => {
    const variantStyles = {
        default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                px-3 py-1 rounded-full
                text-xs font-bold uppercase tracking-wider
                border backdrop-blur-sm
                ${variantStyles[variant]}
                ${className}
            `}
            {...props}
        >
            {icon && <span className="w-3.5 h-3.5">{icon}</span>}
            {children}
        </span>
    );
};

/**
 * AuroraInput - Text input with aurora focus styling
 */
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

/**
 * AuroraGlow - Decorative aurora glow background element
 * @param {string} position - 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
 * @param {string} color - 'violet' | 'indigo' | 'cyan' | 'mixed'
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 */
export const AuroraGlow = ({
    position = 'top-left',
    color = 'mixed',
    size = 'md',
    className = '',
}) => {
    const positionStyles = {
        'top-left': 'top-[-20%] left-[-15%]',
        'top-right': 'top-[-20%] right-[-15%]',
        'bottom-left': 'bottom-[-20%] left-[-15%]',
        'bottom-right': 'bottom-[-20%] right-[-15%]',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    const colorStyles = {
        violet: 'from-violet-500/20 to-transparent',
        indigo: 'from-indigo-500/20 to-transparent',
        cyan: 'from-cyan-500/20 to-transparent',
        mixed: 'from-violet-500/15 via-indigo-500/15 to-cyan-500/10',
    };

    const sizeStyles = {
        sm: 'w-[30%] h-[30%]',
        md: 'w-[50%] h-[50%]',
        lg: 'w-[70%] h-[70%]',
        xl: 'w-[90%] h-[90%]',
    };

    return (
        <div
            className={`
                absolute ${positionStyles[position]}
                ${sizeStyles[size]}
                bg-gradient-to-br ${colorStyles[color]}
                blur-[120px] rounded-full
                pointer-events-none
                animate-pulse
                ${className}
            `}
            style={{ animationDuration: '6s' }}
        />
    );
};

/**
 * AuroraDivider - Gradient divider line
 */
export const AuroraDivider = ({ className = '' }) => (
    <div
        className={`
            h-px w-full
            bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent
            ${className}
        `}
    />
);

/**
 * AuroraSelect - Select input with aurora styling
 */
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

/**
 * AuroraModal - Glassmorphism modal with enter/exit animations
 * @param {boolean} isOpen - Control visibility
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 */
export const AuroraModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
    footer,
}) => {
    const [visible, setVisible] = React.useState(false);
    const [animating, setAnimating] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setVisible(true);
            requestAnimationFrame(() => setAnimating(true));
        } else {
            setAnimating(false);
            const timer = setTimeout(() => setVisible(false), 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible) return null;

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-full m-4',
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`
                    relative w-full ${sizeStyles[size]}
                    bg-slate-900/80 border border-white/10
                    shadow-2xl shadow-indigo-500/10
                    rounded-[2rem] overflow-hidden
                    transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${animating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
                    ${className}
                `}
            >
                {/* Aurora Glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="relative px-8 py-6 border-b border-white/5 flex items-center justify-between z-10">
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="relative p-8 z-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="relative px-8 py-6 border-t border-white/5 bg-white/5 z-10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default {
    AuroraButton,
    FloatingCard,
    AuroraGradientText,
    AuroraBadge,
    AuroraInput,
    AuroraGlow,
    AuroraDivider,
    AuroraModal,
    AuroraSelect,
};
