import React from 'react';
import Skeleton from '../Shared/Skeleton';

const TripDetailSkeleton = ({ isDarkMode }) => {
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header / Hero Area */}
            <div className={`relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden border ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-100'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-gray-300 dark:bg-gray-800 animate-pulse" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24 rounded-full bg-white/20" />
                        <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
                    </div>
                    <Skeleton className="h-12 w-3/4 md:w-1/2 rounded-2xl bg-white/30" />
                    <div className="flex gap-4 pt-2">
                        <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
                        <Skeleton className="h-10 w-32 rounded-xl bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Day Sidebar */}
                <div className="hidden lg:block space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800/50">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-10 rounded" />
                                <Skeleton className="h-5 w-20 rounded" />
                            </div>
                            <Skeleton className="h-2 w-2 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Center: Itinerary List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Date Header */}
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                        <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>

                    {/* Items */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="pt-2">
                                <Skeleton className="h-8 w-14 rounded-full" />
                            </div>
                            <div className={`flex-1 h-32 rounded-2xl p-4 border ${isDarkMode ? 'border-gray-800 bg-gray-900/40' : 'border-gray-100 bg-white'}`}>
                                <div className="flex justify-between mb-4">
                                    <Skeleton className="h-6 w-1/3 rounded" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-2/3 rounded opacity-60" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TripDetailSkeleton;
