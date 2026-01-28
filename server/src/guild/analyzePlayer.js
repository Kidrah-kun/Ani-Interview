import { calculateStreak, getStreakBonus } from "./streakTracker.js";

export function analyzePlayer(attempts, currentRank) {
  const analysis = {
    avgScore: 0,
    failedBoss: false,
    weaknessCount: {},
    clearedFundamentals: 0,
    currentStreak: 0,
    streakBonus: null,
    topWeaknesses: [],
    lastBossFailure: null,
  };

  if (attempts.length === 0) return analysis;

  let totalScore = 0;
  let scoredAttempts = 0;

  for (const attempt of attempts) {
    // PRACTICE attempts do NOT affect progression analysis
    if (attempt.mode === "PRACTICE") continue;

    totalScore += attempt.avgScore;
    scoredAttempts++;

    if (attempt.isBoss && !attempt.passed && attempt.rank === currentRank) {
      analysis.failedBoss = true;
      // Track last boss failure time
      if (!analysis.lastBossFailure || new Date(attempt.createdAt) > new Date(analysis.lastBossFailure)) {
        analysis.lastBossFailure = attempt.createdAt;
      }
    }

    // Count cleared fundamentals ONLY for current rank
    if (
      !attempt.isBoss &&
      attempt.passed &&
      attempt.rank === currentRank
    ) {
      analysis.clearedFundamentals++;
    }

    for (const weakness of attempt.weakAreas || []) {
      analysis.weaknessCount[weakness] =
        (analysis.weaknessCount[weakness] || 0) + 1;
    }
  }

  analysis.avgScore =
    scoredAttempts === 0 ? 0 : totalScore / scoredAttempts;

  // Calculate streak
  analysis.currentStreak = calculateStreak(attempts, currentRank);
  analysis.streakBonus = getStreakBonus(analysis.currentStreak);

  // Get top 3 weaknesses sorted by frequency
  analysis.topWeaknesses = Object.entries(analysis.weaknessCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([weakness, count]) => ({ weakness, count }));

  return analysis;
}

