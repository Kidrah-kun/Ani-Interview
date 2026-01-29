import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/records.css'

import { getPlayerHistory } from '../api/client'

function Records() {
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const playerId = localStorage.getItem('playerId')
                if (!playerId) {
                    setLoading(false)
                    return
                }

                const data = await getPlayerHistory(playerId)
                setHistory(data)
            } catch (error) {
                console.error('Failed to load records:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="records-page">
            <div className="records-bg"></div>

            {/* Navigation (Reused from Dungeons for consistency) */}
            <Navbar />

            <main className="records-content">
                <header className="records-header">
                    <h1 className="page-title">Hunter's Log</h1>
                    <p className="page-subtitle">History of your conquests and failures</p>
                </header>

                <div className="records-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Retrieving archives...</p>
                        </div>
                    ) : (
                        <div className="records-table-wrapper">
                            <table className="records-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Dungeon</th>
                                        <th>Rank</th>
                                        <th>Date</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record, index) => (
                                        <tr key={record.id} className={`record-row ${record.status.toLowerCase()}`} style={{ animationDelay: `${index * 100}ms` }}>
                                            <td className="status-cell">
                                                <span className={`status-icon ${record.status.toLowerCase()}`}>
                                                    {record.status === 'VICTORY' ? '⚔️' : '💀'}
                                                </span>
                                                {record.status}
                                            </td>
                                            <td className="dungeon-name">{record.dungeonName}</td>
                                            <td className="rank-cell"><span className={`rank-tag rank-${record.rank.toLowerCase()}`}>{record.rank}</span></td>
                                            <td className="date-cell">{record.date}</td>
                                            <td className="score-cell">{record.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {history.length === 0 && (
                                <div className="empty-state">
                                    <p>No records found. Your journey has just begun.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Records
