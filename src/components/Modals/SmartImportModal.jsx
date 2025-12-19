import React, { useState, useRef } from 'react';
import { Upload, X, Image, FileText, Receipt, Brain, FileJson, FileSpreadsheet, Check, Loader2, CheckCircle, AlertCircle, RefreshCw, Save, Trash2, Sparkles, AlertTriangle, FileCheck } from 'lucide-react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../firebase';
import { parseTripImage } from '../../services/ai';
import { getDaysArray } from '../../utils/tripUtils';

// Premium UI Classes
const glassCard = (isDarkMode) => isDarkMode ? "bg-gray-900/60 backdrop-blur-md border border-white/10 text-white shadow-xl" : "bg-white/80 backdrop-blur-md border border-white/20 text-gray-900 shadow-xl";

const IMPORT_TYPES = [
    { id: 'screenshot', label: '行程截圖', icon: Image, desc: '上傳行程圖片，AI 自動識別', color: 'indigo' },
    { id: 'receipt', label: '預算單據', icon: Receipt, desc: '機票、酒店、收據掃描', color: 'green' },
    { id: 'memory', label: '回憶 / 靈感', icon: Brain, desc: '相片或文件存檔', color: 'purple' },
    { id: 'json', label: 'JSON 匯入', icon: FileJson, desc: '完整行程資料結構', color: 'blue' },
    { id: 'csv', label: 'CSV 匯入', icon: FileSpreadsheet, desc: '表格格式匯入', color: 'amber' },
];

export default function SmartImportModal({ isOpen, onClose, isDarkMode, onImport, trips = [], trip }) {
    const [importType, setImportType] = useState(null);
    const [files, setFiles] = useState([]);
    const [stage, setStage] = useState(1); // 1: Select type, 2: Upload file, 3: Processing, 4: Result
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = React.useState(null);
    const fileInputRef = useRef(null);

    const [selectedTripId, setSelectedTripId] = React.useState(trip?.id || (trips.length > 0 ? trips[0].id : ''));
    const [importedIds, setImportedIds] = React.useState([]); // Track IDs for Undo

    // Reset/Update selectedTripId when modal opens or trips change
    React.useEffect(() => {
        if (isOpen) {
            if (trip) {
                setSelectedTripId(trip.id);
            } else if (trips.length > 0 && !selectedTripId) {
                setSelectedTripId(trips[0].id);
            }
        }
    }, [isOpen, trip, trips]);

    if (!isOpen) return null;

    const handleTypeSelect = (type) => {
        setImportType(type);
        setStage(2);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files || []);
        if (droppedFiles.length > 0) {
            setFiles(droppedFiles);
        }
    };

    const handleSubmit = async () => {
        if (files.length === 0 || !importType || !selectedTripId) return;
        setIsProcessing(true);
        setStage(3);

        try {
            // Process based on type
            let processedData = null;
            let successMessage = '';

            // 1. Upload files to Storage first (Best-effort for CORS issues)
            const uploadedUrls = [];
            /* TEMPORARILY DISABLED TO FIX LOCALHOST CORS BLOCK
            try {
                for (const file of files) {
                    const timestamp = Date.now();
                    const storageRef = ref(storage, `trips/${selectedTripId}/imports/${importType.id}/${timestamp}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(snapshot.ref);
                    uploadedUrls.push({ url, name: file.name, type: file.type });
                }
            } catch (uploadErr) {
                console.warn("[SmartImport] Upload failed (likely CORS), proceeding with local OCR:", uploadErr);
            }
            */

            switch (importType.id) {
                case 'json':
                    const jsonText = await files[0].text();
                    processedData = JSON.parse(jsonText);
                    successMessage = `成功解析 JSON，包含 ${Object.keys(processedData).length} 個資料區塊`;
                    break;

                case 'csv':
                    const csvText = await files[0].text();
                    const lines = csvText.trim().split('\n');
                    processedData = { type: 'csv', rows: lines.length - 1 };
                    successMessage = `成功解析 CSV，共 ${lines.length - 1} 行資料`;
                    break;

                case 'screenshot': // OCR -> Itinerary
                case 'receipt':    // OCR -> Budget/Shopping
                    if (files.length > 0) {
                        let allItems = [];
                        let scanMessages = [];

                        // 1. Loop through ALL files
                        for (let i = 0; i < files.length; i++) {
                            try {
                                const ocrResult = await parseTripImage(files[i], importType.id);
                                if (ocrResult.items && ocrResult.items.length > 0) {
                                    const itemsWithMeta = ocrResult.items.map(item => ({
                                        ...item,
                                        evidenceUrl: uploadedUrls[i]?.url || null, // Attach specific URL
                                        ocrDate: ocrResult.parsedData?.date // Attach detected date to item
                                    }));
                                    allItems = [...allItems, ...itemsWithMeta];
                                    scanMessages.push(`圖片 ${i + 1}: 成功`);
                                } else {
                                    scanMessages.push(`圖片 ${i + 1}: 無內容`);
                                }
                            } catch (e) {
                                console.error(`Error processing file ${i}:`, e);
                                scanMessages.push(`圖片 ${i + 1}: 失敗`);
                            }
                        }

                        processedData = allItems;
                        successMessage = `批量處理完成: ${scanMessages.join(', ')}`;

                        if (processedData.length > 0) {
                            const tripRef = doc(db, "trips", selectedTripId);

                            if (importType.id === 'receipt') {
                                // Add to Budget & Shopping (All to same lists)
                                await updateDoc(tripRef, {
                                    budget: arrayUnion(...processedData.map(i => ({
                                        ...i,
                                        category: i.category || 'shopping',
                                        payer: 'Me',
                                        splitType: 'group',
                                        details: { ...i.details, receiptUrl: i.evidenceUrl }
                                    }))),
                                    shoppingList: arrayUnion(...processedData.map(i => ({
                                        ...i,
                                        checked: false,
                                        details: { ...i.details, receiptUrl: i.evidenceUrl }
                                    })))
                                });
                            } else if (importType.id === 'screenshot') {
                                // Add to Itinerary (Grouped by Date)
                                const trip = trips.find(t => t.id === selectedTripId);
                                if (trip) {
                                    const tripDays = getDaysArray(trip.startDate, trip.endDate);
                                    const updates = {}; // { '2025-12-29': [items], '2025-12-30': [items] }

                                    processedData.forEach(item => {
                                        let targetDate = trip.startDate; // Default
                                        const date = item.ocrDate;

                                        if (date) {
                                            // Find matching match
                                            const match = tripDays.find(d => d.endsWith(date) || d.includes(date));
                                            if (match) targetDate = match;

                                            // Fallback: If date is "12-29" and trip has year, try to construct?
                                            // The regex in ai.js returns "YYYY-MM-DD" or "MM-DD".
                                            // getDaysArray returns "YYYY-MM-DD".
                                            // d.endsWith(date) handles "MM-DD" matching "YYYY-MM-DD".
                                        }

                                        if (!updates[targetDate]) updates[targetDate] = [];

                                        updates[targetDate].push({
                                            id: item.id || crypto.randomUUID(),
                                            name: item.name,
                                            startTime: item.time || '10:00',
                                            location: {
                                                name: item.details?.location || item.name,
                                                lat: 34.6937, // Osaka default or mock
                                                lng: 135.5023
                                            },
                                            type: item.type || 'spot',
                                            notes: item.details?.desc || '',
                                            isCompleted: false,
                                            evidenceUrl: item.evidenceUrl
                                        });
                                    });

                                    // Apply Updates atomically per day? Or one big updateDoc?
                                    // updateDoc supports multiple fields: { "itinerary.2025-12-29": arrayUnion(...) }
                                    // But arrayUnion cannot be dynamic in loop easily if using same key twice?
                                    // Actually we can prepare data first.
                                    // But Firestore updateDoc merges keys.
                                    // We should use `arrayUnion`.

                                    const batchUpdates = {};
                                    const newBatchIds = [];

                                    for (const [dateKey, items] of Object.entries(updates)) {
                                        batchUpdates[`itinerary.${dateKey}`] = arrayUnion(...items);
                                        items.forEach(i => newBatchIds.push({ id: i.id, date: dateKey, type: 'itinerary' }));
                                    }

                                    await updateDoc(tripRef, batchUpdates);
                                    setImportedIds(newBatchIds);
                                }
                            }
                        }
                    }
                    break;

                case 'memory': // Just save to Files
                    // Already uploaded above.
                    // Update Firestore Files array
                    const newFiles = uploadedUrls.map(u => ({
                        id: `file-${Date.now()}-${Math.random()}`,
                        name: u.name,
                        path: u.url, // Using full URL as path for simplicity here, logic in FilesTab might differ
                        type: u.type,
                        category: 'memory',
                        uploadedAt: Date.now()
                    }));
                    await updateDoc(doc(db, "trips", selectedTripId), {
                        files: arrayUnion(...newFiles)
                    });
                    successMessage = `成功將 ${files.length} 個回憶檔案儲存到檔案庫`;
                    processedData = newFiles;
                    break;

                default:
                    processedData = { type: importType.id, fileCount: files.length };
                    break;
            }

            // Call onImport callback if provided (for notifications)
            if (onImport) {
                await onImport({ type: importType.id, files, data: processedData });
            }

            setResult({ success: true, message: successMessage, data: processedData, type: importType.id });
            setStage(4);
        } catch (error) {
            console.error(error);
            setResult({ success: false, message: `處理失敗: ${error.message}`, data: null });
            setStage(4);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndoImport = async () => {
        if (!importedIds || importedIds.length === 0) return;

        try {
            const tripRef = doc(db, "trips", selectedTripId);
            const tripSnap = await getDoc(tripRef); // Use getDoc from firebase/firestore

            if (tripSnap.exists()) {
                const data = tripSnap.data();
                const updates = {};

                // Group IDs by Date for efficiency (for itinerary)
                const itineraryIdsByDate = importedIds.filter(item => item.type === 'itinerary').reduce((acc, curr) => {
                    if (!acc[curr.date]) acc[curr.date] = new Set();
                    acc[curr.date].add(curr.id);
                    return acc;
                }, {});

                for (const [date, idSet] of Object.entries(itineraryIdsByDate)) {
                    const currentItems = data.itinerary?.[date] || [];
                    const newItems = currentItems.filter(i => !idSet.has(i.id));
                    if (newItems.length !== currentItems.length) {
                        updates[`itinerary.${date}`] = newItems;
                    }
                }

                // Handle Budget/Shopping (receipts)
                const budgetIds = new Set(importedIds.filter(item => item.type === 'receipt_budget').map(item => item.id));
                if (budgetIds.size > 0) {
                    const currentBudget = data.budget || [];
                    const newBudget = currentBudget.filter(item => !budgetIds.has(item.id));
                    if (newBudget.length !== currentBudget.length) {
                        updates.budget = newBudget;
                    }
                }

                const shoppingIds = new Set(importedIds.filter(item => item.type === 'receipt_shopping').map(item => item.id));
                if (shoppingIds.size > 0) {
                    const currentShoppingList = data.shoppingList || [];
                    const newShoppingList = currentShoppingList.filter(item => !shoppingIds.has(item.id));
                    if (newShoppingList.length !== currentShoppingList.length) {
                        updates.shoppingList = newShoppingList;
                    }
                }

                // Handle Memory Files
                const memoryFileIds = new Set(importedIds.filter(item => item.type === 'memory_file').map(item => item.id));
                if (memoryFileIds.size > 0) {
                    const currentFiles = data.files || [];
                    const newFiles = currentFiles.filter(item => !memoryFileIds.has(item.id));
                    if (newFiles.length !== currentFiles.length) {
                        updates.files = newFiles;
                    }
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(tripRef, updates);
                    setResult(prev => ({ ...prev, message: "已成功撤銷剛剛的匯入！" }));
                    setImportedIds([]); // Clear imported IDs after undo
                }
            }
        } catch (err) {
            console.error("撤銷失敗:", err);
            setResult(prev => ({ ...prev, success: false, message: `撤銷失敗: ${err.message}` }));
        }
    };

    const handleReset = () => {
        setImportType(null);
        setFiles([]);
        setStage(1);
        setIsProcessing(false);
        setResult(null);
        setImportedIds([]); // Clear imported IDs on reset
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const getAcceptTypes = () => {
        if (!importType) return '*/*';
        switch (importType.id) {
            case 'json': return '.json,application/json';
            case 'csv': return '.csv,text/csv';
            case 'screenshot':
            case 'receipt':
            case 'memory':
            default: return 'image/*,application/pdf,.pdf';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`${glassCard(isDarkMode)} w-full max-w-lg rounded-2xl overflow-hidden`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Upload className="w-6 h-6 text-indigo-400" /> 智能匯入中心
                        </h2>
                        <p className="text-sm opacity-60 mt-1">
                            {stage === 1 ? '選擇匯入類型' : stage === 2 ? '上傳檔案' : stage === 3 ? 'AI 識別中...' : '匯入完成'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                {/* Scope Selection (If Multiple Trips) */}
                {stage === 1 && trips.length > 1 && !trip && (
                    <div className="px-6 pt-4 pb-0">
                        <label className="text-xs font-bold opacity-70 block mb-2">選擇目標行程</label>
                        <select
                            value={selectedTripId}
                            onChange={(e) => setSelectedTripId(e.target.value)}
                            className="w-full bg-gray-500/10 border border-gray-500/20 rounded-lg p-2 text-sm"
                        >
                            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                )}

                {/* Stage 1: Type Selection */}
                {stage === 1 && (
                    <div className="p-6 grid grid-cols-2 gap-3">
                        {IMPORT_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => handleTypeSelect(type)}
                                className={`p-4 rounded-xl border transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${isDarkMode ? `bg-${type.color}-500/10 border-${type.color}-500/30 hover:bg-${type.color}-500/20` : `bg-${type.color}-50 border-${type.color}-200 hover:bg-${type.color}-100`}`}
                            >
                                <type.icon className={`w-6 h-6 mb-2 text-${type.color}-400`} />
                                <div className="font-bold text-sm">{type.label}</div>
                                <div className="text-[10px] opacity-60 mt-1">{type.desc}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Stage 2: File Upload */}
                {stage === 2 && importType && (
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-sm">
                            <importType.icon className={`w-5 h-5 text-${importType.color}-400`} />
                            <span className="font-bold">{importType.label}</span>
                            <button onClick={handleReset} className="ml-auto text-xs opacity-60 hover:opacity-100">更改類型</button>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${files.length > 0 ? 'border-green-500 bg-green-500/10' : (isDarkMode ? 'border-white/20 hover:border-white/40' : 'border-gray-300 hover:border-gray-400')}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={getAcceptTypes()}
                                multiple={importType.id !== 'json'}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {files.length > 0 ? (
                                <div>
                                    <Check className="w-10 h-10 mx-auto text-green-500 mb-2" />
                                    <p className="font-bold text-green-400">{files.length} 個檔案已選擇</p>
                                    <p className="text-xs opacity-60 mt-1">{files.map(f => f.name).join(', ')}</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-10 h-10 mx-auto opacity-30 mb-2" />
                                    <p className="font-bold">拖放檔案或點擊上傳</p>
                                    <p className="text-xs opacity-60 mt-1">
                                        {importType.id === 'receipt' || importType.id === 'screenshot'
                                            ? '支援圖片 (JPG, PNG) - AI 自動識別內容'
                                            : '選擇您的檔案'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={files.length === 0}
                            className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${files.length > 0 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-500/30 text-gray-400 cursor-not-allowed'}`}
                        >
                            開始識別並匯入
                        </button>
                    </div>
                )}

                {/* Stage 3: Processing */}
                {stage === 3 && (
                    <div className="p-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto animate-spin text-indigo-400 mb-6" />
                        <p className="font-bold text-lg mb-2">AI 正在分析您的圖片...</p>
                        <p className="text-xs opacity-60">我們使用光學字符識別 (OCR) 技術提取文字資訊</p>
                    </div>
                )}

                {/* Stage 4: Result */}
                {stage === 4 && result && (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            {result.success ? (
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                            )}
                            <h3 className={`text-xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                {result.success ? '匯入處理完成' : '處理失敗'}
                            </h3>
                            <p className="opacity-60 text-sm mt-2">{result.message}</p>
                        </div>

                        {/* Result Preview (if Items) */}
                        {result.data && Array.isArray(result.data) && result.data.length > 0 && (
                            <div className="bg-gray-500/5 rounded-xl p-4 mb-6 max-h-[150px] overflow-y-auto custom-scrollbar">
                                <p className="text-xs font-bold opacity-70 mb-2">識別到的項目：</p>
                                {result.data.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                                        <span>{item.name}</span>
                                        <span className="opacity-70">{item.cost ? `${item.currency || ''} ${item.cost}` : item.time || ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            {importedIds.length > 0 && (
                                <button
                                    onClick={handleUndoImport}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    撤銷匯入
                                </button>
                            )}
                            <button
                                onClick={handleReset}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                <RefreshCw className="w-4 h-4" /> 再匯入其他
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> 完成並關閉
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
