import React, { useState } from 'react';
import { Map, Briefcase, Calculator, Menu } from 'lucide-react';


const MobileBottomNav = ({ activeTab, onTabChange, onMoreClick, isDarkMode }) => {
    const navItems = [
        { id: 'itinerary', label: '行程', icon: Map },
        { id: 'packing', label: '執嘢', icon: Briefcase },
        { id: 'budget', label: '預算', icon: Calculator },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t pb-[max(env(safe-area-inset-bottom),12px)] pt-3 transition-all duration-300 ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]`}>
            <div className="flex items-center justify-around px-4">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className="flex flex-col items-center justify-center min-w-[72px] h-12 transition-all active:scale-90 duration-200 relative group"
                        >
                            <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 -translate-y-1' : 'text-gray-400 group-hover:bg-gray-500/10'}`}>
                                <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
                            </div>
                            <span className={`text-[10px] font-black mt-1 transition-all duration-300 uppercase tracking-tighter ${isActive ? 'text-indigo-500 opacity-100' : 'text-gray-500 opacity-50'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}

                {/* More Button */}
                <button
                    onClick={onMoreClick}
                    className="flex flex-col items-center justify-center min-w-[72px] h-12 transition-all active:scale-90 duration-200 relative group"
                >
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${activeTab === 'more' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 -translate-y-1' : 'text-gray-400 group-hover:bg-gray-500/10'}`}>
                        <Menu className="w-6 h-6 stroke-2" />
                    </div>
                    <span className="text-[10px] font-black mt-1 text-gray-400 opacity-60 uppercase tracking-tighter">更多</span>
                </button>
            </div>
        </div>
    );
};

export default MobileBottomNav;
