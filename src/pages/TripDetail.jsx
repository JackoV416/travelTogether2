import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 導入 deleteDoc, updateDoc, arrayUnion 等 Firestore 函式
import { doc, getDoc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import ExpenseForm from '../components/ExpenseForm'; 

const TripDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [balances, setBalances] = useState({}); // 儲存結算結果

    useEffect(() => {
        if (!user || !id) return;

        const fetchTripDetails = async () => {
            try {
                const docRef = doc(db, 'trips', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const tripData = { id: docSnap.id, ...docSnap.data() };
                    setTrip(tripData);
                    // 數據載入後立即計算餘額
                    setBalances(calculateBalances(tripData.members || [], tripData.expenses || []));
                } else {
                    console.error("找不到該行程文件！");
                    navigate('/');
                }
            } catch (error) {
                console.error("獲取行程詳情錯誤:", error);
            }
            setLoading(false);
        };

        fetchTripDetails();
        
        // 注意：這裡只做了單次獲取。在下一個階段可以替換成 onSnapshot 實時監聽，以確保多人協作時的即時性。
    }, [id, user, navigate]);


    // *** 結算邏輯核心函式 (功能 4 & 5) ***
    const calculateBalances = (members, expenses) => {
        const initialBalances = members.reduce((acc, m) => {
            acc[m.id] = { 
                name: m.name, 
                paid: 0, 
                owed: 0, 
                balance: 0 
            };
            return acc;
        }, {});

        expenses.forEach(expense => {
            const cost = expense.cost || 0;
            const paidById = expense.paidById;
            const sharedBy = expense.sharedBy || [];
            
            // 1. 記錄支付金額 (Paid)
            if (initialBalances[paidById]) {
                initialBalances[paidById].paid += cost;
            }

            // 2. 記錄應付金額 (Owed)
            if (sharedBy.length > 0) {
                const shareAmount = cost / sharedBy.length;
                sharedBy.forEach(memberId => {
                    if (initialBalances[memberId]) {
                        initialBalances[memberId].owed += shareAmount;
                    }
                });
            }
        });

        // 3. 計算最終餘額 (Balance = Paid - Owed)
        Object.values(initialBalances).forEach(member => {
            member.balance = member.paid - member.owed;
        });

        return initialBalances;
    };
    // **********************************
    
    // *** 刪除旅程函式 (新功能) ***
    const handleDeleteTrip = async () => {
        if (!trip) return;

        // 步驟 1: 確認刪除
        const isConfirmed = window.confirm(`您確定要永久刪除行程：「${trip.title}」嗎？此操作無法復原。`);
        
        if (isConfirmed) {
            try {
                // 步驟 2: 呼叫 Firestore 刪除 API
                const docRef = doc(db, 'trips', id);
                await deleteDoc(docRef);

                alert(`行程「${trip.title}」已成功刪除。`);
                
                // 步驟 3: 導航回行程列表
                navigate('/');
            } catch (error) {
                console.error("刪除行程錯誤:", error);
                alert("刪除行程失敗，請稍後再試。");
            }
        }
    };
    // **************************


    const handleAddExpense = async (newExpense) => {
        if (!trip) return;

        try {
            const tripRef = doc(db, 'trips', id);
            await updateDoc(tripRef, {
                expenses: arrayUnion(newExpense)
            });

            // 本地更新狀態
            const updatedExpenses = [...(trip.expenses || []), newExpense];
            const updatedTrip = { ...trip, expenses: updatedExpenses };
            setTrip(updatedTrip);
            // 立即重新計算結算結果
            setBalances(calculateBalances(trip.members || [], updatedExpenses));
            setShowExpenseForm(false); // 關閉表單
            
        } catch (error) {
            console.error("新增費用到 Firestore 錯誤:", error);
            alert("新增費用失敗，請檢查網路連接。");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">載入行程詳情...</div>;
    }

    if (!trip) {
        return <div className="min-h-screen bg-jp-bg flex items-center justify-center text-xl">行程不存在。</div>;
    }
    
    // 輔助函式：格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleDateString('zh-HK', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    // 輔助函式：格式化金額（為了相容舊數據，使用字串格式化，但建議使用 Intl.NumberFormat）
    const formatCurrency = (amount, currency = 'HKD') => {
        // 這裡暫時只做簡單的字串拼接，因為貨幣格式化需要引入更多邏輯
        // 建議在實際專案中使用 Intl.NumberFormat 實現完整的貨幣格式化
        const symbolMap = { 'HKD': 'HK$', 'USD': 'US$', 'JPY': '¥', 'TWD': 'NT$', 'EUR': '€' };
        const symbol = symbolMap[trip.currency] || '$';
        return `${symbol} ${Math.abs(amount).toFixed(2).toLocaleString()}`;
    };

    const memberMap = trip.members?.reduce((acc, m) => {
        acc[m.id] = m.name;
        return acc;
    }, {}) || {};

    const totalExpenses = trip.expenses?.reduce((sum, exp) => sum + exp.cost, 0) || 0;

    return (
        <div className="min-h-screen bg-jp-bg p-4 max-w-2xl mx-auto">

            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate('/')} className="text-black font-medium flex items-center">
                    &larr; 返回行程列表
                </button>
                {/* 刪除按鈕 */}
                <button 
                    onClick={handleDeleteTrip} 
                    className="text-sm text-white bg-gray-500 hover:bg-red-700 p-2 rounded-lg transition-colors"
                >
                    刪除旅程
                </button>
            </div>

            {/* 行程標題 */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
                <p className="text-gray-600">日期: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                <p className="text-gray-600 font-bold">
                    總預算: {formatCurrency(trip.budget || 0, trip.currency)}
                </p>
            </div>

            {/* 成員列表 */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-bold mb-3">旅行成員</h2>
                <ul className="list-disc list-inside space-y-1">
                    {trip.members?.map(member => (
                        <li key={member.id} className="text-gray-700">
                            {member.name}
                            {member.initialBudget > 0 && <span> (預算: {formatCurrency(member.initialBudget, trip.currency)})</span>}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 費用與結算區 (功能 4 & 5) */}
            <div className
