import { ACCESS } from "./accessRules.js";

/**
 * Pure access rule checker
 */
export function canAccessDungeon({ dungeonType, recommendation }) {
  // Guild Master has assigned a specific dungeon
  if (recommendation?.type?.dungeonType !== dungeonType) {
    return {
      allowed: false,
      status: ACCESS.LOCKED,
      reason: `Guild Master requires completion of ${recommendation.type.dungeonType}`,
    };
  }

  return {
    allowed: true,
    status: ACCESS.ALLOWED,
    reason: "Access granted by Guild Master",
  };
}
