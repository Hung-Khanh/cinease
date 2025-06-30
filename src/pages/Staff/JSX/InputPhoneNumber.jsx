import React, { useState } from "react";
import "../SCSS/phoneNum.scss";
import { Button, Modal } from "antd";
import { TiPhone } from "react-icons/ti";
import api from "../../../constants/axios";
import { useNavigate, useParams } from "react-router-dom";

const PhoneInput = ({ apiUrl }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const token = localStorage.getItem("token");
  const { invoiceId, scheduleId } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const navigate = useNavigate();

  const handleInputPhoneNumber = async () => {
    if (phoneNumber.length === 0) {
      setMessage("Vui lòng nhập số điện thoại");
      setMessageType("error");
      return;
    }

    if (phoneNumber.length < 10) {
      setMessage("Số điện thoại phải có ít nhất 10 chữ số");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/employee/bookings/check-member`, {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          phoneNumber: phoneNumber,
        }),
      });
      console.log("Invoice ID:", invoiceId);

      if (response.status === 200) {
        const data = await response.json();
        setMemberData(data);
        console.log("Response data:", data);
        setIsModalVisible(true);
      } else {
        setMessage("Đã xảy ra lỗi khi kiểm tra số điện thoại.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error in handleInputPhoneNumber:", error);
    }
  };
  const handleNextPage = () => {
    setIsModalVisible(false);
    navigate(`/ticketInformation/${invoiceId}/${scheduleId}`);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleNumberClick = (number) => {
    if (phoneNumber.length < 11) {
      setPhoneNumber((prev) => prev + number);
      setMessage("");
    }
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
    setMessage("");
  };

  const formatPhoneNumber = (number) => {
    if (number.length <= 3) return number;
    if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
    if (number.length <= 9)
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(
      6,
      9
    )} ${number.slice(9)}`;
  };

  return (
    <div className="phone-page">
      <div className="phone-container">
        <h1 className="phone-title">Nhập số điện thoại</h1>

        <div className="phone-display">
          <div className="input-container">
            <input
              type="text"
              className="phone-input"
              value={formatPhoneNumber(phoneNumber)}
              placeholder="Số điện thoại của bạn"
              readOnly
            />
            <TiPhone className="phone-icon" />
          </div>
          <div className="phone-length">{phoneNumber.length}/11 chữ số</div>
        </div>

        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              className="key-button number"
              onClick={() => handleNumberClick(number.toString())}
            >
              {number}
            </button>
          ))}
          <button className="key-button delete" onClick={handleDelete}>
            DEL
          </button>
          <button
            className="key-button number"
            onClick={() => handleNumberClick("0")}
          >
            0
          </button>
          <button
            className="key-button submit"
            onClick={handleInputPhoneNumber}
          >
            SUBMIT
          </button>
        </div>

        {message && (
          <div
            className={`message ${
              messageType === "error" ? "error-message" : "success-message"
            }`}
          >
            {message}
          </div>
        )}
      </div>
      <Modal open={isModalVisible} onCancel={handleCancel} footer={null}>
        <p>
          <strong>Phone:</strong>
          {""}
          {memberData?.memberPhone}
        </p>
        <p>
          <strong>Name:</strong>
          {""}
          {memberData?.memberName}
        </p>
        <p>
          <strong>Điểm tích lũy:</strong>
          {""}
          {memberData?.availableScore}
        </p>
        <p>
          <strong>Thêm điểm:</strong>
          {""}
          {memberData?.estimatedEarnedScore}
        </p>
        <div className="modal-button">
          <Button type="primary" size="large" block onClick={handleNextPage}>
            Next
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PhoneInput;
