import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Trash2, Download, HardDrive, FileCheck, Share2, FileUp, Loader2 } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import { useTripFiles } from '../../../hooks/useTripFiles';
import { formatFileSize, isImageFile } from '../../../utils/tripUtils';

const FilesTab = ({ trip, user, isOwner, language = "zh-TW", isDarkMode, glassCard }) => {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const { deleteFile, uploadFile, loading } = useTripFiles(trip, language); // Added uploadFile
    const files = trip.files || [];

    const [now] = useState(() => Date.now());
    // Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);

        if (droppedFiles.length > 0) {
            // Check for abuse/ban is handled inside uploadFile usually, or we should wrap it.
            // Since we don't have direct access to 'checkAbuse' here easily without importing logic, 
            // we assume useTripFiles handles it or we accept it for now.
            // Ideally useTripFiles should expose a method to upload multiple.
            // For now, let's just upload the first one or loop.
            for (const file of droppedFiles) {
                await uploadFile(file);
            }
        }
    };

    const filteredFiles = files.filter(f =>
        !searchValue || f.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

    return (
        <div
            className="animate-fade-in space-y-6 pb-10 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave} // This might be tricky on parent, usually better to overlap
            onDrop={handleDrop}
        >
            {/* Drop Zone Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 rounded-3xl border-4 border-dashed border-indigo-500 bg-indigo-500/10 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse"
                    style={{ height: '100%', minHeight: '400px' }} // Ensure cover
                    onDragLeave={handleDragLeave} // Catch leave event
                    onDrop={handleDrop}
                >
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-full shadow-2xl mb-4">
                        <FileUp className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-black text-indigo-500">{t('trip.files.smart_import_title')}</h3>
                    <p className="font-bold opacity-50">{t('trip.files.start_now')}</p>
                </div>
            )}

            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder={t('common.search')}
                isDarkMode={isDarkMode}
            />

            {/* Stats Header */}
            <div className={`p-4 rounded-2xl flex items-center justify-between ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <HardDrive className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Storage Status</div>
                        <div className="text-sm font-bold">{files.length} <span className="opacity-50">Files Uploaded</span></div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">Total Size</div>
                    <div className="text-sm font-black text-indigo-500">{formatFileSize(totalSize)}</div>
                </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="fixed left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <span className="text-sm font-bold">{t('common.loading')}</span>
                </div>
            )}

            {/* File Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                            <FileCheck className="w-10 h-10 text-indigo-500 opacity-50" />
                        </div>
                        <div className="text-sm font-black uppercase tracking-[0.2em]">{t('trip.files.empty')}</div>
                        <p className="text-xs mt-2 max-w-[200px] leading-relaxed">{t('trip.files.smart_import_desc')}</p>
                    </div>
                )}

                {filteredFiles.map(file => (
                    <div key={file.id} className={`${glassCard(isDarkMode)} group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}>
                        {/* Preview Area */}
                        <div className="h-32 bg-gray-200 dark:bg-black/40 flex items-center justify-center overflow-hidden relative">
                            {isImageFile(file.type) ? (
                                <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <FileText className="w-12 h-12 opacity-20 text-indigo-500" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 gap-2">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40 border border-white/20 transition-all">
                                    <Download className="w-3.5 h-3.5 text-white" />
                                </a>
                                <button className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40 border border-white/20 transition-all">
                                    <Share2 className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-xs truncate" title={file.name}>{file.name}</h4>
                                    <p className="text-[9px] opacity-50 font-medium mt-0.5 uppercase">{formatFileSize(file.size)} • {file.uploadedBy}</p>
                                </div>
                                <div className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">
                                    {new Date(file.uploadedAt?.seconds ? file.uploadedAt.seconds * 1000 : (file.uploadedAt || now)).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Delete Action (only for owner) */}
                        {isOwner && (
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteFile(file); }}
                                disabled={loading}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilesTab;
