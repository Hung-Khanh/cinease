import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./constants/AuthContext";

import Footer from "./component/footer/Footer";
import Header from "./component/header/Header";
import LoginPage from "./pages/LoginPage/Login.jsx";
import StaffHomePage from "./pages/Staff/JSX/SHomePage.jsx";
import HomePage from "./pages/home/Home.jsx";
import Movie from "./pages/movie/Movie";
import DateTimeSelection from "./pages/Staff/JSX/DateTimeSelection.jsx";
import SeatSelection from "./pages/Staff/JSX/SeatSelection.jsx";
function Layout() {
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
          <Route path="/movie" element={<Movie />} />
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
