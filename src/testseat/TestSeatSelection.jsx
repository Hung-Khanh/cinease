import { PiArmchair, PiArmchairFill, PiArmchairDuotone } from "react-icons/pi";
import { TbArmchair2Off } from "react-icons/tb";
import { useState } from "react";
import "./TestSeat.scss";

const CinemaSeating = () => {
  const seatColumns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatRows = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Sample unavailable seats (can be modified as needed)
  const unavailableSeats = ["A3", "B4", "C5"];
  // Sample VIP seats (can be modified as needed)
  const vipSeats = ["A1", "A2", "B1", "B2"];

  const handleSeatClick = (seat) => {
    if (unavailableSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  return (
    <div className="cs-theater-layout">
      {/* Screen */}
      <div className="cs-screen-wrapper">
        <div className="cs-screen-display">Screen</div>
      </div>

      {/* Seat Grid */}
      <div className="cs-seat-matrix">
        {/* Column Numbers */}
        <div className="cs-column-headers">
          <div className="cs-empty-slot" />
          {seatRows.map((row) => (
            <div key={row} className="cs-column-marker">
              {row}
            </div>
          ))}
        </div>

        {/* Rows with Seats */}
        {seatColumns.map((col) => (
          <div key={col} className="cs-row-container">
            {/* Row Label */}
            <div className="cs-row-indicator">{col}</div>

            {/* Seats */}
            {seatRows.map((row) => {
              const seat = `${col}${row}`;
              const isSelected = selectedSeats.includes(seat);
              const isUnavailable = unavailableSeats.includes(seat);
              const isVip = vipSeats.includes(seat);

              return (
                <button
                  key={seat}
                  onClick={() => handleSeatClick(seat)}
                  className="cs-seat-button"
                  disabled={isUnavailable}
                >
                  {isUnavailable ? (
                    <TbArmchair2Off
                      className="cs-seat-icon cs-unavailable"
                      size={40}
                    />
                  ) : isSelected ? (
                    <PiArmchairFill
                      className="cs-seat-icon cs-selected"
                      size={40}
                    />
                  ) : isVip ? (
                    <PiArmchairDuotone
                      className="cs-seat-icon cs-vip"
                      size={40}
                    />
                  ) : (
                    <PiArmchair className="cs-seat-icon cs-regular" size={24} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Seat Type Notes */}
      <div className="cs-seat-notes">
        <div className="cs-note-item">
          <PiArmchair className="cs-seat-icon cs-regular" size={24} />
          <span>Regular Seat</span>
        </div>
        <div className="cs-note-item">
          <PiArmchairFill className="cs-seat-icon cs-selected" size={24} />
          <span>Selected Seat</span>
        </div>
        <div className="cs-note-item">
          <PiArmchairDuotone className="cs-seat-icon cs-vip" size={24} />
          <span>VIP Seat</span>
        </div>
        <div className="cs-note-item">
          <TbArmchair2Off className="cs-seat-icon cs-unavailable" size={24} />
          <span>Unavailable Seat</span>
        </div>
      </div>
    </div>
  );
};

export default CinemaSeating;
