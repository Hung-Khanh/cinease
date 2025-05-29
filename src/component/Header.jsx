import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <Link to="/">
                    <img src="/src/assets/logo.png" alt="logo" className="logo" />
                </Link>

                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/movie">Movie</Link>
                </nav>

                <div className="notification-container">
                    <button className="notification-button">
                        <img src="/src/assets/bell.png" alt="notification" className="notification-icon" />
                    </button>
                </div>

                <div className="auth-links">
                    <Link to="/login" className="login-link">Đăng nhập</Link>
                    <Link to="/register" className="register-link">/Đăng Ký</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
