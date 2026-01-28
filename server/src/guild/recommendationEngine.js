import { COMMISSIONS, WEAKNESS_TO_COMMISSION } from "./commissions.js";

/**
 * Find the best commission based on player's weaknesses
 */
function getWeaknessTargetedCommission(topWeaknesses) {
  if (!topWeaknesses || topWeaknesses.length === 0) {
    return null;
  }

  // Check each weakness and find a matching commission
  for (const { weakness, count } of topWeaknesses) {
    // Only target weaknesses that appeared 2+ times
    if (count >= 2) {
      // Check for exact match
      if (WEAKNESS_TO_COMMISSION[weakness]) {
        return {
          commission: WEAKNESS_TO_COMMISSION[weakness],
          weakness,
          occurrences: count
        };
      }

      // Check for partial match (weakness contains keyword)
      for (const [keyword, commission] of Object.entries(WEAKNESS_TO_COMMISSION)) {
        if (weakness.toLowerCase().includes(keyword.toLowerCase())) {
          return {
            commission,
            weakness,
            occurrences: count
          };
        }
      }
    }
  }

  return null;
}

/**
 * Internal logic
 */
function recommendNextStep({ analysis, rank }) {
  // Rule 1: Boss retry if previously failed (but will be blocked by cooldown if needed)
  if (analysis.failedBoss) {
    return {
      type: COMMISSIONS.BOSS_RETRY,
      reason: "Rank boss not cleared - prepare for rematch!",
    };
  }

  // Rule 2: Check for weakness-targeted recommendation
  const targetedRec = getWeaknessTargetedCommission(analysis.topWeaknesses);
  if (targetedRec) {
    return {
      type: targetedRec.commission,
      reason: `Targeting weakness: "${targetedRec.weakness}" (appeared ${targetedRec.occurrences}x)`,
      targetedWeakness: targetedRec.weakness,
    };
  }

  // Rule 3: Low average score - back to fundamentals
  if (analysis.avgScore < 5) {
    return {
      type: COMMISSIONS.FUNDAMENTALS,
      reason: "Average score below threshold - reinforce basics",
    };
  }

  // Rule 4: Prerequisite - Must clear 2 fundamentals
  if (analysis.clearedFundamentals < 2) {
    return {
      type: COMMISSIONS.FUNDAMENTALS,
      reason: `Must clear 2 fundamental dungeons (Current: ${analysis.clearedFundamentals}/2)`,
    };
  }

  // Rule 5: Streak-aware recommendation for boss readiness
  if (analysis.currentStreak >= 3) {
    return {
      type: COMMISSIONS.BOSS_RETRY,
      reason: `${analysis.streakBonus?.label || "Hot streak!"} You're ready for the boss!`,
      streak: analysis.currentStreak,
    };
  }

  // Rule 6: Offer warmup before boss if fundamentals cleared
  if (analysis.clearedFundamentals >= 2 && analysis.currentStreak < 2) {
    return {
      type: COMMISSIONS.WARMUP,
      reason: "Optional warmup before boss challenge",
      alternative: COMMISSIONS.BOSS_RETRY,
    };
  }

  // Default: allow boss attempt
  return {
    type: COMMISSIONS.BOSS_RETRY,
    reason: "Ready for rank advancement!",
  };
}

/**
 * Public API (what routes import)
 */
export function getRecommendation({ analysis, rank }) {
  const recommendation = recommendNextStep({ analysis, rank });

  // Add streak info to all recommendations
  return {
    ...recommendation,
    streak: analysis.currentStreak,
    streakBonus: analysis.streakBonus,
  };
}

