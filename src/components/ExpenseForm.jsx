// src/components/ExpenseForm.jsx - 費用表單 (新增分攤方式)

import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const ExpenseForm = ({ tripId, collaborators, currency, onSave, onClose }) => {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(user?.uid || collaborators[0]?.uid || '');
    const [category, setCategory] = useState('一般');
    // 新增分攤方式狀態，預設為 'equal' (平均分攤)
    const [splitMethod, setSplitMethod] = useState('equal'); 

    const EXPENSE_CATEGORIES = ['餐飲', '交通', '住宿', '門票', '購物', '一般'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!description.trim() || amount <= 0 || !paidBy) {
            alert('請填寫所有必填欄位並確保金額大於零。');
            return;
        }

        const expenseAmount = parseFloat(amount);
        
        // ***********************************************
        // 計算分攤的成員和金額
        let splitWith;
        if (splitMethod === 'paid_by_only') {
            // 單人支付：只有支付者自己需要結算
            splitWith = [{ uid: paidBy, share: expenseAmount }];
        } else {
            // 平均分攤 (equal)：默認為所有協作者平均分攤
            const totalCollaborators = collaborators.length;
            const sharePerPerson = Math.round((expenseAmount / totalCollaborators) * 100) / 100; // 確保兩位小數
            splitWith = collaborators.map(c => ({ 
                uid: c.uid, 
                share: sharePerPerson 
            }));
            
            // 處理餘數，加到第一個成員上
            const remainder = expenseAmount - (sharePerPerson * totalCollaborators);
            if (remainder !== 0) {
                splitWith[0].share = Math.round((splitWith[0].share + remainder) * 100) / 100;
            }
        }
        // ***********************************************

        const newExpense = {
            id: uuidv4(),
            description,
            amount: expenseAmount,
            currency,
            paidBy,
            category,
            splitMethod, // 記錄分攤方式
            splitWith,   // 記錄分攤結果
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
        };

        try {
            const tripDocRef = doc(db, 'trips', tripId);
            await updateDoc(tripDocRef, {
                expenses: arrayUnion(newExpense)
            });
            onSave(newExpense);
            onClose();
        } catch (error) {
            console.error('新增支出失敗:', error);
            alert('新增支出失敗，請檢查網路。');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl text-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">新增旅行支出 ({currency})</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 描述 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">描述 (必填)</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
                        placeholder="午餐：壽司" />
                </div>

                {/* 金額 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">金額 (必填)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400" />
                </div>

                {/* 誰支付的 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">支付者 (必填)</label>
                    <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                        <option value="" disabled>請選擇支付者</option>
                        {collaborators.map(c => (
                            <option key={c.uid} value={c.uid}>{c.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* 費用分攤方式 (新增) */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">費用分攤方式</label>
                    <select value={splitMethod} onChange={(e) => setSplitMethod(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                        <option value="equal">平均分攤給所有人 ({collaborators.length} 人)</option>
                        <option value="paid_by_only">單人支付（費用由支付者自己負擔）</option>
                        {/* 可以後續擴展：按比例、指定金額等 */}
                    </select>
                </div>

                {/* 類別 */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">類別</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 font-medium active:scale-95 transition-transform">取消</button>
                    <button type="submit" className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-600 font-bold active:scale-95 transition-transform">
                        儲存支出
                    </button>
                </div>
            </form>
        </div>
    );
};
export default ExpenseForm;
