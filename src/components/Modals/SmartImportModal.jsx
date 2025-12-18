import React, { useState, useRef } from 'react';
import { Upload, FileText, Receipt, Image as ImageIcon, X, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

// Premium UI Classes (matching App.jsx)
const glassCard = (isDarkMode) => isDarkMode ? "bg-gray-900/60 backdrop-blur-md border border-white/10 text-white shadow-xl" : "bg-white/80 backdrop-blur-md border border-white/20 text-gray-900 shadow-xl";
const buttonPrimary = "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95";

export default function SmartImportModal({ isOpen, onClose, onImport, isDarkMode, trips = [] }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [importType, setImportType] = useState(null); // 'itinerary', 'budget', 'memory'
    const [selectedTripId, setSelectedTripId] = useState(trips.length > 0 ? trips[0].id : '');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreview(ev.target.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
            setImportType(null); // Reset type selection
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreview(ev.target.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
            setImportType(null);
        }
    };

    const handleSubmit = async () => {
        if (!file || !importType) return;
        setLoading(true);
        try {
            await onImport(file, importType, selectedTripId);
            // Close handled by parent usually, or reset
            setFile(null);
            setPreview(null);
            setImportType(null);
        } catch (error) {
            console.error("Import failed:", error);
            alert("匯入失敗: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`${glassCard(isDarkMode)} w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Upload className="w-6 h-6 text-indigo-400" /> 智能匯入中心
                        </h2>
                        <p className="text-sm opacity-60 mt-1">一站式處理所有旅遊文件、單據與回憶</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">

                    {/* Stage 1: Select Type + Upload */}
                    {!file ? (
                        <div className="space-y-6">
                            {/* Import Type Selection */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 opacity-80">選擇匯入類型</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {/* Option 1: Itinerary Screenshot */}
                                    <button
                                        onClick={() => setImportType('itinerary')}
                                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 group ${importType === 'itinerary' ? 'bg-indigo-600 border-indigo-500 ring-2 ring-indigo-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${importType === 'itinerary' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">行程截圖</h4>
                                        <p className="text-[10px] opacity-60">上傳行程圖片</p>
                                        {importType === 'itinerary' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                    </button>

                                    {/* Option 2: Budget Receipt */}
                                    <button
                                        onClick={() => setImportType('budget')}
                                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 group ${importType === 'budget' ? 'bg-emerald-600 border-emerald-500 ring-2 ring-emerald-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${importType === 'budget' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            <Receipt className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">消費單據</h4>
                                        <p className="text-[10px] opacity-60">加入預算表</p>
                                        {importType === 'budget' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                    </button>

                                    {/* Option 3: Memory */}
                                    <button
                                        onClick={() => setImportType('memory')}
                                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 group ${importType === 'memory' ? 'bg-pink-600 border-pink-500 ring-2 ring-pink-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-pink-500/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${importType === 'memory' ? 'bg-white/20 text-white' : 'bg-pink-500/20 text-pink-400'}`}>
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">回憶相片</h4>
                                        <p className="text-[10px] opacity-60">儲存至文件庫</p>
                                        {importType === 'memory' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                    </button>

                                    {/* Option 4: JSON Import */}
                                    <button
                                        onClick={() => setImportType('json')}
                                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 group ${importType === 'json' ? 'bg-amber-600 border-amber-500 ring-2 ring-amber-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${importType === 'json' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'}`}>
                                            <span className="text-xs font-bold">{'{}'}</span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">JSON 匯入</h4>
                                        <p className="text-[10px] opacity-60">完整行程數據</p>
                                        {importType === 'json' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                    </button>

                                    {/* Option 5: CSV Import */}
                                    <button
                                        onClick={() => setImportType('csv')}
                                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 group ${importType === 'csv' ? 'bg-cyan-600 border-cyan-500 ring-2 ring-cyan-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${importType === 'csv' ? 'bg-white/20 text-white' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                            <span className="text-[10px] font-bold">CSV</span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">CSV 匯入</h4>
                                        <p className="text-[10px] opacity-60">試算表格式</p>
                                        {importType === 'csv' && <div className="absolute top-2 right-2 text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                    </button>
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${isDarkMode ? 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5' : 'border-gray-300 hover:border-indigo-500/50 hover:bg-gray-50'}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,.json,.csv,text/csv,application/json" onChange={handleFileChange} />
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-7 h-7 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-1">點擊或拖放檔案</h3>
                                <p className="opacity-60 text-sm">支援圖片、PDF、JSON、CSV</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            {/* File Preview */}
                            <div className="flex items-start gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="w-24 h-24 bg-black/20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                    {preview ? (
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-8 h-8 opacity-50" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg truncate">{file.name}</h4>
                                            <p className="text-xs opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}</p>
                                        </div>
                                        <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:text-red-300 underline">移除</button>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-indigo-400 font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> 檔案已就緒，請選擇用途
                                    </div>
                                </div>
                            </div>

                            {/* Selected Import Type Confirmation */}
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                                <div className="text-sm opacity-60 mb-1">匯入類型</div>
                                <div className="font-bold flex items-center gap-2">
                                    {importType === 'itinerary' && <><FileText className="w-4 h-4 text-indigo-400" /> 行程截圖</>}
                                    {importType === 'budget' && <><Receipt className="w-4 h-4 text-emerald-400" /> 消費單據</>}
                                    {importType === 'memory' && <><ImageIcon className="w-4 h-4 text-pink-400" /> 回憶相片</>}
                                    {importType === 'json' && <><span className="text-xs text-amber-400">{'{}'}</span> JSON 匯入</>}
                                    {importType === 'csv' && <><span className="text-xs text-cyan-400">CSV</span> CSV 匯入</>}
                                    <button onClick={() => setFile(null)} className="ml-auto text-xs text-indigo-400 hover:underline">更改</button>
                                </div>
                            </div>

                            {/* Trip Selection (If trips provide) */}
                            {trips.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold mb-2 opacity-80">目標行程</h3>
                                    <select
                                        value={selectedTripId}
                                        onChange={(e) => setSelectedTripId(e.target.value)}
                                        className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} outline-none focus:border-indigo-500`}
                                    >
                                        {trips.map(t => <option key={t.id} value={t.id}>{t.name} ({t.startDate})</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors">
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || !importType || loading}
                        className={`${buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        {loading ? "處理中..." : "開始匯入"}
                    </button>
                </div>
            </div>
        </div>
    );
}
