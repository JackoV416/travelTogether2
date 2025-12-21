import React, { useState, useEffect } from 'react';
import { X, Share2, FileJson, FileText, FileImage, Calendar, Link as LinkIcon, Copy, Check, Download, Globe, Lock, Loader2, ChevronDown, MessageCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToICS, generateShareableText, exportToBeautifulPDF } from '../../services/pdfExport';
import { glassCard } from '../../utils/tripUtils';


const EXPORT_TYPES = [
    { id: 'json', label: 'JSON', icon: FileJson, desc: '完整資料結構', color: 'blue' },
    { id: 'text', label: '純文字', icon: FileText, desc: '簡潔文字摘要', color: 'green' },
    { id: 'pdf', label: 'PDF', icon: Download, desc: '精美報告', color: 'red' },
    { id: 'ical', label: 'iCal', icon: Calendar, desc: '日曆格式', color: 'purple' },
];

const SCOPE_OPTIONS = [
    { id: 'full', label: '完整行程' },
    { id: 'itinerary', label: '行程景點' },
    { id: 'shopping', label: '購物清單' },
    { id: 'budget', label: '預算記錄' },
];

export default function SmartExportModal({ isOpen, onClose, isDarkMode, trip, trips = [], onExportPdf }) {
    const [activeTab, setActiveTab] = useState('export'); // 'export' | 'share'
    const [exportType, setExportType] = useState(null);
    const [scope, setScope] = useState('full');
    const [isExporting, setIsExporting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // Trip selection for Dashboard context (when trips array is provided)
    const [selectedTripId, setSelectedTripId] = useState(trip?.id || trips[0]?.id || '');
    const selectedTrip = trips.length > 0 ? trips.find(t => t.id === selectedTripId) || trips[0] : trip;
    const [isPublic, setIsPublic] = useState(selectedTrip?.isPublic || false);

    const [sharePermission, setSharePermission] = useState(selectedTrip?.sharePermission || 'view');

    // Update selected trip when props change
    useEffect(() => {
        if (trip?.id) setSelectedTripId(trip.id);
        else if (trips.length > 0) setSelectedTripId(trips[0].id);
    }, [trip, trips]);

    useEffect(() => {
        setIsPublic(selectedTrip?.isPublic || false);
        setSharePermission(selectedTrip?.sharePermission || 'view');
    }, [selectedTrip]);

    if (!isOpen || (!trip && trips.length === 0)) return null;

    // Generate Preview Effect
    useEffect(() => {
        if (activeTab === 'export' && exportType?.id === 'pdf' && selectedTrip) {
            const generatePreview = async () => {
                setIsPreviewLoading(true);
                try {
                    // Slight delay to allow UI to update if switching quickly
                    await new Promise(r => setTimeout(r, 500));
                    const blobUrl = exportToBeautifulPDF(selectedTrip, { template: 'modern', returnBlob: true });
                    setPreviewUrl(blobUrl);
                } catch (e) {
                    console.error("Preview generation failed", e);
                } finally {
                    setIsPreviewLoading(false);
                }
            };
            generatePreview();
        } else {
            setPreviewUrl(null);
        }
    }, [activeTab, exportType, selectedTrip]);


    const shareUrl = `${window.location.origin}/share/${selectedTrip.id}`;

    const handleTogglePublic = async () => {
        const newVal = !isPublic;
        setIsPublic(newVal);
        try {
            await updateDoc(doc(db, "trips", selectedTrip.id), { isPublic: newVal });
        } catch (e) {
            console.error("Failed to update public status", e);
        }
    };

    const handleUpdatePermission = async (perm) => {
        setSharePermission(perm);
        try {
            await updateDoc(doc(db, "trips", selectedTrip.id), { sharePermission: perm });
        } catch (e) {
            console.error("Failed to update share permission", e);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScopeData = () => {
        switch (scope) {
            case 'itinerary': return { itinerary: selectedTrip.itinerary };
            case 'shopping': return { shopping: selectedTrip.shopping };
            case 'budget': return { budget: selectedTrip.budget };
            default: return { name: selectedTrip.name, itinerary: selectedTrip.itinerary, shopping: selectedTrip.shopping, budget: selectedTrip.budget, packing: selectedTrip.packing };
        }
    };

    const handleExport = async () => {
        if (!exportType) return;
        setIsExporting(true);

        try {
            const data = getScopeData();

            switch (exportType.id) {
                case 'json': {
                    const jsonString = JSON.stringify(data, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedTrip.name || 'trip'}_${scope}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    break;
                }
                case 'text': {
                    let text = `📍 ${selectedTrip.name || '我的行程'}\n\n`;
                    if (data.itinerary) {
                        text += "=== 行程 ===\n";
                        Object.entries(data.itinerary).forEach(([date, items]) => {
                            text += `\n📅 ${date}\n`;
                            items.forEach((item, i) => text += `  ${i + 1}. ${item.name} (${item.type})\n`);
                        });
                    }
                    if (data.shopping) {
                        text += "\n=== 購物清單 ===\n";
                        data.shopping.forEach(item => text += `• ${item.name} ${item.bought ? '✓' : ''}\n`);
                    }
                    if (data.budget) {
                        text += "\n=== 預算 ===\n";
                        data.budget.forEach(item => text += `• ${item.desc || item.name}: $${item.amount}\n`);
                    }
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedTrip.name || 'trip'}_${scope}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    break;
                }
                case 'pdf': {
                    if (onExportPdf) {
                        onExportPdf();
                    } else {
                        alert("PDF 匯出功能需要在行程詳情頁使用");
                    }
                    break;
                }
                case 'ical': {
                    exportToICS(selectedTrip);
                    break;
                }
            }
        } catch (e) {
            console.error("Export failed", e);
            alert("匯出失敗：" + e.message);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`${glassCard(isDarkMode)} w-full max-w-lg rounded-2xl overflow-hidden`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Share2 className="w-6 h-6 text-purple-400" /> 分享與匯出
                        </h2>
                        {/* Trip selector when multiple trips available */}
                        {trips.length > 1 ? (
                            <div className="mt-2">
                                <select
                                    value={selectedTripId}
                                    onChange={(e) => setSelectedTripId(e.target.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border`}
                                >
                                    {trips.map(t => (
                                        <option key={t.id} value={t.id} className="text-black">{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <p className="text-sm opacity-60 mt-1 truncate">{selectedTrip?.name}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* Tabs */}
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'export' ? 'border-b-2 border-purple-500 text-purple-400' : 'opacity-50 hover:opacity-80'}`}
                    >
                        📤 匯出
                    </button>
                    <button
                        onClick={() => setActiveTab('share')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'share' ? 'border-b-2 border-purple-500 text-purple-400' : 'opacity-50 hover:opacity-80'}`}
                    >
                        🔗 分享連結
                    </button>
                </div>

                {/* Export Tab */}
                {activeTab === 'export' && (
                    <div className="p-6 space-y-4">
                        {/* Export Type Selection */}
                        <div>
                            <label className="text-xs font-bold opacity-60 uppercase mb-2 block">匯出格式</label>
                            <div className="grid grid-cols-4 gap-2">
                                {EXPORT_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setExportType(type)}
                                        className={`p-3 rounded-xl border text-center transition-all ${exportType?.id === type.id ? `bg-${type.color}-500/20 border-${type.color}-500` : (isDarkMode ? 'border-white/10 hover:border-white/30' : 'border-gray-200 hover:border-gray-300')}`}
                                    >
                                        <type.icon className={`w-5 h-5 mx-auto mb-1 ${exportType?.id === type.id ? `text-${type.color}-400` : 'opacity-50'}`} />
                                        <div className="text-xs font-bold">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scope Selection */}
                        <div>
                            <label className="text-xs font-bold opacity-60 uppercase mb-2 block">匯出範圍</label>
                            <div className="flex flex-wrap gap-2">
                                {SCOPE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setScope(opt.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${scope === opt.id ? 'bg-purple-500 text-white' : (isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200')}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Export Preview Area */}
                        <div className={`rounded-xl border border-dashed flex flex-col max-h-[220px] transition-all overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-300'}`}>
                            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">匯出預覽 (Preview)</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">{exportType?.label || '未選擇'}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {exportType?.id === 'pdf' ? (
                                    <div className="h-full w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                        {isPreviewLoading && (
                                            <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                <span className="text-xs font-bold text-gray-500">生成預覽中...</span>
                                            </div>
                                        )}
                                        {previewUrl ? (
                                            <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                                        ) : (
                                            <div className="text-xs opacity-40">無法預覽 PDF</div>
                                        )}
                                    </div>
                                ) : (
                                    <pre className="text-[10px] font-mono opacity-70 whitespace-pre-wrap leading-relaxed">
                                        {(() => {
                                            const data = getScopeData();
                                            if (exportType?.id === 'json') return JSON.stringify(data, null, 2);
                                            if (exportType?.id === 'text') {
                                                let text = `📍 ${selectedTrip.name || '我的行程'}\n\n`;
                                                if (data.itinerary) {
                                                    Object.entries(data.itinerary).forEach(([date, items]) => {
                                                        text += `📅 ${date}\n`;
                                                        items.slice(0, 3).forEach((item, i) => text += `  ${i + 1}. ${item.name}\n`);
                                                        if (items.length > 3) text += `  ...等 ${items.length} 項\n`;
                                                    });
                                                }
                                                if (data.shopping) text += `\n🛒 購物清單 (${data.shopping.length} 項)\n`;
                                                return text;
                                            }
                                            return "請選擇匯出格式以顯示預覽";
                                        })()}
                                    </pre>
                                )}
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={!exportType || isExporting}
                            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${exportType ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' : 'bg-gray-500/30 text-gray-400 cursor-not-allowed'}`}
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isExporting ? '匯出中...' : `立即匯出 ${exportType?.label || ''}`}
                        </button>
                    </div>
                )}

                {/* Share Tab */}
                {activeTab === 'share' && (
                    <div className="p-6 space-y-6">
                        {/* Public Toggle */}
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isPublic ? <Globe className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-gray-400" />}
                                    <div>
                                        <div className="font-bold text-sm">{isPublic ? '公開行程' : '私人行程'}</div>
                                        <div className="text-[10px] opacity-50">{isPublic ? '任何人可透過連結查看' : '只有你和成員可以查看'}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleTogglePublic}
                                    className={`w-12 h-6 rounded-full transition-all ${isPublic ? 'bg-green-500' : 'bg-gray-500'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Permission Selection */}
                        {isPublic && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold opacity-60 uppercase ml-1">權限設定</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdatePermission('view')}
                                        className={`flex-1 p-3 rounded-xl border text-left transition-all ${sharePermission === 'view' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 opacity-60'}`}
                                    >
                                        <div className="font-bold text-xs">僅限檢視</div>
                                        <div className="text-[9px] opacity-60">遊客只能查看行程</div>
                                    </button>
                                    <button
                                        onClick={() => handleUpdatePermission('edit')}
                                        className={`flex-1 p-3 rounded-xl border text-left transition-all ${sharePermission === 'edit' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 opacity-60'}`}
                                    >
                                        <div className="font-bold text-xs">可以編輯</div>
                                        <div className="text-[9px] opacity-60 text-purple-400">只限已登入用戶</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Share Link */}
                        {isPublic && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold opacity-60 uppercase">分享連結</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} border`}
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Share Social Preview Area */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold opacity-60 uppercase ml-1">社交預覽 (Social Preview)</label>
                            <div className={`p-4 rounded-xl border border-dashed flex flex-col transition-all overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-300'}`}>
                                <pre className="text-[10px] font-mono opacity-70 whitespace-pre-wrap leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
                                    {`✈️ ${selectedTrip?.name || '我的行程'}\n📍 ${selectedTrip?.city}, ${selectedTrip?.country}\n📅 ${selectedTrip?.startDate} - ${selectedTrip?.endDate}\n\n由 Travel Together 生成`}
                                </pre>
                            </div>
                        </div>

                        {/* Share to Social Apps */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <label className="text-xs font-bold opacity-60 uppercase">分享到社交平台</label>
                            <div className="grid grid-cols-3 gap-2">
                                {/* WhatsApp */}
                                <button
                                    onClick={() => {
                                        const text = `${selectedTrip?.name || '我的行程'}\n${selectedTrip?.city}, ${selectedTrip?.country}\n${selectedTrip?.startDate} - ${selectedTrip?.endDate}\n\n由 Travel Together 生成`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-500 text-white font-bold text-xs hover:bg-green-600 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    WhatsApp
                                </button>

                                {/* Facebook */}
                                <button
                                    onClick={() => {
                                        if (isPublic && shareUrl) {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                                        } else {
                                            alert('請先開啟公開連結後才能分享到 Facebook');
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all"
                                >
                                    <Globe className="w-5 h-5" />
                                    Facebook
                                </button>

                                {/* Copy for Instagram */}
                                <button
                                    onClick={() => {
                                        const text = `✈️ ${selectedTrip?.name || '我的行程'}\n📍 ${selectedTrip?.city}\n📅 ${selectedTrip?.startDate} - ${selectedTrip?.endDate}`;
                                        navigator.clipboard.writeText(text);
                                        alert('已複製行程資訊！可以貼到 Instagram Story 或貼文');
                                    }}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white font-bold text-xs hover:opacity-90 transition-all"
                                >
                                    <Copy className="w-5 h-5" />
                                    Instagram
                                </button>
                            </div>
                            <p className="text-[10px] opacity-50 text-center">Instagram 需先複製文字，再貼到 App 內</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
