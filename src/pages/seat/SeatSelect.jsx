import React, { useEffect, useState } from "react";
import './SeatSelect.scss';
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const SeatSelect = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api", onBack }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [grandTotal, setGrandTotal] = useState("");
  const { scheduleId, movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { movieName = "", showDate = "", showTime = "" } = location.state || {};

  const fetchSeat = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    try {
      const url = `${apiUrl}/public/seats?scheduleId=${scheduleId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to fetch seats: ${response.status}`);
      }

      const data = await response.json();
      setSeats(data);
    } catch (error) {
      console.error("🔥 Error in fetchSeat:", error);
      alert("Lỗi khi tải danh sách ghế. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchSeat();
  }, [scheduleId]);

  const findSeatBySeatId = (seatId) => {
    return seats.find(
      (seat) => createSeatId(seat.seatColumn, seat.seatRow) === seatId
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = findSeatBySeatId(seatId);
      const price = seat && seat.seatPrice ? Number(seat.seatPrice) : 0;
      return total + price;
    }, 0);
  };

  const createSeatId = (seatColumn, seatRow) => `${seatColumn}${seatRow}`;

  const getUniqueRows = () => [...new Set(seats.map(seat => seat.seatColumn))].sort();

  const getMaxSeatsPerRow = () => seats.length === 0 ? 0 : Math.max(...seats.map(seat => seat.seatRow));

  const toggleSeat = (seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat || seat.seatStatus === "BOOKED") return;

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const getSeatClass = (seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat) return "seat unavailable";

    let baseClass = "seat";
    if (seat.seatType === "VIP") baseClass += " vip";
    if (seat.seatStatus !== "AVAILABLE") return baseClass + " sold";
    if (selectedSeats.includes(seatId)) return baseClass + " selected";
    return baseClass + " available";
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    const selectedSeatsInfo = selectedSeats.map(seatId => {
      const seat = findSeatBySeatId(seatId);
      return {
        seatId,
        scheduleSeatId: seat?.scheduleSeatId,
        seatType: seat?.seatType,
      };
    });

    const scheduleSeatIds = selectedSeatsInfo.map(seat => seat.scheduleSeatId);

    try {
      const response = await fetch(`${apiUrl}/member/select-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          scheduleId: parseInt(scheduleId),
          scheduleSeatIds,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to select seats: ${response.status}`);
      }

      const data = await response.json();
      setGrandTotal(data.grandTotal);

      // ✅ Truyền đầy đủ dữ liệu sang SnackSelect (bắp nước)
      navigate(`/product/${movieId}/${data.invoiceId}`, {
        state: {
          scheduleId: parseInt(scheduleId),
          invoiceId: data.invoiceId,
          selectedSeats,
          grandTotal: data.grandTotal,
          movieId,
          movieName,
          showDate,
          showTime,
          cinemaRoomName: data.cinemaRoomName,
        }
      });
    } catch (error) {
      console.error("Error in handleCheckout:", error);
      alert("Lỗi khi đặt ghế. Vui lòng thử lại.");
    }
  };

  const renderSeats = () => {
    const rows = getUniqueRows();
    const maxSeatsPerRow = getMaxSeatsPerRow();

    return rows.map((row) => (
      <div key={row} className="seat-row">
        {Array.from({ length: maxSeatsPerRow }, (_, i) => {
          const seatNumber = i + 1;
          const seatId = createSeatId(row, seatNumber);
          const seat = findSeatBySeatId(seatId);
          if (!seat) return <div key={seatId} className="seat empty"></div>;
          return (
            <div
              key={seatId}
              className={getSeatClass(seatId)}
              onClick={() => toggleSeat(seatId)}
            >
              {seatId}
            </div>
          );
        })}
      </div>
    ));
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="seat-selection-wrapper">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="seat-selection-container">
        <div className="screen-section">
          <div className="screen">
            <span className="screen-text">Screen</span>
          </div>
          <div className="screen-arrow"></div>
        </div>

        <div className="main-section">
          {seats.length > 0 ? renderSeats() : <div>Đang tải ghế...</div>}
        </div>

        <div className="legend bottom-center">
          <div className="legend-item"><div className="box available"></div><span>Available</span></div>
          <div className="legend-item"><div className="box selected"></div><span>Selected</span></div>
          <div className="legend-item"><div className="box sold"></div><span>Unavailable</span></div>
          <div className="legend-item"><div className="box vip"></div><span>VIP</span></div>
        </div>

        <div className="summary bottom-bar">
          <div className="summary-item"><p className="label">SEAT</p><p className="value">{selectedSeats.join(", ") || "Chưa chọn"}</p></div>
          <div className="summary-item"><p className="label">MOVIE</p><p className="value">{movieName || "N/A"}</p></div>
          <div className="summary-item"><p className="label">DATE</p><p className="value">{showDate || "N/A"}</p></div>
          <div className="summary-item"><p className="label">TIME</p><p className="value">{showTime || "N/A"}</p></div>

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelect;
