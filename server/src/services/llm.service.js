import fetch from "node-fetch";

export async function callLLM(prompt) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral:latest",
      prompt,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}
