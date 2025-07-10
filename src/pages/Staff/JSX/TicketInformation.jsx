import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Modal, Input, Button, message, Space, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import api from "../../../constants/axios";
import "../SCSS/TicketIn4.scss";
import {
  getMovieList,
  staffBookingSummary,
  applyDiscount,
  confirmPayment,
} from "../../../api/staff";
import { useLocation } from "react-router-dom";
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
  const [memberInfor, setMemberInfor] = useState(null);
  const location = useLocation();
  const memberData = location.state;

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
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const confirmData = {
        invoiceId: parseInt(invoiceId),
        scheduleId: parseInt(scheduleId),
        memberId: memberData?.memberId || 0,
        ticketType: ticketType,
        paymentMethod: paymentMethod,
      };
      const response = await confirmPayment(confirmData);
      const data = response.data;
      const PaymentData = {
        paymentUrl: data?.paymentUrl,
        totalPrice: data?.finalAmount,
      };
      navigate(`/confirm-purchase`, { state: PaymentData });
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
      try {
        const response = await staffBookingSummary(invoiceId);
        const data = await response.data;
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
      try {
        const response = await getMovieList(movieName);
        const data = await response.data;
        setMovieImage(data[0]?.posterImageUrl || "placeholder-image.jpg");
        setCinemaRoom(data[0]?.cinemaRoomId);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovieImage("placeholder-image.jpg");
      }
    };

    fetchMovies();
  }, [movieName, apiUrl]);

  const handleApplyDiscount = async () => {
    const payload = {
      invoiceId: invoiceId,
      scheduleId: scheduleId,
      memberId: memberData?.memberId || 0,
      ticketType: ticketType,
      useScore: memberData?.maxScoreUsage > 5 ? 1 : 0,
    };

    if (promotionId) {
      payload.promotionId = promotionId;
    }
    const response = await applyDiscount(payload);
    const data = await response.data;
    setMemberInfor(data);
    setResponseModalVisible(true);
  };

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

  const ticketTypeItems = [
    { key: "1", label: "ADULT" },
    { key: "2", label: "STUDENT" },
  ];

  const paymentMethodItems = [
    { key: "1", label: "VNPAY" },
    { key: "2", label: "CASH" },
    { key: "3", label: "MOMO_QR" },
  ];

  const handleTicketTypeSelect = ({ key }) => {
    const selectedType = ticketTypeItems.find(
      (item) => item.key === key
    )?.label;
    if (selectedType) {
      setTicketType(selectedType);
    }
  };

  const handlePaymentMethodSelect = ({ key }) => {
    const selectedMethod = paymentMethodItems.find(
      (item) => item.key === key
    )?.label;
    if (selectedMethod) {
      setPaymentMethod(selectedMethod);
    }
  };

  return (
    <div className="tix-info-main">
      <button className="tix-back-btn" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="tix-info-content">
        <div className="tix-info-card">
          <div className="tix-poster-container">
            <img
              src={movieImage || "placeholder-image.jpg"}
              alt={ticketData?.movieName || "Movie Poster"}
              className="tix-movie-poster"
            />
          </div>
          <div className="tix-details-section">
            <h2>TICKET DETAIL</h2>
            <div className="tix-detail-row">
              <span>🎬 Movie Name:</span>
              <span>{ticketData?.movieName || "N/A"}</span>
            </div>
            <div className="tix-detail-row">
              <span>🏛 Cinema Room:</span>
              <span>{cinemaRoom || "N/A"}</span>
            </div>
            <div className="tix-detail-row">
              <span>📅 Date:</span>
              <span>{formatDate(ticketData?.scheduleShowDate)}</span>
            </div>
            <div className="tix-detail-row">
              <span>⏰ Time:</span>
              <span>
                {ticketData?.scheduleShowTime
                  ? new Date(ticketData.scheduleShowTime).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
            <div className="tix-detail-row">
              <span>🎟 Ticket ({ticketData?.seatNumbers?.length || 0}):</span>
              <span>{ticketData?.seatNumbers?.join(", ") || "N/A"}</span>
            </div>
            <div className="tix-detail-chosen tix-voucher-search">
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
                />
              </Space>
              {showPromotionList && filteredPromotions.length > 0 && (
                <ul
                  className={`tix-voucher-list ${
                    filteredPromotions.length > 0 ? "tix-has-vouchers" : ""
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
                          ? "tix-voucher-selected"
                          : ""
                      }
                      style={{
                        border: "1px solid #ccc",
                        margin: "3px",
                        borderRadius: "2px",
                        backgroundColor: "#fff",
                        color: "rgb(79, 79, 79)",
                        cursor: "pointer",
                        padding: "3px",
                      }}
                    >
                      {promotion.title} ({promotion.discountLevel}% off)
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="tix-detail-chosen tix-type-selection">
              <span>Select Ticket Type:</span>
              <Dropdown
                menu={{
                  items: ticketTypeItems,
                  onClick: handleTicketTypeSelect,
                }}
                trigger={["click"]}
                style={{ margin: "5px" }}
              >
                <Button style={{ marginTop: "10px" }}>
                  <a onClick={(e) => e.preventDefault()}>
                    <Space>
                      {ticketType}
                      <DownOutlined />
                    </Space>
                  </a>
                </Button>
              </Dropdown>
            </div>
            <h5 className="tix-type-note">
              *note:
              <br />
              Student: 80000 VND/seat
              <br />
              Adult: 120000 VND/seat
            </h5>
            <div className="tix-detail-chosen tix-payment-method">
              <span
                style={{
                  marginTop: "10px",
                  marginBottom: "-20",
                  fontSize: "25px",
                  display: "flex",
                }}
              >
                Payment Method
              </span>
              <Dropdown
                menu={{
                  items: paymentMethodItems,
                  onClick: handlePaymentMethodSelect,
                }}
                trigger={["click"]}
              >
                <Button size={"middle"} style={{ marginTop: "10px" }}>
                  <a onClick={(e) => e.preventDefault()}>
                    <Space style={{ padding: "40px" }}>
                      {paymentMethod}
                      <DownOutlined />
                    </Space>
                  </a>
                </Button>
              </Dropdown>
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
            <p className="tix-note">*Purchased ticket cannot be canceled</p>
            <button
              className="tix-purchase-btn"
              onClick={handleApplyDiscount}
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
        <p>
          <strong>Total:</strong>
          {typeof memberInfor?.finalPrice === "number"
            ? memberInfor.finalPrice.toLocaleString("vi-VN")
            : "0"}{" "}
          VND
        </p>
        <br />
        <div className="tix-infor-button">
          <Button
            className="tix-infor-modal-button"
            key="Confirm"
            type="primary"
            block
            style={{
              backgroundColor: "#0c9550",
            }}
            onClick={handlePurchase}
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
