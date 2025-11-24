// src/pages/CreateTrip.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const AVAILABLE_CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR'];

const CreateTrip = ({ user, allUsers = [] }) => {
    const navigate = useNavigate();

    const defaultMember = {
        id: user.uid,
        name: user.displayName + ' (我)',
        initialBudget: 0,
        budgetCurrency: 'HKD'
    };

    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [members, setMembers] = useState([defaultMember]);
    
    // 非 Google 帳戶成員輸入
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberBudget, setNewMemberBudget] = useState(0);
    const [newMemberCurrency, setNewMemberCurrency] = useState('HKD');
    
    // Google 用戶邀請 (簡化為 Email 輸入)
    const [inviteEmail, setInviteEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null); 

    const handleSearchUser = () => {
        const foundUser = allUsers.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
        
        if (foundUser) {
            const isAlreadyMember = members.some(m => m.id === foundUser.uid);
            if (!isAlreadyMember) {
                setSearchResult(foundUser);
            } else {
                setSearchResult({ error: '該用戶已在成員列表中' });
            }
        } else {
            setSearchResult({ error: '找不到該 Google 註冊用戶' });
        }
    };

    const handleAddGoogleUser = () => {
        if (searchResult && searchResult.uid) {
            const newGoogleMember = {
                id: searchResult.uid,
                name: searchResult.displayName,
                initialBudget: 0,
                budgetCurrency: 'HKD',
                isGoogleUser: true
            };
            setMembers(prev => [...prev, newGoogleMember]);
            setInviteEmail('');
            setSearchResult(null);
        }
    };

    const handleAddNewMember = () => {
        if (newMemberName.trim() && newMemberBudget >= 0) {
            const newNonGoogleMember = {
                id: uuidv4(),
                name: newMemberName.trim(),
                initialBudget: parseFloat(newMemberBudget),
                budgetCurrency: newMemberCurrency
            };
            setMembers(prev => [...prev, newNonGoogleMember]);
            setNewMemberName('');
            setNewMemberBudget(0);
            setNewMemberCurrency('HKD');
        } else {
            alert('請輸入有效的成員名稱和預算 (>= 0)');
        }
    };

    const handleRemoveMember = (id) => {
        if (id !== user.uid) { 
            setMembers(prev => prev.filter(member => member.id !== id));
        } else {
            alert('您不能移除自己！');
        }
    };

    const handleUpdateBudget = (id, newBudget, newCurrency) => {
        setMembers(prev => prev.map(member => 
            member.id === id 
                ? { ...member, initialBudget: parseFloat(newBudget), budgetCurrency: newCurrency } 
                : member
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !startDate || !endDate || members.length === 0) {
            alert('請填寫所有必填欄位並確保至少有一位成員。');
            return;
        }

        try {
            const newTripId = uuidv4();
            const newTrip = {
                id: newTripId,
                title,
                startDate,
                endDate,
                ownerId: user.uid,
                members,
                expenses: [],
                itinerary: [],
                flightInfo: null, 
                createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'trips', newTripId), newTrip);
            alert('旅行計畫創建成功！');
            navigate(`/trip/${newTripId}`);
        } catch (error) {
            console.error('創建旅行計畫失敗:', error);
            alert('創建旅行計畫失敗，請檢查網路或權限。');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 p-4 max-w-lg mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">新增旅行計畫</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-3xl shadow-2xl">
                
                {/* 旅行標題 */}
                <input
                    type="text"
                    placeholder="旅行標題 (必填)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 border border-gray-700 rounded-xl bg-gray-700 text-white placeholder-gray-400"
                    required
                />
                
                {/* 開始/結束日期 */}
                <div className="flex space-x-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-4 border border-gray-700 rounded-xl bg-gray-700 text-white"
                        required
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-4 border border-gray-700 rounded-xl bg-gray-700 text-white"
                        required
                    />
                </div>

                {/* 旅行成員與個人預算區塊 */}
                <div className="border border-indigo-500 p-4 rounded-xl space-y-4 bg-gray-700">
                    <h2 className="text-xl font-semibold text-indigo-400">👤 旅行成員與個人預算</h2>
                    <p className="text-sm text-gray-400">結算基準貨幣: HKD</p>

                    {/* 現有成員列表 */}
                    <div className="space-y-3">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center space-x-2 bg-gray-800 p-3 rounded-xl">
                                <span className="flex-grow">{member.name}</span>
                                
                                {/* 預算輸入 */}
                                <input
                                    type="number"
                                    value={member.initialBudget}
                                    onChange={(e) => handleUpdateBudget(member.id, e.target.value, member.budgetCurrency)}
                                    className="w-20 p-2 border border-gray-600 rounded-lg bg-gray-600 text-white text-right"
                                    min="0"
                                    step="0.01"
                                />
                                {/* 貨幣選擇 */}
                                <select
                                    value={member.budgetCurrency}
                                    onChange={(e) => handleUpdateBudget(member.id, member.initialBudget, e.target.value)}
                                    className="p-2 border border-gray-600 rounded-lg bg-gray-600 text-white"
                                >
                                    {AVAILABLE_CURRENCIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                
                                {member.id !== user.uid && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-400 hover:text-red-300 ml-2"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* --- 新增其他成員 (非 Google 帳戶) --- */}
                    <div className="pt-4 border-t border-gray-600 space-y-3">
                        <h3 className="text-lg font-medium text-white">新增其他成員</h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="新成員姓名"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="flex-grow p-3 border border-gray-600 rounded-xl bg-gray-800 text-white"
                            />
                            <input
                                type="number"
                                placeholder="預算"
                                value={newMemberBudget}
                                onChange={(e) => setNewMemberBudget(e.target.value)}
                                className="w-20 p-3 border border-gray-600 rounded-xl bg-gray-800 text-white text-right"
                                min="0"
                                step="0.01"
                            />
                            <select
                                value={newMemberCurrency}
                                onChange={(e) => setNewMemberCurrency(e.target.value)}
                                className="p-3 border border-gray-600 rounded-xl bg-gray-800 text-white"
                            >
                                {AVAILABLE_CURRENCIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddNewMember}
                            className="w-full bg-yellow-600 text-white p-3 rounded-full font-medium hover:bg-yellow-700 active:scale-95 transition-transform"
                        >
                            + 新增其他成員
                        </button>
                    </div>
                </div>


                {/* 創建按鈕 */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-4 rounded-full font-bold text-lg hover:bg-blue-700 active:scale-95 transition-transform shadow-md"
                >
                    創建計畫
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-600 text-white p-4 rounded-full font-medium hover:bg-gray-500 active:scale-95 transition-transform"
                >
                    取消並返回
                </button>
            </form>
        </div>
    );
};

export default CreateTrip;
