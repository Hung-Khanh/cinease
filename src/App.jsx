import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./constants/AuthProvider";
import React, { useState } from "react";
import { store } from "./store/store";
import { Provider } from "react-redux";

// Components và Pages
import Footer from "./component/Footer/Footer.jsx";
import Header from "./component/Header/Header.jsx";
import LoginPage from "./pages/LoginPage/Login.jsx";
import StaffHomePage from "./pages/Staff/JSX/SHomePage.jsx";
import HomePage from "./pages/Home/Home.jsx";
import Movie from "./pages/Movie/Movie.jsx";
import DateTimeSelection from "./pages/Staff/JSX/DateTimeSelection.jsx";
import SeatSelection from "./pages/Staff/JSX/SeatSelection.jsx";
import TicketInformation from "./pages/Staff/JSX/TicketInformation.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import DescriptionMovie from "./pages/DescriptionMovie/DescriptionMovie.jsx";
import PaymentFailed from "./pages/PaymentProcess/PaymentFailed/PaymentFailed.jsx";
import PaymentSuccess from "./pages/PaymentProcess/PaymentSuccess/PaymentSuccess.jsx";
import SelectShowtime from "./pages/SelectShowtime/SelectShowtime.jsx";
import SelectSeat from "./pages/Seat/SeatSelect.jsx";
import Confirm from "./pages/Confirm/Confirm.jsx";
import PaymentDetail from "./pages/Payment/PaymentDetail.jsx";
import ProductPage from "./pages/Product/Product.jsx";
import ForgotPassword from "./forgotPassword/forgotPassword.jsx";
import ConfirmPurchase from "./pages/Staff/JSX/ConfirmPurchase.jsx";
import HistoryTicket from "./pages/HistoryMember/HistoryTicket.jsx";
import UserPaymentFailed from "./pages/PaymentProcess/UserPaymentFailed/UserPaymentFailed.jsx";
import UserPaymentSuccess from "./pages/PaymentProcess/UserPaymentSuccess/UserPaymentSuccess.jsx";
import RedirectPayment from "./pages/PaymentProcess/RedirectPayment/RedirectPayment.jsx";
import PhoneInput from "./pages/Staff/JSX/InputPhoneNumber.jsx";
import PaymentCashSuccess from "./pages/PaymentProcess/PaymentCashSuccess/PaymentCashSuccess.jsx";
// Admin components
import SideBar from "./component/Admin/SideBar/SideBar.jsx";
import AdminHeader from "./component/Admin/Header/Header.jsx";
import ScrollToTop from "./component/ScrollToTop.jsx";
import Dashboard from "./pages/admin/DashBoard/DashBoard.jsx"; 
import Promotions from "./pages/admin/Promotions/Promotions.jsx";
import AdminMovies from "./pages/admin/Movies/Movie.jsx";
import backgroundImage from "./assets/bigbackground.png";
import Employees from "./pages/admin/Employees/Employees.jsx";
import CinemaRooms from "./pages/admin/CinemaRoom/CinemaRoom.jsx";
import Members from "./pages/admin/Members/Members.jsx";
import TicketManagement from "./pages/admin/TicketManagement/TicketManagement.jsx";
import ProductManagement from "./pages/admin/ProductManagement/ProductManagement.jsx";
import FeedbackManagement from "./pages/admin/FeedbackManagement/FeedbackManagement.jsx";
// import ErrorBoundary from "./components/ErrorBoundary";
import ErrorPage from "./pages/Error/ErrorPage.jsx";

import CinemaSeating from "./pages/Staff/JSX/TestSeatSelection.jsx";
function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="promotions" element={<Promotions />} />
      <Route path="movies" element={<AdminMovies />} />
      <Route path="employees" element={<Employees />} />
      <Route path="cinema" element={<CinemaRooms />} />
      <Route path="member" element={<Members />} />
      <Route path="ticket" element={<TicketManagement />} />
      <Route path="productmanagement" element={<ProductManagement />} />
      <Route path="feedbackmanagement" element={<FeedbackManagement />} />
    </Routes>
  );
}

function AdminLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [pageTitle, setPageTitle] = useState("DASHBOARD");
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";

  // Redirect non-admin users to error page
  if (!isAdmin) {
    window.location.replace("/error");
    return null;
  }

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
          <AdminRoutes />
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isLoginRegister = location.pathname.startsWith("/login");
  const role = localStorage.getItem("role");
  const isStaff = role === "EMPLOYEE";
  const isAdmin = role === "ADMIN";
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";

  if (
    location.pathname.startsWith("/staffHomePage") ||
    location.pathname.startsWith("/cinema-seating") ||
    location.pathname.startsWith("/phone-input") ||
    location.pathname.startsWith("/dateTimeSelection") ||
    location.pathname.startsWith("/Select-Seat") ||
    location.pathname.startsWith("/ticketInformation") ||
    location.pathname.startsWith("/confirm-purchase")
  ) {
    if (!isStaff) {
      window.location.replace("/error");
      return null;
    }
  }

  return (
    <div className="app-container">
      {!isLoginRegister && !isAdmin && <Header />}
      <main className="main-content">
        <Routes>
          {isStaff && (
            <>
              <Route path="payment-cash" element={<PaymentCashSuccess />} />
              <Route path="/staffHomePage" element={<StaffHomePage />} />
              <Route
                path="/cinema-seating/:scheduleId/:movieName/:selectedDate/:selectedTime"
                element={<CinemaSeating />}
              />
              <Route
                path="/phone-input/:invoiceId/:scheduleId"
                element={<PhoneInput apiUrl={apiUrl} />}
              />
              <Route
                path="/dateTimeSelection/:movieId"
                element={<DateTimeSelection apiUrl={apiUrl} />}
              />
              <Route
                path="/Select-Seat/:scheduleId/:movieName/:selectedDate/:selectedTime"
                element={<SeatSelection apiUrl={apiUrl} />}
              />

              <Route
                path="/ticketInformation/:invoiceId/:scheduleId"
                element={<TicketInformation apiUrl={apiUrl} />}
              />
              <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
            </>
          )}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />

          <Route path="/home" element={<HomePage />} />

          <Route path="/movie" element={<Movie />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/description-movie/:movieId"
            element={<DescriptionMovie />}
          />
          <Route
            path="/select-showtime/:movieId"
            element={<SelectShowtime />}
          />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route
            path="/seat-select/:movieId/:scheduleId/"
            element={<SelectSeat />}
          />
          <Route path="/confirm/:scheduleId/:sessionId" element={<Confirm />} />
          <Route
            path="/product/:movieId/:sessionId"
            element={<ProductPage />}
          />
          <Route
            path="/payment-detail/:sessionId/:movieId"
            element={<PaymentDetail />}
          />
          <Route path="/history" element={<HistoryTicket />} />
          <Route
            path="/user-payment-failed/:invoiceId"
            element={<UserPaymentFailed />}
          />
          <Route
            path="/user-payment-success/:invoiceId"
            element={<UserPaymentSuccess />}
          />
          <Route path="/redirect-payment" element={<RedirectPayment />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </main>
      {!isLoginRegister && !isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
