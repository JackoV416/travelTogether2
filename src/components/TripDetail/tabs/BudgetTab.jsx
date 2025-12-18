import React, { useState, useRef } from 'react';
import { RefreshCw, List, FileUp, Loader2 } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';

const BudgetTab = ({
    trip,
    isDarkMode,
    debtInfo,
    onOpenSectionModal,
    onExportPdf,
    handleReceiptUpload,
    glassCard,
    onOpenSmartImport
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [searchValue, setSearchValue] = useState("");
    const [activeFilters, setActiveFilters] = useState({ category: 'all' });

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleReceiptUpload('budget', e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleReceiptUpload('budget', e.target.files[0]);
        }
    };

    const filters = [{
        key: 'category',
        label: '類別',
        options: [
            { value: 'food', label: '餐飲' },
            { value: 'transport', label: '交通' },
            { value: 'shopping', label: '購物' },
            { value: 'hotel', label: '住宿' },
            { value: 'flight', label: '機票' },
            { value: 'spot', label: '門票/景點' }
        ]
    }];

    const filteredBudget = (trip.budget || []).filter(item => {
        const matchesSearch = !searchValue ||
            (item.name || item.desc || "").toLowerCase().includes(searchValue.toLowerCase()) ||
            (item.payer || "").toLowerCase().includes(searchValue.toLowerCase());

        const matchesFilter = activeFilters.category === 'all' || item.category === activeFilters.category;
        return matchesSearch && matchesFilter;
    });
    return (
        <div className="space-y-6 animate-fade-in">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋支出、付款人..."
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={(key, val) => setActiveFilters(prev => ({ ...prev, [key]: val }))}
                onClearFilters={() => { setSearchValue(""); setActiveFilters({ category: 'all' }); }}
                isDarkMode={isDarkMode}
            />
            <div className="flex justify-end gap-2">
                <button onClick={() => { }} className="px-3 py-1 rounded-lg border border-white/30 text-xs opacity-50 cursor-not-allowed" title="匯入 - V0.22 開放">匯入 🚧</button>
                <button onClick={() => { }} className="px-3 py-1 rounded-lg border border-white/30 text-xs opacity-50 cursor-not-allowed" title="匯出 - V0.22 開放">匯出 🚧</button>
                <button onClick={() => { }} className="px-3 py-1 rounded-lg border border-indigo-400/50 text-xs text-indigo-200/50 opacity-50 cursor-not-allowed" title="匯出 PDF - V0.22 開放">匯出 PDF 🚧</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={glassCard(isDarkMode) + " p-6 text-center"}>
                    <div className="text-sm opacity-60 uppercase mb-1">總支出</div>
                    <div className="text-3xl font-bold font-mono text-indigo-500">${Math.round(debtInfo.totalSpent).toLocaleString()}</div>
                </div>
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <h3 className="font-bold mb-2 flex gap-2"><RefreshCw className="w-4 h-4" /> 債務結算</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(debtInfo.balances).map(([name, bal]) => (
                            <div key={name} className="flex justify-between border-b pb-1">
                                <span>{name}</span>
                                <span className={bal > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {bal > 0 ? `應收 $${Math.round(bal)}` : `應付 $${Math.round(Math.abs(bal))}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={glassCard(isDarkMode) + " p-6"}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex gap-2"><List className="w-4 h-4" /> 支出明細</h3>
                </div>



                <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {filteredBudget.map((b, i) => (
                        <div key={i} className={`flex justify-between p-3 rounded-lg text-sm border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                            <div>
                                <div className="font-bold">{b.name || b.desc}</div>
                                <div className="text-xs opacity-60">{b.payer} • {b.category || '未分類'}</div>
                            </div>
                            <span className="font-mono opacity-80">{b.currency} {b.cost}</span>
                        </div>
                    ))}
                    {filteredBudget.length === 0 && <p className="text-center text-sm opacity-50 py-4">沒有符合的支出記錄</p>}
                </div>
            </div>

            {/* Receipt Upload - Drag & Drop Style */}
            <div
                className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 ${dragActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : isDarkMode
                        ? 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10'
                        : 'border-indigo-400/30 bg-indigo-50 hover:bg-indigo-100'
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
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <div className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-500'}`}>
                    <FileUp className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>單據掃描 / 上傳</h3>
                    <p className="text-sm opacity-60">點擊或拖拉單據至此上傳</p>
                </div>
                <button className="px-5 py-2 rounded-full bg-indigo-500 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-600 transition-all">
                    選擇檔案
                </button>
                <p className="text-[10px] opacity-40">支援圖片/PDF</p>
                {uploading && <div className="flex items-center gap-2 text-indigo-500"><Loader2 className="animate-spin w-4 h-4" /> 上傳中...</div>}
            </div>
        </div>
    );
};

export default BudgetTab;
