export function buildQuestionPrompt({ rank, role, isBoss }) {
  return `
You are a senior technical interviewer.

Generate ${isBoss ? "3 HARD" : "3"} interview questions.

Constraints:
- Role: ${role || "Backend Engineer"}
- Rank: ${rank}
- No multiple choice
- Real interview style
- Increasing difficulty
- No explanations, only questions

Output as JSON:
{
  "questions": string[]
}
`;
}
