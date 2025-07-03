import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import './Header.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../constants/AuthContext';

const AdminHeader = ({ onLogoClick, pageTitle = 'DASHBOARD' }) => {
  // const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // const handleSearchChange = (e) => {
  //   setSearchTerm(e.target.value);
  // };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="header-left">
          <div
            className="logo-menu-toggle"
            onClick={onLogoClick}
          >
            <MenuUnfoldOutlined />
          </div>
          <h2 className="page-title">{pageTitle}</h2>
        </div>

        <div className="header-actions">
          {/* <div className="search-container">
            <Input 
              placeholder="Search here..."
              prefix={<SearchOutlined />}
              className="admin-search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div> */}

          <div className="header-icons">
            <div className="notification-icon">
              <BellOutlined />
            </div>

            {user ? (
              <div className="user-avatar-container">
                <div className="avatar" onClick={toggleDropdown}>
                  <UserOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={handleLogout} style={{ color: 'red', cursor: 'pointer' }}>Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="login-link">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
