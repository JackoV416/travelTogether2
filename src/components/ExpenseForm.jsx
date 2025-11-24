// src/components/ExpenseForm.jsx

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // 用於生成唯一 ID

// 貨幣定義 (必須與 CreateTrip/TripDetail 保持一致)
const AVAILABLE_CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR'];

const ExpenseForm = ({ members, onAddExpense, onClose, baseCurrency, exchangeRates }) => {
    
    // 表單狀態
    const [description, setDescription] = useState('');
    const [originalCost, setOriginalCost] = useState(''); // 用戶輸入的原始金額
    const [originalCurrency, setOriginalCurrency] = useState(baseCurrency); // 用戶輸入的原始貨幣
    const [paidById, setPaidById] = useState(members[0]?.id || '');
    const [sharedBy, setSharedBy] = useState(members.map(m => m.id)); // 預設所有成員分攤

    // 輔助函式：將任何貨幣金額轉換為基礎結算貨幣 (HKD)
    const convertToHKD = (amount, currency) => {
        if (!amount || !currency || currency === baseCurrency) {
            return amount || 0;
        }
        const rate = exchangeRates[currency] || 1;
        return amount / rate;
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!description || originalCost <= 0 || !paidById || sharedBy.length === 0) {
            alert('請填寫完整費用資訊，並確保金額和分攤成員正確。');
            return;
        }

        const amount = parseFloat(originalCost);
        
        // 1. 轉換為結算貨幣 (HKD)
        const costInHKD = convertToHKD(amount, originalCurrency);

        // 2. 準備要儲存的費用資料
        const newExpense = {
            id: uuidv4(), // 生成唯一的費用 ID
            description,
            // 儲存原始輸入
            originalCost: amount, 
            originalCurrency,
            // 儲存轉換後的結算金額 (關鍵)
            cost: costInHKD, 
            paidById,
            sharedBy,
            createdAt: new Date().toISOString(),
        };

        onAddExpense(newExpense);
    };

    const handleShareToggle = (memberId) => {
        setSharedBy(prev => 
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-white">新增支出</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 費用描述 */}
                <input
                    type="text"
                    placeholder="支出描述 (e.g., 晚餐, 門票)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    required
                />

                {/* 金額與貨幣選擇 (原始輸入) */}
                <div className="flex space-x-2">
                    <input
                        type="number"
                        placeholder="金額"
                        value={originalCost}
                        onChange={(e) => setOriginalCost(e.target.value)}
                        className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                        min="0.01"
                        step="0.01"
                        required
                    />
                    <select
                        value={originalCurrency}
                        onChange={(e) => setOriginalCurrency(e.target.value)}
                        className="p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    >
                        {AVAILABLE_CURRENCIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* 誰支付了這筆費用 */}
                <div>
                    <label className="block text-gray-300 mb-1 font-medium">誰支付了？</label>
                    <select
                        value={paidById}
                        onChange={(e) => setPaidById(e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                        required
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>
                </div>

                {/* 誰分攤這筆費用 */}
                <div>
                    <label className="block text-gray-300 mb-2 font-medium">誰分攤這筆費用？</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                                <span className="text-white">{member.name}</span>
                                <input
                                    type="checkbox"
                                    checked={sharedBy.includes(member.id)}
                                    onChange={() => handleShareToggle(member.id)}
                                    className="h-5 w-5 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 提交按鈕 */}
                <button
                    type="submit"
                    className="w-full bg-red-600 text-white p-3 rounded-full font-bold hover:bg-red-700 active:scale-95 transition-transform mt-4"
                >
                    新增費用 (轉換為 {baseCurrency})
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gray-600 text-white p-3 rounded-full font-medium hover:bg-gray-500"
                >
                    取消
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
