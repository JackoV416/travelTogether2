
import React, { useState, useEffect } from 'react';
import { X, Search, MessageCircle, Edit, Bot, Users, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConversationList from './ConversationList';
import DirectMessageView from './DirectMessageView';
import JarvisChatView from './JarvisChatView';
import TripChatView from './TripChatView';
import FriendsList from './FriendsList';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { listenToConversations, getOrCreateConversation } from '../../services/chatService';
import ImageWithFallback from '../Shared/ImageWithFallback';

const ChatModal = ({ isOpen, onClose, currentUser, initialTargetUser = null, isDarkMode, trip, initialTab = null }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'friends'
    const [activeConversation, setActiveConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [showNewChatInput, setShowNewChatInput] = useState(false);
    const [newChatEmail, setNewChatEmail] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [userTrips, setUserTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);

    // Fetch User Trips
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const q = query(collection(db, "trips"));
        const unsubTrips = onSnapshot(q, (snapshot) => {
            const allTrips = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const filtered = allTrips.filter(t => t.members?.some(m => m.id === currentUser.uid || m.id === currentUser.email));
            setUserTrips(filtered);
            setLoadingTrips(false);
        });

        return () => unsubTrips();
    }, [isOpen, currentUser]);

    // Initial Load Listener
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const unsubscribe = listenToConversations(currentUser.uid, (data) => {
            setConversations(data);
            setLoadingConversations(false);

            // Handle Initial Tab (Jarvis / Trip)
            if (initialTab === 'jarvis') {
                setActiveConversation({ id: 'jarvis', type: 'system', name: 'Jarvis AI' });
            } else if (initialTab === 'trip' || initialTab === 'trip-chat') {
                // Use first trip if exists
                const firstTrip = userTrips[0];
                if (firstTrip) {
                    setActiveConversation({ id: `trip-${firstTrip.id}`, type: 'trip', name: firstTrip.name || '行程群組', tripId: firstTrip.id });
                }
            }
            // Handle Initial Target User (Private DM)
            else if (initialTargetUser && !activeConversation) {
                const found = data.find(c => c.participants.includes(initialTargetUser.uid));
                if (found) setActiveConversation(found);
                else {
                    // Logic for new chat... handled by creating if needed or just showing empty view
                }
            }
        });

        return () => unsubscribe();
    }, [isOpen, currentUser, initialTargetUser, initialTab, userTrips]);

    const handleNewChatSubmit = async (e) => {
        e.preventDefault();
        if (!newChatEmail.trim()) return;

        setIsSearching(true);
        const email = newChatEmail.trim();

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert(t('chat.user_not_found', 'User not found!'));
                setIsSearching(false);
                return;
            }

            const targetUserDoc = querySnapshot.docs[0];
            const targetUser = { uid: targetUserDoc.id, ...targetUserDoc.data() };

            if (targetUser.uid === currentUser.uid) {
                alert(t('chat.cannot_chat_self', 'You cannot chat with yourself!'));
                setIsSearching(false);
                return;
            }

            const convId = await getOrCreateConversation(currentUser.uid, targetUser);
            const tempConv = {
                id: convId,
                participants: [currentUser.uid, targetUser.uid],
                participantDetails: {
                    [currentUser.uid]: { displayName: currentUser.displayName, photoURL: currentUser.photoURL },
                    [targetUser.uid]: { displayName: targetUser.displayName, photoURL: targetUser.photoURL }
                }
            };
            setActiveConversation(tempConv);
            setShowNewChatInput(false);
            setNewChatEmail('');
        } catch (error) {
            console.error("New chat failed:", error);
            alert("Error creating chat: " + error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleNewChat = async () => {
        const email = window.prompt(t('chat.new_chat_prompt', 'Enter email to start chat:'));
        if (!email) return;

        try {
            // Find user by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert(t('chat.user_not_found', 'User not found!'));
                return;
            }

            const targetUserDoc = querySnapshot.docs[0];
            const targetUser = { uid: targetUserDoc.id, ...targetUserDoc.data() };

            if (targetUser.uid === currentUser.uid) {
                alert(t('chat.cannot_chat_self', 'You cannot chat with yourself!'));
                return;
            }

            // Create Conversation
            const convId = await getOrCreateConversation(currentUser.uid, targetUser);

            // Set Active
            // We need the full object, but getOrCreate only returns ID.
            // We can construct a temp object or wait for listener. 
            // Better: Construct temp
            const tempConv = {
                id: convId,
                participants: [currentUser.uid, targetUser.uid],
                participantDetails: {
                    [currentUser.uid]: { displayName: currentUser.displayName, photoURL: currentUser.photoURL },
                    [targetUser.uid]: { displayName: targetUser.displayName, photoURL: targetUser.photoURL }
                }
            };
            setActiveConversation(tempConv);

        } catch (error) {
            console.error("New chat failed:", error);
            alert("Error creating chat: " + error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/40 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div
                data-tour="chat-window"
                role="dialog"
                aria-label={t('chat.modal_title', 'Chat window')}
                className={`w-full h-full md:w-[95vw] md:max-w-[95%] md:h-[90vh] md:rounded-[2rem] overflow-hidden shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)] border flex flex-col-reverse md:flex-row transition-all duration-500 transform scale-100 ring-1 ring-white/10
                ${isDarkMode ? 'bg-slate-950/80 border-white/10' : 'bg-white/90 border-gray-200'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* COLUMN 1: Left Navigation Rail (Desktop) / Bottom Nav (Mobile) */}
                <div className={`flex md:flex-col items-center justify-around md:justify-start w-full md:w-20 lg:w-24 p-2 md:p-6 border-t md:border-t-0 md:border-r z-20 transition-all pb-safe-area md:pb-6
                    ${isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-gray-50/80 border-gray-100'}`}
                >
                    {/* User Avatar (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-center mb-6 pt-2">
                        <ImageWithFallback src={currentUser?.photoURL} type="avatar" className="w-12 h-12 rounded-full border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10" />
                    </div>

                    {/* Nav Items */}
                    <button
                        onClick={() => { setActiveTab('chats'); if (window.innerWidth < 768) setActiveConversation(null); }}
                        className={`flex flex-col items-center justify-center gap-1 w-16 md:w-full py-2.5 md:py-3.5 rounded-2xl transition-all ${activeTab === 'chats' ? 'text-indigo-500 bg-indigo-500/10 shadow-inner' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
                        <span className="text-[10px] font-bold">{t('chat.chats', '訊息')}</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('friends'); if (window.innerWidth < 768) setActiveConversation(null); }}
                        className={`flex flex-col items-center justify-center gap-1 w-16 md:w-full mt-0 md:mt-2 py-2.5 md:py-3.5 rounded-2xl transition-all ${activeTab === 'friends' ? 'text-indigo-500 bg-indigo-500/10 shadow-inner' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        <UserPlus className="w-6 h-6 md:w-7 md:h-7" />
                        <span className="text-[10px] font-bold">{t('chat.friends', '朋友')}</span>
                    </button>

                    <button
                        onClick={onClose}
                        aria-label={t('common.close', 'Close')}
                        className="md:hidden flex flex-col items-center justify-center gap-1 w-16 py-2.5 rounded-2xl transition-all text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                        <span className="text-[10px] font-bold">關閉</span>
                    </button>
                </div>

                {/* COLUMN 2: List View (Conversations / Friends) */}
                <div className={`w-full md:w-80 lg:w-80 flex flex-col border-r transition-all ${isDarkMode ? 'border-white/5 bg-slate-900/30' : 'border-gray-100 bg-white/50'} ${activeConversation ? 'hidden md:flex' : 'flex-1 md:flex-none max-h-[100dvh]'} pt-safe-area md:pt-0`}>
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex flex-col gap-5 transition-all min-h-[80px] shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic">{activeTab === 'chats' ? t('chat.chats', 'MESSAGES') : t('chat.friends', 'FRIENDS')}</h2>
                            {activeTab === 'chats' && (
                                <button onClick={() => setShowNewChatInput(!showNewChatInput)} className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-95 group">
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* New Chat Input (only show on Chats tab) */}
                        {activeTab === 'chats' && showNewChatInput && (
                            <form onSubmit={handleNewChatSubmit} className="relative animate-fade-in origin-top">
                                <input
                                    type="email"
                                    value={newChatEmail}
                                    onChange={(e) => setNewChatEmail(e.target.value)}
                                    placeholder={t('chat.enter_email', 'Enter email...')}
                                    className={`w-full pl-9 pr-12 py-2 rounded-xl text-sm outline-none border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-indigo-500 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400'}`}
                                    autoFocus
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <button
                                    type="submit"
                                    disabled={!newChatEmail.trim() || isSearching}
                                    className="absolute right-2 top-1.5 p-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSearching ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin m-0.5" /> : <div className="text-[10px] font-bold px-1">GO</div>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* SPECIAL SYSTEM CHATS */}
                    {/* SPECIAL SYSTEM CHATS */}
                    <div className="mb-4 space-y-2">
                        {/* JARVIS */}
                        <div
                            onClick={() => setActiveConversation({ id: 'jarvis', type: 'system', name: t('chat.system.jarvis_name', 'Jarvis AI') })}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group relative overflow-hidden ${activeConversation?.id === 'jarvis' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white' : 'hover:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeConversation?.id === 'jarvis' ? 'bg-white/20' : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-bold text-sm truncate ${activeConversation?.id === 'jarvis' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{t('chat.system.jarvis_name', 'Jarvis AI')}</h3>
                                </div>
                                <p className={`text-xs truncate ${activeConversation?.id === 'jarvis' ? 'text-white/70' : 'opacity-50'}`}>
                                    {t('chat.system.jarvis_desc', '隨時為您提供行程建議...')}
                                </p>
                            </div>
                        </div>

                        {/* USER TRIP GROUPS */}
                        {!loadingTrips && userTrips.length > 0 && userTrips.map((trip) => {
                            const tripChatId = `trip-${trip.id}`;
                            const isActive = activeConversation?.id === tripChatId;
                            return (
                                <div
                                    key={tripChatId}
                                    onClick={() => setActiveConversation({ id: tripChatId, type: 'trip', name: trip.name || '行程群組', tripId: trip.id })}
                                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group ${isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white' : 'hover:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                                    aria-label={t('chat.trip_chat', { defaultValue: 'Trip chat: {{tripName}}', tripName: trip.name || '行程群組' })}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white/20' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{trip.name || t('chat.system.trip_name', '行程群組')}</h3>
                                        </div>
                                        <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'opacity-50'}`}>
                                            {trip.city || t('chat.system.trip_desc', '與團友討論行程細節...')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Content Area - Switch between Chats and Friends */}
                    {activeTab === 'chats' ? (
                        <>
                            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest px-1 mb-2">
                                {t('chat.direct_messages', '私人訊息')}
                            </div>

                            {/* Conversations */}
                            <ConversationList
                                conversations={conversations}
                                currentUser={currentUser}
                                activeId={activeConversation?.id}
                                onSelect={(conv) => setActiveConversation(conv)}
                                loading={loadingConversations}
                                isDarkMode={isDarkMode}
                            />
                        </>
                    ) : (
                        <FriendsList
                            currentUser={currentUser}
                            trip={trip}
                            onStartChat={(conv) => {
                                setActiveConversation(conv);
                                setActiveTab('chats'); // Switch back to chats tab
                            }}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>

                {/* Right Area (Message View) */}
                <div className={`flex-1 flex flex-col relative ${!activeConversation ? 'hidden md:flex' : 'flex-1 md:flex-1 bg-white dark:bg-gray-900 z-30'} pt-safe-area md:pt-0`}>
                    {activeConversation ? (
                        <>
                            {activeConversation.id === 'jarvis' ? (
                                <JarvisChatView
                                    user={currentUser}
                                    trip={trip}
                                    isDarkMode={isDarkMode}
                                    onBack={() => setActiveConversation(null)}
                                />
                            ) : activeConversation.type === 'trip' && activeConversation.tripId ? (
                                <TripChatView
                                    trip={userTrips.find(t => t.id === activeConversation.tripId)}
                                    user={currentUser}
                                    isDarkMode={isDarkMode}
                                    onBack={() => setActiveConversation(null)}
                                />
                            ) : (
                                <DirectMessageView
                                    conversation={activeConversation}
                                    currentUser={currentUser}
                                    isDarkMode={isDarkMode}
                                    onBack={() => setActiveConversation(null)}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-10 h-10 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('chat.empty.title', 'Connect with Travelers')}</h3>
                            <p className="max-w-xs">{t('chat.empty.desc', 'Select a conversation or start a new one to begin messaging.')}</p>
                        </div>
                    )}

                    {/* Close Button (Absolute Top Right) */}
                    <button
                        onClick={onClose}
                        aria-label={t('common.close', 'Close chat')}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 z-50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
