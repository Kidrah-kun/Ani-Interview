import { DUNGEON_CONFIG } from "./config.js";

export function runDungeon(rank, answers) {
  const config = DUNGEON_CONFIG[rank];

  let totalScore = 0;

  for (const answer of answers) {
    // TEMP evaluation logic (stub)
    if (answer.length > 20) totalScore += 7;
    else totalScore += 3;
  }

  const avgScore = totalScore / answers.length;

  return {
    passed: avgScore >= config.passScore,
    avgScore
  };
}
