import React, { useEffect, useState } from "react";
import { QRCode, Space } from "antd";
import "../SCSS/ConfirmPurchase.scss";

const ConfirmPurchase = () => {
  // Lấy paymentUrl từ sessionStorage (bạn nên lưu với key không có dấu cách)

  const [paymentUrl, setPaymentUrl] = useState("");
  const grandTotal = sessionStorage.getItem("grandTotal");

  useEffect(() => {
    const url = sessionStorage.getItem("paymentUrl");
    setPaymentUrl(url || "");
    console.log(sessionStorage.getItem("paymentUrl"));
  }, []);
  const handleRefresh = () => {
    window.location.reload(); // Làm mới trang
  };

  return (
    <div className="confirm-purchase-wrapper">
      <div>
        <h1>PURCHASE HERE:</h1>
      </div>
      <div className="grand-total">
        <h2>TOTAL: {grandTotal || "0"} VND</h2>
      </div>
      <div className="qr-code-container">
        <Space
          direction="vertical"
          align="center"
          style={{ width: "100%", marginBottom: "20px" }}
        >
          <div className="qr-box">
            <QRCode value={paymentUrl || "-"} />
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
