import dotenv from "dotenv";
// Load .env before Prisma Client instantiation (only needed locally; Vercel injects env vars)
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: new URL("./.env", import.meta.url).pathname });
}

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
