import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 接收 user prop 以獲取當前用戶資訊
const CreateTrip = ({ onAddTrip, user }) => { 
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    
    // *** 新增：成員狀態 (預設包含當前用戶) ***
    const [members, setMembers] = useState([
        { id: user.uid, name: user.displayName || 'Me', initialBudget: 0 }
    ]);

    const navigate = useNavigate();

    // 處理新增/移除成員的函式
    const handleMemberChange = (id, field, value) => {
        setMembers(members.map(member => 
            member.id === id ? { ...member, [field]: value } : member
        ));
    };

    const addMemberField = () => {
        setMembers([
            ...members, 
            { id: Date.now(), name: '', initialBudget: 0 } // 使用 Date.now() 作為臨時 ID
        ]);
    };

    const removeMemberField = (id) => {
        setMembers(members.filter(member => member.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 確保至少有一個成員
        const validMembers = members.filter(m => m.name.trim() !== '');
        if (validMembers.length === 0) {
            alert('請至少新增一位旅行成員。');
            return;
        }

        onAddTrip({ 
            title, 
            startDate, 
            endDate, 
            budget: parseInt(budget),
            members: validMembers // 傳送成員列表
        });

        navigate('/');
    };
    
    return (
        <div className="min-h-screen bg-jp-bg p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">新增旅行計畫</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 基礎資訊 */}
                <input type="text" placeholder="旅行標題" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black" />
                
                <div>
                    <label className="block text-sm font-medium mb-1">開始日期</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">結束日期</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black" />
                </div>
                
                <input type="number" placeholder="總預算 (USD/TWD/JPY)" value={budget} onChange={(e) => setBudget(e.target.value)} required className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black" />
                
                {/* *** 成員列表輸入區 (功能 3 & 5) *** */}
                <h2 className="text-xl font-bold pt-4 border-t border-gray-300">旅行成員與預算</h2>
                <div className="space-y-3">
                    {members.map((member, index) => (
                        <div key={member.id} className="flex space-x-2 items-center bg-white p-2 rounded-lg shadow-sm">
                            {/* 姓名輸入 */}
                            <input 
                                type="text"
                                placeholder="成員姓名"
                                value={member.name}
                                onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                                required
                                readOnly={member.id === user.uid} // 創建者姓名不可修改
                                className={`flex-1 p-2 border-none rounded-lg ${member.id === user.uid ? 'bg-gray-100' : ''}`}
                            />
                            
                            {/* 預算輸入 */}
                            <input 
                                type="number"
                                placeholder="個人預算"
                                value={member.initialBudget}
                                onChange={(e) => handleMemberChange(member.id, 'initialBudget', parseInt(e.target.value) || 0)}
                                className="w-24 p-2 border-none rounded-lg"
                            />
                            
                            {/* 移除按鈕 */}
                            {member.id !== user.uid && (
                                <button 
                                    type="button" 
                                    onClick={() => removeMemberField(member.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <button 
                    type="button"
                    onClick={addMemberField}
                    className="w-full text-black p-3 rounded-full font-medium border border-gray-300 active:scale-95 transition-transform"
                >
                    + 新增其他成員
                </button>
                {/* ************************************************** */}


                <button 
                    type="submit"
                    className="w-full bg-black text-white p-3 rounded-full font-medium mt-6 active:scale-95 transition-transform shadow-lg"
                >
                    創建計畫
                </button>
            </form>
            
            <button
                onClick={() => navigate('/')}
                className="w-full text-black p-3 rounded-full font-medium mt-4 border border-gray-300 active:scale-95 transition-transform"
            >
                取消並返回
            </button>
        </div>
    );
};

export default CreateTrip;
