import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, X, MapPin, Calendar, ExternalLink, Download } from 'lucide-react';
import { glassCard, formatDate } from '../../../utils/tripUtils';

const GalleryTab = ({ trip, isDarkMode }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    // Extract all unique images from Itinerary and Files
    const galleryImages = useMemo(() => {
        const images = [];
        const seenUrls = new Set();

        // 1. Itinerary Images
        if (trip.itinerary) {
            Object.entries(trip.itinerary).forEach(([date, items]) => {
                items.forEach(item => {
                    const imgUrl = item.image || item.details?.image;
                    if (imgUrl && !seenUrls.has(imgUrl)) {
                        seenUrls.add(imgUrl);
                        images.push({
                            url: imgUrl,
                            source: 'itinerary',
                            date: date,
                            title: item.name,
                            description: item.details?.desc || item.details?.address || '',
                            type: item.type
                        });
                    }
                });
            });
        }

        // 2. Files (Images)
        if (trip.files) {
            trip.files.forEach(file => {
                if (file.type?.startsWith('image/') && !seenUrls.has(file.url)) {
                    seenUrls.add(file.url);
                    images.push({
                        url: file.url,
                        source: 'file',
                        date: file.uploadedAt ? new Date(file.uploadedAt.seconds * 1000).toISOString().split('T')[0] : '',
                        title: file.name,
                        description: 'Uploaded File',
                        type: 'file'
                    });
                }
            });
        }

        // Sort by date (newest first)
        return images.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date.localeCompare(a.date);
        });
    }, [trip]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Stats */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>旅程相簿</h3>
                        <p className="text-xs opacity-60">共收錄 {galleryImages.length} 張精彩照片</p>
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {galleryImages.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in border border-transparent hover:border-indigo-500/30 transition-all duration-300 mb-4 shadow-md hover:shadow-xl hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <img
                            src={img.url}
                            alt={img.title}
                            loading="lazy"
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h4 className="font-bold text-sm line-clamp-1">{img.title}</h4>
                                {img.date && (
                                    <div className="flex items-center gap-1 text-[10px] opacity-80 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(img.date)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Source Badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.source === 'itinerary' ? '行程' : '檔案'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {galleryImages.length === 0 && (
                <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                        <ImageIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    </div>
                    <h3 className="text-lg font-bold opacity-70">相簿空空如也</h3>
                    <p className="text-sm opacity-50 mt-1">當您在行程或檔案中添加圖片時，它們會自動顯示在這裡。</p>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className="max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6 bg-transparent"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Main Image */}
                        <div className="flex-1 flex items-center justify-center relative group">
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>

                        {/* Image Details Sidebar */}
                        <div className={`w-full md:w-80 flex-shrink-0 p-6 rounded-2xl backdrop-blur-md border ${isDarkMode ? 'bg-gray-900/50 border-white/10 text-white' : 'bg-white/90 border-white/20 text-gray-900'}`}>
                            <h3 className="text-xl font-black mb-4">{selectedImage.title}</h3>

                            <div className="space-y-4">
                                {selectedImage.date && (
                                    <div className="flex items-center gap-3 opacity-80">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">{formatDate(selectedImage.date)}</span>
                                    </div>
                                )}

                                {selectedImage.description && (
                                    <div className="flex items-start gap-3 opacity-80">
                                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                        <span className="text-sm leading-relaxed">{selectedImage.description}</span>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                                    <a
                                        href={selectedImage.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        查看原圖
                                    </a>
                                    <a
                                        href={selectedImage.url}
                                        download
                                        className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                    >
                                        <Download className="w-4 h-4" />
                                        下載圖片
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryTab;
