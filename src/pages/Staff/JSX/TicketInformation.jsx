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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputType, setInputType] = useState("phone");
  const [inputValue, setInputValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);
  const [ticketType, setTicketType] = useState("ADULT");
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [grandTotal, setGrandTotal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchPromotion, setSearchPromotion] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [promotionId, setPromotionId] = useState(null);

  // Icon suffix cho Search
  const suffix = <AudioOutlined />;

  // Lấy danh sách promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      const token = localStorage.getItem("token");
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

  // Lọc promotions dựa trên title
  const filteredPromotions = promotions.filter((promotion) =>
    promotion.title.toLowerCase().includes(searchPromotion.toLowerCase())
  );

  // Xử lý tìm kiếm
  const onSearch = (value) => {
    setSearchPromotion(value);
  };

  // Xử lý chọn promotion
  const handleSelectPromotion = (selectedId) => {
    setPromotionId(selectedId);
  };

  // Xử lý purchase
  const handlePurchase = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const payload = {
        invoiceId: parseInt(invoiceId),
        scheduleId: parseInt(scheduleId),
        useScore: 0,
        promotionId: promotionId,
        identityCard: inputType === "id" ? inputValue : undefined,
        phoneNumber: inputType === "phone" ? inputValue : undefined,
        paymentMethod: paymentMethod,
        ticketType: ticketType,
      };

      console.log("Sending payload:", payload);

      const response = await api.post(`/employee/bookings/confirm`, payload, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = response.data;
      console.log("Ticket Details:", data);
      const paymentUrl = data?.paymentUrl;
      if (paymentUrl) {
        localStorage.setItem("paymentUrl", JSON.stringify(paymentUrl));
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

  // Các useEffect khác giữ nguyên
  useEffect(() => {
    const storedGrandTotal = localStorage.getItem("grandTotal");
    if (storedGrandTotal) {
      setGrandTotal(storedGrandTotal);
    }
  }, []);

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

      const token = localStorage.getItem("token");
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
        setMovieImage(data[0]?.largeImage || "placeholder-image.jpg");
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setInputValue("");
  };

  const handleSubmit = () => {
    if (!inputValue) {
      alert("Please enter a valid phone number or ID card.");
      return;
    }
    setIsModalVisible(false);
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
    <div className="ticket-info-wrapper">
      <button className="dts-back-btn" onClick={handleBack}>
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
              <span>{cinemaRoom || "N/A"}</span>
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
            <div className="detail-item promotion-search">
              <span>Search Promotions</span>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Search
                  placeholder="Search voucher by title..."
                  allowClear
                  onSearch={onSearch}
                  suffix={suffix}
                  value={searchPromotion}
                  onChange={(e) => setSearchPromotion(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Space>
              {searchPromotion && (
                <ul
                  className={`promotion-list ${
                    filteredPromotions.length > 0 ? "has-results" : ""
                  }`}
                >
                  {filteredPromotions.map((promotion) => (
                    <li
                      key={promotion.promotionId}
                      onClick={() =>
                        handleSelectPromotion(promotion.promotionId)
                      }
                      className={
                        promotionId === promotion.promotionId ? "selected" : ""
                      }
                    >
                      {promotion.title} ({promotion.discountLevel}% off)
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="detail-item ticket-type">
              <span>Select Ticket Type:</span>
              <Select
                value={ticketType}
                onChange={setTicketType}
                style={{ width: "97%" }}
              >
                <Option value="ADULT">ADULT</Option>
                <Option value="STUDENT">STUDENT</Option>
              </Select>
            </div>
            <div className="detail-item total">
              <span>Total payment</span>
              <span>VND {grandTotal || "0"}</span>
            </div>
            <div className="detail-item phone-input">
              <button onClick={showModal}>Enter Phone Number</button>
            </div>
            <div className="detail-item payment-method">
              <span>Payment Method</span>
              <Select value={paymentMethod} onChange={setPaymentMethod}>
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
            <p className="note">*Purchased ticket cannot be canceled</p>
            <button
              className="purchase-button"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Enter Information"
        open={isModalVisible}
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
        <Button key="submit" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal>

      <Modal
        title="Purchase Response"
        open={responseModalVisible}
        onOk={() => setResponseModalVisible(false)}
        onCancel={() => setResponseModalVisible(false)}
      >
        <p>Movie Name: {ticketData?.movieName || "N/A"}</p>
        <p>Date: {formatDate(ticketData?.date)}</p>
        <p>
          Time:{" "}
          {ticketData?.time
            ? new Date(ticketData.time).toLocaleTimeString()
            : "N/A"}
        </p>
        <p>
          Ticket ({ticketData?.seat?.length || 0}):{" "}
          {ticketData?.seat?.join(", ") || "N/A"}
        </p>
        <p>Total payment: {grandTotal} VND</p>
        <br />
        <Button key="close" onClick={() => setResponseModalVisible(false)}>
          Close
        </Button>
        <Button
          key="Confirm"
          onClick={handleQRPurchase}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Purchase"}
        </Button>
      </Modal>
    </div>
  );
};

export default TicketInformation;
