import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./constants/AuthContext";

import Footer from "./component/Footer/Footer.jsx";
import Header from "./component/Header/Header.jsx";
import LoginPage from "./pages/LoginPage/Login.jsx";
import StaffHomePage from "./pages/Staff/SHomePage.jsx";
import HomePage from "./pages/Home/Home.jsx";
import Movie from "./pages/movie/Movie.jsx";
import DateTimeSelection from "./pages/Staff/DateTimeSelection.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Confirm from "./pages/confirm/Confirm.jsx";
import SeatSelection from "./pages/seat/SeatSelect.jsx";
import PaymentDetail from "./pages/payment/PaymentDetail.jsx";
function Layout() {
  const isAdmin = location.pathname.startsWith("/admin");
  const isLoginRegister = location.pathname.startsWith("/login");
  return (
    <div className="app-container">
      {!isLoginRegister && !isAdmin && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/staffHP" element={<StaffHomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dateTimeSelection" element={<DateTimeSelection />} />
          <Route path="/movie" element={<Movie />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route path="/payment-detail" element={<PaymentDetail />} />
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
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;
