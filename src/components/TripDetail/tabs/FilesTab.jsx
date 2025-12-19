import React, { useState, useEffect } from 'react';
import { ref, deleteObject } from "firebase/storage";
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { FileText, Trash2, Download, Image as ImageIcon, FileCheck, Share2, MoreVertical, Search, HardDrive } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';

const FilesTab = ({ trip, user, isOwner, language = "zh-TW", isDarkMode, glassCard }) => {
    const [files, setFiles] = useState(trip.files || []);
    const [searchValue, setSearchValue] = useState("");

    // Sync files from trip data
    useEffect(() => {
        setFiles(trip.files || []);
    }, [trip.files]);

    const handleDeleteFile = async (file) => {
        if (!confirm(language === 'zh-TW' ? "確定刪除此檔案？" : "Delete this file?")) return;
        try {
            // Delete from Storage
            const fileRef = ref(storage, file.path);
            await deleteObject(fileRef).catch(err => console.warn("Storage delete failed (maybe already gone)", err));

            // Remove from Firestore
            const newFileList = files.filter(f => f.id !== file.id);
            await updateDoc(doc(db, "trips", trip.id), { files: newFileList });

        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        }
    };

    const formatSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const isImage = (type) => type?.startsWith('image/');

    const filteredFiles = files.filter(f =>
        !searchValue || f.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋文件、相片名稱..."
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
                    <div className="text-sm font-black text-indigo-500">{formatSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}</div>
                </div>
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                            <FileCheck className="w-10 h-10 text-indigo-500 opacity-50" />
                        </div>
                        <div className="text-sm font-black uppercase tracking-[0.2em]">No Files Found</div>
                        <p className="text-xs mt-2 max-w-[200px] leading-relaxed">請點擊上方「智能匯入」來加入第一份旅程記憶。</p>
                    </div>
                )}

                {filteredFiles.map(file => (
                    <div key={file.id} className={`${glassCard(isDarkMode)} group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}>
                        {/* Preview Area */}
                        <div className="h-32 bg-gray-200 dark:bg-black/40 flex items-center justify-center overflow-hidden relative">
                            {isImage(file.type) ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
                                    <p className="text-[9px] opacity-50 font-medium mt-0.5 uppercase">{formatSize(file.size)} • {file.uploadedBy}</p>
                                </div>
                                <div className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">{new Date(file.uploadedAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Delete Action (only for owner) */}
                        {isOwner && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(file); }}
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
