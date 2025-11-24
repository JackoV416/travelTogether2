import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTrip = ({ onAddTrip }) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 呼叫 App.jsx 傳遞過來的 Firestore 寫入函式
        onAddTrip({ 
            title, 
            startDate, 
            endDate, 
            budget: parseInt(budget) 
        });

        // 寫入數據庫完成後，導航回首頁 (Home)
        navigate('/');
    };
    
    return (
        <div className="min-h-screen bg-jp-bg p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">新增旅行計畫</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 旅行標題 */}
                <input 
                    type="text" 
                    placeholder="旅行標題 (例如：京都賞楓之旅)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black"
                />
                
                {/* 開始日期 */}
                <div>
                    <label className="block text-sm font-medium mb-1">開始日期</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black"
                    />
                </div>
                
                {/* 結束日期 */}
                <div>
                    <label className="block text-sm font-medium mb-1">結束日期</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black"
                    />
                </div>
                
                {/* 預算 */}
                <input 
                    type="number" 
                    placeholder="總預算 (台幣或日圓)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                    className="w-full p-3 border-none rounded-lg focus:ring-2 focus:ring-black"
                />
                
                <button 
                    type="submit"
                    className="w-full bg-black text-white p-3 rounded-full font-medium mt-6 active:scale-95 transition-transform shadow-lg"
                >
                    創建計畫
                </button>
            </form>
            
            {/* 返回按鈕 */}
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
