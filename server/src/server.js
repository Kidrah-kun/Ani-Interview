import dotenv from "dotenv";
dotenv.config({ path: "src/.env" });
import app from "./app.js";

const PORT = process.env.PORT || 3001;

// Catch unhandled rejections so the process doesn't silently die
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`🧙 Guild Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Kill the old process first: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
