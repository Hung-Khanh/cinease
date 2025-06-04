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
  const apiUrl = "https://3a21-183-91-25-219.ngrok-free.app/api";
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
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
        navigate("/staffHP");
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
      message.error(`Registration failed: ${error.message}`);
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
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                placeholder="Enter username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterInputChange}
                size="small"
              />
            </Form.Item>
            <Form.Item label="Password" required>
              <Row gutter={8} style={{ alignItems: "center" }}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters!",
                      },
                    ]}
                    noStyle
                  >
                    <Input.Password
                      placeholder="Enter password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      size="small"
                      style={{ width: "100%" }}
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
                        message: "Please confirm your password!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match!")
                          );
                        },
                      }),
                    ]}
                    noStyle
                  >
                    <Input.Password
                      placeholder="Confirm password"
                      name="repeatPassword"
                      value={registerData.repeatPassword}
                      onChange={handleRegisterInputChange}
                      size="small"
                      style={{ width: "100%" }}
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
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                placeholder="Enter your full name"
                name="fullName"
                value={registerData.fullName}
                onChange={handleRegisterInputChange}
                size="small"
              />
            </Form.Item>
            <Form.Item
              label="Date of Birth"
              name="dob"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: "Please select your date of birth!",
                },
              ]}
            >
              <Input
                type="date"
                placeholder="Select date of birth"
                name="dob"
                value={registerData.dob}
                onChange={handleRegisterInputChange}
                size="small"
              />
            </Form.Item>
            <Form.Item
              label="Sex"
              name="sex"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: "Please select your sex!" }]}
            >
              <Select
                placeholder="Select sex"
                name="sex"
                value={registerData.sex}
                onChange={(value) =>
                  handleRegisterInputChange({ target: { name: "sex", value } })
                }
                size="small"
                style={{ width: "100%" }}
              >
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                placeholder="Enter email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterInputChange}
                size="small"
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
                  message: "Please input your Identity Card Number!",
                },
              ]}
            >
              <Input
                placeholder="Enter Identity Card Number"
                name="cardNumber"
                value={registerData.cardNumber}
                onChange={handleRegisterInputChange}
                size="small"
              />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="phone"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please input your Phone Number!" },
                {
                  pattern: /^\d{10,}$/,
                  message: "Please enter a valid phone number!",
                },
              ]}
            >
              <Input
                placeholder="Enter Your Phone Number"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterInputChange}
                size="small"
              />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                { required: true, message: "Please input your Address!" },
              ]}
            >
              <Input
                placeholder="Enter Your Address"
                name="address"
                value={registerData.address}
                onChange={handleRegisterInputChange}
                size="small"
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
