import React, { useState, useEffect } from "react";
import axios from "axios";

// API configuration
const baseUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
const config = {
  baseURL: baseUrl,
};
const api = axios.create(config);

const handleBefore = (config) => {
  const token = sessionStorage.getItem("userToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore);

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Step 1: Send Email
  const handleSendEmail = async () => {
    if (!email) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/forgot-password", { email });

      setLoading(false);
      setCurrentStep(1);
      setCountdown(60);
      console.log("Email sent successfully:", response.data);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors({ email: error.response.data.message });
      } else {
        setErrors({ email: "Có lỗi xảy ra. Vui lòng thử lại sau." });
      }
      console.error("Send email error:", error);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
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
      const response = await api.post("/verify-otp", {
        email,
        otp,
      });

      setLoading(false);
      setCurrentStep(2);
      console.log("OTP verified successfully:", response.data);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors({ otp: error.response.data.message });
      } else {
        setErrors({ otp: "Mã OTP không chính xác hoặc đã hết hạn" });
      }
      console.error("Verify OTP error:", error);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/reset-password", {
        email,
        otp,
        password,
        confirmPassword,
      });

      setLoading(false);
      setCurrentStep(3);
      console.log("Password reset successfully:", response.data);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors({ password: error.response.data.message });
      } else {
        setErrors({
          password: "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.",
        });
      }
      console.error("Reset password error:", error);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      await api.post("/resend-otp", { email });
      setCountdown(60);
      console.log("OTP resent to:", email);
    } catch (error) {
      console.error("Resend OTP error:", error);
      // Optionally show error message to user
    }
  };

  // Back to login
  const handleBackToLogin = () => {
    setCurrentStep(0);
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setCountdown(0);
    console.log("Back to login");
  };

  // Steps component
  const Steps = ({ current }) => {
    const steps = [
      { title: "Email", icon: "📧" },
      { title: "OTP", icon: "🔐" },
      { title: "Mật khẩu", icon: "🗝️" },
    ];

    return (
      <div className="steps-container">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index <= current ? "active" : ""}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-title">{step.title}</div>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </div>
        ))}
      </div>
    );
  };

  // Input component
  const Input = ({
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    icon,
    showToggle,
    onToggle,
    maxLength,
  }) => (
    <div className="input-container">
      <div className={`input-wrapper ${error ? "error" : ""}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className="input-field"
        />
        {showToggle && (
          <button type="button" className="toggle-button" onClick={onToggle}>
            {type === "password" ? "👁️" : "🙈"}
          </button>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  // Button component
  const Button = ({
    children,
    onClick,
    loading,
    variant = "primary",
    size = "large",
    style = {},
  }) => (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={loading}
      style={style}
    >
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Đang xử lý...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );

  // Alert component
  const Alert = ({ message, type = "info" }) => (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">ℹ️</span>
      <span>{message}</span>
    </div>
  );

  // Render Step 1: Email Input
  const renderEmailStep = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon-large">📧</div>
        <h2>Quên mật khẩu?</h2>
        <p>Nhập email để nhận mã xác thực</p>
      </div>

      <div className="form-section">
        <Input
          type="email"
          placeholder="Nhập địa chỉ email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon="✉️"
        />

        <Button
          onClick={handleSendEmail}
          loading={loading}
          style={{ background: "linear-gradient(135deg, #1890ff, #722ed1)" }}
        >
          {loading ? "Đang gửi..." : "Gửi mã xác thực"}
        </Button>
      </div>
    </div>
  );

  // Render Step 2: OTP Verification
  const renderOtpStep = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon-large">🔐</div>
        <h2>Xác thực OTP</h2>
        <p>
          Mã xác thực đã được gửi đến <strong>{email}</strong>
        </p>
      </div>

      <div className="form-section">
        <Input
          placeholder="Nhập mã OTP (6 chữ số)"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          error={errors.otp}
          maxLength={6}
        />

        <Button
          onClick={handleVerifyOtp}
          loading={loading}
          style={{ background: "linear-gradient(135deg, #52c41a, #389e0d)" }}
        >
          {loading ? "Đang xác thực..." : "Xác thực OTP"}
        </Button>

        <div className="resend-section">
          {countdown > 0 ? (
            <span className="countdown-text">Gửi lại mã sau {countdown}s</span>
          ) : (
            <button className="link-button" onClick={handleResendOtp}>
              Gửi lại mã OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Render Step 3: Password Reset
  const renderPasswordStep = () => (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon-large">🗝️</div>
        <h2>Đặt mật khẩu mới</h2>
        <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <div className="form-section">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon="🔒"
          showToggle={true}
          onToggle={() => setShowPassword(!showPassword)}
        />

        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          icon="🔒"
          showToggle={true}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <Button
          onClick={handleResetPassword}
          loading={loading}
          style={{ background: "linear-gradient(135deg, #722ed1, #eb2f96)" }}
        >
          {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </Button>
      </div>
    </div>
  );

  // Render Success Step
  const renderSuccessStep = () => (
    <div className="step-content success-content">
      <div className="success-icon">✅</div>
      <h2>Đặt lại mật khẩu thành công!</h2>
      <p>
        Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu
        mới.
      </p>
      <Button
        onClick={handleBackToLogin}
        style={{ background: "linear-gradient(135deg, #1890ff, #722ed1)" }}
      >
        Đăng nhập ngay
      </Button>
    </div>
  );

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          {currentStep < 3 && (
            <>
              <Steps current={currentStep} />
              <div className="divider"></div>
            </>
          )}

          {currentStep === 0 && renderEmailStep()}
          {currentStep === 1 && renderOtpStep()}
          {currentStep === 2 && renderPasswordStep()}
          {currentStep === 3 && renderSuccessStep()}

          {currentStep > 0 && currentStep < 3 && (
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

      <style jsx>{`
        .forgot-password-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .forgot-password-wrapper {
          width: 100%;
          max-width: 450px;
        }

        .forgot-password-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          padding: 32px;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          position: relative;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-bottom: 8px;
          transition: all 0.3s;
        }

        .step.active .step-icon {
          background: #1890ff;
          color: white;
        }

        .step-title {
          font-size: 12px;
          color: #8c8c8c;
          font-weight: 500;
        }

        .step.active .step-title {
          color: #1890ff;
        }

        .step-line {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #f0f0f0;
          z-index: -1;
        }

        .step.active .step-line {
          background: #1890ff;
        }

        .divider {
          height: 1px;
          background: #f0f0f0;
          margin: 0 0 32px 0;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .step-header {
          text-align: center;
        }

        .step-icon-large {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .step-header h2 {
          margin: 0 0 8px 0;
          color: #262626;
          font-size: 24px;
          font-weight: 600;
        }

        .step-header p {
          margin: 0;
          color: #8c8c8c;
          font-size: 16px;
          line-height: 1.6;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 2px solid #f0f0f0;
          border-radius: 8px;
          background: white;
          transition: all 0.3s;
        }

        .input-wrapper:focus-within {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .input-wrapper.error {
          border-color: #ff4d4f;
        }

        .input-icon {
          padding: 0 12px;
          color: #8c8c8c;
        }

        .input-field {
          flex: 1;
          border: none;
          outline: none;
          padding: 14px 16px;
          font-size: 16px;
          background: transparent;
        }

        .input-field::placeholder {
          color: #bfbfbf;
        }

        .toggle-button {
          background: none;
          border: none;
          padding: 0 12px;
          cursor: pointer;
          font-size: 16px;
        }

        .error-message {
          color: #ff4d4f;
          font-size: 14px;
          margin-top: 4px;
        }

        .btn {
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .btn-large {
          padding: 14px 24px;
          width: 100%;
        }

        .btn-primary {
          background: #1890ff;
          color: white;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .alert-info {
          background: #e6f7ff;
          border: 1px solid #91d5ff;
          color: #0050b3;
        }

        .alert-icon {
          font-size: 16px;
        }

        .resend-section {
          text-align: center;
        }

        .countdown-text {
          color: #8c8c8c;
          font-size: 14px;
        }

        .link-button {
          background: none;
          border: none;
          color: #1890ff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-decoration: underline;
        }

        .link-button:hover {
          color: #40a9ff;
        }

        .back-section {
          text-align: center;
          padding-top: 16px;
        }

        .success-content {
          text-align: center;
          padding: 20px 0;
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .success-content h2 {
          color: #262626;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .success-content p {
          color: #8c8c8c;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        @media (max-width: 480px) {
          .forgot-password-container {
            padding: 16px;
          }

          .forgot-password-card {
            padding: 24px;
          }

          .step-header h2 {
            font-size: 20px;
          }

          .step-header p {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
