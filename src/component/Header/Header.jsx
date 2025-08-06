import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  UserOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import "./Header.scss";
import logo from "../../assets/logo.png";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      window.removeEventListener(
        "notificationUpdate",
        handleCustomNotification
      );
    };
  }, [user, loadNotifications]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMobileMenu &&
        !event.target.closest(".mobile-menu") &&
        !event.target.closest(".hamburger-menu")
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileMenu]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleNotifications = () => {
    if (!user) return;
    const updated = markAllAsRead(user.username);
    setNotifications(updated);
    setShowNotifications(!showNotifications);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setNotifications([]);
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate("/");
  };

  const handleMobileNavClick = () => {
    setShowMobileMenu(false);
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
        {/* Logo */}
        <Link to={user && user.role === "EMPLOYEE" ? "/staffHomePage" : "/"}>
          <img
            src={logo || "/placeholder.svg"}
            alt="Cinease Logo"
            className="logo"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-only">
          <Link to={user && user.role === "EMPLOYEE" ? "/staffHomePage" : "/"}>
            Home
          </Link>
          <Link to="/movie">Movies</Link>
        </nav>

        {/* Desktop Right Section */}
        <div className="desktop-right desktop-only">
          {/* Bell Icon + Notification */}
          <div className="notification-icon" onClick={toggleNotifications}>
            <BellOutlined
              data-testid="bell-icon"
              style={{ fontSize: 20, color: "#fff", cursor: "pointer" }}
            />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
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
                          Booked {n.quantity} movie tickets for <strong>{n.title}</strong>
                        </div>
                        {n.time && (
                          <div className="notification-time">{n.time}</div>
                        )}
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
                    aria-label="avatar"
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
                  <UserOutlined
                    aria-label="avatar"
                    style={{ fontSize: 24, color: "#fff" }}
                  />
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

        {/* Mobile Hamburger Menu */}
        <div className="hamburger-menu mobile-only" onClick={toggleMobileMenu}>
          {showMobileMenu ? (
            <CloseOutlined style={{ fontSize: 24, color: "#fff" }} />
          ) : (
            <MenuOutlined style={{ fontSize: 24, color: "#fff" }} />
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {/* Close Button */}
              <div className="mobile-menu-header">
                <button className="mobile-close-btn" onClick={toggleMobileMenu}>
                  <CloseOutlined style={{ fontSize: 24, color: "#fff" }} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mobile-nav-links">
                <Link
                  to={user && user.role === "EMPLOYEE" ? "/staffHomePage" : "/"}
                  onClick={handleMobileNavClick}
                >
                  Home
                </Link>
                <Link to="/movie" onClick={handleMobileNavClick}>
                  Movies
                </Link>
              </nav>

              {/* User Section */}
              {user ? (
                <div className="mobile-user-section">
                  <div
                    className="mobile-user-info"
                    onClick={() => {
                      navigate("/profile");
                      handleMobileNavClick();
                    }}
                  >
                    <div className="mobile-avatar">
                      {getUserAvatar() ? (
                        <img
                          src={getUserAvatar()}
                          alt="avatar"
                          style={{
                            width: 40,
                            height: 40,
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
                    <span className="mobile-username">Profile</span>
                  </div>

                  {/* Mobile Notifications */}
                  <div
                    className="mobile-notifications"
                    onClick={toggleNotifications}
                  >
                    <BellOutlined style={{ fontSize: 20, color: "#fff" }} />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="mobile-notification-badge">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="mobile-logout" onClick={handleLogout}>
                    <span style={{ color: "#e74c3c" }}>Logout</span>
                  </div>
                </div>
              ) : (
                <div className="mobile-auth">
                  <Link
                    to="/login"
                    className="mobile-login-btn"
                    onClick={handleMobileNavClick}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
