// src/pages/CreateTrip.jsx - 最終版本 (支援 Light/Dark Mode)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // <-- 引入 Theme Context
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import BudgetCurrencySelector from '../components/BudgetCurrencySelector';
import InviteCollaborator from '../components/InviteCollaborator';

const CreateTrip = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toggleTheme, theme } = useTheme(); // <-- 引入主題切換

    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState('HKD');
    const [collaborators, setCollaborators] = useState([{ uid: user?.uid, name: user?.displayName || '我', budgetShare: 0, email: user?.email }]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberShare, setNewMemberShare] = useState(0);

    // 處理協作者預算份額變更
    const handleBudgetShareChange = (index, value) => { /* ... 保持不變 ... */ };
    // 新增非 Google 帳戶成員
    const handleAddNewMember = (e) => { /* ... 保持不變 ... */ };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !startDate || !endDate || budget <= 0) {
            alert('請填寫所有必填欄位：旅行標題、日期和總預算。');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('結束日期不能早於開始日期。');
            return;
        }

        try {
            const tripData = {
                title,
                startDate,
                endDate,
                totalBudget: parseFloat(budget),
                currency,
                ownerId: user.uid,
                collaborators: collaborators.map(c => ({
                    uid: c.uid,
                    name: c.name,
                    budgetShare: c.budgetShare,
                    email: c.email,
                })),
                expenses: [],
                itinerary: [],
                flights: [],
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, 'trips'), tripData);
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { trips: arrayUnion(docRef.id) });

            alert('旅行計畫創建成功！');
            navigate(`/trip/${docRef.id}`);

        } catch (error) {
            console.error('創建旅行計畫失敗:', error);
            alert('創建失敗，請稍後重試。');
        }
    };

    return (
        // 頁面背景：Threads 淺灰 / Dark Mode 深灰
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center p-4">
            {/* 卡片背景：白色 / 深灰，Threads 圓角風格 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                
                {/* 標題與切換按鈕 */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">新增旅行計畫</h1>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 旅行標題 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">旅行標題 (必填)</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                            // 統一的輸入框樣式
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 placeholder-gray-400 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="東京五日遊" />
                    </div>

                    {/* 日期選擇 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">開始日期 (必填)</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">結束日期 (必填)</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    {/* 總預算 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">總預算 (必填)</label>
                        <div className="flex">
                            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required min="1"
                                className="flex-grow p-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 placeholder-gray-400 text-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="例如: 10000" />
                            <BudgetCurrencySelector currency={currency} setCurrency={setCurrency}
                                className="p-3 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white" />
                        </div>
                    </div>

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
