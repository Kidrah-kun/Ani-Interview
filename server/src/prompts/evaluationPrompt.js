import { DUNGEON_CONFIG } from "../dungeon/config.js";

/**
 * Builds a prompt for evaluating interview answers
 * @param {Object} params
 * @param {string} params.rank - The dungeon rank (E, D, C, B, A, S, SS)
 * @param {string} params.question - The interview question
 * @param {string} params.answer - The candidate's answer
 */
export function buildEvaluationPrompt({ rank, question, answer }) {
  const config = DUNGEON_CONFIG[rank] || DUNGEON_CONFIG.E;
  const strictness = config.strictness || 50;

  // Determine strictness level description
  const strictnessGuide = {
    50: "lenient - focus on understanding core concepts",
    55: "fair - expect basic competency",
    60: "moderate - expect clear, structured answers",
    65: "strict - expect professional-level depth",
    70: "very strict - expect comprehensive knowledge",
    80: "extremely strict - expect expert-level precision",
    90: "ruthless - only perfect answers score high"
  };

  const strictnessDesc = strictnessGuide[strictness] || strictnessGuide[50];

  return `
You are a strict technical interviewer evaluating a ${rank}-rank candidate.

Strictness Level: ${strictness}/100 (${strictnessDesc})

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer according to ${rank}-rank standards.

RULES (MANDATORY):
- Respond with VALID JSON ONLY
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include code fences
- Do NOT include any text before or after JSON
- Escape all quotes properly
- Output MUST start with { and end with }

Scoring Rules (${strictness}% strictness):
- Score from 0 to 10 (integers only)
- ${rank === "E" || rank === "D" ? "Be encouraging but fair" : "Be demanding and precise"}
- ${strictness >= 70 ? "Penalize any vagueness heavily" : "Minor vagueness is acceptable"}
- ${strictness >= 80 ? "Expect specific technical details and examples" : "General understanding is acceptable"}
- Identify ALL missing or weak points
- Provide a concrete ideal answer

Return ONLY this JSON format:

{
  "score": number,
  "feedback": string,
  "missingPoints": string[],
  "idealAnswer": string
}
`;
}

