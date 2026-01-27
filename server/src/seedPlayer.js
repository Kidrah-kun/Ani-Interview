import { prisma } from "./prisma.js";

async function main() {
  const player = await prisma.player.create({
    data: {
      rank: "E",
      class: null,
      weaknesses: []
    }
  });

  console.log("Player created:", player);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
