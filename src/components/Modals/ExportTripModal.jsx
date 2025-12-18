import React, { useState } from 'react';
import { X, Share2, FileText, Calendar, Link as LinkIcon, Download, Globe, Lock } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ExportTripModal = ({ isOpen, onClose, trip, isDarkMode }) => {
    if (!isOpen) return null;

    const [isPublic, setIsPublic] = useState(trip.isPublic || false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/share/${trip.id}`;

    const handleTogglePublic = async () => {
        const newVal = !isPublic;
        setIsPublic(newVal);
        await updateDoc(doc(db, "trips", trip.id), { isPublic: newVal });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = (format) => {
        // Mock Export features
        if (format === 'pdf') {
            alert("正在生成 PDF 行程單... (模擬)");
            // In real app, use jspdf or html2canvas
        } else if (format === 'ical') {
            alert("正在匯出 iCal 日曆檔... (模擬)");
            // In real app, generate .ics file
        } else if (format === 'json') {
            const data = JSON.stringify(trip, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trip_${trip.id}.json`;
            a.click();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center bg-gray-500/5">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-indigo-500" /> 分享與匯出
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Public Share */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                {isPublic ? <Globe className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-gray-400" />}
                                <span className="font-bold">{isPublic ? '公開連結分享' : '私人行程'}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={handleTogglePublic} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                        {isPublic && (
                            <div className="flex items-center gap-2 bg-gray-500/10 p-2 rounded-lg mt-2">
                                <div className="flex-1 truncate text-xs font-mono opacity-70 p-1">{shareUrl}</div>
                                <button onClick={handleCopyLink} className="p-1.5 rounded-lg hover:bg-gray-500/20 text-indigo-500 relative">
                                    <LinkIcon className="w-4 h-4" />
                                    {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded">Copied!</span>}
                                </button>
                            </div>
                        )}
                        <p className="text-xs opacity-50 mt-2">開啟後，任何人擁有連結皆可查看此行程 (唯讀)。</p>
                    </div>

                    {/* Export Options */}
                    <div>
                        <h4 className="font-bold text-sm mb-3 opacity-70 uppercase tracking-wider">匯出格式</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleExport('pdf')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="p-2 rounded-full bg-red-500/10 text-red-500"><FileText className="w-6 h-6" /></div>
                                <span className="text-xs font-bold">PDF</span>
                            </button>
                            <button onClick={() => handleExport('ical')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Calendar className="w-6 h-6" /></div>
                                <span className="text-xs font-bold">iCal</span>
                            </button>
                            <button onClick={() => handleExport('json')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500"><Download className="w-6 h-6" /></div>
                                <span className="text-xs font-bold">JSON</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportTripModal;
