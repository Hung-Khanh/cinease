"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { FaArrowLeft } from "react-icons/fa"
import { setSeatData, setSelectedProducts, setSessionId } from "../../store/cartSlice"
import "./Product.scss"

const Product = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { movieId, sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [products, setProducts] = useState([])
  const [selectedQuantities, setSelectedQuantities] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const token = localStorage.getItem("token")
  const reduxSeatData = useSelector((state) => state.cart.seatData)
  const seatData = reduxSeatData || location.state || null
  const selectedProductsRedux = useSelector((state) => state.cart.selectedProducts)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedProductsRedux && selectedProductsRedux.length > 0) {
      const initialQuantities = {}
      selectedProductsRedux.forEach((item) => {
        initialQuantities[item.productId] = item.quantity
      })
      setSelectedQuantities(initialQuantities)
    }
  }, [selectedProductsRedux])

  useEffect(() => {
    if (location.state && !reduxSeatData) {
      dispatch(setSeatData(location.state))
      dispatch(setSessionId(location.state.sessionId))
    }
    if (!seatData || !seatData.sessionId) {
      alert("Không tìm thấy dữ liệu vé. Vui lòng quay lại chọn ghế.")
      navigate("/")
    }
  }, [seatData, reduxSeatData, navigate, dispatch, location.state])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        alert("Vui lòng đăng nhập lại.")
        navigate("/login")
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`${apiUrl}/member/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
            navigate("/login")
            return
          }
          throw new Error(`Failed to fetch products: ${errorData.message || response.status}`)
        }

        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [data])
      } catch (error) {
        console.error("❌ Fetch products error:", error)
        alert(`Không thể tải danh sách bắp nước: ${error.message}. Vui lòng thử lại.`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [apiUrl, navigate, token])

  const increaseQuantity = (productId) => {
    setSelectedQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + 1
      if (newQuantity > 10) {
        alert("Số lượng tối đa cho mỗi sản phẩm là 10.")
        return prev
      }
      return { ...prev, [productId]: newQuantity }
    })
  }

  const decreaseQuantity = (productId) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }))
  }

  const getTotalQuantity = () => Object.values(selectedQuantities).reduce((sum, qty) => sum + (qty || 0), 0)

  const getTotalPrice = () =>
    products.reduce((total, product) => total + (selectedQuantities[product.productId] || 0) * product.price, 0)

  const handleBack = () => navigate(-1)

  const handleConfirm = async () => {
    if (!seatData || !seatData.sessionId) {
      alert("Không tìm thấy dữ liệu vé. Vui lòng quay lại chọn ghế.")
      navigate("/")
      return
    }

    const selectedProducts = products
      .filter((p) => selectedQuantities[p.productId] > 0)
      .map((p) => ({
        productId: p.productId,
        quantity: selectedQuantities[p.productId],
      }))

    const totalItems = getTotalQuantity()
    if (totalItems > 20) {
      alert("Tổng số lượng sản phẩm không được vượt quá 20.")
      return
    }

    try {
      const scheduleSeatIds = seatData.selectedSeats.map((seatId) => {
        const seat = seatData.seats.find((s) => `${s.seatColumn}${s.seatRow}` === seatId)
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
          sessionId: seatData.sessionId,
          scheduleId: seatData.scheduleId,
          scheduleSeatIds,
          products: selectedProducts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.")
          navigate("/")
          return
        }
        if (errorData.errorCode === "INVALID_REQUEST") {
          alert("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.")
          return
        }
        throw new Error(`Failed to update booking session: ${errorData.message || response.status}`)
      }

      const data = await response.json()
      dispatch(setSelectedProducts(selectedProducts))
      dispatch(
        setSeatData({
          ...seatData,
          originalProductsTotal: data.productsTotal,
          grandTotal: data.grandTotal,
        }),
      )

      navigate(`/confirm/${seatData.sessionId}/${seatData.scheduleId}`, {
        state: {
          ...seatData,
          sessionId: data.sessionId,
          originalProductsTotal: data.productsTotal,
          grandTotal: data.grandTotal,
        },
      })
    } catch (error) {
      console.error("❌ Error updating booking session:", error)
      alert(`Lỗi khi cập nhật sản phẩm: ${error.message}. Vui lòng thử lại.`)
    }
  }

  if (!seatData) return null

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="cinema-products">
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

      {/* Header Section */}
      <header className="cinema-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              <span className="title-accent">CINEMA</span>
              <span className="title-main">CONCESSIONS</span>
            </h1>
            <p className="subtitle">Enhance your movie experience with our premium selection</p>
          </div>

          <div className="cinema-atmosphere">
            {/* Floating Film Strips */}
            <div className="film-strips">
              <div className="film-strip film-strip-1">
                <div className="film-holes">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="film-hole"></div>
                  ))}
                </div>
              </div>
              <div className="film-strip film-strip-2">
                <div className="film-holes">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="film-hole"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cinema Clock */}
            <div className="cinema-clock">
              <div className="clock-container">
                <div className="time-display">
                  <span className="time">{formatTime(currentTime)}</span>
                  <span className="date">{formatDate(currentTime)}</span>
                </div>
                <div className="clock-decoration">
                  <div className="clock-ring"></div>
                  <div className="clock-center"></div>
                </div>
              </div>
            </div>

            {/* Ambient Lights */}
            <div className="ambient-lights">
              <div className="light light-1"></div>
              <div className="light light-2"></div>
              <div className="light light-3"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="products-main">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading delicious treats...</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => {
              const quantity = selectedQuantities[product.productId] || 0
              return (
                <div
                  key={product.productId}
                  className={`product-card ${quantity > 0 ? "selected" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-inner">
                    <div className="product-image-container">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.productName}
                        className="product-image"
                      />
                      <div className="image-overlay">
                        <div className="category-badge">{product.category}</div>
                        {quantity > 0 && (
                          <div className="selected-indicator">
                            <span>{quantity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="product-content">
                      <h3 className="product-name">{product.productName}</h3>
                      <div className="product-price">
                        {Number(product.price).toLocaleString()} <span className="currency">VND</span>
                      </div>

                      <div className="quantity-section">
                        <div className="quantity-controls">
                          <button
                            className="qty-btn decrease"
                            onClick={() => decreaseQuantity(product.productId)}
                            disabled={quantity === 0}
                          >
                            −
                          </button>
                          <div className="quantity-display">
                            <span className="qty-number">{quantity}</span>
                          </div>
                          <button className="qty-btn increase" onClick={() => increaseQuantity(product.productId)}>
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Order Summary */}
      {getTotalQuantity() > 0 && (
        <div className="order-summary">
          <div className="summary-content">
            <div className="summary-left">
              <div className="summary-icon">🍿</div>
              <div className="summary-text">
                <span className="items-count">{getTotalQuantity()} items selected</span>
                <span className="total-amount">{getTotalPrice().toLocaleString()} VND</span>
              </div>
            </div>
            <div className="summary-right">
              <div className="price-breakdown">
                <span className="breakdown-label">Subtotal</span>
                <span className="breakdown-value">{getTotalPrice().toLocaleString()} VND</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="action-section">
        <button className={`confirm-btn ${getTotalQuantity() > 0 ? "active" : "inactive"}`} onClick={handleConfirm}>
          <span className="btn-text">
            {getTotalQuantity() > 0
              ? `Continue with ${getTotalQuantity()} item${getTotalQuantity() > 1 ? "s" : ""}`
              : "Skip & Continue"}
          </span>
          <div className="btn-glow"></div>
        </button>
      </div>
    </div>
  )
}

export default Product
