import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import "./PaymentDetail.scss";

const PaymentDetail = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { sessionId, movieId } = useParams();
  const navigate = useNavigate();

  const [movieDetails, setMovieDetails] = useState({
    posterImageUrl: "https://via.placeholder.com/300x450?text=No+Poster",
    movieName: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const token = localStorage.getItem("token");
  const seatData = useSelector((state) => state.cart.seatData);

  useEffect(() => {
    console.log("seatData:", seatData); // Debug Redux state
    if (!seatData || !seatData.sessionId) {
      alert("Không tìm thấy dữ liệu đặt vé. Vui lòng chọn lại.");
      navigate("/");
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        if (!token) {
          alert("Bạn chưa đăng nhập.");
          navigate("/login");
          return;
        }
        if (movieId) {
          const movieRes = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              Accept: "application/json",
            },
          });
          if (!movieRes.ok) {
            const errorData = await movieRes.json();
            throw new Error(`Failed to fetch movie details: ${errorData.message || movieRes.status}`);
          }
          const movie = await movieRes.json();
          setMovieDetails((prev) => ({
            ...prev,
            posterImageUrl: movie.posterImageUrl || prev.posterImageUrl,
            movieName: movie.movieNameEnglish || movie.movieNameVn || prev.movieName,
          }));
        }
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin phim:", err);
        alert(`Lỗi lấy thông tin phim: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [apiUrl, movieId, navigate, seatData, token]);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, navigate]);

  const handleConfirmPayment = async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập.");
      navigate("/login");
      return;
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
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
          navigate("/");
          return;
        }
        if (errorData.errorCode === "PAYMENT_FAILED") {
          alert("Thanh toán thất bại. Vui lòng thử lại.");
          return;
        }
        throw new Error(`Failed to confirm payment: ${errorData.message || res.status}`);
      }

      const data = await res.json();
      setPaymentUrl(data.paymentUrl || null);
    } catch (err) {
      console.error("❌ Lỗi xác nhận thanh toán:", err);
      alert(`Lỗi xác nhận thanh toán: ${err.message}. Vui lòng thử lại.`);
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!seatData || !seatData.confirmationResult) return <div>Không tìm thấy thông tin đặt vé.</div>;

  const { originalTicketTotal, finalTicketTotal, discountFromScore, discountFromPromotion, finalProductsTotal, grandTotal } = seatData.confirmationResult;
  const seatCount = seatData.confirmationResult?.seatNumbers?.length || 0;
  const seatsDisplay = seatData.confirmationResult?.seatNumbers?.join(", ") || "N/A";

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
            <div className="detail-row"><span>🎬 MOVIE</span><span>{seatData.movieName}</span></div>
            <div className="detail-row"><span>🏢 CINEROOM</span><span>{seatData.cinemaRoomName}</span></div>
            <div className="detail-row"><span>📅 DATE</span><span>{seatData.showDate}</span></div>
            <div className="detail-row"><span>🕒 TIME</span><span>{seatData.showTime}</span></div>
            <div className="detail-row"><span>💺 SEAT ({seatCount})</span><span>{seatsDisplay}</span></div>

            <div className="detail-row transaction"><span>PAYMENT DETAIL</span></div>
            <div className="detail-row"><span>🎟 TICKET TOTAL</span><span>{originalTicketTotal?.toLocaleString()} VND</span></div>
            {discountFromScore > 0 && (
              <div className="detail-row"><span>💳 SCORE DISCOUNT</span><span>- {discountFromScore?.toLocaleString()} VND</span></div>
            )}
            {discountFromPromotion > 0 && (
              <div className="detail-row"><span>🎁 PROMOTION DISCOUNT</span><span>- {discountFromPromotion?.toLocaleString()} VND</span></div>
            )}
            <div className="detail-row"><span>🥤 FOOD & DRINK</span><span>{finalProductsTotal?.toLocaleString()} VND</span></div>
            <div className="detail-row total"><span>💰 GRAND TOTAL</span><span>{grandTotal?.toLocaleString()} VND</span></div>

            <div className="detail-row payment-method-selector">
              <span>💳 PAYMENT METHOD</span>
              <div className="payment-options">
                <button
                  className={`payment-option ${paymentMethod === "VNPAY" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("VNPAY")}
                  title="VNPAY"
                >
                  <img src="/img/vnpay.png" alt="VNPAY" />
                </button>
                <button
                  className={`payment-option ${paymentMethod === "MOMO" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("MOMO")}
                  title="MOMO"
                >
                  <img src="/img/momo.png" alt="MOMO" />
                </button>
                <button
                  className={`payment-option ${paymentMethod === "MOMO_QR" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("MOMO_QR")}
                  title="MOMO QR"
                >
                  <img src="/img/momoqr.png" alt="MOMO QR" />
                </button>
              </div>
            </div>

            <button className="payment-button" onClick={handleConfirmPayment}>✅ CONFIRM PAYMENT</button>
            {paymentUrl && (
              <a href={paymentUrl} className="payment-button">
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