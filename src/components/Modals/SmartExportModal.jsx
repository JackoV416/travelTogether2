import React, { useState, useEffect } from 'react';
import { X, Share2, FileJson, FileText, Calendar, Link as LinkIcon, Copy, Check, Download, Globe, Lock, Loader2, MessageCircle, Maximize2, Minimize2 } from 'lucide-react';
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
                    } else if (exportType?.id === 'json') {
                        const jsonStr = JSON.stringify(selectedTrip, null, 2);
                        const blob = new Blob([jsonStr], { type: 'application/json' });
                        setPreviewUrl(URL.createObjectURL(blob));
                    } else if (exportType?.id === 'text') {
                        const text = `Trip: ${selectedTrip.name}\nDates: ${selectedTrip.startDate} - ${selectedTrip.endDate}\n\nItinerary:\n${Object.entries(selectedTrip.itinerary || {}).map(([date, items]) => `${date}:\n${items.map(i => `- ${i.time} ${i.name}`).join('\n')}`).join('\n\n')}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        setPreviewUrl(URL.createObjectURL(blob));
                    } else if (exportType?.id === 'ical') {
                        // Simple iCal preview text
                        const text = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TravelTogether//Trip//EN\n... (iCal content for ${selectedTrip.name}) ...\nEND:VCALENDAR`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        setPreviewUrl(URL.createObjectURL(blob));
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`${glassCard(isDarkMode)} w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
                            <Share2 className="w-6 h-6 text-indigo-400" /> 分享與匯出
                        </h2>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">{selectedTrip?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 opacity-50" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-white/5">
                    <button onClick={() => setActiveTab('export')} className={`flex-1 py-4 text-xs font-black tracking-widest transition-all ${activeTab === 'export' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'opacity-40'}`}>📤 匯出</button>
                    <button onClick={() => setActiveTab('share')} className={`flex-1 py-4 text-xs font-black tracking-widest transition-all ${activeTab === 'share' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'opacity-40'}`}>🔗 分享</button>
                </div>

                {activeTab === 'export' ? (
                    <div className="p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2">
                        {/* Types */}
                        <div className="grid grid-cols-4 gap-2">
                            {EXPORT_TYPES.map(t => (
                                <button key={t.id} onClick={() => setExportType(t)} className={`p-4 rounded-2xl border transition-all text-center ${exportType?.id === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:bg-white/5'}`}>
                                    <t.icon className={`w-5 h-5 mx-auto mb-1 ${exportType?.id === t.id ? 'text-indigo-400' : 'opacity-40'}`} />
                                    <div className="text-[10px] font-bold tracking-tighter">{t.label}</div>
                                </button>
                            ))}
                        </div>

                        {/* Scope selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">匯出範圍 SCOPE</label>
                            <div className="grid grid-cols-4 gap-2">
                                {SCOPE_OPTIONS.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setScope(s.id)}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-black border transition-all ${scope === s.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PDF Templates */}
                        {exportType?.id === 'pdf' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">選擇風格 TEMPLATE</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PDF_TEMPLATES.map(tmpl => (
                                        <button key={tmpl.id} onClick={() => setPdfTemplate(tmpl.id)} className={`py-2 px-3 rounded-xl text-[10px] font-black border transition-all ${pdfTemplate === tmpl.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 opacity-60'}`}>{tmpl.label}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* V1.1.6: PDF Layout Controls */}
                        {exportType?.id === 'pdf' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                {/* Mode Tabs */}
                                <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                                    <button
                                        onClick={() => setLayoutMode('quick')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black transition-all ${layoutMode === 'quick' ? 'bg-indigo-500 text-white shadow-lg' : 'opacity-50 hover:opacity-80'}`}
                                    >
                                        ⚡ 簡易
                                    </button>
                                    <button
                                        onClick={() => setLayoutMode('pro')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black transition-all ${layoutMode === 'pro' ? 'bg-indigo-500 text-white shadow-lg' : 'opacity-50 hover:opacity-80'}`}
                                    >
                                        🎨 專業
                                    </button>
                                </div>

                                {/* Quick Mode: Items per Page */}
                                {layoutMode === 'quick' && (
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-[10px] font-black opacity-60">每頁項目</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                            className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-1.5 text-[11px] font-black text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value={2}>2 項</option>
                                            <option value={3}>3 項</option>
                                            <option value={4}>4 項</option>
                                            <option value={6}>6 項</option>
                                        </select>
                                    </div>
                                )}

                                {/* Pro Mode: Coming Soon */}
                                {layoutMode === 'pro' && (
                                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 text-center">
                                        <div className="text-2xl mb-2">🚧</div>
                                        <p className="text-[10px] font-black opacity-60">拖拉式排版 (開發中)</p>
                                        <p className="text-[8px] opacity-40 mt-1">V1.2.0 推出</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Preview */}
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1.5 ml-1">預覽 PREVIEW</div>
                        <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 h-40 overflow-hidden relative group">
                            {/* Maximize Button */}
                            {/* Maximize Button - V1.1.7: Enabled for all types */}
                            {previewUrl && (
                                <button
                                    onClick={() => setIsFullscreenPreview(true)}
                                    className="absolute top-2 right-2 z-20 p-1.5 bg-indigo-500/80 hover:bg-indigo-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                    title="放大預覽"
                                >
                                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                                </button>
                            )}
                            <div className="h-full w-full p-4 flex items-center justify-center overflow-auto custom-scrollbar">
                                {exportType?.id === 'pdf' || previewUrl ? (
                                    <>
                                        {isPreviewLoading && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>}
                                        {previewUrl ? (
                                            exportType?.id === 'pdf' ? (
                                                <iframe src={previewUrl} className="w-full h-full border-none scale-90" title="PDF" />
                                            ) : (
                                                <iframe src={previewUrl} className="w-full h-full border-none bg-white rounded-lg" title="Preview" />
                                            )
                                        ) : <p className="text-[10px] opacity-20">等待生成...</p>}
                                    </>
                                ) : (
                                    <pre className="text-[10px] opacity-40 font-mono leading-relaxed">請選取匯出格式</pre>
                                )}
                            </div>
                        </div>

                        {/* Fullscreen Preview Overlay */}
                        {isFullscreenPreview && previewUrl && (
                            <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col animate-fade-in">
                                <div className="flex justify-between items-center p-4 border-b border-white/10">
                                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                                        <Download className="w-4 h-4 text-indigo-400" /> {exportType?.label} 預覽 (Full Screen)
                                    </h3>
                                    <button
                                        onClick={() => setIsFullscreenPreview(false)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                    >
                                        <Minimize2 className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <div className="flex-1 p-4">
                                    <iframe src={previewUrl} className={`w-full h-full border-none rounded-xl shadow-2xl ${exportType?.id !== 'pdf' ? 'bg-white' : ''}`} title="Fullscreen Preview" />
                                </div>
                            </div>
                        )}

                        <button onClick={handleExport} disabled={!exportType || isExporting} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            立即匯出 {exportType?.label}
                        </button>
                    </div>
                ) : (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
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
                                    <input type="text" readOnly value={shareUrl} className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono opacity-60" />
                                    <button onClick={handleCopyLink} className="aspect-square w-12 flex items-center justify-center bg-indigo-600 rounded-xl">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    <button className="flex-1 py-10 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-green-500/20 transition-all"><MessageCircle className="w-6 h-6 text-green-400" /><span className="text-[10px] font-black opacity-60">WhatsApp</span></button>
                                    <button className="flex-1 py-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-500/20 transition-all"><Share2 className="w-6 h-6 text-blue-400" /><span className="text-[10px] font-black opacity-60">Facebook</span></button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
