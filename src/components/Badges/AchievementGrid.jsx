import React, { useState } from 'react';
import BadgeCard from './BadgeCard';
import { BADGES_DATA } from '../../constants/badges';

const AchievementGrid = ({ achievements, onBadgeClick }) => {
    // If achievements is empty/null, might want to show loading or use BADGES_DATA as locked defaults
    // But usually parent passes processed list with 'unlocked' flags

    // Sort: Unlocked first, then by rarity/id
    const sortedBadges = [...(achievements || [])].sort((a, b) => {
        if (a.unlocked === b.unlocked) return 0;
        return a.unlocked ? -1 : 1;
    });

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 md:gap-5 p-2">
            {sortedBadges.map(badge => (
                <BadgeCard
                    key={badge.id}
                    badge={badge}
                    onClick={() => onBadgeClick && onBadgeClick(badge)}
                />
            ))}
        </div>
    );
};

export default AchievementGrid;
