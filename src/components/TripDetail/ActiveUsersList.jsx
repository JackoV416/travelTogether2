import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import { doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getUserInitial } from '../../utils/tripUtils';
import { TAB_LABELS } from '../../constants/appData';

const ActiveUsersList = ({ tripId, user, activeTab, language = "zh-TW", onUserClick }) => {
    const { t } = useTranslation();
    const [activeUsers, setActiveUsers] = useState([]);
    const [hoveredUser, setHoveredUser] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const [imgErrors, setImgErrors] = useState({}); // Track broken images

    useEffect(() => {
        if (!tripId || !user?.uid) return;

        const presenceRef = doc(db, "trips", tripId, "presence", user?.uid);

        const updatePresence = () => {
            setDoc(presenceRef, {
                user: {
                    uid: user?.uid,
                    name: user?.displayName || user?.email?.split('@')[0] || 'Guest',
                    photo: user?.photoURL || null
                },
                activeTab,
                lastActive: Date.now()
            }, { merge: true });
        };

        updatePresence();
        const interval = setInterval(updatePresence, 10000);

        const presenceColl = collection(db, "trips", tripId, "presence");
        const unsub = onSnapshot(presenceColl, (snapshot) => {
            const now = Date.now();
            const users = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // 顯示所有最近 60 秒活躍的用戶，包括自己
                if (now - data.lastActive < 60000) {
                    users.push(data);
                }
            });
            // 排序：自己排第一個，然後按時間倒序
            users.sort((a, b) => {
                const myUid = user?.uid;
                if (a.user.uid === myUid) return -1;
                if (b.user.uid === myUid) return 1;
                return b.lastActive - a.lastActive;
            });
            setActiveUsers(users);
        });

        return () => {
            clearInterval(interval);
            unsub();
            deleteDoc(presenceRef).catch(err => console.error("Presence cleanup failed", err));
        };
    }, [tripId, user?.uid, activeTab, language]);

    const handleMouseEnter = (e, u) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ top: rect.bottom + 8, left: rect.left });
        setHoveredUser(u);
    };

    const handleMouseLeave = () => {
        setHoveredUser(null);
    };

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (activeUsers.length === 0) return null;

    return (
        <>
            <div className="flex items-center -space-x-2 mr-4 animate-fade-in pointer-events-auto relative">
                {activeUsers.slice(0, 5).map((u, i) => {
                    const isMe = u.user.uid === user?.uid;
                    return (
                        <div
                            key={u.user.uid}
                            className="relative cursor-pointer" // Changed from cursor-help to cursor-pointer
                            style={{ zIndex: 10 - i }}
                            onMouseEnter={(e) => handleMouseEnter(e, u)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => onUserClick && onUserClick(u.user)}
                        >
                            {u.user.photo && !imgErrors[u.user.uid] ? (
                                <img
                                    src={u.user.photo}
                                    alt={u.user.name}
                                    className={`w-8 h-8 rounded-full border-2 object-cover transition-transform hover:scale-110 ${isMe ? 'border-green-400 ring-2 ring-green-400/30' : 'border-white dark:border-gray-800'}`}
                                    onError={() => setImgErrors(prev => ({ ...prev, [u.user.uid]: true }))}
                                />
                            ) : (
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold transition-transform hover:scale-110 ${isMe ? 'bg-green-500 border-green-400 ring-2 ring-green-400/30' : 'bg-indigo-500 border-white dark:border-gray-800'}`}>
                                    {getUserInitial(u.user.name)}
                                </div>
                            )}
                        </div>
                    );
                })}
                {activeUsers.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold" style={{ zIndex: 0 }}>
                        +{activeUsers.length - 5}
                    </div>
                )}
            </div>
            {/* Portal: Tooltip rendered at body level */}
            {hoveredUser && ReactDOM.createPortal(
                <div
                    className="fixed bg-gray-900/95 backdrop-blur text-white text-[10px] px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-white/10 animate-fade-in pointer-events-none"
                    style={{ top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999 }}
                >
                    <div className="font-bold flex items-center gap-1">
                        {hoveredUser.user.name} {hoveredUser.user.uid === user?.uid && <span className="text-green-400">({t('common.active_users.me')})</span>}
                    </div>
                    <div className="opacity-70">
                        {t('common.active_users.viewing')}: {TAB_LABELS[hoveredUser.activeTab]?.[language] || hoveredUser.activeTab || t('common.active_users.overview')}
                    </div>
                    <div className="opacity-50 text-[9px]">
                        {t('common.active_users.active')}: {Math.floor((now - hoveredUser.lastActive) / 1000) < 15 ? t('common.active_users.just_now') : t('common.active_users.seconds_ago', { count: Math.floor((now - hoveredUser.lastActive) / 1000) })}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default ActiveUsersList;
