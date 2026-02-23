import React, { useState, useMemo } from 'react';
import {
    CheckSquare, Plus, Trash2, Sparkles, ChevronDown, ChevronRight, PackageCheck,
    Shirt, Bath, Smartphone, Clipboard, Pill, Box, AlertCircle, Users
} from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '../../../utils/tripHelpers';

const CATEGORY_ICONS = {
    clothing: Shirt,
    toiletries: Bath,
    electronics: Smartphone,
    documents: Clipboard,
    medicine: Pill,
    misc: Box
};

const PackingTab = ({
    trip,
    user,
    isDarkMode,
    onAddItem,
    onToggleItem,
    onDeleteItem,
    onGenerateList,
    onClearList,
    glassCard,
    currentLang,
    readOnly = false
}) => {
    const { t, i18n } = useTranslation();
    const packingList = trip.packingList || [];
    const isZh = i18n.language.includes('zh');
    const members = trip.members || [];

    const [activeMemberId, setActiveMemberId] = useState(user?.uid);
    const [searchValue, setSearchValue] = useState('');
    const [expandedCats, setExpandedCats] = useState([]);

    // Category definitions
    const categories = useMemo(() => [
        { id: 'clothing', label: t('trip.packing.categories.clothing', '衣物'), icon: Shirt },
        { id: 'toiletries', label: t('trip.packing.categories.toiletries', '洗漱用品'), icon: Bath },
        { id: 'electronics', label: t('trip.packing.categories.electronics', '電子產品'), icon: Smartphone },
        { id: 'documents', label: t('trip.packing.categories.documents', '證件文件'), icon: Clipboard },
        { id: 'medicine', label: t('trip.packing.categories.medicine', '藥物'), icon: Pill },
        { id: 'misc', label: t('trip.packing.categories.misc', '其他'), icon: Box }
    ], [t]);

    // Auto-expand all categories on first render
    useState(() => {
        if (expandedCats.length === 0 && packingList.length > 0) {
            setExpandedCats(categories.map(c => c.id));
        }
    });

    // Filter items by active member
    const currentList = useMemo(() => {
        if (activeMemberId === 'all') return packingList;
        return packingList.filter(item =>
            !item.assignee || item.assignee === activeMemberId
        );
    }, [packingList, activeMemberId]);

    // Progress calculation
    const totalItems = currentList.length;
    const checkedItems = currentList.filter(i => i.checked).length;
    const progressPct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    const toggleCat = (catId) => {
        setExpandedCats(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10" data-tour="packing-content">
            {/* Member Filter Tabs */}
            {members.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveMemberId('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeMemberId === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : `${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                    >
                        <Users className="w-3.5 h-3.5 inline mr-1.5" />{t('common.all_members', '所有成員')}
                    </button>
                    {members.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveMemberId(m.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeMemberId === m.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : `${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}`}
                        >
                            {isZh && m.name_zh ? m.name_zh : m.name}
                        </button>
                    ))}
                </div>
            )}

            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder={t('trip.packing.search_placeholder', { name: activeMemberId === 'all' ? t('common.all_members') : (isZh && members.find(m => m.id === activeMemberId)?.name_zh ? members.find(m => m.id === activeMemberId).name_zh : members.find(m => m.id === activeMemberId)?.name || '') })}
                isDarkMode={isDarkMode}
            />

            {/* Progress Bar */}
            {totalItems > 0 && (
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <PackageCheck className={`w-4 h-4 ${progressPct === 100 ? 'text-emerald-500' : 'text-indigo-500'}`} />
                            <span className="text-sm font-bold">{checkedItems}/{totalItems}</span>
                        </div>
                        <span className={`text-xs font-bold ${progressPct === 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>{progressPct}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!readOnly && (
                <div className="flex gap-2 flex-wrap">
                    {onGenerateList && (
                        <button
                            onClick={onGenerateList}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                        >
                            <Sparkles className="w-4 h-4" />
                            {t('trip.packing.ai_suggest', 'AI 建議')}
                        </button>
                    )}
                    {onClearList && totalItems > 0 && (
                        <button
                            onClick={onClearList}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('trip.packing.clear_list', '清空')}
                        </button>
                    )}
                </div>
            )}

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => {
                    const CatIcon = cat.icon;
                    const items = currentList.filter(i => i.category === cat.id && (getLocalizedContent(i.name, currentLang).toLowerCase().includes(searchValue.toLowerCase())));
                    const isExpanded = expandedCats.includes(cat.id);
                    const completedInCat = items.filter(i => i.checked).length;

                    if (items.length === 0 && searchValue) return null;

                    return (
                        <div key={cat.id} className={`${glassCard(isDarkMode)} overflow-hidden group/cat transition-all duration-300 ${items.length > 0 && completedInCat === items.length ? 'opacity-80' : ''}`}>
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCat(cat.id)}
                                className={`w-full flex items-center justify-between p-4 transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <CatIcon className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">{cat.label}</span>
                                    <span className="text-xs opacity-50">({completedInCat}/{items.length})</span>
                                </div>
                                {isExpanded ? <ChevronDown className="w-4 h-4 opacity-40" /> : <ChevronRight className="w-4 h-4 opacity-40" />}
                            </button>

                            {isExpanded && (
                                <div className="p-3 space-y-1.5 min-h-[60px]">
                                    {items.length === 0 && (
                                        <EmptyState
                                            icon={CatIcon}
                                            message={t('trip.packing.empty_category', '此類別暫無物品')}
                                            isDarkMode={isDarkMode}
                                            compact
                                        />
                                    )}
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`group/item flex items-center justify-between p-3 rounded-xl transition-all border border-transparent ${item.checked ? 'bg-indigo-500/5' : 'hover:bg-gray-50 hover:border-gray-100 dark:hover:bg-white/5 dark:hover:border-white/5'}`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <button
                                                    onClick={() => !readOnly && onToggleItem?.(item.id)}
                                                    disabled={readOnly}
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.checked ? 'bg-indigo-500 text-white' : `border-2 ${isDarkMode ? 'border-gray-600 hover:border-indigo-500' : 'border-gray-300 hover:border-indigo-500'}`}`}
                                                >
                                                    {item.checked && <CheckSquare className="w-4 h-4" />}
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${item.checked ? 'line-through opacity-40 text-gray-400' : ''}`}>
                                                        {getLocalizedContent(item.name, currentLang)}
                                                    </span>
                                                    {item.quantity && item.quantity > 1 && (
                                                        <span className="text-xs opacity-50">x{item.quantity}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {!readOnly && (
                                                <button
                                                    onClick={() => onDeleteItem?.(item.id)}
                                                    className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!readOnly && (
                                        <button
                                            onClick={() => onAddItem?.(cat.id)}
                                            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all ${isDarkMode ? 'border-gray-700 hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400' : 'border-gray-200 hover:border-indigo-300 text-gray-400 hover:text-indigo-500'}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="text-sm font-bold">{t('trip.packing.add_item', '新增物品')}</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State - No items at all */}
            {totalItems === 0 && (
                <EmptyState
                    icon={PackageCheck}
                    message={t('trip.packing.empty', '行李清單空空如也')}
                    description={t('trip.packing.empty_desc', '用 AI 建議快速生成智能打包清單')}
                    isDarkMode={isDarkMode}
                    action={!readOnly && onGenerateList ? {
                        label: t('trip.packing.ai_suggest', 'AI 建議'),
                        onClick: onGenerateList,
                        icon: Sparkles
                    } : undefined}
                />
            )}
        </div>
    );
};

export default PackingTab;
