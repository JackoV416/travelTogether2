// src/components/ExpenseForm.jsx

import React, { useState, useEffect } from 'react';

const BASE_CURRENCY = 'HKD';
const AVAILABLE_CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR'];

// 輔助函式：貨幣轉換 (需要在這個組件中重定義或作為 props 傳入，這裡使用傳入的 props)
const convertToHKD = (amount, currency, rates) => {
    if (!amount || !currency || currency === BASE_CURRENCY) {
        return amount || 0;
    }
    const rate = rates[currency] || 1; 
    return amount / rate;
};


const ExpenseForm = ({ members, onAddExpense, onClose, baseCurrency, exchangeRates }) => {
    
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState(0);
    const [paidById, setPaidById] = useState(members[0]?.id || ''); 
    const [sharedBy, setSharedBy] = useState(members.map(m => m.id));
    const [expenseCurrency, setExpenseCurrency] = useState(baseCurrency);


    useEffect(() => {
        if (members.length > 0 && !paidById) {
            setPaidById(members[0].id);
        }
    }, [members, paidById]);


    const handleSharedByChange = (memberId, isChecked) => {
        if (isChecked) {
            setSharedBy([...sharedBy, memberId]);
        } else {
            setSharedBy(sharedBy.filter(id => id !== memberId));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!description || parseFloat(cost) <= 0 || !paidById || sharedBy.length === 0) {
            alert('請確認填寫了描述、金額大於零，並選擇了支付者和分攤者。');
            return;
        }

        // 進行貨幣轉換
        const costFloat = parseFloat(cost);
        const costInHKD = convertToHKD(costFloat, expenseCurrency, exchangeRates);
        
        const newExpense = {
            id: Date.now(), 
            description,
            cost: costInHKD, // 儲存轉換後的基礎貨幣 (HKD) 金額
            paidById,
            sharedBy,
            originalCost: costFloat, 
            originalCurrency: expenseCurrency,
            date: new Date().toISOString()
        };
        
        onAddExpense(newExpense);
    };


    // 預覽轉換後的金額
    const convertedCost = cost > 0 
        ? convertToHKD(parseFloat(cost), expenseCurrency, exchangeRates).toFixed(2) 
        : '0.00';


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
                        **結算金額**: {convertedCost} {baseCurrency}
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
