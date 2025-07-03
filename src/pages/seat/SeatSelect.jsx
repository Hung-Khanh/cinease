import React, { useEffect, useState } from "react";
import './SeatSelect.scss';
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PiArmchair, PiArmchairFill, PiArmchairDuotone } from "react-icons/pi";
import { TbArmchair2Off } from "react-icons/tb";
import { useSelector, useDispatch } from "react-redux";
import * as seatActions from "../../store/authSlice";
const SeatSelect = ({
  apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api",
  onBack
}) => {
  const [seats, setSeats] = useState([]);
  const [grandTotal, setGrandTotal] = useState("");
  const { scheduleId, movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  const reduxSelectedSeats = useSelector((state) => state.seat.selectedSeats);

  const {
    movieName = "",
    showDate = "",
    showTime = "",
    selectedSeats: initialSelectedSeats = []
  } = location.state || {};


  const [selectedSeats, setSelectedSeats] = useState(
    reduxSelectedSeats.length > 0 ? reduxSelectedSeats : initialSelectedSeats
  );


  useEffect(() => {
    dispatch(seatActions.setSelectedSeats(selectedSeats));
  }, [selectedSeats, dispatch]);

  const fetchSeat = async () => {
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
      (seat) => `${seat.seatColumn}${seat.seatRow}` === seatId
    );
  };

  const toggleSeat = (seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat || seat.seatStatus === "BOOKED") return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleCheckout = async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    const selectedSeatsInfo = selectedSeats.map((seatId) => {
      const seat = findSeatBySeatId(seatId);
      return {
        seatId,
        scheduleSeatId: seat?.scheduleSeatId,
        seatType: seat?.seatType,
      };
    });

    const scheduleSeatIds = selectedSeatsInfo.map(
      (seat) => seat.scheduleSeatId
    );

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
        if (response.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to select seats: ${response.status}`);
      }

      const data = await response.json();
      setGrandTotal(data.grandTotal);

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
        },
      });
    } catch (error) {
      console.error("Error in handleCheckout:", error);
      alert("Lỗi khi đặt ghế. Vui lòng thử lại.");
    }
  };

  const renderSeats = () => {
    const seatColumns = [...new Set(seats.map((s) => s.seatColumn))].sort();
    const maxRow = seats.length === 0 ? 0 : Math.max(...seats.map((s) => s.seatRow));
    const seatRows = Array.from({ length: maxRow }, (_, i) => i + 1);

    return (
      <div className="cs-seat-matrix">
        <div className="cs-column-headers">
          <div className="cs-empty-slot"></div>
          {seatRows.map((rowNum) => (
            <div key={rowNum} className="cs-column-marker">
              {rowNum}
            </div>
          ))}
        </div>
        {seatColumns.map((col) => (
          <div key={col} className="cs-row-container">
            <div className="cs-row-indicator">{col}</div>
            {seatRows.map((row) => {
              const seatId = `${col}${row}`;
              const seat = seats.find(
                (s) => `${s.seatColumn}${s.seatRow}` === seatId
              );

              if (!seat) {
                return <div key={seatId} className="cs-seat-empty"></div>;
              }

              const isSelected = selectedSeats.includes(seatId);
              const isUnavailable = seat.seatStatus !== "AVAILABLE";
              const isVip = seat.seatType === "VIP";

              return (
                <button
                  key={seatId}
                  onClick={() => toggleSeat(seatId)}
                  className={`cs-seat-button ${isVip ? "cs-vip" : ""}`}
                  disabled={isUnavailable}
                >
                  {isUnavailable ? (
                    <TbArmchair2Off
                      className="cs-seat-icon cs-unavailable"
                      size={36}
                    />
                  ) : isSelected ? (
                    <PiArmchairFill
                      className="cs-seat-icon cs-selected"
                      size={36}
                    />
                  ) : isVip ? (
                    <PiArmchairDuotone
                      className="cs-seat-icon cs-vip"
                      size={36}
                    />
                  ) : (
                    <PiArmchair
                      className="cs-seat-icon cs-regular"
                      size={24}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
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
          {seats.length > 0 ? renderSeats() : <div>Loading...</div>}
        </div>

        <div className="legend bottom-center">
          <div className="legend-item">
            <div className="box available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="box selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="box sold"></div>
            <span>Unavailable</span>
          </div>
          <div className="legend-item">
            <div className="box vip"></div>
            <span>VIP</span>
          </div>
        </div>

        <div className="summary bottom-bar">
          <div className="summary-item">
            <p className="label">SEAT</p>
            <p className="value">{selectedSeats.join(", ") || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">MOVIE</p>
            <p className="value">{movieName || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">DATE</p>
            <p className="value">{showDate || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">TIME</p>
            <p className="value">{showTime || "N/A"}</p>
          </div>

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