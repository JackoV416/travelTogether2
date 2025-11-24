// src/pages/LandingPage.jsx - 整合登入/註冊功能和華麗簡介 (修正版本)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';

const LandingPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login, register, signInWithGoogle, user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // 如果用戶已經登入，直接導航到儀表板
    if (user) {
        navigate('/dashboard'); // 這裡假設您的儀表板路徑是 /dashboard
        return null;
    }

    // 處理登入/註冊邏輯
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password);
                showToast('註冊成功！歡迎加入。', 'success');
            } else {
                await login(email, password);
                showToast('登入成功！', 'success');
            }
            navigate('/dashboard'); 
        } catch (error) {
            console.error("Auth error:", error);
            // 顯示更友好的錯誤訊息
            const message = error.message.includes('email-already-in-use') 
                ? '此 Email 已被註冊。' 
                : error.message.includes('wrong-password') 
                ? '密碼錯誤。'
                : error.message.includes('user-not-found')
                ? '用戶不存在，請檢查 Email。'
                : '認證失敗，請重試。';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // 處理 Google 登入
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            showToast('Google 登入成功！', 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Google sign-in error:", error);
            showToast('Google 登入失敗。', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 登入/註冊表單組件
    const AuthForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRegister ? '加入旅程規劃家' : '登入您的帳戶'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
                {isRegister ? '立即註冊，開始規劃下一趟完美旅行。' : '歡迎回來，您的下一趟冒險正等著您。'}
            </p>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">密碼</label>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
                {loading ? '處理中...' : isRegister ? '註冊新帳戶' : '登入'}
            </button>

            {/* Google 登入按鈕 */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        或使用
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50"
            >
                <svg className="w-5 h-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 17 17"><path fillRule="evenodd" d="M11 0H6a6 6 0 0 0-6 6v5a6 6 0 0 0 6 6h5a6 6 0 0 0 6-6V6a6 6 0 0 0-6-6Zm2.481 12.632a5.454 5.454 0 0 1-4.706 2.809c-.067 0-.142-.008-.222-.019l-.5-.072a.584.584 0 0 1-.482-.574V8.586a.584.584 0 0 1 .584-.584h.027a.584.584 0 0 1 .583.584v4.301c.219.034.423.056.619.056a4.84 4.84 0 0 0 4.212-2.339.584.584 0 0 1 1.05.584Z" clipRule="evenodd"/><path d="M11.66 4.757a.584.584 0 0 0-.584-.584h-4.14a.584.584 0 0 0-.584.584v2.793a.584.584 0 0 0 .584.584h4.14a.584.584 0 0 0 .584-.584V4.757Z"/></svg>
                使用 Google 繼續
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {isRegister ? '已有帳戶？' : '還沒有帳戶嗎？'}
                <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ml-1 transition-colors"
                >
                    {isRegister ? '立即登入' : '註冊'}
                </button>
            </p>
        </form>
    );

    // 華麗簡介區塊組件
    const IntroSection = () => (
        <div className="hidden lg:block relative h-full p-12 rounded-2xl shadow-xl overflow-hidden text-white transition-all duration-500"
             style={{
                 backgroundImage: 'linear-gradient(135deg, #1f2937, #4f46e5)', 
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}>
            
            <div className="relative z-10 space-y-8 h-full flex flex-col justify-center">
                <h1 className="text-5xl font-extrabold leading-tight tracking-tight shadow-text">
                    🌍 規劃，協作，啟程。
                </h1>
                
                <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-xl font-light text-indigo-100">
                    「旅行的美好，從精確的計劃開始。與夥伴一起，共享每一次靈感。」
                </blockquote>

                <div className="space-y-4">
                    <FeatureItem icon="🗺️" title="智慧行程管理" description="拖曳排序、日期切換，精確掌握每一刻的當地時間。" />
                    <FeatureItem icon="💰" title="即時費用分攤" description="記錄每一筆支出，自動計算結算，不再為錢煩惱。" />
                    <FeatureItem icon="🤝" title="無縫團隊協作" description="即時同步所有更新，與您的旅伴共同編輯和決策。" />
                    <FeatureItem icon="📸" title="共享美好回憶" description="內建雲端相簿，安全備份並分享旅程中的精彩瞬間。" />
                </div>
            </div>

            {/* 視覺裝飾 */}
            <div className="absolute top-0 right-0 p-4">
                <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-1/4 left-1/4 p-4">
                <div className="w-10 h-10 bg-indigo-300 bg-opacity-20 rounded-xl transform rotate-12"></div>
            </div>
        </div>
    );

    // 輔助組件：特色項目
    const FeatureItem = ({ icon, title, description }) => (
        <div className="flex items-start space-x-3 bg-white bg-opacity-10 p-3 rounded-lg backdrop-blur-sm">
            <span className="text-2xl pt-1">{icon}</span>
            <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-indigo-200">{description}</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 transition-colors duration-500">
                
                {/* 左側：介紹/視覺區 */}
                <IntroSection />

                {/* 右側：登入/註冊表單 */}
                <div className="flex flex-col justify-center p-8 sm:p-12">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                            Trip Planner Pro
                        </h1>
                        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                    <AuthForm />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
