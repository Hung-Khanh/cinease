import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./Product.scss";

const Product = ({
  apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api",
}) => {
  const { movieId, invoiceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const seatData = location.state || null;

  useEffect(() => {
    if (!seatData) {
      alert("Không tìm thấy dữ liệu vé. Vui lòng quay lại chọn ghế.");
      navigate("/");
    }
  }, [seatData, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
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

        if (!response.ok) throw new Error("Lỗi khi gọi API sản phẩm");
        const data = await response.json();

        setProducts(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("❌ Fetch products error:", error);
        alert("Không thể tải danh sách bắp nước.");
      }
    };
    fetchProducts();
  }, [apiUrl, navigate]);

  const increaseQuantity = (productId) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };
  const decreaseQuantity = (productId) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };
  const handleBack = () => navigate(-1);

  const handleConfirm = () => {
    if (!seatData) return;
    const selectedProducts = products
      .filter((p) => selectedQuantities[p.productId] > 0)
      .map((p) => ({
        productId: p.productId,
        name: p.productName,
        quantity: selectedQuantities[p.productId],
        price: p.price,
      }));

    navigate(`/confirm/${seatData.scheduleId}`, {
      state: { ...seatData, selectedProducts },
    });
  };
  const getTotalQuantity = () =>
    Object.values(selectedQuantities).reduce((sum, qty) => sum + (qty || 0), 0);

  const getTotalPrice = () =>
    products.reduce(
      (total, product) =>
        total + (selectedQuantities[product.productId] || 0) * product.price,
      0
    );

  if (!seatData) return null;

  return (
    <div className="products-wrapper">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="products-header">
        <h2>FOOD & DRINK</h2>
        <p className="products-subtitle">
          Enjoy the movie with our special combos
        </p>
      </div>

      <div className="product-list">
        {products.map((product) => {
          // ✅ API đã trả thẳng image dạng URL tuyệt đối
          const imageSrc = product.image;

          return (
            <div key={product.productId} className="product-card">
              <div className="product-badge">{product.category}</div>
              <div className="product-image">
                <img src={imageSrc} alt={product.productName} />
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
