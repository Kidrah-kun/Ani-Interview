import express from "express";
import cors from "cors";
import dungeonRoutes from "./api/dungeon/dungeon.routes.js";
import dungeonCatalogRoutes from "./api/dungeon/catalog.routes.js";
import healthRoutes from "./api/health.routes.js";
import playerRoutes from "./api/player/player.routes.js";
import guildRoutes from "./api/guild/guild.routes.js";

const app = express();

/**
 * Global middleware
 */
app.use(cors());
app.use(express.json());

/**
 * Routes
 */
app.use("/api/guild", guildRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/dungeon", dungeonRoutes);
app.use("/api/dungeon", dungeonCatalogRoutes);

export default app;

