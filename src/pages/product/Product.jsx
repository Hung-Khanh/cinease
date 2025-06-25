import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import './Product.scss';

const Product = ({ apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api" }) => {
  const { movieId, invoiceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // ✅ Lấy dữ liệu từ SeatSelect truyền qua
  const seatData = location.state || null;

  // Nếu không có dữ liệu thì về lại
  useEffect(() => {
    if (!seatData) {
      alert("Không tìm thấy dữ liệu vé. Vui lòng quay lại chọn ghế.");
      navigate("/");
    }
  }, []);

  // Gọi API lấy danh sách combo bắp nước
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
  }, []);

  // Hàm tăng số lượng
  const increaseQuantity = (productId) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  // Hàm giảm số lượng
  const decreaseQuantity = (productId) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  // Hàm tạo URL hình ảnh từ tên sản phẩm hoặc category
  const getProductImage = (product) => {
    // Có thể thay đổi logic này dựa trên cấu trúc API của bạn
    if (product.imageUrl) {
      return `${apiUrl}${product.imageUrl}`;
    }
    
    // Fallback images dựa trên tên sản phẩm hoặc category
    const productName = product.productName?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    if (productName.includes('combo') || category.includes('combo')) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('bắp rang') || productName.includes('popcorn')) {
      return 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('nước') || productName.includes('drink') || category.includes('beverage')) {
      return 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('snack') || category.includes('snack')) {
      return 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop&crop=center';
    }
    
    // Default image
    return 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=400&h=300&fit=crop&crop=center';
  };

  const handleBack = () => {
  navigate(-1); 
};


  const handleConfirm = () => {
    if (!seatData) return;

    const selectedProducts = products
      .filter(p => selectedQuantities[p.productId] > 0)
      .map(p => ({
        productId: p.productId,
        name: p.productName,
        quantity: selectedQuantities[p.productId],
        price: p.price,
      }));

    // ✅ Chuyển sang trang xác nhận (Confirm)
    navigate(`/confirm/${seatData.scheduleId}`, {
      state: {
        ...seatData,
        selectedProducts,
      },
    });
  };

  // Tính tổng số lượng đã chọn
  const getTotalQuantity = () => {
    return Object.values(selectedQuantities).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  // Tính tổng tiền của sản phẩm đã chọn
  const getTotalPrice = () => {
    return products.reduce((total, product) => {
      const quantity = selectedQuantities[product.productId] || 0;
      return total + (quantity * product.price);
    }, 0);
  };

  if (!seatData) return null;

  return (
    <div className="products-wrapper">
     <button className="back-button" onClick={() => handleBack()}>
             <FaArrowLeft /> 
      </button>
      <div className="products-header">
        <h2>FOOD & DRINK</h2>
        <p className="products-subtitle">Enjoy the movie with our special combos</p>
      </div>

      <div className="product-list">
        {products.map((product) => (
          <div key={product.productId} className="product-card">
            <div className="product-badge">{product.category}</div>
            <div className="product-image">
              <img 
                src={getProductImage(product)} 
                alt={product.productName}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=400&h=300&fit=crop&crop=center';
                }}
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
        ))}
      </div>

      {getTotalQuantity() > 0 && (
        <div className="order-summary">
          <div className="summary-content">
            <div className="summary-info">
              <span className="summary-items">{getTotalQuantity()} Product</span>
              <span className="summary-total">{getTotalPrice().toLocaleString()} VND</span>
            </div>
          </div>
        </div>
      )}

      <button 
        className={`confirm-button ${getTotalQuantity() > 0 ? 'active' : ''}`}
        onClick={handleConfirm}
      >
        {getTotalQuantity() > 0 
          ? `Confirm (${getTotalQuantity()} product)` 
          : 'Skip & Continue'
        }
      </button>
    </div>
  );
};

export default Product;