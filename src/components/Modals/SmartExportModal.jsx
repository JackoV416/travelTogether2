import React, { useState, useEffect } from 'react';
import { X, Share2, FileJson, FileText, Calendar, Link as LinkIcon, Copy, Check, Download, Globe, Lock, Loader2, MessageCircle, Maximize2, Minimize2, Search, Instagram, LayoutGrid } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToICS, exportToBeautifulPDF } from '../../services/pdfExport';
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

const PDF_TEMPLATES = [
    { id: 'modern', label: '現代主題' },
    { id: 'classic', label: '經典報表' },
    { id: 'glass', label: '網站風格' },
    { id: 'compact', label: '極簡清單' },
    { id: 'retro', label: '復古紙感' },
    { id: 'vibrant', label: '活力繽紛' },
];

export default function SmartExportModal({ isOpen, onClose, isDarkMode, trip, trips = [] }) {
    const [activeTab, setActiveTab] = useState('export');
    const [exportType, setExportType] = useState(null);
    const [scope, setScope] = useState('full');
    const [pdfTemplate, setPdfTemplate] = useState('modern');
    const [isExporting, setIsExporting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [previewText, setPreviewText] = useState("");
    // V1.1.6: PDF Layout Controls
    const [layoutMode, setLayoutMode] = useState('quick'); // quick | pro
    const [itemsPerPage, setItemsPerPage] = useState(4);

    const [selectedTripId, setSelectedTripId] = useState(trip?.id || trips[0]?.id || '');
    const selectedTrip = trips.length > 0 ? trips.find(t => t.id === selectedTripId) || trips[0] : trip;
    const [isPublic, setIsPublic] = useState(selectedTrip?.isPublic || false);
    const [sharePermission, setSharePermission] = useState(selectedTrip?.sharePermission || 'view');

    useEffect(() => {
        if (trip?.id) setSelectedTripId(trip.id);
        else if (trips.length > 0) setSelectedTripId(trips[0].id);
    }, [trip, trips]);

    useEffect(() => {
        setIsPublic(selectedTrip?.isPublic || false);
        setSharePermission(selectedTrip?.sharePermission || 'view');
    }, [selectedTrip]);

    // Generate Preview Effect
    useEffect(() => {
        if (activeTab === 'export' && selectedTrip) {
            const generatePreview = async () => {
                setIsPreviewLoading(true);
                try {
                    await new Promise(r => setTimeout(r, 600));

                    if (exportType?.id === 'pdf') {
                        const blobUrl = await exportToBeautifulPDF(selectedTrip, { template: pdfTemplate, scope, itemsPerPage, returnBlob: true });
                        setPreviewUrl(blobUrl);
                        setPreviewText("");
                    } else if (exportType?.id === 'json') {
                        const jsonStr = JSON.stringify(selectedTrip, null, 2);
                        setPreviewText(jsonStr.trim());
                        setPreviewUrl(null);
                    } else if (exportType?.id === 'text') {
                        const text = `📍 ${selectedTrip.name}\n📅 ${selectedTrip.startDate} - ${selectedTrip.endDate}\n\n[行程概要]\n${Object.entries(selectedTrip.itinerary || {}).sort().map(([date, items]) => `${date}:\n${items.map(i => `  - ${i.time || '--:--'} ${i.name}`).join('\n')}`).join('\n\n')}`;
                        setPreviewText(text.trim());
                        setPreviewUrl(null);
                    } else if (exportType?.id === 'ical') {
                        const text = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TravelTogether//Trip//EN\nSUMMARY:${selectedTrip.name}\n... (iCal content) ...\nEND:VCALENDAR`;
                        setPreviewText(text.trim());
                        setPreviewUrl(null);
                    }
                } catch (e) {
                    console.error("Preview generation failed", e);
                } finally {
                    setIsPreviewLoading(false);
                }
            };
            generatePreview();
        } else {
            setPreviewUrl(null);
            setPreviewText("");
        }
    }, [activeTab, exportType, selectedTrip, pdfTemplate, scope, itemsPerPage]);

    if (!isOpen || (!trip && trips.length === 0)) return null;

    const shareUrl = `${window.location.origin}/share/${selectedTrip?.id}`;

    const handleTogglePublic = async () => {
        const newVal = !isPublic;
        setIsPublic(newVal);
        try {
            await updateDoc(doc(db, "trips", selectedTrip.id), { isPublic: newVal });
        } catch (e) { console.error(e); }
    };

    const handleUpdatePermission = async (perm) => {
        setSharePermission(perm);
        try {
            await updateDoc(doc(db, "trips", selectedTrip.id), { sharePermission: perm });
        } catch (e) { console.error(e); }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = async () => {
        if (!exportType) return;
        setIsExporting(true);
        try {
            // Filter trip data based on scope
            let exportData = { ...selectedTrip };
            if (scope === 'itinerary') {
                exportData = { name: selectedTrip.name, startDate: selectedTrip.startDate, endDate: selectedTrip.endDate, itinerary: selectedTrip.itinerary };
            } else if (scope === 'shopping') {
                exportData = { name: selectedTrip.name, shoppingList: selectedTrip.shoppingList };
            } else if (scope === 'budget') {
                exportData = { name: selectedTrip.name, budget: selectedTrip.budget };
            }

            switch (exportType.id) {
                case 'json': {
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${selectedTrip.name}_${scope}.json`; a.click();
                    break;
                }
                case 'text': {
                    let text = `📍 ${selectedTrip.name}\n📅 ${selectedTrip.startDate} - ${selectedTrip.endDate}\n\n`;
                    if (scope === 'full' || scope === 'itinerary') {
                        Object.keys(selectedTrip.itinerary || {}).sort().forEach(date => {
                            text += `\n[${date}]\n`;
                            selectedTrip.itinerary[date].forEach(item => text += `- ${item.time || ''} ${item.name}\n`);
                        });
                    }
                    if (scope === 'full' || scope === 'shopping') {
                        text += `\n[購物清單]\n`;
                        (selectedTrip.shoppingList || []).forEach(item => text += `- ${item.name} (${item.estPrice || ''})\n`);
                    }
                    text += `\nGenerated by Travel Together`;
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${selectedTrip.name}_${scope}.txt`; a.click();
                    break;
                }
                case 'pdf': {
                    await exportToBeautifulPDF(selectedTrip, { template: pdfTemplate, scope, itemsPerPage });
                    break;
                }
                case 'ical': {
                    exportToICS(selectedTrip); // ICS usually full or filtered inside service
                    break;
                }
            }
        } catch (e) {
            alert("匯出失敗：" + e.message);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-white">
            <div className={`${glassCard(isDarkMode)} w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative shrink-0`}>

                {/* GLOBAL CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[60] p-2.5 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-xl text-white/70 hover:text-white transition-all border border-white/10 shadow-xl group/close"
                    title="關閉視窗 (Close)"
                >
                    <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
                </button>

                {/* LEFT COLUMN: Sidebar */}
                <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-white/10 flex flex-col bg-white/5 shrink-0">
                        <h2 className="text-lg font-black flex items-center gap-2 tracking-tight">
                            <Share2 className="w-5 h-5 text-indigo-400" /> 分享與匯出
                        </h2>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">{selectedTrip?.name}</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-white/10 bg-white/5 shrink-0">
                        <button onClick={() => setActiveTab('export')} className={`flex-1 py-3 text-xs font-black tracking-widest transition-all ${activeTab === 'export' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'opacity-40 hover:bg-white/5'}`}>📤 匯出</button>
                        <button onClick={() => setActiveTab('share')} className={`flex-1 py-3 text-xs font-black tracking-widest transition-all ${activeTab === 'share' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'opacity-40 hover:bg-white/5'}`}>🔗 分享</button>
                        <div className="relative group flex-1">
                            <button disabled className="w-full py-3 text-[10px] font-black tracking-widest opacity-20 cursor-not-allowed">🎨 編輯 (V1.2)</button>
                            <div className="absolute inset-x-0 bottom-full mb-2 p-2 bg-indigo-600 rounded-lg text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center pointer-events-none font-bold">
                                🚀 Pro Editor (執位器) 即將登場！可自由拖拽 PDF 項目順序。
                            </div>
                        </div>
                    </div>

                    {/* Options Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                        {activeTab === 'export' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
                                {/* Format Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><FileJson className="w-3 h-3" /> 格式 FORMAT</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {EXPORT_TYPES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setExportType(t)}
                                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${exportType?.id === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1 relative z-10">
                                                    <t.icon className={`w-4 h-4 ${exportType?.id === t.id ? 'text-indigo-400' : 'opacity-40'}`} />
                                                    <span className={`text-xs font-bold ${exportType?.id === t.id ? 'text-white' : 'opacity-80'}`}>{t.label}</span>
                                                </div>
                                                <p className="text-[9px] opacity-40 leading-tight relative z-10">{t.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Scope Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><Check className="w-3 h-3" /> 範圍 SCOPE</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SCOPE_OPTIONS.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setScope(s.id)}
                                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${scope === s.id ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'border-white/10 opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* PDF Options */}
                                {exportType?.id === 'pdf' && (
                                    <>
                                        <div className="h-px bg-white/10 my-2"></div>
                                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><Download className="w-3 h-3" /> 風格 STYLE</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {PDF_TEMPLATES.map(tmpl => (
                                                    <button key={tmpl.id} onClick={() => setPdfTemplate(tmpl.id)} className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all text-left truncate ${pdfTemplate === tmpl.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 opacity-60 hover:bg-white/5'}`}>
                                                        {tmpl.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="h-px bg-white/10 my-2"></div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid className="w-3 h-3" /> 版面密度 DENSITY</label>
                                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-mono">{itemsPerPage} ITEMS/PAGE</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="6"
                                                    step="1"
                                                    value={itemsPerPage}
                                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                                                />
                                                <p className="text-[9px] opacity-30 italic">* 減少每頁項目數可避免內容被切斷 (Intelligent Pagination)</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        {isPublic ? <Globe className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-indigo-400/50" />}
                                        <div><p className="text-xs font-black">{isPublic ? '公開行程' : '私人存取'}</p><p className="text-[10px] opacity-40">擁有連結者可查看</p></div>
                                    </div>
                                    <button onClick={handleTogglePublic} className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-indigo-500' : 'bg-white/10'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                                </div>

                                {isPublic && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={shareUrl} className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono opacity-60 outline-none" />
                                            <button onClick={handleCopyLink} className="aspect-square w-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg active:scale-95">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">社群分享 SOCIAL SHARE</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(`我喺 Travel Together 規劃咗個行程「${selectedTrip.name}」，快啲黎睇下啦！\n${shareUrl}`)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-2xl transition-all group"
                                                >
                                                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">WhatsApp</span>
                                                </a>
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 rounded-2xl transition-all group"
                                                >
                                                    <Globe className="w-5 h-5 text-[#1877F2]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">Facebook</span>
                                                </a>
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-purple-500/20 rounded-2xl transition-all group"
                                                >
                                                    <Instagram className="w-5 h-5 text-[#ee2a7b]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">Instagram</span>
                                                </button>
                                            </div>
                                            <p className="text-[9px] opacity-30 text-center italic">* Instagram 請複製連結後貼上至 Story</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                    <p className="text-[10px] text-indigo-300 font-medium leading-relaxed">
                                        💡 分享功能會產生一個公開連結預覽模式，其他人無需登入即可查看。
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="p-5 border-t border-white/10 bg-white/5 shrink-0 z-20">
                        {activeTab === 'export' && (
                            <button onClick={handleExport} disabled={!exportType || isExporting} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl font-black text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                立即匯出 {exportType?.label || ''}
                            </button>
                        )}
                        <button onClick={onClose} className="w-full py-3 mt-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl font-bold text-xs transition-all md:hidden">
                            關閉
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Preview */}
                <div className="flex-1 bg-black/20 relative flex flex-col min-h-0">
                    <div className="absolute top-4 left-4 z-20">
                        {previewUrl && activeTab === 'export' && (
                            <button onClick={() => setIsFullscreenPreview(true)} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-white/70 hover:text-white transition-all border border-white/10 shadow-lg" title="全螢幕預覽">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden p-6 flex flex-col items-center justify-center h-full relative">
                        {activeTab === 'export' ? (
                            <div className="w-full h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2 opacity-40">
                                        <Search className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{exportType?.label ? `${exportType.label} 預覽` : '請選擇匯出格式'}</span>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-black text-indigo-300 animate-pulse">
                                        COMING SOON: PRO EDITOR V1.2
                                    </div>
                                </div>

                                <div className={`flex-1 rounded-2xl border border-dashed border-white/10 overflow-hidden relative shadow-2xl transition-all duration-500 ${isPreviewLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} ${exportType?.id === 'pdf' ? 'bg-gray-800' : 'bg-black/40'}`}>
                                    {exportType?.id === 'pdf' ? (
                                        previewUrl ? (
                                            <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                                <p className="text-xs font-bold font-mono">PDF PREVIEW GENERATING...</p>
                                            </div>
                                        )
                                    ) : (
                                        previewText ? (
                                            <div className="w-full h-full overflow-auto custom-scrollbar font-mono text-[11px] leading-relaxed flex flex-col bg-[#1e1e1e] text-[#d4d4d4]">
                                                {previewText.split('\n').map((line, i) => (
                                                    <div key={i} className="flex min-w-full hover:bg-white/5 transition-colors group">
                                                        <div className="shrink-0 w-12 pr-4 text-right select-none opacity-30 border-r border-white/5 bg-[#1e1e1e]">
                                                            {i + 1}
                                                        </div>
                                                        <div className="px-4 whitespace-pre flex-1">
                                                            <span className={exportType?.id === 'json' ? (line.includes(':') ? 'text-blue-400' : 'text-emerald-400') : ''}>
                                                                {line || ' '}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                                <p className="text-xs font-bold">預覽將於此處顯示</p>
                                            </div>
                                        )
                                    )}
                                    {isPreviewLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-40 max-w-sm">
                                <Share2 className="w-24 h-24 mx-auto mb-6 opacity-20" />
                                <h3 className="text-xl font-bold mb-2">準備分享您的行程</h3>
                                <p className="text-sm">設定公開權限後，您可以複製連結傳送給朋友。</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fullscreen Overlay */}
                {isFullscreenPreview && previewUrl && (
                    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                <Download className="w-4 h-4 text-indigo-400" /> {exportType?.label} 預覽 (Full Screen)
                            </h3>
                            <button onClick={() => setIsFullscreenPreview(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                <Minimize2 className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {exportType?.id === 'pdf' ? (
                                <iframe src={previewUrl} className="w-full h-full border-none" title="Fullscreen Preview" />
                            ) : (
                                <div className="w-full h-full overflow-auto font-mono text-sm leading-relaxed bg-[#1e1e1e] text-[#d4d4d4] p-8">
                                    <pre className="whitespace-pre-wrap">{previewText}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
