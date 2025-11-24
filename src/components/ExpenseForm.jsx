import React, { useState } from 'react';

const ExpenseForm = ({ members, onAddExpense, onClose }) => {
    const [cost, setCost] = useState('');
    const [description, setDescription] = useState('');
    const [paidById, setPaidById] = useState(members[0]?.id || ''); // 預設付款人
    const [sharedBy, setSharedBy] = useState(members.map(m => m.id)); // 預設所有人分攤

    const handleSharedChange = (memberId) => {
        if (sharedBy.includes(memberId)) {
            setSharedBy(sharedBy.filter(id => id !== memberId));
        } else {
            setSharedBy([...sharedBy, memberId]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (sharedBy.length === 0) {
            alert('請選擇至少一位分攤人。');
            return;
        }

        const newExpense = {
            id: Date.now(), // 臨時 ID
            cost: parseFloat(cost),
            description,
            paidById, // 付款人
            sharedBy, // 分攤人 ID 陣列
            createdAt: new Date().toISOString()
        };

        onAddExpense(newExpense); // 呼叫父組件的寫入 Firestore 函式
        onClose(); // 關閉表單
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4">新增支出</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. 費用金額 */}
                <input 
                    type="number" 
                    placeholder="金額 (必填)" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)} 
                    required 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                />

                {/* 2. 說明/用途 */}
                <input 
                    type="text" 
                    placeholder="用途/說明" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                />

                {/* 3. 誰支付 (Paid By) */}
                <div>
                    <label className="block text-sm font-medium mb-1">由誰支付？</label>
                    <select 
                        value={paidById} 
                        onChange={(e) => setPaidById(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 4. 分攤給誰 (Shared By) */}
                <div>
                    <label className="block text-sm font-medium mb-1">分攤給誰？</label>
                    <div className="flex flex-wrap gap-2">
                        {members.map(member => (
                            <label key={member.id} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-full cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={sharedBy.includes(member.id)}
                                    onChange={() => handleSharedChange(member.id)}
                                />
                                <span>{member.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 提交按鈕 */}
                <div className="flex space-x-4 pt-2">
                    <button 
                        type="submit" 
                        className="flex-1 bg-blue-600 text-white p-3 rounded-full font-medium shadow-md hover:bg-blue-700"
                    >
                        新增費用
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-1/4 bg-gray-300 text-black p-3 rounded-full font-medium"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;