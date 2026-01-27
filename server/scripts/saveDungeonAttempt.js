import { prisma } from "./prisma.js";
import { runDungeon } from "./dungeon/engine.js";

async function main() {
  // 1. Get first player
  const player = await prisma.player.findFirst();
  if (!player) throw new Error("No player found");

  // 2. Fake dungeon data (AI comes later)
  const questions = [
    "What is indexing?",
    "Explain normalization",
    "What is a transaction?"
  ];

  const answers = [
    "Indexing improves query performance by reducing scans",
    "Normalization removes redundancy",
    "Transactions ensure consistency"
  ];

  // 3. Evaluate dungeon
  const result = runDungeon(player.rank, answers);

  // 4. Save attempt
  const attempt = await prisma.dungeonAttempt.create({
    data: {
      playerId: player.id,
      rank: player.rank,
      questions,
      answers,
      avgScore: result.avgScore,
      passed: result.passed
    }
  });

  console.log("Dungeon attempt saved:", attempt);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
