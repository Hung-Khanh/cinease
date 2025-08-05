"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  message,
  Alert,
} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import "./Login.scss";
import logo from "../../assets/logo.png";
import { useAuth } from "../../constants/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { Title, Text } = Typography;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    identityCard: "",
    phoneNumber: "",
    address: "",
  });
  const [error, setError] = useState(""); // Lỗi từ server (chỉ cho form đăng ký)
  const [errors, setErrors] = useState({
    login: { username: false, password: false },
    register: {
      username: false,
      email: false,
      password: false,
      repeatPassword: false,
      fullName: false,
      dateOfBirth: false,
      gender: false,
      identityCard: false,
      phoneNumber: false,
      address: false,
    },
  }); // Lỗi validation cho từng trường

  const toggleForm = () => {
    setIsRegister(!isRegister);
    setError("");
    setErrors({
      login: { username: false, password: false },
      register: {
        username: false,
        email: false,
        password: false,
        repeatPassword: false,
        fullName: false,
        dob: false,
        sex: false,
        cardNumber: false,
        phone: false,
        address: false,
      },
    }); // Reset lỗi khi chuyển form
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Xóa lỗi của trường khi người dùng nhập
    setErrors((prevErrors) => ({
      ...prevErrors,
      login: {
        ...prevErrors.login,
        [name]: false,
      },
    }));
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Xóa lỗi của trường khi người dùng nhập
    setErrors((prevErrors) => ({
      ...prevErrors,
      register: {
        ...prevErrors.register,
        [name]: false,
      },
    }));
  };

  const handleLoginSubmit = async (values) => {
    setLoading(true);
    setErrors((prevErrors) => ({
      ...prevErrors,
      login: { username: false, password: false },
    }));

    // Kiểm tra validation thủ công
    const newErrors = { username: false, password: false };
    if (!values.username) newErrors.username = true;
    if (!values.password) newErrors.password = true;

    if (newErrors.username || newErrors.password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        login: newErrors,
      }));
      setLoading(false);
      return; // Ngăn gửi request nếu có lỗi
    }

    try {
      const response = await fetch(`${apiUrl}/public/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(values),
      });

      let result;
      if (!response.ok) {
        // Cố gắng lấy message từ body nếu có
        let msg;
        try {
          const errorData = await response.json();
          msg = errorData?.message || `HTTP error! status: ${response.status}`;
        } catch (e) {
          msg = `HTTP error! status: ${response.status}`;
        }
        message.error(`Login failed: ${msg}`);
        setLoading(false);
        return;
      }

      result = await response.json();
      console.log("🔐 Login successful, role:", result.role);
      message.success("Login successful!");

      // Lưu tạm token để gọi API lấy profile
      localStorage.setItem(
        "user",
        JSON.stringify({ token: result.token, role: result.role })
      );

      // Gọi API lấy thông tin user đầy đủ
      try {
        const profileRes = await fetch(
          "https://legally-actual-mollusk.ngrok-free.app/api/member/account",
          {
            headers: {
              Authorization: `Bearer ${result.token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...profileData,
              token: result.token,
              role: result.role,
            })
          );
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      }

      login({
        token: result.token,
        role: result.role,
      });

      // Set login success flag for curtain animation (only for regular users going to home)
      if (result.role !== "ADMIN" && result.role !== "EMPLOYEE") {
        console.log("🎭 Setting loginSuccess flag for curtain animation");
        localStorage.setItem("loginSuccess", "true");
      } else {
        console.log("👨‍💼 Admin/Employee login - no curtain needed");
      }

      // Navigate based on role with slight delay for message to show
      setTimeout(() => {
        if (result.role === "ADMIN") {
          console.log("🔧 Navigating to admin dashboard");
          navigate("/admin/dashboard");
        } else if (result.role === "EMPLOYEE") {
          console.log("👨‍💼 Navigating to staff homepage");
          navigate("/staffHomePage");
        } else {
          console.log("🏠 Navigating to home with curtain");
          navigate("/"); // This will trigger the curtain animation
        }
      }, 500);
    } catch (error) {
      console.error("Error during login:", error.message);
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (values) => {
    setLoading(true);
    setError("");
    setErrors((prevErrors) => ({
      ...prevErrors,
      register: {
        username: false,
        email: false,
        password: false,
        repeatPassword: false,
        fullName: false,
        dob: false,
        sex: false,
        cardNumber: false,
        phone: false,
        address: false,
      },
    }));

    // Kiểm tra validation thủ công
    const newErrors = {};
    if (!values.username) newErrors.username = true;
    if (!values.email) newErrors.email = true;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      newErrors.email = true;
    if (!values.password) newErrors.password = true;
    if (!values.repeatPassword) newErrors.repeatPassword = true;
    else if (values.password !== values.repeatPassword)
      newErrors.repeatPassword = true;
    if (!values.fullName) newErrors.fullName = true;
    if (!values.dateOfBirth) newErrors.dateOfBirth = true;
    if (!values.gender) newErrors.gender = true;
    if (!values.identityCard) newErrors.identityCard = true;
    if (!values.phoneNumber) newErrors.phoneNumber = true;
    else if (!/^\d{10,}$/.test(values.phoneNumber))
      newErrors.phoneNumber = true;
    if (!values.address) newErrors.address = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        register: newErrors,
      }));
      setLoading(false);
      return; // Ngăn gửi request nếu có lỗi
    }

    try {
      const response = await fetch(`${apiUrl}/public/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success("Registration successful!");
      console.log("Register response:", result);
      setIsRegister(false);
    } catch (error) {
      console.error("Error during registration:", error.message);
      setError(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`container ${isRegister ? "active" : ""}`}>
        {/* Login Form Section */}
        <div className="form-container login-form-section">
          <Form
            name="login_form"
            onFinish={handleLoginSubmit}
            className="login-form"
            initialValues={loginData}
          >
            <Title level={2} className="login-title">
              Login to your account
            </Title>
            <Form.Item
              label="Username"
              name="username"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="login-username"
                status={errors.login.username ? "error" : ""}
                placeholder={
                  errors.login.username
                    ? "Please input your username!"
                    : "Enter username"
                }
                name="username"
                value={loginData.username}
                onChange={handleLoginInputChange}
                className={errors.login.username ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.Password
                data-testid="login-password"
                status={errors.login.password ? "error" : ""}
                placeholder={
                  errors.login.password
                    ? "Please input your password!"
                    : "Enter password"
                }
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className={errors.login.password ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-button"
                loading={loading}
              >
                Login now
              </Button>
            </Form.Item>
            <div className="reset-password">
              <Text className="forgot-text">
                Forgot password? <Link to="/forgotPassword">Reset Here</Link>
              </Text>
            </div>
          </Form>
        </div>

        {/* Register Form Section */}
        <div className="form-container register-form-section">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form
            name="register_form"
            onFinish={(values) => {
              // Merge values with registerData to ensure all fields are present
              handleRegisterSubmit({ ...registerData, ...values });
            }}
            className="register-form compact"
            initialValues={registerData}
          >
            <Title level={3} className="register-title">
              Create your account
            </Title>
            <Form.Item
              label="Username"
              name="username"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="register-username"
                status={errors.register.username ? "error" : ""}
                placeholder={
                  errors.register.username
                    ? "Please input your username!"
                    : "Enter username"
                }
                name="username"
                value={registerData.username}
                onChange={handleRegisterInputChange}
                size="small"
                className={errors.register.username ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              required={true}
              className="password-section-wrapper"
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="password" style={{ marginBottom: 0 }}>
                    <Input.Password
                      data-testid="register-password"
                      status={errors.register.password ? "error" : ""}
                      placeholder={
                        errors.register.password
                          ? "Please input your password!"
                          : "Enter password"
                      }
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      size="small"
                      className={errors.register.password ? "error-input" : ""}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="repeatPassword" style={{ marginBottom: 0 }}>
                    <Input.Password
                      data-testid="register-repeat-password"
                      status={errors.register.repeatPassword ? "error" : ""}
                      placeholder={
                        errors.register.repeatPassword
                          ? registerData.password && registerData.repeatPassword
                            ? "Passwords do not match!"
                            : "Please confirm your password!"
                          : "Confirm password"
                      }
                      name="repeatPassword"
                      value={registerData.repeatPassword}
                      onChange={handleRegisterInputChange}
                      size="small"
                      className={
                        errors.register.repeatPassword ? "error-input" : ""
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
            <Form.Item
              label="Full Name"
              name="fullName"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="register-fullname"
                status={errors.register.fullName ? "error" : ""}
                placeholder={
                  errors.register.fullName
                    ? "Please enter your full name!"
                    : "Enter your full name"
                }
                name="fullName"
                value={registerData.fullName}
                onChange={handleRegisterInputChange}
                size="small"
                className={errors.register.fullName ? "error-input" : ""}
              />
            </Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  label="Date of Birth"
                  name="dateOfBirth"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Input
                    data-testid="register-dateOfBirth"
                    type="date"
                    status={errors.register.dateOfBirth ? "error" : ""}
                    placeholder={
                      errors.register.dateOfBirth
                        ? "Please select your date of birth!"
                        : "Select date of birth"
                    }
                    name="dateOfBirth"
                    value={registerData.dateOfBirth}
                    onChange={handleRegisterInputChange}
                    size="medium"
                    className={errors.register.dateOfBirth ? "error-input" : ""}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Sex"
                  name="gender"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Select
                    data-testid="register-gender"
                    status={errors.register.gender ? "error" : ""}
                    placeholder={
                      errors.register.gender
                        ? "Please select your sex!"
                        : "Select sex"
                    }
                    size="medium"
                    style={{ width: "100%" }}
                    className={errors.register.gender ? "error-input" : ""}
                  >
                    <Select.Option value="MALE">Male</Select.Option>
                    <Select.Option value="FEMALE">Female</Select.Option>
                    <Select.Option value="OTHER">Other</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Email"
              name="email"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="register-email"
                status={errors.register.email ? "error" : ""}
                placeholder={
                  errors.register.email
                    ? registerData.email
                      ? "Please enter a valid email!"
                      : "Please input your email!"
                    : "Enter email"
                }
                name="email"
                value={registerData.email}
                onChange={handleRegisterInputChange}
                size="small"
                className={errors.register.email ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Identity Card"
              name="identityCard"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="register-identityCard"
                status={errors.register.identityCard ? "error" : ""}
                placeholder={
                  errors.register.identityCard
                    ? "Please input your Identity Card Number!"
                    : "Enter Identity Card Number"
                }
                name="identityCard"
                value={registerData.identityCard}
                onChange={handleRegisterInputChange}
                size="small"
                className={errors.register.identityCard ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="register-phoneNumber"
                status={errors.register.phoneNumber ? "error" : ""}
                placeholder={
                  errors.register.phoneNumber
                    ? registerData.phoneNumber
                      ? "Please enter a valid phone number!"
                      : "Please input your Phone Number!"
                    : "Enter Your Phone Number"
                }
                name="phoneNumber"
                value={registerData.phoneNumber}
                onChange={handleRegisterInputChange}
                size="small"
                className={errors.register.phoneNumber ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                data-testid="register-address"
                status={errors.register.address ? "error" : ""}
                placeholder={
                  errors.register.address
                    ? "Please input your Address!"
                    : "Enter Your Address"
                }
                name="address"
                value={registerData.address}
                onChange={handleRegisterInputChange}
                size="small"
                className={errors.register.address ? "error-input" : ""}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="register-button compact"
                loading={loading}
                size="medium"
              >
                Register now
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <div className="logo-container">
                <img
                  src={logo || "/placeholder.svg"}
                  alt="Cinease Logo"
                  className="logo"
                  onClick={() => navigate("/")}
                />
              </div>
              <div className="register-section">
                <Text className="register-text">Already have an account?</Text>
                <Button
                  type="primary"
                  className="register-button"
                  id="register"
                  onClick={toggleForm}
                >
                  LOGIN HERE
                </Button>
              </div>
            </div>
            <div className="toggle-panel toggle-right">
              <div className="logo-container">
                <img
                  src={logo || "/placeholder.svg"}
                  alt="Cinease Logo"
                  className="logo"
                  onClick={() => navigate("/")}
                />
              </div>
              <div className="register-section">
                <Text className="register-text">Don't have an account?</Text>
                <Button
                  type="primary"
                  className="login-button"
                  id="login"
                  onClick={toggleForm}
                >
                  Register Here
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
