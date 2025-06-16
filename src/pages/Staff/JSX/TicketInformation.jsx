import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Modal, Select, Input } from "antd";

import "../SCSS/TicketIn4.scss";

const { Option } = Select;

const TicketInformation = ({ apiUrl, onBack }) => {
  const [ticketData, setTicketData] = useState(null);
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { scheduleId } = useParams();
  const [movieName, setMovieName] = useState("");
  const [movieImage, setMovieImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputType, setInputType] = useState("phone");
  const [inputValue, setInputValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${apiUrl}/employee/bookings/${invoiceId}`,
          {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ Error response:", errorText);
          throw new Error(`Failed to fetch ticket details: ${response.status}`);
        }
        const data = await response.json();
        console.log("Ticket details:", data);
        setMovieName(data.movieName);
        setTicketData(data);
      } catch (error) {
        console.error("Error in fetchTicketDetails:", error);
        alert("Failed to load ticket details. Please try again.");
      }
    };

    if (invoiceId) {
      fetchTicketDetails();
    } else {
      console.log("No invoiceId found in state");
      alert("Invalid ticket information.");
    }
  }, [apiUrl, invoiceId]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!movieName) return;

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${apiUrl}/public/movies?q=${movieName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setMovieImage(data[0]?.largeImage || "placeholder-image.jpg");
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovieImage("placeholder-image.jpg");
      }
    };

    fetchMovies();
  }, [movieName, apiUrl]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setInputValue(""); // Reset input value when canceling
  };

  const handleSubmit = () => {
    if (!inputValue) {
      alert("Please enter a valid phone number or ID card.");
      return;
    }
    // Cập nhật dữ liệu vào state hoặc thực hiện hành động cần thiết
    console.log(`Submitted ${inputType}: ${inputValue}`);
    setIsModalVisible(false);
  };

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem("token");
      const identityOrPhone = inputType === "phone" ? inputValue : undefined;
      const response = await fetch(
        `${apiUrl}/employee/bookings/confirmBooking`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            invoiceId: parseInt(invoiceId),
            scheduleId: parseInt(scheduleId),
            useScore: 0,
            promotionId: null,
            identityCard: inputType === "id" ? inputValue : undefined,
            phoneNumber: identityOrPhone,
            paymentMethod: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error confirming booking:", errorText);
        throw new Error(`Failed to confirm booking: ${response.status}`);
      }

      const data = await response.json();
      console.log("Confirm booking response:", data.paymentUrl);
      if (paymentMethod === "VNPAY" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (paymentMethod === "CASH") {
        navigate("/payment-success", { state: { change } });
      } else {
        alert("No payment URL received. Please try again.");
      }
    } catch (error) {
      console.error("Error in handlePurchase:", error);
      alert("Failed to confirm booking. Please try again.");
    }
  };

  const handleCashChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCashReceived(value);
    setChange(value - (ticketData?.total || 0));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/");
  };

  return (
    <div className="ticket-info-wrapper">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="ticket-info-container">
        <div className="ticket-card">
          <div className="ticket-image">
            <img
              src={movieImage || "placeholder-image.jpg"}
              alt={ticketData?.movieName || "Movie Poster"}
              className="movie-poster"
            />
          </div>
          <div className="ticket-details">
            <h2>TICKET DETAIL</h2>
            <div className="detail-item">
              <h3>Schedule</h3>
            </div>
            <div className="detail-item">
              <span>Movie Title</span>
              <span>{ticketData?.movieName || "N/A"}</span>
            </div>
            <div className="detail-item">
              <span>Cinema Room</span>
              <span>{ticketData?.cinemaRoomName || "N/A"}</span>
            </div>
            <div className="detail-item">
              <span>Date</span>
              <span>{formatDate(ticketData?.date)}</span>
            </div>
            <div className="detail-item">
              <span>Time</span>
              <span>
                {ticketData?.time
                  ? new Date(ticketData.time).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <span>Ticket ({ticketData?.seat?.length || 0})</span>
              <span>{ticketData?.seat?.join(", ") || "N/A"}</span>
            </div>
            <div className="detail-item voucher">
              <span>Select or enter a voucher</span>
              <select>
                <option value="">Select a voucher</option>
              </select>
            </div>
            <div className="detail-item transaction">
              <span>Transaction Detail</span>
              <div className="transaction-details">
                <div>SEAT</div>
                <div>
                  VND{" "}
                  {ticketData?.price
                    ? (
                        ticketData.price / (ticketData.seat?.length || 1)
                      ).toLocaleString()
                    : "0"}{" "}
                  x {ticketData?.seat?.length || 0}
                </div>
                <div>DISCOUNT</div>
                <div>
                  VND{" "}
                  {ticketData?.scoreForTicketConverting?.toLocaleString() ||
                    "0.0"}
                </div>
              </div>
            </div>
            <div className="detail-item total">
              <span>Total payment</span>
              <span>VND {ticketData?.total?.toLocaleString() || "0"}</span>
            </div>
            <div className="detail-item phone-input">
              <button onClick={showModal}>Enter Phone Number</button>
            </div>
            <div className="detail-item payment-method">
              <span>Payment Method</span>
              <Select value={paymentMethod} onChange={setPaymentMethod}>
                <Option value="VNPAY">VNPAY</Option>
                <Option value="CASH">Cash</Option>
              </Select>
              {paymentMethod === "CASH" && (
                <div>
                  <Input
                    placeholder="Cash Received"
                    value={cashReceived}
                    onChange={handleCashChange}
                    type="number"
                  />
                  <div>Change: VND {change.toLocaleString()}</div>
                </div>
              )}
            </div>
            <p className="note">*Purchased ticket cannot be canceled</p>
            <button className="purchase-button" onClick={handlePurchase}>
              Purchase
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Enter Information"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{
          position: "absolute",
          top: "50%",
          left: "20px",
          transform: "translateY(-50%)",
        }}
      >
        <Select
          value={inputType}
          onChange={setInputType}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <Option value="phone">Enter Phone Number</Option>
          <Option value="id">Enter ID Card</Option>
        </Select>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={inputType === "phone" ? "Phone Number" : "ID Card"}
        />
      </Modal>
    </div>
  );
};

export default TicketInformation;
