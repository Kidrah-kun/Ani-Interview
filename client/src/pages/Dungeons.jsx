import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getDungeonCatalog } from '../api/client'
import '../styles/dungeons.css'

// All ranks in order
const ALL_RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS']

// Complete dungeon config for display - varied dungeons with different question counts
const FULL_DUNGEON_CONFIG = {
    E: {
        normal: [
            { id: 'fundamentals', name: 'Fundamentals Dungeon', description: 'Core concepts every engineer must master', dungeonType: 'Fundamentals Dungeon', questions: 5 },
            { id: 'syntax_basics', name: 'Syntax Cavern', description: 'Basic syntax and coding conventions', dungeonType: 'Syntax Basics', questions: 4 },
            { id: 'logic_intro', name: 'Logic Gate', description: 'Simple logical operations', dungeonType: 'Logic Basics', questions: 3 },
            { id: 'data_types', name: 'Type Chamber', description: 'Understanding data types and variables', dungeonType: 'Data Types', questions: 6 },
            { id: 'control_flow', name: 'Flow Dungeon', description: 'Loops, conditions, and control structures', dungeonType: 'Control Flow', questions: 5 }
        ],
        boss: { id: 'rank_boss_e', name: 'The Gatekeeper', description: 'Prove you are ready to leave Rank E', questions: 8 }
    },
    D: {
        normal: [
            { id: 'problem_solving', name: 'Problem Solving Dungeon', description: 'Applied logic and debugging challenges', dungeonType: 'Problem Solving Dungeon', questions: 6 },
            { id: 'arrays_basics', name: 'Array Crypt', description: 'Array manipulation and iteration', dungeonType: 'Arrays', questions: 5 },
            { id: 'functions', name: 'Function Forge', description: 'Writing and calling functions', dungeonType: 'Functions', questions: 4 },
            { id: 'string_ops', name: 'String Sanctum', description: 'String operations and manipulation', dungeonType: 'Strings', questions: 5 },
            { id: 'debugging_101', name: 'Bug Nest', description: 'Find and fix common bugs', dungeonType: 'Debugging', questions: 7 }
        ],
        boss: { id: 'rank_boss_d', name: 'The Examiner', description: 'Tests real-world engineering readiness', questions: 8 }
    },
    C: {
        normal: [
            { id: 'api_basics', name: 'API Design Dungeon', description: 'RESTful design and endpoint architecture', dungeonType: 'API Design Dungeon', questions: 6 },
            { id: 'database_101', name: 'Database Dungeon', description: 'SQL, queries, and data modeling', dungeonType: 'Database Dungeon', questions: 7 },
            { id: 'oop_concepts', name: 'Object Vault', description: 'Object-oriented programming principles', dungeonType: 'OOP Concepts', questions: 5 },
            { id: 'git_mastery', name: 'Version Catacombs', description: 'Git workflows and version control', dungeonType: 'Git Mastery', questions: 4 },
            { id: 'testing_intro', name: 'Test Chamber', description: 'Unit testing and test-driven development', dungeonType: 'Testing Basics', questions: 5 },
            { id: 'http_basics', name: 'Protocol Passage', description: 'HTTP methods, headers, and status codes', dungeonType: 'HTTP Basics', questions: 6 }
        ],
        boss: { id: 'rank_boss_c', name: 'The Architect', description: 'Design systems under pressure', questions: 10 }
    },
    B: {
        normal: [
            { id: 'system_design_intro', name: 'System Design Dungeon', description: 'Scalability and architecture decisions', dungeonType: 'System Design Dungeon', questions: 7 },
            { id: 'auth_security', name: 'Security Dungeon', description: 'Authentication, authorization, and security', dungeonType: 'Security Dungeon', questions: 6 },
            { id: 'caching_layer', name: 'Cache Crypts', description: 'Caching strategies and implementation', dungeonType: 'Caching', questions: 5 },
            { id: 'async_patterns', name: 'Async Abyss', description: 'Asynchronous programming patterns', dungeonType: 'Async Programming', questions: 6 },
            { id: 'data_structures', name: 'Structure Stronghold', description: 'Advanced data structures', dungeonType: 'Data Structures', questions: 8 }
        ],
        boss: { id: 'rank_boss_b', name: 'The Guardian', description: 'Defend your architectural decisions', questions: 10 }
    },
    A: {
        normal: [
            { id: 'distributed_systems', name: 'Distributed Systems', description: 'CAP theorem, consistency, and partitioning', dungeonType: 'Distributed Systems', questions: 7 },
            { id: 'performance', name: 'Performance Dungeon', description: 'Optimization and profiling challenges', dungeonType: 'Performance Dungeon', questions: 6 },
            { id: 'microservices', name: 'Microservice Maze', description: 'Service decomposition and communication', dungeonType: 'Microservices', questions: 8 },
            { id: 'databases_adv', name: 'Database Depths', description: 'Advanced queries, indexing, optimization', dungeonType: 'Advanced Databases', questions: 7 },
            { id: 'cloud_infra', name: 'Cloud Citadel', description: 'Cloud architecture and services', dungeonType: 'Cloud Infrastructure', questions: 6 }
        ],
        boss: { id: 'rank_boss_a', name: 'The Judge', description: 'Your decisions will be scrutinized', questions: 12 }
    },
    S: {
        normal: [
            { id: 'ha_systems', name: 'High Availability', description: 'Design systems that never go down', dungeonType: 'High Availability', questions: 8 },
            { id: 'patterns', name: 'Design Patterns', description: 'Advanced architectural patterns', dungeonType: 'Design Patterns', questions: 7 },
            { id: 'event_driven', name: 'Event Horizon', description: 'Event-driven architecture and messaging', dungeonType: 'Event-Driven Architecture', questions: 6 },
            { id: 'ml_integration', name: 'ML Pipeline Pit', description: 'Integrating machine learning systems', dungeonType: 'ML Integration', questions: 5 },
            { id: 'observability', name: 'Observer\'s Tower', description: 'Logging, monitoring, and alerting', dungeonType: 'Observability', questions: 7 }
        ],
        boss: { id: 'rank_boss_s', name: 'The Titan', description: 'Only the elite survive', questions: 12 }
    },
    SS: {
        normal: [
            { id: 'staff_level', name: 'Staff Engineering', description: 'Decisions that shape organizations', dungeonType: 'Staff Engineering', questions: 8 },
            { id: 'trade_offs', name: 'Trade-off Analysis', description: 'There are no perfect solutions', dungeonType: 'Trade-off Analysis', questions: 7 },
            { id: 'tech_leadership', name: 'Leadership Labyrinth', description: 'Technical leadership and mentoring', dungeonType: 'Tech Leadership', questions: 6 },
            { id: 'org_design', name: 'Organization Nexus', description: 'Team structures and engineering culture', dungeonType: 'Org Design', questions: 5 },
            { id: 'strategy', name: 'Strategy Summit', description: 'Technical strategy and roadmapping', dungeonType: 'Technical Strategy', questions: 8 }
        ],
        boss: { id: 'rank_boss_ss', name: 'The Sovereign', description: 'The final challenge. Legendary awaits.', questions: 15 }
    }
}

function Dungeons() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [catalog, setCatalog] = useState(null)
    const [playerRank, setPlayerRank] = useState('E')
    const [fundamentalsCleared, setFundamentalsCleared] = useState(0)
    const [totalFundamentals, setTotalFundamentals] = useState(2)

    useEffect(() => {
        const playerId = localStorage.getItem('playerId')
        const rank = localStorage.getItem('playerRank') || 'E'
        setPlayerRank(rank)

        if (!playerId || playerId.length < 10) {
            navigate('/signup')
            return
        }

        fetchCatalog(playerId)
    }, [navigate])

    const fetchCatalog = async (playerId) => {
        try {
            setLoading(true)
            const data = await getDungeonCatalog(playerId)
            setCatalog(data)

            // Calculate fundamentals cleared from catalog
            if (data?.progressionDungeons) {
                const cleared = data.progressionDungeons.filter(d => d.cleared && d.type === 'NORMAL').length
                const total = data.progressionDungeons.filter(d => d.type === 'NORMAL').length
                setFundamentalsCleared(cleared)
                setTotalFundamentals(total || 2)
            }
        } catch (err) {
            console.error('Failed to fetch dungeon catalog:', err)
            setError('Failed to load dungeons. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDungeonClick = (dungeon, rank) => {
        if (dungeon.locked) return

        navigate(`/interview`, {
            state: {
                dungeonId: dungeon.id,
                dungeonName: dungeon.name,
                dungeonRank: rank,
                isBoss: dungeon.type === 'BOSS',
                mode: dungeon.mode || 'PROGRESSION',
                dungeonType: dungeon.dungeonType || dungeon.name,
                questionCount: dungeon.questions || 5
            }
        })
    }

    const getRankColor = (rank) => {
        const colors = {
            'E': '#8b8b8b',
            'D': '#4a9eff',
            'C': '#50c878',
            'B': '#daa520',
            'A': '#ff6b35',
            'S': '#9932cc',
            'SS': '#ff2a2a'
        }
        return colors[rank] || '#8b8b8b'
    }

    const getPlayerRankIndex = () => ALL_RANKS.indexOf(playerRank)

    const getDungeonStatus = (rank, dungeonId, isBoss = false) => {
        const playerRankIndex = getPlayerRankIndex()
        const dungeonRankIndex = ALL_RANKS.indexOf(rank)

        if (dungeonRankIndex > playerRankIndex) {
            return { status: 'LOCKED', mode: null }
        }

        if (dungeonRankIndex < playerRankIndex) {
            return { status: 'AVAILABLE', mode: 'PRACTICE' }
        }

        if (isBoss) {
            const bossDungeon = catalog?.progressionDungeons?.find(d => d.type === 'BOSS')
            if (bossDungeon?.locked) {
                return { status: 'LOCKED', mode: 'PROGRESSION', reason: bossDungeon.reason }
            }
            return { status: bossDungeon?.cleared ? 'CLEARED' : 'AVAILABLE', mode: 'PROGRESSION' }
        }

        const normalDungeon = catalog?.progressionDungeons?.find(d => d.id === dungeonId && d.type === 'NORMAL')
        return { status: normalDungeon?.cleared ? 'CLEARED' : 'AVAILABLE', mode: 'PROGRESSION' }
    }

    const buildRankDungeons = (rank) => {
        const config = FULL_DUNGEON_CONFIG[rank]
        if (!config) return []

        const dungeons = []

        config.normal.forEach(dungeon => {
            const { status, mode } = getDungeonStatus(rank, dungeon.id, false)
            dungeons.push({
                ...dungeon,
                rank,
                type: 'NORMAL',
                locked: status === 'LOCKED',
                cleared: status === 'CLEARED',
                mode
            })
        })

        const { status, mode, reason } = getDungeonStatus(rank, config.boss.id, true)
        dungeons.push({
            ...config.boss,
            rank,
            type: 'BOSS',
            locked: status === 'LOCKED',
            cleared: status === 'CLEARED',
            mode,
            reason,
            dungeonType: 'Boss Dungeon'
        })

        return dungeons
    }

    const isBossLocked = () => {
        const bossDungeon = catalog?.progressionDungeons?.find(d => d.type === 'BOSS')
        return bossDungeon?.locked !== false
    }

    const getRecommendation = () => {
        if (catalog?.nextStep?.description) {
            return catalog.nextStep.description
        }
        return 'Complete your first dungeon to begin your journey'
    }

    const getDungeonImage = (rank, type) => {
        if (type === 'BOSS') return '/assets/dungeons/boss_gate.png'

        const rankIndex = ALL_RANKS.indexOf(rank)
        if (rankIndex <= 1) return '/assets/dungeons/dungeon_easy.png' // E, D
        if (rankIndex <= 3) return '/assets/dungeons/dungeon_medium.png' // C, B
        return '/assets/dungeons/boss_arena.png' // A, S, SS
    }

    if (loading) {
        return (
            <div className="dungeons-page">
                <div className="dungeons-bg"></div>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading dungeons...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="dungeons-page">
                <div className="dungeons-bg"></div>
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        )
    }

    return (
        <div className="dungeons-page">
            {/* Background */}
            <div className="dungeons-bg"></div>

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="dungeons-content">
                {/* Header Section */}
                <header className="page-header">
                    <h1 className="page-title">Select Dungeon</h1>
                    <p className="page-subtitle">Choose your challenge, Hunter</p>
                </header>

                {/* Status Bar */}
                <div className="status-bar">
                    <div className="status-item">
                        <span className="status-label">Current Rank</span>
                        <span className="status-value" style={{ color: getRankColor(playerRank) }}>{playerRank}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Fundamentals Cleared</span>
                        <span className="status-value">{fundamentalsCleared} / {totalFundamentals}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Boss Status</span>
                        <span className={`status-value ${isBossLocked() ? 'locked' : 'unlocked'}`}>
                            {isBossLocked() ? 'LOCKED' : 'UNLOCKED'}
                        </span>
                    </div>
                </div>

                {/* Guild Recommendation Banner */}
                <div className="recommendation-banner">
                    <span className="rec-label">GUILD RECOMMENDATION</span>
                    <span className="rec-text">{getRecommendation()}</span>
                </div>

                {/* Rank Sections */}
                <div className="rank-sections">
                    {ALL_RANKS.map(rank => {
                        const dungeons = buildRankDungeons(rank)
                        const isLocked = ALL_RANKS.indexOf(rank) > getPlayerRankIndex()

                        return (
                            <section key={rank} className={`rank-section ${isLocked ? 'locked' : ''}`}>
                                <div className="rank-header">
                                    <span className="rank-badge" style={{ backgroundColor: getRankColor(rank) }}>{rank}</span>
                                    <h2 className="rank-title">Rank {rank} Dungeons</h2>
                                    {isLocked && <span className="locked-indicator">🔒 Locked</span>}
                                </div>

                                <div className="dungeon-cards">
                                    {dungeons.map(dungeon => (
                                        <div
                                            key={dungeon.id}
                                            className={`dungeon-card ${dungeon.type.toLowerCase()} ${dungeon.locked ? 'locked' : ''} ${dungeon.cleared ? 'cleared' : ''}`}
                                            onClick={() => handleDungeonClick(dungeon, rank)}
                                        >
                                            <div className="card-image-container">
                                                <img
                                                    src={getDungeonImage(rank, dungeon.type)}
                                                    alt={dungeon.name}
                                                    className="card-image"
                                                />
                                                <div className="card-overlay"></div>
                                            </div>

                                            <div className="card-content">
                                                <div className="card-header">
                                                    <div className="card-title">{dungeon.name}</div>
                                                </div>

                                                <div className="card-body">
                                                    <div className={`rank-square ${dungeon.type === 'BOSS' ? 'boss' : ''}`}>
                                                        <span className="rank-letter">{rank}</span>
                                                    </div>
                                                    <div className="dungeon-details">
                                                        <div className="dungeon-type">{dungeon.type === 'BOSS' ? 'Boss Raid' : 'Training'}</div>
                                                        <div className="dungeon-questions">{dungeon.questions} Zones</div>
                                                    </div>
                                                </div>

                                                <div className="card-footer">
                                                    <span className={`availability ${dungeon.locked ? 'locked' : dungeon.cleared ? 'cleared' : 'available'}`}>
                                                        {dungeon.locked ? 'Locked' : dungeon.cleared ? '✓ Cleared' : 'Available'}
                                                    </span>
                                                    {dungeon.locked && <div className="lock-icon-overlay">🔒</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </div>

                {/* Your Rank Indicator */}
                <div className="your-rank-indicator">
                    <button className="your-rank-btn" style={{ borderColor: getRankColor(playerRank) }}>
                        <span>Your Rank</span>
                        <span className="rank-value" style={{ color: getRankColor(playerRank) }}>{playerRank}</span>
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Dungeons
