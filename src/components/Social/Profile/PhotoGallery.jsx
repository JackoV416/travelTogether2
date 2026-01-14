import React from 'react';
import { Camera, MapPin, Heart } from 'lucide-react';

const PhotoGallery = ({ isDarkMode, trips = [] }) => {
    // Extract photos from trips (Cover Images for now)
    // In future, could crawl trip.attachments if that structure exists
    const photos = React.useMemo(() => {
        return trips
            .filter(t => t.coverImage && t.coverImage !== 'default' && t.coverImage !== '')
            .map((t, index) => ({
                id: t.id || index,
                url: t.coverImage,
                location: t.country ? `${t.location}, ${t.country}` : t.location,
                likes: t.likes || 0, // Mock or real likes if available
                aspect: ['aspect-square', 'aspect-[4/3]', 'aspect-[3/4]'][index % 3] // Randomized aspect for masonry feel
            }))
            .slice(0, 20); // Limit to recent 20 for performance
    }, [trips]);

    if (photos.length === 0) {
        return (
            <div className={`p-8 rounded-3xl border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <h3 className="font-bold opacity-70">暫無相片</h3>
                <p className="text-sm opacity-50">建立行程並上傳封面圖片，這裡就會顯示您的旅途回憶。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-indigo-500" />
                            旅途回憶 (Memories)
                        </h3>
                        <p className="text-sm opacity-60">珍藏的 1,240 張照片</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-bold text-xs transition-all">
                        管理相簿
                    </button>
                </div>

                {/* Masonry Grid Simulation using columns */}
                <div className="columns-2 sm:columns-3 gap-4 space-y-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className="relative group break-inside-avoid rounded-2xl overflow-hidden mb-4 cursor-pointer">
                            <img
                                src={photo.url}
                                alt={photo.location}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="text-white">
                                    <div className="flex items-center gap-1 text-xs font-bold mb-1">
                                        <MapPin className="w-3 h-3 text-emerald-400" />
                                        {photo.location}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs opacity-80">
                                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                                        {photo.likes} Likes
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PhotoGallery;
