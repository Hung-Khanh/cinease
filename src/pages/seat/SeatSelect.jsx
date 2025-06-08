// SeatSelection.jsx
import React, { useState } from 'react';
import './SeatSelect.scss';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const seatsPerRow = 10;

const soldSeats = ['D2', 'D3', 'D4', 'D5', 'D6'];

const isVipSeat = (seat) => {
  const row = seat[0];
  const seatNumber = parseInt(seat.slice(1));
  const vipRows = ['C', 'D', 'E', 'F', 'G'];
  return vipRows.includes(row) && seatNumber >= 2 && seatNumber <= 9;
};

const SeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();

  const toggleSeat = (seat) => {
    if (soldSeats.includes(seat)) return;

    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const getSeatClass = (seat) => {
    let baseClass = 'seat';
    
    // Thêm class vip nếu là ghế VIP
    if (isVipSeat(seat)) {
      baseClass += ' vip';
    }
    
    if (soldSeats.includes(seat)) return baseClass + ' sold';
    if (selectedSeats.includes(seat)) return baseClass + ' selected';
    return baseClass + ' available';
  };

  const totalPrice = selectedSeats.reduce((total, seat) => {
    const seatPrice = isVipSeat(seat) ? 100000 : 90000;
    return total + seatPrice;
  }, 0);

  const handleCheckout = () => {
    // Điều hướng sang trang /checkout, có thể truyền state nếu cần
    navigate('/confirm', { state: { selectedSeats, totalPrice } });
  };

  return (
    <div className="seat-selection-wrapper">
      <button className="back-button">
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
          {rows.map((row) =>
            Array.from({ length: seatsPerRow }, (_, i) => {
              const seat = `${row}${i + 1}`;
              return (
                <div
                  key={seat}
                  className={getSeatClass(seat)}
                  onClick={() => toggleSeat(seat)}
                >
                  {seat}
                </div>
              );
            })
          )}
        </div>

        <div className="legend bottom-center">
          <div className="legend-item">
            <div className="box available"></div>
            <span>Available Seat</span>
          </div>
          <div className="legend-item">
            <div className="box selected"></div>
            <span>Selected Seat</span>
          </div>
          <div className="legend-item">
            <div className="box sold"></div>
            <span>Unavailable Seat</span>
          </div>
          <div className="legend-item">
            <div className="box vip"></div>
            <span>VIP Seat</span>
          </div>
        </div>

        <div className="summary bottom-bar">
          <div className="summary-item">
            <p className="label">TOTAL</p>
            <p className="value">VND {totalPrice.toLocaleString()}</p>
          </div>
          <div className="summary-item">
            <p className="label">SELECTED SEAT</p>
            <p className="value">{selectedSeats.join(', ') || 'Not Selected'}</p>
          </div>
          <div className="summary-item">
            <p className="label">MOVIE</p>
            <p className="value">SPIDERMAN ACROSS<br/>THE SPIDERVERSE</p>
          </div>
          <button
            className="checkout-button"
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

// // SeatSelection.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import './SeatSelect.scss';
// import { FaArrowLeft } from 'react-icons/fa';

// const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// const seatsPerRow = 10;

// // Định nghĩa khu vực VIP (C2-C9, D2-D9, E2-E9, F2-F9, G2-G9)
// const isVipSeat = (seat) => {
//   const row = seat[0];
//   const seatNumber = parseInt(seat.slice(1));
//   const vipRows = ['C', 'D', 'E', 'F', 'G'];
//   return vipRows.includes(row) && seatNumber >= 2 && seatNumber <= 9;
// };

// const SeatSelection = () => {
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [soldSeats, setSoldSeats] = useState(['D2', 'D3', 'D4', 'D5', 'D6']);
//   const [movieInfo, setMovieInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const { scheduleId } = useParams(); // Lấy scheduleId từ URL params
//   const navigate = useNavigate();
  
//   const apiUrl = "https://3a21-183-91-25-219.ngrok-free.app/api";
//   const token = localStorage.getItem("token");

//   // Fetch thông tin ghế đã bán và thông tin phim
//   const fetchSeatInfo = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${apiUrl}/public/schedule/${scheduleId}/seats`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//           "ngrok-skip-browser-warning": "true",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status} ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       // Giả sử API trả về danh sách ghế đã bán và thông tin phim
//       setSoldSeats(data.soldSeats || []);
//       setMovieInfo(data.movieInfo || null);
      
//     } catch (error) {
//       console.error("Error fetching seat info:", error);
//       setError("Không thể tải thông tin ghế");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Gọi API để chọn ghế
//   const selectSeats = async () => {
//     if (selectedSeats.length === 0) {
//       alert("Vui lòng chọn ít nhất một ghế");
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Chuyển đổi selectedSeats thành scheduleSeatIds
//       // Giả sử bạn có mapping từ seat name sang seat ID
//       const scheduleSeatIds = selectedSeats.map(seat => {
//         // Đây là logic tạm thời, bạn cần thay thế bằng logic thực tế
//         // để chuyển đổi từ seat name (ví dụ: "C8") sang seat ID
//         return generateSeatId(seat);
//       });

//       const requestBody = {
//         scheduleId: parseInt(scheduleId),
//         scheduleSeatIds: scheduleSeatIds
//       };

//       const response = await fetch(`${apiUrl}/api/member/select-seats`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//           "ngrok-skip-browser-warning": "true",
//         },
//         body: JSON.stringify(requestBody)
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status} ${response.statusText}`);
//       }

//       const data = await response.json();
//       console.log("Seat selection successful:", data);
      
//       // Chuyển hướng đến trang thanh toán hoặc xử lý tiếp theo
//       navigate('/checkout', { 
//         state: { 
//           selectedSeats, 
//           totalPrice, 
//           movieInfo,
//           bookingData: data 
//         } 
//       });

//     } catch (error) {
//       console.error("Error selecting seats:", error);
//       setError("Không thể chọn ghế. Vui lòng thử lại.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm tạm thời để generate seat ID từ seat name
//   // Bạn cần thay thế bằng logic thực tế
//   const generateSeatId = (seatName) => {
//     // Ví dụ: chuyển "C8" thành một ID số
//     const row = seatName[0];
//     const number = parseInt(seatName.slice(1));
//     const rowIndex = rows.indexOf(row);
//     return (rowIndex * seatsPerRow + number) + 9007199254740000; // Tạm thời
//   };

//   useEffect(() => {
//     if (scheduleId) {
//       fetchSeatInfo();
//     }
//   }, [scheduleId]);

//   const toggleSeat = (seat) => {
//     if (soldSeats.includes(seat)) return;

//     setSelectedSeats((prev) =>
//       prev.includes(seat)
//         ? prev.filter((s) => s !== seat)
//         : [...prev, seat]
//     );
//   };

//   const getSeatClass = (seat) => {
//     let baseClass = 'seat';
    
//     if (isVipSeat(seat)) {
//       baseClass += ' vip';
//     }
    
//     if (soldSeats.includes(seat)) return baseClass + ' sold';
//     if (selectedSeats.includes(seat)) return baseClass + ' selected';
//     return baseClass + ' available';
//   };

//   const totalPrice = selectedSeats.reduce((total, seat) => {
//     const seatPrice = isVipSeat(seat) ? 100000 : 90000;
//     return total + seatPrice;
//   }, 0);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   if (loading) {
//     return (
//       <div className="seat-selection-wrapper">
//         <div className="loading">Đang tải...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="seat-selection-wrapper">
//         <div className="error">
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()}>Thử lại</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="seat-selection-wrapper">
//       <button className="back-button" onClick={handleBack}>
//         <FaArrowLeft />
//       </button>
          
//       <div className="seat-selection-container">
//         <div className="screen-section">
//           <div className="screen">
//             <span className="screen-text">Screen</span>
//           </div>
//           <div className="screen-arrow"></div>
//         </div>
        
//         <div className="main-section">
//           {rows.map((row) =>
//             Array.from({ length: seatsPerRow }, (_, i) => {
//               const seat = `${row}${i + 1}`;
//               return (
//                 <div
//                   key={seat}
//                   className={getSeatClass(seat)}
//                   onClick={() => toggleSeat(seat)}
//                 >
//                   {seat}
//                 </div>
//               );
//             })
//           )}
//         </div>

//         <div className="legend bottom-center">
//           <div className="legend-item">
//             <div className="box available"></div>
//             <span>Available Seat</span>
//           </div>
//           <div className="legend-item">
//             <div className="box selected"></div>
//             <span>Selected Seat</span>
//           </div>
//           <div className="legend-item">
//             <div className="box sold"></div>
//             <span>Unavailable Seat</span>
//           </div>
//           <div className="legend-item">
//             <div className="box vip"></div>
//             <span>VIP Seat</span>
//           </div>
//         </div>

//         <div className="summary bottom-bar">
//           <div className="summary-item">
//             <p className="label">TOTAL</p>
//             <p className="value">VND {totalPrice.toLocaleString()}</p>
//           </div>
//           <div className="summary-item">
//             <p className="label">SELECTED SEAT</p>
//             <p className="value">{selectedSeats.join(', ') || 'Not Selected'}</p>
//           </div>
//           <div className="summary-item">
//             <p className="label">MOVIE</p>
//             <p className="value">
//               {movieInfo ? movieInfo.movieNameEnglish : 'SPIDERMAN ACROSS THE SPIDERVERSE'}
//             </p>
//           </div>
//           <button 
//             className="checkout-button"
//             onClick={selectSeats}
//             disabled={loading || selectedSeats.length === 0}
//           >
//             {loading ? 'Processing...' : 'Checkout'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SeatSelection;