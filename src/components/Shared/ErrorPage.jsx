import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Lock, MapPinOff, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { buttonPrimary, buttonSecondary } from '../../constants/styles';

const ErrorPage = ({ type = 'error', title, message, errorDetail, isDarkMode }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const config = {
        '403': {
            icon: Lock,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            defaultTitle: t('error.403_title', '存取被拒'),
            defaultMessage: t('error.403_desc', '你沒有權限訪問此頁面或資源。')
        },
        '404': {
            icon: MapPinOff,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            defaultTitle: t('error.404_title', '找不到頁面'),
            defaultMessage: t('error.404_desc', '你嘗試訪問的頁面不存在或已被移除。')
        },
        '500': {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            defaultTitle: t('error.500_title', '系統發生錯誤'),
            defaultMessage: t('error.500_desc', '伺服器遇到非預期情況，請稍後再試。')
        },
        'offline': {
            icon: ShieldAlert,
            color: 'text-slate-500',
            bg: 'bg-slate-500/10',
            border: 'border-slate-500/20',
            defaultTitle: t('error.offline_title', '網絡連線中斷'),
            defaultMessage: t('error.offline_desc', '請檢查你的網絡連線，然後重試。')
        }
    };

    // Default to 500/generic style if type not found
    const style = config[type] || config['500'];
    const Icon = style.icon;

    return (
        <div className={`min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* Visual Icon with Glow */}
            <div className={`relative mb-8 group`}>
                <div className={`absolute inset-0 ${style.bg} blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className={`w-32 h-32 rounded-[2rem] ${style.bg} border ${style.border} flex items-center justify-center relative shadow-2xl backdrop-blur-xl transform transition-transform duration-500 hover:scale-105`}>
                    <Icon className={`w-14 h-14 ${style.color} drop-shadow-lg`} />
                </div>

                {/* Floating decorators */}
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${style.bg} border ${style.border} animate-bounce delay-100`} />
                <div className={`absolute -bottom-4 -left-4 w-6 h-6 rounded-full ${style.bg} border ${style.border} animate-pulse delay-700`} />
            </div>

            {/* Text Content */}
            <div className="max-w-md space-y-4">
                <h1 className="text-4xl font-black tracking-tight">{title || style.defaultTitle}</h1>
                <p className="text-lg opacity-60 font-medium leading-relaxed">
                    {message || style.defaultMessage}
                </p>

                {/* Technical Details (Optional, collapsed by default logic could be added) */}
                {errorDetail && (
                    <div className="mt-4 p-4 rounded-xl bg-black/5 text-left text-xs font-mono overflow-auto max-h-32 opacity-70 border border-black/5">
                        {errorDetail.toString()}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                    onClick={() => navigate('/')}
                    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 
                        ${isDarkMode
                            ? 'bg-white text-black hover:bg-gray-100'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    <Home className="w-5 h-5" />
                    <span>{t('common.back_home', '返回首頁')}</span>
                </button>

                <button
                    onClick={() => window.location.reload()}
                    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all border
                        ${isDarkMode
                            ? 'border-white/20 hover:bg-white/10 text-white'
                            : 'border-black/10 hover:bg-black/5 text-black'
                        }`}
                >
                    <RefreshCw className="w-5 h-5" />
                    <span>{t('common.refresh', '重新整理')}</span>
                </button>
            </div>

            {/* Footer Info */}
            <div className="mt-16 opacity-30 text-xs font-mono">
                Error Code: {type.toUpperCase()}
            </div>
        </div>
    );
};

export default ErrorPage;
