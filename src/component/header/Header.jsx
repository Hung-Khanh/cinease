import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import "./Header.scss";

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Function to load user from sessionStorage
  const loadUserFromStorage = useCallback(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // If just logged in, redirect from login page to home
      if (window.location.pathname === "/login") {
        navigate("/");
      }
    } else {
      setUser(null);
    }
  }, [navigate]);

  useEffect(() => {
    // Initial load of user data
    loadUserFromStorage();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        loadUserFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, loadUserFromStorage]);

  // Get avatar from user object (prioritize image/avatar, fallback to icon)
  const getUserAvatar = () => {
    // Always get latest user from sessionStorage to avoid stale state after login/logout
    let latestUser = user;
    try {
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) latestUser = JSON.parse(savedUser);
    } catch (e) {
      console.error("Error parsing user from sessionStorage:", e);
    }
    if (!latestUser) return null;

    // Ưu tiên lấy image hoặc avatar từ server
    const img = latestUser.image || latestUser.avatar;
    if (img) {
      // Nếu ảnh là base64 hoặc link đầy đủ
      if (img.startsWith("data:") || img.startsWith("http")) {
        return img;
      }
      // Nếu chỉ là relative path từ server trả về
      const baseUrl = "https://legally-actual-mollusk.ngrok-free.app";
      const imagePath = img.startsWith("/") ? img : `/${img}`;
      return `${baseUrl}${imagePath}`;
    }

    // Không có avatar thì trả về null để dùng UserOutlined
    return null;
  };
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
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
    sessionStorage.removeItem("user");
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
          <Link to={user && user.role === "EMPLOYEE" ? "/staffHomePage" : "/"}>
            Home
          </Link>
          <Link to="/movie">Movies</Link>
        </nav>

        <div className="notification-icon">
          <BellOutlined />
        </div>
        {user ? (
          <div className="user-avatar-container">
            <div className="avatar" onClick={toggleDropdown}>
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #fff",
                    background: "#222",
                  }}
                />
              ) : (
                <UserOutlined style={{ fontSize: 24, color: "#fff" }} />
              )}
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
