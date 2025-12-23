import React from 'react';
import { MessageCircle, Bot, Sparkles } from 'lucide-react';

const GlobalChatFAB = ({ onClick, isDarkMode, context = 'default' }) => {
    // context: 'trip' | 'default'
    const isTrip = context === 'trip';

    return (
        <button
            onClick={onClick}
            data-tour="jarvis-chat"
            className={`fixed bottom-24 md:bottom-8 right-6 z-[150] group flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden
                ${isDarkMode
                    ? 'bg-indigo-600/90 hover:bg-indigo-500 border border-white/10'
                    : 'bg-indigo-600 hover:bg-indigo-700 border border-black/5'}
                backdrop-blur-xl shadow-indigo-500/40`}
            title={isTrip ? "行程聊天 (Trip Chat)" : "Jarvis 支援"}
        >
            {/* Pulsing Background Glow */}
            <div className={`absolute inset-0 bg-indigo-400 opacity-20 blur-xl animate-pulse-slow group-hover:opacity-40 transition-opacity`} />

            {/* Icon Layer */}
            <div className="relative flex items-center justify-center">
                {isTrip ? (
                    <MessageCircle className="w-6 h-6 text-white animate-pulse-slow" />
                ) : (
                    <div className="relative">
                        <Bot className="w-6 h-6 text-white" />
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-indigo-200 animate-bounce" />
                    </div>
                )}
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        </button>
    );
};

export default GlobalChatFAB;
