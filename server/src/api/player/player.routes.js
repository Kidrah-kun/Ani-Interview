import { Router } from "express";
import { prisma } from "../../prisma.js";

const router = Router();

// Register player
router.post("/register", async (req, res) => {
  const { class: playerClass } = req.body;

  const player = await prisma.player.create({
    data: {
      rank: "E",
      class: playerClass || null,
      weaknesses: [],
    },
  });

  res.json(player);
});

// Get player
router.get("/:id", async (req, res) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
  });

  if (!player) {
    return res.status(404).json({ error: "Player not found" });
  }

  res.json(player);
});

// Dashboard
router.get("/:id/dashboard", async (req, res) => {
  const playerId = req.params.id;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    return res.status(404).json({ error: "Player not found" });
  }

  const attempts = await prisma.dungeonAttempt.findMany({
    where: { playerId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const avgScore =
    attempts.reduce((a, b) => a + b.avgScore, 0) /
    (attempts.length || 1);

  res.json({
    rank: player.rank,
    class: player.class,
    stats: {
      avgScore,
      attempts: attempts.length,
      bossCleared: attempts.some(a => a.isBoss && a.passed),
    },
    weaknesses: player.weaknesses,
    recentAttempts: attempts.map(a => ({
      rank: a.rank,
      avgScore: a.avgScore,
      passed: a.passed,
    })),
  });
});

export default router;
