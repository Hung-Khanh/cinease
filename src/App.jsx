import { Layout } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./component/header/Header";
import Movie from "./pages/movie/Movie";
import Home from "./pages/home/Home";
import Footer from "./component/footer/Footer";

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movie" element={<Movie />} />
                </Routes>
                <Footer />
            </Layout>
        </BrowserRouter>
    );
};

export default App;
