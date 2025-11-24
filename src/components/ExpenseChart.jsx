// src/components/ExpenseChart.jsx

import React, { useMemo } from 'react';
// 引入 react-minimal-pie-chart
import { PieChart } from 'react-minimal-pie-chart'; 

// 預設的顏色列表，用於不同類別的支出
const CATEGORY_COLORS = {
    '餐飲': '#FF6384',
    '交通': '#36A2EB',
    '住宿': '#FFCD56',
    '門票': '#4BC0C0',
    '購物': '#9966FF',
    '一般': '#FF9F40',
};

const ExpenseChart = ({ expenses, currency, totalSpent }) => {
    
    // 透過 useMemo 計算各類別的支出和圓餅圖數據
    const chartData = useMemo(() => {
        if (!expenses || expenses.length === 0) {
            return { processedData: [], categoriesTotal: {} };
        }

        // 1. 計算各類別總額
        const categoriesTotal = expenses.reduce((acc, expense) => {
            const category = expense.category || '一般';
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
        }, {});

        // 2. 轉換為 PieChart 所需的格式
        const processedData = Object.keys(categoriesTotal).map(category => {
            const value = categoriesTotal[category];
            const percentage = (value / totalSpent) * 100;

            return {
                title: category,
                value: value,
                color: CATEGORY_COLORS[category] || '#CCCCCC', // 使用預設顏色，未匹配則用灰色
                percentage: percentage.toFixed(1) // 保持一位小數
            };
        });

        // 3. 按照金額降序排序
        processedData.sort((a, b) => b.value - a.value);

        return { processedData, categoriesTotal };

    }, [expenses, totalSpent]);

    if (totalSpent === 0 || chartData.processedData.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 text-center py-4">沒有支出數據可供分析。</p>;
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            
            {/* 圓餅圖 (左側) */}
            <div className="w-full md:w-1/2 max-w-xs h-40">
                <PieChart
                    data={chartData.processedData}
                    lineWidth={50} // 圓餅圖的厚度
                    paddingAngle={5} // 扇形間的間隔
                    rounded
                    label={({ dataEntry }) => `${dataEntry.percentage}%`} // 顯示百分比
                    labelStyle={{
                        fontSize: '6px',
                        fontFamily: 'sans-serif',
                        fill: '#fff',
                    }}
                    labelPosition={75} // 標籤的位置
                />
            </div>
            
            {/* 圖例與數據列表 (右側) */}
            <div className="w-full md:w-1/2 space-y-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">支出分佈 (共 {currency} {totalSpent.toLocaleString()})</h3>
                <ul className="space-y-1">
                    {chartData.processedData.map((dataEntry, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-2">
                                <span 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: dataEntry.color }}
                                ></span>
                                <span className="text-gray-800 dark:text-gray-100 font-medium">
                                    {dataEntry.title}
                                </span>
                            </div>
                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                                {dataEntry.value.toLocaleString()} ({dataEntry.percentage}%)
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExpenseChart;
