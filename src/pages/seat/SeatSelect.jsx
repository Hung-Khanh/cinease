import React, { useEffect, useState } from "react";
import './SeatSelect.scss';
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { PiArmchair, PiArmchairFill, PiArmchairDuotone } from "react-icons/pi";
import { TbArmchair2Off } from "react-icons/tb";
import { useSelector, useDispatch } from "react-redux";
import { setSeatData, setSessionId, clearSeatData, clearSessionId } from "../../store/cartSlice";
import api from '../../constants/axios';

const SeatSelect = ({
  onBack
}) => {
  const [seats, setSeats] = useState([]);
  const { scheduleId: paramScheduleId, movieId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy token từ Redux (đã tối ưu slice auth)
  const token = useSelector((state) => state.auth.token);
  // Lấy thông tin booking tạm thời (nếu có)
  const bookingInfoFromRedux = useSelector((state) => state.tempBooking);
  // Lấy sessionId và seatData từ Redux cart
  const existingSessionId = useSelector((state) => state.cart.sessionId);
  const existingSeatData = useSelector((state) => state.cart.seatData);

  // Ưu tiên lấy bookingInfo từ Redux, nếu không có thì lấy từ localStorage
  let bookingInfo = bookingInfoFromRedux && bookingInfoFromRedux.movieName ? bookingInfoFromRedux : null;
  if (!bookingInfo && window.localStorage.getItem('bookingInfo')) {
    try {
      bookingInfo = JSON.parse(window.localStorage.getItem('bookingInfo'));
    } catch {
      bookingInfo = {};
    }
  }
  const scheduleId = bookingInfo?.scheduleId || paramScheduleId;

  // Tối ưu khởi tạo selectedSeats: ưu tiên Redux, sau đó localStorage, cuối cùng là []
  const getInitialSelectedSeats = () => {
    if (existingSeatData?.selectedSeats && existingSeatData.selectedSeats.length > 0) {
      return existingSeatData.selectedSeats;
    }
    const seatsFromStorage = window.localStorage.getItem('selectedSeats');
    if (seatsFromStorage) {
      try {
        return JSON.parse(seatsFromStorage);
      } catch {
        return [];
      }
    }
    return [];
  };

  const [selectedSeats, setSelectedSeats] = useState(getInitialSelectedSeats());

  useEffect(() => {
    window.localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  const fetchSeat = React.useCallback(async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }
    try {
      const { data } = await api.get(`/public/seats?scheduleId=${scheduleId}`);
      setSeats(data);

      // Filter selected seats to only include those that are AVAILABLE or HOLD by the current session
      setSelectedSeats((prev) => {
        const sessionSeatIds = existingSeatData?.selectedSeats || [];
        const validSeatIds = data
          .filter((s) => {
            const seatId = `${s.seatColumn}${s.seatRow}`;
            return s.seatStatus === "AVAILABLE" || (s.seatStatus === "HOLD" && sessionSeatIds.includes(seatId));
          })
          .map((s) => `${s.seatColumn}${s.seatRow}`);
        const filtered = prev.filter((seatId) => validSeatIds.includes(seatId));
        if (filtered.length !== prev.length) {
          window.localStorage.setItem('selectedSeats', JSON.stringify(filtered));
        }
        return filtered;
      });
    } catch (error) {
      console.error("🔥 Error in fetchSeat:", error);
      alert(`Lỗi khi tải danh sách ghế: ${error.message}. Vui lòng thử lại.`);
    }
  }, [token, navigate, scheduleId, existingSeatData]);

  useEffect(() => {
    const releasePreviousSeats = async () => {
      if (existingSessionId && token) {
        try {
          const { data } = await api.post(`/member/select-seats`, {
            sessionId: existingSessionId,
            scheduleId: parseInt(scheduleId),
            scheduleSeatIds: [],
            products: existingSeatData?.products || [],
          });
          dispatch(setSessionId(data.sessionId));
          dispatch(setSeatData({
            ...existingSeatData,
            sessionId: data.sessionId,
            selectedSeats: [],
            originalTicketTotal: data.totalPrice,
            originalProductsTotal: data.productsTotal,
            grandTotal: data.grandTotal,
          }));
          setSelectedSeats([]);
          window.localStorage.setItem('selectedSeats', JSON.stringify([]));
        } catch (error) {
          console.error("🔥 Error releasing previous seats:", error);
          if (error.message.includes("SESSION_EXPIRED")) {
            dispatch(clearSeatData());
            dispatch(clearSessionId());
            window.localStorage.removeItem('selectedSeats');
            navigate("/");
          }
        }
      }
    };

    releasePreviousSeats().then(fetchSeat);
  }, [scheduleId, token, navigate, existingSessionId, dispatch, existingSeatData, fetchSeat]);

  const findSeatBySeatId = (seatId) => {
    return seats.find(
      (seat) => `${seat.seatColumn}${seat.seatRow}` === seatId
    );
  };

  const toggleSeat = (seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat) return;

    // Only allow toggling AVAILABLE seats or HOLD seats owned by the current session
    const sessionSeatIds = existingSeatData?.selectedSeats || [];
    if (
      seat.seatStatus !== "AVAILABLE" &&
      !(seat.seatStatus === "HOLD" && sessionSeatIds.includes(seatId))
    ) {
      return;
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= 8) {
        alert("Bạn chỉ có thể chọn tối đa 8 ghế.");
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleCheckout = async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    try {
      const scheduleSeatIds = selectedSeats.map((seatId) => {
        const seat = findSeatBySeatId(seatId);
        return seat.scheduleSeatId;
      });
      try {
        const { data } = await api.post(`/member/select-seats`, {
          sessionId: existingSessionId || undefined,
          scheduleId: parseInt(scheduleId),
          scheduleSeatIds,
          products: existingSeatData?.products || [],
        });
        dispatch(setSessionId(data.sessionId));
        dispatch(setSeatData({
          sessionId: data.sessionId,
          scheduleId: parseInt(scheduleId),
          selectedSeats,
          seats,
          movieId,
          movieName: data.movieName,
          showDate: data.scheduleShowDate,
          showTime: data.scheduleShowTime,
          cinemaRoomName: data.cinemaRoomName,
          originalTicketTotal: data.totalPrice,
          originalProductsTotal: data.productsTotal,
          grandTotal: data.grandTotal,
          products: existingSeatData?.products || [],
        }));
        navigate(`/product/${movieId}/${scheduleId}`, {
          state: {
            sessionId: data.sessionId,
            scheduleId: parseInt(scheduleId),
            selectedSeats,
            seats,
            movieId,
            movieName: data.movieName,
            showDate: data.scheduleShowDate,
            showTime: data.scheduleShowTime,
            cinemaRoomName: data.cinemaRoomName,
            products: existingSeatData?.products || [],
          },
        });
      } catch (error) {
        const errorData = error.response?.data || {};
        if (errorData.errorCode === "SEAT_ALREADY_BOOKED") {
          alert("Một hoặc nhiều ghế đã được chọn bởi người khác. Vui lòng chọn lại.");
          fetchSeat();
          return;
        }
        if (errorData.errorCode === "SEAT_LIMIT_EXCEEDED") {
          alert("Bạn không thể chọn quá 8 ghế.");
          return;
        }
        if (errorData.errorCode === "SEAT_GAP_VIOLATION") {
          alert("Lựa chọn ghế không hợp lệ: không được để lại khoảng trống một ghế.");
          return;
        }
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
          dispatch(clearSeatData());
          dispatch(clearSessionId());
          window.localStorage.removeItem('selectedSeats');
          navigate("/");
          return;
        }
        alert(`Lỗi khi chọn ghế: ${error.message}. Vui lòng thử lại.`);
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      if (errorData.errorCode === "SEAT_ALREADY_BOOKED") {
        alert("Một hoặc nhiều ghế đã được chọn bởi người khác. Vui lòng chọn lại.");
        fetchSeat();
        return;
      }
      if (errorData.errorCode === "SEAT_LIMIT_EXCEEDED") {
        alert("Bạn không thể chọn quá 8 ghế.");
        return;
      }
      if (errorData.errorCode === "SEAT_GAP_VIOLATION") {
        alert("Lựa chọn ghế không hợp lệ: không được để lại khoảng trống một ghế.");
        return;
      }
      if (errorData.errorCode === "SESSION_EXPIRED") {
        alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
        dispatch(clearSeatData());
        dispatch(clearSessionId());
        window.localStorage.removeItem('selectedSeats');
        navigate("/");
        return;
      }
      alert(`Lỗi khi chọn ghế: ${error.message}. Vui lòng thử lại.`);
    }
  };


  const renderSeats = () => {
    const seatColumns = [...new Set(seats.map((s) => s.seatColumn))].sort();
    const maxRow = seats.length === 0 ? 0 : Math.max(...seats.map((s) => s.seatRow));
    const seatRows = Array.from({ length: maxRow }, (_, i) => i + 1);
    const sessionSeatIds = existingSeatData?.selectedSeats || [];

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
              // Treat HOLD seats not in the current session as unavailable
              const isUnavailable =
                seat.seatStatus === "BOOKED" ||
                (seat.seatStatus === "HOLD" && !sessionSeatIds.includes(seatId));
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
                      size={36}
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
            <p className="value">{bookingInfo.movieName || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">DATE</p>
            <p className="value">{bookingInfo.showDate || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">TIME</p>
            <p className="value">{bookingInfo.showTime || "N/A"}</p>
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