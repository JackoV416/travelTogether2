// src/pages/CreateTrip.jsx (請完整替換)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 導入 Firestore 相關函式
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 

// 固定的結算貨幣
const BASE_CURRENCY = 'HKD'; 
const AVAILABLE_CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR'];

// 簡化匯率表 (所有貨幣兌換 1 HKD 的值)
// 1 HKD = X YYY
const EXCHANGE_RATES = {
    'HKD': 1.0,  // HKD 兌 HKD
    'JPY': 19.5, // 假設 1 HKD = 19.5 JPY
    'USD': 0.13, // 假設 1 HKD = 0.13 USD
    'TWD': 4.1,  // 假設 1 HKD = 4.1 TWD
    'EUR': 0.12, // 假設 1 HKD = 0.12 EUR
};

// 輔助函式：將任何貨幣金額轉換為基礎結算貨幣 (HKD)
const convertToHKD = (amount, currency) => {
    if (!amount || !currency || currency === BASE_CURRENCY) {
        return amount || 0;
    }
    
    // 匯率定義為 "1 HKD 能換多少其他貨幣"
    // 因此，要將其他貨幣換成 HKD，需要 "其他貨幣金額 / 匯率"
    
    // 例如：100 JPY 轉換成 HKD = 100 / 19.5
    const rate = EXCHANGE_RATES[currency] || 1; // 找不到則視為 1:1
    
    // 將輸入貨幣轉換為 1 單位 HKD
    return amount / rate;
};


const CreateTrip = ({ onAddTrip, user }) => {
    const navigate = useNavigate();
    
    // 行程基本資訊狀態
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // 移除 [budget, setBudget]
    // 移除 [currency, setCurrency]

    // 成員資訊狀態 (確保初始化包含當前用戶)
    const [members, setMembers] = useState([
        { id: user.uid, name: user.displayName || 'Me', initialBudget: 0, budgetCurrency: BASE_CURRENCY }
    ]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberBudget, setNewMemberBudget] = useState(0);
    const [newMemberBudgetCurrency, setNewMemberBudgetCurrency] = useState(BASE_CURRENCY);


    // 成員管理邏輯
    const handleAddMember = (e) => {
        e.preventDefault();
        if (newMemberName.trim() === '' || members.some(m => m.name === newMemberName)) return;

        const newMember = {
            id: `guest-${Date.now()}`, 
            name: newMemberName.trim(),
            initialBudget: parseFloat(newMemberBudget) || 0,
            budgetCurrency: newMemberBudgetCurrency // 儲存成員預算的貨幣
        };
        setMembers([...members, newMember]);
        setNewMemberName('');
        setNewMemberBudget(0);
        setNewMemberBudgetCurrency(BASE_CURRENCY);
    };

    const handleBudgetChange = (id, newBudget, newCurrency) => {
        setMembers(members.map(member => 
            member.id === id 
                ? { 
                    ...member, 
                    initialBudget: parseFloat(newBudget) || 0,
                    budgetCurrency: newCurrency !== undefined ? newCurrency : member.budgetCurrency
                  } 
                : member
        ));
    };

    const handleRemoveMember = (id) => {
        setMembers(members.filter(m => m.id !== id));
    };


    // 成員搜尋邏輯 (與上次相同，但新增貨幣欄位)
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState([]); 

    const handleSearchUser = async (e) => {
        // ... (搜尋邏輯與上次相同) ...
        e.preventDefault();
        if (searchEmail.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', searchEmail.trim()));
            const querySnapshot = await getDocs(q);

            const foundUsers = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (!members.some(m => m.id === userData.uid)) {
                    foundUsers.push({
                        id: userData.uid,
                        name: userData.displayName,
                        email: userData.email,
                        initialBudget: 0,
                        budgetCurrency: BASE_CURRENCY // 預設為 HKD
                    });
                }
            });
            setSearchResults(foundUsers);

        } catch (error) {
            console.error('搜尋用戶錯誤:', error);
            setSearchResults([]);
        }
    };
    
    const handleAddFoundMember = (foundUser) => {
        setMembers([...members, foundUser]);
        setSearchEmail('');
        setSearchResults([]);
    };
    // ------------------------------------


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !startDate || !endDate) {
            alert('請填寫所有標記為必填的欄位。');
            return;
        }

        // *** 計算總預算 (新邏輯) ***
        let totalBudgetHKD = 0;
        members.forEach(member => {
            const budgetInHKD = convertToHKD(member.initialBudget, member.budgetCurrency);
            totalBudgetHKD += budgetInHKD;
        });
        // *************************

        const newTrip = {
            title,
            startDate,
            endDate,
            budget: totalBudgetHKD, // 儲存轉換後的 HKD 總預算
            currency: BASE_CURRENCY, // 結算貨幣固定為 HKD
            members, // 包含成員、個人預算和個人預算的貨幣
            ownerId: user.uid,
            createdAt: new Date().toISOString(),
            expenses: [],
            flights: []
        };
        
        await onAddTrip(newTrip); 
        navigate('/');
    };
    
    // 輔助函式：格式化金額 (僅用於顯示)
    const formatAmount = (amount, currency) => {
        const selectedCurrency = currency || BASE_CURRENCY;
        const minimumFractionDigits = (selectedCurrency === 'JPY' || selectedCurrency === 'TWD') ? 0 : 2;

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: selectedCurrency,
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    };


    return (
        <div className="min-h-screen bg-jp-bg p-4 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">新增旅行計畫</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg text-white">
                
                {/* 基本資訊 */}
                <input 
                    type="text" 
                    placeholder="旅行標題 (必填)" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                />
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                />
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                />
                
                {/* 移除總預算輸入欄位和貨幣選擇 */}


                {/* 旅行成員與預算 */}
                <h2 className="text-xl font-bold border-t border-gray-600 pt-4">旅行成員與預算</h2>
                <p className="text-sm text-gray-400">總結算貨幣: {BASE_CURRENCY}</p>
                {members.map(member => (
                    <div key={member.id} className="flex items-center space-x-2 bg-gray-700 p-3 rounded-lg">
                        <span className="font-medium flex-1">{member.name} {member.id === user.uid && '(我)'}</span>
                        <input
                            type="number"
                            placeholder="個人預算"
                            value={member.initialBudget}
                            onChange={(e) => handleBudgetChange(member.id, e.target.value)}
                            className="w-24 p-2 border border-gray-600 rounded-lg text-right bg-gray-600"
                        />
                        {/* 成員個人預算貨幣選擇 */}
                        <select 
                            value={member.budgetCurrency} 
                            onChange={(e) => handleBudgetChange(member.id, member.initialBudget, e.target.value)}
                            className="p-2 border border-gray-600 rounded-lg bg-gray-600"
                        >
                            {AVAILABLE_CURRENCIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {member.id !== user.uid && (
                            <button type="button" onClick={() => handleRemoveMember(member.id)} className="text-red-400 hover:text-red-500">
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                
                {/* 新增成員：非 Google 帳戶 */}
                <div className="pt-2 border-t border-gray-700">
                    <h3 className="text-lg font-bold mb-2">新增其他成員</h3>
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            placeholder="新成員姓名" 
                            value={newMemberName} 
                            onChange={(e) => setNewMemberName(e.target.value)} 
                            className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700"
                        />
                         <input 
                            type="number" 
                            placeholder="預算" 
                            value={newMemberBudget} 
                            onChange={(e) => setNewMemberBudget(e.target.value)} 
                            className="w-20 p-3 border border-gray-600 rounded-lg bg-gray-700"
                        />
                         <select 
                            value={newMemberBudgetCurrency} 
                            onChange={(e) => setNewMemberBudgetCurrency(e.target.value)}
                            className="p-3 border border-gray-600 rounded-lg bg-gray-700"
                        >
                            {AVAILABLE_CURRENCIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <button type="button" onClick={handleAddMember} className="w-full mt-2 bg-gray-600 text-white p-3 rounded-full font-medium hover:bg-gray-500">
                        + 新增其他成員 (非 Google 帳戶)
                    </button>
                </div>


                {/* Google 帳戶搜尋區塊 (與上次相同) */}
                <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-bold mb-2">邀請 Google 註冊用戶 (輸入 Email)</h3>
                    <form onSubmit={handleSearchUser} className="flex space-x-2">
                        <input 
                            type="email" 
                            placeholder="輸入用戶 Email 進行搜尋" 
                            value={searchEmail} 
                            onChange={(e) => setSearchEmail(e.target.value)} 
                            className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-700"
                        />
                        <button type="submit" className="bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700">
                            搜尋
                        </button>
                    </form>
                    
                    {/* 搜尋結果顯示 */}
                    <div className="mt-2 space-y-1">
                        {searchResults.map(user => (
                            <div key={user.id} className="flex justify-between items-center bg-green-900 p-2 rounded-lg">
                                <span>{user.name} ({user.email})</span>
                                <button 
                                    type="button" 
                                    onClick={() => handleAddFoundMember(user)} 
                                    className="text-green-300 font-bold ml-4"
                                >
                                    + 加入
                                </button>
                            </div>
                        ))}
                        {searchEmail && searchResults.length === 0 && (
                            <p className="text-sm text-gray-400">找不到該註冊用戶。</p>
                        )}
                    </div>
                </div>


                {/* 動作按鈕 */}
                <div className="pt-4 space-y-3">
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white p-3 rounded-full font-bold hover:bg-blue-700 active:scale-95 transition-transform"
                    >
                        創建計畫
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/')} 
                        className="w-full bg-gray-300 text-black p-3 rounded-full font-medium"
                    >
                        取消並返回
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTrip;
