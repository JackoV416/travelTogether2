import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#64748b'];

const CustomTooltip = ({ active, payload, isDarkMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-3 rounded-lg border shadow-xl text-xs backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-gray-900'}`}>
                <div className="font-bold mb-1">{payload[0].name}</div>
                <div>${payload[0].value.toLocaleString()}</div>
            </div>
        );
    }
    return null;
};

const BudgetCharts = ({ budget = [], currency = 'HKD', isDarkMode, glassCard }) => {
    // 1. Process Data for Category Pie Chart
    const categoryDataMap = budget.reduce((acc, item) => {
        const cat = item.category || 'misc';
        const cost = Number(item.cost) || 0;
        // Simple currency assumption: using raw cost. In real app might need conversion.
        acc[cat] = (acc[cat] || 0) + cost;
        return acc;
    }, {});

    const pieData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

    // 2. Process Data for Payer Bar Chart
    const payerDataMap = budget.reduce((acc, item) => {
        const payer = item.payer || 'Unknown';
        const cost = Number(item.cost) || 0;
        acc[payer] = (acc[payer] || 0) + cost;
        return acc;
    }, {});

    const barData = Object.entries(payerDataMap).map(([name, value]) => ({ name, value }));

    if (pieData.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart: Spending by Category */}
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <PieIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">支出類別分佈</h3>
                </div>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', opacity: 0.8 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-14">
                        <div className="text-center">
                            <div className="text-[10px] opacity-50 uppercase font-black">Total</div>
                            <div className="font-bold text-sm text-indigo-500 font-mono">
                                ${pieData.reduce((a, b) => a + b.value, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar Chart: Spending by Person */}
            <div className={`${glassCard(isDarkMode)} p-6 flex flex-col`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">各成員墊支總額</h3>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#4b5563' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#4b5563' }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <RechartsTooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{ fill: isDarkMode ? '#ffffff10' : '#00000005' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default BudgetCharts;
