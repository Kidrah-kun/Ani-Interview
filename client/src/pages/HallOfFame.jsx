import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { getLeaderboard } from '../api/client'
import '../styles/halloffame.css'

function HallOfFame() {
    const [currentPlayer, setCurrentPlayer] = useState({
        name: 'Novice Hunter',
        rank: 'E',
        title: 'Unknown'
    })
    const [leaderboardData, setLeaderboardData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedName = localStorage.getItem('playerName')
        const storedRank = localStorage.getItem('playerRank')
        const storedId = localStorage.getItem('playerId')

        if (storedName) {
            setCurrentPlayer({
                name: storedName,
                rank: storedRank || 'E',
                title: 'Current Player'
            })
        }

        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard()
                setLeaderboardData(data)
            } catch (error) {
                console.error("Failed to load leaderboard", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])

    return (
        <div className="hall-page">
            <div className="hall-bg"></div>
            <Navbar />

            <main className="hall-content">
                <div className="leaderboard-frame">
                    {/* Ornamental Header */}
                    <div className="frame-header">
                        <div className="header-ornament left"></div>
                        <h1 className="header-title">HALL OF HEROES</h1>
                        <div className="header-ornament right"></div>
                    </div>

                    {/* Column Headers */}
                    <div className="table-header">
                        <span className="col-rank">RANK</span>
                        <span className="col-name">PLAYER NAME</span>
                        <span className="col-title">TITLE</span>
                        <span className="col-score">RANK</span>
                    </div>

                    {/* List */}
                    <div className="leaderboard-list">
                        {loading && <div className="loading-text">Summoning Heroes...</div>}

                        {!loading && leaderboardData.map((player) => (
                            <div key={player.id || player.rank} className={`leaderboard-row ${player.rank <= 3 ? 'top-tier' : ''} rank-${player.rank}`}>
                                <div className="col-rank">
                                    {player.rank === 1 && <span className="rank-icon first">👑</span>}
                                    {player.rank === 2 && <span className="rank-icon second">🥈</span>}
                                    {player.rank === 3 && <span className="rank-icon third">🥉</span>}
                                    <span className="rank-number">{player.rank}.</span>
                                </div>
                                <div className="col-name">
                                    <span className="player-name">{player.name}</span>
                                    <span className="guild-tag">{player.class}</span>
                                </div>
                                <div className="col-title">{player.title}</div>
                                <div className="col-score">
                                    <span className={`score-badge rank-${player.realRank}`}>{player.realRank}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Current Player Status */}
                    <div className="frame-footer">
                        <div className="current-player-status">
                            <span className="label">CURRENT PLAYER:</span>
                            <span className="value">{currentPlayer.name}</span>
                            <span className={`rank-badge-mini rank-${currentPlayer.rank}`}>{currentPlayer.rank}</span>
                        </div>

                        <div className="footer-actions">
                            <button className="footer-btn">
                                <span className="icon">📜</span> PREV PAGE
                            </button>
                            <button className="footer-btn">
                                NEXT PAGE <span className="icon">📜</span>
                            </button>
                        </div>
                    </div>

                    {/* Decorative Corner Elements */}
                    <div className="corner-decor top-left"></div>
                    <div className="corner-decor top-right"></div>
                    <div className="corner-decor bottom-left"></div>
                    <div className="corner-decor bottom-right"></div>
                </div>
            </main>
        </div>
    )
}

export default HallOfFame
