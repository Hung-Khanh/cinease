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
  const [selectedCategory, setSelectedCategory] = useState("ALL");
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
      console.log("Error in fetchProduct: ", error);
    }
  };
  useEffect(() => {
    if (scheduleId && apiUrl) {
      fetchSeat();
      fetchProduct();
    } else {
      console.log("❌ Missing data:", { scheduleId, apiUrl });
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

  const getUniqueRows = () => {
    const rows = [...new Set(seats.map((seat) => seat.seatColumn))];
    return rows.sort();
  };

  const getMaxSeatsPerRow = () => {
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

  const totalPrice = selectedSeats.reduce((total, seatId) => {
    const seat = findSeatBySeatId(seatId);
    if (!seat) return total;
    const seatPrice = seat.seatType === "VIP" ? 120000 : 80000;
    return total + seatPrice;
  }, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    const selectedSeatsInfo = selectedSeats.map((seatId) => {
      const seat = findSeatBySeatId(seatId);
      return {
        seatId,
        scheduleSeatId: seat?.scheduleSeatId,
        seatType: seat?.seatType,
        price: seat?.seatType === "VIP" ? 120000 : 80000,
      };
    });

    const scheduleSeatIds = selectedSeatsInfo.map(
      (seat) => seat.scheduleSeatId
    );
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
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Error response from select-seats:", errorText);
        throw new Error(`Failed to select seats: ${response.status}`);
      }

      const data = await response.json();
      setIsModalVisible(false);
      navigate(`/ticketInformation/${data.invoiceId}/${scheduleId}`, {});
    } catch (error) {
      console.error("Error in handleCheckout:", error);
      alert("Failed to select seats. Please try again.");
    }
  };

  const renderSeats = () => {
    const rows = getUniqueRows();
    const maxSeatsPerRow = getMaxSeatsPerRow();

    return rows.map((row) => (
      <div key={row} className="seat-row">
        {Array.from({ length: maxSeatsPerRow }, (_, i) => {
          const seatNumber = i + 1;
          const seatId = createSeatId(row, seatNumber);
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
    "ALL",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category === selectedCategory);
  return (
    <div className="seat-selection-wrapper">
      <button className="back-button" onClick={handleBack}>
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
            margin: "32px 60px",
          }}
        >
          {filteredProducts.map((product) => (
            <Card
              key={product.productId}
              hoverable
              style={{
                width: 180,
                borderRadius: 16,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                alt={product.productName}
                src={product.image}
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              />
              <div style={{ fontWeight: 600 }}>{product.productName}</div>
              <div style={{ color: "#888" }}>
                {product.price.toLocaleString()} VND
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  size="small"
                  onClick={() => handleQuantityChange(product.productId, -1)}
                  disabled={(productQuantities[product.productId] || 0) === 0}
                  style={{ minWidth: 28 }}
                >
                  -
                </Button>
                <span
                  style={{
                    margin: "-20px 40px",
                    minWidth: 24,
                    display: "inline-block",
                    textAlign: "center",
                  }}
                >
                  {productQuantities[product.productId] || 0}
                </span>
                <Button
                  size="small"
                  onClick={() => handleQuantityChange(product.productId, 1)}
                  style={{ minWidth: 28 }}
                >
                  +
                </Button>
              </div>
            </Card>
          ))}
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
            <p className="label">TOTAL</p>
            <p className="value">VND {totalPrice.toLocaleString()}</p>
          </div>
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
            <p className="label">CURRENT DATE</p>
            <p className="value">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="summary-item">
            <p className="label">CURRENT TIME</p>
            <p className="value">{new Date().toLocaleTimeString()}</p>
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
          <strong>Total:</strong> {totalPrice.toLocaleString()} VND
        </p>
        <p>
          <strong>Date:</strong>
          {selectedDate}
        </p>
        <p>
          <strong>Time:</strong>
          {selectedTime}
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
