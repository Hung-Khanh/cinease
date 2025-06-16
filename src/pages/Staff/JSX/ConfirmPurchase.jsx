import React, { useEffect, useState } from "react";
import { QRCode, Space } from "antd";
import "../SCSS/ConfirmPurchase.scss";

const ConfirmPurchase = () => {
  // Lấy paymentUrl từ localStorage (bạn nên lưu với key không có dấu cách)

  const [paymentUrl, setPaymentUrl] = useState("");

  useEffect(() => {
    const url = localStorage.getItem("paymentUrl");
    setPaymentUrl(url || "");
    console.log(localStorage.getItem("paymentUrl"));
  }, []);
  const handleRefresh = () => {
    window.location.reload(); // Làm mới trang
  };

  return (
    <div className="confirm-purchase-wrapper">
      <div>
        <h1>PURCHASE HERE:</h1>
      </div>
      <div>
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
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
