import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import "./Header.scss";

const MAX_NOTIFICATIONS = 20;

const getNotificationsByUser = (userName) => {
  const key = `notifications_${userName}`;
  const data = Cookies.get(key);
  return data ? JSON.parse(data) : [];
};

const saveNotificationsByUser = (userName, notifications) => {
  const key = `notifications_${userName}`;
  const updated = notifications.slice(0, MAX_NOTIFICATIONS);
  Cookies.set(key, JSON.stringify(updated), { expires: 7 });
};

const markAllAsRead = (userName) => {
  const current = getNotificationsByUser(userName);
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotificationsByUser(userName, updated);
  return updated;
};

const Header = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const loadUserFromStorage = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (window.location.pathname === "/login") {
        navigate("/");
      }
    } else {
      setUser(null);
    }
  }, [navigate]);

  const loadNotifications = useCallback((userName) => {
    if (!userName) return;
    const notis = getNotificationsByUser(userName);
    setNotifications(notis);
  }, []);

  useEffect(() => {
    loadUserFromStorage();
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      loadNotifications(userObj.username);
    }

    // Lắng nghe thay đổi storage để load user lại
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        loadUserFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, loadUserFromStorage, loadNotifications]);

  useEffect(() => {
    const handleCustomNotification = () => {
      if (user) {
        loadNotifications(user.username);
      }
    };
    window.addEventListener("notificationUpdate", handleCustomNotification);

    return () => {
      window.removeEventListener("notificationUpdate", handleCustomNotification);
    };
  }, [user, loadNotifications]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleNotifications = () => {
    if (!user) return;
    const updated = markAllAsRead(user.username);
    setNotifications(updated);
    setShowNotifications(!showNotifications);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setNotifications([]);
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
      <div
        key={n.id}
        className={`notification-item ${!n.read ? "unread" : ""}`}
        onClick={() => {
          setShowNotifications(false);
          navigate(`/payment-success?invoiceId=${n.invoiceId}`);
        }}
      >
        <div className="notification-item-icon">🎬</div>
        <div className="notification-text">
          <div className="notification-title">
            Đã đặt {n.quantity} vé phim <strong>{n.title}</strong>
          </div>
          {n.time && <div className="notification-time">{n.time}</div>}
        </div>
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