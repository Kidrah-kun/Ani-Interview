import { Router } from "express";
import { prisma } from "../../prisma.js";

// Guild / progression logic
import { analyzePlayer } from "../../guild/analyzePlayer.js";
import { getRecommendation } from "../../guild/recommendationEngine.js";
import { canAccessDungeon } from "../../guild/dungeonAccess.js";
import { canFightBoss } from "../../guild/bossEligibility.js";
import { evaluateRankProgression } from "../../guild/rankManager.js";

// AI logic
import { generateQuestions } from "../../ai/questionGenerator.js";
import { evaluateAnswer } from "../../ai/evaluator.js";

// Rank-based difficulty configuration
import { DUNGEON_CONFIG } from "../../dungeon/config.js";

const router = Router();

/**
 * ============================================================
 * POST /api/dungeon/access
 *
 * Single source of truth for dungeon access.
 * Frontend must NEVER decide access.
 * ============================================================
 */
router.post("/access", async (req, res) => {
  try {
    const { playerId, dungeonType, isBoss = false } = req.body;

    if (!playerId || !dungeonType) {
      return res.status(400).json({
        allowed: false,
        reason: "playerId and dungeonType are required",
      });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({
        allowed: false,
        reason: "Player not found",
      });
    }

    const attempts = await prisma.dungeonAttempt.findMany({
      where: { playerId },
    });

    const analysis = analyzePlayer(attempts, player.rank);

    const recommendation = getRecommendation({
      analysis,
      rank: player.rank,
    });

    // Boss access is a HARD rule
    if (isBoss) {
      const bossCheck = canFightBoss({ analysis, recommendation });
      if (!bossCheck.allowed) {
        return res.json({
          allowed: false,
          status: "LOCKED",
          reason: bossCheck.reason,
        });
      }
    }

    const access = canAccessDungeon({
      dungeonType,
      recommendation,
    });

    return res.json(access);

  } catch (err) {
    console.error("Dungeon access error:", err);
    return res.status(500).json({
      allowed: false,
      reason: "Internal server error",
    });
  }
});

/**
 * ============================================================
 * POST /api/dungeon/start
 *
 * Creates an immutable dungeon attempt snapshot.
 * Access is ALWAYS re-checked here.
 * ============================================================
 */
router.post("/start", async (req, res) => {
  try {
    const { playerId, dungeonType, isBoss = false } = req.body;

    if (!playerId || !dungeonType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    const attempts = await prisma.dungeonAttempt.findMany({
      where: { playerId },
    });

    const analysis = analyzePlayer(attempts, player.rank);
    const recommendation = getRecommendation({
      analysis,
      rank: player.rank,
    });

    if (isBoss) {
      const bossCheck = canFightBoss({ analysis, recommendation });
      if (!bossCheck.allowed) {
        return res.status(403).json({
          allowed: false,
          reason: bossCheck.reason,
        });
      }
    }

    const access = canAccessDungeon({
      dungeonType,
      recommendation,
    });

    if (access.status !== "ALLOWED") {
      return res.status(403).json(access);
    }

    const questions = await generateQuestions({
      rank: player.rank,
      role: player.class,
      isBoss,
    });

    /**
     * MODE RULE:
     * - PROGRESSION → same rank as player
     * - PRACTICE    → any other rank (future-proof)
     */
    const mode = "PROGRESSION";

    const attempt = await prisma.dungeonAttempt.create({
      data: {
        playerId,
        rank: player.rank,
        class: player.class || "Backend Engineer",
        isBoss,
        mode,
        avgScore: 0,
        passed: false,
        weakAreas: [],
        questionMeta: questions.map((q, i) => ({
          id: `q${i + 1}`,
          question: q,
        })),
      },
    });

    return res.json({
      attemptId: attempt.id,
      rank: player.rank,
      questions: questions.map((q, i) => ({
        id: `q${i + 1}`,
        question: q,
        difficulty: isBoss
          ? "boss"
          : i === 0
            ? "easy"
            : i === 1
              ? "medium"
              : "hard",
      })),
    });

  } catch (err) {
    console.error("Dungeon start error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ============================================================
 * POST /api/dungeon/submit
 *
 * Rank progression happens ONLY here.
 * ============================================================
 */
router.post("/submit", async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid submission payload" });
    }

    const attempt = await prisma.dungeonAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Dungeon attempt not found" });
    }

    if (attempt.avgScore > 0 || attempt.passed === true) {
      return res.status(400).json({ error: "Dungeon already submitted" });
    }

    const feedback = [];
    const weakAreas = new Set();
    let totalScore = 0;

    for (const ans of answers) {
      const meta = attempt.questionMeta.find(q => q.id === ans.questionId);
      if (!meta) continue;

      const evaluation = await evaluateAnswer({
        question: meta.question,
        answer: ans.answer,
      });

      totalScore += evaluation.score;
      evaluation.missingPoints.forEach(w => weakAreas.add(w));

      feedback.push({
        questionId: ans.questionId,
        score: evaluation.score,
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
      });
    }

    const avgScore = totalScore / (answers.length || 1);

    const config = DUNGEON_CONFIG[attempt.rank];
    const passThreshold = attempt.isBoss
      ? config.passScore + 10
      : config.passScore;

    const passed = avgScore >= passThreshold;

    await prisma.dungeonAttempt.update({
      where: { id: attemptId },
      data: {
        avgScore,
        passed,
        weakAreas: Array.from(weakAreas),
      },
    });

    const player = await prisma.player.findUnique({
      where: { id: attempt.playerId },
    });

    let rankUpdate = null;

    // PRACTICE attempts NEVER promote
    if (attempt.mode === "PROGRESSION") {
      const progression = evaluateRankProgression({
        player,
        attempt: { ...attempt, passed, avgScore },
      });

      if (progression.promoted) {
        await prisma.player.update({
          where: { id: player.id },
          data: { rank: progression.newRank },
        });

        rankUpdate = {
          oldRank: player.rank,
          newRank: progression.newRank,
        };
      }
    }

    return res.json({
      passed,
      avgScore,
      weakAreas: Array.from(weakAreas),
      feedback,
      rankUpdate,
    });

  } catch (err) {
    console.error("Dungeon submit error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
