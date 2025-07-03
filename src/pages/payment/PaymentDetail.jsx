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

  // Lấy các tham số từ location.state
  const { promotion, grandTotal, cinemaRoomName: stateCinemaRoomName } = location.state || {
    promotion: null,
    grandTotal: 0,
    cinemaRoomName: "",
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập.");
        navigate("/login");
        return;
      }

      try {
        const ticketRes = await fetch(`${apiUrl}/member/ticket-info?invoiceId=${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });

        if (!ticketRes.ok) {
          const msg = await ticketRes.text();
          console.warn("🛑 Lỗi lấy ticket:", msg);
          return;
        }

        const ticket = await ticketRes.json();
        setTicketData(ticket);

        if (ticket.movieId) {
          await fetchMovieDetails(ticket.movieId, token);
        } else if (ticket.movieName) {
          await searchMovieByName(ticket.movieName, token);
        } else {
          setMovieDetails((prev) => ({ ...prev, movieName: ticket.movieName || "N/A" }));
        }
      } catch (err) {
        console.error("❌ Lỗi gọi API ticket:", err);
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
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, ticketData, navigate]);

  const fetchMovieDetails = async (movieId, token) => {
    try {
      const movieRes = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });
      if (!movieRes.ok) return;
      const movie = await movieRes.json();
      setMovieDetails((prev) => ({
        ...prev,
        posterImageUrl: movie.posterImageUrl || prev.posterImageUrl,
        movieName: movie.movieNameEnglish || movie.movieNameVn || prev.movieName,
      }));
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin phim:", err);
    }
  };

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
          posterImageUrl: movie.posterImageUrl || prev.posterImageUrl,
          movieName: movie.movieNameEnglish || movie.movieNameVn || prev.movieName,
        }));
      }
    } catch (err) {
      console.error("❌ Lỗi tìm phim:", err);
    }
  };

  const handleConfirmPayment = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/member/confirm-payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
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
    }
  };

  if (loading || !ticketData) return <div>Đang tải dữ liệu...</div>;

  const {
    movieName,
    date,
    time,
    seat = [],
    price = 0,
    fullName,
    phoneNumber,
    identityCard,
    cinemaRoomName, // lấy từ API
  } = ticketData;

  const finalCinemaRoomName = stateCinemaRoomName || cinemaRoomName || "N/A";

  const seatCount = seat.length;
  const formattedDate = new Date(date).toLocaleDateString("vi-VN");
  const formattedTime = new Date(time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const ticketTotal = price * seatCount;
  const discountPercent = promotion?.discountLevel || 0;
  const originalTotal = grandTotal || ticketTotal;
  const discountAmount = (originalTotal * discountPercent) / 100;
  const finalTotal = originalTotal - discountAmount;

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
            <div className="detail-row"><span>🏢 CINEROOM</span><span>{finalCinemaRoomName}</span></div>
            <div className="detail-row"><span>📅 DATE</span><span>{formattedDate}</span></div>
            <div className="detail-row"><span>🕒 TIME</span><span>{formattedTime}</span></div>
            <div className="detail-row"><span>💺 SEAT ({seatCount})</span><span>{seat.join(", ")}</span></div>
            <div className="detail-row"><span>👤 FULLNAME</span><span>{fullName}</span></div>
            <div className="detail-row"><span>ID CARD</span><span>{identityCard}</span></div>
            <div className="detail-row"><span>📞 PHONE</span><span>{phoneNumber}</span></div>

            <div className="detail-row transaction"><span>PAYMENT DETAIL</span></div>
            <div className="detail-row"><span>💰 ORIGINAL TOTAL</span><span>{originalTotal.toLocaleString()} VND</span></div>

            {promotion && (
              <div className="detail-row"><span>🏷️ PROMOTION ({promotion.title})</span><span>{discountPercent}%</span></div>
            )}

            <div className="detail-row"><span>🔄 DISCOUNT AMOUNT</span><span>- {discountAmount.toLocaleString()} VND</span></div>
            <div className="detail-row total"><span>💰 GRAND TOTAL</span><span>{finalTotal.toLocaleString()} VND</span></div>

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