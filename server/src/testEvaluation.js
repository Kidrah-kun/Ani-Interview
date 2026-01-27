import { evaluateAnswer } from "./ai/evaluator.js";

(async () => {
  const result = await evaluateAnswer({
    rank: "E",
    question: "What is database indexing?",
    answer: "It makes database queries faster."
  });

  console.log(result);
})();
