"use client"

import { useEffect, useState } from "react"
import "./Confirm.scss"
import Select from "react-select"
import {
  FaArrowLeft,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaGift,
  FaCoins,
  FaStar,
  FaUser,
  FaEnvelope,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { setSeatData } from "../../store/cartSlice"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Confirm = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [promotions, setPromotions] = useState([])
  const [voucher, setVoucher] = useState(null)
  const [useScore, setUseScore] = useState(0)
  const [ticketType, setTicketType] = useState("ADULT")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [movieDetails, setMovieDetails] = useState({})
  const [bookingData, setBookingData] = useState(null)
  const [confirmResult, setConfirmResult] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userInfo, setUserInfo] = useState(null)
  const seatData = useSelector((state) => state.cart.seatData)
  const selectedProducts = useSelector((state) => state.cart.selectedProducts)
  const token = localStorage.getItem("token")

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!seatData || !seatData.sessionId) {
      setError("Booking data not found. Please select again.")
      navigate("/")
      return
    }
    setBookingData({
      sessionId: seatData.sessionId,
      movieName: seatData.movieName,
      showDate: seatData.showDate,
      showTime: seatData.showTime,
      seatNumbers: seatData.selectedSeats || [],
      cinemaRoomName: seatData.cinemaRoomName,
      products: selectedProducts,
      productsTotal: seatData.originalProductsTotal,
      scheduleId: seatData.scheduleId,
      movieId: seatData.movieId,
      seats: seatData.seats || [],
      originalTicketTotal: seatData.originalTicketTotal,
      grandTotal: seatData.grandTotal,
    })
    fetchMovieDetails(seatData.movieId)
    fetchPromotions()
  }, [seatData, selectedProducts, navigate])

  // Lấy thông tin user khi vào trang
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${apiUrl}/member/account`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        })
        if (!res.ok) throw new Error("Failed to fetch user info")
        const data = await res.json()
        setUserInfo(data)
      } catch (err) {
        setUserInfo(null)
      }
    }
    if (token) fetchUserInfo()
  }, [apiUrl, token])

  const fetchMovieDetails = async (movieId) => {
    try {
      const res = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(`Failed to fetch movie details: ${errorData.message || res.status}`)
      }
      const movie = await res.json()
      setMovieDetails(movie)
      setLoading(false)
    } catch (err) {
      console.error("Error loading movie:", err)
      setError(`Error loading movie details: ${err.message}`)
      setLoading(false)
    }
  }

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/public/promotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(`Failed to fetch promotions: ${errorData.message || res.status}`)
      }
      const data = await res.json()
      setPromotions(
        data.map((promo) => ({
          value: promo,
          label: `${promo.title} (${promo.discountLevel}% off)`,
        })),
      )
    } catch (err) {
      console.error("Error fetching promotions:", err)
    }
  }

  const handleConfirm = async () => {
    if (!token || !bookingData) {
      toast.error("Booking data or login session not found. Please log in again.")
      navigate("/login")
      return
    }
    if (!bookingData.scheduleId) {
      toast.error("Missing scheduleId!")
      navigate("/")
      return
    }

    const scheduleSeatIds = bookingData.seatNumbers
      .map((seatId) => {
        const seat = bookingData.seats.find((s) => `${s.seatColumn}${s.seatRow}` === seatId)
        return seat?.scheduleSeatId
      })
      .filter(Boolean)

    try {
      // Step 1: Reconfirm seats with select-seats
      const selectRes = await fetch(`${apiUrl}/member/select-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          sessionId: bookingData.sessionId,
          scheduleId: Number(bookingData.scheduleId),
          scheduleSeatIds,
          products: Array.isArray(bookingData.products)
            ? bookingData.products.map((p) => ({
                productId: p.productId,
                quantity: p.quantity,
              }))
            : [],
        }),
      })

      if (!selectRes.ok) {
        const errorData = await selectRes.json()
        if (errorData.errorCode === "SESSION_EXPIRED") {
          toast.error("Booking session has expired. Please start again.")
          navigate("/")
          return
        }
        if (errorData.errorCode === "SEAT_ALREADY_BOOKED") {
          toast.error("One or more seats have been selected by someone else. Please select again.")
          navigate(-1)
          return
        }
        throw new Error(`Failed to select seats: ${errorData.message || selectRes.status}`)
      }

      const selectData = await selectRes.json()

      // Step 2: Confirm prices
      const confirmRes = await fetch(`${apiUrl}/member/confirm-prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          sessionId: selectData.sessionId,
          scheduleId: Number(bookingData.scheduleId),
          useScore: Number(useScore) || 0,
          promotionId: voucher?.value?.promotionId || null,
          ticketType: ticketType || "ADULT",
          products: Array.isArray(bookingData.products)
            ? bookingData.products.map((p) => ({
                productId: p.productId,
                quantity: p.quantity,
                notes: "",
              }))
            : [],
          skipProducts: !bookingData.products || bookingData.products.length === 0,
        }),
      })

      if (!confirmRes.ok) {
        const errorData = await confirmRes.json()
        if (errorData.errorCode === "SESSION_EXPIRED") {
          toast.error("Booking session has expired. Please start again.")
          navigate("/")
          return
        }
        if (errorData.errorCode === "INSUFFICIENT_SCORE") {
          toast.error("Not enough member points to use.")
          return
        }
        if (errorData.errorCode === "INVALID_PROMOTION") {
          toast.error("Invalid or expired promotion code.")
          return
        }
        throw new Error(`Failed to confirm prices: ${errorData.message || confirmRes.status}`)
      }

      const confirmData = await confirmRes.json()
      setConfirmResult(confirmData)

      // Update Redux store with confirmation data
      dispatch(
        setSeatData({
          ...bookingData,
          sessionId: confirmData.sessionId,
          originalTicketTotal: confirmData.originalTicketTotal,
          finalTicketTotal: confirmData.finalTicketTotal,
          discountFromScore: confirmData.discountFromScore,
          discountFromPromotion: confirmData.discountFromPromotion,
          finalProductsTotal: confirmData.finalProductsTotal,
          grandTotal: confirmData.grandTotal,
          confirmationResult: confirmData,
        }),
      )

      navigate(`/payment-detail/${confirmData.sessionId}/${bookingData.movieId}`, {
        state: {
          ...bookingData,
          sessionId: confirmData.sessionId,
          promotion: voucher?.value || null,
          confirmationResult: confirmData,
          originalTicketTotal: confirmData.originalTicketTotal,
          finalTicketTotal: confirmData.finalTicketTotal,
          discountFromScore: confirmData.discountFromScore,
          discountFromPromotion: confirmData.discountFromPromotion,
          finalProductsTotal: confirmData.finalProductsTotal,
          grandTotal: confirmData.grandTotal,
        },
      })
    } catch (err) {
      console.error("Booking confirmation error:", err)
      toast.error(`Booking confirmation error: ${err.message}. Please try again.`)
    }
  }

  if (loading || !bookingData)
    return (
      <div className="confirm-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="confirm-error">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate("/")}>
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    )

  const displayData = confirmResult || bookingData

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="confirm-cinema">
        {/* Film Strip Border */}
        <div className="film-strip-border">
          <div className="film-holes">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="film-hole"></div>
            ))}
          </div>
        </div>

        {/* Background Elements */}
        <div className="cinema-bg">
          <div className="bg-gradient"></div>
          <div className="bg-pattern"></div>
          <div className="floating-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="confirm-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="header-info">
            <h1 className="page-title">
              <span className="title-accent">BOOKING</span>
              <span className="title-main">CONFIRMATION</span>
            </h1>
            <div className="session-time">
              <span className="time-label">Session Time:</span>
              <span className="time-value">{formatTime(currentTime)}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="confirm-main">
          <div className="booking-container">
            {/* Movie Poster Section */}
            <div className="poster-section">
              <div className="poster-container">
                <div className="poster-frame">
                  <img
                    src={
                      movieDetails.posterImageUrl ||
                      `/placeholder.svg?height=600&width=400&query=movie poster for ${displayData.movieName || "/placeholder.svg"}`
                    }
                    alt={displayData.movieName}
                    className="poster-image"
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

              {/* User Info Box dưới poster */}
              {userInfo && (
                <div className="user-info-box under-poster">
                  <div className="user-info-content">
                    <div className="user-details">
                      <div className="user-fullname">{userInfo.fullName}</div>
                      <div className="user-meta">
                        <div className="user-username">
                          <FaUser className="meta-icon" />
                          <span>{userInfo.username}</span>
                        </div>
                        <div className="user-email">
                          <FaEnvelope className="meta-icon" />
                          <span>{userInfo.email}</span>
                        </div>
                      </div>
                      <div className="user-score">
                        <FaStar className="score-icon" />
                        <span>{userInfo.score} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Film Strip Decoration */}
              <div className="film-strip film-strip-left">
                <div className="film-holes">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="film-hole"></div>
                  ))}
                </div>
              </div>
              <div className="film-strip film-strip-right">
                <div className="film-holes">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="film-hole"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Details Section */}
            <div className="details-section">
              <div className="details-container">
                {/* Movie Information */}
                <div className="info-card movie-info">
                  <h2 className="card-title">Movie Details</h2>
                  <div className="info-grid">
                    <div className="info-item">
                      <FaTicketAlt className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Movie</span>
                        <span className="info-value">{displayData.movieName}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Date</span>
                        <span className="info-value">{displayData.showDate}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <FaClock className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Time</span>
                        <span className="info-value">{displayData.showTime}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Cinema</span>
                        <span className="info-value">{displayData.cinemaRoomName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="seats-display">
                    <span className="seats-label">Selected Seats:</span>
                    <div className="seats-list">
                      {displayData.seatNumbers.map((seat, index) => (
                        <span key={index} className="seat-badge">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="info-card pricing-info">
                  <h2 className="card-title">Pricing Breakdown</h2>
                  <div className="pricing-grid">
                    <div className="price-item">
                      <span className="price-label">Ticket Total</span>
                      <span className="price-value">{displayData.originalTicketTotal?.toLocaleString()} VND</span>
                    </div>
                    {displayData.discountFromScore > 0 && (
                      <div className="price-item discount">
                        <span className="price-label">Score Discount</span>
                        <span className="price-value">-{displayData.discountFromScore?.toLocaleString()} VND</span>
                      </div>
                    )}
                    {displayData.discountFromPromotion > 0 && (
                      <div className="price-item discount">
                        <span className="price-label">Promotion Discount</span>
                        <span className="price-value">-{displayData.discountFromPromotion?.toLocaleString()} VND</span>
                      </div>
                    )}
                    <div className="price-item">
                      <span className="price-label">Food & Drinks</span>
                      <span className="price-value">
                        {(displayData.finalProductsTotal || displayData.productsTotal)?.toLocaleString()} VND
                      </span>
                    </div>
                    <div className="price-item total">
                      <span className="price-label">Grand Total</span>
                      <span className="price-value">{displayData.grandTotal?.toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>

                {/* Options Section */}
                <div className="info-card options-info">
                  <h2 className="card-title">Booking Options</h2>

                  {/* Voucher Selection */}
                  <div className="option-group">
                    <label className="option-label">
                      <FaGift className="option-icon" />
                      Select Voucher
                    </label>
                    <Select
                      classNamePrefix="voucher"
                      options={promotions}
                      isClearable
                      placeholder="Choose a voucher..."
                      value={voucher}
                      onChange={setVoucher}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          background: "rgba(255, 255, 255, 0.05)",
                          border: `2px solid ${state.isFocused ? "#10b981" : "rgba(255, 255, 255, 0.1)"}`,
                          borderRadius: "12px",
                          minHeight: "50px",
                          boxShadow: state.isFocused ? "0 0 0 3px rgba(16, 185, 129, 0.1)" : "none",
                          "&:hover": {
                            borderColor: "#10b981",
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          background: "rgba(30, 41, 59, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          background: state.isSelected
                            ? "#10b981"
                            : state.isFocused
                              ? "rgba(16, 185, 129, 0.1)"
                              : "transparent",
                          color: state.isSelected ? "white" : "#ffffff",
                          "&:hover": {
                            background: "#10b981",
                            color: "white",
                          },
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "#ffffff",
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "rgba(255, 255, 255, 0.6)",
                        }),
                      }}
                    />
                  </div>

                  {/* Score Usage */}
                  <div className="option-group">
                    <label className="option-label">
                      <FaCoins className="option-icon" />
                      Use Member Points
                    </label>
                    <div className="score-input-container">
                      <input
                        type="number"
                        value={useScore}
                        onChange={(e) => setUseScore(Math.max(0, e.target.value))}
                        min="0"
                        className="score-input"
                        placeholder="Enter points to use..."
                      />
                      <div className="input-decoration"></div>
                    </div>
                  </div>

                  {/* Ticket Type */}
                  <div className="option-group">
                    <label className="option-label">
                      <FaTicketAlt className="option-icon" />
                      Ticket Type
                    </label>
                    <div className="ticket-type-container">
                      <select
                        value={ticketType}
                        onChange={(e) => setTicketType(e.target.value)}
                        className="ticket-select"
                      >
                        <option value="ADULT">Adult Ticket</option>
                        <option value="STUDENT">Student Ticket</option>
                      </select>
                      <div className="select-decoration"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="confirm-section">
              <button className="confirm-btn" onClick={handleConfirm}>
                <span className="btn-text">Confirm Booking</span>
                <div className="btn-glow"></div>
              </button>
              <p className="confirm-note">
                <span className="note-icon">⚠️</span>
                Confirmed tickets cannot be canceled or refunded
              </p>
            </div>
          </div>
        </main>

        {/* Film Strip Border Bottom */}
        <div className="film-strip-border bottom">
          <div className="film-holes">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="film-hole"></div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Confirm
