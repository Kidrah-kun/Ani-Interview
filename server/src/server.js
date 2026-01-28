import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });
import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🧙 Guild Server running on port ${PORT}`);
});
