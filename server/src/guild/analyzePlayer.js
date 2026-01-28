export function analyzePlayer(attempts, currentRank) {
  const analysis = {
    avgScore: 0,
    failedBoss: false,
    weaknessCount: {},
    clearedFundamentals: 0,
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

  return analysis;
}
