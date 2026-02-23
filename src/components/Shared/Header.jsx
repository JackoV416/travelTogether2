import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft, MonitorPlay, Route, MessageCircle,
    Bell, UserCircle, User, Home, Edit3, Shield,
    History, Sun, Moon, LogOut
} from 'lucide-react';
import { useTour } from '../../contexts/TourContext';
import useGlobalShortcuts from '../../hooks/useGlobalShortcuts';
import { COUNTRIES_DATA } from '../../constants/appData';
import { getUserInitial } from '../../utils/tripUtils';
import ImageWithFallback from './ImageWithFallback';
import Kbd from './Kbd';
import NotificationCenter from '../Notifications/NotificationCenter';

const Header = ({
    title,
    onBack,
    user,
    isDarkMode,
    toggleDarkMode,
    onLogout,
    onViewChange,
    onOpenUserSettings,
    onOpenVersion,
    notifications = [],
    onRemoveNotification,
    onMarkNotificationsRead,
    onNotificationClick,
    onOpenFeedback,
    onOpenAdminFeedback,
    isAdmin,
    adminPendingCount = 0,
    friendRequestCount = 0,
    activeView,
    allTrips = [],
    onOpenPrivateChat
}) => {
    const { t } = useTranslation();
    const { startTour } = useTour();
    const [hoverMenu, setHoverMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [photoError, setPhotoError] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    useGlobalShortcuts({
        onProfile: () => setHoverMenu(prev => !prev),
        onNotifications: () => {
            setShowNotif(prev => {
                const next = !prev;
                if (!next && onMarkNotificationsRead) onMarkNotificationsRead();
                return next;
            });
        },
        onHelp: startTour
    });

    const stats = React.useMemo(() => {
        if (!user || !allTrips.length) return { countries: 0, trips: 0, continents: 0 };
        const myTrips = allTrips.filter(t => t.members?.some(m => m.id === user.uid));
        const countries = new Set(myTrips.map(t => t.country).filter(Boolean));
        const continents = new Set(Array.from(countries).map(c => COUNTRIES_DATA[c]?.continent).filter(Boolean));
        return {
            countries: countries.size,
            trips: myTrips.length,
            continents: continents.size
        };
    }, [user, allTrips]);

    const handleBellClick = () => {
        const next = !showNotif;
        setShowNotif(next);
        if (!showNotif && onMarkNotificationsRead) onMarkNotificationsRead();
    };

    const handleClearAll = () => {
        if (confirm("確定清除所有通知？")) {
            if (onRemoveNotification) {
                notifications.forEach(n => onRemoveNotification(n.id));
            }
        }
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[50] p-4 pt-[max(1.5rem,env(safe-area-inset-top))] transition-all duration-300 ${isDarkMode ? 'bg-gray-900/80 border-b border-white/5' : 'bg-gray-50/80 border-b border-gray-200/50'} shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/60 select-none`}>
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <div className="relative group">
                                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-500/10 btn-press" aria-label="返回"><ChevronLeft /></button>
                                <div className="absolute left-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <span className="text-[10px] font-bold">Back</span>
                                    <Kbd keys={['Esc']} className="border-gray-600 bg-gray-700 text-gray-300" />
                                </div>
                            </div>
                        )}
                        <h1 className="text-lg font-bold truncate cursor-pointer flex items-center gap-2" onClick={() => onViewChange && onViewChange('dashboard')}>
                            <span className="text-2xl">✈️</span>
                            <span className="hidden sm:inline">Travel Together</span>
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-1 bg-gray-500/5 p-1 rounded-full border border-gray-500/10">
                        <button
                            data-tour="explore-community"
                            onClick={() => onViewChange && onViewChange('dashboard')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'dashboard' ? (isDarkMode ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10' : 'bg-white shadow-sm text-indigo-600') : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                        >
                            {t('dashboard.explore_community')}
                        </button>
                        <button
                            data-tour="my-trips-view"
                            onClick={() => onViewChange && onViewChange('my_trips')}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'my_trips' ? (isDarkMode ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/10' : 'bg-white shadow-sm text-indigo-600') : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                        >
                            {t('dashboard.my_trips')}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {startTour && (
                            <>
                                <div className="relative group">
                                    <button onClick={() => onViewChange && onViewChange('tutorial')} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 btn-press">
                                        <MonitorPlay className="w-4 h-4" /> {t('app.menu.tutorial') || '模擬例子'}
                                    </button>
                                    <div className="hidden md:flex absolute top-full right-0 mt-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none items-center gap-2 z-50 whitespace-nowrap">
                                        <span className="text-[10px] text-gray-300">{t('app.menu.tutorial')}</span>
                                        <Kbd keys={['⇧', '⌘', 'E']} className="bg-white/10 border-white/20 text-white" />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <button onClick={startTour} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 btn-press">
                                        <Route className="w-4 h-4" /> {t('app.menu.guide') || '教學'}
                                    </button>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                        <span className="text-[10px] font-bold">{t('app.menu.guide')}</span>
                                        <Kbd keys={['⌘', '/']} className="border-gray-600 bg-gray-700 text-gray-300" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="relative group">
                            <button
                                onClick={() => onOpenPrivateChat && onOpenPrivateChat()}
                                className="p-2 rounded-full hover:bg-gray-500/10 relative btn-press"
                                aria-label="私訊"
                                title="我的訊息"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {/* Optional: Unread Badge logic here later */}
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold">{t('app.menu.messages') || '訊息'}</span>
                                <Kbd keys={['⌘', 'G']} className="border-gray-600 bg-gray-700 text-gray-300" />
                            </div>
                        </div>

                        <div className="relative group">
                            <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-gray-500/10 relative btn-press" aria-label="通知中心">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold">{t('common.notifications.title') || '通知'}</span>
                                <Kbd keys={['⌘', 'B']} className="border-gray-600 bg-gray-700 text-gray-300" />
                            </div>
                            {showNotif && (
                                <NotificationCenter
                                    isOpen={showNotif}
                                    onClose={() => setShowNotif(false)}
                                    notifications={notifications}
                                    onMarkAllRead={onMarkNotificationsRead}
                                    onClearAll={handleClearAll}
                                    onRemoveNotification={onRemoveNotification}
                                    onNotificationClick={(n) => {
                                        setShowNotif(false);
                                        if (onNotificationClick) onNotificationClick(n);
                                    }}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                        </div>

                        <div className="relative" onMouseEnter={() => setHoverMenu(true)} onMouseLeave={() => setHoverMenu(false)}>
                            <button data-tour="profile-menu" onClick={() => setHoverMenu(!hoverMenu)} className="group p-1 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all btn-press" aria-label="用戶選單">
                                {user ? (
                                    user.photoURL && !photoError ? (
                                        <ImageWithFallback
                                            src={user.photoURL}
                                            className="w-8 h-8 rounded-full object-cover"
                                            alt="user"
                                            type="avatar"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                            {getUserInitial(user.displayName || user.email)}
                                        </div>
                                    )
                                ) : <UserCircle className="w-8 h-8" />}
                                {isAdmin && adminPendingCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
                                <div className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-xl border border-white/10 flex items-center gap-2">
                                    <span className="text-[10px] font-bold">{t('app.menu.menu') || '選單'}</span>
                                    <Kbd keys={['⌘', 'M']} className="border-gray-600 bg-gray-700 text-gray-300" />
                                </div>
                            </button>
                            <div className={`absolute top-10 right-0 w-64 pt-4 transition-all duration-300 origin-top-right ${hoverMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                                <div className={`rounded-xl shadow-2xl border overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10 text-white' : 'bg-white/95 border-gray-200 text-gray-800'}`}>
                                    <div className="p-4 border-b border-gray-500/10">
                                        <p className="font-bold truncate">{user?.displayName}</p>
                                        <p className="text-xs opacity-50 truncate">{user?.email}</p>
                                    </div>
                                    <div className="flex justify-around py-3 border-b border-gray-500/10 bg-gray-50/50 dark:bg-black/20">
                                        <div className="text-center">
                                            <div className="text-lg font-black text-indigo-500">{stats.countries}</div>
                                            <div className="text-[10px] opacity-60 font-bold uppercase">{t('profile.stats.countries')}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-purple-500">{stats.trips}</div>
                                            <div className="text-[10px] opacity-60 font-bold uppercase">{t('profile.stats.trips')}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-emerald-500">{stats.continents}</div>
                                            <div className="text-[10px] opacity-60 font-bold uppercase">{t('profile.stats.continents')}</div>
                                        </div>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        <button onClick={() => { setHoverMenu(false); onViewChange && onViewChange('profile'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <User className="w-4 h-4 text-indigo-500" />
                                                    {friendRequestCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>}
                                                </div>
                                                {t('app.menu.profile')}
                                            </div>
                                            <Kbd keys={['⇧', '⌘', 'P']} />
                                        </button>
                                        <button onClick={() => { setHoverMenu(false); onViewChange && onViewChange('dashboard'); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><Home className="w-4 h-4" /> {t('app.menu.dashboard')}</div>
                                            <Kbd keys={['⇧', '⌘', 'H']} />
                                        </button>
                                        <button
                                            data-tour="my-trips-view"
                                            onClick={() => { setHoverMenu(false); onViewChange && onViewChange('my_trips'); }}
                                            className={`md:hidden flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                            <div className="flex items-center gap-3"><MonitorPlay className="w-4 h-4" /> {t('dashboard.my_trips') || '我的行程'}</div>
                                        </button>
                                        <button onClick={() => { setHoverMenu(false); onOpenUserSettings(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><Edit3 className="w-4 h-4" /> {t('app.menu.settings')}</div>
                                            <Kbd keys={['⌘', ',']} />
                                        </button>
                                        <button onClick={() => { setHoverMenu(false); onOpenFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4" /> {t('app.menu.feedback')}</div>
                                            <Kbd keys={['⌘', 'F']} />
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => { setHoverMenu(false); onOpenAdminFeedback(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Shield className="w-4 h-4 text-indigo-500" />
                                                        {adminPendingCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                                    </div>
                                                    {t('app.menu.admin') || '管理員後台'}
                                                </div>
                                                <Kbd keys={['⇧', '⌘', 'A']} />
                                            </button>
                                        )}
                                        <button onClick={() => { setHoverMenu(false); onOpenVersion(); }} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3"><History className="w-4 h-4" /> {t('app.menu.version') || '版本資訊'}</div>
                                            <Kbd keys={['⌘', 'V']} />
                                        </button>
                                        <div className="h-px bg-gray-500/10 my-1"></div>
                                        <button onClick={toggleDarkMode} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                {t('app.menu.toggle_theme') || '切換模式'}
                                            </div>
                                            <Kbd keys={['⇧', '⌘', 'L']} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setHoverMenu(false);
                                                setShowLogoutModal(true);
                                            }}
                                            className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-all duration-300 justify-between mt-2 font-bold border-2 ${isDarkMode
                                                ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/10'
                                                : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-500 hover:border-red-400 hover:bg-red-100 hover:shadow-lg hover:shadow-red-500/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                {t('app.menu.logout') || '登出'}
                                            </div>
                                            <Kbd keys={['⇧', '⌘', 'Q']} className={isDarkMode ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Logout Confirmation Modal */}
            {
                showLogoutModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLogoutModal(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div
                            className={`relative w-full max-w-sm p-6 rounded-3xl shadow-2xl border animate-scale-up ${isDarkMode
                                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-white/10'
                                : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200'
                                }`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                                }`}>
                                <LogOut className="w-8 h-8 text-red-500" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black text-center mb-2">確定要登出嗎？</h3>
                            <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                登出後需要重新登入才能使用完整功能
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(false);
                                        onLogout();
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                                >
                                    確定登出
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Header;
