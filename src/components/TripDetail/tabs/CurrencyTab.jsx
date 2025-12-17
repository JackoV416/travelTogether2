import React from 'react';
import { DollarSign, ArrowUpRight } from 'lucide-react';
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
    glassCard
}) => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className={glassCard(isDarkMode) + " p-8 flex flex-col items-center justify-center min-h-[400px]"}>
                <h3 className="font-bold text-2xl mb-8 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-emerald-400" /> 匯率計算機
                </h3>

                <div className="w-full max-w-md bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>

                    {/* Input Area */}
                    <div className="space-y-6 relative z-10">
                        {/* From (Home Currency) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold opacity-60 uppercase tracking-wider pl-1">
                                您持有 ({globalSettings?.currency || 'HKD'})
                            </label>
                            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg shrink-0">
                                    {currencies[globalSettings?.currency || 'HKD']?.symbol}
                                </div>
                                <input
                                    type="number"
                                    value={convAmount}
                                    onChange={e => setConvAmount(Number(e.target.value))}
                                    className="w-full bg-transparent text-3xl font-bold font-mono outline-none placeholder-white/20"
                                    placeholder="1000"
                                />
                                <div className="font-bold opacity-50">{globalSettings?.currency || 'HKD'}</div>
                            </div>
                        </div>

                        {/* Divider / Switch */}
                        <div className="flex justify-center -my-3 relative z-20">
                            <div className="bg-gray-800 rounded-full p-2 border border-gray-600">
                                <ArrowUpRight className="w-5 h-5 text-emerald-400 rotate-45" />
                            </div>
                        </div>

                        {/* To (Destination Currency) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold opacity-60 uppercase tracking-wider pl-1">
                                目的地 ({convTo})
                            </label>
                            <div className="flex items-center gap-4 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-lg text-emerald-400 shrink-0">
                                    {currencies[convTo]?.symbol}
                                </div>
                                <div className="w-full text-3xl font-bold font-mono text-emerald-400">
                                    {convertCurrency(convAmount, globalSettings?.currency || 'HKD', convTo, exchangeRates).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </div>
                                <select
                                    value={convTo}
                                    onChange={e => setConvTo(e.target.value)}
                                    className="bg-transparent font-bold outline-none cursor-pointer text-right appearance-none py-1 pr-2"
                                    style={{ textAlignLast: 'right' }}
                                >
                                    {Object.keys(currencies).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Rate Info */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <div className="text-sm opacity-60 font-mono">
                            1 {globalSettings?.currency || 'HKD'} ≈ <span className="text-white font-bold">{convertCurrency(1, globalSettings?.currency || 'HKD', convTo, exchangeRates).toFixed(4)}</span> {convTo}
                        </div>
                        <div className="text-[10px] opacity-40 mt-1">匯率僅供參考，實際交易請以銀行為準</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyTab;
