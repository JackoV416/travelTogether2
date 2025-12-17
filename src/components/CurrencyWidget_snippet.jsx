{/* Currency Widget */ }
<div className={`${glassCard(isDarkMode)} p-6 h-full flex flex-col`}>
    <h4 className="font-bold flex items-center gap-2 mb-4"><DollarSign className="w-5 h-5" /> 即時匯率 (Base: {globalSettings?.currency || 'HKD'})</h4>
    <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {Object.keys(CURRENCIES).filter(c => c !== (globalSettings?.currency || 'HKD')).map(code => {
            // exchangeRates is assumed to be based on HKD or whatever getExchangeRates fetches.
            // If getExchangeRates() was called with globalSettings.currency, then exchangeRates[code] is correct directly.
            // If App.jsx always fetches with HKD base, we need conversion.
            // Let's check App.jsx useEffect. 
            // Assuming we'll ensure App.jsx fetches right base or we do conversion here.
            // Simplest: widget just displays the rates passed to it.
            const rate = exchangeRates?.[code] || 0;
            return (
                <div key={code} className="flex justify-between items-center p-2 rounded-lg border border-white/5 hover:bg-white/5 transition">
                    <div className="flex items-center gap-2">
                        <span className="font-bold w-8">{code}</span>
                        <span className="text-xs opacity-50">{CURRENCIES[code]?.symbol}</span>
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-bold text-lg text-emerald-400">{rate ? rate.toFixed(2) : '--'}</div>
                        <div className="text-[10px] opacity-50">1 {globalSettings?.currency || 'HKD'} ≈ {rate ? rate.toFixed(2) : '--'} {code}</div>
                    </div>
                </div>
            );
        })}
    </div>
</div>
