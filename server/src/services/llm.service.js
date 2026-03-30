import Groq from "groq-sdk";
import dotenv from "dotenv";
if (!process.env.GROQ_API_KEY) {
  dotenv.config({ path: "src/.env" });
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callLLM(prompt) {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });
  return completion.choices[0]?.message?.content || "";
}
