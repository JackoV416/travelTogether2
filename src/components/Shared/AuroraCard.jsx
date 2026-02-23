import React from 'react';

// Simplified AuroraCard to rule out complex issues
export const AuroraCard = ({ children, className = '', noPadding = false, ...props }) => {
    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl
                bg-slate-900/60 backdrop-blur-xl
                border border-white/10 shadow-2xl
                ${!noPadding ? 'p-6' : ''}
                ${className}
            `}
            {...props}
        >
            {/* Subtle Gradient Overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default AuroraCard;
