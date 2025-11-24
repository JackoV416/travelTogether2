// src/pages/CreateTrip.jsx - 新增旅行計畫 (同時支援 Light/Dark 模式)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import BudgetCurrencySelector from '../components/BudgetCurrencySelector';
import InviteCollaborator from '../components/InviteCollaborator';
import { useTheme } from '../contexts/ThemeContext'; // <-- 引入 useTheme

const CreateTrip = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toggleTheme } = useTheme(); // <-- 獲取切換函式

    // ... (所有 state 定義) ...
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState('HKD');
    const [collaborators, setCollaborators] = useState([{ uid: user?.uid, name: user?.displayName || '我', budgetShare: 0, email: user?.email }]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberShare, setNewMemberShare] = useState(0);

    // ... (handleBudgetShareChange, handleAddNewMember, handleSubmit 函式保持不變) ...

    return (
        // 頁面背景：淺色/深色切換
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center p-4">
            {/* 卡片背景：淺色/深色切換 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                
                {/* 標題與切換按鈕 */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">新增旅行計畫</h1>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        主題切換
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 旅行標題 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">旅行標題 (必填)</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                            // 輸入框樣式同時支援兩模式
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 placeholder-gray-400 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="東京五日遊" />
                    </div>

                    {/* 日期選擇 (樣式同上) */}
                    {/* ... */}

                    {/* 總預算 (樣式同上) */}
                    {/* ... */}
                    
                    {/* 旅行成員與預算 */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">旅行成員與預算分攤</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">請設定每個成員需負擔的預算份額 (金額)。</p>

                        <div className="space-y-3">
                            {collaborators.map((member, index) => (
                                <div key={member.uid || index} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <span className="flex-grow text-gray-800 dark:text-white truncate">{member.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{currency}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={member.budgetShare}
                                        onChange={(e) => handleBudgetShareChange(index, e.target.value)}
                                        // 輸入框樣式
                                        className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-right text-gray-800 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 新增其他成員 (非 Google 帳戶) */}
                        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-3">新增其他成員 (非 Google 帳戶)</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="新成員姓名"
                                    className="col-span-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-800 dark:text-white placeholder-gray-400"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={newMemberShare}
                                    onChange={(e) => setNewMemberShare(e.target.value)}
                                    placeholder="預算份額"
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-right text-gray-800 dark:text-white"
                                />
                            </div>
                            <button type="button" onClick={handleAddNewMember}
                                className="w-full mt-3 p-2 border border-indigo-400 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors">
                                + 新增成員
                            </button>
                        </div>
                    </div>

                    {/* 邀請 Google 註冊用戶 (可選) */}
                    <InviteCollaborator tripId={null} currentCollaborators={collaborators} />

                    {/* 創建按鈕 */}
                    <div className="pt-6 space-y-3">
                        <button type="submit"
                            className="w-full p-4 bg-indigo-600 dark:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-transform">
                            創建計畫
                        </button>
                        <button type="button" onClick={() => navigate('/')}
                            className="w-full p-4 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-full hover:bg-gray-400 dark:hover:bg-gray-500">
                            取消並返回
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrip;
