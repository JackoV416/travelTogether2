import React, { useState } from 'react';
import { Map, Briefcase, Calculator, Menu, FolderOpen, Settings, Info } from 'lucide-react';

const BottomNav = ({ view, setView, onOpenMore, isDarkMode }) => {
    // Only visible on mobile/tablet (hidden on md and up)
    // We heavily rely on Tailwind 'md:hidden'

    // Mapping of main tabs
    const tabs = [
        { id: 'itinerary', label: '行程', icon: Map, viewId: 'detail' }, // detail usually defaults to itinerary tab
        { id: 'packing', label: '執嘢', icon: Briefcase, viewId: 'detail', subTab: 'packing' },
        { id: 'budget', label: '預算', icon: Calculator, viewId: 'detail', subTab: 'budget' },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t pb-safe-area ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    // Logic to determine active state is complex because 'detail' view has sub-tabs.
                    // But App.jsx manages 'view' state ('dashboard', 'detail').
                    // Sub-tabs (ItineraryTab, PackingTab) are internal state of TripDetailContent usually...
                    // Wait, currently sub-tabs are managed inside TripDetailContent.
                    // To control them from here, we need to lift that state up to App.jsx?
                    // OR we send a signal/event?
                    // The simplest PWA approach:
                    // If we want BottomNav to switch tabs inside TripDetail, TripDetail needs to accept 'activeTab' prop.
                    // Let's assume we will update TripDetailContent to accept an initialTab or activeTab prop.

                    // For now, let's just emit the intent.
                    // formatting: if active, darker/lighter color.

                    // Note: This component assumes we can pass a handler to switch sub-tabs.
                    // Let's assume passed prop 'onTabChange' or similar.
                    // If not simple, we can just navigate to 'detail' and let user switch? 
                    // No, "Thumb-friendly" means direct access.

                    const isActive = view === 'detail' && (
                        // This check needs knowledge of current sub-tab.
                        // We will implement handleTabClick to notify App.
                        true // Placeholder, Logic needs 'currentSubTab' prop
                    );

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)} // This implies setView can handle 'packing', 'budget' shortcuts?
                            // Actually App.jsx 'view' is top level.
                            // We need to implement a mechanism in App.jsx to pass "requestedTab" to TripDetail.
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-indigo-500' : ''}`}
                        >
                            <tab.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} />
                            <span className="text-[10px] font-bold">{tab.label}</span>
                        </button>
                    );
                })}

                {/* More Button */}
                <button
                    onClick={onOpenMore}
                    className="flex flex-col items-center justify-center w-full h-full gap-1"
                >
                    <Menu className="w-6 h-6" />
                    <span className="text-[10px] font-bold">更多</span>
                </button>
            </div>
        </div >
    );
};

// We realized we need 'currentTab' explicitly to show active state and 'onTabChange' to switch.
// Let's rewrite component to accept these.

export default function MobileBottomNav({
    activeTab, // 'itinerary', 'packing', 'budget', etc.
    onTabChange, // function(tabId)
    onMoreClick,
    isDarkMode
}) {
    const navItems = [
        { id: 'itinerary', label: '行程', icon: Map },
        { id: 'packing', label: '執嘢', icon: Briefcase },
        { id: 'budget', label: '預算', icon: Calculator },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t pb-[env(safe-area-inset-bottom)] transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur-md' : 'bg-white/95 border-gray-200 backdrop-blur-md'}`}>
            <div className="flex items-end justify-between px-2 h-16 pb-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-xl transition-all active:scale-95 ${isActive ? 'text-indigo-500' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`relative p-1.5 rounded-full transition-all ${isActive ? 'bg-indigo-500/10' : 'bg-transparent'}`}>
                                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                {isActive && <span className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full animate-pulse"></span>}
                            </div>
                            <span className={`text-[10px] font-bold transition-all ${isActive ? 'scale-110' : 'scale-100'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}

                {/* More Button */}
                <button
                    onClick={onMoreClick}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-xl transition-all active:scale-95 opacity-60 hover:opacity-100 text-gray-500 dark:text-gray-400`}
                >
                    <div className="p-1.5">
                        <Menu className="w-6 h-6 stroke-2" />
                    </div>
                    <span className="text-[10px] font-bold">更多</span>
                </button>
            </div>
        </div>
    );
}
