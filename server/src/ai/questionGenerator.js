import { callLLM } from "../services/llm.service.js";
import { buildQuestionPrompt } from "../prompts/questionPrompt.js";

export async function generateQuestions({ rank, role, isBoss }) {
  const prompt = buildQuestionPrompt({ rank, role, isBoss });
  const response = await callLLM(prompt);

  try {
    // Try to extract JSON from the response (LLM might include extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    }

    // Direct parse attempt
    const parsed = JSON.parse(response);
    return parsed.questions;
  } catch (err) {
    console.error("Failed to parse LLM response:", err.message);
    console.error("Raw response:", response);

    // Fallback: return default questions based on rank
    return [
      `Explain a fundamental concept in ${role || "backend development"} that every ${rank}-rank developer should know.`,
      `Describe a common problem you might encounter as a ${role || "backend engineer"} and how you would solve it.`,
      `What best practices would you follow when building a production-ready API?`
    ];
  }
}
