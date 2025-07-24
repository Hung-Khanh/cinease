"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import {
  FaArrowLeft,
  FaPlayCircle,
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaFilm,
  FaTimes,
  FaTicketAlt,
} from "react-icons/fa"
import "./DescriptionMovie.scss"

const DescriptionMovie = () => {
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [trailerVisible, setTrailerVisible] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api"
  const { movieId } = useParams()
  const token = localStorage.getItem("token")

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchMovieDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data) {
        setMovie(data)
      } else {
        throw new Error("Movie data not found")
      }
    } catch (error) {
      console.error("Error fetching movie data:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails()
    }
  }, [movieId])

  const handleTrailerClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (movie?.trailerUrl) {
      setTrailerVisible(movie.trailerUrl)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isMovieReleased = movie && new Date(movie.fromDate) <= new Date()

  if (isLoading) {
    return (
      <div className="movie-detail-cinema">
        <div className="cinema-bg">
          <div className="bg-gradient"></div>
          <div className="bg-pattern"></div>
          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cinematic experience...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="movie-detail-cinema">
        <div className="cinema-bg">
          <div className="bg-gradient"></div>
          <div className="bg-pattern"></div>
        </div>
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-detail-cinema">
        <div className="cinema-bg">
          <div className="bg-gradient"></div>
          <div className="bg-pattern"></div>
        </div>
        <div className="error-container">
          <h2>Movie not found</h2>
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="movie-detail-cinema">
      {/* Background Elements */}
      <div className="cinema-bg">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
        <div className="floating-particles">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Hero Section with Movie Backdrop */}
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${movie.backdropImageUrl || movie.posterImageUrl})`,
        }}
      >
        <div className="hero-overlay"></div>

        {/* Navigation */}
        <nav className="movie-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="nav-time">
            <span className="time-value">{formatTime(currentTime)}</span>
          </div>
        </nav>

        {/* Movie Content */}
        <div className="hero-content-decription">
          <div className="movie-showcase">
            {/* Poster Section */}
            <div className="poster-section">
              <div className="poster-container">
                <div className="poster-frame">
                  <img
                    src={movie.posterImageUrl || "/placeholder.svg"}
                    alt={movie.movieNameEnglish}
                    className="movie-poster-decription"
                  />
                  <div className="poster-glow"></div>
                </div>
                
              </div>
            </div>

            {/* Movie Information */}
            <div className="movie-info">
              <div className="movie-header">
                <h1 className="movie-title">{movie.movieNameEnglish}</h1>
                <div className="movie-meta">
                  <span className="genre">Action • Adventure</span>
                  <span className="year">{new Date(movie.fromDate).getFullYear()}</span>
                </div>
              </div>

              <div className="movie-description">
                <p>{movie.content}</p>
              </div>

              <div className="movie-details">
                <div className="details-grid">
                  <div className="detail-card">
                    <FaClock className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{movie.duration} min</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <FaUser className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Cast</span>
                      <span className="detail-value">{movie.actor}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <FaCalendarAlt className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Release</span>
                      <span className="detail-value">{formatDate(movie.fromDate)}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <FaFilm className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Version</span>
                      <span className="detail-value">{movie.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-section">
                {movie.trailerUrl && (
                  <button className="trailer-btn" onClick={handleTrailerClick} type="button">
                    <FaPlayCircle className="btn-icon" />
                    <span className="btn-text">Watch Trailer</span>
                    <div className="btn-glow"></div>
                  </button>
                )}

                {isMovieReleased && (
                  <Link to={`/select-showtime/${movieId}`} state={{ movieId: movie.movieId }} className="ticket-btn">
                    <FaTicketAlt className="btn-icon" />
                    <span className="btn-text">Book Tickets</span>
                    <div className="btn-glow"></div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hero-decorations">
          <div className="film-strip film-strip-left">
            <div className="film-holes">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="film-hole"></div>
              ))}
            </div>
          </div>
          <div className="film-strip film-strip-right">
            <div className="film-holes">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="film-hole"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerVisible && (
        <div className={`trailer-modal ${trailerVisible ? "visible" : ""}`} onClick={() => setTrailerVisible(null)}>
          <div className="modal-backdrop"></div>
          <div className="trailer-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setTrailerVisible(null)}>
              <FaTimes />
            </button>
            <div className="trailer-frame">
              <iframe
                src={trailerVisible}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DescriptionMovie
