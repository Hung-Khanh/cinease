import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import "./Header.scss";

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Load user từ localStorage
  const loadUserFromStorage = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (window.location.pathname === "/login") {
        navigate("/");
      }
    } else {
      setUser(null);
    }
  }, [navigate]);

  useEffect(() => {
    loadUserFromStorage();
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        loadUserFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, loadUserFromStorage]);

 // ...existing code...
useEffect(() => {
  const storedNotifications = localStorage.getItem("notifications");
  if (storedNotifications) {
    setNotifications(JSON.parse(storedNotifications));
  }

  // Lắng nghe sự kiện thay đổi localStorage (từ các tab khác hoặc cùng tab)
  const handleStorageChange = (e) => {
    if (e.key === "notifications") {
      setNotifications(JSON.parse(e.newValue || "[]"));
    }
  };
  window.addEventListener("storage", handleStorageChange);


  const handleCustomNotification = () => {
    const updated = localStorage.getItem("notifications");
    setNotifications(updated ? JSON.parse(updated) : []);
  };
  window.addEventListener("notificationUpdate", handleCustomNotification);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("notificationUpdate", handleCustomNotification);
  };
}, []);


  // Toggle dropdown avatar
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Toggle dropdown thông báo
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);

    // Đánh dấu đã đọc
    const updated = notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const getUserAvatar = () => {
    let latestUser = user;
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) latestUser = JSON.parse(savedUser);
    } catch (e) {
console.error("Error parsing user from localStorage:", e);
    }
    if (!latestUser) return null;
    const img = latestUser.image || latestUser.avatar;
    if (img) {
      if (img.startsWith("data:") || img.startsWith("http")) {
        return img;
      }
      const baseUrl = "https://legally-actual-mollusk.ngrok-free.app";
      const imagePath = img.startsWith("/") ? img : `/${img}`;
      return `${baseUrl}${imagePath}`;
    }
    return null;
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

        {/* Bell Icon + Notification */}
        <div className="notification-icon" onClick={toggleNotifications}>
          <BellOutlined style={{ fontSize: 20, color: "#fff", cursor: "pointer" }} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <div className="notification-empty">Không có thông báo</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    🎬 Đã đặt {n.quantity} vé phim <strong>{n.title}</strong>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Avatar + Dropdown */}
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
                <div className="dropdown-item" onClick={() => navigate("/profile")}>
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