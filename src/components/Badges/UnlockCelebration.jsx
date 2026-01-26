import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Assumption: react-use is installed or we implement basic hook
import { X } from 'lucide-react';

const UnlockCelebration = ({ badge, onClose }) => {
    // Basic window size implementation if hook not available
    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!badge) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                numberOfPieces={200}
                recycle={false}
            />

            <div className="relative flex flex-col items-center animate-bounce-in">
                {/* Radiant Background */}
                <div className="absolute inset-0 bg-amber-400/20 blur-[100px] rounded-full animate-pulse" />

                <div className="text-center z-10 text-white space-y-6">
                    <div className="uppercase tracking-[0.3em] font-black text-amber-400 text-sm animate-pulse">
                        Achievement Unlocked
                    </div>

                    <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform duration-500">
                        {badge.icon}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                            {typeof badge.name === 'object' ? (badge.name[navigator.language] || badge.name['en']) : badge.name}
                        </h2>
                        <p className="text-white/70 max-w-xs mx-auto text-lg leading-relaxed">
                            {typeof badge.desc === 'object' ? (badge.desc[navigator.language] || badge.desc['en']) : badge.desc}
                        </p>
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-full bg-white text-black font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all"
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnlockCelebration;
