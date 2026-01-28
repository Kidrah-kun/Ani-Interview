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
import { DUNGEON_CONFIG, RANK_ORDER, isValidRank } from "../../dungeon/config.js";

// Scoring policy
import { normalizeScore, SCORE_SCALE } from "../../config/scorePolicy.js";

// Streak tracking
import { applyStreakBonus, calculateStreak } from "../../guild/streakTracker.js";

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
    const { playerId, dungeonType, isBoss = false, dungeonRank: requestedRank } = req.body;

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

    // Determine dungeon rank
    const dungeonRank = requestedRank || player.rank;

    if (!isValidRank(dungeonRank)) {
      return res.status(400).json({
        allowed: false,
        reason: `Invalid dungeon rank: ${dungeonRank}`,
      });
    }

    const playerRankIndex = RANK_ORDER.indexOf(player.rank);
    const dungeonRankIndex = RANK_ORDER.indexOf(dungeonRank);

    // Cannot access dungeons ABOVE your rank
    if (dungeonRankIndex > playerRankIndex) {
      return res.json({
        allowed: false,
        status: "LOCKED",
        reason: `Cannot access ${dungeonRank}-rank dungeons. Your current rank is ${player.rank}.`,
      });
    }

    // Lower-rank dungeons: always allowed as PRACTICE
    if (dungeonRankIndex < playerRankIndex) {
      return res.json({
        allowed: true,
        status: "PRACTICE",
        mode: "PRACTICE",
        reason: `Practice mode: ${dungeonRank}-rank dungeon`,
      });
    }

    // Same rank: apply guild progression rules
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

    return res.json({
      ...access,
      mode: "PROGRESSION",
    });

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
 * IMMUTABLE INTERVIEW CONTRACT:
 * - Returns an ORDERED list of questions with STABLE questionIds
 * - Question IDs are deterministic and never change within an attempt
 * - Questions are stored in questionMeta[] and are immutable
 *
 * FRONTEND CONTRACT:
 * - Frontend may deliver questions via text or TTS (backend agnostic)
 * - Frontend may accept answers via text or STT (backend agnostic)
 * - Answers submitted by { questionId, answerText }, NOT by index
 * - Partial submissions allowed (not all questions required)
 * ============================================================
 */
router.post("/start", async (req, res) => {
  try {
    const { playerId, dungeonType, isBoss = false, dungeonRank: requestedRank } = req.body;

    if (!playerId || !dungeonType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Determine dungeon rank (defaults to player rank if not specified)
    const dungeonRank = requestedRank || player.rank;

    // Validate dungeon rank
    if (!isValidRank(dungeonRank)) {
      return res.status(400).json({ error: `Invalid dungeon rank: ${dungeonRank}` });
    }

    const playerRankIndex = RANK_ORDER.indexOf(player.rank);
    const dungeonRankIndex = RANK_ORDER.indexOf(dungeonRank);

    // Cannot access dungeons ABOVE your rank
    if (dungeonRankIndex > playerRankIndex) {
      return res.status(403).json({
        allowed: false,
        reason: `Cannot access ${dungeonRank}-rank dungeons. Your current rank is ${player.rank}.`,
      });
    }

    /**
     * MODE RULE:
     * - PROGRESSION → same rank as player (counts for advancement)
     * - PRACTICE    → lower rank than player (skill practice only)
     */
    const mode = dungeonRank === player.rank ? "PROGRESSION" : "PRACTICE";

    // For PROGRESSION mode, apply guild rules
    if (mode === "PROGRESSION") {
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
    }

    // Generate questions based on DUNGEON rank (not player rank!)
    const questions = await generateQuestions({
      rank: dungeonRank,
      role: player.class,
      isBoss,
    });

    /**
     * STABLE QUESTION IDs:
     * - Format: q1, q2, q3... (indexed starting at 1)
     * - These IDs are IMMUTABLE for this attempt
     * - Frontend submits answers by questionId, NOT by array index
     */
    const questionMeta = questions.map((q, i) => ({
      id: `q${i + 1}`,
      question: q,
      index: i + 1,
    }));

    const attempt = await prisma.dungeonAttempt.create({
      data: {
        playerId,
        rank: dungeonRank,
        class: player.class || "Backend Engineer",
        isBoss,
        mode,
        avgScore: 0,
        passed: false,
        weakAreas: [],
        questionMeta,
      },
    });

    /**
     * RESPONSE CONTRACT:
     * - attemptId: unique identifier for this interview session
     * - questions[]: ordered list with stable IDs
     * - Frontend uses questionId when submitting answers
     */
    return res.json({
      attemptId: attempt.id,
      rank: dungeonRank,
      mode,
      totalQuestions: questions.length,
      questions: questionMeta.map((meta, i) => ({
        questionId: meta.id,
        question: meta.question,
        index: meta.index,
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
 * SUBMISSION CONTRACT:
 * - Accepts answers by { questionId, answerText } (NOT by index)
 * - Validates questionId exists in the attempt's questionMeta
 * - Rejects unknown questionIds (strict validation)
 * - Allows PARTIAL submissions (not all questions required)
 * - IDEMPOTENT: rejects if attempt already submitted
 *
 * BACKEND NEUTRALITY:
 * - Backend does NOT care if answer was typed or spoken
 * - Backend does NOT track if question was delivered via TTS
 * - Backend only evaluates answerText against question
 *
 * Rank progression happens ONLY here.
 * PRACTICE mode attempts NEVER affect rank.
 * ============================================================
 */
router.post("/submit", async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    // Validate payload structure
    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "Invalid submission payload",
        expected: { attemptId: "string", answers: [{ questionId: "string", answerText: "string" }] }
      });
    }

    const attempt = await prisma.dungeonAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Dungeon attempt not found" });
    }

    // IDEMPOTENCY CHECK: Reject if already submitted
    if (attempt.avgScore > 0 || attempt.passed === true) {
      return res.status(409).json({
        error: "Dungeon already submitted",
        message: "This attempt has already been evaluated. Start a new dungeon to try again."
      });
    }

    // Build valid questionId set for validation
    const validQuestionIds = new Set(attempt.questionMeta.map(q => q.id));

    // Validate all questionIds BEFORE processing
    const invalidIds = [];
    for (const ans of answers) {
      if (!ans.questionId || !validQuestionIds.has(ans.questionId)) {
        invalidIds.push(ans.questionId || "undefined");
      }
    }

    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: "Unknown questionId(s) in submission",
        invalidIds,
        validIds: Array.from(validQuestionIds),
        message: "Submit answers using questionId from the /start response"
      });
    }

    const feedback = [];
    const weakAreas = new Set();
    let totalScore = 0;
    let answeredCount = 0;

    // Process each answer
    for (const ans of answers) {
      const meta = attempt.questionMeta.find(q => q.id === ans.questionId);

      // Get answer text (support both answerText and answer for backwards compat)
      const answerText = ans.answerText || ans.answer || "";

      if (!answerText.trim()) {
        // Skip empty answers (they don't count toward score)
        feedback.push({
          questionId: ans.questionId,
          score: 0,
          normalizedScore: 0,
          feedback: "No answer provided",
          idealAnswer: null,
          skipped: true
        });
        continue;
      }

      answeredCount++;

      // Pass rank to evaluator for proper strictness
      const evaluation = await evaluateAnswer({
        rank: attempt.rank,
        question: meta.question,
        answer: answerText,
      });

      totalScore += evaluation.score;
      evaluation.missingPoints.forEach(w => weakAreas.add(w));

      feedback.push({
        questionId: ans.questionId,
        score: evaluation.score,
        normalizedScore: normalizeScore(evaluation.score),
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        skipped: false
      });
    }

    // Calculate average (only count answered questions)
    const avgScore = answeredCount > 0 ? totalScore / answeredCount : 0;

    // Normalize to 0-100 scale for threshold comparison
    const normalizedAvgScore = normalizeScore(avgScore);

    const config = DUNGEON_CONFIG[attempt.rank];
    const passThreshold = attempt.isBoss
      ? config.passScore + config.bossBonus
      : config.passScore;

    // Compare normalized score against threshold (both on 0-100 scale)
    const passed = normalizedAvgScore >= passThreshold;

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

    /**
     * RESPONSE CONTRACT:
     * - passed: whether dungeon was cleared
     * - scoring: detailed score breakdown
     * - feedback[]: per-question evaluation with questionId
     * - rankUpdate: only present if promoted
     */
    return res.json({
      passed,
      mode: attempt.mode,
      scoring: {
        rawAvgScore: avgScore,
        normalizedScore: normalizedAvgScore,
        passThreshold,
        margin: normalizedAvgScore - passThreshold,
        questionsAnswered: answeredCount,
        questionsTotal: attempt.questionMeta.length
      },
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

