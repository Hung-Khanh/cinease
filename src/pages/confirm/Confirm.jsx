import React, { useEffect, useState } from 'react';
import './Confirm.scss';
import Select from 'react-select';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Movie from '../movie/Movie';

const options = [
  { value: 'BAPNGON', label: 'BAPNGON' },
  { value: 'CINEASE', label: 'CINEASE' },
  { value: 'CINEASEVIP', label: 'CINEASEVIP' },
];

const Confirm = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId: paramInvoiceId } = useParams();
  const {
    invoiceId = paramInvoiceId,
    selectedSeats = [],
    movieName = "",
    cinemaRoomId: initialCinemaRoomId = "",
    movieId = "",
    showDate = "",
    showTime = "",
    totalPrice = 0,
    scheduleId
  } = location.state || {};

  const [voucher, setVoucher] = useState(null);
  const [largeImage, setLargeImage] = useState("");
  const [cinemaRoomId, setCinemaRoomId] = useState(initialCinemaRoomId);

  useEffect(() => {
    console.log("cinemaRoomId:", cinemaRoomId);
  }, [cinemaRoomId]);

  const fetchMoviePoster = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập.");
      navigate("/login");
      return;
    }

    let foundPoster = "";
    try {
      let response = await fetch(`${apiUrl}/public/movies?q=${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });

      if (response.redirected) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          let movie = data.find(m => (m.movieId === parseInt(movieId) || m.movieId === movieId));
          foundPoster = movie?.largeImage || "";
        }
      }

      if (!foundPoster && movieName) {
        response = await fetch(`${apiUrl}/public/movies?q=${encodeURIComponent(movieName)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            let movie = data.find(m => m.movieName?.toLowerCase() === movieName.toLowerCase());
            foundPoster = movie?.largeImage || data[0]?.largeImage || "";
          }
        }
      }

      setLargeImage(foundPoster);
    } catch (err) {
      console.error("🔥 Error fetching movie poster:", err);
    }
  };

  // Fetch cinemaRoomId if missing
  useEffect(() => {
    if (!cinemaRoomId && scheduleId) {
      const fetchRoom = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${apiUrl}/public/schedules/${scheduleId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              Accept: "application/json",
            },
          });
          if (res.ok) {
            const data = await res.json();
            setCinemaRoomId(data.cinemaRoomId || "");
          }
        } catch (e) {
          // Không alert, chỉ log
          console.error("Không lấy được cinemaRoomId:", e);
        }
      };
      fetchRoom();
    }
  }, [cinemaRoomId, scheduleId, apiUrl]);

  useEffect(() => {
    setLargeImage("");
    fetchMoviePoster();
    // eslint-disable-next-line
  }, [movieId, movieName]);

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập.");
      navigate("/login");
      return;
    }

    if (!scheduleId || isNaN(Number(scheduleId))) {
      alert("Mã lịch chiếu (scheduleId) không hợp lệ!");
      return;
    }

    const bodyData = {
      scheduleId: parseInt(scheduleId),
      useScore: 0,
      promotionId: 0,
    };

    try {
      const response = await fetch(`${apiUrl}/member/confirm-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Confirm failed:", text);
        alert(`Xác nhận không thành công.\n${text}`);
        return;
      }

      const data = await response.json();

      const newInvoiceId = data.invoiceId || data.id || data.bookingId;
      if (!newInvoiceId) {
        alert("Không lấy được mã hóa đơn mới từ server!");
        return;
      }
      navigate(`/payment-detail/${newInvoiceId}/${scheduleId}`);
    } catch (err) {
      console.error("🔥 Error confirming:", err);
      alert("Có lỗi xảy ra.");
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="confirm-wrapper">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>
      <main className="confirm-container">
        <div className="ticket-box">
          <div className="poster">
            {largeImage ? (
              <img src={largeImage} alt={`Poster for movie`} />
            ) : (
              <div className="no-poster">No Poster</div>
            )}
          </div>
          <div className="ticket-info">
            <h2>CONFIRM INFORMATION</h2>
            <div className="row">
              <span className="icon">🎬</span>
              <span className="label">Movie:</span>
              <span className="value">{movieName}</span>
            </div>
            <div className="row">
              <span className="icon">📅</span>
              <span className="label">Date:</span>
              <span className="value">{showDate}</span>
            </div>
            <div className="row">
              <span className="icon">⏰</span>
              <span className="label">Time:</span>
              <span className="value">{showTime}</span>
            </div>
            <div className="row">
              <span className="icon">💺</span>
              <span className="label">Seat:</span>
              <span className="value">{selectedSeats.join(', ')}</span>
            </div>
            <div className="row">
              <span className="icon">💺</span>
              <span className="label">CineRoom:</span>
              <span className="value">{cinemaRoomId}</span>
            </div>
            <div className="row total">
              <span className="icon">💵</span>
              <span className="label">Total:</span>
              <span className="value">VND {totalPrice.toLocaleString()}</span>
            </div>
            <div className="voucher-container">
              <Select
                className="voucher-select"
                classNamePrefix="voucher"
                options={options}
                isClearable
                placeholder="Select a voucher"
                onChange={setVoucher}
              />
            </div>
            <button className="confirm-button" onClick={handleConfirm}>
              CONFIRM
            </button>
            <p className="note">* Vé đã xác nhận không thể hủy.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirm;


