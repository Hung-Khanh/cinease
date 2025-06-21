import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import { useState, useEffect } from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Nếu vừa đăng nhập thành công, chuyển về trang home
      if (window.location.pathname === "/login") {
        navigate("/");
      }
    }
  }, [navigate]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to={user && user.role === "EMPLOYEE" ? "/staffHomePage" : "/"}>
          <img src="/src/assets/logo.png" alt="logo" className="logo" />
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/movie">Movies</Link>
        </nav>

        <div className="notification-icon">
          <BellOutlined />
        </div>
        {user ? (
          <div className="user-avatar-container">
            <div className="avatar" onClick={toggleDropdown}>
              <UserOutlined style={{ fontSize: 24, color: "#fff" }} />
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </div>
                <div
                  className="dropdown-item"
                  onClick={handleLogout}
                  style={{ color: "red", cursor: "pointer" }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
