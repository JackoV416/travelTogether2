import React, { useState } from 'react';
import { X, Send, MessageCircle, Bug, Lightbulb, AlertCircle, CheckCircle, Loader2, Upload, Video, Image as ImageIcon, Trash2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { buttonPrimary } from '../../constants/styles';
import { inputClasses } from '../../utils/tripUtils';
import { checkAbuse } from '../../services/security';

const FeedbackModal = ({ isOpen, onClose, user, isDarkMode, isBanned }) => {
    const [type, setType] = useState('bug'); // bug, feature, other
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [videoUrl, setVideoUrl] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("圖片大小不能超過 5MB");
                return;
            }
            setImage(file);
        }
    };

    const handleSubmit = async () => {
        if (isBanned) return alert("您的帳戶已被鎖定，無法發送回饋。");
        if (!message.trim()) return alert("請輸入內容");

        // Abuse Check
        const isAbuse = await checkAbuse(user, 'send_feedback');
        if (isAbuse) return alert("檢測到異常活動，您的帳戶已被鎖定。");

        setLoading(true);
        try {
            let imageUrl = null;
            if (image) {
                const storageRef = ref(storage, `feedback_images/${Date.now()}_${image.name}`);
                const snapshot = await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, "feedback"), {
                type,
                message,
                email,
                videoUrl: videoUrl.trim() || null,
                imageUrl,
                uid: user?.uid || 'anonymous',
                userName: user?.displayName || 'Guest',
                createdAt: serverTimestamp(),
                status: 'open',
                systemInfo: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    screenSize: `${window.innerWidth}x${window.innerHeight}`,
                    timestamp: new Date().toISOString()
                }
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSuccess(false);
                setMessage('');
                setImage(null);
                setVideoUrl('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("發送失敗，請稍後再試。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border transition-all overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gray-500/5">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                        意見回饋
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-2">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold">感謝您的回饋！</h4>
                        <p className="opacity-70 text-sm">我們會盡快處理您的意見。</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Type Selection */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'bug', label: '回報錯誤', icon: Bug },
                                { id: 'feature', label: '功能建議', icon: Lightbulb },
                                { id: 'other', label: '其他意見', icon: MessageCircle }
                            ].map(t => {
                                const Icon = t.icon;
                                const isSelected = type === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id)}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected ? 'bg-indigo-500 text-white border-indigo-500 ring-2 ring-indigo-500/30' : (isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')}`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'opacity-50'}`} />
                                        <span className="text-xs font-bold">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">
                                {type === 'bug' ? '問題描述' : type === 'feature' ? '功能想法' : '意見內容'}
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className={`${inputClasses(isDarkMode)} min-h-[120px] resize-none`}
                                placeholder={type === 'bug' ? "請描述遇到的問題、發生步驟..." : "告訴我們您的想法..."}
                            />
                        </div>

                        {/* Attachments */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">附件 (選填)</label>

                            {/* Image Upload */}
                            <div className="flex items-center gap-2">
                                <input type="file" id="feedback-image" accept="image/*" className="hidden" onChange={handleImageChange} />
                                <label htmlFor="feedback-image" className={`flex-1 p-3 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${image ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-gray-500/20 hover:border-gray-500/40'}`}>
                                    {image ? (
                                        <>
                                            <ImageIcon className="w-4 h-4" />
                                            <span className="text-sm truncate max-w-[150px]">{image.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 opacity-50" />
                                            <span className="text-sm opacity-50">上載截圖 (Max 5MB)</span>
                                        </>
                                    )}
                                </label>
                                {image && (
                                    <button onClick={() => setImage(null)} className="p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Video URL */}
                            <div className="relative">
                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                <input
                                    type="text"
                                    value={videoUrl}
                                    onChange={e => setVideoUrl(e.target.value)}
                                    className={`${inputClasses(isDarkMode)} pl-10`}
                                    placeholder="影片連結 (YouTube/Google Drive...)"
                                />
                            </div>
                        </div>

                        {/* Email Input (Optional) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1">聯絡 Email (選填)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={inputClasses(isDarkMode)}
                                placeholder="以便我們回覆您..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !message.trim()}
                            className={`${buttonPrimary} w-full py-3 rounded-xl shadow-lg font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            發送回饋
                        </button>

                        <div className="text-[10px] text-center opacity-40">
                            系統將自動收集基本診斷資訊 (瀏覽器版本、作業系統) 以協助排查問題。
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
