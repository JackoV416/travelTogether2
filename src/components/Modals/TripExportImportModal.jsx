import React, { useState, useEffect } from 'react';
import { X, Download, Upload, FileText, Image, Copy, FileJson, Check, Sparkles, Loader2, Eye } from 'lucide-react';
import { exportToBeautifulPDF, exportToJSON, exportToImage } from '../../services/pdfExport';
import { glassCard, inputClasses } from '../../utils/tripUtils.jsx';
import { parseTripImage } from '../../services/ai';
import PDFPreviewModal from './PDFPreviewModal';

/**
 * Unified Export/Import Modal
 * Handles both Dashboard (Trip level) and TripDetail (Section level) operations
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - mode: 'export' | 'import'
 * - sourceType: 'trip' | 'section' (dashboard vs detail)
 * - data: object (trip object) OR array (section data)
 * - onImport: function(data) - for import only
 * - isDarkMode: boolean
 * - trips: array (optional, for Dashboard trip selection)
 * - selectedTripId: string (optional, for Dashboard trip selection)
 * - setSelectedTripId: function (optional, for Dashboard trip selection)
 * - section: string (optional, for section title e.g. 'itinerary')
 */
const TripExportImportModal = ({
    isOpen,
    onClose,
    mode = 'export',
    sourceType = 'trip',
    data,
    onImport,
    isDarkMode,
    trips = [],
    selectedTripId,
    setSelectedTripId,
    section,
    trip // Optional: full trip object for section export context
}) => {
    const [importMode, setImportMode] = useState('json'); // json, csv, image
    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedData, setSelectedData] = useState(null);
    const [scanLoading, setScanLoading] = useState(false); // AI Scan Loading
    const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false); // V1.7.0: PDF Preview

    // Initial Setup
    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setErrorMessage("");

            // For detail view, data is passed directly
            if (sourceType === 'section') {
                setInputValue(mode === 'export' ? JSON.stringify(data || [], null, 2) : "");
            }
        }
    }, [isOpen, mode, sourceType, data]);

    // Update selected data for Export Logic
    useEffect(() => {
        if (sourceType === 'trip') {
            if (trips.length > 0 && selectedTripId) {
                const t = trips.find(t => t.id === selectedTripId);
                setSelectedData(t);
            }
        } else if (sourceType === 'section') {
            // For section mode:
            // - JSON Export/Copy uses 'inputValue' (which is JSON string of section data)
            // - PDF Export needs the full TRIP object
            // - Image Export needs the DOM element (handled by ID)
            if (trip) {
                setSelectedData(trip);
            }
        }
    }, [selectedTripId, trips, sourceType, data, trip]);

    if (!isOpen) return null;

    // --- Actions ---

    const handleExportPDF = () => {
        // If sourceType is trip, selectedData is the trip.
        // If sourceType is section, we ideally want the whole trip for a nice PDF, 
        // OR we export just that section. Currently PDF export expects a full trip object.
        // For now, let's assume if it's Dashboard, we have selectedData as trip.
        // If it's TripDetail, caller should pass the trip object as 'selectedData' or 'trip'.

        // * Correction *: To simplify, if we are in Section mode (TripDetail), 
        // we likely want to export the WHOLE trip as PDF anyway, or just that section?
        // The previous SectionDataModal exported the whole trip for PDF.
        // So 'data' passed to this modal in TripDetail should preferably be the 'trip' object if we want full PDF.
        // However, 'data' is also used for the JSON text area.

        // Strategy: 
        // Dashboard: data=null, use trips/selectedTripId to find trip. exportToBeautifulPDF(trip).
        // TripDetail: data=trip object. exportToBeautifulPDF(trip).
        //             text area content = sections? 

        // Let's rely on `selectedData` being the Trip Object for PDF/Image functions.
        if (!selectedData) return alert("無法獲取行程資料");
        exportToBeautifulPDF(selectedData, { template: 'modern' });
    };

    const handleExportJSON = () => {
        if (!selectedData) return alert("無法獲取行程資料");
        exportToJSON(selectedData);
    };

    const handleExportImage = async () => {
        // Target specific element ID based on context
        const elementId = sourceType === 'trip' ? 'ignored-for-dashboard' : 'trip-detail-content';

        if (sourceType === 'trip') {
            alert("Dashboard 暫不支援直接圖片匯出，請進入行程詳情頁使用 (需渲染畫面)");
            return;
        }

        const element = document.getElementById(elementId) || document.body;
        await exportToImage(element, `${selectedData?.name || 'trip'} -export `);
    };

    const handleCopyJSON = () => {
        // For Section Export: Copy the specific section array (passed as inputValue usually)
        // For Trip Export: Copy the whole trip JSON
        const textToCopy = sourceType === 'section' ? inputValue : JSON.stringify(selectedData, null, 2);
        navigator.clipboard.writeText(textToCopy);
        alert("已複製 JSON 到剪貼簿");
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanLoading(true);
        setErrorMessage("");

        try {
            const results = await parseTripImage(file);
            // Format to JSON and switch to JSON view for review
            setInputValue(JSON.stringify(results, null, 2));
            setImportMode('json');
        } catch (err) {
            setErrorMessage("Jarvis 識別失敗: " + err.message);
        } finally {
            setScanLoading(false);
            // Reset file input
            e.target.value = null;
        }
    };

    const handleImportSubmit = () => {
        if (!inputValue.trim()) {
            setErrorMessage("請輸入內容");
            return;
        }
        try {
            // Basic validation or parsing could happen here, but usually passed to parent
            // Pass selectedTripId for Dashboard import targeting
            onImport(inputValue, importMode, selectedTripId);
            // Parent handles closing or errors
        } catch (e) {
            setErrorMessage("匯入格式錯誤: " + e.message);
        }
    };

    // --- Renders ---

    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-3xl rounded-2xl p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-2xl transition-all transform scale-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-start mb-8 flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${mode === 'import' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-pink-500/10 text-pink-500'}`}>
                                {mode === 'import' ? <Upload className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                            </div>
                            {mode === 'import' ? '匯入' : '匯出'} {section ? titleMap[section] : '行程'}
                        </h3>
                        <p className="text-sm opacity-60 mt-2 font-medium ml-1">
                            {mode === 'import' ? '支援 JSON 格式還原行程資料，或使用 Jarvis 智能識別。' : '選擇匯出格式或複製原始碼備份。'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                {/* Dashboard: Select Trip Dropdown */}
                {sourceType === 'trip' && (trips.length > 0 || mode === 'import') && (
                    <div className="mb-8 flex-shrink-0">
                        <label className="block text-xs font-bold mb-2 opacity-70 uppercase tracking-wider ml-1">
                            {mode === 'import' ? '匯入至...' : '選擇行程'}
                        </label>
                        <select
                            value={selectedTripId}
                            onChange={e => setSelectedTripId(e.target.value)}
                            className={inputClasses() + " cursor-pointer appearance-none"}
                        >
                            <option value="" className="dark:bg-slate-900">-- 請選擇 --</option>
                            {mode === 'import' && <option value="new" className="dark:bg-slate-900">🆕 建立新行程 (Create New Trip)</option>}
                            {trips.map(t => <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.name}</option>)}
                        </select>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">

                    {/* EXPORT MODE */}
                    {mode === 'export' && (
                        <div className="space-y-6">
                            {(selectedTripId || sourceType === 'section') && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button onClick={() => setIsPDFPreviewOpen(true)} className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 flex flex-col items-center gap-2 transition-all group text-center">
                                        <Eye className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold text-indigo-500">PDF 預覽 & 匯出</span>
                                        <span className="text-xs opacity-60">V1.7.0 新功能</span>
                                    </button>

                                    <button onClick={handleExportImage} className={`p-4 rounded-xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 flex flex-col items-center gap-2 transition-all group text-center ${sourceType === 'trip' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <Image className="w-8 h-8 text-pink-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold text-pink-500">圖片匯出</span>
                                        <span className="text-xs opacity-60">長截圖 (PNG)</span>
                                    </button>

                                    <button onClick={handleExportJSON} className="p-4 rounded-xl border border-gray-500/30 bg-gray-500/5 hover:bg-gray-500/10 flex flex-col items-center gap-2 transition-all group text-center">
                                        <Download className="w-8 h-8 text-gray-500 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold">JSON 下載</span>
                                        <span className="text-xs opacity-60">完整檔案</span>
                                    </button>
                                </div>
                            )}

                            <div>
                                <div className="text-sm opacity-70 mb-2 font-bold flex justify-between items-center">
                                    <span>純文字資料 (JSON)：</span>
                                    <button onClick={handleCopyJSON} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 font-bold px-2 py-1 rounded hover:bg-indigo-500/10 transition">
                                        <Copy className="w-3 h-3" /> 複製代碼
                                    </button>
                                </div>
                                <textarea
                                    value={sourceType === 'trip' && selectedData ? JSON.stringify(selectedData, null, 2) : inputValue}
                                    readOnly
                                    className="w-full h-48 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-xs text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* IMPORT MODE */}
                    {mode === 'import' && (
                        <div className="space-y-6">
                            <div className="flex gap-2 p-1 bg-gray-500/10 rounded-xl w-fit mb-4">
                                {['json', 'csv', 'image'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setImportMode(m)}
                                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${importMode === m ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-md transform scale-105' : 'hover:bg-gray-500/10 opacity-70 hover:opacity-100'} uppercase tracking-wide`}
                                    >
                                        {m === 'image' ? '圖片 / PDF' : m}
                                    </button>
                                ))}
                            </div>

                            {importMode === 'image' ? (
                                <div className="w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                                    {scanLoading ? (
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                            <div className="text-pink-500 font-bold">Jarvis 正在分析單據...</div>
                                            <div className="text-xs opacity-60">正在識別日期、金額與地點</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-pink-500/10 p-5 rounded-full mb-4 ring-4 ring-pink-500/5">
                                                <Image className="w-10 h-10 text-pink-500" />
                                            </div>
                                            <p className="font-bold text-lg mb-2">上傳單據、截圖或 PDF</p>
                                            <p className="text-sm opacity-60 mb-6 max-w-sm leading-relaxed">
                                                Jarvis 助手將自動識別內容並補全缺失的時間與地點資訊。
                                                <br />支援 PNG, JPG, PDF 等格式。
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                id="ai-upload"
                                                onChange={handleImageUpload}
                                            />
                                            <label htmlFor="ai-upload" className="cursor-pointer px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                                                <Upload className="w-4 h-4" /> 選擇檔案
                                            </label>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="w-full h-64 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    placeholder={importMode === 'json' ? '[{"name":"Tokyo Trip", ...}]' : 'name,country,city,startDate,endDate\nTokyo Trip,JP,Tokyo,2025-04-01,2025-04-05'}
                                />
                            )}

                            {errorMessage && (
                                <div className="text-sm text-red-400 flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>{errorMessage}
                                </div>
                            )}

                            {/* Jarvis 識別成功提示 */}
                            {!scanLoading && inputValue && importMode === 'json' && inputValue.includes("aiSuggested") && (
                                <div className="text-xs text-green-400 flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                                    <Sparkles className="w-3 h-3" />
                                    Jarvis 已成功識別並自動補全了部分缺漏資訊，請檢查上方 JSON。
                                </div>
                            )}
                        </div>

                    )}

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-500/10 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-3.5 rounded-xl border border-gray-500/30 hover:bg-gray-500/5 transition-all font-bold text-sm opacity-70 hover:opacity-100">
                        關閉
                    </button>
                    {mode === 'import' && (
                        <button onClick={handleImportSubmit} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-95 font-bold text-sm flex items-center gap-2 shadow-md">
                            <Upload className="w-4 h-4" /> 確認匯入
                        </button>
                    )}
                </div>

            </div>

            {/* V1.7.0: PDF Preview Modal */}
            <PDFPreviewModal
                isOpen={isPDFPreviewOpen}
                onClose={() => setIsPDFPreviewOpen(false)}
                trip={selectedData}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

// Title helper
const titleMap = { itinerary: "行程", shopping: "購物清單", budget: "預算" };

export default TripExportImportModal;
