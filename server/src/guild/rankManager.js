import { RANK_ORDER, getNextRank } from "../dungeon/config.js";

export function evaluateRankProgression({ player, attempt }) {
    if (!attempt.isBoss || !attempt.passed || attempt.avgScore < 6) {
        return {
            promoted: false,
            newRank: player.rank,
            reason: "Boss not cleared with sufficient score (Must be >= 6.0)",
        };
    }

    const currentIndex = RANK_ORDER.indexOf(player.rank);

    if (currentIndex === -1 || currentIndex === RANK_ORDER.length - 1) {
        return {
            promoted: false,
            newRank: player.rank,
            reason: "Max rank reached",
        };
    }

    const newRank = RANK_ORDER[currentIndex + 1];

    return {
        promoted: true,
        newRank,
        reason: "Boss defeated",
    };
}
