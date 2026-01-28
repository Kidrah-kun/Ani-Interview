import { COMMISSIONS } from "./commissions.js";

/**
 * Internal logic
 */
function recommendNextStep({ analysis, rank }) {
  // Boss retry rule
  if (analysis.failedBoss) {
    return {
      type: COMMISSIONS.BOSS_RETRY,
      reason: "Rank boss not cleared",
    };
  }

  // Repeated weakness rule
  const severeWeakness = Object.entries(analysis.weaknessCount)
    .find(([_, count]) => count >= 2);

  if (severeWeakness) {
    const [weakness] = severeWeakness;

    if (weakness === "System Design") {
      return {
        type: COMMISSIONS.SYSTEM_DESIGN,
        reason: "Repeated system design weakness detected",
      };
    }

    if (weakness === "Transactions") {
      return {
        type: COMMISSIONS.TRANSACTIONS,
        reason: "Repeated transaction consistency issues",
      };
    }
  }

  // Low average score rule
  if (analysis.avgScore < 5) {
    return {
      type: COMMISSIONS.FUNDAMENTALS,
      reason: "Average score below threshold",
    };
  }

  // Default: allow boss attempt
  return {
    type: COMMISSIONS.BOSS_RETRY,
    reason: "Ready for rank advancement",
  };
}

/**
 * Public API (what routes import)
 */
export function getRecommendation({ analysis, rank }) {
  return recommendNextStep({ analysis, rank });
}
