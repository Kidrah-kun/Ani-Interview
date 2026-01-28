/**
 * Commission types - dungeons recommended by the Guild Master
 * Each commission targets specific skills or weaknesses
 */
export const COMMISSIONS = {
  FUNDAMENTALS: {
    id: "fundamentals",
    dungeonType: "Fundamentals Dungeon",
    description: "Reinforce core concepts",
    priority: 1
  },
  SYSTEM_DESIGN: {
    id: "system_design",
    dungeonType: "System Design Dungeon",
    description: "Improve architecture and scalability thinking",
    priority: 2
  },
  TRANSACTIONS: {
    id: "transactions",
    dungeonType: "Transactions & Consistency Dungeon",
    description: "Fix database and consistency weaknesses",
    priority: 2
  },
  ALGORITHMS: {
    id: "algorithms",
    dungeonType: "Algorithm Challenge Dungeon",
    description: "Strengthen problem-solving and algorithmic thinking",
    priority: 2
  },
  API_DESIGN: {
    id: "api_design",
    dungeonType: "API Design Dungeon",
    description: "Master RESTful design and API best practices",
    priority: 2
  },
  DEBUGGING: {
    id: "debugging",
    dungeonType: "Bug Hunt Dungeon",
    description: "Sharpen debugging and troubleshooting skills",
    priority: 2
  },
  WARMUP: {
    id: "warmup",
    dungeonType: "Warmup Dungeon",
    description: "Quick practice before boss fight",
    priority: 3
  },
  BOSS_RETRY: {
    id: "boss_retry",
    dungeonType: "Rank Boss Dungeon",
    description: "Challenge the rank boss for promotion",
    priority: 4
  }
};

/**
 * Map common weakness keywords to commission types
 */
export const WEAKNESS_TO_COMMISSION = {
  "System Design": COMMISSIONS.SYSTEM_DESIGN,
  "Transactions": COMMISSIONS.TRANSACTIONS,
  "Consistency": COMMISSIONS.TRANSACTIONS,
  "Algorithm": COMMISSIONS.ALGORITHMS,
  "Algorithms": COMMISSIONS.ALGORITHMS,
  "Data Structures": COMMISSIONS.ALGORITHMS,
  "API": COMMISSIONS.API_DESIGN,
  "REST": COMMISSIONS.API_DESIGN,
  "Debugging": COMMISSIONS.DEBUGGING,
  "Error Handling": COMMISSIONS.DEBUGGING,
  "Default": COMMISSIONS.FUNDAMENTALS
};

