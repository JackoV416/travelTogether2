// src/components/ExpenseForm.jsx

import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// 輔助函式：貨幣轉換 (從 CreateTrip.jsx 和 TripDetail.jsx 複製過來)
// ----------------------------------------------------------------------
// 注意：為了防止重複定義，這些常數和函式在實際專案中應該放在一個單獨的 helper 檔案中。
const BASE_CURRENCY = 'HKD';
const AVAILABLE_CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR'];

// 假設的簡化匯率表 (所有貨幣兌換 1 HKD 的值)
// 1 HKD = X YYY
// 這裡我們直接使用 TripDetail 傳入的 props，但為避免錯誤，先定義一個本地函式。
const convertToHKD = (amount, currency, rates) => {
    if (!amount || !currency || currency === BASE_CURRENCY) {
        return amount || 0;
    }
    const rate = rates[currency] || 1; 
    return amount / rate;
};
// ----------------------------------------------------------------------


const ExpenseForm = ({ members, onAddExpense, onClose, baseCurrency, exchangeRates }) => {
    
    // 初始化費用狀態
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState(0);
    // 費用支付者 ID，預設為第一個成員 (通常是自己)
    const [paidById, setPaidById] = useState(members[0]?.id || ''); 
    // 分攤者 ID 陣列，預設為所有成員
    const [sharedBy, setSharedBy] = useState(members.map(m => m.id));
    // 費用貨幣，預設為基礎貨幣 (HKD)
    const [expenseCurrency, setExpenseCurrency] = useState(BASE_CURRENCY);


    useEffect(() => {
        // 確保至少有一個成員被選中為支付者和分攤者
        if (members.length > 0 && !paidById) {
            setPaidById(members[0].id);
        }
    }, [members, paidById]);


    // 處理分攤者勾選/取消勾選
    const handleSharedByChange = (memberId, isChecked) => {
        if (isChecked) {
            setSharedBy([...sharedBy, memberId]);
        } else {
            setSharedBy(sharedBy.filter(id => id !== memberId));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!description || cost <= 0 || !paidById || sharedBy.length === 0) {
            alert('請確認填寫了描述、金額大於零，並選擇了支付者和分攤者。');
            return;
        }

        // *** 步驟 1: 進行貨幣轉換 ***
        const costInHKD = convertToHKD(parseFloat(cost), expenseCurrency, exchangeRates);
        
        // 步驟 2: 構建新費用對象
        const newExpense = {
            id: Date.now(), 
            description,
            // 儲存轉換後的基礎貨幣 (HKD) 金額
            cost: costInHKD, 
            paidById,
            sharedBy,
            // 儲存原始輸入信息，以便追溯
            originalCost: parseFloat(cost), 
            originalCurrency: expenseCurrency,
            date: new Date().toISOString()
        };
        
        // 步驟 3: 提交給父組件 (TripDetail)
        onAddExpense(newExpense);
        // 關閉表單
        onClose();
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm text-gray-800">
            <h2 className="text-2xl font-bold mb-4">新增支出</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 描述 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">支出項目</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="例如：晚餐、計程車費"
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        required
                    />
                </div>
                
                {/* 金額與貨幣 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">金額</label>
                    <div className="flex space-x-2 mt-1">
                        <input
                            type="number"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0.00"
                            className="flex-grow p-3 border border-gray-300 rounded-lg text-right focus:ring-red-500 focus:border-red-500"
                            required
                        />
                        <select 
                            value={expenseCurrency} 
                            onChange={(e) => setExpenseCurrency(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg"
                        >
                            {AVAILABLE_CURRENCIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    {/* 顯示轉換後的金額 */}
                    <p className="text-xs text-gray-500 mt-1">
                        **結算金額**: {convertToHKD(parseFloat(cost), expenseCurrency, exchangeRates).toFixed(2)} {baseCurrency}
                    </p>
                </div>
                
                {/* 誰支付了 (Paid By) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">誰支付了這筆費用？</label>
                    <select
                        value={paidById}
                        onChange={(e) => setPaidById(e.target.value)}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        required
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* 誰應分攤 (Shared By) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">誰應分攤這筆費用？</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`shared-${member.id}`}
                                    checked={sharedBy.includes(member.id)}
                                    onChange={(e) => handleSharedByChange(member.id, e.target.checked)}
                                    className="h-4 w-4 text-red-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`shared-${member.id}`} className="ml-3 text-sm font-medium text-gray-700">
                                    {member.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 動作按鈕 */}
                <div className="pt-2 space-y-3">
                    <button 
                        type="submit" 
                        className="w-full bg-red-600 text-white p-3 rounded-full font-bold hover:bg-red-700 active:scale-95 transition-transform"
                    >
                        新增費用
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full bg-gray-300 text-black p-3 rounded-full font-medium"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
