import { generateQuestions } from "./ai/questionGenerator.js";

(async () => {
  const questions = await generateQuestions({
    rank: "E",
    role: "Backend Engineer",
    isBoss: false
  });

  console.log(questions);
})();
