import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft } from "react-icons/fa";
import { setSeatData, setSelectedProducts, setSessionId } from "../../store/cartSlice";
import './Product.scss';

const Product = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { movieId, sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const token = localStorage.getItem("token");
  const reduxSeatData = useSelector((state) => state.cart.seatData);
  const seatData = reduxSeatData || location.state || null;
  const selectedProductsRedux = useSelector((state) => state.cart.selectedProducts);

  useEffect(() => {
    if (selectedProductsRedux && selectedProductsRedux.length > 0) {
      const initialQuantities = {};
      selectedProductsRedux.forEach((item) => {
        initialQuantities[item.productId] = item.quantity;
      });
      setSelectedQuantities(initialQuantities);
    }
  }, [selectedProductsRedux]);

  useEffect(() => {
    if (location.state && !reduxSeatData) {
      dispatch(setSeatData(location.state));
      dispatch(setSessionId(location.state.sessionId));
    }

    if (!seatData || !seatData.sessionId) {
      alert("Không tìm thấy dữ liệu vé. Vui lòng quay lại chọn ghế.");
      navigate("/");
    }
  }, [seatData, reduxSeatData, navigate, dispatch, location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        alert("Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/member/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch products: ${errorData.message || response.status}`);
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("❌ Fetch products error:", error);
        alert(`Không thể tải danh sách bắp nước: ${error.message}. Vui lòng thử lại.`);
      }
    };
    fetchProducts();
  }, [apiUrl, navigate, token]);

  const increaseQuantity = (productId) => {
    setSelectedQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + 1;
      if (newQuantity > 10) {
        alert("Số lượng tối đa cho mỗi sản phẩm là 10.");
        return prev;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const decreaseQuantity = (productId) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  const getTotalQuantity = () =>
    Object.values(selectedQuantities).reduce((sum, qty) => sum + (qty || 0), 0);

  const getTotalPrice = () =>
    products.reduce(
      (total, product) =>
        total + (selectedQuantities[product.productId] || 0) * product.price,
      0
    );

  const handleBack = () => navigate(-1);

  const handleConfirm = async () => {
    if (!seatData || !seatData.sessionId) {
      alert("Không tìm thấy dữ liệu vé. Vui lòng quay lại chọn ghế.");
      navigate("/");
      return;
    }

    const selectedProducts = products
      .filter((p) => selectedQuantities[p.productId] > 0)
      .map((p) => ({
        productId: p.productId,
        quantity: selectedQuantities[p.productId],
      }));

    const totalItems = getTotalQuantity();
    if (totalItems > 20) {
      alert("Tổng số lượng sản phẩm không được vượt quá 20.");
      return;
    }

    try {
      const scheduleSeatIds = seatData.selectedSeats.map(seatId => {
        const seat = seatData.seats.find(s => `${s.seatColumn}${s.seatRow}` === seatId);
        return seat.scheduleSeatId;
      });

      const response = await fetch(`${apiUrl}/member/select-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          sessionId: seatData.sessionId,
          scheduleId: seatData.scheduleId,
          scheduleSeatIds,
          products: selectedProducts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errorCode === "SESSION_EXPIRED") {
          alert("Phiên đặt vé đã hết hạn. Vui lòng bắt đầu lại.");
          navigate("/");
          return;
        }
        if (errorData.errorCode === "INVALID_REQUEST") {
          alert("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.");
          return;
        }
        throw new Error(`Failed to update booking session: ${errorData.message || response.status}`);
      }

      const data = await response.json();
      dispatch(setSelectedProducts(selectedProducts));
      dispatch(setSeatData({
        ...seatData,
        originalProductsTotal: data.productsTotal,
        grandTotal: data.grandTotal,
      }));

      navigate(`/confirm/${seatData.sessionId}/${seatData.scheduleId}`, {
        state: {
          ...seatData,
          sessionId: data.sessionId,
          originalProductsTotal: data.productsTotal,
          grandTotal: data.grandTotal,
        },
      });
    } catch (error) {
      console.error("❌ Error updating booking session:", error);
      alert(`Lỗi khi cập nhật sản phẩm: ${error.message}. Vui lòng thử lại.`);
    }
  };

  if (!seatData) return null;

  return (
    <div className="products-wrapper">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="products-header">
        <h2>FOOD & DRINK</h2>
        <p className="products-subtitle">Enjoy the movie with our special combos</p>
      </div>

      <div className="product-list">
        {products.map((product) => {
          const imageSrc = product.image;

          return (
            <div key={product.productId} className="product-card">
              <div className="product-badge">{product.category}</div>
              <div className="product-image">
                <img
                  src={imageSrc}
                  alt={product.productName}
                />
              </div>

              <div className="product-info">
                <h3>{product.productName}</h3>
                <p className="product-price">
                  {Number(product.price).toLocaleString()} VND
                </p>

                <div className="quantity-controls">
                  <button
                    className="quantity-btn decrease"
                    onClick={() => decreaseQuantity(product.productId)}
                    disabled={!selectedQuantities[product.productId]}
                  >
                    −
                  </button>
                  <span className="quantity-display">
                    {selectedQuantities[product.productId] || 0}
                  </span>
                  <button
                    className="quantity-btn increase"
                    onClick={() => increaseQuantity(product.productId)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {getTotalQuantity() > 0 && (
        <div className="order-summary">
          <div className="summary-content">
            <div className="summary-info">
              <span className="summary-items">
                {getTotalQuantity()} Product
              </span>
              <span className="summary-total">
                {getTotalPrice().toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        className={`confirm-button ${getTotalQuantity() > 0 ? "active" : ""}`}
        onClick={handleConfirm}
      >
        {getTotalQuantity() > 0
          ? `Confirm (${getTotalQuantity()} product)`
          : "Skip & Continue"}
      </button>
    </div>
  );
};

export default Product;