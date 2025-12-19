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
    onOpenSmartImport,
    onOpenSmartExport
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
                {/* Unified Import/Export is now in Header */}
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
                            <div className="flex items-center gap-2">
                                {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover border border-white/10" />}
                                <span>{item.name}</span>
                            </div>
                            <span className="opacity-50 text-xs flex flex-col items-end">
                                <span>預估: {item.estPrice}</span>
                                {item.details?.receiptUrl && <span className="text-[9px] text-green-400 flex items-center gap-1"><CheckSquare className="w-3 h-3" /> 有單據</span>}
                            </span>
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
                        <div key={i} className={`p-3 rounded-lg mb-2 flex justify-between items-center ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'} `}>
                            <div className="flex items-center gap-2">
                                {item.details?.receiptUrl && (
                                    <a href={item.details.receiptUrl} target="_blank" rel="noopener noreferrer" className="block w-8 h-8 rounded overflow-hidden border border-white/20 hover:scale-105 transition-transform">
                                        <img src={item.details.receiptUrl} alt="receipt" className="w-full h-full object-cover" />
                                    </a>
                                )}
                                <span>{item.name || item.desc}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-green-500 block">{item.currency} {item.cost}</span>
                                <span className="text-[10px] opacity-50">
                                    {item.payer === 'Me' ? '我支付' : item.payer}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
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
