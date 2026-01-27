export function extractWeakAreas(evaluations) {
  const weaknesses = new Set();

  for (const evaln of evaluations) {
    if (evaln.score <= 4) {
      evaln.missingPoints.forEach(point => {
        // Normalize into short tags
        if (point.toLowerCase().includes("transaction"))
          weaknesses.add("Transactions");

        if (point.toLowerCase().includes("index"))
          weaknesses.add("Indexing");

        if (point.toLowerCase().includes("cache"))
          weaknesses.add("Caching");

        if (point.toLowerCase().includes("architecture"))
          weaknesses.add("System Design");
      });
    }
  }

  return [...weaknesses];
}
