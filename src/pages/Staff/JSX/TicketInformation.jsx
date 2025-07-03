import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Modal, Select, Input, Button, message, Space } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import api from "../../../constants/axios";
import "../SCSS/TicketIn4.scss";

const { Option } = Select;
const { Search } = Input;

const TicketInformation = ({ apiUrl, onBack }) => {
  const [ticketData, setTicketData] = useState(null);
  const navigate = useNavigate();
  const { invoiceId, scheduleId } = useParams();
  const [movieName, setMovieName] = useState("");
  const [movieImage, setMovieImage] = useState("");
  const [cinemaRoom, setCinemaRoom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);
  const [ticketType, setTicketType] = useState("ADULT");
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchPromotion, setSearchPromotion] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [promotionId, setPromotionId] = useState(null);
  const [showPromotionList, setShowPromotionList] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await api.get(`/public/promotions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data = await response.data;
        setPromotions(data);
      } catch (error) {
        message.error("Lỗi lấy Voucher: " + error.message);
      }
    };
    fetchPromotions();
  }, []);

  const filteredPromotions = promotions.filter((promotion) =>
    promotion.title.toLowerCase().includes(searchPromotion.toLowerCase())
  );

  const onSearch = (value) => {
    setSearchPromotion(value);
    setShowPromotionList(!!value);
    console.log("Search value:", value, "Show list:", !!value);
  };

  const handleSelectPromotion = (selectedId, title) => {
    setPromotionId(selectedId);
    setSearchPromotion(title);
    setShowPromotionList(false);
    console.log("Selected:", title, "ID:", selectedId);
  };

  const handlePurchase = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const payload = {
        invoiceId: parseInt(invoiceId),
        scheduleId: parseInt(scheduleId),
        useScore: 0,
        promotionId: promotionId,
        paymentMethod: paymentMethod,
        ticketType: ticketType,
      };

      console.log("Sending payload:", payload);

      const response = await fetch(`${apiUrl}/employee/bookings/confirm`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Ticket Details:", data);
      const paymentUrl = data?.paymentUrl;
      const grandTotal = data?.grandTotal;
      if (paymentUrl && grandTotal) {
        sessionStorage.setItem("paymentUrl", JSON.stringify(paymentUrl));
        sessionStorage.setItem("grandTotal", grandTotal);
        console.log("Payment URL saved:", paymentUrl);
      } else {
        console.warn("No payment URL found in ticket data");
      }
      setResponseModalVisible(true);
    } catch (error) {
      console.error("Error in handlePurchase:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to confirm booking. Please try again.";
      alert(errorMessage);
      setResponseModalVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await fetch(
          `${apiUrl}/employee/bookings/summary/{invoiceId}?invoiceId=${invoiceId}`,
          {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "null",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ Error response:", errorText);
          throw new Error(`Failed to fetch ticket details: ${response.status}`);
        }
        const data = await response.json();
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
      alert("Invalid ticket information.");
    }
  }, [apiUrl, invoiceId]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!movieName) return;

      const token = sessionStorage.getItem("token");
      try {
        const response = await fetch(`${apiUrl}/public/movies?q=${movieName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "null",
          },
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setMovieImage(data[0]?.posterImageUrl || "placeholder-image.jpg");
        setCinemaRoom(data[0]?.cinemaRoomId);
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

  const handleQRPurchase = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      navigate("/confirm-purchase");
    } catch (error) {
      console.error("Error in handleQRPurchase:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [navigate, isProcessing]);

  return (
    <div className="ticket-info-main">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="ticket-info-content">
        <div className="ticket-info-card">
          <div className="ticket-poster-container">
            <img
              src={movieImage || "placeholder-image.jpg"}
              alt={ticketData?.movieName || "Movie Poster"}
              className="ticket-movie-poster"
            />
          </div>
          <div className="ticket-details-section">
            <h2>TICKET DETAIL</h2>
            <div className="ticket-detail-row">
              <h3>Schedule</h3>
            </div>
            <div className="ticket-detail-row">
              <span>Movie Title</span>
              <span>{ticketData?.movieName || "N/A"}</span>
            </div>
            <div className="ticket-detail-row">
              <span>Cinema Room</span>
              <span>{cinemaRoom || "N/A"}</span>
            </div>
            <div className="ticket-detail-row">
              <span>Date</span>
              <span>{formatDate(ticketData?.scheduleShowDate)}</span>
            </div>
            <div className="ticket-detail-row">
              <span>Time</span>
              <span>
                {ticketData?.scheduleShowTime
                  ? new Date(ticketData.scheduleShowTime).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
            <div className="ticket-detail-row">
              <span>Ticket ({ticketData?.seatNumbers?.length || 0})</span>
              <span>{ticketData?.seatNumbers?.join(", ") || "N/A"}</span>
            </div>
            <div className="ticket-detail-row ticket-voucher-search">
              <span>Voucher</span>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Search
                  placeholder="Search voucher by title..."
                  allowClear
                  onSearch={onSearch}
                  value={searchPromotion}
                  onChange={(e) => {
                    setSearchPromotion(e.target.value);
                    setShowPromotionList(!!e.target.value);
                  }}
                  style={{ width: "100%", color: "gray" }}
                />
              </Space>
              {showPromotionList && filteredPromotions.length > 0 && (
                <ul
                  className={`ticket-voucher-list ${filteredPromotions.length > 0 ? "has-vouchers" : ""
                    }`}
                >
                  {filteredPromotions.map((promotion) => (
                    <li
                      key={promotion.promotionId}
                      onClick={() =>
                        handleSelectPromotion(
                          promotion.promotionId,
                          promotion.title
                        )
                      }
                      className={
                        promotionId === promotion.promotionId
                          ? "voucher-selected"
                          : ""
                      }
                    >
                      {promotion.title} ({promotion.discountLevel}% off)
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="ticket-detail-row ticket-type-selection">
              <span>Select Ticket Type:</span>
              <Select
                value={ticketType}
                onChange={setTicketType}
                style={{
                  position: "relative",
                  width: "490px",
                  top: "10px",
                  marginBottom: "30px",
                }}
              >
                <Option value="ADULT">ADULT</Option>
                <Option value="STUDENT">STUDENT</Option>
              </Select>
              <h5 className="ticket-type-note">
                *note:
                <br />
                Student: 80000 VND/seat
                <br />
                Adult: 120000 VND/seat
              </h5>
            </div>
            <div className="ticket-detail-row ticket-payment-method">
              <span
                style={{
                  marginTop: "10px",
                  marginBottom: "-20",
                  fontSize: "25px",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                Payment Method
              </span>
              <Select
                value={paymentMethod}
                style={{
                  marginBottom: "5px",
                  display: "flex",
                  justifyContent: "center",
                }}
                onChange={setPaymentMethod}
              >
                <Option value="VNPAY">VNPAY</Option>
                <Option value="CASH">Cash</Option>
                <Option value="MOMO_QR">MOMO</Option>
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
            <p className="ticket-note">*Purchased ticket cannot be canceled</p>
            <button
              className="ticket-purchase-btn"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Purchase Response"
        open={responseModalVisible}
        onOk={() => setResponseModalVisible(false)}
        onCancel={() => setResponseModalVisible(false)}
      >
        <p>
          <strong>Movie Name:</strong> {ticketData?.movieName || "N/A"}
        </p>
        <p>
          <strong>Date:</strong> {formatDate(ticketData?.scheduleShowDate)}
        </p>
        <p>
          <strong>Time:</strong>
          {ticketData?.scheduleShowTime
            ? new Date(ticketData.scheduleShowTime).toLocaleTimeString()
            : "N/A"}
        </p>
        <p>
          <strong>Ticket({ticketData?.seatNumbers?.length || 0}):</strong>
          {ticketData?.seatNumbers?.join(", ") || "N/A"}
        </p>
        <br />
        <div className="ticket-infor-button">
          <Button
            className="ticket-infor-modal-button"
            key="Confirm"
            type="primary"
            block
            style={{
              backgroundColor: "#0c9550",
            }}
            onClick={handleQRPurchase}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Purchase"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TicketInformation;
