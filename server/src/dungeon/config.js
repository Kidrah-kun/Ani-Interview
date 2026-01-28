/**
 * Dungeon Configuration by Rank
 * 
 * SINGLE SOURCE OF TRUTH for:
 * - What dungeons exist per rank
 * - Difficulty settings
 * - Pass thresholds
 * 
 * Rules / logic do NOT live here - this is pure metadata.
 */
export const DUNGEON_CONFIG = {
  E: {
    fundamentalsRequired: 2,
    questionCount: 3,
    strictness: 50,
    passScore: 50,
    bossBonus: 10,
    topics: ["Basic syntax", "Simple algorithms", "Fundamentals"],
    normal: [
      {
        id: "fundamentals",
        name: "Fundamentals Dungeon",
        description: "Core concepts every engineer must master",
        dungeonType: "Fundamentals Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_e",
      name: "The Gatekeeper",
      description: "Prove you are ready to leave Rank E"
    }
  },

  D: {
    fundamentalsRequired: 2,
    questionCount: 3,
    strictness: 55,
    passScore: 55,
    bossBonus: 10,
    topics: ["Data structures", "Basic OOP", "Simple debugging"],
    normal: [
      {
        id: "problem_solving",
        name: "Problem Solving Dungeon",
        description: "Applied logic and debugging challenges",
        dungeonType: "Fundamentals Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_d",
      name: "The Examiner",
      description: "Tests real-world engineering readiness"
    }
  },

  C: {
    fundamentalsRequired: 2,
    questionCount: 4,
    strictness: 60,
    passScore: 60,
    bossBonus: 10,
    topics: ["API design", "Database basics", "Error handling"],
    normal: [
      {
        id: "api_basics",
        name: "API Design Dungeon",
        description: "RESTful design and endpoint architecture",
        dungeonType: "API Design Dungeon"
      },
      {
        id: "database_101",
        name: "Database Dungeon",
        description: "SQL, queries, and data modeling",
        dungeonType: "Fundamentals Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_c",
      name: "The Architect",
      description: "Design systems under pressure"
    }
  },

  B: {
    fundamentalsRequired: 2,
    questionCount: 4,
    strictness: 65,
    passScore: 65,
    bossBonus: 10,
    topics: ["System design basics", "Caching", "Authentication"],
    normal: [
      {
        id: "system_design_intro",
        name: "System Design Dungeon",
        description: "Scalability and architecture decisions",
        dungeonType: "System Design Dungeon"
      },
      {
        id: "auth_security",
        name: "Security Dungeon",
        description: "Authentication, authorization, and security",
        dungeonType: "Fundamentals Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_b",
      name: "The Guardian",
      description: "Defend your architectural decisions"
    }
  },

  A: {
    fundamentalsRequired: 3,
    questionCount: 5,
    strictness: 70,
    passScore: 70,
    bossBonus: 10,
    topics: ["Distributed systems", "Scalability", "Performance tuning"],
    normal: [
      {
        id: "distributed_systems",
        name: "Distributed Systems Dungeon",
        description: "CAP theorem, consistency, and partitioning",
        dungeonType: "System Design Dungeon"
      },
      {
        id: "performance",
        name: "Performance Dungeon",
        description: "Optimization and profiling challenges",
        dungeonType: "Fundamentals Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_a",
      name: "The Judge",
      description: "Your decisions will be scrutinized"
    }
  },

  S: {
    fundamentalsRequired: 3,
    questionCount: 5,
    strictness: 80,
    passScore: 75,
    bossBonus: 10,
    topics: ["Architecture patterns", "High availability", "Advanced optimization"],
    normal: [
      {
        id: "ha_systems",
        name: "High Availability Dungeon",
        description: "Design systems that never go down",
        dungeonType: "System Design Dungeon"
      },
      {
        id: "patterns",
        name: "Design Patterns Dungeon",
        description: "Advanced architectural patterns",
        dungeonType: "System Design Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_s",
      name: "The Titan",
      description: "Only the elite survive"
    }
  },

  SS: {
    fundamentalsRequired: 3,
    questionCount: 6,
    strictness: 90,
    passScore: 80,
    bossBonus: 10,
    topics: ["Staff-level decisions", "Trade-off analysis", "System-wide impact"],
    normal: [
      {
        id: "staff_level",
        name: "Staff Engineering Dungeon",
        description: "Decisions that shape entire organizations",
        dungeonType: "System Design Dungeon"
      },
      {
        id: "trade_offs",
        name: "Trade-off Analysis Dungeon",
        description: "There are no perfect solutions",
        dungeonType: "System Design Dungeon"
      }
    ],
    boss: {
      id: "rank_boss_ss",
      name: "The Sovereign",
      description: "The final challenge. Legendary status awaits."
    }
  }
};

/**
 * Rank order for progression checks
 */
export const RANK_ORDER = ["E", "D", "C", "B", "A", "S", "SS"];

/**
 * Get next rank in progression
 */
export function getNextRank(currentRank) {
  const index = RANK_ORDER.indexOf(currentRank);
  if (index === -1 || index >= RANK_ORDER.length - 1) return null;
  return RANK_ORDER[index + 1];
}

/**
 * Check if a rank is valid
 */
export function isValidRank(rank) {
  return RANK_ORDER.includes(rank);
}

/**
 * Get rank index (0 = E, 6 = SS)
 */
export function getRankIndex(rank) {
  return RANK_ORDER.indexOf(rank);
}

