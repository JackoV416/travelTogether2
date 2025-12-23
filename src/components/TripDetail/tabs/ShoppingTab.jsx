import React, { useState, useRef } from 'react';
import { List, CheckSquare, FileUp, Upload, Loader2, Trash2, Sparkles, Plus, ShoppingBag, Receipt, Tag, Users } from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';
import { Search } from 'lucide-react';
import { convertCurrency } from '../../../services/exchangeRate';

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
    exchangeRates
}) => {
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
            !searchValue || item.name.toLowerCase().includes(searchValue.toLowerCase())
        );

    const filteredBought = (trip.budget || [])
        .filter(item => item.category === 'shopping')
        .filter(item => matchesUser(item))
        .filter(item =>
            (!searchValue || (item.name || item.desc || "").toLowerCase().includes(searchValue.toLowerCase()))
        );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Member Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveMemberId('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border ${activeMemberId === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/5 border-white/10 hover:bg-white/10 dark:bg-black/30 dark:border-white/5 dark:hover:bg-white/10'}`}
                >
                    <Users className="w-4 h-4" /> 全部成員
                </button>
                {members.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveMemberId(m.id)}
                        className={`flex items-center gap-2 px-1 py-1 pr-3 rounded-full font-bold transition-all whitespace-nowrap border ${activeMemberId === m.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/5 border-white/10 hover:bg-white/10 dark:bg-black/30 dark:border-white/5 dark:hover:bg-white/10'}`}
                    >
                        <img src={m.photoURL || m.avatar || `https://ui-avatars.com/api/?name=${m.name}`} className="w-6 h-6 rounded-full" alt={m.name} />
                        <span className="text-xs">{m.name}</span>
                    </button>
                ))}
            </div>

            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder={`搜尋 ${members.find(m => m.id === activeMemberId)?.name || '全部'} 的商品...`}
                isDarkMode={isDarkMode}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expected to Buy Section */}
                <div className={`${glassCard(isDarkMode)} border-t-4 border-t-purple-500 overflow-hidden`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-purple-500" />
                                    預計購買 <span className="text-xs font-bold opacity-40">({filteredShopping.filter(i => !i.bought).length})</span>
                                </h3>
                                <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-0.5">Shopping Wishlist</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onOpenAIModal('shopping')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider"
                                >
                                    <Sparkles className="w-3 h-3" /> Jarvis 靈感
                                </button>
                                <button
                                    onClick={() => onAddItem('shopping_plan')}
                                    className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[100px]">
                            {filteredShopping.filter(i => !i.bought).length === 0 && (
                                <EmptyState
                                    icon={searchValue ? Search : Tag}
                                    title={searchValue ? "找不到相關商品" : "清單空空如也"}
                                    description={searchValue ? `找不到與「${searchValue}」相關的商品。` : "將您想買的東西加入清單，避免錯過心頭好。"}
                                    isDarkMode={isDarkMode}
                                    action={!searchValue ? {
                                        label: "立即新增",
                                        onClick: () => onAddItem('shopping_plan'),
                                        icon: Plus
                                    } : null}
                                />
                            )}
                            {filteredShopping.filter(i => !i.bought).map((item, i) => (
                                <div key={i} className="group p-4 rounded-xl flex justify-between items-center transition-all border bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md dark:bg-white/[0.03] dark:border-white/5 dark:hover:bg-white/[0.06] dark:hover:border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 bg-white border-gray-200 dark:bg-gray-800 dark:border-white/10">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="w-5 h-5 opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                            {item.desc && <span className="text-[10px] opacity-50 line-clamp-1">{item.desc}</span>}
                                            {/* Show Owner Tag if 'All' */}
                                            {activeMemberId === 'all' && (item.ownerId || item.createdBy?.id) && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Users className="w-2 h-2 opacity-50" />
                                                    <span className="text-[9px] opacity-50">{members.find(m => m.id === (item.ownerId || item.createdBy?.id))?.name || 'User'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-xs font-black text-purple-400">{item.estPrice}</span>
                                        {item.details?.receiptUrl && (
                                            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                                                <Receipt className="w-3 h-3" /> 已有關連
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Already Bought Section */}
                <div className={`${glassCard(isDarkMode)} border-t-4 border-t-emerald-500 overflow-hidden`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                                    已購入 <span className="text-xs font-bold opacity-40">({filteredBought.length})</span>
                                </h3>
                                <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-0.5">Purchase Records</p>
                            </div>
                            <button
                                onClick={() => onAddItem('shopping')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-[10px] font-black uppercase tracking-wider"
                            >
                                <Plus className="w-3.5 h-3.5" /> 記帳
                            </button>
                        </div>

                        <div className="space-y-3 min-h-[100px]">
                            {filteredBought.length === 0 && (
                                <EmptyState
                                    icon={searchValue ? Search : Receipt}
                                    title={searchValue ? "找不到購買記錄" : "尚未有購入記錄"}
                                    description={searchValue ? `找不到與「${searchValue}」相關的記錄。` : "記錄您的戰利品，自動同步到預算管理中。"}
                                    isDarkMode={isDarkMode}
                                    action={!searchValue ? {
                                        label: "手動記帳",
                                        onClick: () => onAddItem('shopping'),
                                        icon: Plus
                                    } : null}
                                />
                            )}
                            {filteredBought.map((item, i) => (
                                <div key={i} className="p-4 rounded-xl flex justify-between items-center transition-all border bg-emerald-50/50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20">
                                    <div className="flex items-center gap-4">
                                        {item.details?.receiptUrl ? (
                                            <a href={item.details.receiptUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500/30 hover:scale-105 transition-transform shadow-lg">
                                                <img src={item.details.receiptUrl} alt="receipt" className="w-full h-full object-cover" />
                                            </a>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                <Receipt className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{item.name || item.desc}</span>
                                            <span className="text-[10px] opacity-50 font-medium">支付人: {item.payer === 'Me' ? '我自己' : item.payer}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end whitespace-nowrap">
                                        <span className="font-mono text-sm font-black text-emerald-500">
                                            {item.currency} {item.cost}
                                        </span>
                                        {item.currency !== (trip.baseCurrency || 'HKD') && (
                                            <div className="text-[9px] text-emerald-600/60 font-bold">
                                                ≈ {(trip.baseCurrency || 'HKD')} {Math.round(convertCurrency(item.cost, item.currency, trip.baseCurrency || 'HKD', exchangeRates || {}))}
                                            </div>
                                        )}
                                        <div className="text-[9px] opacity-40 font-bold uppercase mt-1">Paid & Saved</div>
                                    </div>
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
                            <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400">正在處理單據...</h4>
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
