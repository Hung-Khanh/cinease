"use client"

import "./PaymentSuccess.scss"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  FaCheckCircle,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCouch,
  FaStar,
  FaHome,
  FaDownload,
  FaQrcode,
} from "react-icons/fa"
import Cookies from "js-cookie"

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [ticketData, setTicketData] = useState(null)
  const [moviePoster, setMoviePoster] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showConfetti, setShowConfetti] = useState(true)
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api"
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Hide confetti after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const getQueryParam = (param) => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get(param)
  }

  const invoiceId = getQueryParam("invoiceId")

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      weekday: date.toLocaleString("default", { weekday: "short" }),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    const fetchTicketInformation = async () => {
      if (!invoiceId) return
      try {
        const response = await fetch(`${apiUrl}/public/booking-summary?invoiceId=${invoiceId}`, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch ticket details: ${response.status}`)
        }
        const data = await response.json()
        setTicketData(data)

        // === Thêm logic thông báo vào cookies ===
        const savedUser = localStorage.getItem("user")
        const user = savedUser ? JSON.parse(savedUser) : null
        if (user?.username && data?.movieName) {
          const cookieKey = `notifications_${user.username}`
          const currentNoti = JSON.parse(Cookies.get(cookieKey) || "[]")
          const existed = currentNoti.some((n) => n.invoiceId === invoiceId)
          if (!existed) {
            const newNoti = {
              id: Date.now(),
              title: data.movieName,
              quantity: data.ticketCount,
              read: false,
              invoiceId,
            }
            const updatedNoti = [newNoti, ...currentNoti].slice(0, 20)
            Cookies.set(cookieKey, JSON.stringify(updatedNoti), { expires: 7 })
            window.dispatchEvent(new Event("notificationUpdate"))
          }
        }
        // === Kết thúc logic thông báo ===

        if (data.movieName) {
          const movieResponse = await fetch(`${apiUrl}/public/movies?q=${encodeURIComponent(data.movieName)}`, {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          })
          if (movieResponse.ok) {
            const movieData = await movieResponse.json()
            if (movieData.length > 0) {
              setMoviePoster(movieData[0].posterImageUrl)
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchTicketDetails:", error)
        alert("Failed to load ticket details. Please try again.")
      }
    }

    fetchTicketInformation()
  }, [invoiceId, apiUrl, token])

  if (!ticketData)
    return (
      <div className="success-loading">
        <div className="loading-spinner"></div>
        <p>Loading your ticket...</p>
      </div>
    )

  const { day, month, weekday, fullDate } = formatDate(ticketData.scheduleShowDate)

  const handleBackToHome = () => {
    navigate(role === "EMPLOYEE" ? "/staffHomePage" : "/")
  }

  const handleDownloadTicket = () => {
    // Implement download functionality
    alert("Download functionality would be implemented here")
  }

  return (
    <div className="success-cinema">
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

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`confetti confetti-${i + 1}`}></div>
          ))}
        </div>
      )}

      {/* Success Header */}
      <header className="success-header">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        <h1 className="success-title">
          <span className="title-accent">PAYMENT</span>
          <span className="title-main">SUCCESSFUL</span>
        </h1>
        <p className="success-subtitle">Your booking has been confirmed!</p>
        <div className="current-time">
          <span className="time-label">Confirmed at:</span>
          <span className="time-value">{formatTime(currentTime)}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="success-main">
        <div className="ticket-container">
          {/* Digital Ticket */}
          <div className="digital-ticket">
            {/* Ticket Header */}
            <div className="ticket-header">
              <div className="header-pattern"></div>
              <div className="header-content">
                <div className="header-left">
                  <div className="ticket-icon-container">
                    <FaTicketAlt className="ticket-icon" />
                  </div>
                  <div className="header-text">
                    <span className="ticket-title">CINEMA TICKET</span>
                    <span className="ticket-id">#{invoiceId}</span>
                  </div>
                </div>
                <div className="header-right">
                  <div className="qr-container">
                    <div className="qr-code">
                      <FaQrcode className="qr-icon" />
                    </div>
                    <span className="qr-label">SCAN ME</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Hero Section */}
            <div className="movie-hero">
              <div className="hero-background">
                <img
                  src={
                    moviePoster ||
                    `/placeholder.svg?height=600&width=400&query=movie poster for ${ticketData.movieName || "/placeholder.svg"}`
                  }
                  alt={ticketData.movieName}
                  className="hero-bg-image"
                />
                <div className="hero-overlay"></div>
              </div>

              <div className="hero-content">
                <div className="poster-showcase">
                  <div className="poster-frame">
                    <img
                      src={
                        moviePoster ||
                        `/placeholder.svg?height=600&width=400&query=movie poster for ${ticketData.movieName || "/placeholder.svg"}`
                      }
                      alt={ticketData.movieName}
                      className="movie-poster-payment"
                    />
                    <div className="poster-glow"></div>
                  </div>
                </div>

                <div className="movie-info">
                  <div className="movie-rating">
                    <FaStar className="star-icon" />
                    <span className="rating-value">8.5</span>
                    <span className="rating-label">IMDb</span>
                  </div>
                  <h2 className="movie-title">{ticketData.movieName}</h2>
                  <div className="movie-meta">
                    <span className="genre">Action • Adventure</span>
                    <span className="duration">2h 15m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="ticket-info">
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-header">
                    <FaMapMarkerAlt className="info-icon" />
                    <span className="info-title">Cinema</span>
                  </div>
                  <div className="info-value">{ticketData.cinemaRoomName || "N/A"}</div>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <FaCalendarAlt className="info-icon" />
                    <span className="info-title">Date</span>
                  </div>
                  <div className="info-value">{fullDate}</div>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <FaClock className="info-icon" />
                    <span className="info-title">Time</span>
                  </div>
                  <div className="info-value">{ticketData.scheduleShowTime || "N/A"}</div>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <FaCouch className="info-icon" />
                    <span className="info-title">Seats</span>
                  </div>
                  <div className="seats-display">
                    {ticketData.seatNumbers?.map((seat, index) => (
                      <span key={index} className="seat-badge">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Summary */}
            <div className="ticket-summary">
              <div className="summary-row">
                <span className="summary-label">Tickets</span>
                <span className="summary-value">{ticketData.ticketCount || 0}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Status</span>
                <div className={`status-badge ${(ticketData.status || "PENDING").toLowerCase()}`}>
                  {ticketData.status || "PENDING"}
                </div>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">Total Paid</span>
                <span className="total-amount">{ticketData.grandTotal?.toLocaleString() || 0} VND</span>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="ticket-footer">
              <div className="footer-pattern"></div>
              <div className="footer-content">
                <p className="footer-text">Present this ticket at the cinema entrance</p>
                <p className="footer-note">Valid only for the specified showtime</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="ticket-decorations">
              <div className="decoration-left"></div>
              <div className="decoration-right"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="download-btn" onClick={handleDownloadTicket}>
              <FaDownload className="btn-icon" />
              <span className="btn-text">Download Ticket</span>
            </button>
            <button className="home-btn" onClick={handleBackToHome}>
              <FaHome className="btn-icon" />
              <span className="btn-text">Back to Home</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PaymentSuccess
