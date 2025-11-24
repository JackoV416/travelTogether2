import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; // 確保路徑正確

const TripDetail = ({ user }) => {
    const { id } = useParams(); // 獲取 URL 中的行程 ID
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) return;

        const fetchTripDetails = async () => {
            try {
                const docRef = doc(db, 'trips', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTrip({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("找不到該行程文件！");
                    navigate('/'); // 找不到則返回首頁
                }
            } catch (error) {
                console.error("獲取行程詳情錯誤:", error);
            }
            setLoading(false);
        };

        fetchTripDetails();
    }, [id, user, navigate]);

    if (loading) {
        return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">載入行程詳情...</div>;
    }

    if (!trip) {
        return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">行程不存在。</div>;
    }

    // 格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleDateString('zh-HK', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-jp-bg p-4 max-w-2xl mx-auto">
            
            {/* 頂部導航 */}
            <button onClick={() => navigate('/')} className="text-black font-medium mb-4 flex items-center">
                &larr; 返回行程列表
            </button>

            {/* 行程標題 */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
                <p className="text-gray-600">
                    日期: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <p className="text-gray-600">總預算: {trip.budget ? trip.budget.toLocaleString() : 'N/A'}</p>
            </div>
            
            {/* 成員列表 (功能 3) */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-bold mb-3">旅行成員 ({trip.members?.length || 0}人)</h2>
                <ul className="list-disc list-inside space-y-1">
                    {trip.members?.map(member => (
                        <li key={member.id} className="text-gray-700">
                            {member.name} 
                            {member.initialBudget > 0 && <span> (個人預算: {member.initialBudget.toLocaleString()})</span>}
                            {member.id === user.uid && <span className="text-blue-500 ml-2">(您)</span>}
                        </li>
                    ))}
                </ul>
            </div>

            {/* TODO: 航班資訊區 (功能 1 & 2) */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-bold mb-3">航班資訊</h2>
                {/* 接下來將在這裡添加航班輸入/顯示組件 */}
                <p className="text-gray-500">（待新增航班輸入表單）</p>
            </div>

            {/* TODO: 費用與結算區 (功能 4 & 5) */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-bold mb-3">費用結算</h2>
                {/* 接下來將在這裡添加費用輸入/結算組件 */}
                <p className="text-gray-500">（待新增費用輸入表單與結算結果）</p>
            </div>

            {/* TODO: AI 推薦按鈕 (功能 6) */}
            <button className="w-full bg-green-600 text-white p-3 rounded-full font-medium mt-6 active:scale-95 transition-transform shadow-lg">
                🤖 AI 推薦行程 (功能 6)
            </button>

        </div>
    );
};

export default TripDetail;
