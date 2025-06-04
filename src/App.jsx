import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./constants/AuthContext";

import Footer from "./component/footer/Footer";
import Header from "./component/header/Header";
import LoginPage from "./pages/LoginPage/Login.jsx";
import StaffHomePage from "./pages/Staff/SHomePage.jsx";
import HomePage from "./pages/home/Home.jsx";
import Movie from "./pages/movie/Movie";
import DateTimeSelection from "./pages/Staff/DateTimeSelection.jsx";
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
