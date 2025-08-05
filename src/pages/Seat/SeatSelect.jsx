import { useEffect, useState } from "react"
import "./SeatSelect.scss"
import { FaArrowLeft, FaTicketAlt, FaCalendarAlt, FaClock, FaCouch } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import { PiArmchair, PiArmchairFill, PiArmchairDuotone } from "react-icons/pi"
import { TbArmchair2Off } from "react-icons/tb"
import { useSelector, useDispatch } from "react-redux"
import { setSeatData, setSessionId, clearSeatData, clearSessionId } from "../../store/cartSlice"
import { getSeats } from "../../api/seat";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const SeatSelect = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api", onBack }) => {
  const [seats, setSeats] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const { scheduleId: paramScheduleId, movieId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token) || window.localStorage.getItem("token")
  const bookingInfoFromRedux = useSelector((state) => state.tempBooking)
  const existingSessionId = useSelector((state) => state.cart.sessionId)
  const existingSeatData = useSelector((state) => state.cart.seatData)

  let bookingInfo = bookingInfoFromRedux
  if (!bookingInfo.movieName && window.localStorage.getItem("bookingInfo")) {
    bookingInfo = JSON.parse(window.localStorage.getItem("bookingInfo"))
  }

  const scheduleId = bookingInfo.scheduleId || paramScheduleId

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getInitialSelectedSeats = () => {
    if (existingSessionId && existingSeatData?.selectedSeats?.length > 0) {
      return existingSeatData.selectedSeats
    }
    const seatsFromStorage = window.localStorage.getItem("selectedSeats")
    if (seatsFromStorage) {
      try {
        return JSON.parse(seatsFromStorage)
      } catch {
        return []
      }
    }
    return []
  }

  const [selectedSeats, setSelectedSeats] = useState(getInitialSelectedSeats())

  useEffect(() => {
    setSelectedSeats([])
    window.localStorage.setItem("selectedSeats", JSON.stringify([]))
  }, [movieId, scheduleId])

  useEffect(() => {
    if (existingSessionId && existingSeatData?.selectedSeats?.length > 0) {
      setSelectedSeats(existingSeatData.selectedSeats)
    } else {
      const seatsFromStorage = window.localStorage.getItem("selectedSeats")
      if (seatsFromStorage) {
        try {
          setSelectedSeats(JSON.parse(seatsFromStorage))
        } catch {
          setSelectedSeats([])
        }
      }
    }
  }, [existingSessionId, existingSeatData])


  useEffect(() => {
    window.localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats))
  }, [selectedSeats])

  const fetchSeat = async () => {
    if (!token) {
      toast.error("You are not logged in or your session has expired. Please log in again.", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
        toastStyle: { background: "#eb5757", color: "#fff" },
      });
      navigate("/login");
      return;
    }
    try {
      const response = await getSeats(scheduleId);
      const data = response.data;
      setSeats(data);

      if (!existingSessionId) {
        setSelectedSeats([]);
        window.localStorage.setItem("selectedSeats", JSON.stringify([]));
        return;
      }

      setSelectedSeats((prev) => {
        const sessionSeatIds = existingSeatData?.selectedSeats || [];
        const validSeatIds = data
          .filter((s) => {
            const seatId = `${s.seatColumn}${s.seatRow}`;
            return s.seatStatus === "AVAILABLE" || (s.seatStatus === "HOLD" && sessionSeatIds.includes(seatId));
          })
          .map((s) => `${s.seatColumn}${s.seatRow}`);

        const filtered = prev.filter((seatId) => validSeatIds.includes(seatId));
        if (filtered.length !== prev.length) {
          window.localStorage.setItem("selectedSeats", JSON.stringify(filtered));
        }
        return filtered;
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
          toastStyle: { background: "#eb5757", color: "#fff" },
        });
        navigate("/login");
        return;
      }
      if (error.response && error.response.data?.errorCode === "SHOWTIME_NOT_FOUND") {
        toast.error("Showtime not found. Please select another showtime.", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
          toastStyle: { background: "#eb5757", color: "#fff" },
        });
        navigate(-1);
        return;
      }
      console.error("🔥 Error in fetchSeat:", error);
      toast.error(`Error loading seat list: ${error.message}. Please try again.`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
        toastStyle: { background: "#eb5757", color: "#fff" },
      });
    }
  };

  useEffect(() => {
    const releasePreviousSeats = async () => {
      if (existingSessionId && token) {
        try {
          const response = await fetch(`${apiUrl}/member/select-seats`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              sessionId: existingSessionId,
              scheduleId: Number.parseInt(scheduleId),
              scheduleSeatIds: [],
              products: existingSeatData?.products || [],
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            if (errorData.errorCode === "SESSION_EXPIRED") {
              toast.error("Booking session expired. Please start again.", {
                position: "top-center",
                autoClose: 2000,
                theme: "colored",
                toastStyle: { background: "#eb5757", color: "#fff" },
              });
              dispatch(clearSeatData())
              dispatch(clearSessionId())
              window.localStorage.removeItem("selectedSeats")
              navigate("/")
              return
            }
            throw new Error(`Failed to release seats: ${errorData.message || response.status}`)
          }

          const data = await response.json()
          dispatch(setSessionId(data.sessionId))
          dispatch(
            setSeatData({
              ...existingSeatData,
              sessionId: data.sessionId,
              selectedSeats: [],
              originalTicketTotal: data.totalPrice,
              originalProductsTotal: data.productsTotal,
              grandTotal: data.grandTotal,
            }),
          )
          setSelectedSeats([])
          window.localStorage.setItem("selectedSeats", JSON.stringify([]))
        } catch (error) {
          console.error("🔥 Error releasing previous seats:", error)
          if (error.message.includes("SESSION_EXPIRED")) {
            toast.error("Booking session expired. Please start again.", {
              position: "top-center",
              autoClose: 2000,
              theme: "colored",
              toastStyle: { background: "#eb5757", color: "#fff" },
            });
            dispatch(clearSeatData())
            dispatch(clearSessionId())
            window.localStorage.removeItem("selectedSeats")
            navigate("/")
          }
        }
      }
    }

    releasePreviousSeats().then(fetchSeat)
  }, [scheduleId, token, navigate, existingSessionId, dispatch])

  const findSeatBySeatId = (seatId) => {
    return seats.find((seat) => `${seat.seatColumn}${seat.seatRow}` === seatId)
  }

  const toggleSeat = (seatId) => {
    const seat = findSeatBySeatId(seatId)
    if (!seat) return

    const sessionSeatIds = existingSeatData?.selectedSeats || []
    if (seat.seatStatus !== "AVAILABLE" && !(seat.seatStatus === "HOLD" && sessionSeatIds.includes(seatId))) {
      return
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId)
      }
      if (prev.length >= 8) {
        toast.warn("You can select up to 8 seats only.", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
          toastStyle: { background: "#f2c94c", color: "#fff" },
        });
        return prev
      }
      return [...prev, seatId]
    })
  }

  const handleCheckout = async () => {
    if (!token) {
      toast.error("You are not logged in or your session has expired. Please log in again.", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
        toastStyle: { background: "#eb5757", color: "#fff" },
      });
      navigate("/login")
      return
    }

    if (selectedSeats.length === 0) {
      toast.warn("Please choose at least one seat.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        toastStyle: { background: "#6fcf97", color: "#fff" },
      })
      return
    }

    try {
      const scheduleSeatIds = selectedSeats.map((seatId) => {
        const seat = findSeatBySeatId(seatId)
        return seat.scheduleSeatId
      })

      const response = await fetch(`${apiUrl}/member/select-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          sessionId: existingSessionId || undefined,
          scheduleId: Number.parseInt(scheduleId),
          scheduleSeatIds,
          products: existingSeatData?.products || [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errorCode === "SEAT_ALREADY_BOOKED") {
          toast.error("One or more seats have been selected by someone else. Please select again.", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
            toastStyle: { background: "#eb5757", color: "#fff" },
          });
          fetchSeat()
          return
        }
        if (errorData.errorCode === "SEAT_LIMIT_EXCEEDED") {
          toast.warn("You cannot select more than 8 seats.", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
            toastStyle: { background: "#f2c94c", color: "#fff" },
          });
          return
        }
        if (errorData.errorCode === "SEAT_GAP_VIOLATION") {
          toast.warn("Invalid seat selection: do not leave a single empty seat gap.", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
            toastStyle: { background: "#f2c94c", color: "#fff" },
          });
          return
        }
        if (errorData.errorCode === "SESSION_EXPIRED") {
          toast.error("Booking session expired. Please start again.", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
            toastStyle: { background: "#eb5757", color: "#fff" },
          });
          dispatch(clearSeatData())
          dispatch(clearSessionId())
          window.localStorage.removeItem("selectedSeats")
          navigate("/")
          return
        }
        throw new Error(`Failed to select seats: ${errorData.message || response.status}`)
      }

      const data = await response.json()
      dispatch(setSessionId(data.sessionId))
      dispatch(
        setSeatData({
          sessionId: data.sessionId,
          scheduleId: Number.parseInt(scheduleId),
          selectedSeats,
          seats,
          movieId,
          movieName: data.movieName,
          showDate: data.scheduleShowDate,
          showTime: data.scheduleShowTime,
          cinemaRoomName: data.cinemaRoomName,
          originalTicketTotal: data.totalPrice,
          originalProductsTotal: data.productsTotal,
          grandTotal: data.grandTotal,
          products: existingSeatData?.products || [],
        }),
      )

      navigate(`/product/${movieId}/${scheduleId}`, {
        state: {
          sessionId: data.sessionId,
          scheduleId: Number.parseInt(scheduleId),
          selectedSeats,
          seats,
          movieId,
          movieName: data.movieName,
          showDate: data.scheduleShowDate,
          showTime: data.scheduleShowTime,
          cinemaRoomName: data.cinemaRoomName,
          products: existingSeatData?.products || [],
        },
      })
    } catch (error) {
      console.error("🔥 Error in handleCheckout:", error)
      toast.error(`Error selecting seats: ${error.message}. Please try again.`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
        toastStyle: { background: "#eb5757", color: "#fff" },
      });
    }
  }

  const renderSeats = () => {
    const seatColumns = [...new Set(seats.map((s) => s.seatColumn))].sort()
    const maxRow = seats.length === 0 ? 0 : Math.max(...seats.map((s) => s.seatRow))
    const seatRows = Array.from({ length: maxRow }, (_, i) => i + 1)
    const sessionSeatIds = existingSeatData?.selectedSeats || []

    return (
      <div className="seat-matrix">
        <div className="column-headers">
          <div className="empty-slot"></div>
          {seatRows.map((rowNum) => (
            <div key={rowNum} className="column-marker">
              {rowNum}
            </div>
          ))}
        </div>
        {seatColumns.map((col) => (
          <div key={col} className="row-container">
            <div className="row-indicator">{col}</div>
            {seatRows.map((row) => {
              const seatId = `${col}${row}`
              const seat = seats.find((s) => `${s.seatColumn}${s.seatRow}` === seatId)

              if (!seat) {
                return <div key={seatId} className="seat-empty"></div>
              }

              const isSelected = selectedSeats.includes(seatId)
              const isUnavailable =
                seat.seatStatus === "BOOKED" || (seat.seatStatus === "HOLD" && !sessionSeatIds.includes(seatId))
              const isVip = seat.seatType === "VIP"

              return (
                <button
                  key={seatId}
                  onClick={() => toggleSeat(seatId)}
                  className={`seat-button ${isVip ? "vip" : ""} ${isSelected ? "selected" : ""} ${isUnavailable ? "unavailable" : ""
                    }`}
                  disabled={isUnavailable}
                >
                  {isUnavailable ? (
                    <TbArmchair2Off className="seat-icon" />
                  ) : isSelected ? (
                    <PiArmchairFill className="seat-icon" />
                  ) : isVip ? (
                    <PiArmchairDuotone className="seat-icon" />
                  ) : (
                    <PiArmchair className="seat-icon" />
                  )}
                  <div className="seat-number">{seatId}</div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="seat-select-cinema">
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
      <header className="seat-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="header-center">
          <h1 className="page-title">
            <span className="title-accent">SELECT</span>
            <span className="title-main">SEATS</span>
          </h1>
          <div className="session-info">
            <span className="session-time">{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="header-decoration">
          <div className="cinema-reel">
            <div className="reel-center"></div>
            <div className="reel-holes">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="reel-hole"></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="seat-main">
        <div className="seat-container">
          {/* Movie Info Card */}
          <div className="movie-info-card">
            <div className="info-grid">
              <div className="info-item">
                <FaTicketAlt className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Movie</span>
                  <span className="info-value">{bookingInfo.movieName || "N/A"}</span>
                </div>
              </div>
              <div className="info-item">
                <FaCalendarAlt className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Date</span>
                  <span className="info-value">{bookingInfo.showDate || "N/A"}</span>
                </div>
              </div>
              <div className="info-item">
                <FaClock className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Time</span>
                  <span className="info-value">{bookingInfo.showTime || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cinema Screen */}
          <div className="cinema-screen">
            <div className="screen-container">
              <div className="screen-frame">
                <div className="screen-surface">
                  <span className="screen-text">CINEMA SCREEN</span>
                </div>
                <div className="screen-glow"></div>
              </div>
              <div className="screen-lights">
                <div className="light light-1"></div>
                <div className="light light-2"></div>
                <div className="light light-3"></div>
              </div>
            </div>
          </div>

          {/* Seat Selection Area */}
          <div className="seat-selection-area">
            {seats.length > 0 ? (
              renderSeats()
            ) : (
              <div className="loading-seats">
                <div className="loading-spinner"></div>
                <p>Loading seats...</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <PiArmchair className="legend-icon available" />
              <span>Available</span>
            </div>
            <div className="legend-item">
              <PiArmchairFill className="legend-icon selected" />
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <TbArmchair2Off className="legend-icon unavailable" />
              <span>Unavailable</span>
            </div>
            <div className="legend-item">
              <PiArmchairDuotone className="legend-icon vip" />
              <span>VIP</span>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedSeats.length > 0 && (
            <div className="selection-summary">
              <div className="summary-content">
                <div className="selected-seats">
                  <FaCouch className="summary-icon" />
                  <div className="seats-info">
                    <span className="seats-label">Selected Seats</span>
                    <div className="seats-list">
                      {selectedSeats.map((seat, index) => (
                        <span key={seat} className="seat-badge">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="seat-count">
                  <span className="count-number">{selectedSeats.length}</span>
                  <span className="count-label">Seat{selectedSeats.length > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          )}


          {/* Action Button */}
          <div className="action-section">
            <button
              className={`checkout-btn ${selectedSeats.length > 0 ? "active" : "inactive"}`}
              onClick={handleCheckout}
            >
              <span className="btn-text">
                {selectedSeats.length > 0
                  ? `Continue with ${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}`
                  : "Select seats to continue"}
              </span>
              <div className="btn-glow"></div>
            </button>
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastStyle={{ background: "#6fcf97", color: "#fff" }} 
      />
    </div>
  )
}

export default SeatSelect;
