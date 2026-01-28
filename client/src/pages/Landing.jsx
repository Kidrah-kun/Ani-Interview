import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/landing.css'

function Landing() {
    const [showContent, setShowContent] = useState(false)
    const [introVisible, setIntroVisible] = useState(true)
    const [introFading, setIntroFading] = useState(false)
    const videoRef = useRef(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Try to play the video
        video.play().catch(() => {
            // If autoplay fails, skip intro immediately
            setIntroVisible(false)
            setShowContent(true)
        })

        // When video ends, fade out intro
        const handleEnded = () => {
            setIntroFading(true)
            setShowContent(true)
            setTimeout(() => {
                setIntroVisible(false)
            }, 1000)
        }

        video.addEventListener('ended', handleEnded)
        return () => video.removeEventListener('ended', handleEnded)
    }, [])

    const skipIntro = () => {
        if (videoRef.current) {
            videoRef.current.pause()
        }
        setIntroFading(true)
        setShowContent(true)
        setTimeout(() => {
            setIntroVisible(false)
        }, 500)
    }

    return (
        <>
            {/* Gate Opening Video Overlay */}
            {introVisible && (
                <div
                    className={`gate-intro ${introFading ? 'fade-out' : ''}`}
                    onClick={skipIntro}
                >
                    <video
                        ref={videoRef}
                        className="gate-video"
                        muted
                        playsInline
                    >
                        <source src="/assets/gate_opening_video.mp4" type="video/mp4" />
                    </video>
                </div>
            )}

            <div
                className="landing-container"
                style={{ opacity: showContent ? 1 : 0 }}
            >
                {/* Background layer */}
                <div className="bg-layer"></div>

                {/* Vignette overlay */}
                <div className="vignette"></div>

                {/* Main content */}
                <main className="content">
                    {/* Dragon Logo Emblem */}
                    <div className="logo-emblem">
                        <img
                            src="/assets/dragon_logo.png"
                            alt="Dragon Emblem"
                            className="dragon-logo"
                        />
                    </div>

                    {/* Title */}
                    <h1 className="title">
                        <span className="title-main">Ani-Interview</span>
                    </h1>

                    {/* Buttons */}
                    <div className="button-group">
                        <Link to="/signup" className="btn btn-primary">
                            <span className="btn-text">LOG IN</span>
                            <span className="btn-border"></span>
                        </Link>
                        <Link to="/signup" className="btn btn-secondary">
                            <span className="btn-text">SIGN UP</span>
                            <span className="btn-border"></span>
                        </Link>
                    </div>
                </main>

                {/* Ambient torch flicker effect (CSS only) */}
                <div className="torch torch-left"></div>
                <div className="torch torch-right"></div>
            </div>
        </>
    )
}

export default Landing
