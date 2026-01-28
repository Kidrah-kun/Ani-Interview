/**
 * Streak Tracker Module
 * 
 * Tracks consecutive passes and provides streak-based bonuses.
 * A streak resets on failure or when switching to a new rank.
 */

/**
 * Streak bonus tiers
 */
export const STREAK_BONUSES = {
    3: { bonusPercent: 5, label: "🔥 Hot Streak!" },
    5: { bonusPercent: 10, label: "🔥🔥 On Fire!" },
    7: { bonusPercent: 15, label: "🔥🔥🔥 Unstoppable!" },
    10: { bonusPercent: 20, label: "💀 Legendary!" }
};

/**
 * Calculate current streak from attempts
 * Only counts PROGRESSION mode passes at current rank
 */
export function calculateStreak(attempts, currentRank) {
    // Sort by creation date (newest first)
    const sorted = [...attempts]
        .filter(a => a.mode === "PROGRESSION" && a.rank === currentRank)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let streak = 0;

    for (const attempt of sorted) {
        if (attempt.passed) {
            streak++;
        } else {
            // Streak breaks on first failure
            break;
        }
    }

    return streak;
}

/**
 * Get bonus percentage for current streak
 */
export function getStreakBonus(streak) {
    let bonus = 0;
    let label = null;

    // Find highest applicable tier
    for (const [threshold, config] of Object.entries(STREAK_BONUSES)) {
        if (streak >= parseInt(threshold)) {
            bonus = config.bonusPercent;
            label = config.label;
        }
    }

    return { bonus, label, streak };
}

/**
 * Apply streak bonus to a score
 */
export function applyStreakBonus(score, streak) {
    const { bonus, label } = getStreakBonus(streak);

    if (bonus === 0) {
        return {
            originalScore: score,
            bonusApplied: 0,
            finalScore: score,
            streakLabel: null
        };
    }

    const bonusAmount = score * (bonus / 100);
    const finalScore = Math.min(score + bonusAmount, 100); // Cap at 100

    return {
        originalScore: score,
        bonusApplied: bonusAmount,
        finalScore,
        streakLabel: label,
        bonusPercent: bonus
    };
}
