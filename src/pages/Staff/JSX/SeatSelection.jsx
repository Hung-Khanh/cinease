import React, { useEffect, useState } from "react";
import "../SCSS/SeatSelection.scss";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Modal, Button, Card, Flex, Select } from "antd";
import api from "../../../constants/axios";

const SeatSelection = ({ apiUrl, onBack }) => {
  const [seats, setSeats] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { scheduleId, movieName, selectedDate, selectedTime } = useParams();
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("ALL Food & Drink");
  const navigate = useNavigate();

  const fetchSeat = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.get(`/public/seats?scheduleId=${scheduleId}`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await response.data;
      setSeats(data);
    } catch (error) {
      console.error("Error in fetchSeat:", error);
    }
  };

  const fetchProduct = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.get(`/employee/products/all`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await response.data;
      setProducts(data);
    } catch (error) {
      console.error("Error in fetchProduct:", error); 
    }
  };

  useEffect(() => {
    if (scheduleId && apiUrl) {
      fetchSeat();
      fetchProduct();
    }
  }, [scheduleId, apiUrl]);

  const createSeatId = (seatColumn, seatRow) => {
    return `${seatColumn}${seatRow}`;
  };

  const findSeatBySeatId = (seatId) => {
    return seats.find(
      (seat) => createSeatId(seat.seatColumn, seat.seatRow) === seatId
    );
  };

  const getUniqueColumns = () => {
    const columns = [...new Set(seats.map((seat) => seat.seatColumn))];
    return columns.sort();
  };

  const getMaxSeatsPerColumn = () => {
    if (seats.length === 0) return 0;
    return Math.max(...seats.map((seat) => seat.seatRow));
  };

  const toggleSeat = (seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat || seat.seatStatus === "BOOKED") return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatClass = (seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat) return "seat unavailable";

    let baseClass = "seat";
    if (seat.seatType === "VIP") {
      baseClass += " vip";
    }
    if (seat.seatStatus !== "AVAILABLE") {
      return baseClass + " sold";
    }
    if (selectedSeats.includes(seatId)) {
      return baseClass + " selected";
    }
    return baseClass + " available";
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    const selectedSeatsInfo = selectedSeats.map((seatId) => {
      const seat = findSeatBySeatId(seatId);
      return {
        seatId,
        scheduleSeatId: seat?.scheduleSeatId,
        seatType: seat?.seatType,
      };
    });

    const scheduleSeatIds = selectedSeatsInfo.map(
      (seat) => seat.scheduleSeatId
    );

    // Prepare products array for the request body
    const productsForRequest = Object.entries(productQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        productId: parseInt(productId),
        quantity,
        notes: null,
      }));

    try {
      const response = await fetch(`${apiUrl}/employee/bookings/select-seats`, {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          scheduleId: parseInt(scheduleId),
          scheduleSeatIds,
          products: productsForRequest,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to select seats: ${response.status}`);
      }

      const data = await response.json();
      setIsModalVisible(false);
      navigate(`/phone-input/${data.invoiceId}/${scheduleId}`, {});
    } catch (error) {
      console.error("Error in handleCheckout:", error);
      alert("Failed to select seats. Please try again.");
    }
  };

  const renderSeats = () => {
    const columns = getUniqueColumns();
    const maxSeatsPerColumn = getMaxSeatsPerColumn();

    const rows = Array.from({ length: maxSeatsPerColumn }, (_, i) => i + 1);

    return rows.map((rowNumber) => (
      <div key={rowNumber} className="seat-row">
        {columns.map((column) => {
          const seatId = createSeatId(column, rowNumber);
          const seat = findSeatBySeatId(seatId);

          if (!seat) {
            return <div key={seatId} className="seat empty"></div>;
          }

          return (
            <div
              key={seatId}
              className={getSeatClass(seatId)}
              onClick={() => toggleSeat(seatId)}
            >
              {seatId}
            </div>
          );
        })}
      </div>
    ));
  };

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

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleQuantityChange = (productId, delta) => {
    setProductQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const categories = [
    "ALL Food & Drink",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts =
    selectedCategory === "ALL Food & Drink"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="seat-selection-wrapper">
      <button className="dts-back-btn" onClick={handleBack}>
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
          {seats.length > 0 ? renderSeats() : <div>Đang tải ghế...</div>}
        </div>

        <div className="filter-section">
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 180, margin: "24px 0" }}
          >
            {categories.map((cat) => (
              <Select.Option key={cat} value={cat}>
                {cat}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Flex
          wrap="wrap"
          gap={50}
          justify="flex-start"
          style={{
            rowGap: 50,
            columnGap: 50,
            margin: "16px",
          }}
        >
          {filteredProducts.map((product) => {
            const imagePath = product.image;
            return (
              <Card
                key={product.productId}
                style={{
                  width: 180,
                  height: 300,
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                <div style={{ width: "100%", height: 160 }}>
                  {" "}
                  {/* Adjusted height for image */}
                  <img
                    alt={product.productName}
                    src={imagePath}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "16px 16px 0 0",
                      margin: 0,
                      padding: 0,
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "12px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 0,
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}
                    >
                      {product.productName}
                    </div>
                    <div
                      style={{ color: "#888", fontSize: 12, marginBottom: 12 }}
                    >
                      {product.price.toLocaleString()} VND
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      alignItems: "center",
                      marginTop: "auto", // Push buttons to the bottom
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() =>
                        handleQuantityChange(product.productId, -1)
                      }
                      disabled={
                        (productQuantities[product.productId] || 0) === 0
                      }
                      style={{ width: 28, height: 28 }}
                    >
                      -
                    </Button>
                    <span
                      style={{
                        minWidth: 24,
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      {productQuantities[product.productId] || 0}
                    </span>
                    <Button
                      size="small"
                      onClick={() => handleQuantityChange(product.productId, 1)}
                      style={{ width: 28, height: 28 }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </Flex>

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
            <p className="label">SELECTED SEAT</p>
            <p className="value">
              {selectedSeats.join(", ") || "Not Selected"}
            </p>
          </div>
          <div className="summary-item">
            <p className="label">MOVIE</p>
            <p className="value">{movieName || "No Movie Selected"}</p>
          </div>
          <div className="summary-item">
            <p className="label">DATE</p>
            <p className="value">{selectedDate}</p>
          </div>
          <div className="summary-item">
            <p className="label">TIME</p>
            <p className="value">{selectedTime}</p>
          </div>
          <button
            className="checkout-button"
            onClick={showModal}
            disabled={selectedSeats.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>

      <Modal
        title="Confirm Information"
        open={isModalVisible}
        onCancel={handleCancel}
      >
        <p>
          <strong>Movie:</strong> {movieName || "No Movie Selected"}
        </p>
        <p>
          <strong>Seats:</strong> {selectedSeats.join(", ") || "None"}
        </p>
        <p>
          <strong>Combo:</strong>{" "}
          {Object.entries(productQuantities)
            .filter(([, quantity]) => quantity > 0)
            .map(([productId, quantity]) => {
              const product = products.find(
                (p) => p.productId === parseInt(productId)
              );
              return product ? `${product.productName} x${quantity}` : null;
            })
            .filter(Boolean)
            .join(", ") || "None"}
        </p>
        <p>
          <strong>Date:</strong> {selectedDate}
        </p>
        <p>
          <strong>Time:</strong> {selectedTime}
        </p>
        <div className="modal-buttons">
          <Button
            key="cancel"
            onClick={handleCancel}
            className="modal-cancel-button"
          >
            Cancel
          </Button>
          <Button
            key="confirm"
            type="primary"
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0}
            className="modal-confirm-button"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SeatSelection;
