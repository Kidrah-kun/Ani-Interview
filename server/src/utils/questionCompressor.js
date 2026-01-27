export function compressEvaluations(evaluations) {
  return evaluations.map(e => ({
    s: e.score,
    f: e.feedback.slice(0, 120), // short feedback only
    m: e.missingPoints.length
  }));
}
