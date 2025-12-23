import React from 'react';
import { Bot } from 'lucide-react';
import { JARVIS_VERSION } from '../../constants/appData';

const JarvisLogo = ({ size = 'md', className = '', showText = true }) => {
    // Size variants
    const sizes = {
        sm: {
            container: 'w-8 h-8',
            icon: 'w-4 h-4',
            title: 'text-[10px]',
            ver: 'text-[6px]',
            gap: 'gap-1.5'
        },
        md: {
            container: 'w-10 h-10',
            icon: 'w-5 h-5',
            title: 'text-xs',
            ver: 'text-[9px]',
            gap: 'gap-2'
        },
        lg: {
            container: 'w-16 h-16',
            icon: 'w-8 h-8',
            title: 'text-xl',
            ver: 'text-xs',
            gap: 'gap-3'
        }
    };

    const s = sizes[size] || sizes.md;

    return (
        <div className={`flex items-center ${s.gap} ${className}`}>
            <div className="relative">
                <div className={`${s.container} rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20" />
                    <Bot className={`${s.icon} text-white relative z-10`} />
                </div>
                {/* Online Indicator */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            {showText && (
                <div className="flex flex-col">
                    <h3 className={`font-black tracking-widest uppercase leading-none text-white font-['Inter'] ${s.title}`}>
                        JARVIS AI
                    </h3>
                    <p className={`font-bold opacity-40 uppercase tracking-tight text-white ${s.ver}`}>
                        VER {JARVIS_VERSION}
                    </p>
                </div>
            )}
        </div>
    );
};

export default JarvisLogo;
