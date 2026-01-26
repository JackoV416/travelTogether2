import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { RARITY_COLORS } from '../../constants/badges';

const BadgeCard = ({ badge, onClick, showName = true }) => {
    const { t, i18n } = useTranslation();
    const { id, icon, name, rarity, unlocked, unlockedAt } = badge;

    // Choose gradient based on rarity, keyed by const
    const gradient = RARITY_COLORS[rarity] || 'from-gray-400 to-gray-500';

    return (
        <div
            onClick={onClick}
            className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${unlocked ? 'opacity-100' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-80'}`}
        >
            {/* Card Body */}
            <div className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-lg border border-white/10
                bg-gradient-to-br ${unlocked ? gradient : 'from-gray-700 to-gray-800'}
            `}>
                {/* Background Glow (Unlocked Only) */}
                {unlocked && (
                    <div className="absolute inset-0 bg-white/20 blur-xl scale-150 animate-pulse-slow pointer-events-none" />
                )}

                {/* Icon */}
                <div className={`text-4xl md:text-5xl mb-2 z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110 ${!unlocked && 'blur-[2px]'}`}>
                    {icon}
                </div>

                {/* Lock Overlay (Locked Only) */}
                {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-[1px]">
                        <Lock className="w-8 h-8 text-white/50" />
                    </div>
                )}
            </div>

            {/* Label (Optional) */}
            {showName && (
                <div className="text-center mt-2">
                    <h4 className="font-bold text-xs md:text-sm truncate px-1">
                        {typeof name === 'object' ? (name[i18n.language] || name['zh_HK'] || name['en'] || Object.values(name)[0]) : name}
                    </h4>
                    {unlocked && unlockedAt && (
                        <p className="text-[10px] opacity-50">
                            {new Date(unlockedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BadgeCard;
