// src/pages/CreateTrip.jsx - 新增旅行計畫

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import BudgetCurrencySelector from '../components/BudgetCurrencySelector';
import InviteCollaborator from '../components/InviteCollaborator';

const CreateTrip = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState('HKD');
    const [collaborators, setCollaborators] = useState([{ uid: user?.uid, name: user?.displayName || 'Jamie Kwok (我)', budgetShare: 0, email: user?.email }]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberShare, setNewMemberShare] = useState(0);

    // 處理協作者預算份額變更
    const handleBudgetShareChange = (index, value) => {
        const newCollaborators = [...collaborators];
        newCollaborators[index].budgetShare = parseFloat(value) || 0;
        setCollaborators(newCollaborators);
    };

    // 新增非 Google 帳戶成員
    const handleAddNewMember = (e) => {
        e.preventDefault();
        if (newMemberName.trim() && newMemberShare >= 0) {
            setCollaborators(prev => [
                ...prev,
                {
                    uid: `local-${Date.now()}`,
                    name: newMemberName.trim(),
                    budgetShare: parseFloat(newMemberShare) || 0,
                    email: null, // 非 Google 帳戶
                }
            ]);
            setNewMemberName('');
            setNewMemberShare(0);
        }
    };

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
            // 1. 創建 Trip 文件
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
                itinerary: [], // 新增行程欄位
                flights: [], // 新增航班欄位
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, 'trips'), tripData);

            // 2. 更新 User 的 trips 列表 (假設 user 集合存在)
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                trips: arrayUnion(docRef.id)
            });

            alert('旅行計畫創建成功！');
            navigate(`/trip/${docRef.id}`);

        } catch (error) {
            console.error('創建旅行計畫失敗:', error);
            alert('創建失敗，請稍後重試。');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-start justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-2xl shadow-2xl text-white">
                <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-400">新增旅行計畫</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 旅行標題 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">旅行標題 (必填)</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="東京五日遊" />
                    </div>

                    {/* 日期選擇 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">開始日期 (必填)</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                                className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">結束日期 (必填)</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                                className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    {/* 總預算 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">總預算 (必填)</label>
                        <div className="flex">
                            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required min="1"
                                className="flex-grow p-3 border border-r-0 border-gray-600 rounded-l-xl bg-gray-700 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="例如: 10000" />
                            <BudgetCurrencySelector currency={currency} setCurrency={setCurrency}
                                className="p-3 border border-gray-600 rounded-r-xl bg-gray-600 text-white" />
                        </div>
                    </div>

                    {/* 旅行成員與預算 */}
                    <div className="pt-4 border-t border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-indigo-400">旅行成員與預算分攤</h2>
                        <p className="text-sm text-gray-400 mb-4">請設定每個成員需負擔的預算份額 (金額)。</p>

                        <div className="space-y-3">
                            {collaborators.map((member, index) => (
                                <div key={member.uid || index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-xl">
                                    <span className="flex-grow text-white truncate">{member.name}</span>
                                    <span className="text-gray-400">{currency}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={member.budgetShare}
                                        onChange={(e) => handleBudgetShareChange(index, e.target.value)}
                                        className="w-24 p-2 border border-gray-600 rounded-lg bg-gray-600 text-right text-white"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 新增其他成員 (非 Google 帳戶) */}
                        <div className="mt-6 p-4 bg-gray-700 rounded-xl">
                            <h3 className="font-semibold text-gray-300 mb-3">新增其他成員 (非 Google 帳戶)</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="新成員姓名"
                                    className="col-span-2 p-2 border border-gray-600 rounded-lg bg-gray-600 text-white placeholder-gray-400"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={newMemberShare}
                                    onChange={(e) => setNewMemberShare(e.target.value)}
                                    placeholder="預算份額"
                                    className="p-2 border border-gray-600 rounded-lg bg-gray-600 text-right text-white"
                                />
                            </div>
                            <button type="button" onClick={handleAddNewMember}
                                className="w-full mt-3 p-2 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-900 transition-colors">
                                + 新增成員
                            </button>
                        </div>
                    </div>

                    {/* 邀請 Google 註冊用戶 (可選) */}
                    <InviteCollaborator tripId={null} currentCollaborators={collaborators} />

                    {/* 創建按鈕 */}
                    <div className="pt-6 space-y-3">
                        <button type="submit"
                            className="w-full p-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-transform">
                            創建計畫
                        </button>
                        <button type="button" onClick={() => navigate('/')}
                            className="w-full p-4 bg-gray-600 text-white font-bold rounded-full hover:bg-gray-500">
                            取消並返回
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrip;
