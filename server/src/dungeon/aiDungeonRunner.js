import { generateQuestions } from "../ai/questionGenerator.js";
import { evaluateAnswer } from "../ai/evaluator.js";

export async function runAIDungeon({ rank, role, answers, isBoss }) {
  const questions = await generateQuestions({ rank, role, isBoss });

  const evaluations = [];
  let totalScore = 0;

  for (let i = 0; i < questions.length; i++) {
    const evaluation = await evaluateAnswer({
      rank,
      question: questions[i],
      answer: answers[i] || ""
    });

    totalScore += evaluation.score;
    evaluations.push({
      question: questions[i],
      answer: answers[i],
      ...evaluation
    });
  }

  const avgScore = totalScore / questions.length;

  return {
    questions,
    evaluations,
    avgScore
  };
}
