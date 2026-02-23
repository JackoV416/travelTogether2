import React from 'react';

const OnlineStatusDot = ({ isOnline = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    return (
        <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-gray-900`} />
            {isOnline && (
                <div className={`${sizeClasses[size]} rounded-full bg-green-400 absolute top-0 left-0 animate-ping opacity-75`} />
            )}
        </div>
    );
};

export default OnlineStatusDot;
