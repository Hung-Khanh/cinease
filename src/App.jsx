import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./constants/AuthContext";

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
            path="/ticketInformation/:invoiceId"
            element={<TicketInformation apiUrl={apiUrl} />}
          />
          <Route path="/movie" element={<Movie />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/description-movie" element={<DescriptionMovie />} />
          <Route path="/select-showtime" element={<SelectShowtime />} />
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
