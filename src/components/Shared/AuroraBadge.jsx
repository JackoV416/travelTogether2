import React from 'react';

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

    // Filter out non-DOM attributes (e.g., interactive which caused the warning)
    const { interactive, ...domProps } = props;

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
            {...domProps}
        >
            {icon && <span className="w-3.5 h-3.5">{icon}</span>}
            {children}
        </span>
    );
};

export default AuroraBadge;
