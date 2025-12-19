import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Bug, Lightbulb, CheckCircle, Clock, Trash2, User, Monitor, ExternalLink, Image as ImageIcon, Video, Users, Shield, ShieldAlert, BadgeAlert, Lock, Search, Plus, UserX, Unlock } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDocs, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { buttonPrimary } from '../../constants/styles';
import { ADMIN_EMAILS } from '../../constants/appData';
import { inputClasses } from '../../utils/tripUtils';

const AdminFeedbackModal = ({ isOpen, onClose, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState('feedback'); // feedback, users, admins
    const [feedbacks, setFeedbacks] = useState([]);
    const [users, setUsers] = useState([]);
    const [dynamicAdmins, setDynamicAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");

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

    // --- Feedback Actions ---
    const handleResolve = async (id, currentStatus) => {
        const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
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
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border transition-all flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gray-500/5 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                                管理員後台
                            </h3>
                            <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Admin Console</span>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-500/10 rounded-lg ml-8">
                            {[
                                { id: 'feedback', label: '回饋中心', icon: MessageCircle, count: feedbacks.filter(f => f.status === 'open').length },
                                { id: 'users', label: '用戶管理', icon: Users, count: users.length },
                                { id: 'admins', label: '權限設定', icon: Shield, count: dynamicAdmins.length + ADMIN_EMAILS.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white shadow-md' : 'hover:bg-gray-500/10 opacity-70 hover:opacity-100'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-500/20'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-gray-500/5">

                    {/* --- FEEDBACK TAB --- */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-4">
                            {feedbacks.length === 0 ? (
                                <div className="text-center py-20 opacity-30 font-bold text-lg">目前沒有回饋</div>
                            ) : (
                                feedbacks.map(item => (
                                    <div key={item.id} className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'} ${item.status === 'resolved' ? 'opacity-50 grayscale-[0.8]' : ''}`}>
                                        <div className="flex gap-4">
                                            <div className={`p-3 rounded-xl h-fit ${item.type === 'bug' ? 'bg-red-500/10 text-red-500' : item.type === 'feature' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {item.type === 'bug' ? <Bug className="w-5 h-5" /> : item.type === 'feature' ? <Lightbulb className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.type === 'bug' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>{item.type}</span>
                                                        <span className="text-xs opacity-40 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleResolve(item.id, item.status)} className={`p-1.5 rounded-lg transition-colors ${item.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-gray-500/10 hover:bg-green-500/10 hover:text-green-500'}`} title="Mark Resolved"><CheckCircle className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteFeedback(item.id)} className="p-1.5 rounded-lg bg-gray-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{item.message}</p>

                                                {/* Attachments */}
                                                {(item.imageUrl || item.videoUrl) && (
                                                    <div className="flex gap-2 pt-2">
                                                        {item.imageUrl && (
                                                            <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold hover:bg-indigo-500/20 transition-colors">
                                                                <ImageIcon className="w-3 h-3" /> 截圖附件 <ExternalLink className="w-3 h-3 opacity-50" />
                                                            </a>
                                                        )}
                                                        {item.videoUrl && (
                                                            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-500 text-xs font-bold hover:bg-pink-500/20 transition-colors">
                                                                <Video className="w-3 h-3" /> 影片連結 <ExternalLink className="w-3 h-3 opacity-50" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="text-xs opacity-40 pt-3 border-t border-gray-500/10 flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.userName} ({item.email || 'No email'})</span>
                                                    <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {item.systemInfo?.screenSize}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* --- USERS TAB --- */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            {/* Sticky Search Bar */}
                            <div className={`sticky top-0 z-20 pb-4 pt-1 transition-colors ${isDarkMode ? 'bg-gray-900 border-b border-gray-700/50' : 'bg-white border-b border-gray-100'}`}>
                                <div className={`relative flex items-center px-4 py-3 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 focus-within:ring-2 focus-within:ring-indigo-500/50' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500/20'}`}>
                                    <Search className="w-5 h-5 opacity-40 mr-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="🔍 搜尋用戶名稱、Email 或 User ID..."
                                        className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="p-1 rounded-full hover:bg-gray-500/20 text-gray-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Grid */}
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className={`p-4 rounded-xl border transition-all group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:shadow-sm'} ${user.isBanned ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4 min-w-0">
                                                {/* Avatar */}
                                                <div className="relative">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.displayName} className={`w-12 h-12 rounded-full object-cover border-2 ${user.isBanned ? 'border-red-500 grayscale' : 'border-indigo-500/20'}`} />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 ${user.isBanned ? 'bg-red-500 border-red-500' : 'bg-indigo-500 border-indigo-500/20'}`}>
                                                            {user.displayName?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                    {user.isBanned && (
                                                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-white dark:border-gray-900">
                                                            <Lock className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm truncate">{user.displayName || 'No Name'}</h4>
                                                        {user.isBanned && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">BANNED</span>}
                                                    </div>
                                                    <div className="text-xs opacity-60 font-mono truncate select-all">{user.email}</div>
                                                    <div className="flex items-center gap-3 text-[10px] opacity-40">
                                                        <span className="font-mono select-all" title="User ID">ID: {user.id.slice(0, 8)}...</span>
                                                        <span>•</span>
                                                        <span>Last: {user.lastLogin?.seconds ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- ADMINS TAB --- */}
                    {activeTab === 'admins' && (
                        <div className="space-y-6">
                            {/* Add Admin */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
        </div>
    );
};

export default AdminFeedbackModal;
