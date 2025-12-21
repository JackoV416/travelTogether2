import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getUserInitial } from '../../utils/tripUtils';
import { TAB_LABELS } from '../../constants/appData';

const ActiveUsersList = ({ tripId, user, activeTab, language = "zh-TW" }) => {
    const [activeUsers, setActiveUsers] = useState([]);

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
            // Optional: deleteDoc(presenceRef) - 保留這行如果想離線即刪除，或者註解掉以保留 "Last seen"
            deleteDoc(presenceRef).catch(err => console.error("Presence cleanup failed", err));
        };
    }, [tripId, user?.uid, activeTab, language]);

    if (activeUsers.length === 0) return null;

    return (
        <div className="flex items-center -space-x-2 mr-4 animate-fade-in pointer-events-auto relative">
            {activeUsers.slice(0, 5).map((u, i) => {
                const isMe = u.user.uid === user?.uid;
                const timeDiff = Math.floor((Date.now() - u.lastActive) / 1000);
                const statusText = timeDiff < 15 ? (language === 'zh-TW' ? '剛剛' : 'Just now') : `${timeDiff}${language === 'zh-TW' ? '秒前' : 's ago'}`;
                const tabName = TAB_LABELS[u.activeTab]?.[language] || u.activeTab || (language === 'zh-TW' ? '總覽' : 'Overview');

                return (
                    <div key={u.user.uid} className="relative group cursor-help" style={{ zIndex: 10 - i }}>
                        {u.user.photo ? (
                            <img src={u.user.photo} alt={u.user.name}
                                className={`w-8 h-8 rounded-full border-2 object-cover transition-transform hover:scale-110 ${isMe ? 'border-green-400 ring-2 ring-green-400/30' : 'border-white dark:border-gray-800'}`} />
                        ) : (
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold transition-transform hover:scale-110 ${isMe ? 'bg-green-500 border-green-400 ring-2 ring-green-400/30' : 'bg-indigo-500 border-white dark:border-gray-800'}`}>
                                {getUserInitial(u.user.name)}
                            </div>
                        )}
                        {/* V1.0.3 Fix: Increased z-index and adjusted position to prevent overlap */}
                        <div className="absolute top-full mt-2 left-0 bg-gray-900/95 backdrop-blur text-white text-[10px] px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10" style={{ zIndex: 100 }}>
                            <div className="font-bold flex items-center gap-1">
                                {u.user.name} {isMe && <span className="text-green-400">(Me)</span>}
                            </div>
                            <div className="opacity-70">
                                {language === 'zh-TW' ? '正在查看: ' : 'Viewing: '}{tabName}
                            </div>
                            <div className="opacity-50 text-[9px]">
                                {language === 'zh-TW' ? '活躍於: ' : 'Active: '}{statusText}
                            </div>
                        </div>
                    </div>
                );
            })}
            {activeUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold" style={{ zIndex: 0 }}>
                    +{activeUsers.length - 5}
                </div>
            )}
        </div>
    );
};

export default ActiveUsersList;
