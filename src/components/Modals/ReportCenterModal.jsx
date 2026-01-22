import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Smartphone, Monitor, HelpCircle, ChevronDown, ChevronUp, RefreshCw, Wifi, CloudOff, Database, Smartphone as Phone, Lightbulb, Clock, MessageCircle, Plus, Link as LinkIcon, Sparkles, Bot, Brain } from 'lucide-react';
import { isMobile, isIOS, isAndroid, isMacOs, isWindows, osName, osVersion, deviceType, browserName, mobileModel } from 'react-device-detect';

import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../firebase';
import { APP_VERSION, JARVIS_VERSION } from '../../constants/appData';
import { buttonPrimary } from '../../constants/styles';
import { generateTicketSummary } from '../../services/ai-parsing';
import { encryptMessage, decryptMessage } from '../../services/encryption';

// === User FAQ Data ===
const FAQ_DATA = [
    {
        q: '為何版本唔 update？點樣 update？',
        a: '如果你用緊 PWA (已安裝到主畫面)，可以嘗試：\n1. 關閉並重新開啟 App\n2. 清除瀏覽器緩存\n3. 喺「設定」頁面撳「檢查更新」\n4. 如果仲唔得，可以刪除後重新安裝',
        icon: RefreshCw
    },
    {
        q: '點解手機同電腦資料唔同步？',
        a: '資料同步需要網絡連線。請確保：\n1. 你喺兩部裝置都用同一個帳戶登入\n2. 網絡連線正常\n3. 等待幾秒俾系統同步\n如果仍然唔同步，請登出後重新登入',
        icon: Wifi
    },
    {
        q: '點解無 save 我嘅紀錄？',
        a: '紀錄需要網絡連線先可以儲存。如果你離線使用，資料可能暫時未上傳。建議：\n1. 確保網絡連線穩定\n2. 等待「已儲存」提示出現\n3. 避免喺儲存完成前關閉 App',
        icon: CloudOff
    },
    {
        q: '點解唔見咗紀錄？',
        a: '紀錄可能因為以下原因消失：\n1. 用咗訪客模式 (資料只存本地)\n2. 清除咗瀏覽器資料\n3. 登入咗另一個帳戶\n請確認你用緊正確嘅帳戶登入',
        icon: Database
    },
    {
        q: 'App 行得好慢點算？',
        a: '可以嘗試：\n1. 關閉其他應用程式\n2. 清除瀏覽器緩存\n3. 重新整理頁面\n4. 確保網絡速度正常',
        icon: Phone
    },
    {
        q: '點樣匯出/備份我嘅行程？',
        a: '喺「我的行程」頁面，你可以：\n1. 撳「匯出」按鈕將行程匯出為 JSON 檔案\n2. 用「匯入」功能喺新裝置還原\n建議定期備份重要行程！',
        icon: Database
    }
];

const ReportCenterModal = ({ isOpen, onClose, isDarkMode, user, onOpenJarvis }) => {
    // 1. Navigation State: 'faq', 'form', 'list', 'chat'
    const VIEWS = ['faq', 'form', 'list'];
    const [view, setView] = useState('faq');
    const [category, setCategory] = useState('bug'); // 'bug', 'suggestion', 'other'
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const formImageRef = useRef(null);

    // Categories Config
    const CATEGORIES = [
        { id: 'bug', label: '程式問題/錯誤', icon: CloudOff, color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: 'suggestion', label: '功能建議/改善', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { id: 'other', label: '其他查詢', icon: MessageCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
    ];

    // 2. Enhanced Device Identification
    const getDetailedDeviceInfo = () => {
        const u = navigator.userAgent;
        let model = mobileModel || deviceType || 'Unknown Device';

        // Try to get specific hardware identifier if hidden in UA or provided by browser
        if (isIOS) {
            // Simplified dimension mapping for demo/common cases
            const width = window.screen.width;
            const height = window.screen.height;
            const ratio = window.devicePixelRatio;

            if (width === 430 && height === 932 && ratio === 3) model = 'iPhone 15/16 Pro Max';
            else if (width === 393 && height === 852 && ratio === 3) model = 'iPhone 15/16 Pro';
            else if (width === 428 && height === 926 && ratio === 3) model = 'iPhone 13/14 Pro Max';
            else if (width === 390 && height === 844 && ratio === 3) model = 'iPhone 13/14 Pro';
            // Fallback to mobileModel which might return 'iPhone'
        }

        return {
            os: `${osName} ${osVersion}`,
            device: model,
            browser: browserName,
            isPWA: (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true),
            appVersion: APP_VERSION,
            screen: `${window.innerWidth}x${window.innerHeight}`
        };
    };

    const deviceInfo = getDetailedDeviceInfo();

    // Ticket Status Config
    const STATUS_CONFIG = {
        open: { label: '未處理', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
        processing: { label: '處理中', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
        resolved: { label: '已完成', color: 'bg-green-500/10 text-green-500 border-green-500/20' }
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG['open'];
        return <span className={`text-[10px] px-2 py-0.5 rounded border ${config.color}`}>{config.label}</span>;
    };

    // 3. Data Fetching (Only if logged in)
    useEffect(() => {
        if (!user?.uid || !isOpen) return;
        const q = query(collection(db, 'feedback'), where('userId', '==', user.uid));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setTickets(list);
        }, (err) => {
            console.warn("Report Center tickets listener error:", err.message);
        });
        return () => unsub();
    }, [user?.uid, isOpen]);

    useEffect(() => {
        if (view !== 'chat' || !activeTicket?.id) {
            setMessages([]);
            return;
        }
        const q = query(collection(db, `feedback/${activeTicket.id}/messages`), orderBy('timestamp', 'asc'));
        const unsub = onSnapshot(q, (snap) => {
            const fetched = snap.docs.map(d => {
                const data = d.data();
                return { id: d.id, ...data, text: decryptMessage(data.text) };
            });
            if (fetched.length === 0 && activeTicket.message) {
                setMessages([{ id: 'legacy', text: activeTicket.message, imageUrl: activeTicket.imageUrl, sender: 'user', timestamp: activeTicket.createdAt, isLegacy: true }]);
            } else {
                setMessages(fetched);
            }
            scrollToBottom();
        }, (err) => {
            console.warn("Report Center chat listener error:", err.message);
        });
        return () => unsub();
    }, [view, activeTicket?.id]);

    if (!isOpen) return null;

    const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    const handleCreateTicket = async () => {
        if (!newMessage.trim() && !selectedImage) return;
        setIsSending(true);
        try {
            let directImageUrl = null;
            if (selectedImage) {
                const storageRef = ref(storage, `feedback/${user.uid}/${Date.now()}_${selectedImage.name}`);
                await uploadBytes(storageRef, selectedImage);
                directImageUrl = await getDownloadURL(storageRef);
            }

            const catLabel = CATEGORIES.find(c => c.id === category)?.label || '其他查詢';
            const docRef = await addDoc(collection(db, 'feedback'), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Anonymous',
                subject: catLabel,
                category,
                status: 'open',
                createdAt: serverTimestamp(),
                lastUpdate: serverTimestamp(),
                deviceInfo,
                lastMessage: newMessage.slice(0, 50),
                externalUrl: newUrl.trim() || null
            });

            const encryptedText = encryptMessage(newMessage + (newUrl.trim() ? `\n\n網址: ${newUrl.trim()}` : ''));
            await addDoc(collection(db, `feedback/${docRef.id}/messages`), {
                text: encryptedText,
                imageUrl: directImageUrl,
                sender: 'user',
                timestamp: serverTimestamp()
            });

            generateTicketSummary(newMessage, user.uid).then(summary => {
                if (summary) updateDoc(doc(db, 'feedback', docRef.id), { subject: `${catLabel}: ${summary}` });
            });

            setActiveTicket({ id: docRef.id, subject: catLabel });
            setView('chat');
            setNewMessage("");
            setNewUrl("");
            setSelectedImage(null);
            setCategory('bug');
        } catch (e) {
            alert("創建失敗，請稍後再試。");
        } finally {
            setIsSending(false);
        }
    };

    const handleSendMessage = async (imageUrl = null) => {
        if ((!newMessage.trim() && !imageUrl) || !activeTicket) return;
        setIsSending(true);
        try {
            await addDoc(collection(db, `feedback/${activeTicket.id}/messages`), {
                text: encryptMessage(newMessage),
                imageUrl,
                sender: 'user',
                timestamp: serverTimestamp()
            });
            setNewMessage("");
            scrollToBottom();
        } catch (e) { console.error(e); } finally { setIsSending(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsSending(true);
        try {
            const storageRef = ref(storage, `feedback/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await handleSendMessage(url);
        } catch (error) { alert("上傳失敗"); } finally { setIsSending(false); }
    };

    // Dark Mode Theme Values (AGGRESSIVE FIX)
    const panelBg = isDarkMode ? 'bg-[#020617]' : 'bg-white';
    const cardBg = isDarkMode ? 'bg-white/5 border-transparent' : 'bg-gray-50 border-gray-200';
    const inputBg = isDarkMode ? 'bg-white/5 border-transparent' : 'bg-gray-50 border-gray-200';
    const textMain = isDarkMode ? 'text-slate-100' : 'text-gray-900';
    const textSub = isDarkMode ? 'text-slate-400' : 'text-gray-500';
    const modalBorder = isDarkMode ? 'border-transparent' : 'border-gray-200';

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-2xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${modalBorder} ${panelBg}`}>

                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                            {view === 'faq' ? <HelpCircle className="w-5 h-5" /> :
                                view === 'form' ? <Send className="w-5 h-5" /> :
                                    view === 'list' ? <MessageCircle className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className={`font-bold text-lg leading-tight ${textMain}`}>
                                {view === 'faq' ? '幫助與支援' :
                                    view === 'form' ? '聯繫客服' :
                                        view === 'list' ? '對話紀錄' : '客服對話'}
                            </h2>
                            <p className={`text-[10px] uppercase tracking-widest font-bold opacity-40 ${textMain}`}>
                                {view === 'faq' ? 'FAQ & Support' :
                                    view === 'form' ? 'Customer Support Form' :
                                        view === 'list' ? 'Conversation History' : 'Live Chat'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${textSub}`}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                    {/* VIEW: FAQ */}
                    {view === 'faq' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="grid grid-cols-1 gap-3">
                                {FAQ_DATA.map((item, idx) => (
                                    <div key={idx} className={`rounded-2xl border transition-all duration-300 ${cardBg} ${expandedFaq === idx ? 'ring-2 ring-indigo-500/10 bg-indigo-500/5' : ''}`}>
                                        <button onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)} className="w-full flex items-center gap-4 p-4 text-left">
                                            <div className={`p-2 rounded-xl ${expandedFaq === idx ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-sm font-bold flex-1 ${expandedFaq === idx ? 'text-indigo-400' : textMain}`}>{item.q}</span>
                                            {expandedFaq === idx ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-30" />}
                                        </button>
                                        {expandedFaq === idx && (
                                            <div className={`px-4 pb-4 pl-14 text-sm leading-relaxed opacity-60 whitespace-pre-line ${textMain}`}>
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Jarvis AI Entry Button */}
                            {onOpenJarvis && (
                                <button
                                    onClick={() => { onClose(); onOpenJarvis(); }}
                                    className={`w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group`}
                                >
                                    <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span>Ask Jarvis</span>
                                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full ml-1">即時回覆</span>
                                </button>
                            )}

                            <button
                                onClick={() => setView('form')}
                                className={`w-full py-4 rounded-2xl font-bold ${onOpenJarvis
                                    ? `border ${isDarkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} transition-all flex items-center justify-center gap-3 group`
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group'
                                    }`}
                            >
                                <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>聯繫真人客服</span>
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`w-full py-2.5 rounded-2xl font-bold border ${isDarkMode ? 'border-white/5 text-slate-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'} transition-all text-sm flex items-center justify-center gap-2`}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>查看對話紀錄 ({tickets.length})</span>
                            </button>
                        </div>
                    )}

                    {/* VIEW: FORM */}
                    {view === 'form' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <button onClick={() => setView('faq')} className={`text-sm font-bold flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity ${textMain}`}>
                                <ChevronDown className="w-4 h-4 rotate-90" /> 返回常見問題
                            </button>

                            <div className="space-y-5">
                                {/* Categories */}
                                <div className="space-y-3">
                                    <label className={`text-xs font-bold uppercase tracking-wider opacity-40 ${textMain}`}>請選擇問題分類</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${category === cat.id
                                                    ? `border-indigo-500/50 bg-indigo-500/10 ${cat.color}`
                                                    : `border-transparent ${cardBg} opacity-60 hover:opacity-100`
                                                    }`}
                                            >
                                                <cat.icon className="w-5 h-5" />
                                                <span className="text-[11px] font-bold">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-wider opacity-40 ${textMain}`}>問題詳情</label>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="請儘量詳細描述您遇到的問題及操作步驟..."
                                        className={`w-full rounded-2xl p-4 text-sm min-h-[140px] outline-none transition-all ${inputBg} ${isDarkMode ? 'focus:bg-white/10 text-slate-200' : 'focus:border-indigo-500 text-gray-900 border'}`}
                                    />
                                </div>


                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-wider opacity-40 ${textMain}`}>補充資料 (圖片 / 截圖)</label>
                                    <input type="file" ref={formImageRef} className="hidden" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                                    <div
                                        onClick={() => formImageRef.current?.click()}
                                        className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${selectedImage
                                            ? 'border-indigo-500/50 bg-indigo-500/5'
                                            : `border-white/5 ${inputBg} hover:bg-white/10`
                                            }`}
                                    >
                                        {selectedImage ? (
                                            <div className="relative w-full h-full p-2">
                                                <img src={URL.createObjectURL(selectedImage)} alt="preview" className="w-full h-full object-contain rounded-xl" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                                    className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 rounded-full bg-white/5 text-slate-400">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-sm font-bold ${textMain}`}>點擊上傳圖片</p>
                                                    <p className="text-[10px] opacity-40">支援 JPG, PNG, WEBP</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-wider opacity-40 ${textMain}`}>外部連結 (雲端 / YouTube)</label>
                                    <div className={`flex items-center gap-3 px-4 rounded-2xl transition-all ${inputBg} ${isDarkMode ? 'focus-within:bg-white/10' : 'focus-within:border-indigo-500 border'}`}>
                                        <LinkIcon className="w-4 h-4 opacity-30" />
                                        <input
                                            type="url"
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 bg-transparent border-none outline-none py-4 text-sm text-inherit"
                                        />
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/5 border-transparent' : 'bg-indigo-50 border-indigo-100'} flex items-start gap-3`}>
                                    <Smartphone className="w-5 h-5 text-indigo-500/60 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-indigo-500/80">系統即將傳送裝置資訊</p>
                                        <p className={`text-[10px] opacity-40 mt-0.5 leading-tight font-mono ${textMain}`}>
                                            Model: {deviceInfo.device}<br />
                                            OS: {deviceInfo.os} ({deviceInfo.screen})<br />
                                            App: {deviceInfo.appVersion}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateTicket}
                                    disabled={!newMessage.trim() || isSending}
                                    className={`w-full py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2`}
                                >
                                    {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    確認提交
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW: LIST */}
                    {view === 'list' && (
                        <div className="space-y-4 animate-fade-in-up">
                            <button onClick={() => setView('faq')} className={`text-sm font-bold flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity ${textMain}`}>
                                <ChevronDown className="w-4 h-4 rotate-90" /> 返回
                            </button>

                            {tickets.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <Clock className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-sm">暫時未有對話紀錄</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {tickets.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => { setActiveTicket(t); setView('chat'); }}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all ${cardBg} hover:border-indigo-500/50 hover:bg-indigo-500/5`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-bold text-sm ${textMain}`}>{t.subject || '未命名對話'}</span>
                                                <StatusBadge status={t.status} />
                                            </div>
                                            <p className="text-xs opacity-50 line-clamp-1 mb-2">{t.lastMessage || '無訊息內容'}</p>
                                            <div className="flex items-center justify-between text-[10px] opacity-40 font-mono">
                                                <span>ID: {t.id.slice(0, 8)}</span>
                                                <span>{t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : '...'}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: CHAT */}
                    {view === 'chat' && (
                        <div className="flex flex-col h-full animate-fade-in">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <button onClick={() => setView('list')} className={`text-sm font-bold flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity ${textMain}`}>
                                    <ChevronDown className="w-4 h-4 rotate-90" /> 返回列表
                                </button>
                                <StatusBadge status={activeTicket.status} />
                            </div>

                            <div className="flex-1 space-y-4 py-2">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender === 'user';
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm transition-all ${isMe
                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10'
                                                : (isDarkMode ? 'bg-white/5 text-slate-300 rounded-tl-none' : 'bg-white border border-gray-100 rounded-tl-none')
                                                }`}>
                                                {msg.imageUrl && (
                                                    <div className="mb-2 rounded-xl overflow-hidden border border-transparent">
                                                        <img src={msg.imageUrl} alt="upload" className="max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.imageUrl, '_blank')} />
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                                <div className="text-[9px] mt-1.5 opacity-30 font-mono text-right uppercase tracking-tighter">
                                                    {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Input for Chat */}
                {view === 'chat' && (
                    <div className={`p-4 border-t ${isDarkMode ? 'border-transparent bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <div className={`flex items-end gap-3 p-2 rounded-2xl border transition-all ${isDarkMode ? 'bg-black/20 border-transparent focus-within:bg-black/40' : 'bg-white border-gray-200 focus-within:border-indigo-500'}`}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <button onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-xl text-slate-400 hover:text-indigo-500 transition-all hover:bg-white/5`}>
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="輸入訊息..."
                                className="flex-1 bg-transparent border-none outline-none resize-none py-2.5 text-sm text-inherit min-h-[40px] max-h-32 placeholder:opacity-30"
                                rows={1}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            />
                            <button onClick={() => handleSendMessage()} disabled={!newMessage.trim() || isSending} className={`p-2.5 rounded-xl ${newMessage.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95' : 'opacity-10'} transition-all`}>
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ReportCenterModal;
