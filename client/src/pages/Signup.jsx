import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerPlayer } from '../api/client'
import '../styles/signup.css'

// Dialog lines for Guild Master
const dialogLines = [
    "Welcome, Hunter. You've stepped into the Interview Dungeon Guild...",
    "This is no ordinary place. Here, your skills are your weapons, and knowledge is your armor.",
    "Complete interview dungeons to gain experience and prove your worth.",
    "Ranks progress from E to SS. Only the strongest rise to face the Boss Interviews.",
    "But first... I must assess your abilities. Provide your skillset or resume so I may determine your starting rank."
]

// Generate Player ID
function generatePlayerId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const randomLetters = letters.charAt(Math.floor(Math.random() * 26)) +
        letters.charAt(Math.floor(Math.random() * 26))
    const randomNumbers = Math.floor(100000 + Math.random() * 900000)
    return `SZ${randomLetters}-${randomNumbers}`
}

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

function Signup() {
    const navigate = useNavigate()
    const [currentScene, setCurrentScene] = useState('dungeon')
    const [currentDialog, setCurrentDialog] = useState(0)
    const [dialogText, setDialogText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [playerName, setPlayerName] = useState('')
    const [techStack, setTechStack] = useState('')
    const [resumeUploaded, setResumeUploaded] = useState(false)
    const [playerId, setPlayerId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const typingTimeoutRef = useRef(null)

    // Typewriter effect
    const typeText = useCallback((text, callback) => {
        setIsTyping(true)
        setDialogText('')
        let i = 0

        const type = () => {
            if (i < text.length) {
                setDialogText(prev => prev + text.charAt(i))
                i++
                typingTimeoutRef.current = setTimeout(type, 30)
            } else {
                setIsTyping(false)
                if (callback) callback()
            }
        }
        type()
    }, [])

    // Skip typing animation
    const skipTyping = useCallback((text) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        setDialogText(text)
        setIsTyping(false)
    }, [])

    // Start dialog when entering guildmaster scene
    useEffect(() => {
        if (currentScene === 'guildmaster') {
            setTimeout(() => {
                typeText(dialogLines[0])
            }, 500)
        }
    }, [currentScene, typeText])

    // Handle dialog progression
    const handleDialogNext = () => {
        if (isTyping) {
            skipTyping(dialogLines[currentDialog])
        } else {
            const nextDialog = currentDialog + 1
            if (nextDialog < dialogLines.length) {
                setCurrentDialog(nextDialog)
                typeText(dialogLines[nextDialog])
            } else {
                setCurrentScene('register')
            }
        }
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        const generatedId = generatePlayerId()
        setPlayerId(generatedId)

        try {
            // Register with backend
            const player = await registerPlayer(techStack)

            // Store player data in localStorage
            localStorage.setItem('playerName', playerName)
            localStorage.setItem('playerId', player.id)
            localStorage.setItem('playerRank', player.rank || 'E')
            localStorage.setItem('techStack', techStack)

            // Update displayed ID with server-generated one
            setPlayerId(player.id)
            setCurrentScene('rank')
        } catch (error) {
            console.error('Registration failed:', error)
            // Still proceed with local ID if backend fails
            localStorage.setItem('playerName', playerName)
            localStorage.setItem('playerId', generatedId)
            localStorage.setItem('playerRank', 'E')
            localStorage.setItem('techStack', techStack)
            setCurrentScene('rank')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle file upload
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setResumeUploaded(true)
        }
    }

    // Enter Guild Hall
    const enterGuildHall = () => {
        navigate('/dashboard')
    }

    return (
        <>
            {/* Scene 1: Dungeon Entry */}
            <div className={`scene ${currentScene === 'dungeon' ? 'active' : ''}`}>
                <div className="scene-bg dungeon-bg"></div>
                <div className="vignette"></div>
                <div className="scene-content">
                    <h2 className="scene-title fade-in">Entering the Guild...</h2>
                    <p className="scene-subtitle fade-in delay-1">You step through the ancient gates</p>
                    <button
                        className="btn-continue fade-in delay-2"
                        onClick={() => setCurrentScene('guildmaster')}
                    >
                        <span>Continue</span>
                        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scene 2: Guild Master Introduction */}
            <div className={`scene ${currentScene === 'guildmaster' ? 'active' : ''}`}>
                <div className="scene-bg guild-bg"></div>
                <div className="vignette"></div>

                <div className="guildmaster-container">
                    <img
                        src="/assets/guild_master.png"
                        alt="Guild Master"
                        className="guildmaster-image"
                    />
                </div>

                <div className="dialog-container">
                    <div className="dialog-box">
                        <div className="dialog-header">
                            <span className="dialog-name">Guild Master</span>
                            <div className="dialog-indicator"></div>
                        </div>
                        <p className="dialog-content">{dialogText}</p>
                        <button className="dialog-next-btn" onClick={handleDialogNext}>
                            <span>▼</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scene 3: Registration Form */}
            <div className={`scene ${currentScene === 'register' ? 'active' : ''}`}>
                <div className="scene-bg dungeon-bg"></div>
                <div className="vignette"></div>

                <div className="register-panel">
                    <div className="panel-border">
                        <div className="panel-corner top-left"></div>
                        <div className="panel-corner top-right"></div>
                        <div className="panel-corner bottom-left"></div>
                        <div className="panel-corner bottom-right"></div>
                    </div>

                    <h2 className="register-title">Official Guild Registration</h2>
                    <p className="register-subtitle">Initiate your journey</p>

                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="NAME:"
                                required
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-grow">
                                <select
                                    className="form-input form-select"
                                    value={techStack}
                                    onChange={(e) => setTechStack(e.target.value)}
                                    required
                                >
                                    <option value="">TECH STACK:</option>
                                    <option value="frontend">Frontend Developer</option>
                                    <option value="backend">Backend Developer</option>
                                    <option value="fullstack">Full Stack Developer</option>
                                    <option value="mobile">Mobile Developer</option>
                                    <option value="devops">DevOps Engineer</option>
                                    <option value="data">Data Engineer</option>
                                    <option value="ml">ML Engineer</option>
                                    <option value="security">Security Engineer</option>
                                </select>
                            </div>
                            <label className={`upload-btn ${resumeUploaded ? 'uploaded' : ''}`}>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span>{resumeUploaded ? 'Resume Uploaded ✓' : 'UPLOAD RESUME'}</span>
                            </label>
                        </div>

                        <button type="submit" className="btn-register" disabled={isSubmitting}>
                            <span className="btn-text">{isSubmitting ? 'Registering...' : 'Register'}</span>
                            <div className="btn-wings">
                                <svg className="wing left" viewBox="0 0 30 20" fill="currentColor">
                                    <path d="M0 10 L15 0 L10 10 L15 20 Z" />
                                </svg>
                                <svg className="wing right" viewBox="0 0 30 20" fill="currentColor">
                                    <path d="M30 10 L15 0 L20 10 L15 20 Z" />
                                </svg>
                            </div>
                        </button>
                    </form>

                    <Link to="/" className="back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8l-4 4 4 4M16 12H8" />
                        </svg>
                        <span>BACK TO HOME</span>
                    </Link>
                </div>
            </div>

            {/* Scene 4: Rank Assignment */}
            <div className={`scene ${currentScene === 'rank' ? 'active' : ''}`}>
                <div className="scene-bg guild-bg"></div>
                <div className="vignette"></div>

                <div className="rank-reveal-container">
                    <div className="rank-card">
                        <div className="rank-glow"></div>
                        <div className="rank-content">
                            <h2 className="rank-title">Hunter Registration Complete</h2>

                            <div className="player-id-section">
                                <span className="label">Player ID</span>
                                <span className="player-id">{playerId || localStorage.getItem('playerId')}</span>
                            </div>

                            <div className="rank-badge-section">
                                <span className="label">Assigned Rank</span>
                                <div className="rank-badge">
                                    <span className="rank-letter">E</span>
                                </div>
                                <span className="rank-name">E-Rank Hunter</span>
                            </div>

                            <p className="rank-message">Your journey begins now, Hunter. Prove your worth in the dungeons.</p>

                            <button className="btn-enter-hall" onClick={enterGuildHall}>
                                <span>Enter the Guild Hall</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup
