import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  message,
} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import "./Login.scss";
import logo from "../../assets/Logo.png";
import { useAuth } from "../../constants/AuthContext"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    fullName: "",
    dob: "",
    sex: "",
    cardNumber: "",
    phone: "",
    address: "",
  });

  const toggleForm = () => {
    console.log("Toggling form, current isRegister:", isRegister);
    setIsRegister(!isRegister);
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (values) => {
    setLoading(true);
    try {
      console.log(
        "Sending login request to:",
        `${apiUrl}/public/login`,
        values
      );
      const response = await fetch(`${apiUrl}/public/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(values),
      });
      console.log("Response details:", {
        status: response.status,
        url: response.url,
        data: response,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      message.success("Login successful!");

      login({
        token: result.token,
        role: result.role,
      });
      if (result.role === "ADMIN") {
        console.log(result.role);
        navigate("/admin");
      } else if (result.role === "EMPLOYEE") {
        console.log(result.role);
        navigate("/staffHomePage");
      } else {
        console.log(result.role);
        navigate("/userHP");
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      message.error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (values) => {
    setLoading(true);
    setError(""); // Reset error trước khi gửi request
    try {
      console.log(
        "Sending register request to:",
        `${apiUrl}/public/register`,
        values
      );
      const response = await fetch(`${apiUrl}/public/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(values),
      });
      console.log("Response details:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      message.success("Registration successful!");
      console.log("Register response:", result);
    } catch (error) {
      console.error("Error during registration:", error.message);
      setError(`Registration failed: ${error.message}`); // Set lỗi vào state
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
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                placeholder="Enter username"
                name="username"
                value={loginData.username}
                onChange={handleLoginInputChange}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="Enter password"
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
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
          </Form>
        </div>
        {/* Register Form Section */}

        <div className="form-container register-form-section">
          <Form
            name="register_form"
            onFinish={handleRegisterSubmit}
            className="register-form compact"
            initialValues={registerData}
            onFieldsChange={(changedFields) => {
              // Reset error khi user bắt đầu nhập
              if (changedFields.length > 0) {
                setError("");
              }
            }}
          >
            <Title level={3} className="register-title">
              Create your account
            </Title>
            <Form.Item
              label="Username"
              name="username"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "" }, // Bỏ message ở đây
              ]}
              validateStatus={error && !registerData.username ? "error" : ""}
            >
              <Input
                placeholder={
                  error && !registerData.username
                    ? "Please input your username!"
                    : "Enter username"
                }
                name="username"
                value={registerData.username}
                onChange={handleRegisterInputChange}
                size="small"
                className={error && !registerData.username ? "error-input" : ""}
              />
            </Form.Item>

            {/* Password Section */}
            <Form.Item
              label="Password"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              required={true}
              className="password-section-wrapper"
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                    validateStatus={
                      error && !registerData.password ? "error" : ""
                    }
                  >
                    <Input.Password
                      placeholder={
                        error && !registerData.password
                          ? "Please input your password!"
                          : "Enter password"
                      }
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      size="small"
                      className={
                        error && !registerData.password ? "error-input" : ""
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="repeatPassword"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(""));
                        },
                      }),
                    ]}
                    style={{ marginBottom: 0 }}
                    validateStatus={
                      error &&
                      (!registerData.repeatPassword ||
                        registerData.password !== registerData.repeatPassword)
                        ? "error"
                        : ""
                    }
                  >
                    <Input.Password
                      placeholder={
                        error && !registerData.repeatPassword
                          ? "Please confirm your password!"
                          : error &&
                            registerData.password !==
                              registerData.repeatPassword
                          ? "Passwords do not match!"
                          : "Confirm password"
                      }
                      name="repeatPassword"
                      value={registerData.repeatPassword}
                      onChange={handleRegisterInputChange}
                      size="small"
                      className={
                        error &&
                        (!registerData.repeatPassword ||
                          registerData.password !== registerData.repeatPassword)
                          ? "error-input"
                          : ""
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
              rules={[{ required: true, message: "" }]}
              validateStatus={error && !registerData.fullName ? "error" : ""}
            >
              <Input
                placeholder={
                  error && !registerData.fullName
                    ? "Please enter your name"
                    : "Enter your full name"
                }
                name="fullName"
                value={registerData.fullName}
                onChange={handleRegisterInputChange}
                size="small"
                className={error && !registerData.fullName ? "error-input" : ""}
              />
            </Form.Item>

            {/* Date of Birth và Sex nằm ngang nhau */}
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  label="Date of Birth"
                  name="dob"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "",
                    },
                  ]}
                  validateStatus={error && !registerData.dob ? "error" : ""}
                >
                  <Input
                    type="date"
                    placeholder={
                      error && !registerData.dob
                        ? "Please select your date of birth!"
                        : "Select date of birth"
                    }
                    name="dob"
                    value={registerData.dob}
                    onChange={handleRegisterInputChange}
                    size="small"
                    className={error && !registerData.dob ? "error-input" : ""}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Sex"
                  name="sex"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  rules={[{ required: true, message: "" }]}
                  validateStatus={error && !registerData.sex ? "error" : ""}
                >
                  <Select
                    placeholder={
                      error && !registerData.sex
                        ? "Please select your sex!"
                        : "Select sex"
                    }
                    name="sex"
                    value={registerData.sex}
                    onChange={(value) =>
                      handleRegisterInputChange({
                        target: { name: "sex", value },
                      })
                    }
                    size="small"
                    className={error && !registerData.sex ? "error-input" : ""}
                    style={{ width: "100%" }}
                  >
                    <Select.Option value="male">Male</Select.Option>
                    <Select.Option value="female">Female</Select.Option>
                    <Select.Option value="other">Other</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "" },
                { type: "email", message: "" },
              ]}
              validateStatus={
                error &&
                (!registerData.email ||
                  !/\S+@\S+\.\S+/.test(registerData.email))
                  ? "error"
                  : ""
              }
            >
              <Input
                placeholder={
                  error && !registerData.email
                    ? "Please input your email!"
                    : error &&
                      registerData.email &&
                      !/\S+@\S+\.\S+/.test(registerData.email)
                    ? "Please enter a valid email!"
                    : "Enter email"
                }
                name="email"
                value={registerData.email}
                onChange={handleRegisterInputChange}
                size="small"
                className={
                  error &&
                  (!registerData.email ||
                    !/\S+@\S+\.\S+/.test(registerData.email))
                    ? "error-input"
                    : ""
                }
              />
            </Form.Item>

            <Form.Item
              label="Identity Card"
              name="cardNumber"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: "",
                },
              ]}
              validateStatus={error && !registerData.cardNumber ? "error" : ""}
            >
              <Input
                placeholder={
                  error && !registerData.cardNumber
                    ? "Please input your Identity Card Number!"
                    : "Enter Identity Card Number"
                }
                name="cardNumber"
                value={registerData.cardNumber}
                onChange={handleRegisterInputChange}
                size="small"
                className={
                  error && !registerData.cardNumber ? "error-input" : ""
                }
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "" },
                {
                  pattern: /^\d{10,}$/,
                  message: "",
                },
              ]}
              validateStatus={
                error &&
                (!registerData.phone || !/^\d{10,}$/.test(registerData.phone))
                  ? "error"
                  : ""
              }
            >
              <Input
                placeholder={
                  error && !registerData.phone
                    ? "Please input your Phone Number!"
                    : error &&
                      registerData.phone &&
                      !/^\d{10,}$/.test(registerData.phone)
                    ? "Please enter a valid phone number!"
                    : "Enter Your Phone Number"
                }
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterInputChange}
                size="small"
                className={
                  error &&
                  (!registerData.phone || !/^\d{10,}$/.test(registerData.phone))
                    ? "error-input"
                    : ""
                }
              />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: "" }]}
              validateStatus={error && !registerData.address ? "error" : ""}
            >
              <Input
                placeholder={
                  error && !registerData.address
                    ? "Please input your Address!"
                    : "Enter Your Address"
                }
                name="address"
                value={registerData.address}
                onChange={handleRegisterInputChange}
                size="small"
                className={error && !registerData.address ? "error-input" : ""}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="register-button compact"
                loading={loading}
                size="small"
              >
                Register now
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* Background Section with Toggle Panels */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <div className="logo-container">
                <img src={logo} alt="Cinease Logo" className="logo" />
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
                <img src={logo} alt="Cinease Logo" className="logo" />
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
    </div>
  );
};

export default Login;
