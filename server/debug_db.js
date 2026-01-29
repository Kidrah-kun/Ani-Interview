import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'src/.env') });

import { prisma } from './src/prisma.js';

async function debug() {
    console.log('--- PLAYERS ---');
    const players = await prisma.player.findMany();
    console.log(JSON.stringify(players, null, 2));

    console.log('\n--- DUNGEON ATTEMPTS ---');
    const attempts = await prisma.dungeonAttempt.findMany();
    console.log(JSON.stringify(attempts, null, 2));
}

debug()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
