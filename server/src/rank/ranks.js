export const RANK_ORDER = ["E", "D", "C", "B", "A", "S", "SS"];

export function getNextRank(currentRank) {
  const index = RANK_ORDER.indexOf(currentRank);
  if (index === -1 || index === RANK_ORDER.length - 1) return null;
  return RANK_ORDER[index + 1];
}
