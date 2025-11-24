import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CURRENCIES = ['HKD', 'JPY', 'USD', 'TWD', 'EUR']; // 可選貨幣列表

const CreateTrip = ({ onAddTrip, user }) => {
    const navigate = useNavigate();
    
    // 行程基本資訊狀態
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState('HKD'); // *** 新增貨幣狀態，預設 HKD ***

    // 成員資訊狀態 (確保初始化包含當前用戶)
    const [members, setMembers] = useState([
        { id: user.uid, name: user.displayName || 'Me', initialBudget: 0 }
    ]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberBudget, setNewMemberBudget] = useState(0);

    const handleAddMember = (e) => {
        e.preventDefault();
        if (newMemberName.trim() === '' || members.some(m => m.name === newMemberName)) return;

        // 注意：這裡我們使用隨機 ID 作為非 Google 帳戶成員的臨時 ID
        const newMember = {
            id: `guest-${Date.now()}`, 
            name: newMemberName.trim(),
            initialBudget: parseFloat(newMemberBudget) || 0
        };
        setMembers([...members, newMember]);
        setNewMemberName('');
        setNewMemberBudget(0);
    };

    const handleBudgetChange = (id, newBudget) => {
        setMembers(members.map(member => 
            member.id === id 
                ? { ...member, initialBudget: parseFloat(newBudget) || 0 } 
                : member
        ));
    };

    const handleRemoveMember = (id) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 基本驗證
        if (!title || !startDate || !endDate || !budget) {
            alert('請填寫所有標記為必填的欄位。');
            return;
        }

        const newTrip = {
            title,
            startDate,
            endDate,
            budget: parseFloat(budget),
            currency, // *** 將貨幣寫入 Firestore ***
            members, // 包含成員和個人預算
            ownerId: user.uid,
            createdAt: new Date().toISOString(),
            expenses: [], // 初始化費用陣列
            flights: [] // 初始化航班陣列
        };
        
        await onAddTrip(newTrip); // 呼叫 App.jsx 中的新增函式
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-jp-bg p-4 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">新增旅行計畫</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
                
                {/* 基本資訊 */}
                <input 
                    type="text" 
                    placeholder="旅行標題 (必填)" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
                
                {/* 預算與貨幣選擇 */}
                <div className="flex space-x-2">
                    <input 
                        type="number" 
                        placeholder="總預算 (必填)" 
                        value={budget} 
                        onChange={(e) => setBudget(e.target.value)} 
                        className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {/* *** 貨幣選擇器 *** */}
                    <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                        {CURRENCIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>


                {/* 旅行成員與預算 */}
                <h2 className="text-xl font-bold border-t pt-4">旅行成員與預算</h2>
                {members.map(member => (
                    <div key={member.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium flex-1">{member.name} {member.id === user.uid && '(我)'}</span>
                        <input
                            type="number"
                            placeholder="個人預算"
                            value={member.initialBudget}
                            onChange={(e) => handleBudgetChange(member.id, e.target.value)}
                            className="w-24 p-2 border rounded-lg text-right"
                        />
                        {member.id !== user.uid && (
                            <button type="button" onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700">
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                
                {/* 新增成員表單 */}
                <div className="pt-2">
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            placeholder="新成員姓名" 
                            value={newMemberName} 
                            onChange={(e) => setNewMemberName(e.target.value)} 
                            className="flex-grow p-3 border rounded-lg"
                        />
                         <input 
                            type="number" 
                            placeholder="預算" 
                            value={newMemberBudget} 
                            onChange={(e) => setNewMemberBudget(e.target.value)} 
                            className="w-24 p-3 border rounded-lg"
                        />
                    </div>
                    <button type="button" onClick={handleAddMember} className="w-full mt-2 bg-gray-200 text-gray-700 p-3 rounded-full font-medium hover:bg-gray-300">
                        + 新增其他成員 (非 Google 帳戶)
                    </button>
                    {/* 這裡將是階段二：Google 帳戶成員搜尋 */}
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
