import { Router } from "express";
import { prisma } from "../../prisma.js";
import { analyzePlayer } from "../../guild/analyzePlayer.js";
import { getRecommendation } from "../../guild/recommendationEngine.js";
import { canAccessDungeon } from "../../guild/dungeonAccess.js";
import { generateQuestions } from "../../ai/questionGenerator.js";

const router = Router();

/**
 * POST /api/dungeon/access
 */
router.post("/access", async (req, res) => {
  try {
    const { playerId, dungeonType } = req.body;

    if (!playerId || !dungeonType) {
      return res.status(400).json({
        allowed: false,
        reason: "playerId and dungeonType are required",
      });
    }

    // 1️⃣ Fetch player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({
        allowed: false,
        reason: "Player not found",
      });
    }

    // 2️⃣ Fetch attempts
    const attempts = await prisma.dungeonAttempt.findMany({
      where: { playerId },
    });

    // 3️⃣ Analyze attempts
    const analysis = analyzePlayer(attempts);

    // 4️⃣ Get guild recommendation
    const recommendation = getRecommendation({
      analysis,
      rank: player.rank,
    });

    // 5️⃣ Final access decision
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
 * POST /api/dungeon/start
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

    // 🔐 Re-check access
    const attempts = await prisma.dungeonAttempt.findMany({
      where: { playerId },
    });

    const analysis = analyzePlayer(attempts);
    const recommendation = getRecommendation({
      analysis,
      rank: player.rank,
    });

    const access = canAccessDungeon({
      dungeonType,
      recommendation,
    });

    if (access.status !== "ALLOWED") {
      return res.status(403).json(access);
    }

    // 🧠 Generate questions
    const questions = await generateQuestions({
      rank: player.rank,
      role: player.class,
      isBoss,
    });

    // 📝 Create attempt
    const attempt = await prisma.dungeonAttempt.create({
      data: {
        playerId,
        rank: player.rank,
        class: player.class || "Backend Engineer",
        isBoss,
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
        difficulty: isBoss ? "hard" : (i === 0 ? "easy" : i === 1 ? "medium" : "hard"),
      })),
    });

  } catch (err) {
    console.error("Dungeon start error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
