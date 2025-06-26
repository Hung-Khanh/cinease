import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserPaymentFailed.scss"; // Tạo file CSS nếu cần

const UserPaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { errorCode, errorMessage } = location.state || {};

  return (
    <div className="user-payment-failed-page">
      <div className="failed-info">
        <div className="failed-header">Payment Failed</div>
        <div className="info-group">
          <div className="info-label">Error Code</div>
          <div className="info-value">{errorCode || "N/A"}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Error Message</div>
          <div className="info-value">{errorMessage || "An unknown error occurred."}</div>
        </div>
        <div className="thank-you">Please try again!</div>
        <button className="home-btn" onClick={() => navigate("/")}>
          Back to Home page
        </button>
      </div>
    </div>
  );
};

export default UserPaymentFailed;