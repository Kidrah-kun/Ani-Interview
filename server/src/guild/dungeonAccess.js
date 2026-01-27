import { ACCESS } from "./accessRules.js";

export function canEnterDungeon({ dungeonType, recommendation }) {
  // If Guild Master assigned a specific training dungeon
  if (recommendation.type.dungeonType !== dungeonType) {
    return {
      status: ACCESS.LOCKED,
      reason: `Guild Master requires completion of ${recommendation.type.dungeonType}`
    };
  }

  return {
    status: ACCESS.ALLOWED,
    reason: "Access granted by Guild Master"
  };
}
