import React, { useState, useEffect } from 'react';
import { ref, deleteObject } from "firebase/storage";
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { FileText, Trash2 } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';

const FilesTab = ({ trip, user, isOwner, language = "zh-TW", isDarkMode }) => {
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
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = 2;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const isImage = (type) => type.startsWith('image/');

    return (
        <div className="animate-fade-in space-y-6">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋回憶..."
                isDarkMode={isDarkMode}
            />

            {/* File List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.length === 0 && (
                    <div className="col-span-full text-center py-20 flex flex-col items-center justify-center opacity-50">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 opacity-50" />
                        </div>
                        <div className="text-lg font-bold">暫無回憶</div>
                        <p className="text-sm mt-1">點擊右上角「智能匯入」加入相片或文件</p>
                    </div>
                )}
                {files.filter(f => !searchValue || f.name.toLowerCase().includes(searchValue.toLowerCase())).map(file => (
                    <div key={file.id} className="group relative bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all flex gap-4 items-start">
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                            {isImage(file.type) ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                                <FileText className="w-8 h-8 opacity-50" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-bold truncate block hover:text-indigo-500 hover:underline">{file.name}</a>
                            <div className="text-xs opacity-60 mt-1 flex flex-col gap-0.5">
                                <span>{formatSize(file.size)} • {file.uploadedBy}</span>
                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file); }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilesTab;
