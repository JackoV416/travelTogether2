import React from 'react';
import {
    MapPinned,
    Plane,
    Home,
    ArrowLeft,
    MessageCircle,
    AlertTriangle,
    ShieldAlert,
    Wrench,
    RefreshCw
} from 'lucide-react';
import { glassCard } from '../../utils/tripUtils';

/**
 * HttpStatusPage - A unified component for all HTTP status codes
 * @param {number} code - 403, 404, 500, 503, etc.
 * @param {boolean} isDarkMode - Dark mode toggle
 * @param {function} onBackHome - Callback for home button
 * @param {function} onOpenFeedback - Callback for feedback button
 */
const HttpStatusPage = ({ code = 404, isDarkMode, onBackHome, onOpenFeedback }) => {

    // Configuration for different status codes
    const configs = {
        403: {
            icon: ShieldAlert,
            color: 'from-red-500 via-rose-500 to-orange-500',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20',
            title: '權限不足 (403)',
            subtitle: '呢度係私人領地，請勿闖入...',
            desc: '就像未經授權進入管制區一樣，您目前沒有權限查看此內容。\n請確保您已登入正確帳號，或向行程擁有者申請權限。',
            action: 'retry'
        },
        404: {
            icon: MapPinned,
            color: 'from-indigo-500 via-purple-500 to-pink-500',
            iconColor: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20',
            title: '頁面不見了 (404)',
            subtitle: '糟了，您好像迷路了...',
            desc: '就像找不到目的地嘅旅行一樣，呢個頁面目前不存在。\n可能係條 Link 俾風吹走咗，或者係我哋仲未開拓到呢個景點。',
            action: 'home'
        },
        500: {
            icon: AlertTriangle,
            color: 'from-orange-500 via-red-500 to-rose-500',
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            title: '系統錯誤 (500)',
            subtitle: '引擎發生故障...',
            desc: '我們在處理您的請求時遇到了技術困難。\n請嘗試重新整理頁面，或者稍後再回來看看。',
            action: 'retry'
        },
        503: {
            icon: Plane,
            color: 'from-amber-500 via-orange-500 to-yellow-500',
            iconColor: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20',
            title: '服務暫停 (503)',
            subtitle: '航班延誤中...',
            desc: '就像突如其來嘅天氣影響一樣，我哋嘅伺服器暫時休息中。\n我哋嘅地勤人員正喺度努力搶修，請隨時準備起飛！',
            action: 'retry'
        }
    };

    const config = configs[code] || configs[404];
    const Icon = config.icon;

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in font-sans">
            <div className={`${glassCard(isDarkMode)} max-w-lg w-full p-10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 hover:shadow-2xl`}>

                {/* Decorative Background Elements */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${config.bgColor} rounded-full blur-3xl animate-pulse`}></div>
                <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${config.bgColor} rounded-full blur-3xl`}></div>

                <div className="relative z-10 w-full">
                    <div className={`w-24 h-24 mb-8 ${config.bgColor} rounded-3xl flex items-center justify-center mx-auto transform hover:rotate-6 transition-transform duration-500 shadow-lg border ${config.borderColor}`}>
                        <Icon className={`w-12 h-12 ${config.iconColor}`} />
                    </div>

                    <h1 className={`text-7xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br ${config.color}`}>
                        {code}
                    </h1>

                    <h2 className="text-2xl font-black mb-3 tracking-tight">{config.subtitle}</h2>

                    <p className="text-sm opacity-60 mb-10 leading-relaxed font-medium whitespace-pre-line">
                        {config.desc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        {config.action === 'home' ? (
                            <button
                                onClick={onBackHome}
                                className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 border border-white/10"
                            >
                                <Home className="w-4 h-4" /> 返回主頁
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 border border-white/10"
                            >
                                <RefreshCw className="w-4 h-4" /> 重新整理
                            </button>
                        )}

                        <button
                            onClick={onOpenFeedback}
                            className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl font-bold transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <MessageCircle className="w-4 h-4" /> 意見回饋
                        </button>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="mt-8 text-xs font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 mx-auto"
                    >
                        <ArrowLeft className="w-3 h-3" /> 回到上一頁
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HttpStatusPage;
