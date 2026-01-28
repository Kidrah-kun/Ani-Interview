import { Router } from "express";
import { prisma } from "../../prisma.js";
import { analyzePlayer } from "../../guild/analyzePlayer.js";
import { getRecommendation } from "../../guild/recommendationEngine.js";
import { canFightBoss } from "../../guild/bossEligibility.js";

const router = Router();

/**
 * GET /api/guild/progression/:playerId
 *
 * This endpoint is the GUILD'S SINGLE SOURCE OF TRUTH.
 * It answers:
 * - What rank the player is
 * - How far they are in the current rank
 * - Whether the rank boss is unlocked
 * - What the next required action is
 *
 * IMPORTANT:
 * - This endpoint NEVER mutates data
 * - It only reflects the current state based on attempts
 */
router.get("/progression/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    // 1️⃣ Fetch player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // 2️⃣ Fetch all attempts
    const attempts = await prisma.dungeonAttempt.findMany({
      where: { playerId },
    });

    // 3️⃣ Analyze historical performance
    const analysis = analyzePlayer(attempts, player.rank);

    /**
     * analysis contains:
     * - avgScore
     * - failedBoss
     * - clearedFundamentals (for current rank)
     * - weaknessCount
     */

    // 4️⃣ Get guild recommendation (what should player do next)
    const recommendation = getRecommendation({
      analysis,
      rank: player.rank,
    });

    // 5️⃣ Boss eligibility check (explicit)
    const bossEligibility = canFightBoss({
      analysis,
      recommendation,
    });

    // 6️⃣ Build canonical progression snapshot
    return res.json({
      playerId,
      rank: player.rank,

      progression: {
        fundamentalsCleared: analysis.clearedFundamentals,
        fundamentalsRequired: 2,
        bossUnlocked: bossEligibility.allowed,
        bossCleared: attempts.some(
          (a) => a.isBoss && a.passed && a.rank === player.rank
        ),
      },

      nextStep: {
        type: recommendation.type.id,
        description: recommendation.type.description,
        reason: recommendation.reason,
      },
    });

  } catch (err) {
    console.error("Guild progression error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
