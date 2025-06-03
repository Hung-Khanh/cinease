import { Carousel, Rate, Badge } from "antd";
import { Link } from "react-router-dom";
import Slide1 from "../../assets/Slide1.png";
import Slide2 from "../../assets/Slide2.png";
import Slide3 from "../../assets/Slide3.png";
import Slide4 from "../../assets/Slide4.png";
import Slide5 from "../../assets/Slide5.png";
import doraemon from "../../assets/doraemon.png";
import stitch from "../../assets/stitch.png";
import kien from "../../assets/kien.png";
import vongtaynang from "../../assets/vongtaynang.png";
import duoidayho from "../../assets/duoidayho.png";
import demen from "../../assets/demen.png";
import mamochong from "../../assets/mamochong.png";
import ballerina from "../../assets/ballerina.png";
import todoigaunhi from "../../assets/todoigaunhi.png";
import luyenrong from "../../assets/luyenrong.png";
import KM from "../../assets/KM.png";
import "./Home.scss";

const showingMovies = [
    {
        title: "Doraemon",
        img: doraemon,
        rating: 9.3,
        stars: 4.5,
        genre: "Cartoon",
        showtimes: "120 phút"
    },
    {
        title: "Lilo & Stitch",
        img: stitch,
        rating: 9.4,
        stars: 4.7,
        genre: "Cartoon",
        showtimes: "120 min"
    },
    {
        title: "Thám Tử Kiên",
        img: kien,
        rating: 9.5,
        stars: 5.0,
        genre: "Horror",
        showtimes: "110 min"
    },
    {
        title: "Vòng Tay Nắng",
        img: vongtaynang,
        rating: 9.6,
        stars: 4.8,
        genre: "Adventure",
        showtimes: "120 min"
    },
    {
        title: "Dưới Dáy Hố",
        img: duoidayho,
        rating: 9.4,
        stars: 4.7,
        genre: "Horror",
        showtimes: "120 min"
    }
];

const comingMovies = [
    {
        title: "Cricket Boy",
        img: demen,
        badge: "Coming Soon",
        date: "06/01/2025",
        genre: "Cartoon"
    },
    {
        title: "Pink Hook Ghost",
        img: mamochong,
        badge: "Coming Soon",
        date: "06/05/2025",
        genre: "Horror"
    },
    {
        title: "Ballerina",
        img: ballerina,
        badge: "Coming Soon",
        date: "06/10/2025",
        genre: "Action"
    },
    {
        title: "Bear Squad Kids",
        img: todoigaunhi,
        badge: "Coming Soon",
        date: "06/20/2025",
        genre: "Cartoon"
    },
    {
        title: "Dragon Training",
        img: luyenrong,
        badge: "Coming Soon",
        date: "06/20/2025",
        genre: "Adventure"
    }
];

const promotions = [
    {
        img: KM,
        title: "June Promotion - 10% Off",
        desc: "Applicable across all theaters."
    },
    {
        img: KM,
        title: "June Promotion - 20% Off",
        desc: "Applicable across all theaters."
    },
    {
        img: KM,
        title: "June Promotion - 30% Off",
        desc: "Applicable across all theaters."
    }
];

const Home = () => {
    return (
        <div className="home">
            <main className="home-content">
                {/* Banner/Slide */}
                <section className="home-slide">
                    <div className="slide-container">
                        <Carousel autoplay effect="fade" style={{ width: "100%", height: "auto", maxHeight: "450px" }}>
                            {/* Slide 1 */}
                            <div className="slide-item">
                                <img src={Slide1} alt="Slide1" />
                                <div className="slide-overlay">
                                    <h1 className="slide-title">Doraemon: Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh</h1>
                                    <p className="slide-desc">Genre: Animation, Adventure | Nobita and friends explore a mysterious land in the sky with thrilling adventures.</p>
                                    <div className="slide-cta">
                                        <button className="slide-btn buy">Buy Ticket</button>
                                        <button className="slide-btn trailer">Watch Trailer</button>
                                    </div>
                                </div>
                            </div>
                            {/* Slide 2 */}
                            <div className="slide-item">
                                <img src={Slide2} alt="Slide2" />
                                <div className="slide-overlay">
                                    <h1 className="slide-title">Lilo & Stitch: Người Bạn Đến Từ Hành Tinh Khác</h1>
                                    <p className="slide-desc">Genre: Animation, Family | A heartwarming story about the friendship between Lilo and the alien creature Stitch.</p>
                                    <div className="slide-cta">
                                        <button className="slide-btn buy">Buy Ticket</button>
                                        <button className="slide-btn trailer">Watch Trailer</button>
                                    </div>
                                </div>
                            </div>
                                {/* Slide 3 */}
                            <div className="slide-item">
                                <img src={Slide3} alt="Slide3" />
                                <div className="slide-overlay">
                                    <h1 className="slide-title">Thám Tử Kiên: Bí Ẩn Ngôi Làng Ma</h1>
                                    <p className="slide-desc">Genre: Horror, Detective | Detective Kien unravels eerie mysteries in a haunted village.</p>
                                    <div className="slide-cta">
                                        <button className="slide-btn buy">Buy Ticket</button>
                                        <button className="slide-btn trailer">Watch Trailer</button>
                                    </div>
                                </div>
                            </div>
                            {/* Slide 4 */}
                            <div className="slide-item">
                                <img src={Slide4} alt="Slide4" />
                                <div className="slide-overlay">
                                    <h1 className="slide-title">Lật Mặt 8: Vòng Tay Nắng</h1>
                                    <p className="slide-desc">Genre: Adventure, Family | An inspiring adventure about friendship and courage.</p>
                                    <div className="slide-cta">
                                        <button className="slide-btn buy">Buy Ticket</button>
                                        <button className="slide-btn trailer">Watch Trailer</button>
                                    </div>
                                </div>
                            </div>
                            {/* Slide 5 */}
                            <div className="slide-item">
                                <img src={Slide5} alt="Slide5" />
                                <div className="slide-overlay">
                                    <h1 className="slide-title">Conan: Cú Đấm Sapphire Xanh</h1>
                                    <p className="slide-desc">Genre: Animation, Family | An inspiring adventure about friendship and courage.</p>
                                    <div className="slide-cta">
                                        <button className="slide-btn buy">Buy Ticket</button>
                                        <button className="slide-btn trailer">Watch Trailer</button>
                                    </div>
                                </div>
                            </div>
                        </Carousel>
                    </div>
                </section>
                {/* Now Showing */}
                <section className="movie-section">
                    <div className="section-header">
                        <h2>Now Showing</h2>
                        <Link to="/movie" className="see-all">See All &rarr;</Link>
                        </div>
                    <div className="movie-list">
                         {showingMovies.map((movie, idx) => (
                            <div className="movie-card" key={idx}>
                                <img src={movie.img} alt={movie.title} className="movie-img" />
                                <div className="movie-info">
                                    <div className="movie-title">{movie.title}</div>
                                    <div className="movie-rating-row">
                                        <span className="movie-star">★</span>
                                        <span className="movie-score">{movie.rating}/10</span>
                                    </div>
                                    <div className="movie-extra-row">
                                        <span className="movie-minutes">{movie.showtimes}</span>
                                        <span className="movie-genre-btn">{movie.genre}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Coming Soon */}
                <section className="movie-section">
                    <div className="section-header">
                        <h2>Coming Soon</h2>
                    </div>
                    <div className="movie-list">
                        {comingMovies.map((movie, idx) => (
                            <div className="coming-soon-card" key={idx}>
                                <div className="coming-img-wrap">
                                    <img src={movie.img} alt={movie.title} className="coming-img" />
                                    <div className="coming-badge">{movie.badge}</div>
                                </div>
                                <div className="coming-info">
                                    <div className="coming-title">{movie.title || 'Movie Title'}</div>
                                    <div className="coming-date">Release Date: {movie.date || '06/30/2025'}</div>
                                    {movie.genre && (
                                        <span className="coming-genre-btn">{movie.genre}</span>
                                    )}
                                </div>
                                </div>
                        ))}
                    </div>
                </section>
                {/* Special Promotions */}
                <section className="promo-section">
                    <div className="section-header">
                        <h2>Special Promotions</h2>
                    </div>
                    <div className="promo-list">
                        {promotions.map((promo, idx) => (
                            <div className="promo-card" key={idx}>
                                <img src={promo.img} alt={promo.title} className="promo-img" />
                                <div className="promo-info">
                                    <div className="promo-title">{promo.title}</div>
                                    <div className="promo-desc">{promo.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;