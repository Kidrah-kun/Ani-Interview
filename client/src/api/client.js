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
