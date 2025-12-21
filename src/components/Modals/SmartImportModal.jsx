import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image, FileText, Receipt, Brain, FileJson, FileSpreadsheet, Check, Loader2, CheckCircle, AlertCircle, RefreshCw, Save, Trash2, Sparkles, AlertTriangle, FileCheck } from 'lucide-react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../firebase';
import { parseImageDirectly, filterJunkItems } from '../../services/ai-parsing';
import { getDaysArray, glassCard } from '../../utils/tripUtils';


const IMPORT_TYPES = [
    { id: 'screenshot', label: '行程截圖', icon: Image, desc: '上傳行程圖片，AI 自動識別', color: 'indigo' },
    { id: 'receipt', label: '預算單據', icon: Receipt, desc: '機票、酒店、收據掃描', color: 'green' },
    { id: 'memory', label: '回憶 / 靈感', icon: Brain, desc: '相片或文件存檔', color: 'purple' },
    { id: 'plaintext', label: '純文字', icon: FileText, desc: '貼上/輸入行程文字', color: 'pink' },
    { id: 'json', label: 'JSON 匯入', icon: FileJson, desc: '完整行程資料結構', color: 'blue' },
    { id: 'csv', label: 'CSV 匯入', icon: FileSpreadsheet, desc: '表格格式匯入', color: 'amber' },
];

// Helper to infer category if AI fails
const inferCategory = (name) => {
    const lower = name.toLowerCase();
    if (/hotel|bnb|inn|酒店|民宿/i.test(lower)) return 'hotel';
    if (/flight|airport|airline|機|航空/i.test(lower)) return 'flight';
    if (/restaurant|cafe|food|餐廳|食/i.test(lower)) return 'food';
    if (/station|train|bus|站|鐵|巴士/i.test(lower)) return 'transport';
    return 'spot';
};

export default function SmartImportModal({ isOpen, onClose, isDarkMode, onImport, trips = [], trip }) {
    const [importType, setImportType] = useState(null);
    const [files, setFiles] = useState([]);
    const [stage, setStage] = useState(1); // 1: Select type, 2: Upload, 3: Processing, 4: Review, 5: Result
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 }); // Progress tracking
    const [result, setResult] = useState(null);
    const [reviewItems, setReviewItems] = useState([]); // Items staged for review
    const [plaintextInput, setPlaintextInput] = useState(''); // V1.0.3: Plain text input
    const fileInputRef = useRef(null);

    const [selectedTripId, setSelectedTripId] = useState(trip?.id || (trips.length > 0 ? trips[0].id : ''));
    const [importedIds, setImportedIds] = useState([]); // Track IDs for Undo

    // Reset/Update selectedTripId when modal opens or trips change
    useEffect(() => {
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
        // V1.0.3: Handle plaintext mode
        if (importType?.id === 'plaintext') {
            if (!plaintextInput.trim() || !selectedTripId) return;
            setIsProcessing(true);
            setStage(3);

            try {
                const lines = plaintextInput.trim().split('\n').filter(l => l.trim());
                const parsedItems = lines.map((line, idx) => {
                    let time = '10:00';
                    let name = line.trim();

                    // Extract time if format is "HH:MM name"
                    const timeMatch = line.match(/^(\d{1,2}:\d{2})\s+(.+)/);
                    if (timeMatch) {
                        time = timeMatch[1].padStart(5, '0');
                        name = timeMatch[2].trim();
                    }

                    // Infer type from emoji or keywords
                    let type = 'spot';
                    if (/🍴|🍽️|餐|食|午餐|晚餐|早餐|restaurant|cafe|食堂/.test(name)) type = 'food';
                    if (/🚆|🚇|🚅|🚌|JR|線|站|transport|metro|train|bus/.test(name)) type = 'transport';
                    if (/✈️|航班|flight|airport|機場/.test(name)) type = 'flight';
                    if (/🏨|hotel|酒店|check.?in|check.?out/.test(name)) type = 'hotel';
                    if (/🛍️|買|購物|shopping|mall/.test(name)) type = 'shopping';

                    return {
                        id: crypto.randomUUID(),
                        name: name.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, '').trim() || `項目 ${idx + 1}`,
                        time,
                        type,
                        category: 'itinerary',
                        details: { desc: '', source: 'Plain Text Import' }
                    };
                });

                setReviewItems(parsedItems);
                setStage(4);
            } catch (e) {
                console.error(e);
                setResult({ success: false, message: `解析失敗: ${e.message}` });
                setStage(5);
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        if (files.length === 0 || !importType || !selectedTripId) return;
        setIsProcessing(true);
        setStage(3);

        try {
            let processedData = null;
            let successMessage = '';
            const uploadedUrls = [];

            // 1. Upload logic (Simulated or Real)
            // For localhost CORS issues, we might skip real upload or handle it gracefully.
            // Here we just prepare URL objects for preview if upload fails or is skipped.
            const filePreviews = files.map(f => URL.createObjectURL(f));

            if (importType.id === 'screenshot' || importType.id === 'receipt') {
                let allItems = [];
                const total = files.length;

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    // Update progress
                    setProgress({ current: i + 1, total, percent: Math.round(((i + 1) / total) * 100) });

                    try {
                        // 🚀 Vision-First: Send image directly to Gemini
                        const targetTrip = trips.find(t => t.id === selectedTripId) || trip;
                        const visionItems = await parseImageDirectly(file, {
                            city: targetTrip?.city || "Unknown",
                            date: targetTrip?.startDate || new Date().toISOString().split('T')[0],
                            currency: 'HKD'
                        });

                        // Add evidence URL for display
                        const itemsWithEvidence = visionItems.map(item => ({
                            ...item,
                            evidenceUrl: filePreviews[i]
                        }));

                        allItems = [...allItems, ...itemsWithEvidence];
                        console.log(`[SmartImport] File ${i + 1}: ${itemsWithEvidence.length} items`);

                    } catch (e) {
                        console.error(`[SmartImport] Error processing file ${i}:`, e);
                    }
                }

                if (allItems.length === 0) {
                    throw new Error("未能識別任何有效項目，請嘗試更清晰的圖片。");
                }

                // 5. Final local junk filter
                const cleanItems = filterJunkItems(allItems);

                setReviewItems(cleanItems);
                setStage(4); // Go to Review Stage
                setIsProcessing(false);
                return; // Stop here, wait for user confirmation
            }

            // Other Types (Immediate Import)
            switch (importType.id) {
                case 'json': {
                    const jsonText = await files[0].text();
                    const data = JSON.parse(jsonText);
                    const tripRef = doc(db, "trips", selectedTripId);

                    // Validate and merge data
                    const updates = {};
                    if (data.itinerary) updates.itinerary = data.itinerary;
                    if (data.budget) updates.budget = data.budget;
                    if (data.shoppingList) updates.shoppingList = data.shoppingList;
                    if (data.packingList) updates.packingList = data.packingList;

                    if (Object.keys(updates).length > 0) {
                        await updateDoc(tripRef, updates);
                        successMessage = `成功解析並匯入 JSON 資料`;
                    } else {
                        throw new Error("JSON 不包含有效的行程資料");
                    }
                    processedData = { type: 'json' };
                    break;
                }
                case 'csv': {
                    const csvText = await files[0].text();
                    const lines = csvText.trim().split('\n');
                    // Simple CSV parser: name, category, cost
                    const newItems = lines.slice(1).map(line => {
                        const [name, category, cost] = line.split(',');
                        return {
                            id: crypto.randomUUID(),
                            name: name?.trim() || '未命名項目',
                            category: category?.trim() || 'misc',
                            cost: parseFloat(cost) || 0,
                            currency: 'HKD',
                            checked: false
                        };
                    });

                    if (newItems.length > 0) {
                        const tripRef = doc(db, "trips", selectedTripId);
                        await updateDoc(tripRef, { shoppingList: arrayUnion(...newItems) });
                        successMessage = `成功解析並匯入 ${newItems.length} 條 CSV 數據至購物清單`;
                    }
                    processedData = { type: 'csv', count: newItems.length };
                    break;
                }
                case 'memory': {
                    const tripRef = doc(db, "trips", selectedTripId);
                    for (const file of files) {
                        const storageRef = ref(storage, `trips/${selectedTripId}/files/${file.name}`);
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);
                        await updateDoc(tripRef, {
                            files: arrayUnion({
                                name: file.name,
                                url,
                                type: file.type,
                                size: file.size,
                                uploadedAt: new Date().toISOString()
                            })
                        });
                    }
                    successMessage = `成功上傳 ${files.length} 個檔案至回憶庫`;
                    processedData = { type: 'memory', count: files.length };
                    break;
                }
                default:
                    processedData = { type: importType.id, count: files.length };
                    break;
            }

            setResult({ success: true, message: successMessage, data: processedData, type: importType.id });
            setStage(5);

        } catch (error) {
            console.error(error);
            setResult({ success: false, message: `處理失敗: ${error.message}` });
            setStage(5);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmImport = async () => {
        setIsProcessing(true);
        try {
            const tripRef = doc(db, "trips", selectedTripId);
            const targetTrip = trips.find(t => t.id === selectedTripId) || trip;

            if (!targetTrip) throw new Error("Trip not found");

            const batchUpdates = {};
            const newBatchIds = [];

            if (importType.id === 'screenshot') {
                const tripDays = getDaysArray(targetTrip.startDate, targetTrip.endDate);

                reviewItems.forEach(item => {
                    // Use date from item.details if available, otherwise trip start date
                    const targetDate = item.details?.date || targetTrip.startDate;

                    if (!batchUpdates[`itinerary.${targetDate}`]) batchUpdates[`itinerary.${targetDate}`] = [];

                    const newItem = {
                        id: item.id || crypto.randomUUID(),
                        name: item.name,
                        startTime: item.time || '10:00',
                        endTime: item.endTime || null, // For transport/flight
                        type: item.type,
                        notes: item.details?.desc || item.details?.notes || '',
                        isCompleted: false,
                        evidenceUrl: item.evidenceUrl,
                        bookingUrl: item.bookingUrl || null, // User added booking link
                        // Preserve ALL supplementary details
                        details: {
                            ...(item.details || {}),
                            importedAt: new Date().toISOString(),
                            source: 'AI Vision Import'
                        }
                    };

                    // For flights/transport, copy specific fields to top level for easy display
                    if (item.type === 'flight' || item.type === 'transport') {
                        newItem.flightNumber = item.details?.flightNumber || null;
                        newItem.airline = item.details?.airline || null;
                        newItem.departure = item.details?.departure || null;
                        newItem.arrival = item.details?.arrival || null;
                        newItem.seat = item.seat || item.details?.seat || null;
                        newItem.cabinClass = item.cabinClass || item.details?.cabinClass || 'Economy';
                        newItem.gate = item.gate || item.details?.gate || null;
                        newItem.baggage = item.baggage || item.details?.baggage || null;
                        newItem.passengerName = item.passengerName || item.details?.passengerName || null;
                        newItem.pnr = item.pnr || item.details?.pnr || null;
                        newItem.frequentFlyer = item.frequentFlyer || item.details?.frequentFlyer || null;
                    }

                    // For spots/activities, copy specific fields
                    if (item.type === 'spot' || item.type === 'food') {
                        newItem.duration = item.duration || item.details?.duration || null;
                        newItem.openingHours = item.openingHours || item.details?.openingHours || null;
                        newItem.admissionFee = item.admissionFee || item.details?.admissionFee || null;
                        newItem.reservationNumber = item.reservationNumber || item.details?.reservationNumber || null;
                    }

                    // For accommodation, add specific fields
                    if (item.category === 'accommodation') {
                        newItem.checkIn = item.checkIn || null;
                        newItem.checkOut = item.checkOut || null;
                        newItem.checkInTime = item.checkInTime || '15:00';
                        newItem.checkOutTime = item.checkOutTime || item.details?.checkOutTime || '11:00';
                        newItem.roomNumber = item.roomNumber || item.details?.roomNumber || null;
                        newItem.guests = item.guests || item.details?.guests || null;
                        newItem.breakfast = item.breakfast || item.details?.breakfast || null;
                        newItem.wifi = item.wifi || item.details?.wifi || null;
                        newItem.type = 'hotel';
                    }

                    batchUpdates[`itinerary.${targetDate}`] = arrayUnion(newItem);
                    newBatchIds.push({ id: newItem.id, date: targetDate, type: 'itinerary' });
                });
            } else if (importType.id === 'receipt') {
                // Determine Budget or Shopping based on keywords? Or just add to both?
                // Smart Import V1 logic added to both. V2 let's respect categorization if possible.
                // For simplified V2, add to Shopping List.
                const shoppingItems = reviewItems.map(item => ({
                    id: item.id || crypto.randomUUID(),
                    name: item.name,
                    cost: item.cost || 0,
                    currency: item.currency || 'HKD',
                    checked: false,
                    details: { receiptUrl: item.evidenceUrl, desc: 'AI Receipt Import' }
                }));
                batchUpdates['shoppingList'] = arrayUnion(...shoppingItems);
                shoppingItems.forEach(i => newBatchIds.push({ id: i.id, type: 'receipt' }));
            }

            await updateDoc(tripRef, batchUpdates);

            setImportedIds(newBatchIds);
            setResult({ success: true, message: `成功匯入 ${reviewItems.length} 個項目` });
            setStage(5);

        } catch (err) {
            console.error(err);
            setResult({ success: false, message: err.message });
            setStage(5);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndoImport = async () => {
        if (!importedIds || importedIds.length === 0) return;

        try {
            const tripRef = doc(db, "trips", selectedTripId);
            const tripSnap = await getDoc(tripRef);

            if (tripSnap.exists()) {
                const data = tripSnap.data();
                const updates = {};

                // Itinerary Undo
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

                // Receipt/Shopping Undo
                const receiptIds = new Set(importedIds.filter(item => item.type === 'receipt').map(item => item.id));
                if (receiptIds.size > 0) {
                    const currentShopping = data.shoppingList || [];
                    const newShopping = currentShopping.filter(item => !receiptIds.has(item.id));
                    if (newShopping.length !== currentShopping.length) {
                        updates['shoppingList'] = newShopping;
                    }
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(tripRef, updates);
                    setResult(prev => ({ ...prev, message: "已成功撤銷匯入！" }));
                    setImportedIds([]);
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
        setReviewItems([]);
        setImportedIds([]);
        setPlaintextInput(''); // V1.0.3: Reset plaintext input
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

    // --- RENDER ---
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`${glassCard(isDarkMode)} w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Upload className="w-6 h-6 text-indigo-400" /> 智能匯入中心
                        </h2>
                        <p className="text-sm opacity-60 mt-1">
                            {stage === 1 ? '選擇匯入類型' : stage === 2 ? '上傳檔案' : stage === 3 ? 'AI 識別中...' : stage === 4 ? '確認內容' : '匯入完成'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 opacity-70" />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {/* Scope Selection */}
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

                    {/* Stage 2: File Upload / Text Input */}
                    {stage === 2 && importType && (
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4 text-sm">
                                <importType.icon className={`w-5 h-5 text-${importType.color}-400`} />
                                <span className="font-bold">{importType.label}</span>
                                <button onClick={handleReset} className="ml-auto text-xs opacity-60 hover:opacity-100">更改類型</button>
                            </div>

                            {/* V1.0.3: Plaintext Input Mode */}
                            {importType.id === 'plaintext' ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={plaintextInput}
                                        onChange={(e) => setPlaintextInput(e.target.value)}
                                        className={`w-full h-48 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} text-sm resize-none`}
                                        placeholder={`貼上或輸入行程 (每行一個項目):

09:00 新宿站出發
10:30 淺草寺觀光
12:00 午餐: 壽司店
14:00 🚆 JR山手線 往澀谷`}
                                    />
                                    <p className="text-[10px] opacity-50">💡 提示: 支援格式 "時間 活動名稱" 或純文字。會自動識別🍴餐廳/🚆交通/⛩️景點等。</p>
                                </div>
                            ) : (

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

                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={importType.id === 'plaintext' ? !plaintextInput.trim() : files.length === 0}
                                className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${(importType.id === 'plaintext' ? plaintextInput.trim() : files.length > 0) ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-500/30 text-gray-400 cursor-not-allowed'}`}
                            >
                                {importType.id === 'plaintext' ? '解析並預覽' : '開始識別並匯入'}
                            </button>
                        </div>
                    )}

                    {/* Stage 3: Processing */}
                    {stage === 3 && (
                        <div className="p-12 text-center">
                            <Loader2 className="w-16 h-16 mx-auto animate-spin text-indigo-400 mb-6" />
                            <p className="font-bold text-lg mb-2">AI 正在分析您的圖片...</p>

                            {/* Progress Display */}
                            {progress.total > 0 && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-60">處理中: {progress.current} / {progress.total}</span>
                                        <span className="font-bold text-indigo-400">{progress.percent}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                            style={{ width: `${progress.percent}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] opacity-40">Gemini 3 Flash Vision API</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stage 4: Review */}
                    {stage === 4 && (
                        <div className="flex flex-col h-[450px]">
                            <div className="p-4 bg-indigo-500/10 border-b border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI 已識別 {reviewItems.length} 個項目</span>
                                <span>請確認內容後匯入</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Itinerary Items Section */}
                                {reviewItems.filter(i => i.category === 'itinerary' || !i.category).length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-1">
                                            📍 行程項目 ({reviewItems.filter(i => i.category === 'itinerary' || !i.category).length})
                                        </div>
                                        <div className="space-y-2">
                                            {reviewItems.filter(i => i.category === 'itinerary' || !i.category).map((item, idx) => {
                                                const realIdx = reviewItems.findIndex(r => r.id === item.id);
                                                const isTransport = item.type === 'transport' || item.type === 'flight';
                                                return (
                                                    <div key={item.id} className="bg-black/20 rounded-lg p-3 border border-indigo-500/20 flex flex-col gap-2">
                                                        <div className="flex gap-2 items-center">
                                                            {/* Time: Show start → end for transport */}
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="time"
                                                                    value={item.time || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].time = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-20 text-center"
                                                                />
                                                                {isTransport && (
                                                                    <>
                                                                        <span className="text-[10px] opacity-50">→</span>
                                                                        <input
                                                                            type="time"
                                                                            value={item.endTime || ''}
                                                                            onChange={(e) => {
                                                                                const updated = [...reviewItems];
                                                                                updated[realIdx].endTime = e.target.value;
                                                                                setReviewItems(updated);
                                                                            }}
                                                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-20 text-center"
                                                                            placeholder="到達"
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].name = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs flex-1"
                                                                placeholder="名稱"
                                                            />
                                                            <select
                                                                value={item.type}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].type = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-20"
                                                            >
                                                                <option value="spot">📍 景點</option>
                                                                <option value="food">🍴 餐廳</option>
                                                                <option value="transport">🚆 交通</option>
                                                                <option value="flight">✈️ 航班</option>
                                                            </select>
                                                            <button
                                                                onClick={() => setReviewItems(prev => prev.filter((_, i) => i !== realIdx))}
                                                                className="text-red-400 p-1 hover:bg-red-500/20 rounded"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {/* Additional info row for transport/flight */}
                                                        {isTransport && item.details && (
                                                            <div className="flex flex-wrap gap-2 text-[10px] pl-1">
                                                                {item.details.flightNumber && (
                                                                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">✈️ {item.details.flightNumber}</span>
                                                                )}
                                                                {item.details.departure && (
                                                                    <span className="bg-gray-500/20 opacity-70 px-2 py-0.5 rounded">🛫 {item.details.departure}</span>
                                                                )}
                                                                {item.details.arrival && (
                                                                    <span className="bg-gray-500/20 opacity-70 px-2 py-0.5 rounded">🛬 {item.details.arrival}</span>
                                                                )}
                                                                {item.details.date && (
                                                                    <span className="bg-gray-500/20 opacity-70 px-2 py-0.5 rounded">📅 {item.details.date}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Seat and Cabin Class for flights */}
                                                        {isTransport && (
                                                            <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                                <span className="opacity-50">💺</span>
                                                                <input
                                                                    type="text"
                                                                    value={item.seat || item.details?.seat || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].seat = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-14"
                                                                    placeholder="座位"
                                                                />
                                                                <select
                                                                    value={item.cabinClass || item.details?.cabinClass || 'Economy'}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].cabinClass = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px]"
                                                                >
                                                                    <option value="Economy">💺 經濟艙</option>
                                                                    <option value="Premium Economy">✨ 特選經濟艙</option>
                                                                    <option value="Business">👔 商務艙</option>
                                                                    <option value="First">👑 頭等艙</option>
                                                                </select>
                                                                <input
                                                                    type="text"
                                                                    value={item.gate || item.details?.gate || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].gate = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-14"
                                                                    placeholder="閘口"
                                                                />
                                                                {item.details?.price && (
                                                                    <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded">💰 {item.details.price}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Additional flight details: baggage, passenger, PNR */}
                                                        {isTransport && (
                                                            <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                                <input
                                                                    type="text"
                                                                    value={item.baggage || item.details?.baggage || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].baggage = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                    placeholder="🧳 行李 (如: 20kg+7kg)"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={item.passengerName || item.details?.passengerName || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].passengerName = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                    placeholder="👤 乘客姓名"
                                                                />
                                                            </div>
                                                        )}
                                                        {isTransport && (
                                                            <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                                <input
                                                                    type="text"
                                                                    value={item.pnr || item.details?.pnr || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].pnr = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-20"
                                                                    placeholder="PNR 訂位碼"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={item.frequentFlyer || item.details?.frequentFlyer || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].frequentFlyer = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                    placeholder="✈️ 飛行常客號碼"
                                                                />
                                                            </div>
                                                        )}
                                                        {!isTransport && item.details?.location && (
                                                            <div className="text-[10px] opacity-50 pl-1">📍 {item.details.location}</div>
                                                        )}
                                                        {/* Spot/Activity specific fields */}
                                                        {!isTransport && (
                                                            <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                                <input
                                                                    type="text"
                                                                    value={item.duration || item.details?.duration || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].duration = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-16"
                                                                    placeholder="⏱ 時長"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={item.openingHours || item.details?.openingHours || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].openingHours = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                    placeholder="🕐 營業時間 (如: 09:00-18:00)"
                                                                />
                                                            </div>
                                                        )}
                                                        {!isTransport && (
                                                            <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                                <input
                                                                    type="text"
                                                                    value={item.admissionFee || item.details?.admissionFee || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].admissionFee = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                    placeholder="🎫 入場費 (如: JPY 500)"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={item.reservationNumber || item.details?.reservationNumber || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].reservationNumber = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                    placeholder="📋 預約確認號碼"
                                                                />
                                                            </div>
                                                        )}
                                                        {/* Booking Link Input */}
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <span className="opacity-50">🔗</span>
                                                            <input
                                                                type="url"
                                                                value={item.bookingUrl || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].bookingUrl = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                placeholder="加入預訂連結 (Trip.com / Agoda / Booking...)"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Accommodation Section */}
                                {reviewItems.filter(i => i.category === 'accommodation').length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                                            🏨 住宿資訊 ({reviewItems.filter(i => i.category === 'accommodation').length})
                                        </div>
                                        <div className="space-y-2">
                                            {reviewItems.filter(i => i.category === 'accommodation').map((item) => {
                                                const realIdx = reviewItems.findIndex(r => r.id === item.id);
                                                return (
                                                    <div key={item.id} className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/20 flex flex-col gap-2">
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-amber-400 text-sm">🏨</span>
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].name = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs flex-1"
                                                                placeholder="酒店名稱"
                                                            />
                                                            <button
                                                                onClick={() => setReviewItems(prev => prev.filter((_, i) => i !== realIdx))}
                                                                className="text-red-400 p-1 hover:bg-red-500/20 rounded"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {/* Dates and Check-in Time Row */}
                                                        <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                            {item.checkIn && <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded">📅 入住: {item.checkIn}</span>}
                                                            {item.checkOut && <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded">📅 退房: {item.checkOut}</span>}
                                                            <div className="flex items-center gap-1 bg-amber-500/20 rounded px-2 py-0.5">
                                                                <span className="text-amber-300">🕐 幾點入住:</span>
                                                                <input
                                                                    type="time"
                                                                    value={item.checkInTime || '15:00'}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].checkInTime = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-transparent border-none text-amber-300 text-[10px] w-14 px-0"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Details Row */}
                                                        <div className="flex flex-wrap gap-2 text-[10px]">
                                                            {item.details?.location && <span className="bg-gray-500/20 opacity-70 px-2 py-0.5 rounded">📍 {item.details.location}</span>}
                                                            {item.details?.address && <span className="bg-gray-500/20 opacity-70 px-2 py-0.5 rounded">🏠 {item.details.address}</span>}
                                                            {item.details?.roomType && <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">🛏️ {item.details.roomType}</span>}
                                                            {item.details?.price && <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded">💰 {item.details.price}</span>}
                                                            {item.details?.phone && <span className="bg-gray-500/20 opacity-70 px-2 py-0.5 rounded">📞 {item.details.phone}</span>}
                                                            {item.details?.confirmationNumber && <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">🔖 {item.details.confirmationNumber}</span>}
                                                        </div>
                                                        {/* Additional Accommodation Fields */}
                                                        <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                            <input
                                                                type="text"
                                                                value={item.roomNumber || item.details?.roomNumber || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].roomNumber = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-16"
                                                                placeholder="🚪 房號"
                                                            />
                                                            <div className="flex items-center gap-1 bg-red-500/20 rounded px-2 py-0.5">
                                                                <span className="text-red-300">🕐 退房:</span>
                                                                <input
                                                                    type="time"
                                                                    value={item.checkOutTime || item.details?.checkOutTime || '11:00'}
                                                                    onChange={(e) => {
                                                                        const updated = [...reviewItems];
                                                                        updated[realIdx].checkOutTime = e.target.value;
                                                                        setReviewItems(updated);
                                                                    }}
                                                                    className="bg-transparent border-none text-red-300 text-[10px] w-14 px-0"
                                                                />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={item.guests || item.details?.guests || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].guests = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                placeholder="👥 人數 (如: 2大1小)"
                                                            />
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                                            <input
                                                                type="text"
                                                                value={item.breakfast || item.details?.breakfast || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].breakfast = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                placeholder="🍳 早餐 (如: 包含 7F餐廳)"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.wifi || item.details?.wifi || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].wifi = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                placeholder="📶 WiFi密碼"
                                                            />
                                                        </div>
                                                        {/* Notes Row */}
                                                        {item.details?.notes && (
                                                            <div className="text-[10px] opacity-50 pl-1 italic">💬 {item.details.notes}</div>
                                                        )}
                                                        {/* Booking Link Input */}
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <span className="opacity-50">🔗</span>
                                                            <input
                                                                type="url"
                                                                value={item.bookingUrl || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...reviewItems];
                                                                    updated[realIdx].bookingUrl = e.target.value;
                                                                    setReviewItems(updated);
                                                                }}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] flex-1"
                                                                placeholder="加入預訂連結 (Trip.com / Agoda / Booking...)"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {reviewItems.length === 0 && (
                                    <div className="text-center py-8 opacity-50">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                                        <p className="text-sm">未能識別任何有效項目</p>
                                        <p className="text-xs">請嘗試更清晰的圖片</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-white/10 flex gap-2">
                                <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-gray-500/20 text-xs font-bold">放棄</button>
                                <button
                                    onClick={handleConfirmImport}
                                    disabled={reviewItems.length === 0}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-2 ${reviewItems.length === 0 ? 'bg-gray-500/30 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    <Check className="w-4 h-4" /> 確認並匯入
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 5: Result (Success/Fail) */}
                    {stage === 5 && result && (
                        <div className="p-6 text-center">
                            {result.success ? (
                                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                            ) : (
                                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                            )}
                            <h3 className="text-xl font-bold mb-2">{result.success ? '匯入完成' : '匯入失敗'}</h3>
                            <p className="text-sm opacity-60 mb-6">{result.message}</p>

                            <div className="flex gap-2">
                                {importedIds.length > 0 && (
                                    <button onClick={handleUndoImport} className="flex-1 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm">撤銷</button>
                                )}
                                <button onClick={handleClose} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">完成</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
