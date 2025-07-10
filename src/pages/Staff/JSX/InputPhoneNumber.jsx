import React, { useState } from "react";
import "../SCSS/phoneNum.scss";
import { Button, Modal } from "antd";
import { FaArrowLeft } from "react-icons/fa";
import { TiPhone } from "react-icons/ti";
import { useNavigate, useParams } from "react-router-dom";
import { checkMember } from "../../../api/staff";

const PhoneInput = ({ onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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
      const response = await checkMember(invoiceId, phoneNumber);
      setMemberData(response.data);
      setIsModalVisible(true);
      localStorage.setItem("memberData", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error in handleInputPhoneNumber:", error);
    }
  };
  const handleNextPage = () => {
    setIsModalVisible(false);
    navigate(`/ticketInformation/${invoiceId}/${scheduleId}`, {
      state: memberData,
    });
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
    // Loại bỏ các ký tự không phải số
    const cleaned = number.replace(/\D/g, "");

    // Kiểm tra độ dài số
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7)
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(
      7,
      10
    )}`;
  };
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  const handleSkip = () => {
    navigate(`/ticketInformation/${invoiceId}/${scheduleId}`);
  };
  return (
    <div className="phone-page">
      <button className="dts-back-btn" onClick={handleBack}>
        <FaArrowLeft />
      </button>
      <div className="phone-container">
        <h1 className="phone-title">Enter your phone number</h1>

        <div className="phone-display">
          <div className="input-container">
            <input
              type="text"
              className="phone-input"
              value={formatPhoneNumber(phoneNumber)}
              placeholder="Your phone number"
              readOnly
            />
            <TiPhone className="phone-icon" />
          </div>
          <div className="phone-length">{phoneNumber.length}/11 number</div>
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
        <div className="phone-skip-button">
          <h2 className="phone-skip-text">No Member Phone?</h2>
          <Button
            className="phone-skip-butt"
            type="primary"
            block
            size="large"
            onClick={handleSkip}
          >
            Skip
          </Button>
        </div>
      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        title="Confirm your information"
        footer={null}
      >
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
        <div className="out-button">
          <Button
            className="modal-button"
            size="large"
            block
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PhoneInput;
