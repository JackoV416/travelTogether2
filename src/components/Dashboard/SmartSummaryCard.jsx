import React from 'react';
import { Calendar, CheckCircle, AlertTriangle, Plane, MapPin, ArrowRight, Package, FileText } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

/**
 * SmartSummaryCard - Displays a smart summary for a trip
 * Shows countdown, reminders, and quick actions.
 */
const SmartSummaryCard = ({ trip, onClick, isDarkMode }) => {
    const today = new Date();
    const startDate = trip.startDate ? parseISO(trip.startDate) : null;
    const daysLeft = startDate ? differenceInDays(startDate, today) : null;

    // Determine status
    let statusText = "";
    let statusColor = "";
    let urgent = false;

    if (!startDate) {
        statusText = "未定日期";
        statusColor = "text-gray-400";
    } else if (daysLeft < 0) {
        // Trip started or ended
        // Check end date
        const endDate = trip.endDate ? parseISO(trip.endDate) : null;
        if (endDate && differenceInDays(endDate, today) >= 0) {
            statusText = "旅程進行中! ✈️";
            statusColor = "text-green-500 animate-pulse";
            urgent = true;
        } else {
            statusText = "已結束";
            statusColor = "text-gray-400";
        }
    } else if (daysLeft === 0) {
        statusText = "今天出發! 🚀";
        statusColor = "text-pink-500 animate-bounce";
        urgent = true;
    } else if (daysLeft <= 7) {
        statusText = `倒數 ${daysLeft} 天`;
        statusColor = "text-red-500";
        urgent = true;
    } else {
        statusText = `還有 ${daysLeft} 天`;
        statusColor = "text-indigo-400";
    }

    // Reminders (Simulated logic for now based on timing)
    // V1.0.3: Sort by priority (urgency)
    let reminders = [];
    if (daysLeft > 0 && daysLeft <= 3) reminders.push({ text: "收拾行李", icon: Package, color: "text-red-500", priority: 1 });
    if (daysLeft > 0 && daysLeft <= 30 && !trip.insurance) reminders.push({ text: "購買保險", icon: AlertTriangle, color: "text-blue-500", priority: 3 });
    if (daysLeft > 0 && daysLeft <= 14) reminders.push({ text: "檢查簽證", icon: FileText, color: "text-amber-500", priority: 2 });

    // Sort by priority (lower = more urgent)
    reminders.sort((a, b) => a.priority - b.priority);

    // Fallback reminder if empty
    if (reminders.length === 0 && daysLeft > 0) {
        reminders.push({ text: "規劃行程", icon: MapPin, color: "text-indigo-400", priority: 10 });
    }

    // Background Image
    const bgImage = trip.thumbnail || `https://source.unsplash.com/800x600/?${trip.country || 'travel'}`;

    return (
        <div
            onClick={onClick}
            className={`relative min-w-[280px] w-[280px] h-[180px] rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
        >
            {/* Background Image with Gradient */}
            {/* Note: Unsplash uses data-saver mode if applicable, but card handles simple img src */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-gray-900 via-gray-900/60 to-transparent' : 'from-black/80 via-black/40 to-black/10'}`}></div>

            {/* Content */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-lg drop-shadow-md truncate max-w-[150px]">{trip.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-medium opacity-90 drop-shadow-md">
                            <MapPin className="w-3 h-3" /> {trip.country || '未知地點'}
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 ${statusColor}`}>
                        {statusText}
                    </div>
                </div>

                {/* Reminders Row */}
                <div className="space-y-2">
                    {reminders.length > 0 && (
                        <div className="flex gap-2 text-[10px] font-bold">
                            {reminders.slice(0, 2).map((r, i) => (
                                <div key={i} className="px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                    <r.icon className={`w-3 h-3 ${r.color}`} /> {r.text}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-end pt-1">
                        <div className="text-[10px] opacity-60">
                            {trip.startDate && trip.endDate ? `${trip.startDate} - ${trip.endDate}` : '日期待定'}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                            <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartSummaryCard;
