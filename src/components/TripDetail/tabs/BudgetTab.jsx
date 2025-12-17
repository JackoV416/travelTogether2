import React from 'react';
import { RefreshCw, List, FileUp } from 'lucide-react';

const BudgetTab = ({
    trip,
    isDarkMode,
    debtInfo,
    onOpenSectionModal,
    onExportPdf,
    handleReceiptUpload,
    glassCard
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end gap-2">
                <button onClick={() => onOpenSectionModal('import', 'budget')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯入</button>
                <button onClick={() => onOpenSectionModal('export', 'budget')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯出</button>
                <button onClick={onExportPdf} className="px-3 py-1 rounded-lg border border-indigo-400 text-xs text-indigo-200">匯出 PDF</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={glassCard(isDarkMode) + " p-6 text-center"}>
                    <div className="text-sm opacity-60 uppercase mb-1">總支出</div>
                    <div className="text-3xl font-bold font-mono text-indigo-500">${Math.round(debtInfo.totalSpent).toLocaleString()}</div>
                </div>
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <h3 className="font-bold mb-2 flex gap-2"><RefreshCw className="w-4 h-4" /> 債務結算</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(debtInfo.balances).map(([name, bal]) => (
                            <div key={name} className="flex justify-between border-b pb-1">
                                <span>{name}</span>
                                <span className={bal > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {bal > 0 ? `應收 $${Math.round(bal)}` : `應付 $${Math.round(Math.abs(bal))}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={glassCard(isDarkMode) + " p-6"}>
                <h3 className="font-bold mb-4 flex gap-2"><List className="w-4 h-4" /> 支出明細</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                    {(trip.budget || []).map((b, i) => (
                        <div key={i} className="flex justify-between p-2 hover:bg-white/5 rounded text-sm">
                            <span>{b.name || b.desc} ({b.payer})</span>
                            <span className="font-mono opacity-70">{b.currency} {b.cost}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={glassCard(isDarkMode) + " p-4 flex flex-col gap-3"}>
                <h3 className="font-bold flex gap-2"><FileUp className="w-5 h-5" /> 收據 / 單據上傳</h3>
                <input type="file" accept="image/*,application/pdf" onChange={e => handleReceiptUpload('budget', e.target.files?.[0])} className="text-xs" />
                <p className="text-xs opacity-70">支援圖片或 PDF，檔案不會上傳，只供本機紀錄與 PDF 匯出。</p>
            </div>
        </div>
    );
};

export default BudgetTab;
