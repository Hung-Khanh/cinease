import { useState } from "react";
import { Provider } from "react-redux";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./constants/AuthProvider";
import { store } from "./store/store";

// ...existing code...
import Footer from "./component/footer/Footer.jsx";
import ForgotPassword from "./forgotPassword/forgotPassword.jsx";
import Confirm from "./pages/confirm/Confirm.jsx";
import DescriptionMovie from "./pages/descriptionMovie/descriptionMovie.jsx";
import HistoryTicket from "./pages/historyMember/historyTicket.jsx";
import HomePage from "./pages/home/Home.jsx";
import LoginPage from "./pages/loginPage/Login.jsx";
import Movie from "./pages/movie/Movie.jsx";
import PaymentDetail from "./pages/payment/paymentDetail.jsx";
import PaymentCashSuccess from "./pages/paymentProcess/paymentCashSuccess/paymentCashSuccess.jsx";
import PaymentFailed from "./pages/paymentProcess/paymentFailed/paymentFailed.jsx";
import PaymentSuccess from "./pages/paymentProcess/paymentSuccess/paymentSuccess.jsx";
import RedirectPayment from "./pages/paymentProcess/redirectPayment/redirectPayment.jsx";
import UserPaymentFailed from "./pages/paymentProcess/userPaymentFailed/userPaymentFailed.jsx";
import UserPaymentSuccess from "./pages/paymentProcess/userPaymentSuccess/userPaymentSuccess.jsx";
import ProductPage from "./pages/product/Product.jsx";
import Profile from "./pages/profile/Profile.jsx";
import SelectSeat from "./pages/seat/seatSelect.jsx";
import SelectShowtime from "./pages/selectShowtime/selectShowtime.jsx";
import ConfirmPurchase from "./pages/staff/jsx/confirmPurchase.jsx";
import DateTimeSelection from "./pages/staff/jsx/dateTimeSelection.jsx";
import PhoneInput from "./pages/staff/jsx/inputPhoneNumber.jsx";
import SeatSelection from "./pages/staff/jsx/seatSelection.jsx";
import StaffHomePage from "./pages/staff/jsx/sHomePage.jsx";
import TicketInformation from "./pages/staff/jsx/ticketInformation.jsx";
// ...existing code...
import backgroundImage from "./assets/bigbackground.png";
import AdminHeader from "./component/admin/header/Header.jsx";
import SideBar from "./component/admin/sideBar/sideBar.jsx";
import ScrollToTop from "./component/scrollToTop.jsx";
import CinemaRooms from "./pages/admin/cinemaRoom/cinemaRoom.jsx";
import Dashboard from "./pages/admin/DashBoard/DashBoard.jsx";
import Members from "./pages/admin/members/Members.jsx";
import AdminMovies from "./pages/admin/Movies/Movie.jsx";
import ProductManagement from "./pages/admin/productManagement/productManagement.jsx";
import Promotions from "./pages/admin/promotions/promotions.jsx";
import TicketManagement from "./pages/admin/ticketManagement/ticketManagement.jsx";
// import ErrorBoundary from "./components/errorBoundary";
import ErrorPage from "./pages/error/errorPage.jsx";

import FeedbackManagement from "./pages/admin/FeedBackManagement/FeedBackManagement.jsx";
import CinemaSeating from "./pages/staff/jsx/testSeatSelection.jsx";
import Employees from "./pages/admin/Employees/Employees.jsx";
import Header from "./component/Header/Header.jsx";
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
