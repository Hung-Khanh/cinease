import React, { useEffect, useState } from "react";
import "./PaymentDetail.scss";
import { FaArrowLeft } from 'react-icons/fa';

const PaymentDetail = () => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer); 
  }, []);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="payment-wrapper">
      <button className="back-button">
                  <FaArrowLeft />
                </button>
      <div className="left-column">
        
        <div className="time">{formatTime(timeLeft)}</div>
        <div className="poster">
          <img
            src="src/assets/z6663759604899_57baa9df4721a2c6cdcad271180353b3.jpg"
            alt="Movie Poster"
          />
        </div>
        <div className="movie-name">SPIDERMAN ACROSS THE SPIDERVERSE</div>
      </div>

      <div className="right-column">
        <h2>PAYMENT DETAIL</h2>
        <div className="section">
          <h3>Schedule</h3>
          <p><strong>Movie Title</strong><br />SPIDERMAN ACROSS THE SPIDERVERSE</p>
          <p><strong>Cinema</strong><br />VINCOM MEGAMALL GRANDPARK<br />ROOM: 8</p>
          <p><strong>Date</strong><br />Mon, 26/5/2025</p>
          <p><strong>Ticket (3)</strong><br />C8, C9, C10</p>
          <p><strong>Hours</strong><br />15:40</p>
        </div>

        <div className="section">
          <h3>Transaction Detail</h3>
          <p>REGULAR SEAT &emsp;&emsp;&emsp;&emsp;&emsp; VND 90.000 ×3</p>
          <p>Service Charge (6%) &emsp;&emsp; VND 5.400 ×3</p>
          <p>Discount &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp; VND 0.0</p>
        </div>

        <div className="total">
          <p>Total payment</p>
          <h2>VND 286.200</h2>
        </div>

        <p className="note">* Please confirm your ticket before payment. Tickets cannot be canceled after successful payment</p>
        <button className="pay-button">PAYMENT</button>
      </div>
    </div>
  );
};

export default PaymentDetail;
