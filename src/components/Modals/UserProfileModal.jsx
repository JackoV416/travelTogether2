import React from 'react';
import { X, User, Mail, Shield, Calendar, Camera, Loader2, Upload } from 'lucide-react';
import { formatDate } from '../../utils/tripUtils';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../firebase';

const UserProfileModal = ({ isOpen, onClose, user, isAdmin, isDarkMode }) => {
    if (!isOpen || !user) return null;

    const [isUploading, setIsUploading] = React.useState(false);
    const displayEmail = user.email || (user.id && user.id.includes('@') ? user.id : null) || 'No Email';
    const currentUid = auth.currentUser?.uid;
    const targetUid = user.id || user.uid;
    const isMe = currentUid && (currentUid == targetUid);
    console.log('UserProfileModal Check:', { currentUid, targetUid, isMe, user });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) return alert("圖片太大 (Max 2MB)");
        if (!file.type.startsWith('image/')) return alert("只支援圖片格式");

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${user.uid || user.id}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Update Auth Profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: downloadURL });
                // Force reload or just let the real-time listener update
                // The user object passed in props might need time to sync, but Auth is immediate source of truth for self.
                window.location.reload(); // Simplest way to sync all states for now or trigger parent update?
                alert("頭像更新成功！");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("上傳失敗，請重試");
        } finally {
            setIsUploading(false);
        }
    };

    const handleResetAvatar = async () => {
        if (!window.confirm("確定要還原預設頭像 (Google/Initial)？")) return;
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: "" });
                window.location.reload();
            }
        } catch (error) {
            console.error("Reset failed", error);
            alert("還原失敗");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all relative overflow-hidden`} onClick={e => e.stopPropagation()}>

                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></div>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 z-10 transition-colors">
                    <X className="w-5 h-5 opacity-70" />
                </button>

                <div className="relative flex flex-col items-center mt-8">
                    {/* Avatar */}
                    <div className="relative mb-4 group">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-xl" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white dark:border-gray-900 shadow-xl">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        {user.role === 'owner' && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-1.5 rounded-full border-4 border-white dark:border-gray-900 shadow-sm" title="Owner">
                                <Shield className="w-4 h-4" />
                            </div>
                        )}
                        {/* Upload Overlay (Only for Me) */}
                        {isMe && (
                            <>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full cursor-pointer backdrop-blur-[1px] transition-all hover:bg-black/50"
                                >
                                    {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white/90 drop-shadow-md" />}
                                </label>
                            </>
                        )}
                    </div>

                    {/* V1.2.9: Explicit Actions for Avatar */}
                    {isMe && (
                        <div className="flex gap-3 mb-6">
                            <label htmlFor="avatar-upload" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full cursor-pointer transition-colors shadow-sm flex items-center gap-1.5">
                                <Camera className="w-3 h-3" /> 更換頭像
                            </label>
                            {user.photoURL && (
                                <button
                                    onClick={handleResetAvatar}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full transition-colors shadow-sm flex items-center gap-1.5"
                                >
                                    <RotateCcw className="w-3 h-3" /> 還原預設
                                </button>
                            )}
                        </div>
                    )}

                    {/* Name & Basic Info */}
                    <h3 className="text-xl font-bold mb-1">{user.name || 'Unknown User'}</h3>
                    <p className="text-sm opacity-60 font-medium mb-6">{displayEmail}</p>

                    {/* Details Grid */}
                    <div className="w-full space-y-3">
                        {/* ID (Admin Only) */}
                        {isAdmin && (
                            <div className={`p-3 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase font-bold opacity-50 tracking-wider">User ID (Admin View)</p>
                                    <p className="text-xs font-mono truncate select-all">{user.id}</p>
                                </div>
                            </div>
                        )}

                        {/* Join Date (If available) */}
                        {user.joinedAt && (
                            <div className={`p-3 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Joined Trip</p>
                                    <p className="text-xs font-medium">{formatDate(user.joinedAt)}</p>
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className={`p-3 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <div className={`p-2 rounded-lg ${user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-bold opacity-50 tracking-wider">Status</p>
                                <p className="text-xs font-medium capitalize">{user.status || 'Active'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
