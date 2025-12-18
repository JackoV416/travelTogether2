import React, { useState, useRef } from 'react';
import { List, CheckSquare, FileUp, Upload, Loader2, Trash2, Sparkles, Plus } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';

const ShoppingTab = ({
    trip,
    isDarkMode,
    onOpenSectionModal,
    onOpenAIModal,
    onAddItem,
    handleReceiptUpload,
    receiptPreview,
    glassCard,
    onOpenSmartImport
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [searchValue, setSearchValue] = useState("");

    const filteredShopping = (trip.shoppingList || []).filter(item =>
        !searchValue || item.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Bought items are in trip.budget with category='shopping'
    const filteredBought = (trip.budget || []).filter(item =>
        item.category === 'shopping' &&
        (!searchValue || (item.name || item.desc || "").toLowerCase().includes(searchValue.toLowerCase()))
    );



    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleReceiptUpload('shopping', e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleReceiptUpload('shopping', e.target.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋商品..."
                isDarkMode={isDarkMode}
            />
            <div className="flex justify-end gap-2">
                <button onClick={() => onOpenSmartImport ? onOpenSmartImport() : onOpenSectionModal('import', 'shopping')} className={`px-3 py-1 rounded-lg border text-xs ${isDarkMode ? 'border-white/30 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-100'}`}>匯入</button>
                <button onClick={() => onOpenSectionModal('export', 'shopping')} className={`px-3 py-1 rounded-lg border text-xs ${isDarkMode ? 'border-white/30 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-100'}`}>匯出</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold flex gap-2"><List className="w-5 h-5" /> 預計購買</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onOpenAIModal('shopping')}
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                            >
                                <Sparkles className="w-3 h-3" />
                                AI 助手
                            </button>
                            <button onClick={() => onAddItem('shopping_plan')} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 transition-colors">+ 新增</button>
                        </div>
                    </div>


                    {filteredShopping.filter(i => !i.bought).length === 0 && (
                        <p className="text-sm opacity-50 text-center py-4">暫無符合的預計購買項目</p>
                    )}
                    {filteredShopping.filter(i => !i.bought).map((item, i) => (
                        <div key={i} className={`p-3 rounded-lg mb-2 flex justify-between ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} `}>
                            <span>{item.name}</span>
                            <span className="opacity-50 text-xs">預估: {item.estPrice}</span>
                        </div>
                    ))}
                </div>
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold flex gap-2"><CheckSquare className="w-5 h-5" /> 已購入</h3>
                        <button onClick={() => onAddItem('shopping')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">+ 記帳</button>
                    </div>
                    {filteredBought.length === 0 && (
                        <p className="text-sm opacity-50 text-center py-4">暫無符合的已購入項目</p>
                    )}
                    {filteredBought.map((item, i) => (
                        <div key={i} className={`p-3 rounded-lg mb-2 flex justify-between ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'} `}>
                            <span>{item.name || item.desc}</span>
                            <span className="font-mono text-green-500">{item.currency} {item.cost}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Receipt Upload - FilesTab Style */}
            <div
                className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 ${dragActive
                    ? 'border-pink-500 bg-pink-500/10'
                    : isDarkMode
                        ? 'border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10'
                        : 'border-pink-400/30 bg-pink-50 hover:bg-pink-100'
                    }`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <div className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-500'}`}>
                    <FileUp className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>單據掃描 / 上傳</h3>
                    <p className="text-sm opacity-60">點擊或拖拉單據至此上傳</p>
                </div>
                <button className="px-5 py-2 rounded-full bg-pink-500 text-white text-sm font-bold shadow-lg hover:shadow-pink-500/30 hover:bg-pink-600 transition-all">
                    選擇檔案
                </button>
                <p className="text-[10px] opacity-40">限制：JPG/PNG，建議 2MB 內</p>
                {uploading && <div className="flex items-center gap-2 text-pink-500"><Loader2 className="animate-spin w-4 h-4" /> 上傳中...</div>}
            </div>

            {/* Receipt Preview */}
            {receiptPreview?.shopping && (
                <div className={glassCard(isDarkMode) + " p-4"}>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm opacity-70">已上傳單據</h4>
                    </div>
                    <img src={receiptPreview.shopping} alt="receipt" className="max-h-64 rounded-xl border border-white/10 object-contain mx-auto" />
                </div>
            )}
        </div>
    );
};

export default ShoppingTab;
