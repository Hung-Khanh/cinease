"use client"

import { useState, useEffect } from "react"
import "./SelectShowtime.scss"
import {
  FaArrowLeft,
  FaPlayCircle,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaTimes,
  FaStar,
} from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setBookingInfo } from "../../store/tempBookingSlice"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const SelectShowtime = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedScheduleId, setSelectedScheduleId] = useState(null)
  const [dates, setDates] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trailerVisible, setTrailerVisible] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { movieId } = useParams()
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api"
  const token = localStorage.getItem("token")

  // Keys for localStorage
  const MOVIE_DETAILS_KEY = `movieDetails_${movieId}`
  const SHOWTIME_SELECTION_KEY = `showtimeSelection_${movieId}`

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const storedMovieDetails = localStorage.getItem(MOVIE_DETAILS_KEY)
    if (storedMovieDetails) {
      try {
        const parsedMovie = JSON.parse(storedMovieDetails)
        setMovie(parsedMovie)
        setDates(parsedMovie.dates || [])
        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing stored movie details:", e)
        localStorage.removeItem(MOVIE_DETAILS_KEY)
        fetchMovieDetails()
      }
    } else {
      fetchMovieDetails()
    }

    const storedSelection = localStorage.getItem(SHOWTIME_SELECTION_KEY)
    if (storedSelection) {
      try {
        const parsedSelection = JSON.parse(storedSelection)
        setSelectedDate(parsedSelection.selectedDate || "")
        setSelectedTime(parsedSelection.selectedTime || "")
        setSelectedScheduleId(parsedSelection.selectedScheduleId || null)
      } catch (e) {
        console.error("Error parsing stored showtime selection:", e)
        localStorage.removeItem(SHOWTIME_SELECTION_KEY)
      }
    }

    fetchShowtimes()
  }, [movieId])

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
        setDates(data.dates || [])
        localStorage.setItem(MOVIE_DETAILS_KEY, JSON.stringify(data))
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

  const fetchShowtimes = async () => {
    try {
      const fullUrl = `${apiUrl}/public/showtimes?movieId=${movieId}`
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("❌ Showtimes error response:", errorText)
        throw new Error(`Failed to fetch showtimes: ${response.status}`)
      }

      const data = await response.json()
      setShowtimes(data)
    } catch (error) {
      console.error("❌ Error fetching showtimes:", error)
    }
  }

  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const date = showtime.showDate
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(showtime)
    return acc
  }, {})

  const uniqueDates = Object.keys(groupedShowtimes).sort()

  useEffect(() => {
    // Tạm thời tắt tự động chọn ngày mặc định để test cảnh báo
    // if (!selectedDate && uniqueDates.length > 0) {
    //   const defaultDate = uniqueDates[0]
    //   setSelectedDate(defaultDate)
    //   localStorage.setItem(
    //     SHOWTIME_SELECTION_KEY,
    //     JSON.stringify({
    //       selectedDate: defaultDate,
    //       selectedTime: "",
    //       selectedScheduleId: null,
    //     }),
    //   )
    // }
  }, [selectedDate, uniqueDates, SHOWTIME_SELECTION_KEY])

  const handleDateSelect = (date) => {
    if (selectedDate === date) {
      setSelectedDate("")
      setSelectedTime("")
      setSelectedScheduleId(null)
      localStorage.setItem(
        SHOWTIME_SELECTION_KEY,
        JSON.stringify({
          selectedDate: "",
          selectedTime: "",
          selectedScheduleId: null,
        }),
      )
    } else {
      setSelectedDate(date)
      setSelectedTime("")
      setSelectedScheduleId(null)
      localStorage.setItem(
        SHOWTIME_SELECTION_KEY,
        JSON.stringify({
          selectedDate: date,
          selectedTime: "",
          selectedScheduleId: null,
        }),
      )
    }
  }

  const handleTimeSelect = (showtime) => {
    if (selectedTime === showtime.showTime) {
      setSelectedTime("")
      setSelectedScheduleId(null)
      localStorage.setItem(
        SHOWTIME_SELECTION_KEY,
        JSON.stringify({
          selectedDate: selectedDate,
          selectedTime: "",
          selectedScheduleId: null,
        }),
      )
    } else {
      setSelectedTime(showtime.showTime)
      setSelectedScheduleId(showtime.scheduleId)
      localStorage.setItem(
        SHOWTIME_SELECTION_KEY,
        JSON.stringify({
          selectedDate: selectedDate,
          selectedTime: showtime.showTime,
          selectedScheduleId: showtime.scheduleId,
        }),
      )
      console.log("🎬 Selected Schedule ID:", showtime.scheduleId)
    }
  }

  const handleTrailerClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (movie?.trailerUrl) {
      setTrailerVisible(movie.trailerUrl)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      weekday: date.toLocaleString("default", { weekday: "short" }),
    }
  }

  if (isLoading) {
    return (
      <div className="select-showtime-cinema">
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
          <p>Loading showtimes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="select-showtime-cinema">
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
      <div className="select-showtime-cinema">
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
    <div className="select-showtime-cinema">
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

      {/* Header */}
      <header className="showtime-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="header-center">
          <h1 className="page-title">
            <span className="title-accent">SELECT</span>
            <span className="title-main">SHOWTIME</span>
          </h1>
          <div className="current-time">
            <span className="time-value">{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="header-decoration">
          <div className="film-reel">
            <div className="reel-holes">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="reel-hole"></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="showtime-main">
        <div className="showtime-container">
          {/* Movie Poster Section */}
          <div className="poster-section">
            <div className="poster-container">
              <div className="poster-frame">
                <img
                  src={movie?.posterImageUrl || "/placeholder.svg"}
                  alt={movie?.movieNameEnglish}
                  className="movie-poster-selectShowtime"
                />
                <div className="poster-overlay">
                  <div className="movie-rating">
                    <FaStar className="star-icon" />
                    <span>8.5</span>
                  </div>
                </div>
              </div>
              <div className="poster-glow"></div>
            </div>

            <div className="movie-info">
              <h2 className="movie-title">{movie?.movieNameEnglish}</h2>
              <div className="movie-meta">
                <span className="genre">Action • Adventure</span>
                <span className="duration">{movie?.duration} min</span>
              </div>
            </div>

            {movie.trailerUrl && (
              <button className="trailer-btn" onClick={handleTrailerClick} type="button">
                <FaPlayCircle className="btn-icon" />
                <span className="btn-text">Watch Trailer</span>
                <div className="btn-glow"></div>
              </button>
            )}
          </div>

          {/* Selection Section */}
          <div className="selection-section">
            {/* Date Selection */}
            <div className="selection-card">
              <div className="card-header">
                <FaCalendarAlt className="header-icon" />
                <h3 className="card-title">Select Date</h3>
              </div>
              <div className="date-grid">
                {uniqueDates.map((date) => {
                  const { day, month, weekday } = formatDate(date)
                  return (
                    <button
                      key={date}
                      className={`date-card ${selectedDate === date ? "selected" : ""}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="date-day">{day}</div>
                      <div className="date-month">{month}</div>
                      <div className="date-weekday">{weekday}</div>
                      {selectedDate === date && (
                        <div className="selected-indicator">
                          <div className="indicator-dot"></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cinema Location */}
            <div className="selection-card">
              <div className="card-header">
                <FaMapMarkerAlt className="header-icon" />
                <h3 className="card-title">Cinema Location</h3>
              </div>
              <div className="location-card">
                <div className="location-info">
                  <span className="location-name">Ho Chi Minh Cinema</span>
                  <span className="location-address">District 1, Ho Chi Minh City</span>
                </div>
                <div className="location-badge">Available</div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="selection-card">
              <div className="card-header">
                <FaClock className="header-icon" />
                <h3 className="card-title">Select Time</h3>
              </div>
              <div className="time-grid">
                {selectedDate && groupedShowtimes[selectedDate]?.length > 0 ? (
                  groupedShowtimes[selectedDate].map((showtime) => (
                    <button
                      key={showtime.scheduleId}
                      className={`time-card ${selectedTime === showtime.showTime ? "selected" : ""}`}
                      onClick={() => handleTimeSelect(showtime)}
                    >
                      <div className="time-value">{showtime.showTime}</div>
                      <div className="time-label">Available</div>
                      {selectedTime === showtime.showTime && (
                        <div className="selected-indicator">
                          <div className="indicator-dot"></div>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="no-showtimes">
                    <p>No showtimes available for this date</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="action-section">
              <button
                className={`select-seat-btn ${selectedDate && selectedTime ? "active" : "inactive"}`}
                data-testid="select-seat-btn"
                onClick={() => {
                  if (!selectedDate && !selectedTime) {
                    toast.warn("Please choose date and time!", {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "colored",
                    })
                    return
                  }
                  if (selectedDate && !selectedTime) {
                    toast.warn("Please choose time!", {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "colored",
                    })
                    return
                  }
                  dispatch(
                    setBookingInfo({
                      movieName: movie?.movieNameEnglish,
                      showDate: selectedDate,
                      showTime: selectedTime,
                      scheduleId: selectedScheduleId,
                    }),
                  )
                  localStorage.setItem(
                    "bookingInfo",
                    JSON.stringify({
                      movieName: movie?.movieNameEnglish,
                      showDate: selectedDate,
                      showTime: selectedTime,
                      scheduleId: selectedScheduleId,
                    }),
                  )
                  navigate(`/seat-select/${movieId}/${selectedScheduleId}`)
                }}
              >
                <FaTicketAlt className="btn-icon" />
                <span className="btn-text">Select Seats</span>
                <div className="btn-glow"></div>
              </button>
            </div>
          </div>
        </div>
      </main>

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
      <ToastContainer />
    </div>
  )
}

export default SelectShowtime
