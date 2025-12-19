import React, { useState } from 'react';
import {
    CheckSquare, Plus, Trash2, Sparkles, ChevronDown, ChevronRight, PackageCheck,
    Shirt, Bath, Smartphone, Clipboard, Pill, Box, AlertCircle
} from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { Search } from 'lucide-react';

const PackingTab = ({
    trip,
    isDarkMode,
    onAddItem,
    onToggleItem,
    onDeleteItem,
    onGenerateList,
    onClearList,
    glassCard
}) => {
    const packingList = trip.packingList || [];

    const categories = [
        { id: 'clothes', label: '衣物鞋履', icon: <Shirt className="w-4 h-4 text-orange-400" /> },
        { id: 'toiletries', label: '個人護理', icon: <Bath className="w-4 h-4 text-blue-400" /> },
        { id: 'electronics', label: '電子產品', icon: <Smartphone className="w-4 h-4 text-purple-400" /> },
        { id: 'documents', label: '證件/文件', icon: <Clipboard className="w-4 h-4 text-emerald-400" /> },
        { id: 'medicine', label: '藥品/急救', icon: <Pill className="w-4 h-4 text-red-500" /> },
        { id: 'misc', label: '其他雜項', icon: <Box className="w-4 h-4 text-gray-400" /> }
    ];

    const [expandedCats, setExpandedCats] = useState(categories.map(c => c.id));
    const [searchValue, setSearchValue] = useState("");

    const toggleCat = (id) => {
        setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const getProgress = () => {
        if (packingList.length === 0) return 0;
        const checked = packingList.filter(i => i.checked).length;
        return Math.round((checked / packingList.length) * 100);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋行李項目..."
                isDarkMode={isDarkMode}
            />
            {/* Header / Progress */}
            <div className={`${glassCard(isDarkMode)} p-6 border-l-4 border-l-indigo-500`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <PackageCheck className="w-6 h-6 text-indigo-500" /> 行李準備進度
                            </h3>
                            <span className="text-sm font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">{getProgress()}%</span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                style={{ width: `${getProgress()}%` }}
                            >
                                <div className="absolute inset-0 w-full h-full animate-shimmer scale-[2] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                            onClick={onGenerateList}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl shadow-xl hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 active:scale-95 text-xs font-black uppercase tracking-wider"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> AI 推理清單
                        </button>
                        <button
                            onClick={() => onAddItem('packing')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'}`}
                        >
                            <Plus className="w-3.5 h-3.5" /> 手動新增
                        </button>
                        <button
                            onClick={onClearList}
                            className="p-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                            title="清空所有項目"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => {
                    const items = packingList.filter(i => i.category === cat.id && (i.name || "").toLowerCase().includes(searchValue.toLowerCase()));
                    const isExpanded = expandedCats.includes(cat.id);
                    const completedInCat = items.filter(i => i.checked).length;

                    return (
                        <div key={cat.id} className={`${glassCard(isDarkMode)} overflow-hidden group/cat transition-all duration-300 ${items.length > 0 && completedInCat === items.length ? 'opacity-80' : ''}`}>
                            <div
                                onClick={() => toggleCat(cat.id)}
                                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isDarkMode ? 'bg-white/[0.02] hover:bg-white/5' : 'bg-gray-50/50 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className="font-black text-sm tracking-tight flex items-center gap-2">
                                        {cat.label}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${completedInCat === items.length && items.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                            {completedInCat}/{items.length}
                                        </span>
                                    </h4>
                                </div>
                                {isExpanded ? <ChevronDown className="w-4 h-4 opacity-30" /> : <ChevronRight className="w-4 h-4 opacity-30" />}
                            </div>

                            {isExpanded && (
                                <div className="p-3 space-y-1.5 min-h-[60px]">
                                    {items.length === 0 && (
                                        <EmptyState
                                            icon={searchValue ? Search : AlertCircle}
                                            mini={true}
                                            title={searchValue ? "找不到項目" : "無內容"}
                                            description={searchValue ? "嘗試換個關鍵字搜尋。" : "尚未加入任何行李項目。"}
                                            isDarkMode={isDarkMode}
                                            action={!searchValue ? {
                                                label: "新增",
                                                onClick: () => onAddItem('packing'),
                                                icon: Plus
                                            } : null}
                                        />
                                    )}
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`group/item flex items-center justify-between p-3 rounded-xl transition-all border border-transparent ${item.checked ? 'bg-indigo-500/5' : isDarkMode ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-gray-50 hover:border-gray-100'}`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <button
                                                    onClick={() => onToggleItem(item.id)}
                                                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all transform active:scale-90 ${item.checked ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'border-gray-500/30 hover:border-indigo-500'}`}
                                                >
                                                    {item.checked && <PackageCheck className="w-3.5 h-3.5" />}
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${item.checked ? 'line-through opacity-40 text-gray-400' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.aiSuggested && (
                                                        <span className="text-[8px] text-purple-400 font-black uppercase tracking-tighter flex items-center gap-0.5">
                                                            <Sparkles className="w-2 h-2" /> AI Suggested
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onDeleteItem(item.id)}
                                                className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all transform hover:rotate-12"
                                                title="刪除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PackingTab;
