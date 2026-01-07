import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ message = "Loading...", isFullScreen = false }) => {
    if (isFullScreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm animate-fade-in">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-bold animate-pulse">{message}</p>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] rounded-xl animate-fade-in">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
            {message && <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{message}</p>}
        </div>
    );
};

export default LoadingOverlay;
