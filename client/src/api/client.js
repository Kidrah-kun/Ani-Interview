/**
 * API Client for Ani-Interview Backend
 * Connects to Express server on port 3001
 */

const API_BASE = '/api';

/**
 * Register a new player
 * @param {string} playerClass - The player's tech stack/class
 * @returns {Promise<{id: string, rank: string, class: string}>}
 */
export async function registerPlayer(playerClass) {
    const response = await fetch(`${API_BASE}/player/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class: playerClass }),
    });

    if (!response.ok) {
        throw new Error('Failed to register player');
    }

    return response.json();
}

/**
 * Get player by ID
 * @param {string} id - Player ID
 * @returns {Promise<{id: string, rank: string, class: string, weaknesses: string[]}>}
 */
export async function getPlayer(id) {
    const response = await fetch(`${API_BASE}/player/${id}`);

    if (!response.ok) {
        throw new Error('Player not found');
    }

    return response.json();
}

/**
 * Get player dashboard data
 * @param {string} id - Player ID
 * @returns {Promise<{rank: string, class: string, stats: object, weaknesses: string[], recentAttempts: array}>}
 */
export async function getDashboard(id) {
    const response = await fetch(`${API_BASE}/player/${id}/dashboard`);

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
    }

    return response.json();
}

/**
 * Get guild progression data
 * @param {string} playerId - Player ID
 * @returns {Promise<{playerId: string, rank: string, progression: object, nextStep: object}>}
 */
export async function getProgression(playerId) {
    const response = await fetch(`${API_BASE}/guild/progression/${playerId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch progression');
    }

    return response.json();
}

/**
 * Get dungeon catalog for a player
 * @param {string} playerId - Player ID
 * @returns {Promise<{progressionDungeons, practiceDungeons, progressionStatus, nextStep}>}
 */
export async function getDungeonCatalog(playerId) {
    const response = await fetch(`${API_BASE}/dungeon/catalog/${playerId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch dungeon catalog');
    }

    return response.json();
}

/**
 * Start a dungeon attempt
 * @param {string} playerId - Player ID
 * @param {string} dungeonType - Type of dungeon
 * @param {boolean} isBoss - Whether this is a boss dungeon
 * @param {string} dungeonRank - Rank of the dungeon
 * @returns {Promise<{attemptId: string, questions: array, rank: string, mode: string}>}
 */
export async function startDungeon(playerId, dungeonType, isBoss, dungeonRank) {
    const response = await fetch(`${API_BASE}/dungeon/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            playerId,
            dungeonType,
            isBoss,
            dungeonRank
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.reason || error.error || 'Failed to start dungeon');
    }

    return response.json();
}

/**
 * Submit answers for a dungeon attempt
 * @param {string} attemptId - The dungeon attempt ID
 * @param {Array<{questionId: string, answerText: string}>} answers - Array of answers
 * @returns {Promise<{passed: boolean, scoring: object, feedback: array, rankUpdate: object}>}
 */
export async function submitAnswers(attemptId, answers) {
    const response = await fetch(`${API_BASE}/dungeon/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            attemptId,
            answers
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Failed to submit answers');
    }

    return response.json();
}

/**
 * Get the global leaderboard
 * @returns {Promise<Array<{id: string, rank: string, class: string, score: number}>>}
 */
export async function getLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/player/public/leaderboard`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

/**
 * Get player's dungeon history
 * @param {string} playerId - Player ID
 * @returns {Promise<Array>} List of attempts
 */
export async function getPlayerHistory(playerId) {
    const response = await fetch(`${API_BASE}/player/${playerId}/history`);

    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }

    return response.json();
}
