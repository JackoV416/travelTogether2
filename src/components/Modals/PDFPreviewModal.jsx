import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Eye, FileText, Loader2, Settings2, LayoutGrid } from 'lucide-react';
import { exportToBeautifulPDF } from '../../services/pdfExport';

/**
 * V1.7.0: PDF Preview Modal
 * Allows users to preview and customize PDF before exporting.
 * Features:
 * - Template Selector (Modern, Glass, Retro, Compact, Vibrant)
 * - Section Toggles (Itinerary, Budget, Packing, Emergency)
 * - Items Per Page slider
 * - Live iframe Preview
 */
const PDFPreviewModal = ({
    isOpen,
    onClose,
    trip,
    isDarkMode = true
}) => {
    // --- State ---
    const [template, setTemplate] = useState('modern');
    const [scope, setScope] = useState('full');
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Template Options
    const templates = [
        { id: 'modern', label: '現代風', color: 'indigo' },
        { id: 'glass', label: '玻璃質感', color: 'cyan' },
        { id: 'retro', label: '復古紙感', color: 'amber' },
        { id: 'compact', label: '簡潔', color: 'gray' },
        { id: 'vibrant', label: '鮮艷', color: 'pink' }
    ];

    // Scope Options
    const scopes = [
        { id: 'full', label: '完整行程' },
        { id: 'itinerary', label: '僅日程' },
        { id: 'budget', label: '僅預算' },
        { id: 'packing', label: '僅行李' },
        { id: 'emergency', label: '僅緊急資訊' }
    ];

    // Generate Preview
    const generatePreview = useCallback(async () => {
        if (!trip) return;
        setIsLoading(true);
        setError(null);

        try {
            const blobUrl = await exportToBeautifulPDF(trip, {
                template,
                scope,
                itemsPerPage,
                returnBlob: true
            });

            // Revoke previous URL to prevent memory leak
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(blobUrl);
        } catch (err) {
            console.error('PDF Preview Error:', err);
            setError('預覽生成失敗: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [trip, template, scope, itemsPerPage]);

    // Auto-generate preview on open or settings change
    useEffect(() => {
        if (isOpen && trip) {
            generatePreview();
        }

        // Cleanup on close
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen, trip, template, scope, itemsPerPage]);

    // Download PDF
    const handleDownload = async () => {
        if (!trip) return;
        setIsLoading(true);
        try {
            await exportToBeautifulPDF(trip, {
                template,
                scope,
                itemsPerPage,
                returnBlob: false // Direct download
            });
        } catch (err) {
            setError('下載失敗: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
            <div className={`w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>

                {/* Header */}
                <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10">
                            <FileText className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">PDF 預覽 & 設定</h2>
                            <p className="text-xs opacity-50 mt-0.5">{trip?.name || '行程'} • V1.7.0</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                {/* Body: Sidebar + Preview */}
                <div className="flex flex-1 min-h-0">

                    {/* Left Sidebar: Settings */}
                    <div className={`w-72 flex-shrink-0 p-5 space-y-6 border-r overflow-y-auto ${isDarkMode ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>

                        {/* Template Selector */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
                                <Settings2 className="w-3.5 h-3.5" /> 樣式選擇
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTemplate(t.id)}
                                        className={`p-3 rounded-xl text-xs font-bold transition-all border ${template === t.id
                                                ? `bg-${t.color}-500/20 border-${t.color}-500 text-${t.color}-400 ring-2 ring-${t.color}-500/30`
                                                : `border-white/10 hover:bg-white/5 opacity-70 hover:opacity-100`
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scope Selector */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
                                <LayoutGrid className="w-3.5 h-3.5" /> 內容範圍
                            </label>
                            <div className="space-y-2">
                                {scopes.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setScope(s.id)}
                                        className={`w-full p-2.5 rounded-lg text-xs font-bold transition-all text-left ${scope === s.id
                                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                                                : 'hover:bg-white/5 opacity-70 hover:opacity-100 border border-transparent'
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items Per Page */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                                每頁項目數: <span className="text-indigo-400">{itemsPerPage}</span>
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="8"
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                            <div className="flex justify-between text-[10px] opacity-40 mt-1">
                                <span>2</span>
                                <span>8</span>
                            </div>
                        </div>

                        {/* Regenerate Button */}
                        <button
                            onClick={generatePreview}
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-sm hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                            {isLoading ? '生成中...' : '重新預覽'}
                        </button>
                    </div>

                    {/* Right: PDF Preview */}
                    <div className="flex-1 p-5 flex flex-col min-w-0">
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className={`flex-1 rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/10 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
                            {isLoading ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm opacity-60 font-medium">正在生成預覽...</p>
                                </div>
                            ) : previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-40">
                                    <p className="text-sm">選擇設定後預覽 PDF</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex justify-between items-center p-5 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <p className="text-xs opacity-40">提示：調整設定後會自動重新生成預覽</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                        >
                            取消
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isLoading || !trip}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            下載 PDF
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PDFPreviewModal;
