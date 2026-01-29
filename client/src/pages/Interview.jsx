import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { startDungeon, submitAnswers } from '../api/client'
import '../styles/interview.css'

function Interview() {
    const location = useLocation()
    const navigate = useNavigate()

    // Get dungeon info from navigation state
    const dungeonInfo = location.state || {}
    const { dungeonId, dungeonName, dungeonRank, isBoss, mode, dungeonType } = dungeonInfo

    // State
    const [phase, setPhase] = useState('confirm') // confirm, loading, interview, submitting, results
    const [attemptId, setAttemptId] = useState(null)
    const [questions, setQuestions] = useState([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [currentAnswer, setCurrentAnswer] = useState('')
    const [error, setError] = useState(null)
    const [results, setResults] = useState(null)

    const playerId = localStorage.getItem('playerId')
    const playerName = localStorage.getItem('playerName') || 'Hunter'

    // Redirect if no dungeon info
    useEffect(() => {
        if (!dungeonId || !playerId) {
            navigate('/dungeons')
        }
    }, [dungeonId, playerId, navigate])

    const handleStartDungeon = async () => {
        setPhase('loading')
        setError(null)

        try {
            const response = await startDungeon(
                playerId,
                dungeonType || dungeonName,
                isBoss || false,
                dungeonRank
            )

            setAttemptId(response.attemptId)
            setQuestions(response.questions || [])
            setPhase('interview')
        } catch (err) {
            console.error('Failed to start dungeon:', err)
            setError(err.message || 'Failed to start dungeon. Please try again.')
            setPhase('confirm')
        }
    }

    const handleRetreat = () => {
        navigate('/dungeons')
    }

    const handleAnswerChange = (e) => {
        setCurrentAnswer(e.target.value)
    }

    const handleSubmitAnswer = () => {
        if (!currentAnswer.trim()) return

        const currentQuestion = questions[currentQuestionIndex]

        // Save answer
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.questionId]: currentAnswer
        }))

        // Move to next question or finish
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setCurrentAnswer('')
        } else {
            // All questions answered, submit
            handleFinalSubmit({
                ...answers,
                [currentQuestion.questionId]: currentAnswer
            })
        }
    }

    const handleSkipQuestion = () => {
        // Save empty answer for skipped question
        const currentQuestion = questions[currentQuestionIndex]
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.questionId]: ''
        }))

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setCurrentAnswer('')
        } else {
            handleFinalSubmit({
                ...answers,
                [currentQuestion.questionId]: ''
            })
        }
    }

    const handleFinalSubmit = async (allAnswers) => {
        setPhase('submitting')

        try {
            // Format answers for API
            const formattedAnswers = Object.entries(allAnswers).map(([questionId, answerText]) => ({
                questionId,
                answerText
            }))

            const response = await submitAnswers(attemptId, formattedAnswers)
            setResults(response)

            // Update localStorage if rank changed
            if (response.rankUpdate?.newRank) {
                localStorage.setItem('playerRank', response.rankUpdate.newRank)
            }

            setPhase('results')
        } catch (err) {
            console.error('Failed to submit answers:', err)
            setError(err.message || 'Failed to submit answers. Please try again.')
            setPhase('interview')
        }
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

    const currentQuestion = questions[currentQuestionIndex]

    // Confirmation Phase
    if (phase === 'confirm') {
        return (
            <div className={`interview-container ${isBoss ? 'boss-mode' : ''}`}>
                <div className={`interview-bg ${isBoss ? 'boss' : 'normal'}`}></div>
                <div className="vignette"></div>

                <div className="confirm-panel">
                    <header className="confirm-header">
                        <h1 className="confirm-title">
                            {isBoss ? 'Final Evaluation Protocol' : 'The Gauntlet of Inquiry'}
                        </h1>
                        <p className="confirm-subtitle">
                            Rank: <span style={{ color: getRankColor(dungeonRank) }}>{dungeonRank}</span>
                            {mode === 'PRACTICE' && <span className="practice-tag"> (Practice Mode)</span>}
                        </p>
                    </header>

                    {isBoss && (
                        <div className="boss-interrogator">
                            <div className="interrogator-frame">
                                <img
                                    src="/assets/guild_master.png"
                                    alt="The Interrogator"
                                    className="interrogator-image"
                                />
                            </div>
                            <span className="interrogator-name">THE INTERROGATOR</span>
                        </div>
                    )}

                    <div className="dungeon-info-panel">
                        <h2 className="dungeon-name-display">{dungeonName}</h2>
                        <p className="dungeon-warning">
                            {isBoss
                                ? 'Proceed with caution. Decisions are irreversible.'
                                : 'Answer each question to prove your worth.'}
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    <div className="confirm-buttons">
                        <button className="btn-proceed" onClick={handleStartDungeon}>
                            <span>✦ {isBoss ? 'YES - PROCEED' : 'ENTER DUNGEON'}</span>
                        </button>
                        <button className="btn-retreat" onClick={handleRetreat}>
                            <span>✧ {isBoss ? 'NO - RETREAT' : 'RETREAT'}</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Loading Phase
    if (phase === 'loading') {
        return (
            <div className={`interview-container ${isBoss ? 'boss-mode' : ''}`}>
                <div className={`interview-bg ${isBoss ? 'boss' : 'normal'}`}></div>
                <div className="vignette"></div>

                <div className="loading-panel">
                    <div className="loading-spinner-large"></div>
                    <p className="loading-text">Generating interview questions...</p>
                    <p className="loading-subtext">The dungeon is preparing your trial...</p>
                </div>
            </div>
        )
    }

    // Interview Phase
    if (phase === 'interview' || phase === 'submitting') {
        return (
            <div className={`interview-container ${isBoss ? 'boss-mode' : ''}`}>
                <div className={`interview-bg ${isBoss ? 'boss' : 'normal'}`}></div>
                <div className="vignette"></div>

                {/* Header */}
                <header className="interview-header">
                    <h1 className="interview-title">
                        {isBoss ? 'Boss Interview' : 'The Gauntlet of Inquiry'}
                    </h1>
                    <span className="interview-rank" style={{ color: getRankColor(dungeonRank) }}>
                        Rank: {dungeonRank}
                    </span>
                </header>

                {/* Progress */}
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                    <span className="progress-text">Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>

                {/* Question Panel */}
                <div className="question-panel">
                    <div className="question-frame">
                        <div className="question-number">Q{currentQuestionIndex + 1}</div>
                        <p className="question-text">{currentQuestion?.question}</p>
                    </div>
                </div>

                {/* Answer Area */}
                <div className="answer-panel">
                    <textarea
                        className="answer-input"
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={handleAnswerChange}
                        disabled={phase === 'submitting'}
                    />
                </div>

                {/* Controls */}
                <div className="interview-controls">
                    <button
                        className="btn-skip"
                        onClick={handleSkipQuestion}
                        disabled={phase === 'submitting'}
                    >
                        Skip →
                    </button>
                    <button
                        className="btn-submit-answer"
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim() || phase === 'submitting'}
                    >
                        {phase === 'submitting' ? (
                            <span>Evaluating...</span>
                        ) : currentQuestionIndex < questions.length - 1 ? (
                            <span>✦ Submit Answer</span>
                        ) : (
                            <span>✦ Finish & Submit</span>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="error-toast">
                        <span>⚠️ {error}</span>
                    </div>
                )}
            </div>
        )
    }

    // Results Phase
    if (phase === 'results' && results) {
        const passed = results.passed
        const score = results.scoring?.normalizedScore || 0
        const questionsAnswered = results.scoring?.questionsAnswered || 0
        const questionsTotal = results.scoring?.questionsTotal || questions.length

        return (
            <div className={`interview-container results-phase ${passed ? 'victory' : 'defeat'}`}>
                <div className={`interview-bg ${passed ? 'victory' : 'defeat'}`}></div>
                <div className="vignette"></div>

                <div className="results-panel">
                    {/* Victory/Defeat Banner */}
                    <div className="results-banner">
                        <h1 className={`results-title ${passed ? 'victory' : 'defeat'}`}>
                            {passed ? 'Victory Achieved' : 'Challenge Failed'}
                        </h1>
                    </div>

                    {/* Score Display */}
                    <div className="score-display">
                        <span className="score-label">Average Score</span>
                        <span className="score-value">{score.toFixed(1)}%</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-box">
                            <span className="stat-label">Honor Points</span>
                            <span className="stat-value">+{Math.round(score * 2.5)}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Foes Vanquished</span>
                            <span className="stat-value">{questionsAnswered}/{questionsTotal}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Essence Collected</span>
                            <span className="stat-value">{score.toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* Rank Update */}
                    {results.rankUpdate && (
                        <div className="rank-promotion">
                            <span className="promotion-text">🎉 RANK UP!</span>
                            <div className="promotion-ranks">
                                <span style={{ color: getRankColor(results.rankUpdate.oldRank) }}>
                                    {results.rankUpdate.oldRank}
                                </span>
                                <span className="promotion-arrow">→</span>
                                <span style={{ color: getRankColor(results.rankUpdate.newRank) }}>
                                    {results.rankUpdate.newRank}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Key Feedback */}
                    {results.feedback && results.feedback.length > 0 && (
                        <div className="feedback-section">
                            <h3 className="feedback-title">Key Feedback</h3>
                            <ul className="feedback-list">
                                {results.feedback.slice(0, 3).map((fb, idx) => (
                                    <li key={idx} className="feedback-item">
                                        <span className="feedback-score" style={{
                                            color: fb.normalizedScore >= 60 ? '#50c878' : '#e57373'
                                        }}>
                                            Q{idx + 1}: {fb.normalizedScore?.toFixed(0) || 0}%
                                        </span>
                                        {fb.feedback && <span className="feedback-text">— {fb.feedback.slice(0, 100)}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Weak Areas */}
                    {results.weakAreas && results.weakAreas.length > 0 && (
                        <div className="weak-areas">
                            <span className="weak-label">Areas to Improve:</span>
                            <span className="weak-list">{results.weakAreas.slice(0, 3).join(', ')}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="results-actions">
                        <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </button>
                        <button className="btn-try-again" onClick={() => navigate('/dungeons')}>
                            Try Another Dungeon
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Fallback
    return null
}

export default Interview
