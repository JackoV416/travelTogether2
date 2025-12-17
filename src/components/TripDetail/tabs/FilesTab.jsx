import React, { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { FileUp, Loader2, FileText, Trash2, Upload } from 'lucide-react';

const FilesTab = ({ trip, user, isOwner, language = "zh-TW", onOpenSmartImport }) => {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState(trip.files || []);
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    // Sync files from trip data
    useEffect(() => {
        setFiles(trip.files || []);
    }, [trip.files]);

    const handleFileUpload = async (e) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        if (selectedFiles.length === 0) return;
        await processUpload(selectedFiles);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processUpload(Array.from(e.dataTransfer.files));
        }
    };

    const processUpload = async (fileList) => {
        if (!user) return alert(language === 'zh-TW' ? "請先登入" : "Please login first");
        setUploading(true);
        const newFiles = [];

        try {
            for (const file of fileList) {
                // Upload to Firebase Storage
                // Path: trips/{tripId}/files/{timestamp}_{filename}
                const timestamp = Date.now();
                const storageRef = ref(storage, `trips/${trip.id}/files/${timestamp}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);

                newFiles.push({
                    id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: downloadURL,
                    path: snapshot.metadata.fullPath, // For deletion
                    uploadedBy: user.displayName || user.email.split('@')[0],
                    uploadedAt: timestamp
                });
            }

            // Update Firestore Trip Document
            await updateDoc(doc(db, "trips", trip.id), {
                files: arrayUnion(...newFiles)
            });

        } catch (error) {
            console.error("Upload failed", error);
            alert(language === 'zh-TW' ? "上傳失敗，請重試" : "Upload failed, please try again");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteFile = async (file) => {
        if (!confirm(language === 'zh-TW' ? "確定刪除此檔案？" : "Delete this file?")) return;
        try {
            // Delete from Storage
            const fileRef = ref(storage, file.path);
            await deleteObject(fileRef).catch(err => console.warn("Storage delete failed (maybe already gone)", err));

            // Remove from Firestore
            // Note: arrayRemove requires exact object match, which is tricky. 
            // Better to read current files, filter, and update.
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
            {/* Smart Import Banner & Upload Area */}
            <div
                className={`mb-6 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (onOpenSmartImport) {
                        onOpenSmartImport();
                    } else if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processUpload(Array.from(e.dataTransfer.files));
                    }
                }}
                onClick={() => {
                    if (onOpenSmartImport) {
                        onOpenSmartImport();
                    } else {
                        fileInputRef.current?.click();
                    }
                }}
            >
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {onOpenSmartImport ? <Upload className="w-8 h-8" /> : <FileUp className="w-8 h-8" />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-indigo-300">{onOpenSmartImport ? "智能匯入中心" : (language === 'zh-TW' ? "上傳檔案" : "Upload Files")}</h3>
                    <p className="text-sm opacity-60">
                        {onOpenSmartImport ? "拖放檔案或點擊此處，自動識別行程、單據或儲存文件" : (language === 'zh-TW' ? "點擊或拖拉檔案至此上傳" : "Click or drag files here")}
                    </p>
                </div>
                <button className="px-6 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/30">
                    {language === 'zh-TW' ? "立即開始" : "Start Now"}
                </button>
                {uploading && <div className="mt-4 flex items-center gap-2 text-indigo-500"><Loader2 className="animate-spin w-4 h-4" /> Uploading...</div>}
            </div>

            {/* File List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.length === 0 && (
                    <div className="col-span-full text-center py-10 opacity-50 italic">
                        {language === 'zh-TW' ? "暫無檔案" : "No files uploaded"}
                    </div>
                )}
                {files.map(file => (
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
