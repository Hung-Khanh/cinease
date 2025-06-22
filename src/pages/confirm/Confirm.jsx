import React, { useEffect, useState } from 'react';
import './Confirm.scss';
import Select from 'react-select';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const voucherOptions = [
  { value: 1, label: 'BAPNGON' },
  { value: 2, label: 'CINEASE' },
  { value: 3, label: 'CINEASEVIP' },
];

const Confirm = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId: paramMovieId } = useParams();

  const [voucher, setVoucher] = useState(null);
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

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token || !bookingData) return;

    const body = {
      invoiceId: Number(bookingData.invoiceId),
      scheduleId: Number(bookingData.scheduleId),
      useScore: Number(useScore),
      promotionId: voucher?.value || "",
      ticketType,
      products: bookingData.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        notes: ""
      })),
      skipProducts: bookingData.products.length === 0
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
          confirmationResult: result
        }
      });
    } catch (err) {
      alert("Lỗi xác nhận vé");
    }
  };

  if (loading || !bookingData) return <div className="confirm-wrapper">Đang tải dữ liệu...</div>;
  if (error) return <div className="confirm-wrapper">{error}</div>;

  const seatCount = bookingData.seatNumbers.length;
  const ticketPriceTotal = bookingData.grandTotal - bookingData.productsTotal;
  const pricePerSeat = seatCount > 0 ? ticketPriceTotal / seatCount : 0;

  return (
    <div className="confirm-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <main className="confirm-container">
        <div className="ticket-box">
          <div className="poster">
            <img src={movieDetails.posterImageUrl || "https://via.placeholder.com/300x450?text=No+Poster"} alt="poster" />
          </div>
          <div className="ticket-info">
            <h2>XÁC NHẬN ĐẶT VÉ</h2>
            <div><b>🎬 Phim:</b> {bookingData.movieName}</div>
            <div><b>📅 Ngày:</b> {bookingData.showDate}</div>
            <div><b>⏰ Giờ:</b> {bookingData.showTime}</div>
            <div><b>💺 Ghế:</b> {bookingData.seatNumbers.join(", ")}</div>
            <div><b>🏢 Phòng:</b> {bookingData.cinemaRoomName}</div>

            <div><b>🧾 Tổng bắp nước:</b> {bookingData.productsTotal.toLocaleString()} VND</div>
            <div><b>🎟 Giá vé:</b> {`${seatCount} ghế × ${pricePerSeat.toLocaleString()} = ${ticketPriceTotal.toLocaleString()} VND`}</div>
            <div><b>💰 Tổng cộng:</b> {bookingData.grandTotal.toLocaleString()} VND</div>

            <Select
              options={voucherOptions}
              isClearable
              placeholder="Chọn mã giảm giá"
              value={voucher}
              onChange={setVoucher}
            />

              <div className="row-form">
              <label htmlFor="useScore">💳 Dùng điểm:</label>
              <input
                id="useScore"
                type="number"
                value={useScore}
                onChange={(e) => setUseScore(e.target.value)}
                min="0"
                className="score-input"
                placeholder="Nhập số điểm"
              />
            </div>

            <div className="row-form">
              <label htmlFor="ticketType">🎫 Loại vé:</label>
              <select
                id="ticketType"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="ticket-select"
              >
                <option value="ADULT">Adult</option>
              </select>
            </div>


            <button className="confirm-button" onClick={handleConfirm}>
              ✅ XÁC NHẬN ĐẶT VÉ
            </button>
            <p className="note">* Vé đã xác nhận không thể huỷ.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirm;
