import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation} from "react-router-dom";
import { AuthProvider } from "./constants/AuthContext";
import React, { useState } from 'react';


import Footer from "./component/Footer/Footer.jsx";
import Header from "./component/Header/Header.jsx";
import LoginPage from "./pages/LoginPage/Login.jsx";
import StaffHomePage from "./pages/Staff/JSX/SHomePage.jsx";
import HomePage from "./pages/home/Home.jsx";
import Movie from "./pages/movie/Movie";
import DateTimeSelection from "./pages/Staff/JSX/DateTimeSelection.jsx";
import SeatSelection from "./pages/Staff/JSX/SeatSelection.jsx";
import TicketInformation from "./pages/Staff/JSX/TicketInformation.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import DescriptionMovie from "./pages/DescriptionMovie/DescriptionMovie.jsx";
import PaymentFailed from "./pages/PaymentProcess/PaymentFailed/PaymentFailed.jsx";
import PaymentSuccess from "./pages/PaymentProcess/PaymentSuccess/PaymentSuccess.jsx";
import SelectShowtime from "./pages/SelectShowtime/SelectShowtime.jsx";
import SelectSeat from "./pages/seat/SeatSelect.jsx";

// Admin components
import SideBar from "./component/Admin/SideBar/SideBar.jsx";
import AdminHeader from "./component/Admin/Header/Header.jsx";
import Dashboard from "./pages/admin/DashBoard/Dashboard.jsx";
import Promotions from "./pages/admin/Promotions/Promotions.jsx";
import AdminMovies from "./pages/admin/Movies/Movie.jsx";
import backgroundImage from "./assets/bigbackground.png";

function AdminLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [pageTitle, setPageTitle] = useState("DASHBOARD");

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleMenuItemClick = (title) => {
    setPageTitle(title);
  };

  return (
    <div
      className="admin-layout"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        overflow: "auto",
      }}
    >
      <SideBar
        isVisible={isSidebarVisible}
        onMenuItemClick={handleMenuItemClick}
      />
      <div
        className="admin-main-content"
        style={{
          marginLeft: isSidebarVisible ? "250px" : "0",
          transition: "margin-left 0.3s ease",
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          backgroundColor: "rgba(10, 24, 31, 0.8)",
        }}
      >
        <AdminHeader onLogoClick={toggleSidebar} pageTitle={pageTitle} />
        <div
          style={{
            minHeight: "calc(100vh - 100px)",
            overflowY: "auto",
          }}
        >
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="movies" element={<AdminMovies />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation(); // Add useLocation hook
  const isAdmin = location.pathname.startsWith("/admin");
  const isLoginRegister = location.pathname.startsWith("/login");
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";

  return (
    <div className="app-container">
      {!isLoginRegister && !isAdmin && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/staffHomePage" element={<StaffHomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/dateTimeSelection/:movieId"
            element={<DateTimeSelection apiUrl={apiUrl} />}
          />
          <Route
            path="/Select-Seat/:scheduleId/:movieName"
            element={<SeatSelection apiUrl={apiUrl} />}
          />
          <Route
            path="/ticketInformation/:invoiceId/:scheduleId"
            element={<TicketInformation apiUrl={apiUrl} />}
          />
          <Route path="/movie" element={<Movie />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/description-movie/:movieId" element={<DescriptionMovie />} />
          <Route path="/select-showtime/:movieId" element={<SelectShowtime />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/seat-select/:movieId/:scheduleId" element={<SelectSeat />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
      {!isLoginRegister && !isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="movies" element={<AdminMovies />} />
            {/* Add more admin routes here as needed */}
          </Route>
          <Route path="/*" element={<Layout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
