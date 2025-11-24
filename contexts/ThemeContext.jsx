// src/contexts/ThemeContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// 建立 Context
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // 從 localStorage 讀取主題，預設為 'light' (Threads 風格)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        
        // 移除舊的主題 class
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        
        // 新增當前主題 class
        root.classList.add(theme);

        // 儲存到 localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // 切換主題的函式
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
