export function canFightBoss({ analysis, recommendation }) {
  if (recommendation.type.id !== "boss_retry") {
    return {
      allowed: false,
      reason: "Training incomplete"
    };
  }

  if (analysis.avgScore < 6) {
    return {
      allowed: false,
      reason: "Average score too low for boss attempt"
    };
  }

  return {
    allowed: true,
    reason: "Boss fight authorized"
  };
}
