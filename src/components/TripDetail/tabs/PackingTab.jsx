import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Sparkles, ChevronDown, ChevronRight, PackageCheck } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';

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
    // packingList structure: [{ id, name, category, checked, aiSuggested }]
    const packingList = trip.packingList || [];

    const categories = [
        { id: 'clothes', label: '衣物鞋履' },
        { id: 'toiletries', label: '個人護理' },
        { id: 'electronics', label: '電子產品' },
        { id: 'documents', label: '證件/文件' },
        { id: 'medicine', label: '藥品/急救' },
        { id: 'misc', label: '其他雜項' }
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
        <div className="space-y-6 animate-fade-in">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋行李項目..."
                isDarkMode={isDarkMode}
            />
            {/* Header / Progress */}
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
                <div className="flex-1 w-full">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                        <PackageCheck className="w-5 h-5 text-indigo-500" /> 行李準備進度
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${getProgress()}%` }}></div>
                    </div>
                    <div className="text-right text-xs opacity-60 mt-1">{getProgress()}% 完成</div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={onGenerateList}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95 text-sm font-bold"
                    >
                        <Sparkles className="w-4 h-4" /> AI 生成
                    </button>
                    <button
                        onClick={onClearList}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10`}
                        title="清空所有項目"
                    >
                        <Trash2 className="w-4 h-4" /> 清空
                    </button>
                    <button
                        onClick={() => onAddItem()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        <Plus className="w-4 h-4" /> 新增
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => {
                    const items = packingList.filter(i => i.category === cat.id && (i.name || "").toLowerCase().includes(searchValue.toLowerCase()));
                    const isExpanded = expandedCats.includes(cat.id);

                    return (
                        <div key={cat.id} className={`${glassCard(isDarkMode)} overflow-hidden`}>
                            <div
                                onClick={() => toggleCat(cat.id)}
                                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                            >
                                <h4 className="font-bold flex items-center gap-2">
                                    {isExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                                    {cat.label}
                                    <span className="text-xs opacity-50 font-normal bg-gray-500/10 px-2 py-0.5 rounded-full">{items.length}</span>
                                </h4>
                            </div>

                            {isExpanded && (
                                <div className="p-2 space-y-1">
                                    {items.length === 0 && <p className="text-xs opacity-40 text-center py-4">暫無項目</p>}
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`group flex items-center justify-between p-2 rounded-lg transition-all ${item.checked ? 'opacity-50' : ''} ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <button
                                                    onClick={() => onToggleItem(item.id)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-400 hover:border-indigo-500'}`}
                                                >
                                                    {item.checked && <CheckSquare className="w-3.5 h-3.5" />}
                                                </button>
                                                <span className={`${item.checked ? 'line-through decoration-2 decoration-indigo-500/50' : ''} transition-all`}>{item.name}</span>
                                                {item.aiSuggested && <Sparkles className="w-3 h-3 text-purple-400 opacity-70" title="AI 建議" />}
                                            </div>
                                            <button
                                                onClick={() => onDeleteItem(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
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
