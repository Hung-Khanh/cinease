import React, { useEffect, useState } from "react";
import "./Confirm.scss";
import Select from "react-select";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const Confirm = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId: paramMovieId } = useParams();

  const [promotions, setPromotions] = useState([]);   // danh sách promotions đầy đủ
  const [voucher, setVoucher] = useState(null);       // promotion được chọn
  const [useScore, setUseScore] = useState(0);
  const [ticketType, setTicketType] = useState("ADULT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const data = location.state;

    if (!data) {
      setError("Không có dữ liệu xác nhận.");
      return;
    }

    const products = data.selectedProducts || [];
    const productsTotal = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

    setBookingData({
      invoiceId: data.invoiceId,
      movieName: data.movieName,
      showDate: data.showDate,
      showTime: data.showTime,
      seatNumbers: data.selectedSeats || [],
      grandTotal: data.grandTotal + productsTotal,
      cinemaRoomName: data.cinemaRoomName,
      products,
      productsTotal,
      scheduleId: data.scheduleId,
      movieId: data.movieId
    });

    fetchMovieDetails(data.movieId);
    fetchPromotions();
  }, []);

  const fetchMovieDetails = async (movieId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });
      const movie = await res.json();
      setMovieDetails(movie);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi tải phim:", err);
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/public/promotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPromotions(
          data.map((promo) => ({
            value: promo, // gắn nguyên object
            label: `${promo.title} (${promo.discountLevel}% off)`,
          }))
        );
      } else {
        console.error('Error fetching promotions.');
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    }
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token || !bookingData) return;

    const body = {
      invoiceId: Number(bookingData.invoiceId),
      scheduleId: Number(bookingData.scheduleId),
      useScore: Number(useScore),
      promotionId: voucher?.value?.promotionId || "", // lấy promotionId
      ticketType,
      products: bookingData.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        notes: "",
      })),
      skipProducts: bookingData.products.length === 0,
    };

    try {
      const res = await fetch(`${apiUrl}/member/confirm-prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        alert("Xác nhận thất bại");
        return;
      }

      const result = await res.json();
      navigate(`/payment-detail/${bookingData.invoiceId}`, {
        state: {
          ...bookingData,
          promotion: voucher?.value || null, // truyền object promotion
          grandTotal: bookingData.grandTotal, // truyền tổng tiền
          confirmationResult: result,
        },
      });
    } catch (err) {
      alert("Lỗi xác nhận vé");
    }
  };

  if (loading || !bookingData) return <div className="confirm-wrapper">LOADING DATA...</div>;
  if (error) return <div className="confirm-wrapper">{error}</div>;

  const seatCount = bookingData.seatNumbers.length;
  const ticketPriceTotal = bookingData.grandTotal - bookingData.productsTotal;
  const pricePerSeat = seatCount > 0 ? ticketPriceTotal / seatCount : 0;

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
            <div><b>🎬 MOVIE: </b>  {bookingData.movieName}</div>
            <div><b>📅 DATE:</b> {bookingData.showDate}</div>
            <div><b>⏰ TIME:</b> {bookingData.showTime}</div>
            <div><b>💺 SEAT:</b> {bookingData.seatNumbers.join(", ")}</div>
            <div><b>🏢 CINEROOM:</b> {bookingData.cinemaRoomName}</div>

            <div><b>🧾 TOTAL FOOD & DRINK :</b> {bookingData.productsTotal.toLocaleString()} VND</div>
            <div><b>🎟 TICKET PRICE:</b> {`${seatCount} SEAT × ${pricePerSeat.toLocaleString()} = ${ticketPriceTotal.toLocaleString()} VND`}</div>
            <div><b>💰 GRAND TOTAL:</b> {bookingData.grandTotal.toLocaleString()} VND</div>

            {/* Select promotions */}
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
                onChange={(e) => setUseScore(e.target.value)}
                min="0"
                className="score-input"
                placeholder="Input score to use"
              />
            </div>

            <div className="row-form">
              <label htmlFor="ticketType">🎫TICKET TYPE:</label>
              <select
                id="ticketType"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="ticket-select"
              >
                <option value="ADULT">Adult</option>
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
