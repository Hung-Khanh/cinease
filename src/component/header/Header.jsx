import { Link } from "react-router-dom";
import "./Header.scss";

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <Link to="/">
                    <img src="/src/assets/logo.png" alt="logo" className="logo" />
                </Link>

                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/movie">Movies</Link>
                </nav>

                <div className="notification-container">
                    <button className="notification-button">
                        <img src="/src/assets/bell.png" alt="notification" className="notification-icon" />
                    </button>
                </div>

                <div className="auth-links">
                    <Link to="/login" className="login-link">Sign In</Link>
                    <Link to="/register" className="register-link">Sign Up</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
