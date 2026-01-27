import { callLLM } from "../services/llm.service.js";
import { buildEvaluationPrompt } from "../prompts/evaluationPrompt.js";

function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No valid JSON found in LLM output");
  }

  return JSON.parse(text.slice(start, end + 1));
}

export async function evaluateAnswer({ rank, question, answer }) {
  const prompt = buildEvaluationPrompt({ rank, question, answer });
  const response = await callLLM(prompt);

  try {
    return extractJSON(response);
  } catch (err) {
    return {
      score: 0,
      feedback: "Evaluation failed due to malformed AI output.",
      missingPoints: ["Clear explanation", "Structured answer"],
      idealAnswer: "No ideal answer generated."
    };
  }
}
