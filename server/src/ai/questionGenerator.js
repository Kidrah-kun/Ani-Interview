import { callLLM } from "../services/llm.service.js";
import { buildQuestionPrompt } from "../prompts/questionPrompt.js";

export async function generateQuestions({ rank, role, isBoss }) {
  const prompt = buildQuestionPrompt({ rank, role, isBoss });
  const response = await callLLM(prompt);

  const parsed = JSON.parse(response);
  return parsed.questions;
}
