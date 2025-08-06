"use client";

import { useState } from "react";
import "./forgotPassword.scss";
import api from "../constants/axios";
import { message, Input, Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import CustomPasswordInput from "../component/CustomPasswordInput/customPasswordInput";

const Steps = ({ current }) => {
  const steps = [
    { title: "Email", icon: "📧" },
    { title: "OTP", icon: "🔐" },
    { title: "Password", icon: "🗝️" },
  ];

  return (
    <div className="steps">
      {steps.map((step, idx) => (
        <div
          key={step.title}
          className={`step${current === idx ? " active" : ""}`}
        >
          <span className="icon">{step.icon}</span>
          <span className="title">{step.title}</span>
          {idx < steps.length - 1 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleEmailSent = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email" });
      message.error("Please enter your email");
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Invalid email address" });
      message.error("Invalid email address");
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post(
        `/public/forgotPassword/verifyMail/${email}`,
        {},
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setCurrentStep(1);
    } catch {
      message.error("Error sending email!");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSent = async () => {
    if (!otp) {
      setErrors({ otp: "Please enter the OTP code" });
      message.error("Please enter the OTP code");
      return;
    }
    if (otp.length !== 6) {
      setErrors({ otp: "OTP code must be 6 digits" });
      message.error("OTP code must be 6 digits");
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post(`/public/forgotPassword/verifyOtp/${otp}/${email}`);
      setCurrentStep(2);
    } catch {
      message.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Please enter a new password";
      message.error("Please enter a new password");
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      message.error("Please confirm your password");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      message.error("Passwords do not match");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post(`/public/forgotPassword/changePassword/${email}`, {
        password: password,
        repeatPassword: confirmPassword,
      });
      setCurrentStep(3);
    } catch {
      message.error("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const renderEmailStep = () => (
    <div className="form-mail">
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        status={errors.email ? "error" : ""}
      />
      <Button
        onClick={handleEmailSent}
        loading={loading}
        style={{
          background: "#0C9550",
          hover: "#044824",
          marginTop: "15px",
          marginBottom: "15px",
        }}
      >
        {loading ? "Sending..." : "Send Email"}
      </Button>
    </div>
  );

  const renderOTPStep = () => (
    <div className="form-otp">
      <Input.OTP
        length={6}
        formatter={(str) => str.toUpperCase()}
        placeholder="Enter OTP code"
        value={otp}
        onChange={(value) => setOtp(value)}
        error={errors.otp ? "error" : ""}
      />
      <br />
      <Button
        onClick={handleOTPSent}
        loading={loading}
        style={{
          background: "#0C9550",
          hover: "#044824",
          marginTop: "15px",
          marginBottom: "15px",
        }}
      >
        {loading ? "Sending..." : "Send OTP"}
      </Button>
    </div>
  );

  const renderResetPassword = () => (
    <div className="form-reset-password">
      <div className="reset-password-text">Enter new password:</div>
      <CustomPasswordInput
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hasError={!!errors.password}
        style={{ marginBottom: "15px" }}
      />
      {errors.password && (
        <div className="error-message">{errors.password}</div>
      )}

      <div className="reset-password-text">Confirm new password:</div>
      <CustomPasswordInput
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        hasError={!!errors.confirmPassword}
      />
      {errors.confirmPassword && (
        <div className="error-message">{errors.confirmPassword}</div>
      )}

      <Button
        onClick={handleChangePassword}
        loading={loading}
        style={{
          background: "#0C9550",
          hover: "#044824",
          marginTop: "16px",
          marginBottom: "15px",
        }}
      >
        {loading ? "Sending..." : "Change password"}
      </Button>
    </div>
  );

  const renderSuccess = () => (
    <div className="form-success">
      <Result
        status="success"
        title="Password reset successfully"
        subTitle="Go back to the Login Page and log in again!"
        extra={[
          <Button
            key="submit"
            onClick={handleBackToLogin}
            style={{
              background: "#0C9550 !important",
              hover: "#044824 !important",
              marginTop: "10px",
            }}
          >
            Back to home page
          </Button>,
        ]}
      />
    </div>
  );

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="forgot-password">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          {currentStep < 3 && (
            <>
              <Steps current={currentStep} />
              <div className="divider"></div>
            </>
          )}
          {currentStep === 0 && renderEmailStep()}
          {currentStep === 1 && renderOTPStep()}
          {currentStep === 2 && renderResetPassword()}
          {currentStep === 3 && renderSuccess()}
          {currentStep > -1 && currentStep < 3 && (
            <>
              <div className="divider"></div>
              <div className="back-section">
                <button className="link-button" onClick={handleBackToLogin}>
                  ← Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
