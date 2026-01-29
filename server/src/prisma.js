import dotenv from "dotenv";
// Load .env before Prisma Client instantiation
dotenv.config({ path: new URL("./.env", import.meta.url).pathname });

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
