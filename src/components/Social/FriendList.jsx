import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Users, Search, QrCode, MoreVertical, UserMinus, Ban, MessageCircle } from 'lucide-react';
import { listenToFriends, listenToFriendRequests, acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser } from '../../services/friendService';
import AuroraCard from '../Shared/AuroraCard';
import AuroraGradientText from '../Shared/AuroraGradientText';
import FriendRequestCard from './FriendRequestCard';
import AddFriendModal from './AddFriendModal';

const FriendList = ({ activeTab, currentUser, onOpenPrivateChat }) => {
    const { t } = useTranslation();
    // const { currentUser } = useAuth(); // Removed
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        // 1. Listen to Friends
        const unsubscribeFriends = listenToFriends(currentUser.uid, (data) => {
            setFriends(data);
        });

        // 2. Listen to Requests
        const unsubscribeRequests = listenToFriendRequests(currentUser.uid, (data) => {
            setRequests(data);
        });

        return () => {
            unsubscribeFriends();
            unsubscribeRequests();
        };
    }, [currentUser]);

    // Handlers
    const handleAccept = async (requestId, requestData) => {
        try {
            await acceptFriendRequest(currentUser.uid, currentUser, requestId, requestData);
            // Confetti or Toast could be added here
        } catch (error) {
            console.error("Accept failed", error);
            alert("Failed to accept");
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectFriendRequest(currentUser.uid, requestId);
        } catch (error) {
            console.error("Reject failed", error);
        }
    };

    const handleUnfriend = async (friendId) => {
        try {
            await removeFriend(currentUser.uid, friendId);
        } catch (error) {
            console.error("Unfriend failed", error);
            alert("Failed to unfriend");
        }
    };

    const handleBlock = async (friendId) => {
        try {
            await blockUser(currentUser.uid, friendId);
        } catch (error) {
            console.error("Block failed", error);
            alert("Failed to block");
        }
    };

    // Filter Friends
    const filteredFriends = friends.filter(f =>
        (f.nickname || f.friendId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors z-10" />
                    <input
                        type="text"
                        placeholder={t('friends.search_placeholder')}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-black/30 rounded-xl text-sm outline-none border border-transparent focus:border-indigo-500/30 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all relative z-0 placeholder-slate-400 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
                >
                    <Users className="w-4 h-4" />
                    {t('friends.add_friend')}
                </button>
            </div>

            {/* Friend Requests Section */}
            {requests.length > 0 && (
                <div className="animate-fade-in">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgb(239,68,68)]"></span>
                        {t('friends.requests')} ({requests.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {requests.map(req => (
                            <FriendRequestCard
                                key={req.id}
                                request={req}
                                onAccept={handleAccept}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-6" />
                </div>
            )}

            {/* Friends Grid */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">
                    {t('friends.my_friends')} ({friends.length})
                </h3>

                {filteredFriends.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p>{t('friends.no_friends')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredFriends.map(friend => (
                            <AuroraCard key={friend.id} className="relative !p-4 group hover:-translate-y-1 transition-all overflow-visible" noPadding={false}>
                                {/* Action Menu */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <div className="relative group/menu">
                                        <button className="p-1.5 rounded-full bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors backdrop-blur-sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden hidden group-hover/menu:block z-30 ring-1 ring-black/5">
                                            {onOpenPrivateChat && (
                                                <button
                                                    onClick={() => onOpenPrivateChat({ uid: friend.friendId, displayName: friend.nickname, photoURL: friend.photoURL })}
                                                    className="w-full text-left px-3 py-2 text-xs text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 font-bold transition-colors"
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                    {t('chat.message', 'Message')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm(t('friends.confirm_unfriend'))) handleUnfriend(friend.friendId);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 font-bold transition-colors"
                                            >
                                                <UserMinus className="w-3 h-3" />
                                                {t('friends.unfriend')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(t('friends.confirm_block'))) handleBlock(friend.friendId);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/50 transition-colors"
                                            >
                                                <Ban className="w-3 h-3" />
                                                {t('friends.block')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="relative mb-3">
                                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md group-hover:shadow-indigo-500/50 transition-all duration-500">
                                            <img
                                                src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.nickname}&background=random`}
                                                alt={friend.nickname}
                                                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        {/* Online Status Simulator */}
                                        <div className={`absolute bottom-0 right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${Math.random() > 0.5 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                                    </div>
                                    <AuroraGradientText as="h4" className="font-bold text-sm truncate w-full text-center mb-1">
                                        {friend.nickname}
                                    </AuroraGradientText>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                        {t('friends.friend_since', { date: new Date(friend.since?.seconds * 1000).toLocaleDateString() })}
                                    </p>
                                </div>
                            </AuroraCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Friend Modal */}
            <AddFriendModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />
        </div>
    );
};

export default FriendList;
