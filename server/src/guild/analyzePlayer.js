import { calculateStreak, getStreakBonus } from "./streakTracker.js";

/**
 * PROGRESSION RULES:
 * - fundamentalCleared: player has passed at least 1 normal dungeon at current rank
 * - totalDungeonsCleared: total passed dungeons (normal + boss) at current rank
 * - Boss unlocks after 5 total dungeon completions at current rank
 */
export function analyzePlayer(attempts, currentRank) {
  const analysis = {
    avgScore: 0,
    failedBoss: false,
    weaknessCount: {},
    fundamentalCleared: false,   // true if ≥1 normal dungeon passed this rank
    totalDungeonsCleared: 0,     // count of all passed dungeons this rank
    clearedFundamentals: 0,      // kept for backwards compat (same as totalDungeonsCleared now)
    currentStreak: 0,
    streakBonus: null,
    topWeaknesses: [],
    lastBossFailure: null,
  };

  if (attempts.length === 0) return analysis;

  let totalScore = 0;
  let scoredAttempts = 0;

  for (const attempt of attempts) {
    // PRACTICE attempts do NOT affect progression
    if (attempt.mode === "PRACTICE") continue;

    totalScore += attempt.avgScore;
    scoredAttempts++;

    if (attempt.rank !== currentRank) continue;

    if (attempt.isBoss && !attempt.passed) {
      analysis.failedBoss = true;
      if (!analysis.lastBossFailure || new Date(attempt.createdAt) > new Date(analysis.lastBossFailure)) {
        analysis.lastBossFailure = attempt.createdAt;
      }
    }

    if (attempt.passed) {
      analysis.totalDungeonsCleared++;

      // Normal dungeon cleared = fundamental requirement met
      if (!attempt.isBoss) {
        analysis.fundamentalCleared = true;
      }
    }

    for (const weakness of attempt.weakAreas || []) {
      analysis.weaknessCount[weakness] =
        (analysis.weaknessCount[weakness] || 0) + 1;
    }
  }

  analysis.avgScore = scoredAttempts === 0 ? 0 : totalScore / scoredAttempts;
  // Keep clearedFundamentals for backwards compat
  analysis.clearedFundamentals = analysis.totalDungeonsCleared;

  analysis.currentStreak = calculateStreak(attempts, currentRank);
  analysis.streakBonus = getStreakBonus(analysis.currentStreak);

  analysis.topWeaknesses = Object.entries(analysis.weaknessCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([weakness, count]) => ({ weakness, count }));

  return analysis;
}
