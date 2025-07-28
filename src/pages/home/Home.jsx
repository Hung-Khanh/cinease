"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "./Home.scss"
import { getNowShowingMovies, getComingSoonMovies } from "../../api/movie"
import { getPromotions } from "../../api/promotion"
import KM from "../../assets/KM.png"
import LoadingCurtain from "../../component/LoadingCurtain/LoadingCurtain"

const Home = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroMovies, setHeroMovies] = useState([])
  const [showingMovies, setShowingMovies] = useState([])
  const [comingSoonMovies, setComingSoonMovies] = useState([])
  const [promotions, setPromotions] = useState([])
  const [trailerVisible, setTrailerVisible] = useState(null)
  const [showCurtain, setShowCurtain] = useState(false) // Changed to false initially
  const [isLoading, setIsLoading] = useState(false) // Changed to false initially

  // Use ref to prevent double execution
  const hasProcessedLogin = useRef(false)

  const handleCurtainAnimationComplete = () => {
    console.log("✅ Curtain animation completed")
    setShowCurtain(false)
  }

  useEffect(() => {
    // Prevent double execution
    if (hasProcessedLogin.current) {
      console.log("🚫 Already processed login, skipping...")
      return
    }

    // Check for fresh login flag
    const loginSuccess = localStorage.getItem("loginSuccess")
    const isFromLogin = loginSuccess === "true"

    console.log("🔍 Checking login status:", { loginSuccess, isFromLogin })

    // Mark as processed
    hasProcessedLogin.current = true

    // Clear the flag immediately
    if (loginSuccess) {
      localStorage.removeItem("loginSuccess")
      console.log("🧹 Cleared loginSuccess flag")
    }

    // Determine if we should show curtain
    if (isFromLogin) {
      console.log("🎭 Fresh login detected - showing curtain")
      setShowCurtain(true)
      setIsLoading(true)
      fetchAllDataWithCurtain()
    } else {
      console.log("🔄 Normal page load - no curtain")
      setShowCurtain(false)
      setIsLoading(false)
      fetchAllDataNormal()
    }
  }, [])

  const fetchAllDataWithCurtain = async () => {
    console.log("🎪 Fetching data with curtain animation")
    try {
      // Minimum loading time for curtain animation
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1200))

      await Promise.all([fetchMovies(), fetchComing(), fetchPromo(), minLoadingTime])

      // Start curtain opening animation
      setTimeout(() => {
        console.log("🎬 Starting curtain opening")
        setIsLoading(false) // This triggers the curtain opening
      }, 300)
    } catch (error) {
      console.error("Error loading data:", error)
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }
  }

  const fetchAllDataNormal = async () => {
    console.log("📊 Fetching data normally (no curtain)")
    try {
      await Promise.all([fetchMovies(), fetchComing(), fetchPromo()])
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const fetchMovies = async () => {
    try {
      const response = await getNowShowingMovies()
      if (response.status !== 200) return
      const data = response.data?.content || []
      const extractedMovies = data.map((movie) => ({
        id: movie.movieId,
        title: movie.movieNameEnglish,
        poster: movie.posterImageUrl || KM,
        img: movie.largeImage || "/placeholder.svg?height=600&width=1200",
        rating: Math.round((movie.avgFeedback || 0) * 10) / 10,
        genre: movie.version || "Unknown",
        types: movie.types || "Unknown",
        duration: movie.duration ? `${movie.duration} min` : "120 min",
        trailer: movie.trailerUrl,
        desc: movie.content || "No description available",
      }))
      setShowingMovies(extractedMovies)
      setHeroMovies(extractedMovies)
    } catch {
      setShowingMovies([])
      setHeroMovies([])
    }
  }

  const fetchComing = async () => {
    try {
      const response = await getComingSoonMovies()
      const data = response.data.content || []
      const extractedComingSoonMovies = data.map((movie) => ({
        id: movie.movieId,
        title: movie.movieNameEnglish,
        img: movie.posterImageUrl || "/placeholder.svg?height=400&width=300",
        date: movie.fromDate || "Unknown",
        genre: movie.version || "Unknown",
        types: movie.types || "Unknown",
      }))
      setComingSoonMovies(extractedComingSoonMovies)
    } catch {
      setComingSoonMovies([])
    }
  }

  const fetchPromo = async () => {
    try {
      const response = await getPromotions()
      const data = response.data || []
      const extractedPromotions = data.map((promo) => ({
        id: promo.promotionId,
        title: promo.title,
        img: promo.image || "/placeholder.svg?height=200&width=300",
        startTime: promo.startTime,
        endTime: promo.endTime,
      }))
      setPromotions(extractedPromotions)
    } catch {
      setPromotions([])
    }
  }

  // Auto-slide effect for hero section
  useEffect(() => {
    if (heroMovies.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [heroMovies.length])

  const currentMovie = heroMovies[currentSlide]

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMovie?.trailer) {
      setTrailerVisible(currentMovie.trailer);
    }
  }

  const CustomCarousel = ({ children, itemsPerView = 5 }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const totalItems = children.length
    const maxIndex = Math.max(0, totalItems - itemsPerView)

    return (
      <div className="custom-carousel">
        <button
          className="carousel-btn prev"
          onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
        >
          ❮
        </button>
        <div className="carousel-container">
          <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}>
            {children}
          </div>
        </div>
        <button
          className="carousel-btn next"
          onClick={() => setCurrentIndex(Math.min(currentIndex + 1, maxIndex))}
          disabled={currentIndex >= maxIndex}
        >
          ❯
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Only render LoadingCurtain when explicitly needed */}
      {showCurtain && (
        <LoadingCurtain
          isLoading={isLoading}
          onAnimationComplete={handleCurtainAnimationComplete}
          trigger={showCurtain}
        />
      )}
      <div className={`home ${showCurtain && isLoading ? "loading" : ""}`}>
        <main className="home-content">
          <section className="hero-section-home">
            <div className="hero-slider">
              {heroMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className={`hero-slide ${index === currentSlide ? "active" : ""}`}
                  style={{ pointerEvents: index === currentSlide ? "auto" : "none" }}
                >
                  <img src={movie.img || "/placeholder.svg"} alt={movie.title} />
                  <div className="hero-overlay">
                    <div className="hero-content">
                      <h1 className="hero-title">{movie.title}</h1>
                      <p className="hero-desc">{movie.desc}</p>
                      <div className="hero-actions">
                        <button
                            className="btn btn-primary"
                          onClick={() => {
                            const user = localStorage.getItem('user');
                            if (!user) {
                              navigate('/login');
                            } else {
                              navigate(`/select-showtime/${currentMovie?.id}`);
                            }
                          }}
                        >
                          <span>▶</span> Book Ticket
                        </button>
                        <button className="btn btn-secondary" onClick={handleTrailerClick}>
                          <span>🎬</span> Watch Trailer
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => navigate(`/description-movie/${currentMovie?.id}`)}
                        >
                          <span>ℹ</span> More Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="hero-nav prev"
                onClick={() => setCurrentSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length)}
              >
                ❮
              </button>
              <button className="hero-nav next" onClick={() => setCurrentSlide((currentSlide + 1) % heroMovies.length)}>
                ❯
              </button>
              <div className="hero-indicators">
                {heroMovies.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </section>

          {trailerVisible && (
            <div
              className={`trailer-modal${trailerVisible ? ' visible' : ''}`}
              onClick={() => setTrailerVisible(null)}
            >
              <div className="trailer-container" onClick={e => e.stopPropagation()}>
                <button
                  className="close-btn"
                  onClick={() => setTrailerVisible(null)}
                  aria-label="Close trailer"
                >
                  ✕
                </button>
                <iframe
                  src={trailerVisible}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

            </div>
          )}

          <section className="movie-section">
            <div className="section-header">
              <h2>Now Showing</h2>
              <button className="see-all-btn" onClick={() => navigate("/movie")}>
                See All →
              </button>
            </div>
            <CustomCarousel itemsPerView={4}>
              {showingMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="coming-soon-card"
                  onClick={() => navigate(`/description-movie/${movie.id}`)}
                >
                  <div className="coming-poster">
                    <img src={movie.poster || "/placeholder.svg"} alt={movie.title} />
                    <div className="coming-badge">Now Showing</div>
                  </div>
                  <div className="coming-info">
                    <h3 className="coming-title">{movie.title}</h3>
                    <p className="release-date">Duration: {movie.duration}</p>
                    <div className="coming-genres">
                      <span className="genre-tag">{movie.genre}</span>
                      <span className="genre-tag">{movie.types}</span>
                      <span className="genre-tag">
                        Rating: {movie.rating} <span style={{ color: "#f7b731" }}>★</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CustomCarousel>
          </section>

          <section className="movie-section">
            <div className="section-header">
              <h2>Coming Soon</h2>
            </div>
            <CustomCarousel itemsPerView={4}>
              {comingSoonMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="coming-soon-card"
                  onClick={() => navigate(`/description-movie/${movie.id}`)}
                >
                  <div className="coming-poster">
                    <img src={movie.img || "/placeholder.svg"} alt={movie.title} />
                    <div className="coming-badge">Coming Soon</div>
                  </div>
                  <div className="coming-info">
                    <h3 className="coming-title">{movie.title}</h3>
                    <p className="release-date">Release: {new Date(movie.date).toLocaleDateString()}</p>
                    <div className="coming-genres">
                      <span className="genre-tag">{movie.genre}</span>
                      <span className="genre-tag">{movie.types}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CustomCarousel>
          </section>

          <section className="movie-section">
            <div className="section-header">
              <h2>Special Promotions</h2>
            </div>
            <CustomCarousel itemsPerView={3}>
              {promotions.map((promo) => (
                <div key={promo.id} className="promo-card">
                  <div className="promo-image">
                    <img src={promo.img || "/placeholder.svg"} alt={promo.title} />
                  </div>
                  <div className="promo-info">
                    <h3 className="promo-title">{promo.title}</h3>
                    <p className="promo-period">
                      {new Date(promo.startTime).toLocaleDateString()} - {new Date(promo.endTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CustomCarousel>
          </section>
        </main>
      </div>
    </>
  )
}

export default Home
