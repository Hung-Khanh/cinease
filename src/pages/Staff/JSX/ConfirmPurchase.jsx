import { QRCode, Space } from "antd";
import "../SCSS/ConfirmPurchase.scss";
import { useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ConfirmPurchase = ({ onBack }) => {
  // Lấy paymentUrl từ localStorage (bạn nên lưu với key không có dấu cách)
  const location = useLocation();
  const PaymentData = location.state;
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload(); // Làm mới trang
  };
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  return (
    <div className="confirm-purchase-wrapper">
      <button className="confirm-back-btn" onClick={handleBack}>
        <FaArrowLeft />
      </button>
      <div>
        <h1>PURCHASE HERE:</h1>
      </div>
      <div className="grand-total">
        <h2>TOTAL: {PaymentData.totalPrice || "0"} VND</h2>
      </div>
      <div className="qr-code-container">
        <Space
          direction="vertical"
          align="center"
          style={{ width: "100%", marginBottom: "20px" }}
        >
          <div className="qr-box">
            <QRCode value={PaymentData?.paymentUrl || "-"} />
          </div>
        </Space>
        <button onClick={handleRefresh} className="refresh-button">
          CHECK PURCHASE
        </button>
      </div>
    </div>
  );
};

export default ConfirmPurchase;
