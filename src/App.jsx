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
import DescriptionMovie from "./pages/DescriptionMovie/DescriptionMovie.jsx";
import PaymentFailed from "./pages/PaymentProcess/PaymentFailed/PaymentFailed.jsx";
import PaymentSuccess from "./pages/PaymentProcess/PaymentSuccess/PaymentSuccess.jsx";
import SelectShowtime from "./pages/SelectShowtime/SelectShowtime.jsx";
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
          <Route path="/description-movie" element={<DescriptionMovie />} />
          <Route path="/select-showtime" element={<SelectShowtime/>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
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
