import { runDungeon } from "./engine.js";
import { getNextRank } from "../rank/ranks.js";

export function runBossDungeon(player, answers) {
  // Boss is stricter: reuse engine but require pass
  const result = runDungeon(player.rank, answers);

  if (!result.passed) {
    return {
      ...result,
      rankUp: false,
      nextRank: null
    };
  }

  const nextRank = getNextRank(player.rank);

  return {
    ...result,
    rankUp: true,
    nextRank
  };
}
