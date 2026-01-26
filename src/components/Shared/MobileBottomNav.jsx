import React, { useState } from 'react';
import { Map, Briefcase, Calculator, Menu, MessageCircle, Home, User, Compass, Search, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileBottomNav = ({
    activeTab,
    onTabChange,
    onMoreClick,
    onChatClick,
    isDarkMode,
    // New props for view-based navigation
    currentView,
    onViewChange,
    onCreateTrip,
    onSearch,  // For global search/command palette
    friendRequestCount = 0
}) => {
    const { t } = useTranslation();

    // View-based navigation (Dashboard level)
    const viewNavItems = [
        { id: 'explore', label: t('dashboard.explore_community') || '探索社群', icon: Compass },
        { id: 'my_trips', label: t('dashboard.my_trips') || '我的行程', icon: Briefcase },
    ];

    // Tab-based navigation (Trip Detail level - only show when in detail view)
    const tabNavItems = [
        { id: 'itinerary', label: '行程', icon: Map },
        { id: 'packing', label: '執嘢', icon: Briefcase },
        { id: 'chat', label: '閒聊', icon: MessageCircle, isAction: true },
        { id: 'budget', label: '預算', icon: Calculator },
    ];

    // Determine which navigation to show
    const isInDetailView = currentView === 'detail' || currentView === 'tutorial';
    const navItems = isInDetailView ? tabNavItems : viewNavItems;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t pb-[max(env(safe-area-inset-bottom),12px)] pt-3 transition-all duration-300 ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]`}>

            {/* View Toggle (Explore / My Trips) - Show on Dashboard */}
            {!isInDetailView && (
                <div className="flex items-center justify-center px-4 mb-3">
                    <div className={`p-1 rounded-full flex items-center gap-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {viewNavItems.map((item) => {
                            const isActive = currentView === item.id ||
                                (item.id === 'explore' && (currentView === 'dashboard' || currentView === 'explore')) ||
                                (item.id === 'my_trips' && currentView === 'my_trips');

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onViewChange && onViewChange(item.id === 'explore' ? 'dashboard' : item.id)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive
                                        ? 'bg-white dark:bg-gray-700 shadow-md text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Nav Row */}
            <div className="flex items-center justify-around px-4">
                {/* Home Button */}
                <button
                    onClick={() => onViewChange && onViewChange('dashboard')}
                    className="flex flex-col items-center justify-center min-w-[64px] h-12 transition-all active:scale-90 duration-200 relative group"
                >
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${(currentView === 'dashboard' || currentView === 'explore') && !isInDetailView
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 -translate-y-1'
                        : 'text-gray-400 group-hover:bg-gray-500/10'
                        }`}>
                        <Home className="w-6 h-6 stroke-2" />
                    </div>
                    <span className={`text-[10px] font-black mt-1 uppercase tracking-tighter ${(currentView === 'dashboard' || currentView === 'explore') && !isInDetailView ? 'text-indigo-500' : 'text-gray-500 opacity-50'
                        }`}>首頁</span>
                </button>

                {/* Search Button */}
                <button
                    onClick={() => onSearch && onSearch()}
                    className="flex flex-col items-center justify-center min-w-[64px] h-12 transition-all active:scale-90 duration-200 relative group"
                >
                    <div className="relative p-2 rounded-xl transition-all duration-300 text-gray-400 group-hover:bg-gray-500/10">
                        <Search className="w-6 h-6 stroke-2" />
                    </div>
                    <span className="text-[10px] font-black mt-1 text-gray-500 opacity-50 uppercase tracking-tighter">搜尋</span>
                </button>

                {/* Create Trip FAB */}
                <button
                    onClick={onCreateTrip}
                    className="flex flex-col items-center justify-center min-w-[64px] h-12 transition-all active:scale-90 duration-200 relative group -mt-6"
                >
                    <div className="relative p-3 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 transition-all duration-300 hover:bg-indigo-600">
                        <Plus className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                </button>

                {/* Chat Button */}
                <button
                    onClick={onChatClick}
                    className="flex flex-col items-center justify-center min-w-[64px] h-12 transition-all active:scale-90 duration-200 relative group"
                >
                    <div className="relative p-2 rounded-xl transition-all duration-300 bg-indigo-600/10 text-indigo-400">
                        <MessageCircle className="w-6 h-6 animate-pulse-slow stroke-[2.5px]" />
                    </div>
                    <span className="text-[10px] font-black mt-1 text-indigo-400 opacity-100 uppercase tracking-tighter">AI</span>
                </button>

                {/* Profile Button */}
                <button
                    onClick={() => onViewChange && onViewChange('profile')}
                    className="flex flex-col items-center justify-center min-w-[64px] h-12 transition-all active:scale-90 duration-200 relative group"
                >
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${currentView === 'profile'
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 -translate-y-1'
                        : 'text-gray-400 group-hover:bg-gray-500/10'
                        }`}>
                        <div className="relative">
                            <User className="w-6 h-6 stroke-2" />
                            {friendRequestCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>}
                        </div>
                    </div>
                    <span className={`text-[10px] font-black mt-1 uppercase tracking-tighter ${currentView === 'profile' ? 'text-indigo-500' : 'text-gray-500 opacity-50'
                        }`}>我</span>
                </button>
            </div>
        </div>
    );
};

export default MobileBottomNav;
