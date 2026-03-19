import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/navbar.css'

function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [playerRank, setPlayerRank] = useState('E')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/signup')
    }

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

            <div className={`nav-center ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                <button className="logout-btn" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logout-icon">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    <span>Logout</span>
                </button>
                <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="menu-icon">
                        {isMobileMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>
        </nav>
    )
}

export default Navbar
