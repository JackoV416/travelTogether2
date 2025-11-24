// src/pages/CreateTrip.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// 貨幣定義 (必須與 TripDetail 保持一致)
const AVAILABLE_CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR'];

const CreateTrip = ({ user, allUsers }) => {
    const navigate = useNavigate();

    // 預設成員：登入用戶
    const defaultMember = {
        id: user.uid,
        name: user.displayName + ' (我)',
        initialBudget: 0, // 個人預算
        budgetCurrency: 'HKD' // 個人預算貨幣
    };

    // 表單狀態
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // 成員管理
    const [members, setMembers] = useState([defaultMember]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberBudget, setNewMemberBudget] = useState(0);
    const [newMemberCurrency, setNewMemberCurrency] = useState('HKD');
    
    // Google 用戶邀請 (簡化為 Email 輸入)
    const [inviteEmail, setInviteEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null); // 搜尋到的用戶

    // 函式: 搜尋 Google 註冊用戶
    const handleSearchUser = () => {
        const foundUser = allUsers.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
        
        if (foundUser) {
            // 檢查是否已在成員列表中
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

    // 函式: 新增搜尋到的 Google 用戶
    const handleAddGoogleUser = () => {
        if (searchResult && searchResult.uid) {
            const newGoogleMember = {
                id: searchResult.uid,
                name: searchResult.displayName,
                initialBudget: 0,
                budgetCurrency: 'HKD',
                isGoogleUser: true // 標記為 Google 邀請用戶
            };
            setMembers(prev => [...prev, newGoogleMember]);
            setInviteEmail('');
            setSearchResult(null);
        }
    };

    // 函式: 新增非 Google 帳戶成員
    const handleAddNewMember = () => {
        if (newMemberName.trim() && newMemberBudget >= 0) {
            const newNonGoogleMember = {
                id: uuidv4(), // 使用 UUID 作為非 Google 帳戶的 ID
                name: newMemberName.trim(),
                initialBudget: parseFloat(newMemberBudget),
                budgetCurrency: newMemberCurrency
            };
            setMembers(prev => [...prev, newNonGoogleMember]);
            // 重置輸入欄位
            setNewMemberName('');
            setNewMemberBudget(0);
            setNewMemberCurrency('HKD');
        } else {
            alert('請輸入有效的成員名稱和預算 (>= 0)');
        }
    };

    // 函式: 移除成員
    const handleRemoveMember = (id) => {
        // 登入者不能移除
        if (id !== user.uid) { 
            setMembers(prev => prev.filter(member => member.id !== id));
        } else {
            alert('您不能移除自己！');
        }
    };

    // 函式: 更新成員個人預算 (包括登入者)
    const handleUpdateBudget = (id, newBudget, newCurrency) => {
        setMembers(prev => prev.map(member => 
            member.id === id 
                ? { ...member, initialBudget: parseFloat(newBudget), budgetCurrency: newCurrency } 
                : member
        ));
    };

    // 函式: 提交表單
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
                // 注意: 這裡不再有單一的 totalBudget 欄位，它由 members 匯總計算
                ownerId: user.uid,
                members, // 包含個人預算和貨幣
                expenses: [], // 費用追蹤
                itinerary: [], // 行程規劃
                flightInfo: null, // 航班資訊 (新功能)
                createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'trips', newTripId), newTrip);
            alert('旅行計畫創建成功！');
            navigate(`/trip/${newTripId}`); // 導向新創建的行程詳情頁
        } catch (error) {
            console.error('創建旅行計畫失敗:', error);
            alert('創建旅行計畫失敗，請檢查網路或權限。');
        }
    };
    
    // 渲染
    return (
        // ********************** 暗黑模式修正: bg-gray-900 **********************
        <div className="min-h-screen bg-gray-900 p-4 max-w-lg mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">新增旅行計畫</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg">
                
                {/* 旅行標題 */}
                <input
                    type="text"
                    placeholder="旅行標題 (必填)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    required
                />
                
                {/* 開始/結束日期 */}
                <div className="flex space-x-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                        required
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                        required
                    />
                </div>

                {/* 旅行成員與個人預算區塊 */}
                <div className="border border-gray-700 p-4 rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold text-white">旅行成員與個人預算</h2>
                    <p className="text-sm text-gray-400">總結算貨幣: HKD</p>

                    {/* 現有成員列表 (包括登入用戶) */}
                    <div className="space-y-3">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center space-x-2 bg-gray-700 p-3 rounded-lg">
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
                                
                                {/* 移除按鈕 (登入者不能移除) */}
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
                    <div className="pt-4 border-t border-gray-700 space-y-3">
                        <h3 className="text-lg font-medium text-white">新增其他成員</h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="新成員姓名"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                            />
                            <input
                                type="number"
                                placeholder="預算"
                                value={newMemberBudget}
                                onChange={(e) => setNewMemberBudget(e.target.value)}
                                className="w-20 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white text-right"
                                min="0"
                                step="0.01"
                            />
                            <select
                                value={newMemberCurrency}
                                onChange={(e) => setNewMemberCurrency(e.target.value)}
                                className="p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                            >
                                {AVAILABLE_CURRENCIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddNewMember}
                            className="w-full bg-yellow-600 text-white p-3 rounded-full font-medium hover:bg-yellow-700"
                        >
                            + 新增其他成員
                        </button>
                    </div>

                    {/* --- 邀請 Google 註冊用戶 (可選) --- */}
                    <div className="pt-4 border-t border-gray-700 space-y-3">
                        <h3 className="text-lg font-medium text-white">邀請 Google 註冊用戶</h3>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                placeholder="輸入用戶 Email 進行搜索"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700 text-white"
                            />
                            <button
                                type="button"
                                onClick={handleSearchUser}
                                className="bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700"
                            >
                                搜索
                            </button>
                        </div>

                        {/* 搜尋結果顯示 */}
                        {searchResult && searchResult.uid && (
                            <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-white">找到用戶: {searchResult.displayName} ({searchResult.email})</span>
                                <button
                                    type="button"
                                    onClick={handleAddGoogleUser}
                                    className="bg-blue-600 text-white p-2 rounded-lg text-sm hover:bg-blue-700"
                                >
                                    加入計畫
                                </button>
                            </div>
                        )}
                        {searchResult && searchResult.error && (
                            <p className="text-red-400 text-sm">{searchResult.error}</p>
                        )}
                    </div>
                </div>


                {/* 創建按鈕 */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-full font-bold hover:bg-blue-700 active:scale-95 transition-transform"
                >
                    創建計畫
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-600 text-white p-3 rounded-full font-medium hover:bg-gray-500"
                >
                    取消並返回
                </button>
            </form>
        </div>
    );
};

export default CreateTrip;
