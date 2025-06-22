import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import './PaymentDetail.scss';

const PaymentDetail = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { invoiceId } = useParams();
  const [ticketData, setTicketData] = useState("");
  const [movieDetails, setMovieDetails] = useState({
    posterImageUrl: "https://via.placeholder.com/300x450?text=No+Poster",
    movieName: "N/A"
  });
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 phút
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
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
        setPaymentUrl(ticket.paymentUrl || null);
        if (ticket.movieId) {
          await fetchMovieDetails(ticket.movieId, token);
        } else if (ticket.movieName) {
          await searchMovieByName(ticket.movieName, token);
        } else {
          setMovieDetails(prev => ({
            ...prev,
            movieName: ticket.movieName || "N/A"
          }));
        }
      } catch (err) {
        console.error("❌ Lỗi khi gọi API ticket:", err);
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

  const fetchMovieDetails = async (movieId, token) => {
    try {
      const movieRes = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true", Accept: "application/json" },
      });
      if (!movieRes.ok) return;
      const movie = await movieRes.json();
      setMovieDetails(prev => ({
        ...prev,
        posterImageUrl: movie.posterImageUrl || prev.posterImageUrl,
        movieName: movie.movieNameEnglish || movie.movieNameVn || prev.movieName
      }));
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin phim:", err);
    }
  };

  const searchMovieByName = async (name, token) => {
    try {
      const res = await fetch(`${apiUrl}/public/movies?q=${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true", Accept: "application/json" },
      });
      if (!res.ok) return;
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const movie = results[0];
        setMovieDetails(prev => ({
          ...prev,
          posterImageUrl: movie.posterImageUrl || prev.posterImageUrl,
          movieName: movie.movieNameEnglish || movie.movieNameVn || prev.movieName
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
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoiceId, paymentMethod })
      });
      if (!res.ok) {
        const msg = await res.text();
        console.warn("❌ Xác nhận thanh toán thất bại:", msg);
        alert("Lỗi khi xác nhận phương thức thanh toán");
        return;
      }
      const data = await res.json();
      setPaymentUrl(data.paymentUrl || null);
    } catch (err) {
      console.error("❌ Lỗi xác nhận thanh toán:", err);
    }
  };

  if (loading || !ticketData) return <div>Đang tải dữ liệu...</div>;

  const { movieName, cinemaRoomName = "", date, time, seat = [], price = 0, total = 0, fullName, phoneNumber, identityCard } = ticketData;
  const seatCount = seat.length;
  const formattedDate = new Date(date).toLocaleDateString('vi-VN');
  const formattedTime = new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const ticketTotal = price * seatCount;

  return (
    <div className="payment-detail-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      {/* Đồng hồ đếm ngược */}
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
          <div className="detail-row"><span>🏢 CINEROOM</span><span>{cinemaRoomName || "N/A"}</span></div>
          <div className="detail-row"><span>📅 DATE</span><span>{formattedDate}</span></div>
          <div className="detail-row"><span>🕒 TIME</span><span>{formattedTime}</span></div>
          <div className="detail-row"><span>💺 SEAT ({seatCount})</span><span>{seat.join(", ")}</span></div>
          <div className="detail-row"><span>👤 FULLNAME</span><span>{fullName}</span></div>
          <div className="detail-row"><span>ID CARD</span><span>{identityCard}</span></div>
          <div className="detail-row"><span>📞 PHONE</span><span>{phoneNumber}</span></div>

          <div className="detail-row transaction"><span>PAYMENT DETAIL</span></div>
          <div className="detail-row"><span>🎟 TICKET</span><span>{ticketTotal.toLocaleString()} VND</span></div>
          <div className="detail-row"><span>🔄 DISCOUNT</span><span>0 VND</span></div>
          <div className="detail-row total"><span>💰 TOTAL</span><span>{total.toLocaleString()} VND</span></div>

          <div className="detail-row">
            <span>💳 PAYMENT METHOD</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="VNPAY">VNPAY</option>
              <option value="MOMO">MOMO</option>
              <option value="MOMO_QR">MOMO QR</option>
            </select>
          </div>

          <button className="payment-button" onClick={handleConfirmPayment}>✅ CONFIRM PAYMENT</button>

          {paymentUrl && (
            <a href={paymentUrl} className="payment-button" target="_blank" rel="noopener noreferrer">💳 PROCEED TO PAY</a>
          )}

          <p className="note">* Please visit counter to receive tickets after successful payment.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
