import React from 'react';

/**
 * SkeletonLoader
 * A premium pulse-animation placeholder for loading states.
 * Supports different types: 'card', 'widget', 'list-item', 'square', 'circle'.
 */
const SkeletonLoader = ({ type = 'card', className = '', count = 1, isDarkMode }) => {
    const SkeletonItem = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`animate-pulse rounded-3xl ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-200'} h-[300px] w-full flex flex-col p-6 space-y-4 ${className}`}>
                        <div className={`h-40 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'} rounded-2xl w-full`} />
                        <div className="space-y-2">
                            <div className={`h-4 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'} rounded w-3/4`} />
                            <div className={`h-3 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'} rounded w-1/2`} />
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4">
                            <div className={`h-10 w-10 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`} />
                            <div className={`h-8 w-24 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`} />
                        </div>
                    </div>
                );
            case 'widget':
                return (
                    <div className={`animate-pulse rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-100'} p-4 space-y-3 ${className}`}>
                        <div className="flex items-center gap-2">
                            <div className={`h-5 w-5 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                            <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        </div>
                        <div className={`h-8 w-full rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <div className={`h-3 w-1/2 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>
                );
            case 'list-item':
                return (
                    <div className={`animate-pulse flex items-center gap-4 p-3 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50'} ${className}`}>
                        <div className={`h-12 w-12 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} shrink-0`} />
                        <div className="flex-grow space-y-2">
                            <div className={`h-4 w-1/3 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                            <div className={`h-3 w-1/2 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        </div>
                    </div>
                );
            case 'circle':
                return <div className={`animate-pulse rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} ${className}`} />;
            case 'square':
                return <div className={`animate-pulse rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} ${className}`} />;
            default:
                return <div className={`animate-pulse rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} h-4 w-full ${className}`} />;
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonItem key={i} />
            ))}
        </>
    );
};

export default SkeletonLoader;
