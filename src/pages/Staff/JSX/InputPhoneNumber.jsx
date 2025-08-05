"use client";

import { useState } from "react";
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
    if (phoneNumber.length !== 10) {
      setMessage("Số điện thoại phải có đúng 10 chữ số");
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
    if (phoneNumber.length < 10) {
      setPhoneNumber((prev) => prev + number);
      setMessage("");
    }
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
    setMessage("");
  };

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
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
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <button className="phone-back-btn" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="phone-container">
        <h1 className="phone-title">Enter Your Phone Number</h1>

        <div className="phone-display">
          <div className="input-container">
            <TiPhone className="phone-icon" />
            <input
              type="text"
              className="phone-input"
              value={formatPhoneNumber(phoneNumber)}
              placeholder="Your phone number"
              readOnly
            />
          </div>
          <div className="phone-length">{phoneNumber.length}/10 digits</div>
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
            <span>DEL</span>
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
            <span>SUBMIT</span>
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

        <div className="phone-skip-section">
          <h3 className="phone-skip-text">No Member Phone?</h3>
          <Button
            className="phone-skip-button"
            type="primary"
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
        title="Confirm Member Information"
        footer={null}
        className="phone-modal"
      >
        <div className="member-info">
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{memberData?.memberPhone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{memberData?.memberName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Available Points:</span>
            <span className="info-value">{memberData?.availableScore}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Estimated Earned:</span>
            <span className="info-value">
              {memberData?.estimatedEarnedScore}
            </span>
          </div>
        </div>
        <div className="modal-actions">
          <Button
            className="modal-next-button"
            size="large"
            block
            onClick={handleNextPage}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PhoneInput;
