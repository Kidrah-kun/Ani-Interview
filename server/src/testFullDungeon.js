import { runAIDungeon } from "./dungeon/aiDungeonRunner.js";

(async () => {
  const result = await runAIDungeon({
    rank: "E",
    role: "Backend Engineer",
    isBoss: false,
    answers: [
      "I would design the API efficiently",
      "Consistency can be managed using transactions",
      "Caching improves performance"
    ]
  });

  console.dir(result, { depth: null });
})();
