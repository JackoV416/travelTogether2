import React, { useState, useEffect } from 'react';
import { X, Share2, FileJson, FileText, FileImage, Calendar, Link as LinkIcon, Copy, Check, Download, Globe, Lock, Loader2, ChevronDown } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Premium UI Classes
const glassCard = (isDarkMode) => isDarkMode ? "bg-gray-900/60 backdrop-blur-md border border-white/10 text-white shadow-xl" : "bg-white/80 backdrop-blur-md border border-white/20 text-gray-900 shadow-xl";

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

    // Trip selection for Dashboard context (when trips array is provided)
    const [selectedTripId, setSelectedTripId] = useState(trip?.id || trips[0]?.id || '');
    const selectedTrip = trips.length > 0 ? trips.find(t => t.id === selectedTripId) || trips[0] : trip;
    const [isPublic, setIsPublic] = useState(selectedTrip?.isPublic || false);

    // Update selected trip when props change
    useEffect(() => {
        if (trip?.id) setSelectedTripId(trip.id);
        else if (trips.length > 0) setSelectedTripId(trips[0].id);
    }, [trip, trips]);

    useEffect(() => {
        setIsPublic(selectedTrip?.isPublic || false);
    }, [selectedTrip]);

    if (!isOpen || (!trip && trips.length === 0)) return null;


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
                    alert("iCal 匯出功能開發中，敬請期待！");
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

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={!exportType || isExporting}
                            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${exportType ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' : 'bg-gray-500/30 text-gray-400 cursor-not-allowed'}`}
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isExporting ? '匯出中...' : '開始匯出'}
                        </button>
                    </div>
                )}

                {/* Share Tab */}
                {activeTab === 'share' && (
                    <div className="p-6 space-y-4">
                        {/* Public Toggle */}
                        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isPublic ? <Globe className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-gray-400" />}
                                    <div>
                                        <div className="font-bold text-sm">{isPublic ? '公開行程' : '私人行程'}</div>
                                        <div className="text-xs opacity-50">{isPublic ? '任何人可透過連結查看' : '只有你和成員可以查看'}</div>
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
                    </div>
                )}
            </div>
        </div>
    );
}
