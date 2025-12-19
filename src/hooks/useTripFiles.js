import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export const useTripFiles = (trip, language = 'zh-TW') => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteFile = async (file) => {
        if (!confirm(language === 'zh-TW' ? "確定刪除此檔案？" : "Delete this file?")) return;
        setLoading(true);
        try {
            // Delete from Storage
            const fileRef = ref(storage, file.path);
            await deleteObject(fileRef).catch(err => console.warn("Storage delete failed", err));

            // Remove from Firestore
            const newFileList = (trip.files || []).filter(f => f.id !== file.id);
            await updateDoc(doc(db, "trips", trip.id), { files: newFileList });
            return true;
        } catch (err) {
            console.error(err);
            setError(err);
            alert("Delete failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteFile, loading, error };
};
