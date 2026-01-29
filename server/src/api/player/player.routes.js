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

// Get Leaderboard (Must be before /:id to avoid collision)
router.get("/public/leaderboard", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      take: 100,
    });

    const rankOrder = { "SS": 7, "S": 6, "A": 5, "B": 4, "C": 3, "D": 2, "E": 1 };

    const sortedPlayers = players.sort((a, b) => {
      const rankA = rankOrder[a.rank] || 0;
      const rankB = rankOrder[b.rank] || 0;
      if (rankA !== rankB) return rankB - rankA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const topPlayers = sortedPlayers.slice(0, 10).map((p, index) => ({
      rank: index + 1,
      name: `Hunter ${p.id.slice(-6).toUpperCase()}`,
      realRank: p.rank,
      class: p.class || "Unknown Class",
      title: getTitleForClass(p.class),
      id: p.id
    }));

    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
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

// Get Player History
router.get("/:id/history", async (req, res) => {
  const playerId = req.params.id;

  try {
    const attempts = await prisma.dungeonAttempt.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" },
    });

    const history = attempts.map((a) => ({
      id: a.id,
      dungeonName: a.isBoss
        ? `${a.rank}-Rank Boss Room`
        : `${a.rank}-Rank ${a.mode === 'PRACTICE' ? 'Training' : 'Dungeon'}`,
      rank: a.rank,
      date: new Date(a.createdAt).toISOString().split("T")[0],
      status: a.passed ? "VICTORY" : "DEFEAT",
      score: `${Math.round(a.avgScore * 10) / 10}/10`,
      rewards: a.passed ? "EXP + Status" : "-",
    }));

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Helper for titles
function getTitleForClass(role) {
  const titles = {
    'frontend': 'Interface Architect',
    'backend': 'System Overlord',
    'fullstack': 'Grand Weaver',
    'mobile': 'Pathfinder',
    'devops': 'Infrastructure Titan',
    'data': 'Knowledge Keeper',
    'ml': 'Artificial Mind',
    'security': 'Gate Guardian',
    'null': 'Wandering Soul'
  };
  return titles[role] || 'Novice Adventurer';
}

export default router;
