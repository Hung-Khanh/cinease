import React, { useEffect, useState } from "react";
import "../SCSS/TestSeat.scss";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PiArmchair, PiArmchairFill, PiArmchairDuotone } from "react-icons/pi";
import { TbArmchair2Off } from "react-icons/tb";
import { useSelector } from "react-redux";
import { getSeats } from "../../../api/seat";
import { postSelectedSeats } from "../../../api/staff";
import { StaffGetPromotions } from "../../../api/promotion";
import { Modal, Button, Card, Flex, Select } from "antd";

const SeatSelect = ({ onBack }) => {
  const [seats, setSeats] = useState([]);
  const [products, setProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const { scheduleId, movieName, selectedDate, selectedTime } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("ALL Food & Drink");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Lấy token từ Redux store
  const token = useSelector((state) => state.auth.token);

  // Lấy dữ liệu từ location.state (có thể đã được navigate từ trước)
  const { selectedSeats: initialSelectedSeats = [] } = location.state || {};

  // Khởi tạo selectedSeats từ state cũ nếu có
  const [selectedSeats, setSelectedSeats] = useState(initialSelectedSeats);

  const fetchSeat = async () => {
    if (!token) {
      alert(
        "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
      navigate("/login");
      return;
    }
    try {
      const data = await getSeats(scheduleId);
      setSeats(data.data);
    } catch (error) {
      console.error("🔥 Error in fetchSeat:", error);
      alert("Lỗi khi tải danh sách ghế. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchSeat();
    fetchProduct();
  }, [scheduleId]);

  const findSeatBySeatId = (seatId) => {
    return seats.find(
      (seat) => `${seat.seatColumn}${seat.seatRow}` === String(seatId)
    );
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
  const fetchProduct = async () => {
    try {
      const response = await StaffGetPromotions();
      const data = await response.data;
      setProducts(data);
    } catch (error) {
      console.log("Error in fetchProduct: ", error);
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      alert(
        "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
      navigate("/login");
      return;
    }

    const selectedSeatsInfo = selectedSeats.map((seatId) => {
      const seat = findSeatBySeatId(seatId);
      if (!seat) {
        console.error("Không tìm thấy seat cho seatId:", seatId);
      }
      return {
        seatId,
        scheduleSeatId: seat?.scheduleSeatId,
        seatType: seat?.seatType,
      };
    });

    const scheduleSeatIds = selectedSeatsInfo
      .map((seat) => seat.scheduleSeatId)
      .filter((id) => typeof id === "number" && !isNaN(id));

    console.log("scheduleSeatIds gửi lên API:", scheduleSeatIds);

    try {
      const response = await postSelectedSeats(
        scheduleId,
        scheduleSeatIds,
        productsForRequest
      );

      const data = await response.data;

      navigate(`/phone-input/${data.invoiceId}/${scheduleId}`, {});
    } catch (error) {
      console.error("Error in handleCheckout:", error);
      alert("Lỗi khi đặt ghế. Vui lòng thử lại.");
    }
  };
  const productsForRequest = Object.entries(productQuantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => ({
      productId: parseInt(productId),
      quantity,
      notes: null,
    }));
  const renderSeats = () => {
    const seatColumns = [...new Set(seats.map((s) => s.seatColumn))].sort();
    const maxRow =
      seats.length === 0 ? 0 : Math.max(...seats.map((s) => s.seatRow));
    const seatRows = Array.from({ length: maxRow }, (_, i) => i + 1);

    return (
      <div className="cs-seat-matrix">
        <div className="cs-column-headers">
          <div className="cs-empty-slot"></div>
          {seatRows.map((rowNum) => (
            <div key={rowNum} className="cs-column-marker">
              {rowNum}
            </div>
          ))}
        </div>
        {seatColumns.map((col) => (
          <div key={col} className="cs-row-container">
            <div className="cs-row-indicator">{col}</div>
            {seatRows.map((row) => {
              const seatId = `${col}${row}`;
              const seat = seats.find(
                (s) => `${s.seatColumn}${s.seatRow}` === seatId
              );

              if (!seat) {
                return <div key={seatId} className="cs-seat-empty"></div>;
              }

              const isSelected = selectedSeats.includes(seatId);
              const isUnavailable =
                seat.seatStatus == "BOOKED" || seat.seatStatus == "UNAVAILABLE";
              const isVip = seat.seatType === "VIP";

              return (
                <button
                  key={seatId}
                  onClick={() => toggleSeat(seatId)}
                  className={`cs-seat-button ${isVip ? "cs-vip" : ""}`}
                  disabled={isUnavailable}
                >
                  {isUnavailable ? (
                    <TbArmchair2Off
                      className="cs-seat-icon cs-unavailable"
                      size={36}
                    />
                  ) : isSelected ? (
                    <PiArmchairFill
                      className="cs-seat-icon cs-selected"
                      size={36}
                    />
                  ) : isVip ? (
                    <PiArmchairDuotone
                      className="cs-seat-icon cs-vip"
                      size={36}
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
    );
  };
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
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
          {seats.length > 0 ? renderSeats() : <div>Loading...</div>}
        </div>

        <div className="legend bottom-center">
          <div className="legend-item">
            <PiArmchair className="cs-seat-icon cs-regular" size={36} />
            <span>Available</span>
          </div>
          <div className="legend-item">
            <PiArmchairFill className="cs-seat-icon cs-selected" size={36} />
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <TbArmchair2Off className="cs-seat-icon cs-unavailable" size={36} />
            <span>Unavailable</span>
          </div>
          <div className="legend-item">
            <PiArmchairDuotone className="cs-seat-icon cs-vip" size={36} />
            <span>VIP</span>
          </div>
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
                  width: 195,
                  height: 310,
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

        <div className="summary bottom-bar">
          <div className="summary-item">
            <p className="label">SEAT</p>
            <p className="value">{selectedSeats.join(", ") || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">MOVIE</p>
            <p className="value">{movieName || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">DATE</p>
            <p className="value">{selectedDate || "N/A"}</p>
          </div>
          <div className="summary-item">
            <p className="label">TIME</p>
            <p className="value">{selectedTime || "N/A"}</p>
          </div>

          <button
            className="checkout-button"
            onClick={showModal}
            disabled={selectedSeats.length === 0}
          >
            Checkout
          </button>
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
      </div>
    </div>
  );
};

export default SeatSelect;
