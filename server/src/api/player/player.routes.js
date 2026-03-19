import { Router } from "express";
import { prisma } from "../../prisma.js";

import bcrypt from "bcrypt";

const router = Router();

// Register player
router.post("/register", async (req, res) => {
  try {
    const { class: playerClass, name, email, password } = req.body;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (email) {
      const existing = await prisma.player.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const player = await prisma.player.create({
      data: {
        name: name || null,
        email: email || null,
        password: hashedPassword,
        rank: "E",
        class: playerClass || null,
        weaknesses: [],
      },
    });

    res.json(player);
  } catch (error) {
    console.error("Error registering player:", error);
    res.status(500).json({ error: "Failed to register player" });
  }
});

// Login player
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const player = await prisma.player.findUnique({ where: { email } });

    if (!player) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!player.password) {
      return res.status(401).json({ error: "Legacy account. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json(player);
  } catch (error) {
    console.error("Error logging in player:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get Leaderboard (Must be before /:id to avoid collision)
router.get("/public/leaderboard", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { playerId } = req.query;

    const allPlayers = await prisma.player.findMany();

    // Fetch average scores for all players based on their non-practice attempts
    const attemptAggregations = await prisma.dungeonAttempt.groupBy({
      by: ['playerId'],
      _avg: { avgScore: true },
      where: { mode: { not: "PRACTICE" } }
    });

    const scoreMap = {};
    for (const agg of attemptAggregations) {
      scoreMap[agg.playerId] = agg._avg.avgScore || 0;
    }

    const rankOrder = { "SS": 7, "S": 6, "A": 5, "B": 4, "C": 3, "D": 2, "E": 1 };

    const sortedPlayers = allPlayers.sort((a, b) => {
      // 1. Sort by Rank (Higher is better)
      const rankA = rankOrder[a.rank] || 0;
      const rankB = rankOrder[b.rank] || 0;
      if (rankA !== rankB) return rankB - rankA;

      // 2. Secondary sort by Average Score (Higher is better)
      const scoreA = scoreMap[a.id] || 0;
      const scoreB = scoreMap[b.id] || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      // 3. Fallback to registration time (Earlier is better)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const total = sortedPlayers.length;
    const paginated = sortedPlayers.slice(skip, skip + limit);

    const players = paginated.map((p, index) => ({
      rank: skip + index + 1,
      name: p.name || `Hunter ${p.id.slice(-6).toUpperCase()}`,
      realRank: p.rank,
      score: (scoreMap[p.id] || 0).toFixed(1),
      class: p.class || "Unknown Class",
      title: getTitleForClass(p.class),
      id: p.id
    }));

    // Compute current player's global position
    const currentPlayerPosition = playerId
      ? sortedPlayers.findIndex(p => p.id === playerId) + 1
      : null;

    res.json({
      players,
      page,
      limit,
      total,
      hasMore: skip + limit < total,
      currentPlayerPosition: currentPlayerPosition || null,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get player
router.get("/:id", async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ error: "Player not found" });
  }
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
  if (!playerId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ error: "Player not found" });
  }

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
  if (!playerId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ error: "Player not found" });
  }

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
