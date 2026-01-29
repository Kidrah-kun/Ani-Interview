import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'

function Navbar() {
    const location = useLocation()
    const [playerRank, setPlayerRank] = useState('E')

    useEffect(() => {
        const storedRank = localStorage.getItem('playerRank') || 'E'
        setPlayerRank(storedRank)
    }, [])

    const isActive = (path) => {
        return location.pathname === path ? 'active' : ''
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

    return (
        <nav className="main-navbar">
            <div className="nav-left">
                <Link to="/" className="nav-logo">
                    <img src="/assets/dragon_logo.png" alt="Logo" className="logo-img" />
                    <span className="logo-text">ANI-INTERVIEW</span>
                </Link>
            </div>

            <div className="nav-center">
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
                <Link to="/dungeons" className={`nav-link ${isActive('/dungeons')}`}>Dungeons</Link>
                <Link to="/records" className={`nav-link ${isActive('/records')}`}>Records</Link>
                <Link to="/hall-of-fame" className={`nav-link ${isActive('/hall-of-fame')}`}>Hall of Fame</Link>
            </div>

            <div className="nav-right">
                <button className="rank-display-btn" style={{ borderColor: getRankColor(playerRank) }}>
                    <span className="rank-badge-small" style={{ backgroundColor: getRankColor(playerRank) }}>{playerRank}</span>
                    <span>Rank</span>
                </button>
            </div>
        </nav>
    )
}

export default Navbar
