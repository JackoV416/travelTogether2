import React, { useState, useEffect } from 'react';

export const AuroraModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
    footer,
}) => {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
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

export default AuroraModal;
