import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AuroraDrawer = ({
    isOpen,
    onClose,
    title,
    children,
    position = 'right', // 'right', 'left', 'bottom'
    className = '',
    width = 'w-96', // Tailwind width class
}) => {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            requestAnimationFrame(() => setAnimating(true));
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            setAnimating(false);
            const timer = setTimeout(() => {
                setVisible(false);
                document.body.style.overflow = 'unset';
            }, 300); // Match transition duration
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!visible) return null;

    // Position Styles
    const positionStyles = {
        right: `top-0 right-0 h-full border-l border-white/10 ${width} rounded-l-[2rem]`,
        left: `top-0 left-0 h-full border-r border-white/10 ${width} rounded-r-[2rem]`,
        bottom: `bottom-0 left-0 right-0 max-h-[90vh] border-t border-white/10 rounded-t-[2rem]`,
    };

    // Animation Transforms
    const getTransform = () => {
        if (!animating) {
            switch (position) {
                case 'right': return 'translate-x-full';
                case 'left': return '-translate-x-full';
                case 'bottom': return 'translate-y-full';
                default: return 'translate-x-full';
            }
        }
        return 'translate-x-0 translate-y-0';
    };

    return (
        <div className={`fixed inset-0 z-[100]`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div
                className={`
                    absolute ${positionStyles[position]}
                    bg-slate-900/90 backdrop-blur-2xl
                    shadow-2xl shadow-black/50
                    flex flex-col
                    transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
                    ${getTransform()}
                    ${className}
                `}
            >
                {/* Aurora Glow Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="relative px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0 z-10">
                    <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors btn-press"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="relative flex-1 overflow-y-auto px-6 py-6 custom-scrollbar z-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuroraDrawer;
