import React from 'react';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import { glassCard } from '../../../utils/tripUtils';
import { CURRENCIES } from '../../../constants/appData';
import { convertCurrency } from '../../../services/exchangeRate';

/**
 * CurrencyConverter - 匯率計算機
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
        <div className="break-inside-avoid">
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2 text-emerald-400">
                        <DollarSign className="w-5 h-5" /> 匯率計算機
                    </h4>
                    <span className="text-[9px] opacity-40 bg-white/10 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Real-time</span>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 space-y-4 border border-white/10 shadow-inner">
                    {/* From Currency */}
                    <div className="space-y-2">
                        <label className="text-[9px] opacity-50 uppercase tracking-widest font-bold block ml-1">您持有 ({convFrom})</label>
                        <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">
                                {CURRENCIES[convFrom]?.symbol || '$'}
                            </div>
                            <input
                                type="number"
                                value={convAmount}
                                onChange={e => setConvAmount(Number(e.target.value))}
                                className="w-full bg-transparent text-2xl font-mono font-bold outline-none placeholder-white/20"
                                placeholder="1000"
                            />
                            <select
                                value={convFrom}
                                onChange={e => setConvFrom(e.target.value)}
                                className={`bg-transparent font-bold text-sm outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                                {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center -my-1 relative z-10">
                        <div
                            className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg transform hover:rotate-180 transition-transform duration-500 cursor-pointer border border-emerald-500 hover:shadow-emerald-500/30"
                            onClick={handleSwap}
                        >
                            <ArrowUpRight className="w-4 h-4 rotate-45" />
                        </div>
                    </div>

                    {/* To Currency */}
                    <div className="space-y-2">
                        <label className="text-[9px] opacity-50 uppercase tracking-widest font-bold block ml-1">換算目標 ({convTo})</label>
                        <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-400 shrink-0">
                                {CURRENCIES[convTo]?.symbol || '$'}
                            </div>
                            <div className="w-full text-2xl font-mono font-bold text-emerald-400">
                                {convertCurrency(convAmount, convFrom, convTo, exchangeRates).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </div>
                            <select
                                value={convTo}
                                onChange={e => setConvTo(e.target.value)}
                                className={`bg-transparent font-bold text-sm outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                                {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Rate Info */}
                    <div className="pt-2 text-[10px] text-center opacity-50 font-mono">
                        1 {convFrom} ≈ <span className="text-emerald-400 font-bold">{convertCurrency(1, convFrom, convTo, exchangeRates).toFixed(4)}</span> {convTo}
                    </div>
                </div>
                <button onClick={() => onOpenSettings && onOpenSettings()} className="mt-3 text-[10px] text-center w-full opacity-60 hover:opacity-100 hover:text-emerald-400 transition-all">變更預設貨幣 ⚙️</button>
            </div>
        </div>
    );
};

export default CurrencyConverter;
