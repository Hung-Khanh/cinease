import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import { useState, useEffect } from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Nếu vừa đăng nhập thành công, chuyển về trang home dựa trên role
      if (window.location.pathname === "/login") {
        navigate(role === "EMPLOYEE" ? "/staffHomePage" : "/");
      }
    }
  }, [navigate, role]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const handleHomeNavigation = () => {
    navigate(role === "EMPLOYEE" ? "/staffHomePage" : "/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div onClick={handleHomeNavigation} style={{ cursor: "pointer" }}>
          <img src="/src/assets/logo.png" alt="logo" className="logo" />
        </div>

        <nav className="nav-links" style={{ cursor: "pointer" }}>
          <div onClick={handleHomeNavigation}>Home</div>
          {role !== "EMPLOYEE" && <Link to="/movie">Movies</Link>}
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
