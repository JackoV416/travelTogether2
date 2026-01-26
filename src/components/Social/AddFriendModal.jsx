import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, QrCode, Mail, Loader2, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { sendFriendRequest } from '../../services/friendService';

const AddFriendModal = ({ isOpen, onClose, currentUser }) => {
    const { t } = useTranslation();
    // const { currentUser } = useAuth(); // Removed
    const [activeTab, setActiveTab] = useState('search'); // 'search' | 'qr'
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { status: 'success' | 'error', message: '' }

    if (!isOpen) return null;

    const handleSearchAndAdd = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            await sendFriendRequest(currentUser.uid, currentUser, email.trim());
            setResult({ status: 'success', message: t('friends.request_sent') });
            setEmail('');
        } catch (error) {
            let msg = 'Error';
            if (error.message === 'USER_NOT_FOUND') msg = t('friends.user_not_found');
            else if (error.message === 'ALREADY_FRIENDS') msg = t('friends.already_friends');
            else if (error.message === 'CANNOT_ADD_SELF') msg = t('friends.self_add');
            else msg = error.message;
            setResult({ status: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            {t('friends.add_friend_title')}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">{t('friends.add_friend_desc')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-950/50">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'search' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        <Mail className="w-4 h-4" />
                        {t('friends.search_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('qr')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'qr' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        <QrCode className="w-4 h-4" />
                        QR Code
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {activeTab === 'search' ? (
                        <form onSubmit={handleSearchAndAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                    {t('friends.enter_email_or_name')}
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('friends.search_placeholder')}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {result && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in-up ${result.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {result.status === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                    {result.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('friends.send_request')}
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-6 pt-4">
                            <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100">
                                <QRCodeCanvas
                                    value={`travel-together://add-friend/${currentUser.uid}`}
                                    size={200}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                    {currentUser.displayName}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Scan to add me as friend</p>
                            </div>

                            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-500 break-all max-w-full text-center">
                                UID: {currentUser.uid}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
