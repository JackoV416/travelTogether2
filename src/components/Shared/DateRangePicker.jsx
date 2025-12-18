import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, isAfter, isBefore, isValid } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const DateRangePicker = ({
    startDate,
    endDate,
    onSelect,
    isDarkMode = true,
    placeholder = "選擇日期範圍",
    minDate // 唔設預設值，喺下面處理
}) => {
    // 確保 minDate 只係日期部分（去掉時間）
    const getMinDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return minDate || today;
    };
    const disabledDays = { before: getMinDate() };

    const [isOpen, setIsOpen] = useState(false);

    // 確保初始值冇任何選中（空字串同 null/undefined 都唔應該有 default 選中）
    const parseDate = (dateStr) => {
        if (!dateStr || dateStr === '' || dateStr === null || dateStr === undefined) return undefined;
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? undefined : parsed;
    };

    // 用 useMemo 確保 initial state 唔會被重複計算
    const initialFrom = parseDate(startDate);
    const initialTo = parseDate(endDate);


    const [range, setRange] = useState({
        from: initialFrom,
        to: initialTo
    });



    const handleSelect = (selectedRange) => {
        setRange(selectedRange || { from: undefined, to: undefined });

        // 只有喺揀咗兩個唔同日期時先 auto-close
        if (selectedRange?.from && selectedRange?.to) {
            const fromTime = selectedRange.from.getTime();
            const toTime = selectedRange.to.getTime();

            // 確保係真正揀咗兩個日期（唔係同一日）
            if (fromTime !== toTime) {
                onSelect({
                    startDate: format(selectedRange.from, 'yyyy-MM-dd'),
                    endDate: format(selectedRange.to, 'yyyy-MM-dd')
                });
                // Auto close after selecting both different dates
                setTimeout(() => setIsOpen(false), 300);
            } else {
                // 如果係同一日，只設定開始日期，等用戶繼續揀結束日期
                onSelect({
                    startDate: format(selectedRange.from, 'yyyy-MM-dd'),
                    endDate: ''
                });
            }
        } else if (selectedRange?.from && !selectedRange?.to) {
            // 只揀咗開始日期
            onSelect({
                startDate: format(selectedRange.from, 'yyyy-MM-dd'),
                endDate: ''
            });
        }
    };

    const formatDisplayDate = () => {
        if (range?.from && range?.to) {
            return `${format(range.from, 'dd/MM/yyyy')} - ${format(range.to, 'dd/MM/yyyy')}`;
        }
        if (range?.from) {
            return `${format(range.from, 'dd/MM/yyyy')} - ?`;
        }
        return placeholder;
    };

    const clearDates = (e) => {
        e.stopPropagation();
        setRange({ from: undefined, to: undefined });
        onSelect({ startDate: '', endDate: '' });
    };

    // Custom CSS for dark mode
    const dayPickerStyles = isDarkMode ? {
        '--rdp-accent-color': '#6366f1',
        '--rdp-background-color': '#1f2937',
        '--rdp-accent-color-dark': '#4f46e5',
        '--rdp-outline': '2px solid #6366f1',
        '--rdp-outline-selected': '2px solid #6366f1',
    } : {
        '--rdp-accent-color': '#6366f1',
        '--rdp-background-color': '#ffffff',
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 font-medium tracking-wide ${isDarkMode
                    ? 'bg-gray-800/90 border-gray-700 text-white hover:border-indigo-500 focus:border-indigo-500'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-indigo-600 shadow-sm'
                    } ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <span className={`text-sm font-medium ${!range?.from ? 'opacity-50' : ''}`}>
                        {formatDisplayDate()}
                    </span>
                </div>
                {range?.from && (
                    <button
                        onClick={clearDates}
                        className="p-1 rounded-full hover:bg-gray-500/20 transition-colors"
                    >
                        <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                    </button>
                )}
            </div>

            {/* Calendar Popup - Using Portal to render outside modal */}
            {isOpen && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Calendar - Fixed and Centered */}
                    <div
                        className={`fixed z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl shadow-2xl border max-h-[85vh] max-w-[95vw] sm:max-w-none overflow-auto ${isDarkMode
                            ? 'bg-gray-900 border-gray-700'
                            : 'bg-white border-gray-200'
                            }`}
                        style={dayPickerStyles}
                    >
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={handleSelect}
                            locale={zhTW}
                            numberOfMonths={1}
                            showOutsideDays
                            disabled={disabledDays}
                            classNames={{
                                months: 'flex flex-col sm:flex-row gap-4',
                                month: 'space-y-4',
                                caption: 'flex justify-center pt-1 relative items-center',
                                caption_label: `text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`,
                                nav: 'space-x-1 flex items-center',
                                nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg flex items-center justify-center ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`,
                                nav_button_previous: 'absolute left-1',
                                nav_button_next: 'absolute right-1',
                                table: 'w-full border-collapse space-y-1',
                                head_row: 'flex',
                                head_cell: `${isDarkMode ? 'text-gray-400' : 'text-gray-500'} rounded-md w-9 font-normal text-[0.8rem]`,
                                row: 'flex w-full mt-2',
                                cell: 'h-9 w-9 text-center text-sm p-0 relative',
                                day: `h-9 w-9 p-0 font-normal rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-900'}`,
                                day_range_start: 'day-range-start rounded-l-lg bg-indigo-600 text-white hover:bg-indigo-600',
                                day_range_end: 'day-range-end rounded-r-lg bg-indigo-600 text-white hover:bg-indigo-600',
                                day_selected: 'bg-indigo-600 text-white hover:bg-indigo-600',
                                day_range_middle: `${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'} rounded-none`,
                                day_today: `${isDarkMode ? 'ring-1 ring-gray-500' : 'ring-1 ring-gray-300'} font-medium`,
                                day_outside: 'opacity-30',
                                day_disabled: 'opacity-20 cursor-not-allowed',
                                day_hidden: 'invisible',
                            }}
                            modifiersStyles={{
                                selected: { backgroundColor: '#6366f1', color: 'white' },
                                range_start: { backgroundColor: '#6366f1', color: 'white', borderRadius: '8px 0 0 8px' },
                                range_end: { backgroundColor: '#6366f1', color: 'white', borderRadius: '0 8px 8px 0' },
                                range_middle: { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff' },
                            }}
                        />

                        {/* Quick Actions */}
                        <div className={`mt-4 pt-4 border-t flex justify-between items-center text-xs ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className="opacity-50">
                                {range?.from && !range?.to ? '請選擇結束日期' : '點選開始日期'}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                            >
                                完成
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default DateRangePicker;
