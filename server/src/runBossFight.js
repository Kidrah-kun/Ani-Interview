import { prisma } from "./prisma.js";
import { runBossDungeon } from "./dungeon/bossEngine.js";

async function main() {
  const player = await prisma.player.findFirst();
  if (!player) throw new Error("No player found");

  // Fake boss questions (AI later)
  const questions = [
    "Explain database indexing deeply",
    "What happens during a transaction rollback?",
    "How would you design a scalable cache?"
  ];

  const answers = [
    "Indexing uses data structures to reduce disk scans",
    "Rollback restores the database to a previous consistent state",
    "Use distributed cache with eviction strategies"
  ];

  const result = runBossDungeon(player, answers);

  // Save boss attempt
  await prisma.dungeonAttempt.create({
    data: {
      playerId: player.id,
      rank: player.rank,
      questions,
      answers,
      avgScore: result.avgScore,
      passed: result.passed,
      isBoss: true
    }
  });

  // Rank up ONLY if boss passed
  if (result.rankUp && result.nextRank) {
    await prisma.player.update({
      where: { id: player.id },
      data: { rank: result.nextRank }
    });

    console.log(`🏆 Boss defeated. Rank upgraded to ${result.nextRank}`);
  } else {
    console.log("❌ Boss defeated you. Rank unchanged.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
