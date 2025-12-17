import React from 'react';
import { List, CheckSquare, FileUp } from 'lucide-react';

const ShoppingTab = ({
    trip,
    isDarkMode,
    onOpenSectionModal,
    onAddItem,
    handleReceiptUpload,
    receiptPreview,
    glassCard
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <button onClick={() => onOpenSectionModal('import', 'shopping')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯入</button>
                <button onClick={() => onOpenSectionModal('export', 'shopping')} className="px-3 py-1 rounded-lg border border-white/30 text-xs">匯出</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold flex gap-2"><List className="w-5 h-5" /> 預計購買</h3>
                        <button onClick={() => onAddItem('shopping_plan')} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">+ 新增</button>
                    </div>
                    {(trip.shoppingList || []).filter(i => !i.bought).map((item, i) => (
                        <div key={i} className="p-2 border rounded mb-2 flex justify-between">
                            <span>{item.name}</span>
                            <span className="opacity-50 text-xs">預估: {item.estPrice}</span>
                        </div>
                    ))}
                </div>
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold flex gap-2"><CheckSquare className="w-5 h-5" /> 已購入</h3>
                        <button onClick={() => onAddItem('shopping')} className="text-xs bg-green-500 text-white px-2 py-1 rounded">+ 記帳</button>
                    </div>
                    {(trip.budget || []).filter(i => i.category === 'shopping').map((item, i) => (
                        <div key={i} className="p-2 border rounded mb-2 flex justify-between bg-green-500/10">
                            <span>{item.name || item.desc}</span>
                            <span className="font-mono">{item.currency} {item.cost}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={glassCard(isDarkMode) + " p-4 flex flex-col gap-3"}>
                <h3 className="font-bold flex gap-2"><FileUp className="w-5 h-5" /> 單據掃描 / 上傳</h3>
                <input type="file" accept="image/*" onChange={e => handleReceiptUpload('shopping', e.target.files?.[0])} className="text-xs" />
                <p className="text-xs opacity-70">限制：JPG/PNG，建議 2MB 內。檔案僅暫存於本機，可搭配 PDF 匯出。</p>
                {receiptPreview?.shopping && <img src={receiptPreview.shopping} alt="receipt" className="max-h-48 rounded-lg border border-white/10 object-contain" />}
            </div>
        </div>
    );
};

export default ShoppingTab;
