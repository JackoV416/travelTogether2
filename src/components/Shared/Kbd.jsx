import React from 'react';

/**
 * Kbd - Keyboard Shortcut Visual Component
 * Renders a keystroke hint with a premium, OS-native look (Unified Search Badge Style).
 * 
 * Usage:
 * <Kbd>⌘ K</Kbd>
 * <Kbd keys={['⌘', 'K']} />
 * 
 * @param {React.ReactNode} children - Content to render inside (e.g. "⌘ K")
 * @param {string[]} keys - Array of keys to render (e.g. ['⌘', 'S'])
 * @param {string} className - Additional classes
 */
const Kbd = ({ children, keys, className = '' }) => {
    // Flatten contents: join keys with space if array, or use children
    const content = (keys && keys.length > 0) ? keys.join(' ') : children;

    return (
        <kbd className={`hidden md:inline-flex items-center justify-center 
                        min-w-[20px] h-6 px-2 rounded-lg
                        text-[11px] font-bold font-mono tracking-wide
                        border border-gray-400/30 bg-white/5 dark:bg-black/20
                        text-gray-600 dark:text-gray-300 select-none backdrop-blur-sm
                        ${className}`}>
            {content}
        </kbd>
    );
};

export default Kbd;
