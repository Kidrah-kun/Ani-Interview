import { RANK_ORDER } from "./ranks.js";

export function promoteIfEligible({ player, bossAttempt }) {
  if (!bossAttempt.passed) {
    return { promoted: false, reason: "Boss not defeated" };
  }

  const currentIndex = RANK_ORDER.indexOf(player.rank);
  if (currentIndex === -1 || currentIndex === RANK_ORDER.length - 1) {
    return { promoted: false, reason: "Max rank reached" };
  }

  return {
    promoted: true,
    newRank: RANK_ORDER[currentIndex + 1]
  };
}
