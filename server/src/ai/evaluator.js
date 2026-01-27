import { callLLM } from "../services/llm.service.js";
import { buildEvaluationPrompt } from "../prompts/evaluationPrompt.js";

export async function evaluateAnswer({ rank, question, answer }) {
  const prompt = buildEvaluationPrompt({ rank, question, answer });
  const response = await callLLM(prompt);

  return JSON.parse(response);
}
