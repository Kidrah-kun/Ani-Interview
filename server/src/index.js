import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

import { callLLM } from "./services/llm.service.js";

(async () => {
  const res = await callLLM("Ask me one backend interview question.");
  console.log(res);
})();



app.listen(3000, () => {
  console.log("Server running on port 3000");
});
