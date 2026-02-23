import React from 'react';
import { DollarSign, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { CURRENCIES } from '../../../constants/appData';
import { convertCurrency } from '../../../services/exchangeRate';
import { AuroraCard, AuroraGradientText } from '../../Shared/AuroraComponents';

/**
 * CurrencyConverter - 匯率計算機 (Aurora Style)
 * @param {boolean} isDarkMode - Dark mode state
 * @param {number} convAmount - Amount to convert
 * @param {Function} setConvAmount - Set amount function
 * @param {string} convFrom - Source currency
 * @param {Function} setConvFrom - Set source currency function
 * @param {string} convTo - Target currency
 * @param {Function} setConvTo - Set target currency function
 * @param {Object} exchangeRates - Exchange rates object
 * @param {Function} onOpenSettings - Open settings callback
 */
const CurrencyConverter = ({
    isDarkMode,
    convAmount,
    setConvAmount,
    convFrom,
    setConvFrom,
    convTo,
    setConvTo,
    exchangeRates,
    onOpenSettings
}) => {
    const handleSwap = () => {
        const temp = convFrom;
        setConvFrom(convTo);
        setConvTo(temp);
    };

    return (
        <div className="break-inside-avoid shadow-xl h-full">
            <AuroraCard className="h-full flex flex-col !p-0 overflow-hidden" noPadding>
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 p-6 pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <AuroraGradientText as="h4" className="font-bold flex items-center gap-2 text-lg">
                            <DollarSign className="w-5 h-5 text-violet-400" /> 匯率計算機
                        </AuroraGradientText>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-black/20 text-white/50 border border-white/5 backdrop-blur-sm">
                                LIVE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 flex flex-col gap-4">
                    <div className="bg-black/20 rounded-2xl p-1 gap-1 flex flex-col border border-white/5">
                        {/* From Currency */}
                        <div className="relative group bg-white/5 rounded-xl p-3 border border-transparent focus-within:border-violet-500/30 transition-all">
                            <label className="text-[9px] opacity-40 uppercase tracking-widest font-bold block mb-1 text-white">From ({convFrom})</label>
                            <div className="flex items-center gap-3">
                                <span className="text-xl opacity-50 font-mono">{CURRENCIES[convFrom]?.symbol || '$'}</span>
                                <input
                                    type="number"
                                    value={convAmount}
                                    onChange={e => setConvAmount(Number(e.target.value))}
                                    className="w-full bg-transparent text-2xl font-mono font-bold outline-none placeholder-white/20 text-white"
                                    placeholder="1000"
                                />
                                <div className="relative">
                                    <select
                                        value={convFrom}
                                        onChange={e => setConvFrom(e.target.value)}
                                        className="appearance-none bg-black/40 text-white font-bold text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-black/60 transition-colors border border-white/10 pr-6"
                                    >
                                        {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* Swap Button (Floating) */}
                        <div className="h-0 flex justify-center items-center relative z-10">
                            <button
                                onClick={handleSwap}
                                className="bg-violet-600 text-white w-8 h-8 rounded-full shadow-lg shadow-violet-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-violet-400 group"
                            >
                                <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        {/* To Currency */}
                        <div className="relative group bg-violet-500/10 rounded-xl p-3 border border-violet-500/20">
                            <label className="text-[9px] opacity-60 uppercase tracking-widest font-bold block mb-1 text-violet-300">To ({convTo})</label>
                            <div className="flex items-center gap-3">
                                <span className="text-xl text-violet-400 font-mono">{CURRENCIES[convTo]?.symbol || '$'}</span>
                                <div className="w-full text-2xl font-mono font-bold text-violet-300 truncate">
                                    {convertCurrency(convAmount, convFrom, convTo, exchangeRates).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </div>
                                <div className="relative">
                                    <select
                                        value={convTo}
                                        onChange={e => setConvTo(e.target.value)}
                                        className="appearance-none bg-violet-900/40 text-violet-200 font-bold text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-violet-900/60 transition-colors border border-violet-500/30 pr-6"
                                    >
                                        {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-violet-300">▼</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rate Info */}
                    <div className="px-2 flex items-center justify-between text-[10px] font-mono opacity-50 text-slate-300">
                        <span>1 {convFrom} ≈ <span className="text-violet-400 font-bold">{convertCurrency(1, convFrom, convTo, exchangeRates).toFixed(4)}</span> {convTo}</span>
                        <button onClick={() => onOpenSettings && onOpenSettings()} className="hover:text-violet-400 transition-colors underline decoration-dotted">變更預設</button>
                    </div>
                </div>
            </AuroraCard>
        </div>
    );
};

export default CurrencyConverter;
