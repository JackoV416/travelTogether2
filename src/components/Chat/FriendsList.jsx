import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, MessageCircle, User, UserPlus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OnlineStatusDot from './OnlineStatusDot';
import { getOrCreateConversation } from '../../services/chatService';

const FriendsList = ({ currentUser, onStartChat, isDarkMode, trip }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all users
    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allUsers = snapshot.docs
                .map(d => ({ uid: d.id, ...d.data() }))
                .filter(u => u.uid !== currentUser.uid); // Exclude self

            setUsers(allUsers);
            setLoading(false);
        }, (error) => {
            console.error("Friends list error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Filter users based on search
    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.displayName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    // Handle message button click
    const handleStartChat = async (targetUser) => {
        try {
            const convId = await getOrCreateConversation(currentUser.uid, targetUser);

            // Construct conversation object
            const conversation = {
                id: convId,
                participants: [currentUser.uid, targetUser.uid],
                participantDetails: {
                    [currentUser.uid]: {
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL
                    },
                    [targetUser.uid]: {
                        displayName: targetUser.displayName,
                        photoURL: targetUser.photoURL
                    }
                }
            };

            onStartChat(conversation);
        } catch (error) {
            console.error("Failed to start chat:", error);
            alert("Failed to start chat: " + error.message);
        }
    };

    // Handle Invite logic
    const handleInvite = async (targetUser) => {
        if (!trip) return;
        // Logic to send invitation (Mock for now or real notification if service available)
        // For now, just show alert/toast and maybe add to local state to show "Sent"
        alert(`已向 ${targetUser.displayName} 發送行程「${trip.name}」的邀請！`);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('chat.search_people', '搜尋用戶...')}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none border transition-all ${isDarkMode
                            ? 'bg-gray-800 border-gray-700 focus:border-indigo-500 text-white placeholder:text-gray-500'
                            : 'bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400'
                            }`}
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-50">
                        <User className="w-12 h-12 mb-2 text-gray-400" />
                        <p className="text-sm">{t('chat.no_users_found', '找不到用戶')}</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredUsers.map(user => {
                            const isMember = trip?.members?.some(m => (m.uid || m.id) === user.uid);

                            return (
                                <div
                                    key={user.uid}
                                    className={`p-3 rounded-xl transition-all flex items-center gap-3 group border border-transparent ${isDarkMode
                                        ? 'hover:bg-white/5 hover:border-white/10'
                                        : 'hover:bg-indigo-50 hover:border-indigo-100'
                                        }`}
                                >
                                    {/* Avatar with Online Status */}
                                    <div className="relative flex-shrink-0">
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName}
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all">
                                                {user.displayName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        {/* Online Status - Placeholder (always show as offline for now) */}
                                        <div className="absolute -bottom-0.5 -right-0.5">
                                            <OnlineStatusDot isOnline={false} size="sm" />
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {user.displayName || 'Unknown User'}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                            {user.email || ''}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        {/* Invite Button (Only if trip exists & not member) */}
                                        {trip && !isMember && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleInvite(user); }}
                                                className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                                title={t('chat.invite_trip', '邀請加入行程')}
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        )}
                                        {trip && isMember && (
                                            <div className="p-2 rounded-full bg-gray-500/10 text-gray-400 cursor-default" title={t('chat.already_joined', '已加入')}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}

                                        {/* Message Button */}
                                        <button
                                            onClick={() => handleStartChat(user)}
                                            className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
                                            title={t('chat.send_message', '發送訊息')}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsList;
