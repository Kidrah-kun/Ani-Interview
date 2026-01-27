export function analyzeAttempts(attempts) {
  const analysis = {
    avgScore: 0,
    failedBoss: false,
    weaknessCount: {},
  };

  if (attempts.length === 0) return analysis;

  let totalScore = 0;

  for (const attempt of attempts) {
    totalScore += attempt.avgScore;

    if (attempt.isBoss && !attempt.passed) {
      analysis.failedBoss = true;
    }

    for (const weakness of attempt.weakAreas) {
      analysis.weaknessCount[weakness] =
        (analysis.weaknessCount[weakness] || 0) + 1;
    }
  }

  analysis.avgScore = totalScore / attempts.length;
  return analysis;
}
