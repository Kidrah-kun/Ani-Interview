/**
 * Boss cooldown duration in minutes
 * Player must wait this long after a failed boss attempt
 */
const BOSS_COOLDOWN_MINUTES = 30;

/**
 * Check if player is eligible to fight the rank boss
 */
export function canFightBoss({ analysis, recommendation }) {
  // Check if training is complete
  if (recommendation.type.id !== "boss_retry") {
    return {
      allowed: false,
      reason: "Training incomplete - complete required dungeons first"
    };
  }

  // Check for boss cooldown after failure
  if (analysis.lastBossFailure) {
    const lastFailure = new Date(analysis.lastBossFailure);
    const now = new Date();
    const minutesSinceFailure = (now - lastFailure) / (1000 * 60);

    if (minutesSinceFailure < BOSS_COOLDOWN_MINUTES) {
      const remainingMinutes = Math.ceil(BOSS_COOLDOWN_MINUTES - minutesSinceFailure);
      return {
        allowed: false,
        reason: `Boss cooldown active. Try again in ${remainingMinutes} minute(s).`,
        cooldownRemaining: remainingMinutes,
        cooldownEnds: new Date(lastFailure.getTime() + BOSS_COOLDOWN_MINUTES * 60 * 1000)
      };
    }
  }

  // Check minimum score requirement
  if (analysis.avgScore < 6) {
    return {
      allowed: false,
      reason: "Average score too low for boss attempt (need 6+)"
    };
  }

  return {
    allowed: true,
    reason: "Boss fight authorized! Good luck, Hunter! 🎯",
    streak: analysis.streakBonus
  };
}

/**
 * Export cooldown config for use elsewhere
 */
export const BOSS_CONFIG = {
  cooldownMinutes: BOSS_COOLDOWN_MINUTES
};

