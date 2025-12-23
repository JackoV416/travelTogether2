import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Bug, Lightbulb, CheckCircle, Clock, Trash2, User, Monitor, ExternalLink, Image as ImageIcon, Video, Users, Shield, ShieldAlert, BadgeAlert, Lock, Search, Plus, UserX, Unlock, Crown, Send, Sparkles, Smartphone, Tablet, Globe, AppWindow, ChevronDown } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDocs, setDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { buttonPrimary } from '../../constants/styles';
import { ADMIN_EMAILS } from '../../constants/appData';
import { inputClasses } from '../../utils/tripUtils';
import { generateTicketSummary } from '../../services/ai-parsing';
import { encryptMessage, decryptMessage } from '../../services/encryption';

const AdminFeedbackModal = ({ isOpen, onClose, isDarkMode, adminEmails = [], onUpdateAdminList }) => {
    const [activeTab, setActiveTab] = useState('feedback'); // feedback, users, admins

    // Toggle Admin status directly from User list
    const handleToggleAdmin = async (email, isCurrentAdmin) => {
        if (!email) return;
        if (confirm(`確定要${isCurrentAdmin ? '移除' : '設為'} 管理員？`)) {
            const newList = isCurrentAdmin
                ? adminEmails.filter(e => e !== email)
                : [...adminEmails, email];
            onUpdateAdminList?.(newList);
        }
    };

    const [feedbacks, setFeedbacks] = useState([]);
    const [users, setUsers] = useState([]);
    const [dynamicAdmins, setDynamicAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");

    // Chat State
    const [activeFeedback, setActiveFeedback] = useState(null);
    const [messages, setMessages] = useState([]);

    // Mobile View State: 'list' or 'chat'
    const [mobileView, setMobileView] = useState('list');

    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [pendingImage, setPendingImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // AI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiProgress, setAiProgress] = useState({ msg: '', percent: 0 });
    const abortControllerRef = useRef(null);

    const [autoGenPaused, setAutoGenPaused] = useState(false); // Circuit breaker for API Rate Limits
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (!isOpen) return;

        // 1. Feedbacks (Real-time)
        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
        const unsubFeedback = onSnapshot(q, (snapshot) => {
            setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 2. Users (Real-time or One-off? Real-time is better for ban status updates)
        const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 3. Dynamic Admins
        const unsubAdmins = onSnapshot(doc(db, "settings", "admin_config"), (doc) => {
            if (doc.exists()) {
                setDynamicAdmins(doc.data().admin_emails || []);
            } else {
                setDynamicAdmins([]);
            }
        });

        setLoading(false);

        return () => {
            unsubFeedback();
            unsubUsers();
            unsubAdmins();
        };
    }, [isOpen]);

    // --- Message Fetching for Active Feedback ---
    useEffect(() => {
        if (!activeFeedback?.id) {
            setMessages([]);
            return;
        }
        const q = query(
            collection(db, `feedback/${activeFeedback.id}/messages`),
            orderBy('timestamp', 'asc')
        );
        const unsub = onSnapshot(q, (snap) => {
            const fetchedMessages = snap.docs.map(d => {
                const data = d.data();
                // Decrypt message text if possible
                const decryptedText = decryptMessage(data.text);
                return { id: d.id, ...data, text: decryptedText };
            });

            // Legacy Compatibility: If no messages but feedback has old `message` field, convert it
            if (fetchedMessages.length === 0 && activeFeedback.message) {
                const legacyMessage = {
                    id: 'legacy-initial',
                    text: activeFeedback.message,
                    imageUrl: activeFeedback.imageUrl || null,
                    sender: 'user',
                    timestamp: activeFeedback.createdAt,
                    isLegacy: true
                };
                setMessages([legacyMessage]);
            } else {
                setMessages(fetchedMessages);
            }
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsub();
    }, [activeFeedback?.id, activeFeedback?.message, activeFeedback?.imageUrl, activeFeedback?.createdAt]);

    // --- Sync Active Feedback with Live Data ---
    useEffect(() => {
        if (activeFeedback?.id && feedbacks.length > 0) {
            const liveData = feedbacks.find(f => f.id === activeFeedback.id);
            if (liveData) {
                if (JSON.stringify(liveData) !== JSON.stringify(activeFeedback)) {
                    setActiveFeedback(liveData);
                }
            }
        }
    }, [feedbacks]);

    // Auto-switch to chat on mobile when selection changes
    useEffect(() => {
        if (activeFeedback) {
            setMobileView('chat');
        }
    }, [activeFeedback]);

    // Auto-switch to chat on mobile if activeFeedback allows
    useEffect(() => {
        if (activeFeedback && window.innerWidth < 768) {
            setMobileView('chat');
        }
    }, [activeFeedback]);

    // --- Send Admin Reply ---
    // --- Image Handling ---
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("圖片大小不能超過 5MB");
                return;
            }
            setPendingImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setPendingImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- Helper: Get User Avatar ---
    const getUserAvatar = (feedback) => {
        if (!feedback) return null;
        // 1. Try feedback doc (Snapshotted at creation)
        if (feedback.photoURL) return feedback.photoURL;

        // 2. Try users list lookup by ID
        if (feedback.userId) {
            const foundUser = users.find(u => u.id === feedback.userId);
            if (foundUser?.photoURL) return foundUser.photoURL;
        }

        // 3. Fallback: Lookup by Email (Legacy support)
        if (feedback.userEmail) {
            const foundByEmail = users.find(u => u.email === feedback.userEmail);
            if (foundByEmail?.photoURL) return foundByEmail.photoURL;
        }

        return null;
    };

    // --- Send Admin Reply ---
    const handleSendAdminMessage = async () => {
        if ((!newMessage.trim() && !pendingImage) || !activeFeedback) return;

        setIsSending(true);
        try {
            let imageUrl = null;

            // Upload Image if present
            if (pendingImage) {
                const storageRef = ref(storage, `feedback_attachments/${activeFeedback.id}/${Date.now()}_${pendingImage.name}`);
                await uploadBytes(storageRef, pendingImage);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Encrypt Message
            const encryptedText = encryptMessage(newMessage);

            await addDoc(collection(db, `feedback/${activeFeedback.id}/messages`), {
                text: encryptedText, // Store encrypted
                imageUrl: imageUrl,
                sender: 'admin',
                timestamp: serverTimestamp()
            });

            // Update lastMessage on parent doc
            // Show "[Admin Message]" in list instead of content to avoid leaking info in unencrypted fields
            await updateDoc(doc(db, "feedback", activeFeedback.id), {
                lastMessage: imageUrl ? '[圖片]' : `[Admin] ${newMessage.slice(0, 30)}...`, // This remains plaintext for preview (limit length) or use Generic
                hasUnreadAdmin: true, // Flag for user notification
                lastUpdate: serverTimestamp()
            });
            setNewMessage("");
            handleRemoveImage();
        } catch (e) {
            console.error("Send message error:", e);
        } finally {
            setIsSending(false);
        }
    };

    // --- AI Auto-Gen Title with Cancel ---
    const handleGenerateSummary = async (feedback, isAuto = false) => {
        if (!feedback) return;
        const textToAnalyze = feedback.message || (messages.length > 0 ? messages[0].text : "");

        if (!textToAnalyze) {
            if (!isAuto) alert("沒有足夠內容進行 Jarvis 分析");
            return;
        }

        // Cancel previous if running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new controller
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsGenerating(true);
        setAiProgress({ msg: '正在分析...', percent: 0 });

        try {
            const onProgress = (msg, percent) => setAiProgress({ msg, percent });

            // Pass signal to AI service
            const summary = await generateTicketSummary(textToAnalyze, onProgress, controller.signal);

            if (summary) {
                if (activeFeedback?.id === feedback.id) {
                    setActiveFeedback(prev => ({ ...prev, subject: summary }));
                }
                await updateDoc(doc(db, "feedback", feedback.id), { subject: summary });

                // If successful manual, unpause auto
                if (!isAuto) setAutoGenPaused(false);
            } else {
                // If failed but not cancelled
                if (isAuto) {
                    console.warn("AI Auto-Gen failed, falling back to message content");
                    const fallbackTitle = textToAnalyze.slice(0, 20) + (textToAnalyze.length > 20 ? "..." : "");
                    setFeedbacks(prev => prev.map(f => f.id === feedback.id ? { ...f, subject: fallbackTitle } : f));
                    updateDoc(doc(db, "feedback", feedback.id), { subject: fallbackTitle });
                } else {
                    // Manual trigger failed
                    alert("Jarvis 分析失敗，已轉用訊息內容作為標題");
                    const fallbackTitle = textToAnalyze.slice(0, 20) + (textToAnalyze.length > 20 ? "..." : "");
                    updateDoc(doc(db, "feedback", feedback.id), { subject: fallbackTitle });
                }
            }
        } catch (e) {
            if (e.message === 'Operation aborted' || e.name === 'AbortError') {
                console.log("AI Generation Cancelled by User");
                // Optional: Toast "已取消"
            } else {
                console.error(e);
                if (!isAuto) alert("Jarvis 分析失敗，請稍後再試");
            }
        } finally {
            setIsGenerating(false);
            setAiProgress({ msg: '', percent: 0 });
            abortControllerRef.current = null;
        }
    };

    const handleCancelAI = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            // Force UI update immediately
            setIsGenerating(false);
            setAiProgress({ msg: '已取消', percent: 0 });
            setTimeout(() => setAiProgress({ msg: '', percent: 0 }), 2000);
        }
    };

    // --- Auto-Set Title from Message (No AI) ---
    useEffect(() => {
        if (activeFeedback && !activeFeedback.subject && messages.length > 0) {
            // Default to first 20 chars of message
            const firstMsg = messages[0].text || "";
            const fallbackTitle = firstMsg.slice(0, 20) + (firstMsg.length > 20 ? "..." : "");

            // Local update
            setActiveFeedback(prev => ({ ...prev, subject: fallbackTitle }));

            // Server update
            const feedbackRef = doc(db, "feedback", activeFeedback.id);
            updateDoc(feedbackRef, { subject: fallbackTitle });
        }
    }, [activeFeedback?.id, messages]);

    // --- Feedback Actions ---
    const handleUpdateStatus = async (id, newStatus) => {
        await updateDoc(doc(db, "feedback", id), { status: newStatus });
    };

    const handleDeleteFeedback = async (id) => {
        if (confirm("確定刪除此回饋？")) {
            await deleteDoc(doc(db, "feedback", id));
        }
    };

    // --- User Actions ---
    const handleToggleBan = async (uid, currentBanStatus) => {
        const action = currentBanStatus ? "解除封鎖" : "封鎖";
        if (confirm(`確定要${action}此用戶嗎？`)) {
            await updateDoc(doc(db, "users", uid), { isBanned: !currentBanStatus });
        }
    };

    // --- Admin Actions ---
    const handleAddAdmin = async () => {
        if (!newAdminEmail.trim()) return;
        if (ADMIN_EMAILS.includes(newAdminEmail) || dynamicAdmins.includes(newAdminEmail)) {
            return alert("此 Email 已經是管理員");
        }

        try {
            const docRef = doc(db, "settings", "admin_config");
            await setDoc(docRef, {
                admin_emails: arrayUnion(newAdminEmail)
            }, { merge: true });
            setNewAdminEmail("");
        } catch (error) {
            console.error("Error adding admin:", error);
            alert("新增失敗");
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (confirm(`確定移除 ${email} 的管理員權限？`)) {
            const docRef = doc(db, "settings", "admin_config");
            await updateDoc(docRef, {
                admin_emails: arrayRemove(email)
            });
        }
    };

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        (u.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-0 md:p-6 backdrop-blur-sm animate-fade-in">
            <div className={`w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2`}></div>

                {/* Header */}
                {/* Header */}
                <div className={`px-6 py-4 flex justify-between items-center flex-shrink-0 z-20 ${isDarkMode ? 'bg-gray-900/95 border-b border-white/5' : 'bg-white/95 border-b border-gray-100'}`}>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                {/* Mobile Back Button for Users/Admins tabs if needed, but tabs handle navigation */}
                                <ShieldAlert className="w-6 h-6 text-indigo-500" />
                                管理員後台
                            </h3>
                            <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold ml-1 md:ml-8">Admin Console</span>
                        </div>

                        {/* Mobile Tabs Dropdown or Scroll */}
                        <div className="md:hidden flex gap-2">
                            {/* Simplified Mobile Tabs */}
                            {[
                                { id: 'feedback', icon: MessageCircle },
                                { id: 'users', icon: Users },
                                { id: 'admins', icon: Shield }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setMobileView('list'); }}
                                    className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-gray-500/10 dark:bg-white/5 text-gray-400 dark:text-gray-500'}`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>

                        {/* Tabs - Pill Design */}
                        <div className={`hidden md:flex p-1 rounded-full border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-100/50 border-gray-200'}`}>
                            {[
                                { id: 'feedback', label: '回饋', icon: MessageCircle, count: feedbacks.filter(f => f.status === 'open').length },
                                { id: 'users', label: '用戶', icon: Users, count: users.length },
                                { id: 'admins', label: '設定', icon: Shield, count: dynamicAdmins.length + ADMIN_EMAILS.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'opacity-60 hover:opacity-100 hover:bg-gray-500/10'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                    {tab.count > 0 && <span className={`text-[9px] px-1.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-500/20'}`}>{tab.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-gray-500/5">

                    {/* --- FEEDBACK TAB --- */}
                    {/* --- FEEDBACK TAB (2-Column Layout) --- */}
                    {activeTab === 'feedback' && (

                        <div className="flex h-full gap-4 overflow-hidden relative">
                            {/* Left: Feedback List - Hidden on Mobile if in Chat view */}
                            <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar`}>
                                {feedbacks.length === 0 ? (
                                    <div className="text-center py-20 opacity-30 font-bold text-lg">目前沒有回饋</div>
                                ) : (
                                    feedbacks.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                setActiveFeedback(item);
                                                setMobileView('chat');
                                            }}
                                            className={`relative p-4 rounded-xl border cursor-pointer transition-all overflow-hidden ${activeFeedback?.id === item.id
                                                ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50'
                                                : (isDarkMode ? 'bg-gray-800/50 border-white/5 hover:bg-white/5' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm')
                                                } ${item.status === 'resolved' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${item.type === 'bug' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>{item.type || 'FDBK'}</span>
                                                    {item.status === 'resolved' && <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded font-bold">DONE</span>}
                                                    {item.status === 'processing' && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold">WIP</span>}
                                                </div>
                                                <span className="text-[10px] opacity-40 whitespace-nowrap">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Now'}</span>
                                            </div>
                                            <h4 className="font-bold text-sm line-clamp-1 mb-1">{item.subject || item.message || 'No Subject'}</h4>
                                            <div className="text-xs opacity-50 line-clamp-2">{item.lastMessage || item.message}</div>
                                            <div className="flex items-center justify-between mt-3 text-[10px] opacity-40">
                                                <div className="flex items-center gap-2">
                                                    {/* Avatar Tiny */}
                                                    <div className="w-4 h-4 rounded-full bg-gray-500/20 overflow-hidden flex items-center justify-center">
                                                        {getUserAvatar(item) ? (
                                                            <img src={getUserAvatar(item)} className="w-full h-full object-cover" alt="avatar" />
                                                        ) : (
                                                            <User className="w-2.5 h-2.5" />
                                                        )}
                                                    </div>
                                                    <span>{item.userName?.split(' ')[0] || 'User'}</span>
                                                </div>
                                                {(item.imageUrl || item.videoUrl) && <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> 附件</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Right: Chat Panel - Hidden on Mobile if in List view */}
                            <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col rounded-3xl overflow-hidden border transition-all ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-indigo-500/5'} absolute inset-0 md:relative z-30 md:z-auto`}>
                                {!activeFeedback ? (
                                    <div className="text-center opacity-30">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                                        <p>請選擇一個回饋以查看詳情</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Chat Header */}
                                        <div className={`p-4 border-b flex justify-between items-start z-10 ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex gap-3">
                                                {/* User Avatar Large */}
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 overflow-hidden border-2 border-white dark:border-white/10 shadow-sm flex items-center justify-center flex-shrink-0">
                                                    {getUserAvatar(activeFeedback) ? (
                                                        <img src={getUserAvatar(activeFeedback)} alt="User" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white font-bold text-lg">{activeFeedback.userName?.[0]?.toUpperCase() || 'U'}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <button onClick={() => setMobileView('list')} className="md:hidden p-1 -ml-1 rounded-full hover:bg-white/10"><ChevronDown className="w-5 h-5 rotate-90" /></button>
                                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${activeFeedback.type === 'bug' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>{activeFeedback.type || 'Support'}</span>
                                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                                            {activeFeedback.subject || activeFeedback.id}
                                                            {!activeFeedback.subject && (
                                                                <div className="flex items-center gap-2">
                                                                    {!isGenerating ? (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleGenerateSummary(activeFeedback, false); }}
                                                                            className="text-indigo-500 hover:bg-indigo-500/10 p-1 rounded-full transition-colors"
                                                                            title="AI Auto-Summarize Title"
                                                                        >
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/30">
                                                                            <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-300 min-w-[60px] whitespace-nowrap">
                                                                                {aiProgress.percent > 0 ? `${aiProgress.percent}%` : 'init...'}
                                                                            </span>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleCancelAI(); }}
                                                                                className="p-0.5 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                                                                title="停止 Jarvis 分析"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </h3>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 text-xs opacity-60">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3 h-3" /> {activeFeedback.userName || 'Anonymous'} <span className="opacity-50">({activeFeedback.userEmail || activeFeedback.id.slice(0, 8)})</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* Smart Device Info Display */}
                                                            {(() => {
                                                                const info = activeFeedback.deviceInfo;
                                                                const isPWA = info?.isPWA;
                                                                const isMobile = info?.device?.includes('iPhone') || info?.device?.includes('Android') || info?.device?.includes('Mobile');

                                                                // Icon Logic
                                                                let DeviceIcon = Monitor;
                                                                if (isPWA) DeviceIcon = AppWindow;
                                                                else if (isMobile) DeviceIcon = Smartphone;

                                                                return (
                                                                    <span className="flex items-center gap-1.5 bg-gray-500/5 px-2 py-1 rounded text-xs">
                                                                        <DeviceIcon className="w-3.5 h-3.5 opacity-70" />
                                                                        {info ? (
                                                                            <span className="font-medium opacity-80">
                                                                                {info.device} • {info.os} • {info.browser}
                                                                                {isPWA && <span className="ml-1 text-indigo-500 font-bold text-[10px] uppercase border border-indigo-500/30 px-1 rounded">PWA</span>}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="opacity-50 italic">
                                                                                Legacy Device ({activeFeedback.systemInfo?.screenSize || 'Unknown'})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Switcher */}
                                            <div className="flex bg-gray-500/10 p-1 rounded-lg">
                                                {[
                                                    { id: 'open', label: '未處理', color: 'text-red-500' },
                                                    { id: 'processing', label: '處理中', color: 'text-yellow-500' },
                                                    { id: 'resolved', label: '已完成', color: 'text-green-500' }
                                                ].map(status => (
                                                    <button
                                                        key={status.id}
                                                        onClick={() => handleUpdateStatus(activeFeedback.id, status.id)}
                                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeFeedback.status === status.id ? 'bg-white shadow-sm dark:bg-gray-700 ' + status.color : 'opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                                    >
                                                        {status.label}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete?')) {
                                                            handleDeleteFeedback(activeFeedback.id);
                                                            setActiveFeedback(null);
                                                        }
                                                    }}
                                                    className="ml-1 p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 opacity-50 hover:opacity-100 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Chat Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-500/5">
                                            {messages.map((msg, idx) => {
                                                const isAdminIdx = msg.sender === 'admin';
                                                return (
                                                    <div key={msg.id || idx} className={`flex ${isAdminIdx ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                                        {/* Avatar for User (Non-Admin) Messages */}
                                                        {!isAdminIdx && (
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center">
                                                                {getUserAvatar(activeFeedback) ? (
                                                                    <img src={getUserAvatar(activeFeedback)} alt="User" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User className="w-4 h-4 text-gray-500" />
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${isAdminIdx ? 'bg-indigo-600 text-white rounded-br-none' : (isDarkMode ? 'bg-gray-800 text-gray-200 rounded-bl-none' : 'bg-white border shadow-sm rounded-bl-none text-gray-800')}`}>
                                                            {msg.imageUrl && (
                                                                <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                                                    <img src={msg.imageUrl} alt="attachment" className="rounded-lg mb-2 max-w-full max-h-48 object-cover hover:opacity-90" />
                                                                </a>
                                                            )}
                                                            {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                                                            <div className={`text-[10px] mt-1 opacity-50 ${isAdminIdx ? 'text-right' : 'text-left'}`}>
                                                                {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                            </div>
                                                        </div>

                                                        {/* Avatar for Admin Messages */}
                                                        {isAdminIdx && (
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 overflow-hidden border border-indigo-600 shadow-sm flex items-center justify-center text-white">
                                                                <Shield className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Area */}
                                        <div className={`p-3 border-t ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-white border-gray-100'}`}>
                                            {/* Image Preview */}
                                            {imagePreview && (
                                                <div className="mb-2 relative w-fit group">
                                                    <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-gray-500/20" />
                                                    <button
                                                        onClick={handleRemoveImage}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}

                                            <div className={`flex items-center gap-2 p-2 rounded-xl transition-all border ${isDarkMode ? 'bg-gray-800/50 border-white/5 focus-within:border-indigo-500/50' : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500/30'}`}>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageSelect}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                                    title="Upload Image"
                                                >
                                                    <ImageIcon className="w-5 h-5" />
                                                </button>
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                                                    placeholder="回覆用戶..."
                                                    className="flex-1 bg-transparent border-none outline-none text-sm px-2"
                                                    disabled={isSending}
                                                />
                                                <button
                                                    onClick={handleSendAdminMessage}
                                                    disabled={(!newMessage.trim() && !pendingImage) || isSending}
                                                    className={`p-2 rounded-lg transition-all ${newMessage.trim() ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'opacity-30 cursor-not-allowed'}`}
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- USERS TAB --- */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            {/* Sticky Search Bar */}
                            <div className={`sticky top-0 z-20 pb-4 pt-2 transition-colors ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
                                <div className={`relative flex items-center px-4 py-3 rounded-2xl border transition-all duration-300 group ${isDarkMode ? 'bg-gray-900 border-white/5 focus-within:border-indigo-500/50 focus-within:bg-gray-800' : 'bg-gray-50 border-gray-100 focus-within:border-indigo-500/30 focus-within:bg-white focus-within:shadow-md'}`}>
                                    <Search className={`w-5 h-5 mr-3 transition-colors ${isDarkMode ? 'text-gray-600 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="搜尋用戶..."
                                        className="bg-transparent border-none outline-none w-full text-base font-medium placeholder-gray-500/50"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="p-1.5 rounded-full bg-gray-500/10 hover:bg-gray-500/20 text-gray-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Grid */}
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                {[...users].sort((a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0)).filter(u => u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm)).map(user => {
                                    const displayEmail = user.email || (user.id && user.id.includes('@') ? user.id : null);
                                    const displayName = user.displayName || (displayEmail ? displayEmail.split('@')[0] : `User ${user.id.slice(0, 6)}`);
                                    const hasValidEmail = !!displayEmail;

                                    return (
                                        <div key={user.id} className="relative group p-4 rounded-xl border border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    {/* Avatar */}
                                                    <div className="relative">
                                                        {user.photoURL ? (
                                                            <img src={user.photoURL} alt={displayName} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
                                                        ) : (
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${user.isBanned ? 'bg-red-500' : 'bg-indigo-500'}`}>
                                                                {displayName[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                        {user.isBanned && (
                                                            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-white dark:border-gray-900">
                                                                <Lock className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="min-w-0 flex flex-col justify-center">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h4 className="font-bold text-sm truncate text-gray-200">{displayName}</h4>
                                                            {user.isBanned && <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">BANNED</span>}
                                                        </div>
                                                        <div className="text-xs opacity-50 font-mono truncate select-all mb-1">{displayEmail || 'No Email'}</div>

                                                        <div className="flex items-center gap-3 text-[10px] opacity-40 font-mono">
                                                            <span className="truncate max-w-[80px]" title={user.id}>ID: {user.id.slice(0, 8)}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                                            <span>{user.lastLogin?.seconds ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : (user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'New')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Admin Toggle */}
                                                    <button
                                                        onClick={() => hasValidEmail && handleToggleAdmin(displayEmail, adminEmails.includes(displayEmail))}
                                                        disabled={!hasValidEmail || ADMIN_EMAILS.includes(displayEmail)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${displayEmail && adminEmails.includes(displayEmail) ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-indigo-500 hover:text-white dark:bg-gray-700 dark:text-gray-300'} ${(!hasValidEmail || ADMIN_EMAILS.includes(displayEmail)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title={!hasValidEmail ? "No Valid Email" : (ADMIN_EMAILS.includes(displayEmail) ? "System Core Admin" : "Toggle Admin Rights")}
                                                    >
                                                        <Crown className="w-3 h-3" />
                                                        {displayEmail && adminEmails.includes(displayEmail) ? "移除管理員" : "設為管理員"}
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${user.isBanned ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600' : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white dark:bg-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        {user.isBanned ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                        {user.isBanned ? "解除封鎖" : "封鎖帳戶"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* --- ADMINS TAB --- */}
                    {activeTab === 'admins' && (
                        <div className="space-y-6">
                            {/* Add Admin */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-white/5' : 'bg-white border-gray-200'}`}>
                                <h4 className="font-bold text-sm uppercase tracking-wider opacity-70 mb-4">新增管理員</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        placeholder="輸入 Google Email..."
                                        className={inputClasses(isDarkMode)}
                                    />
                                    <button onClick={handleAddAdmin} disabled={!newAdminEmail} className={`${buttonPrimary} whitespace-nowrap px-6`}>
                                        <Plus className="w-4 h-4 mr-2" /> 新增
                                    </button>
                                </div>
                            </div>

                            {/* Admin List */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">現任管理員</h4>
                                <div className="space-y-3">
                                    {[...ADMIN_EMAILS, ...dynamicAdmins].map((email, idx) => {
                                        const isSystem = ADMIN_EMAILS.includes(email);
                                        // Assumption: Owner is first in ADMIN_EMAILS or specifically "jamiekwok416@gmail.com"
                                        // For safety, we block removing ANY System Admin
                                        const isOwner = email === "jamiekwok416@gmail.com" || isSystem;

                                        return (
                                            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isSystem ? 'bg-indigo-500/10 text-indigo-500' : 'bg-pink-500/10 text-pink-500'}`}>
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{email}</div>
                                                        <div className="text-[10px] opacity-50 uppercase tracking-widest font-bold">
                                                            {isSystem ? 'System Owner' : 'Dynamic Admin'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isOwner && (
                                                    <button
                                                        onClick={() => handleRemoveAdmin(email)}
                                                        className="p-2 rounded-lg bg-gray-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                        title="Remove Admin"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {isOwner && (
                                                    <div className="p-2 opacity-30 cursor-not-allowed" title="Cannot remove Owner">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminFeedbackModal;
