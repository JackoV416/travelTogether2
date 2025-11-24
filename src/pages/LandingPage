// src/pages/LandingPage.jsx

import React from 'react';

// 登陸頁組件接受 login 函式作為 props
const LandingPage = ({ login }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-extrabold mb-4 text-red-400">一起旅行 Travel Together</h1>
            <p className="text-lg mb-8 text-gray-300">
                請使用 Google 帳戶登入，即可開始規劃和共同編輯行程。
            </p>
            <button
                onClick={login}
                className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-all shadow-xl active:scale-95"
            >
                使用 Google 登入
            </button>
        </div>
    );
};

export default LandingPage;
