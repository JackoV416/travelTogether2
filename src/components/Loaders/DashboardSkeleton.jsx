import React from 'react';
import Skeleton from '../Shared/Skeleton';

const DashboardSkeleton = ({ isDarkMode }) => {
    return (
        <div className="min-h-screen text-opacity-50 pointer-events-none p-4 pb-20 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 w-full md:w-auto">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-64 rounded-lg opacity-60" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Quick Stats / Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
            </div>

            {/* Active Trips Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-80 rounded-3xl p-6 flex flex-col justify-between border ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-white/50'}`}>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-8 w-20 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                                <Skeleton className="h-8 w-3/4 rounded-xl" />
                                <Skeleton className="h-4 w-1/2 rounded-lg opacity-60" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full rounded-xl" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
