import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getDashboard, getProgression } from '../api/client'
import '../styles/dashboard.css'

// Role mapping
const roleMap = {
    'frontend': 'Frontend Developer',
    'backend': 'Backend Developer',
    'fullstack': 'Full Stack Developer',
    'mobile': 'Mobile Developer',
    'devops': 'DevOps Engineer',
    'data': 'Data Engineer',
    'ml': 'ML Engineer',
    'security': 'Security Engineer'
}

function Dashboard() {
    const navigate = useNavigate()
    const [playerData, setPlayerData] = useState({
        name: 'Unknown Hunter',
        id: 'SZ0-000000',
        rank: 'E',
        role: 'Hunter',
        avgScore: '--',
        dungeonRuns: 0,
        bossProgress: '0 / 1'
    })
    const [recommendation, setRecommendation] = useState({
        title: 'Guild Recommendation',
        text: 'Your journey as a Hunter begins here. Enter the dungeons to face interview challenges and prove your worth.'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load player data from localStorage
        const playerName = localStorage.getItem('playerName') || 'Unknown Hunter'
        const playerId = localStorage.getItem('playerId')
        const playerRank = localStorage.getItem('playerRank') || 'E'
        const techStack = localStorage.getItem('techStack') || 'Hunter'

        // Set initial data from localStorage
        setPlayerData(prev => ({
            ...prev,
            name: playerName,
            id: playerId || 'SZ0-000000',
            rank: playerRank,
            role: roleMap[techStack] || 'Hunter'
        }))

        // If we have a player ID from backend, fetch additional data
        if (playerId && playerId.length > 10) {
            fetchDashboardData(playerId)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchDashboardData = async (playerId) => {
        try {
            const [dashboardData, progressionData] = await Promise.all([
                getDashboard(playerId).catch(() => null),
                getProgression(playerId).catch(() => null)
            ])

            if (dashboardData) {
                setPlayerData(prev => ({
                    ...prev,
                    rank: dashboardData.rank || prev.rank,
                    avgScore: dashboardData.stats?.avgScore?.toFixed(1) || '--',
                    dungeonRuns: dashboardData.stats?.attempts || 0,
                    bossProgress: dashboardData.stats?.bossCleared ? '1 / 1' : '0 / 1'
                }))
            }

            if (progressionData?.nextStep) {
                setRecommendation({
                    title: 'Guild Recommendation',
                    text: progressionData.nextStep.description || recommendation.text
                })
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEnterDungeon = () => {
        navigate('/dungeons')
    }

    return (
        <div className="dashboard-container">
            {/* Background */}
            <div className="dashboard-bg"></div>
            <div className="vignette"></div>

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="main-content">
                {/* Left Panel: Player Identity */}
                <aside className="player-panel glass-panel">
                    <h3 className="panel-title">Player Identity</h3>

                    <div className="player-rank-display">
                        <div className="rank-icon">
                            <span>{playerData.rank}</span>
                        </div>
                        <div className="player-info">
                            <span className="info-label">Role</span>
                            <span className="info-value">{playerData.role}</span>
                        </div>
                    </div>

                    <div className="player-id-display">
                        <span className="info-label">Player ID</span>
                        <span className="player-id-value">
                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{playerData.id}</span>
                        </span>
                    </div>

                    <div className="player-name-display">
                        <span className="info-label">Hunter Name</span>
                        <span className="info-value">{playerData.name}</span>
                    </div>
                </aside>

                {/* Center: Guild Recommendation */}
                <section className="center-content">
                    <div className="stats-bar">
                        <div className="stat-item glass-panel">
                            <span className="stat-label">Average Score</span>
                            <div className="stat-value">
                                <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>{playerData.avgScore}</span>
                            </div>
                        </div>

                        <div className="stat-item glass-panel">
                            <span className="stat-label">Dungeon Runs</span>
                            <div className="stat-value">
                                <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18" />
                                    <path d="M18 17V9M13 17V5M8 17v-3" />
                                </svg>
                                <span>{playerData.dungeonRuns}</span>
                            </div>
                        </div>

                        <div className="stat-item glass-panel">
                            <span className="stat-label">Boss Progress</span>
                            <div className="stat-value">
                                <span>{playerData.bossProgress}</span>
                            </div>
                        </div>
                    </div>

                    <div className="recommendation-panel glass-panel">
                        <h2 className="recommendation-title">{recommendation.title}</h2>
                        <p className="recommendation-text">{recommendation.text}</p>

                        <button className="btn-dungeon" onClick={handleEnterDungeon}>
                            <span>Enter the Dungeons</span>
                        </button>
                    </div>
                </section>

                {/* Right Panel: Guild Emblem */}
                <aside className="emblem-panel">
                    <div className="guild-emblem">
                        <img src="/assets/dragon_logo.png" alt="Guild Emblem" className="emblem-img" />
                    </div>
                </aside>
            </main>
        </div>
    )
}

export default Dashboard
