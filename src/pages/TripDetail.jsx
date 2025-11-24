// src/pages/TripDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    }, [id, user, navigate]);


    // *** 輔助函式：專業貨幣格式化 (新版本) ***
    const formatCurrency = (amount, currency) => {
        const selectedCurrency = currency || 'HKD';
        
        // 根據貨幣調整小數點位數
        const minimumFractionDigits = (selectedCurrency === 'JPY' || selectedCurrency === 'TWD') ? 0 : 2;

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: selectedCurrency,
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    };
    // **********************************


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
            
            if (initialBalances[paidById]) {
                initialBalances[paidById].paid += cost;
            }

            if (sharedBy.length > 0) {
                const shareAmount = cost / sharedBy.length;
                sharedBy.forEach(memberId => {
                    if (initialBalances[memberId]) {
                        initialBalances[memberId].owed += shareAmount;
                    }
                });
            }
        });

        Object.values(initialBalances).forEach(member => {
            member.balance = member.paid - member.owed;
        });

        return initialBalances;
    };
    // **********************************
    
    // *** 刪除旅程函式 ***
    const handleDeleteTrip = async () => {
        if (!trip) return;

        const isConfirmed = window.confirm(`您確定要永久刪除行程：「${trip.title}」嗎？此操作無法復原。`);
        
        if (isConfirmed) {
            try {
                const docRef = doc(db, 'trips', id);
                await deleteDoc(docRef);

                alert(`行程「${trip.title}」已成功刪除。`);
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

            const updatedExpenses = [...(trip.expenses || []), newExpense];
            const updatedTrip = { ...trip, expenses: updatedExpenses };
            setTrip(updatedTrip);
            setBalances(calculateBalances(trip.members || [], updatedExpenses));
            setShowExpenseForm(false);
            
        } catch (error) {
            console.error("新增費用到 Firestore 錯誤:", error);
            alert("新增費用失敗，請檢查網路連接。");
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleDateString('zh-HK', { month: 'short', day: 'numeric', year: 'numeric' });
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
                {/* 顯示總預算，使用 formatCurrency */}
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
                            {/* 顯示個人預算，使用 formatCurrency */}
                            {member.initialBudget > 0 && <span> (預算: {formatCurrency(member.initialBudget, trip.currency)})</span>}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 費用與結算區 (功能 4 & 5) */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-bold mb-3">💸 費用追蹤與結算</h2>
                {/* 顯示總支出，使用 formatCurrency */}
                <p className="text-lg font-semibold mb-3">總支出: {formatCurrency(totalExpenses, trip.currency)}</p>

                {/* 顯示所有費用 */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto border-t pt-3">
                    {trip.expenses?.length > 0 ? (
                        trip.expenses.map((exp) => (
                            <div key={exp.id || Math.random()} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-medium">{exp.description}</p>
                                    <p className="text-sm text-gray-500">
                                        支付: {memberMap[exp.paidById]} /
                                        分攤: {exp.sharedBy.length} 人
                                    </p>
                                </div>
                                {/* 顯示單筆費用，使用 formatCurrency */}
                                <p className="font-bold text-red-600">-{formatCurrency(exp.cost, trip.currency)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">目前沒有費用記錄。</p>
                    )}
                </div>
                
                {/* 結算結果總覽 */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-xl font-bold mb-3">💰 誰欠誰？ (最終結算)</h3>
                    <div className="space-y-2">
                        {Object.values(balances).map(member => (
                            <div key={member.name} className="flex justify-between items-center text-lg">
                                <span className="font-medium">{member.name}</span>
                                {member.balance > 0 ? (
                                    <span className="text-green-600 font-bold">應收: +{formatCurrency(member.balance, trip.currency)}</span>
                                ) : member.balance < 0 ? (
                                    <span className="text-red-600 font-bold">應付: {formatCurrency(member.balance, trip.currency)}</span>
                                ) : (
                                    <span className="text-gray-500">已結清</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 按鈕：開啟費用表單 */}
                <button
                    onClick={() => setShowExpenseForm(true)}
                    className="w-full bg-red-500 text-white p-3 rounded-full font-medium active:scale-95 transition-transform mt-6"
                >
                    + 新增支出
                </button>
            </div>

            {/* 彈窗/表單：新增支出 */}
            {showExpenseForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <ExpenseForm
                        members={trip.members}
                        onAddExpense={handleAddExpense}
                        onClose={() => setShowExpenseForm(false)}
                    />
                </div>
            )}

            {/* 佔位符：航班資訊 */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-bold mb-3">✈️ 航班資訊</h2>
                <p className="text-gray-500">（待新增航班輸入表單）</p>
            </div>

            {/* TODO: AI 推薦按鈕 (功能 6) */}
            <button className="w-full bg-green-600 text-white p-3 rounded-full font-medium mt-6 active:scale-95 transition-transform shadow-lg">
                🤖 AI 推薦行程 (功能 6)
            </button>

        </div>
    );
};

export default TripDetail;
