import { Layout } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./component/Header";
import Movie from "./pages/Movie";
import Home from "./pages/Home";

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movie" element={<Movie />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
