import { ACCESS } from "./accessRules.js";

/**
 * NORMAL DUNGEON ACCESS RULES:
 * - Normal progression dungeons are always accessible to the player at their rank
 * - Only the boss has hard prerequisites (handled separately by bossEligibility)
 * - Practice dungeons (lower rank) are always allowed
 */
export function canAccessDungeon({ dungeonType, recommendation, isBoss = false }) {
  // Boss access is handled completely by bossEligibility — never block here
  if (isBoss) {
    return {
      allowed: true,
      status: ACCESS.ALLOWED,
      reason: "Boss access determined by guild eligibility",
    };
  }

  // Normal dungeons at current rank are always accessible
  return {
    allowed: true,
    status: ACCESS.ALLOWED,
    reason: "Access granted",
  };
}
