import { Router } from "express";
import { prisma } from "../../prisma.js";

import { analyzePlayer } from "../../guild/analyzePlayer.js";
import { getRecommendation } from "../../guild/recommendationEngine.js";
import { canFightBoss } from "../../guild/bossEligibility.js";

import { DUNGEON_CONFIG, RANK_ORDER, getRankIndex } from "../../dungeon/config.js";

const router = Router();

/**
 * ============================================================
 * GET /api/dungeon/catalog/:playerId
 *
 * PURPOSE:
 * - Render-ready dungeon list for the frontend
 * - Frontend must NEVER compute rules
 *
 * This endpoint answers:
 * - What dungeons exist
 * - Which are locked/unlocked
 * - Which are practice vs progression
 * - What the next action should be
 * ============================================================
 */
router.get("/catalog/:playerId", async (req, res) => {
    try {
        const { playerId } = req.params;

        // 1️⃣ Fetch player
        const player = await prisma.player.findUnique({
            where: { id: playerId },
        });

        if (!player) {
            return res.status(404).json({ error: "Player not found" });
        }

        // 2️⃣ Fetch attempts
        const attempts = await prisma.dungeonAttempt.findMany({
            where: { playerId },
        });

        // 3️⃣ Analyze progression state
        const analysis = analyzePlayer(attempts, player.rank);

        const recommendation = getRecommendation({
            analysis,
            rank: player.rank,
        });

        const bossEligibility = canFightBoss({
            analysis,
            recommendation,
        });

        const rankConfig = DUNGEON_CONFIG[player.rank];

        if (!rankConfig) {
            return res.status(500).json({
                error: "Dungeon config missing for rank " + player.rank,
            });
        }

        /**
         * =========================
         * PROGRESSION DUNGEONS
         * (Current rank - affects advancement)
         * =========================
         */
        const progressionDungeons = [];

        // Normal dungeons (current rank = progression)
        for (const dungeon of rankConfig.normal || []) {
            // Check if this specific dungeon has been cleared
            const cleared = attempts.some(
                a => a.rank === player.rank &&
                    !a.isBoss &&
                    a.passed &&
                    a.mode === "PROGRESSION"
            );

            progressionDungeons.push({
                id: dungeon.id,
                name: dungeon.name,
                description: dungeon.description,
                rank: player.rank,
                type: "NORMAL",
                mode: "PROGRESSION",
                locked: false,
                cleared,
                dungeonType: dungeon.dungeonType
            });
        }

        // Boss dungeon
        const bossCleared = attempts.some(
            a => a.rank === player.rank && a.isBoss && a.passed
        );

        progressionDungeons.push({
            id: rankConfig.boss.id,
            name: rankConfig.boss.name,
            description: rankConfig.boss.description,
            rank: player.rank,
            type: "BOSS",
            mode: "PROGRESSION",
            locked: !bossEligibility.allowed,
            cleared: bossCleared,
            reason: bossEligibility.allowed ? null : bossEligibility.reason,
            cooldownRemaining: bossEligibility.cooldownRemaining || null,
            cooldownEnds: bossEligibility.cooldownEnds || null,
        });

        /**
         * =========================
         * PRACTICE DUNGEONS
         * (Lower ranks - for skill practice)
         * =========================
         */
        const currentIndex = getRankIndex(player.rank);
        const practiceDungeons = [];

        // Include all lower rank dungeons as practice
        for (let i = 0; i < currentIndex; i++) {
            const practiceRank = RANK_ORDER[i];
            const cfg = DUNGEON_CONFIG[practiceRank];

            if (!cfg) continue;

            for (const dungeon of cfg.normal || []) {
                practiceDungeons.push({
                    id: dungeon.id,
                    name: dungeon.name,
                    description: dungeon.description,
                    rank: practiceRank,
                    type: "NORMAL",
                    mode: "PRACTICE",
                    locked: false,
                    dungeonType: dungeon.dungeonType
                });
            }

            // Optional: include lower-rank bosses as practice too
            practiceDungeons.push({
                id: cfg.boss.id,
                name: cfg.boss.name,
                description: cfg.boss.description,
                rank: practiceRank,
                type: "BOSS",
                mode: "PRACTICE",
                locked: false,
            });
        }

        /**
         * =========================
         * PROGRESSION STATUS
         * =========================
         */
        const progressionStatus = {
            fundamentalsCleared: analysis.clearedFundamentals,
            fundamentalsRequired: rankConfig.fundamentalsRequired || 2,
            bossUnlocked: bossEligibility.allowed,
            bossCleared,
            currentStreak: analysis.currentStreak,
            streakBonus: analysis.streakBonus,
        };

        /**
         * =========================
         * FINAL RESPONSE (UI-READY)
         * =========================
         */
        return res.json({
            playerId,
            rank: player.rank,
            class: player.class,

            progressionStatus,
            progressionDungeons,
            practiceDungeons,

            nextStep: {
                type: recommendation.type.id,
                dungeonType: recommendation.type.dungeonType,
                description: recommendation.type.description,
                reason: recommendation.reason,
            },

            // For debugging/display
            analysis: {
                avgScore: analysis.avgScore,
                topWeaknesses: analysis.topWeaknesses,
            }
        });

    } catch (err) {
        console.error("Dungeon catalog error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
