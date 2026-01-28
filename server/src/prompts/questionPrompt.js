import { DUNGEON_CONFIG } from "../dungeon/config.js";

/**
 * Builds a prompt for generating interview questions
 * @param {Object} params
 * @param {string} params.rank - The dungeon rank (E, D, C, B, A, S, SS)
 * @param {string} params.role - The player's class/role
 * @param {boolean} params.isBoss - Whether this is a boss dungeon
 */
export function buildQuestionPrompt({ rank, role, isBoss }) {
  const config = DUNGEON_CONFIG[rank] || DUNGEON_CONFIG.E;
  const questionCount = isBoss ? config.questionCount : config.questionCount;
  const topics = config.topics || ["General programming"];

  const difficultyGuide = {
    E: "beginner-friendly, focusing on basic concepts",
    D: "slightly challenging, testing foundational knowledge",
    C: "intermediate, requiring practical experience",
    B: "advanced, expecting professional-level answers",
    A: "expert-level, requiring deep technical knowledge",
    S: "extremely challenging, testing architectural thinking",
    SS: "staff/principal engineer level, covering system-wide decisions"
  };

  return `
You are a senior technical interviewer conducting a ${rank}-rank ${isBoss ? "BOSS" : "standard"} interview.

Generate exactly ${questionCount} interview questions.

Difficulty Level: ${difficultyGuide[rank] || difficultyGuide.E}
Focus Topics: ${topics.join(", ")}

Constraints:
- Role: ${role || "Backend Engineer"}
- Rank: ${rank}${isBoss ? " (BOSS - make questions significantly harder)" : ""}
- No multiple choice
- Real interview style
- Increasing difficulty within the set
- No explanations, only questions
- Questions should match the expected knowledge of a ${rank}-rank ${role || "developer"}

Output as JSON:
{
  "questions": string[]
}
`;
}

