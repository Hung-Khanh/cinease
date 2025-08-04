"use client"

import { useEffect, useState } from "react"
import "./LoadingCurtain.scss"

const LoadingCurtain = ({ isLoading, onAnimationComplete }) => {
    const [isOpening, setIsOpening] = useState(false)
    const [shouldHide, setShouldHide] = useState(false)

    useEffect(() => {
        if (!isLoading && !isOpening) {
            // Start curtain opening animation
            setIsOpening(true)

            // Hide the entire component after curtain animation completes
            setTimeout(() => {
                setShouldHide(true)
                if (onAnimationComplete) {
                    onAnimationComplete()
                }
            }, 1500) // Match curtain animation duration
        }
    }, [isLoading, isOpening, onAnimationComplete])

    if (shouldHide) return null

    return (
        <div className={`loading-curtain-container ${isOpening ? "opening" : ""}`}>
            <div className={`curtain-left ${isOpening ? "opening" : ""}`}></div>
            <div className={`curtain-right ${isOpening ? "opening" : ""}`}></div>
            <div className={`loading-content ${isOpening ? "fade-out" : ""}`}>
                <div className="cinema-logo">
                    <div className="film-reel">
                        <div className="reel-center"></div>
                        <div className="reel-holes">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="hole" style={{ transform: `rotate(${i * 45}deg)` }}></div>
                            ))}
                        </div>
                    </div>
                    <h1 className="cinema-title">CINEASE</h1>
                </div>

            </div>
        </div>
    )
}

export default LoadingCurtain
