"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaArrowLeft,
  FaClock,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCoins,
  FaGift,
  FaCreditCard,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa"
import { useSelector } from "react-redux"
import "./PaymentDetail.scss"

const PaymentDetail = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { sessionId, movieId } = useParams()
  const navigate = useNavigate()
  const [movieDetails, setMovieDetails] = useState({
    posterImageUrl: "https://via.placeholder.com/300x450?text=No+Poster",
    movieName: "N/A",
  })
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("VNPAY")
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [countdown, setCountdown] = useState(300) // 5 minutes
  const [currentTime, setCurrentTime] = useState(new Date())
  const token = localStorage.getItem("token")
  const seatData = useSelector((state) => state.cart.seatData)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    console.log("seatData:", seatData) // Debug Redux state
    if (!seatData || !seatData.sessionId) {
      alert("Không tìm thấy dữ liệu đặt vé. Vui lòng chọn lại.")
      navigate("/")
      return
    }
    const fetchMovieDetails = async () => {
      try {
        if (!token) {
          alert("Bạn chưa đăng nhập.")
          navigate("/login")
          return
        }
        if (movieId) {
          const movieRes = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              Accept: "application/json",
            },
          })
          if (!movieRes.ok) {
            const errorData = await movieRes.json()
            throw new Error(`Failed to fetch movie details: ${errorData.message || movieRes.status}`)
          }
          const movie = await movieRes.json()
          setMovieDetails((prev) => ({
            ...prev,
            posterImageUrl: movie.posterImageUrl || prev.posterImageUrl,
            movieName: movie.movieNameEnglish || movie.movieNameVn || prev.movieName,
          }))
        }
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin phim:", err)
        alert(`Lỗi lấy thông tin phim: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [apiUrl, movieId, navigate, seatData, token])

  useEffect(() => {
    if (loading) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.")
navigate("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [loading, navigate])

  const handleConfirmPayment = async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập.")
      navigate("/login")
      return
    }
    try {
      const res = await fetch(`${apiUrl}/member/confirm-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ sessionId, paymentMethod }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.")
          navigate("/")
          return
        }
        if (errorData.errorCode === "PAYMENT_FAILED") {
          alert("Thanh toán thất bại. Vui lòng thử lại.")
          return
        }
        throw new Error(`Failed to confirm payment: ${errorData.message || res.status}`)
      }
      const data = await res.json()
      setPaymentUrl(data.paymentUrl || null)
    } catch (err) {
      console.error("❌ Lỗi xác nhận thanh toán:", err)
      alert(`Lỗi xác nhận thanh toán: ${err.message}. Vui lòng thử lại.`)
    }
  }

  // XÓA HOẶC COMMENT ĐOẠN NÀY:
  // useEffect(() => {
  //   if (paymentUrl) {
  //     window.location.href = paymentUrl
  //   }
  // }, [paymentUrl])

  // Thêm hàm xử lý khi nhấn Proceed to Pay
  const handleProceedToPay = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl
    }
  }

  if (loading)
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Loading payment details...</p>
      </div>
    )

  if (!seatData || !seatData.confirmationResult)
    return (
      <div className="payment-error">
        <h2>Error</h2>
        <p>Không tìm thấy thông tin đặt vé.</p>
      </div>
    )

  const {
    originalTicketTotal,
    finalTicketTotal,
    discountFromScore,
    discountFromPromotion,
    finalProductsTotal,
    grandTotal,
  } = seatData.confirmationResult

  const seatCount = seatData.confirmationResult?.seatNumbers?.length || 0
  const seatsDisplay = seatData.confirmationResult?.seatNumbers?.join(", ") || "N/A"

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
  }

  const paymentMethods = [
    {
      id: "VNPAY",
      name: "VNPay",
      icon: "/img/vnpay.png",
      description: "Secure payment via VNPay",
    },
    {
      id: "MOMO",
      name: "MoMo",
icon: "/img/momo.png",
      description: "Mobile wallet payment",
    },
    {
      id: "MOMO_QR",
      name: "MoMo QR",
      icon: "/img/momoqr.png",
      description: "QR code payment",
    },
  ]

  return (
    <div className="payment-cinema">
      {/* Background Elements */}
      <div className="cinema-bg">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="payment-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="header-center">
          <h1 className="page-title">
            <span className="title-accent">SECURE</span>
            <span className="title-main">PAYMENT</span>
          </h1>
          <div className="session-info">
            <span className="session-time">{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="countdown-container">
          <div className="countdown-timer">
            <FaClock className="timer-icon" />
            <span className="timer-text">{formatCountdown(countdown)}</span>
          </div>
          <div className="timer-label">Session expires</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="payment-main">
        <div className="payment-container">
          {/* Movie Poster Section */}
          <div className="poster-section">
            <div className="poster-container">
              <div className="poster-frame">
                <img
                  src={
                    movieDetails.posterImageUrl ||
                    `/placeholder.svg?height=600&width=400&query=movie poster for ${movieDetails.movieName || "/placeholder.svg"}`
                  }
                  alt={movieDetails.movieName}
                  className="poster-image"
                />
                <div className="poster-overlay">
                  <div className="movie-title">{movieDetails.movieName}</div>
                </div>
              </div>
              <div className="poster-glow"></div>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <FaShieldAlt className="security-icon" />
              <div className="security-text">
                <span className="security-title">Secure Payment</span>
                <span className="security-subtitle">256-bit SSL encryption</span>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="details-section">
            {/* Booking Summary */}
            <div className="info-card booking-summary">
<h2 className="card-title">Booking Summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <FaTicketAlt className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Movie</span>
                    <span className="summary-value">{seatData.movieName}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <FaMapMarkerAlt className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Cinema</span>
                    <span className="summary-value">{seatData.cinemaRoomName}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <FaCalendarAlt className="summary-icon" />
                  <div className="summary-content">
                    <span className="summary-label">Date & Time</span>
                    <span className="summary-value">
                      {seatData.showDate} at {seatData.showTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="seats-display">
                <span className="seats-label">Selected Seats ({seatCount})</span>
                <div className="seats-list">
                  {seatData.confirmationResult?.seatNumbers?.map((seat, index) => (
                    <span key={index} className="seat-badge">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="info-card payment-breakdown">
              <h2 className="card-title">Payment Details</h2>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="breakdown-label">Ticket Total</span>
                  <span className="breakdown-value">{originalTicketTotal?.toLocaleString()} VND</span>
                </div>
                {discountFromScore > 0 && (
                  <div className="breakdown-item discount">
                    <span className="breakdown-label">
                      <FaCoins className="discount-icon" />
                      Score Discount
                    </span>
                    <span className="breakdown-value">-{discountFromScore?.toLocaleString()} VND</span>
                  </div>
                )}
                {discountFromPromotion > 0 && (
                  <div className="breakdown-item discount">
                    <span className="breakdown-label">
                      <FaGift className="discount-icon" />
                      Promotion Discount
                    </span>
                    <span className="breakdown-value">-{discountFromPromotion?.toLocaleString()} VND</span>
</div>
                )}
                <div className="breakdown-item">
                  <span className="breakdown-label">Food & Drinks</span>
                  <span className="breakdown-value">{finalProductsTotal?.toLocaleString()} VND</span>
                </div>
                <div className="breakdown-item total">
                  <span className="breakdown-label">Grand Total</span>
                  <span className="breakdown-value">{grandTotal?.toLocaleString()} VND</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="info-card payment-methods">
              <h2 className="card-title">
                <FaCreditCard className="title-icon" />
                Payment Method
              </h2>
              <div className="methods-grid">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    className={`method-card ${paymentMethod === method.id ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="method-icon">
                      <img src={method.icon || "/placeholder.svg"} alt={method.name} />
                    </div>
                    <div className="method-info">
                      <span className="method-name">{method.name}</span>
                      <span className="method-description">{method.description}</span>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="selected-indicator">
                        <FaCheckCircle />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-section">
              <button className="confirm-payment-btn" onClick={handleConfirmPayment}>
                <span className="btn-text">Confirm Payment</span>
                <div className="btn-glow"></div>
              </button>

              {paymentUrl && (
                <button className="proceed-payment-btn" onClick={handleProceedToPay}>
                  <span className="btn-text">Proceed to Pay</span>
                  <FaCreditCard className="btn-icon" />
                </button>
              )}

              <div className="payment-note">
                <div className="note-content">
                  <span className="note-icon">ℹ️</span>
                  <span className="note-text">
                    Please visit the counter to receive your tickets after successful payment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PaymentDetail