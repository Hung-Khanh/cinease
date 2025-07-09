import React, { useEffect, useState } from "react";
import "./Confirm.scss";
import Select from "react-select";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setSeatData } from "../../store/cartSlice";

const Confirm = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [promotions, setPromotions] = useState([]);
  const [voucher, setVoucher] = useState(null);
  const [useScore, setUseScore] = useState(0);
  const [ticketType, setTicketType] = useState("ADULT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const [bookingData, setBookingData] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null);

  const seatData = useSelector((state) => state.cart.seatData);
  const selectedProducts = useSelector((state) => state.cart.selectedProducts);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!seatData || !seatData.sessionId) {
      setError("Không tìm thấy dữ liệu đặt vé. Vui lòng chọn lại.");
      navigate("/");
      return;
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
    });

    fetchMovieDetails(seatData.movieId);
    fetchPromotions();
  }, [seatData, selectedProducts, navigate]);

  const fetchMovieDetails = async (movieId) => {
    try {
      const res = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to fetch movie details: ${errorData.message || res.status}`);
      }
      const movie = await res.json();
      setMovieDetails(movie);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi tải phim:", err);
      setError(`Lỗi tải thông tin phim: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/public/promotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to fetch promotions: ${errorData.message || res.status}`);
      }
      const data = await res.json();
      setPromotions(
        data.map((promo) => ({
          value: promo,
          label: `${promo.title} (${promo.discountLevel}% off)`,
        }))
      );
    } catch (err) {
      console.error('Error fetching promotions:', err);
    }
  };

  const handleConfirm = async () => {
    if (!token || !bookingData) {
      alert("Không tìm thấy dữ liệu đặt vé hoặc phiên đăng nhập. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    if (!bookingData.scheduleId) {
      alert("Thiếu scheduleId!");
      navigate("/");
      return;
    }

    const scheduleSeatIds = bookingData.seatNumbers
      .map((seatId) => {
        const seat = bookingData.seats.find(
          (s) => `${s.seatColumn}${s.seatRow}` === seatId
        );
        return seat?.scheduleSeatId;
      })
      .filter(Boolean);

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
      });

      if (!selectRes.ok) {
        const errorData = await selectRes.json();
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
          navigate("/");
          return;
        }
        if (errorData.errorCode === "SEAT_ALREADY_BOOKED") {
          alert("Một hoặc nhiều ghế đã được chọn bởi người khác. Vui lòng chọn lại.");
          navigate(-1);
          return;
        }
        throw new Error(`Failed to select seats: ${errorData.message || selectRes.status}`);
      }

      const selectData = await selectRes.json();

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
      });

      if (!confirmRes.ok) {
        const errorData = await confirmRes.json();
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
          navigate("/");
          return;
        }
        if (errorData.errorCode === "INSUFFICIENT_SCORE") {
          alert("Điểm thành viên không đủ để sử dụng.");
          return;
        }
        if (errorData.errorCode === "INVALID_PROMOTION") {
          alert("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
          return;
        }
        throw new Error(`Failed to confirm prices: ${errorData.message || confirmRes.status}`);
      }

      const confirmData = await confirmRes.json();
      setConfirmResult(confirmData);

      // Update Redux store with confirmation data
      dispatch(setSeatData({
        ...bookingData,
        sessionId: confirmData.sessionId,
        originalTicketTotal: confirmData.originalTicketTotal,
        finalTicketTotal: confirmData.finalTicketTotal,
        discountFromScore: confirmData.discountFromScore,
        discountFromPromotion: confirmData.discountFromPromotion,
        finalProductsTotal: confirmData.finalProductsTotal,
        grandTotal: confirmData.grandTotal,
        confirmationResult: confirmData,
      }));

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
      });
    } catch (err) {
      console.error("Lỗi xác nhận vé:", err);
      alert(`Lỗi xác nhận vé: ${err.message}. Vui lòng thử lại.`);
    }
  };

  if (loading || !bookingData) return <div className="confirm-wrapper">LOADING DATA...</div>;
  if (error) return <div className="confirm-wrapper">{error}</div>;

  const displayData = confirmResult || bookingData;

  return (
    <div className="confirm-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
      <main className="confirm-container">
        <div className="ticket-box">
          <div className="poster">
            <img
              src={movieDetails.posterImageUrl || "https://via.placeholder.com/300x450?text=No+Poster"}
              alt="poster"
            />
          </div>
          <div className="ticket-info">
            <h2>XÁC NHẬN ĐẶT VÉ</h2>
            <div><b>🎬 MOVIE:</b> {displayData.movieName}</div>
            <div><b>📅 DATE:</b> {displayData.showDate}</div>
            <div><b>⏰ TIME:</b> {displayData.showTime}</div>
            <div><b>💺 SEAT:</b> {displayData.seatNumbers.join(", ")}</div>
            <div><b>🏢 CINEROOM:</b> {displayData.cinemaRoomName}</div>
            <div><b>🎟️ TICKET TOTAL:</b> {displayData.originalTicketTotal?.toLocaleString()} VND</div>
            {displayData.discountFromScore > 0 && (
              <div><b>💳 SCORE DISCOUNT:</b> - {displayData.discountFromScore?.toLocaleString()} VND</div>
            )}
            {displayData.discountFromPromotion > 0 && (
              <div><b>🎁 PROMOTION DISCOUNT:</b> - {displayData.discountFromPromotion?.toLocaleString()} VND</div>
            )}
            <div><b>🧾 TOTAL FOOD & DRINK:</b> {displayData.finalProductsTotal?.toLocaleString() || displayData.productsTotal?.toLocaleString()} VND</div>
            <div><b>💰 GRAND TOTAL:</b> {displayData.grandTotal?.toLocaleString()} VND</div>

            <Select
              classNamePrefix="voucher"
              options={promotions}
              isClearable
              placeholder="Select voucher"
              value={voucher}
              onChange={setVoucher}
            />

            <div className="row-form">
              <label htmlFor="useScore">💳 USE SCORE:</label>
              <input
                id="useScore"
                type="number"
                value={useScore}
                onChange={(e) => setUseScore(Math.max(0, e.target.value))}
                min="0"
                className="score-input"
                placeholder="Input score to use"
              />
            </div>

            <div className="row-form">
              <label htmlFor="ticketType">🎫 TICKET TYPE:</label>
              <select
                id="ticketType"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="ticket-select"
              >
                <option value="ADULT">Adult</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <button className="confirm-button" onClick={handleConfirm}>✅ CONFIRM</button>
            <p className="note">*Confirmed tickets cannot be canceled.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirm;