import { useState } from "react";
import "./forgotPassword.scss";
import api from "../constants/axios";
import { message, Input, Button, Result } from "antd";
import { Link, useNavigate } from "react-router-dom";
const Steps = ({ current }) => {
  const steps = [
    { title: "Email", icon: "📧" },
    { title: "OTP", icon: "🔐" },
    { title: "Mật khẩu", icon: "🗝️" },
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSent = async () => {
    if (!email) {
      setErrors({ email: "Vui lòng nhập email" });
      message.error(errors);
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Email không hợp lệ" });
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
      // handle success, e.g. setCurrentStep(1);
    } catch {
      message.error("Lỗi khi gửi email!");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSent = async () => {
    if (!otp) {
      setErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }
    if (otp.length !== 6) {
      setErrors({ otp: "Mã OTP phải có 6 chữ số" });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await api.post(`/public/forgotPassword/verifyOtp/${otp}/${email}`);
      setCurrentStep(2);
    } catch {
      message.error("Lỗi khi gửi OTP");
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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
      message.error("Lỗi khi thay đổi mật khẩu");
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
        placeholder="Nhập địa chỉ email"
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
        placeholder="Nhập mã OTP"
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
      {/* Add resend OTP and error handling */}
    </div>
  );

  const renderResetPassword = () => (
    <div className="form-reset-password">
      <div className="reset-password-text">Enter new password:</div>
      <Input.Password
        type={showPassword ? "text" : "password"}
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        showToggle={true}
        onToggle={() => setShowPassword(!showPassword)}
        style={{ marginBottom: "15px" }}
      />
      <div className="reset-password-text">Confirm new password:</div>
      <Input.Password
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        showToggle={true}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
      />
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
        title="Successfully reset password"
        subTitle="Back to Login Page and login again!"
        extra={[
          <Button
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
                  ← Quay lại đăng nhập
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
