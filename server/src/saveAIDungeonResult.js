import { prisma } from "./prisma.js";
import { runAIDungeon } from "./dungeon/aiDungeonRunner.js";
import { extractWeakAreas } from "./utils/weaknessExtractor.js";
import { compressEvaluations } from "./utils/questionCompressor.js";

async function main() {
  const player = await prisma.player.findFirst();
  if (!player) throw new Error("No player found");

  const answers = [
    "I would design the API efficiently",
    "Consistency can be managed using transactions",
    "Caching improves performance"
  ];

  const result = await runAIDungeon({
    rank: player.rank,
    role: "Backend Engineer",
    isBoss: false,
    answers
  });

  const weakAreas = extractWeakAreas(result.evaluations);
  const questionMeta = compressEvaluations(result.evaluations);

  await prisma.dungeonAttempt.create({
    data: {
      playerId: player.id,
      rank: player.rank,
      role: "Backend Engineer",
      avgScore: result.avgScore,
      passed: result.avgScore >= 6,
      weakAreas,
      questionMeta
    }
  });

  console.log("AI Dungeon result saved");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
