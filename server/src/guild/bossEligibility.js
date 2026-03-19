/**
 * BOSS UNLOCK RULES:
 * - Player must have cleared at least 1 fundamental (normal) dungeon at their rank
 * - Player must have cleared at least 5 dungeons total at their rank (any type)
 * - Boss cooldown of 30 min after a failed attempt
 */
const BOSS_COOLDOWN_MINUTES = 30;
const DUNGEONS_REQUIRED_FOR_BOSS = 5;

export function canFightBoss({ analysis }) {
  // Rule 1: Must have completed the fundamental dungeon at least once
  if (!analysis.fundamentalCleared) {
    return {
      allowed: false,
      reason: "Guild Master requires completion of Fundamentals Dungeon",
    };
  }

  // Rule 2: Must have completed 5 dungeons total at this rank
  if (analysis.totalDungeonsCleared < DUNGEONS_REQUIRED_FOR_BOSS) {
    const remaining = DUNGEONS_REQUIRED_FOR_BOSS - analysis.totalDungeonsCleared;
    return {
      allowed: false,
      reason: `Complete ${remaining} more dungeon(s) to unlock the Boss (${analysis.totalDungeonsCleared}/${DUNGEONS_REQUIRED_FOR_BOSS})`,
    };
  }

  // Rule 3: Boss cooldown after a failed attempt
  if (analysis.lastBossFailure) {
    const lastFailure = new Date(analysis.lastBossFailure);
    const now = new Date();
    const minutesSinceFailure = (now.getTime() - lastFailure.getTime()) / (1000 * 60);

    if (minutesSinceFailure < BOSS_COOLDOWN_MINUTES) {
      const remainingMinutes = Math.ceil(BOSS_COOLDOWN_MINUTES - minutesSinceFailure);
      return {
        allowed: false,
        reason: `Boss cooldown active. Try again in ${remainingMinutes} minute(s).`,
        cooldownRemaining: remainingMinutes,
        cooldownEnds: new Date(lastFailure.getTime() + BOSS_COOLDOWN_MINUTES * 60 * 1000),
      };
    }
  }

  return {
    allowed: true,
    reason: "Boss fight authorized! Good luck, Hunter! 🎯",
    streak: analysis.streakBonus,
  };
}

export const BOSS_CONFIG = {
  cooldownMinutes: BOSS_COOLDOWN_MINUTES,
  dungeonsRequired: DUNGEONS_REQUIRED_FOR_BOSS,
};
