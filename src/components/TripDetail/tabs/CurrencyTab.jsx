import React from 'react';
import { DollarSign, ArrowUpRight, ShoppingBag, Wallet, CheckCircle2, Sparkles, AlertCircle, Info } from 'lucide-react';
import { convertCurrency } from '../../../services/exchangeRate';

const CurrencyTab = ({
    isDarkMode,
    globalSettings,
    exchangeRates,
    convAmount,
    setConvAmount,
    convTo,
    setConvTo,
    currencies,
    glassCard,
    isSimulation,
    budget = [],
    shoppingList = []
}) => {
    const homeCurrency = globalSettings?.currency || 'HKD';
    if (!currencies) return <div className="p-10 text-center opacity-50">載入中...</div>;
    const currentRate = convertCurrency(1, homeCurrency, convTo, exchangeRates);

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Main Converter Card */}
            <div className={`${glassCard(isDarkMode)} p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group`}>
                <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-600"></div>

                <div className="flex justify-between items-center w-full max-w-md mb-8">
                    <h3 className="font-black text-xl flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-violet-400" /> 匯率計算機
                    </h3>
                    <div className="flex items-center gap-2">
                        {isSimulation && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-600/30 text-white rounded-full border border-violet-400/50 text-[11px] font-black uppercase tracking-widest mr-2 animate-pulse shadow-lg shadow-violet-500/20">
                                <Sparkles className="w-3.5 h-3.5" /> AI 推算功能
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter animate-pulse">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            LIVE
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl backdrop-blur-sm relative overflow-hidden transition-all duration-500 hover:border-violet-500/30">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

                    {/* Input Area */}
                    <div className="space-y-6 relative z-10">
                        {/* From (Home Currency) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] pl-1">
                                本地貨幣 ({homeCurrency})
                            </label>
                            <div className="flex items-center gap-4 bg-white dark:bg-black/30 p-4 rounded-2xl border border-gray-100 dark:border-white/5 group-focus-within:border-violet-500/50 transition-colors shadow-sm dark:shadow-none">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-lg shrink-0">
                                    {currencies[homeCurrency]?.symbol}
                                </div>
                                <input
                                    type="number"
                                    value={convAmount}
                                    onChange={e => setConvAmount(Number(e.target.value))}
                                    className="w-full bg-transparent text-3xl font-black font-mono outline-none placeholder-gray-300 dark:placeholder-white/10"
                                    placeholder="1000"
                                />
                                <div className="font-black opacity-30 text-xs">{homeCurrency}</div>
                            </div>
                        </div>

                        {/* Divider / Switch */}
                        <div className="flex justify-center -my-3 relative z-20">
                            <div className="bg-white dark:bg-gray-800 rounded-full p-2 border border-gray-100 dark:border-gray-600 shadow-lg dark:shadow-xl">
                                <ArrowUpRight className="w-5 h-5 text-violet-400 rotate-45" />
                            </div>
                        </div>

                        {/* To (Destination Currency) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] pl-1 flex items-center gap-1.5">
                                當地貨幣 ({convTo})
                                {isSimulation && <Info className="w-3 h-3 text-violet-400 animate-bounce cursor-help" title="點擊切換不同目的地幣值" />}
                            </label>
                            <div className="flex items-center gap-4 bg-violet-500/5 dark:bg-violet-500/10 p-4 rounded-2xl border border-violet-500/10 dark:border-violet-500/30">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center font-bold text-lg text-violet-500 dark:text-violet-400 shrink-0 uppercase">
                                    {currencies[convTo]?.symbol || convTo?.charAt(0)}
                                </div>
                                <div className={`w-full text-3xl font-black font-mono text-violet-400 truncate ${isSimulation && (convAmount > 0) ? 'animate-pulse' : ''}`}>
                                    {(convAmount * currentRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </div>
                                <div className="relative">
                                    <select
                                        value={convTo}
                                        onChange={e => setConvTo(e.target.value)}
                                        className="bg-transparent font-black outline-none cursor-pointer text-right appearance-none py-1 pr-6 uppercase text-sm"
                                        style={{ textAlignLast: 'right' }}
                                    >
                                        {Object.keys(currencies).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <ArrowUpRight className="w-3 h-3 rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rate Info */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <div className="text-xs font-bold opacity-60 font-mono tracking-tight">
                            1 {homeCurrency} ≈ <span className="text-violet-400 font-black">{currentRate.toFixed(4)}</span> {convTo}
                        </div>
                        <div className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-2 px-4 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full inline-block">Real-time Data Synchronized</div>
                    </div>
                </div>
            </div>

            {/* Shopping & Budget Item Conversion Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shopping Conversion */}
                <div className={`${glassCard(isDarkMode)} p-6 border-t-4 border-t-fuchsia-500`}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-black text-sm flex items-center gap-2 uppercase tracking-tight">
                                <ShoppingBag className="w-4 h-4 text-fuchsia-400" /> 購物清單換算
                            </h4>
                            <p className="text-[9px] opacity-40 font-black uppercase tracking-widest mt-0.5">Shopping List Estimates</p>
                        </div>
                        <span className="text-[10px] font-black bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            {shoppingList.length} Items
                            {isSimulation && <Sparkles className="w-3 h-3" />}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {shoppingList.length === 0 ? (
                            <div className="py-10 text-center opacity-30 text-xs font-bold italic">清單中暫無項目...</div>
                        ) : shoppingList.map((item, idx) => {
                            // Extract numeric price from strings like "1000 JPY" or "100 HKD"
                            const priceStr = item.estPrice || "0";
                            const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
                            const itemCurrency = priceStr.toUpperCase().includes('JPY') ? 'JPY' :
                                priceStr.toUpperCase().includes('TWD') ? 'TWD' :
                                    priceStr.toUpperCase().includes('USD') ? 'USD' :
                                        homeCurrency;

                            // Convert to destination currency
                            const priceInHome = convertCurrency(numericPrice, itemCurrency, homeCurrency, exchangeRates);
                            const priceInDest = priceInHome * currentRate;

                            return (
                                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                    <div className="min-w-0 flex-1 mr-4">
                                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                            {item.bought && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] opacity-40 font-black uppercase mt-0.5 tracking-tighter">當地原價: {priceStr}</div>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                                        <div className="text-sm font-black text-fuchsia-400 font-mono tracking-tighter">
                                            {currencies[homeCurrency]?.symbol}{priceInHome.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                                            <span className="ml-1 text-[9px] opacity-70 font-bold uppercase tracking-tighter">本地貨幣 ({homeCurrency})</span>
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 dark:text-white/40 font-mono tracking-tighter flex items-center gap-1">
                                            {currencies[convTo]?.symbol}{priceInDest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                            <span className="text-[8px] opacity-50 ml-1">當地貨幣 ({convTo})</span>
                                        </div>
                                        {isSimulation && (
                                            <div className="text-[8px] text-fuchsia-400/50 font-black uppercase flex items-center gap-0.5">
                                                <Sparkles className="w-2 h-2" /> AI 推算
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Budget Conversion */}
                <div className={`${glassCard(isDarkMode)} p-6 border-t-4 border-t-indigo-500`}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-black text-sm flex items-center gap-2 uppercase tracking-tight">
                                <Wallet className="w-4 h-4 text-indigo-400" /> 已付支出換算
                            </h4>
                            <p className="text-[9px] opacity-40 font-black uppercase tracking-widest mt-0.5">Budget Spent Matrix</p>
                        </div>
                        <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            {budget.length} Records
                            {isSimulation && <Sparkles className="w-3 h-3" />}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {budget.length === 0 ? (
                            <div className="py-10 text-center opacity-30 text-xs font-bold italic">尚未有支出紀錄...</div>
                        ) : budget.map((item, idx) => {
                            const costHome = convertCurrency(item.cost || 0, item.currency || homeCurrency, homeCurrency, exchangeRates);
                            const costDest = costHome * currentRate;

                            return (
                                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                    <div className="min-w-0 flex-1 mr-4">
                                        <div className="text-xs font-bold truncate uppercase tracking-tighter">{item.name || item.desc}</div>
                                        <div className="text-[10px] opacity-40 font-black uppercase mt-0.5 tracking-tighter">當地支出: {item.currency} {item.cost}</div>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                                        <div className="text-sm font-black text-indigo-400 font-mono tracking-tighter">
                                            {currencies[homeCurrency]?.symbol}{costHome.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                                            <span className="ml-1 text-[9px] opacity-70 font-bold uppercase tracking-tighter">本地貨幣 ({homeCurrency})</span>
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 dark:text-white/40 font-mono tracking-tighter flex items-center gap-1">
                                            {currencies[convTo]?.symbol}{costDest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                            <span className="text-[8px] opacity-50 ml-1">當地貨幣 ({convTo})</span>
                                        </div>
                                        {isSimulation && (
                                            <div className="text-[8px] text-indigo-400/50 font-black uppercase flex items-center gap-0.5">
                                                <RefreshCw className="w-2 h-2" /> 實時匯率
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyTab;
