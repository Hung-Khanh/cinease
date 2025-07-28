"use client"
import { NavLink, useLocation } from "react-router-dom"
import "./SideBar.scss"

// Import your local assets
import logo from "../../../assets/logo.png"
import DashboardIcon from "../../../assets/admin-logo/dashboard-icon.svg"
import EmployeesIcon from "../../../assets/admin-logo/employees-icon.svg"
import MoviesIcon from "../../../assets/admin-logo/movies-icon.svg"
import PromotionsIcon from "../../../assets/admin-logo/promotions-icon.svg"
import CinemaIcon from "../../../assets/admin-logo/cinema-icon.svg"
import TicketIcon from "../../../assets/admin-logo/ticket-icon.svg"
import MemberIcon from "../../../assets/admin-logo/member-icon.svg"
import ProductIcon from "../../../assets/admin-logo/popcorn-icon.svg"
import FeedbackIcon from "../../../assets/admin-logo/popcorn-icon.svg" // New icon

const SideBar = ({ isVisible = true, onMenuItemClick }) => {
  const location = useLocation()

  const adminMenuItems = [
    { path: "/admin/dashboard", icon: DashboardIcon, label: "Dashboard" },
    { path: "/admin/employees", icon: EmployeesIcon, label: "Employees" },
    { path: "/admin/member", icon: MemberIcon, label: "Membership" },
    { path: "/admin/movies", icon: MoviesIcon, label: "Movies" },
    { path: "/admin/promotions", icon: PromotionsIcon, label: "Promotions" },
    { path: "/admin/cinema", icon: CinemaIcon, label: "Cinema Rooms" },
    { path: "/admin/ticket", icon: TicketIcon, label: "Tickets Management" },
    { path: "/admin/productmanagement", icon: ProductIcon, label: "Products Management" },
    { path: "/admin/feedbackmanagement", icon: FeedbackIcon, label: "Feedback Management" }, // New
  ]

  const handleMenuItemClick = (label) => {
    if (onMenuItemClick) {
      onMenuItemClick(label.toUpperCase())
    }
  }

  return (
    <div className={`admin-sidebar ${isVisible ? "visible" : "hidden"}`} role="complementary">
      <div className="sidebar-logo">
        <img src={logo || "/placeholder.svg"} alt="Cinease Logo" className="logo-image" />
      </div>
      <nav className="sidebar-menu">
        <ul>
          {adminMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => handleMenuItemClick(item.label)}
              >
                <span className="sidebar-icon">
                  <img src={item.icon || "/placeholder.svg"} alt={`${item.label} icon`} className="menu-icon" />
                </span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-stars">
        <span className="star">★</span>
        <span className="star">★</span>
        <span className="star">★</span>
      </div>
    </div>
  )
}

export default SideBar
