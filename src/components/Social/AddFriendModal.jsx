import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, QrCode, Mail, Loader2, Check, Camera, SwitchCamera, AlertCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { sendFriendRequest, sendFriendRequestByUid } from '../../services/friendService';

const FRIEND_QR_PREFIX = 'travel-together://add-friend/';

const AddFriendModal = ({ isOpen, onClose, currentUser }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('search'); // 'search' | 'my_qr' | 'scan'
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // QR Scanner State
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'found' | 'error'
    const [cameraError, setCameraError] = useState(null);

    if (!isOpen) return null;

    const stopCamera = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanStatus('idle');
    }, []);

    const handleScanFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Use jsQR (dynamic import to avoid bundle bloat)
            try {
                const jsQR = (await import('jsqr')).default;
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    const val = code.data;
                    if (val.startsWith(FRIEND_QR_PREFIX)) {
                        const targetUid = val.replace(FRIEND_QR_PREFIX, '');
                        setScanStatus('found');
                        stopCamera();
                        // Send friend request
                        setLoading(true);
                        try {
                            await sendFriendRequestByUid(currentUser.uid, currentUser, targetUid);
                            setResult({ status: 'success', message: t('friends.request_sent') });
                        } catch (err) {
                            const msg = err.message === 'ALREADY_FRIENDS' ? t('friends.already_friends')
                                : err.message === 'CANNOT_ADD_SELF' ? t('friends.self_add')
                                    : err.message === 'REQUEST_ALREADY_SENT' ? t('friends.request_already_sent') || 'Request already sent'
                                        : err.message;
                            setResult({ status: 'error', message: msg });
                        } finally {
                            setLoading(false);
                        }
                        return;
                    }
                }
            } catch (e) {
                // jsQR not available, skip frame
            }
        }
        animFrameRef.current = requestAnimationFrame(handleScanFrame);
    }, [currentUser, stopCamera, t]);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setScanStatus('scanning');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                animFrameRef.current = requestAnimationFrame(handleScanFrame);
            }
        } catch (err) {
            setCameraError(t('friends.camera_error') || 'Camera access denied. Please allow camera in your browser settings.');
            setScanStatus('error');
        }
    }, [handleScanFrame, t]);

    // Cleanup on tab change or unmount
    useEffect(() => {
        if (activeTab !== 'scan') stopCamera();
        return () => stopCamera();
    }, [activeTab, stopCamera]);

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
            else if (error.message === 'REQUEST_ALREADY_SENT') msg = t('friends.request_already_sent') || 'Request already sent';
            else msg = error.message;
            setResult({ status: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    const TabBtn = ({ id, icon: Icon, label, color = 'indigo' }) => (
        <button
            onClick={() => { setActiveTab(id); setResult(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === id
                ? `bg-white dark:bg-slate-800 shadow-sm text-${color}-600 dark:text-${color}-400`
                : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            👥 {t('friends.add_friend_title')}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">{t('friends.add_friend_desc')}</p>
                    </div>
                    <button onClick={() => { stopCamera(); onClose(); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-1.5 bg-slate-50 dark:bg-slate-950/50">
                    <TabBtn id="search" icon={Mail} label={t('friends.search_tab') || 'Search'} />
                    <TabBtn id="my_qr" icon={QrCode} label={t('friends.my_qr_tab') || 'My QR'} color="emerald" />
                    <TabBtn id="scan" icon={Camera} label={t('friends.scan_tab') || 'Scan QR'} color="violet" />
                </div>

                {/* Content */}
                <div className="p-6 min-h-[320px] flex flex-col">

                    {/* --- SEARCH TAB --- */}
                    {activeTab === 'search' && (
                        <form onSubmit={handleSearchAndAdd} className="space-y-5 animate-fade-in flex-1">
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
                                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in ${result.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                    {result.status === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
                                    {result.message}
                                </div>
                            )}
                            <button type="submit" disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('friends.send_request')}
                            </button>
                        </form>
                    )}

                    {/* --- MY QR TAB --- */}
                    {activeTab === 'my_qr' && (
                        <div className="flex flex-col items-center justify-center space-y-5 pt-2 animate-fade-in flex-1">
                            <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
                                <QRCodeCanvas
                                    value={`${FRIEND_QR_PREFIX}${currentUser.uid}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    imageSettings={{
                                        src: currentUser.photoURL || '',
                                        x: undefined, y: undefined,
                                        height: 40, width: 40,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="font-black text-lg text-slate-800 dark:text-white">{currentUser.displayName}</h3>
                                <p className="text-sm text-slate-500 mt-1">{t('friends.qr_desc') || 'Let a friend scan this to add you instantly!'}</p>
                            </div>
                            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all max-w-full text-center border border-indigo-100 dark:border-indigo-500/20">
                                UID: {currentUser.uid}
                            </div>
                        </div>
                    )}

                    {/* --- SCAN QR TAB --- */}
                    {activeTab === 'scan' && (
                        <div className="flex flex-col items-center gap-5 animate-fade-in flex-1">
                            <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-violet-500/30 shadow-xl shadow-violet-500/10">
                                {/* Scanner overlay */}
                                <div className="absolute inset-0 z-20 pointer-events-none">
                                    <div className="absolute inset-8 border-2 border-white/30 rounded-xl">
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-violet-400 rounded-tl-md" />
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-violet-400 rounded-tr-md" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-violet-400 rounded-bl-md" />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-violet-400 rounded-br-md" />
                                        {scanStatus === 'scanning' && (
                                            <div className="absolute inset-x-0 top-0 h-0.5 bg-violet-400 animate-scan-line" />
                                        )}
                                    </div>
                                </div>

                                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                                <canvas ref={canvasRef} className="hidden" />

                                {(scanStatus === 'idle' || scanStatus === 'error') && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-900/80">
                                        {cameraError ? (
                                            <>
                                                <AlertCircle className="w-10 h-10 text-rose-400" />
                                                <p className="text-xs text-center text-rose-300 px-4">{cameraError}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-10 h-10 text-violet-400 opacity-60" />
                                                <p className="text-xs text-slate-400">{t('friends.tap_to_scan') || 'Tap START to scan a QR code'}</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {scanStatus === 'found' && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-emerald-900/80">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl">
                                            <Check className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-sm font-bold text-emerald-200">{t('friends.qr_found') || 'QR Code Detected!'}</p>
                                    </div>
                                )}
                            </div>

                            {result && (
                                <div className={`w-full p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in ${result.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                    {result.status === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
                                    {result.message}
                                </div>
                            )}

                            {scanStatus !== 'found' && (
                                <button
                                    onClick={scanStatus === 'scanning' ? stopCamera : startCamera}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${scanStatus === 'scanning'
                                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                                        : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/30'}`}
                                >
                                    {scanStatus === 'scanning'
                                        ? <><X className="w-5 h-5" /> {t('common.stop') || 'Stop'}</>
                                        : <><Camera className="w-5 h-5" /> {cameraError ? (t('common.retry') || 'Retry') : (t('friends.start_scan') || 'Start Scanning')}</>
                                    }
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
