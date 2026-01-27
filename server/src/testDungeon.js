import { runDungeon } from "./dungeon/engine.js";

const result = runDungeon("E", [
  "Indexing improves query performance by reducing scans",
  "Normalization removes redundancy",
  "Transactions ensure consistency"
]);

console.log(result);
