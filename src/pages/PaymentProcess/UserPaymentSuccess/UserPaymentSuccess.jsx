import React, { useState, useEffect } from "react";
import "./UserPaymentSuccess.scss";
import { useNavigate, useLocation } from "react-router-dom";

const UserPaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [serviceImage, setServiceImage] = useState("");
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const getQueryParam = (param) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(param);
  };

  const invoiceId = getQueryParam("invoiceId");
  const status = getQueryParam("status");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const weekday = date.toLocaleString("default", { weekday: "short" });
    return { day, month, weekday };
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchBookingInformation = async () => {
      // Kiểm tra điều kiện cần thiết
      if (!invoiceId || status !== "success") {
        console.error(
          "Invalid payment information or payment was not successful"
        );
        return;
      }

      if (!token) {
        alert("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      try {
        // Fetch booking details using member API
        const response = await fetch(
          `${apiUrl}/member/booking-summary?invoiceId=${invoiceId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            alert("Unauthorized. Please login again.");
            navigate("/login");
            return;
          }
          throw new Error(
            `Failed to fetch booking details: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Booking data received:", data);
        setBookingData(data);

        // Try to fetch service image if service name is available
        if (data.serviceName || data.service) {
          try {
            const serviceResponse = await fetch(
              `${apiUrl}/public/services?q=${encodeURIComponent(
                data.serviceName || data.service
              )}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                  "ngrok-skip-browser-warning": "true",
                },
              }
            );

            if (serviceResponse.ok) {
              const serviceData = await serviceResponse.json();
              if (serviceData.length > 0 && serviceData[0].image) {
                setServiceImage(serviceData[0].image);
              }
            }
          } catch (serviceError) {
            console.warn("Could not fetch service image:", serviceError);
            // Set default service image based on service type
            setServiceImage("https://via.placeholder.com/220x330?text=Service");
          }
        }
      } catch (error) {
        console.error("Error in fetchBookingInformation:", error);
        alert("Failed to load booking details. Please try again.");
      }
    };

    if (invoiceId) {
      fetchBookingInformation();
    }
  }, [invoiceId, status, token, navigate, apiUrl]);

  if (!bookingData) {
    return (
      <div className="payment-success-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>Loading booking information...</div>
        </div>
      </div>
    );
  }

  // Format date if available
  const dateInfo =
    bookingData.bookingDate || bookingData.date
      ? formatDate(bookingData.bookingDate || bookingData.date)
      : { day: "N/A", month: "", weekday: "" };

  const handleBackToHome = () => {
    if (role === "EMPLOYEE") {
      navigate("/staffHomePage");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="payment-success-page">
      <div className="poster-section">
        <img
          src={
            serviceImage || "https://via.placeholder.com/220x330?text=Service"
          }
          alt="Service Image"
          className="service-poster"
        />
        <div className="poster-title">
          {bookingData.serviceName || bookingData.service || "Service Booking"}
        </div>
      </div>

      <div className="success-info">
        <div className="success-header">Payment Successfully</div>

        <div className="info-group">
          <div className="info-label">Invoice ID</div>
          <div className="info-value">{invoiceId}</div>
        </div>

        {(bookingData.serviceName || bookingData.service) && (
          <div className="info-group">
            <div className="info-label">Service</div>
            <div className="info-value">
              {bookingData.serviceName || bookingData.service}
            </div>
          </div>
        )}

        {bookingData.customerName && (
          <div className="info-group">
            <div className="info-label">Customer Name</div>
            <div className="info-value">{bookingData.customerName}</div>
          </div>
        )}

        {(bookingData.bookingDate || bookingData.date) && (
          <div className="info-group">
            <div className="info-label">Date</div>
            <div className="info-value">
              {dateInfo.weekday ? `${dateInfo.weekday}, ` : ""}
              {dateInfo.day} {dateInfo.month}
            </div>
          </div>
        )}

        {(bookingData.bookingTime || bookingData.time) && (
          <div className="info-group">
            <div className="info-label">Time</div>
            <div className="info-value">
              {formatTime(bookingData.bookingTime || bookingData.time)}
            </div>
          </div>
        )}

        {bookingData.location && (
          <div className="info-group">
            <div className="info-label">Location</div>
            <div className="info-value">{bookingData.location}</div>
          </div>
        )}

        {bookingData.room && (
          <div className="info-group">
            <div className="info-label">Room</div>
            <div className="info-value">{bookingData.room}</div>
          </div>
        )}

        {bookingData.duration && (
          <div className="info-group">
            <div className="info-label">Duration</div>
            <div className="info-value">{bookingData.duration}</div>
          </div>
        )}

        {bookingData.paymentMethod && (
          <div className="info-group">
            <div className="info-label">Payment Method</div>
            <div className="info-value">{bookingData.paymentMethod}</div>
          </div>
        )}

        {bookingData.transactionId && (
          <div className="info-group">
            <div className="info-label">Transaction ID</div>
            <div className="info-value">{bookingData.transactionId}</div>
          </div>
        )}

        <div className="info-group">
          <div className="info-label">Total Price</div>
          <div className="info-value total-price">
            {(
              bookingData.totalAmount ||
              bookingData.total ||
              bookingData.amount ||
              0
            ).toLocaleString("vi-VN")}{" "}
            VND
          </div>
        </div>

        {bookingData.status && (
          <div className="info-group">
            <div className="info-label">Status</div>
            <div className="info-value status-success">
              {bookingData.status}
            </div>
          </div>
        )}

        <div className="thank-you">Thank you!</div>

        <div className="action-buttons">
          <button className="home-btn" onClick={handleBackToHome}>
            Back to Home page
          </button>
          <button
            className="booking-btn"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPaymentSuccess;
