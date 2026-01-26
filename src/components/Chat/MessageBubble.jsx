
import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isMe, showAvatar, senderPhoto, senderName }) => {
    return (
        <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
            {/* Avatar Gutter */}
            <div className="w-8 flex-shrink-0">
                {!isMe && showAvatar && (
                    <img
                        src={senderPhoto || `https://ui-avatars.com/api/?name=${senderName}`}
                        className="w-8 h-8 rounded-full object-cover border border-white dark:border-gray-800 shadow-sm"
                        alt={senderName}
                    />
                )}
            </div>

            <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm relative break-words leading-relaxed
                    ${isMe
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'}
                    `}
                >
                    {message.type === 'image' ? (
                        <div className="mb-1 rounded-lg overflow-hidden">
                            <img src={message.mediaUrl} alt="sent" className="w-full max-w-xs object-cover" />
                        </div>
                    ) : (
                        message.text
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                    {format(message.createdAt ? message.createdAt.toDate() : new Date(), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
