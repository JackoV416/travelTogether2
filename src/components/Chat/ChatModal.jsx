
import React, { useState, useEffect } from 'react';
import { X, Search, MessageCircle, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConversationList from './ConversationList';
import DirectMessageView from './DirectMessageView';
import { listenToConversations } from '../../services/chatService';

const ChatModal = ({ isOpen, onClose, currentUser, initialTargetUser = null, isDarkMode }) => {
    const { t } = useTranslation();
    const [activeConversation, setActiveConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);

    // Initial Load Listener
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const unsubscribe = listenToConversations(currentUser.uid, (data) => {
            setConversations(data);
            setLoadingConversations(false);

            // If opening with a specific target user (e.g. from Profile), try to find existing chat
            if (initialTargetUser && !activeConversation) {
                // Determine logic to find chat by participant
                const found = data.find(c => c.participants.includes(initialTargetUser.uid));
                if (found) setActiveConversation(found);
                else {
                    // Logic to create temporary "new" state or call getOrCreate immediately
                    // For now handled by View or Parent, usually we might auto-create.
                }
            }
        });

        return () => unsubscribe();
    }, [isOpen, currentUser, initialTargetUser]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className={`w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border flex flex-col md:flex-row transition-all duration-300
                ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Left Sidebar (Conversation List) */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'} ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-indigo-500" />
                            {t('chat.messages', 'Messages')}
                        </h2>
                        {/* New Chat Button */}
                        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                            <Edit className="w-4 h-4" />
                        </button>
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
                </div>

                {/* Right Area (Message View) */}
                <div className={`flex-1 flex flex-col relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    {activeConversation ? (
                        <DirectMessageView
                            conversation={activeConversation}
                            currentUser={currentUser}
                            isDarkMode={isDarkMode}
                            onBack={() => setActiveConversation(null)}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-10 h-10 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Connect with Travelers</h3>
                            <p className="max-w-xs">{t('chat.select_prompt', 'Select a conversation or start a new one to begin messaging.')}</p>
                        </div>
                    )}

                    {/* Close Button (Absolute Top Right) */}
                    <button
                        onClick={onClose}
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
