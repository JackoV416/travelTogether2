import React, { useState, useRef } from 'react';
import {
    RefreshCw, List, FileUp, Loader2, DollarSign, PieChart,
    TrendingUp, ArrowDownCircle, ArrowUpCircle, Coffee,
    Bus, ShoppingBag, Hotel, Plane, Ticket, HelpCircle
} from 'lucide-react';
import SearchFilterBar from '../../Shared/SearchFilterBar';

const BudgetTab = ({
    trip,
    isDarkMode,
    debtInfo,
    onOpenSectionModal,
    onExportPdf,
    handleReceiptUpload,
    glassCard,
    onOpenSmartImport,
    onOpenSmartExport
}) => {
    const [searchValue, setSearchValue] = useState("");
    const [activeFilters, setActiveFilters] = useState({ category: 'all' });

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

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'food': return <Coffee className="w-4 h-4 text-orange-400" />;
            case 'transport': return <Bus className="w-4 h-4 text-blue-400" />;
            case 'shopping': return <ShoppingBag className="w-4 h-4 text-purple-400" />;
            case 'hotel': return <Hotel className="w-4 h-4 text-emerald-400" />;
            case 'flight': return <Plane className="w-4 h-4 text-indigo-400" />;
            case 'spot': return <Ticket className="w-4 h-4 text-pink-400" />;
            default: return <HelpCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredBudget = (trip.budget || []).filter(item => {
        const matchesSearch = !searchValue ||
            (item.name || item.desc || "").toLowerCase().includes(searchValue.toLowerCase()) ||
            (item.payer || "").toLowerCase().includes(searchValue.toLowerCase());

        const matchesFilter = activeFilters.category === 'all' || item.category === activeFilters.category;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <SearchFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                placeholder="搜尋支出項目、付款人..."
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={(key, val) => setActiveFilters(prev => ({ ...prev, [key]: val }))}
                onClearFilters={() => { setSearchValue(""); setActiveFilters({ category: 'all' }); }}
                isDarkMode={isDarkMode}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Stats Card */}
                <div className={`${glassCard(isDarkMode)} p-8 md:col-span-1 flex flex-col items-center justify-center relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Total Accumulated Spend</div>
                    <div className="text-4xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                        ${Math.round(debtInfo.totalSpent).toLocaleString()}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-bold">
                        <PieChart className="w-3 h-3" /> 各半拆數模式已啟用
                    </div>
                </div>

                {/* Balance List */}
                <div className={`${glassCard(isDarkMode)} p-6 md:col-span-2`}>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-indigo-500" /> 債務與結算
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(debtInfo.balances).map(([name, bal]) => (
                            <div key={name} className={`p-4 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50/50 border-gray-200'} `}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${bal >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                        {name[0].toUpperCase()}
                                    </div>
                                    <span className="font-bold text-sm">{name}</span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-black font-mono ${bal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {bal >= 0 ? `+ $${Math.round(bal)}` : `- $${Math.round(Math.abs(bal))}`}
                                    </div>
                                    <div className="text-[9px] opacity-40 uppercase font-black">{bal >= 0 ? 'To Receive' : 'To Pay'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Table Area */}
            <div className={`${glassCard(isDarkMode)} overflow-hidden`}>
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <List className="w-4 h-4 text-indigo-500" /> 支出明細摘要
                    </h3>
                    <span className="text-[10px] opacity-50 font-bold uppercase">{filteredBudget.length} Records</span>
                </div>

                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {filteredBudget.map((b, i) => (
                        <div key={i} className="group p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-indigo-500/[0.02]">
                            <div className="flex items-center gap-4 flex-1 w-full">
                                {b.details?.receiptUrl ? (
                                    <a href={b.details.receiptUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/10 flex-shrink-0 hover:scale-105 transition-transform shadow-lg">
                                        <img src={b.details.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                                    </a>
                                ) : (
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                        {getCategoryIcon(b.category)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm tracking-tight truncate">{b.name || b.desc}</div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">{b.payer}</span>
                                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{b.category || 'misc'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 px-1">
                                <span className={`text-base font-black font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{b.currency} {b.cost}</span>
                                <div className="text-[9px] opacity-40 uppercase font-black mt-1">Settled {b.currency !== 'HKD' ? '• Foreign' : ''}</div>
                            </div>
                        </div>
                    ))}
                    {filteredBudget.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <DollarSign className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-xs font-black uppercase tracking-widest">No matching transactions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetTab;
