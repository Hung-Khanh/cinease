import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./PaymentDetail.scss";

const PaymentDetail = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [ticketData, setTicketData] = useState(null);
  const [movieDetails, setMovieDetails] = useState({
    posterImageUrl: "https://via.placeholder.com/300x450?text=No+Poster",
    movieName: "N/A",
  });

  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 phút

  const { promotion, grandTotal } = location.state || { promotion: null, grandTotal: 0 };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập.");
        navigate("/login");
        return;
      }
      try {
        // Use the new booking-summary endpoint
        const ticketRes = await fetch(`${apiUrl}/public/booking-summary?invoiceId=${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });

        if (!ticketRes.ok) {
          const msg = await ticketRes.text();
          console.warn("🛑 Lỗi lấy booking summary:", msg);
          return;
        }

        const bookingSummary = await ticketRes.json();
        setTicketData(bookingSummary);

        // Fetch movie poster using movieName
        if (bookingSummary.movieName) {
          await searchMovieByName(bookingSummary.movieName, token);
        }
      } catch (err) {
        console.error("❌ Lỗi gọi API booking summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [invoiceId, apiUrl, navigate]);

  useEffect(() => {
    if (loading || !ticketData) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(-1); // Hết thời gian quay lại trang trước
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, ticketData, navigate]);

  const searchMovieByName = async (name, token) => {
    try {
      const res = await fetch(`${apiUrl}/public/movies?q=${encodeURIComponent(name)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });
      if (!res.ok) return;
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const movie = results[0];
        setMovieDetails((prev) => ({
          ...prev,
          posterImageUrl: movie.largeImage || movie.posterImageUrl || prev.posterImageUrl,
          movieName: movie.movieNameEnglish || movie.movieNameVn || name,
        }));
      }
    } catch (err) {
      console.error("❌ Lỗi tìm phim theo tên:", err);
    }
  };

  const handleConfirmPayment = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/member/confirm-payment`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          Accept: "application/json", 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ invoiceId: invoiceId, paymentMethod }),
      });
      if (!res.ok) {
        const msg = await res.text();
        alert(`Lỗi xác nhận thanh toán: ${msg}`);
        return;
      }
      const data = await res.json();
      setPaymentUrl(data.paymentUrl || null);
    } catch (err) {
      console.error("❌ Lỗi xác nhận thanh toán:", err);
      alert("Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.");
    }
  };

  if (loading || !ticketData) return <div>Đang tải dữ liệu...</div>;

  // Map data from the new booking-summary structure
  const {
    movieName,
    cinemaRoomName = "N/A",
    scheduleShowDate,
    scheduleShowTime,
    seatNumbers = [],
    totalPrice = 0,
    productsTotal = 0,
    grandTotal: apiGrandTotal = 0,
    ticketCount = 0,
    products = [],
    status = "PENDING"
  } = ticketData;

  // Format date and time
  const formattedDate = new Date(scheduleShowDate).toLocaleDateString("vi-VN");
  const formattedTime = scheduleShowTime || "N/A";

  // Calculate totals
  const ticketProducts = products.filter(p => p.itemType === "TICKET");
  const snackProducts = products.filter(p => p.itemType !== "TICKET");
  
  const ticketTotal = ticketProducts.reduce((sum, product) => sum + product.totalPrice, 0);
  const snackTotal = snackProducts.reduce((sum, product) => sum + product.totalPrice, 0);
  
  // Use promotion discount if provided
  const discountPercent = promotion?.discountLevel || 0;
  const discountAmount = (ticketTotal * discountPercent) / 100;
  const finalTotal = apiGrandTotal || (ticketTotal - discountAmount + snackTotal);

  // Get customer info from products or use placeholder
  const customerInfo = {
    fullName: "N/A",
    phoneNumber: "N/A", 
    identityCard: "N/A"
  };

  return (
    <>
      <div className="payment-detail-wrapper">
        <div className="countdown-wrapper">
          <div className="countdown-timer">
            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
          </div>
        </div>

        <div className="content">
          <div className="poster-section">
            <img src={movieDetails.posterImageUrl} alt="Movie Poster" className="poster" />
            <h3>{movieDetails.movieName}</h3>
          </div>

          <div className="payment-info">
            <h2>PAYMENT INFORMATION</h2>
            <div className="detail-row"><span>🎬 MOVIE</span><span>{movieName}</span></div>
            <div className="detail-row"><span>🏢 CINEROOM</span><span>{cinemaRoomName}</span></div>
            <div className="detail-row"><span>📅 DATE</span><span>{formattedDate}</span></div>
            <div className="detail-row"><span>🕒 TIME</span><span>{formattedTime}</span></div>
            <div className="detail-row"><span>💺 SEATS ({ticketCount})</span><span>{seatNumbers.join(", ")}</span></div>
            <div className="detail-row"><span>👤 FULLNAME</span><span>{customerInfo.fullName}</span></div>
            <div className="detail-row"><span>ID CARD</span><span>{customerInfo.identityCard}</span></div>
            <div className="detail-row"><span>📞 PHONE</span><span>{customerInfo.phoneNumber}</span></div>
            <div className="detail-row"><span>📋 STATUS</span><span>{status}</span></div>

            <div className="detail-row transaction"><span>PAYMENT DETAIL</span></div>
            <div className="detail-row"><span>💰 TICKET TOTAL</span><span>{ticketTotal.toLocaleString()} VND</span></div>
            <div className="detail-row"><span>🍿 SNACK TOTAL</span><span>{snackTotal.toLocaleString()} VND</span></div>

            {promotion && (
              <div className="detail-row"><span>🏷️ PROMOTION ({promotion.title})</span><span>{discountPercent}%</span></div>
            )}

            <div className="detail-row"><span>🔄 DISCOUNT AMOUNT</span><span>- {discountAmount.toLocaleString()} VND</span></div>
            <div className="detail-row total"><span>💰 GRAND TOTAL</span><span>{finalTotal.toLocaleString()} VND</span></div>

            {/* Products breakdown */}
            {products && products.length > 0 && (
              <>
                <div className="detail-row transaction"><span>PRODUCTS BREAKDOWN</span></div>
                {products.map((product, index) => (
                  <div key={index} className="detail-row">
                    <span>
                      {product.itemType === "TICKET" ? "🎫" : "🍿"} {product.productName || product.ticketInfo}
                      {product.quantity > 1 && ` (x${product.quantity})`}
                    </span>
                    <span>{product.totalPrice.toLocaleString()} VND</span>
                  </div>
                ))}
              </>
            )}

            <div className="detail-row payment-method-selector">
              <span>💳 PAYMENT METHOD</span>
              <div className="payment-options">
                <button
                  className={`payment-option ${paymentMethod === "VNPAY" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("VNPAY")}
                  title="VNPAY"
                >
                  <img src="fe_team_2/public/img/0oxhzjmxbksr1686814746087.png" alt="VNPAY" />
                </button>
                <button
                  className={`payment-option ${paymentMethod === "MOMO" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("MOMO")}
                  title="MOMO"
                >
                  <img src="/images/momo-logo.png" alt="MOMO" />
                </button>
                <button
                  className={`payment-option ${paymentMethod === "MOMO_QR" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("MOMO_QR")}
                  title="MOMO QR"
                >
                  <img src="/images/momo-qr-logo.png" alt="MOMO QR" />
                </button>
              </div>
            </div>

            <button className="payment-button" onClick={handleConfirmPayment}>
              ✅ CONFIRM PAYMENT
            </button>
            
            {paymentUrl && (
              <a href={paymentUrl} className="payment-button" target="_blank" rel="noopener noreferrer">
                💳 PROCEED TO PAY
              </a>
            )}

            <p className="note">* Please visit counter to receive tickets after successful payment.</p>
          </div>
        </div>
      </div>

      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
      </div>
    </>
  );
};

export default PaymentDetail;
