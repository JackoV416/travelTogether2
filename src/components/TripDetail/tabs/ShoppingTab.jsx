import React, { useState, useRef } from 'react';
import { List, CheckSquare, FileUp, Upload, Loader2, Trash2, Sparkles, Plus, ShoppingBag, Receipt, Tag, Users } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { Search } from 'lucide-react';
import { convertCurrency } from '../../../services/exchangeRate';
import { useTranslation } from 'react-i18next';

import { getLocalizedContent } from '../../../utils/tripHelpers';

const ShoppingTab = ({
    trip,
    user,
    isDarkMode,
    onOpenSectionModal,
    onOpenAIModal,
    onAddItem,
    handleReceiptUpload,
    receiptPreview,
    glassCard,
    onOpenSmartImport,
    onOpenSmartExport,
    exchangeRates,
    currentLang, // Received from parent
    readOnly = false // V1.9.8 Public View Support
}) => {
    // ... items.filter(item => !searchValue || getLocalizedContent(item.name, currentLang).toLowerCase().includes(searchValue.toLowerCase()));
    const { t, i18n } = useTranslation();
    const isZh = i18n.language.includes('zh');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [searchValue, setSearchValue] = useState("");

    const members = trip.members || [];
    // Default to current user's list if possible, else All
    const [activeMemberId, setActiveMemberId] = useState(user?.uid);
    // Fallback logic
    React.useEffect(() => {
        if (!activeMemberId && user?.uid) setActiveMemberId(user.uid);
    }, [user, activeMemberId]);

    // Helpers to filter by activeMember
    const matchesUser = (item) => {
        const owner = item.ownerId || item.payer || item.createdBy?.id; // Shopping items might have ownerId, bought items have payer
        if (activeMemberId === 'all') return true;
        // For bought items, payer might be name string "Use name" or ID. 
        // If it's a name, we try to match member name.
        if (members.some(m => m.id === owner)) return owner === activeMemberId;
        // If payer is a name string like "Alex"
        const member = members.find(m => m.id === activeMemberId);
        if (member && owner === member.name) return true;

        return (!owner && activeMemberId === 'all');
    };

    const filteredShopping = (trip.shoppingList || [])
        .filter(item => matchesUser(item))
        .filter(item =>
            !searchValue || getLocalizedContent(item.name, currentLang).toLowerCase().includes(searchValue.toLowerCase())
        );

    const filteredBought = (trip.budget || [])
        .filter(item => item.category === 'shopping')
        .filter(item => matchesUser(item))
        .filter(item =>
            (!searchValue || (getLocalizedContent(item.name, currentLang) || item.desc || "").toLowerCase().includes(searchValue.toLowerCase()))
        );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* ... (Member Filter Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveMemberId('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border ${activeMemberId === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/5 border-white/10 hover:bg-white/10 dark:bg-black/30 dark:border-white/5 dark:hover:bg-white/10'}`}
                >
                    <Users className="w-4 h-4" /> {t('common.all_members')}
                </button>
                {members.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveMemberId(m.id)}
                        className={`flex items-center gap-2 px-1 py-1 pr-3 rounded-full font-bold transition-all whitespace-nowrap border ${activeMemberId === m.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/5 border-white/10 hover:bg-white/10 dark:bg-black/30 dark:border-white/5 dark:hover:bg-white/10'}`}
                    >
                        <img src={m.photoURL || m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-6 h-6 rounded-full" alt={m.name} />
                        <span className="text-xs">{isZh && m.name_zh ? m.name_zh : m.name}</span>
                    </button>
                ))}
            </div>

            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder={t('trip.shopping.search_placeholder', { name: activeMemberId === 'all' ? t('common.all_members') : (isZh && members.find(m => m.id === activeMemberId)?.name_zh ? members.find(m => m.id === activeMemberId).name_zh : members.find(m => m.id === activeMemberId)?.name || '') })}
                isDarkMode={isDarkMode}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expected to Buy Section */}
                <div className={`${glassCard(isDarkMode)} border-t-4 border-t-purple-500 overflow-hidden`}>
                    <div className="p-6">
                        {/* ... */}
                        <div className="space-y-3 min-h-[100px]">
                            {/* ... EmptyState ... */}
                            {filteredShopping.filter(i => !i.bought).map((item, i) => (
                                <div key={i} className="group p-4 rounded-xl flex justify-between items-center transition-all border bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md dark:bg-white/[0.03] dark:border-white/5 dark:hover:bg-white/[0.06] dark:hover:border-white/10">
                                    <div className="flex items-center gap-4">
                                        {/* ... Image ... */}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{getLocalizedContent(item.name, currentLang)}</span>
                                            {item.desc && <span className="text-[10px] opacity-50 line-clamp-1">{getLocalizedContent(item.desc, currentLang)}</span>}
                                            {item.note && <span className="text-[10px] opacity-50 line-clamp-1 italic">{getLocalizedContent(item.note, currentLang)}</span>}
                                            {/* Show Owner Tag if 'All' */}
                                            {activeMemberId === 'all' && (item.ownerId || item.createdBy?.id) && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Users className="w-2 h-2 opacity-50" />
                                                    <span className="text-[9px] opacity-50">{isZh && members.find(m => m.id === (item.ownerId || item.createdBy?.id))?.name_zh ? members.find(m => m.id === (item.ownerId || item.createdBy?.id)).name_zh : (members.find(m => m.id === (item.ownerId || item.createdBy?.id))?.name || 'User')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-xs font-black text-purple-400">{item.estPrice}</span>
                                        {/* ... */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Already Bought Section */}
                <div className={`${glassCard(isDarkMode)} border-t-4 border-t-emerald-500 overflow-hidden`}>
                    <div className="p-6">
                        {/* ... */}
                        <div className="space-y-3 min-h-[100px]">
                            {/* ... EmptyState ... */}
                            {filteredBought.map((item, i) => (
                                <div key={i} className="p-4 rounded-xl flex justify-between items-center transition-all border bg-emerald-50/50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20">
                                    <div className="flex items-center gap-4">
                                        {/* ... Receipt Image ... */}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{getLocalizedContent(item.name, currentLang) || item.desc}</span>
                                            <span className="text-[10px] opacity-50 font-medium">{t('trip.shopping.payer_label', { name: item.payer === 'Me' ? t('trip.shopping.payer_self') : item.payer })}</span>
                                        </div>
                                    </div>
                                    {/* ... Cost ... */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Preview Area - Only shown when uploading/previewing */}
            {receiptPreview?.shopping && (
                <div className={`${glassCard(isDarkMode)} p-6 border-2 border-dashed border-indigo-500/30 animate-pulse-subtle`}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                            <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400">{t('trip.shopping.processing_receipt')}</h4>
                        </div>
                    </div>
                    <div className="relative group max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                        <img src={receiptPreview.shopping} alt="receipt preview" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingTab;
