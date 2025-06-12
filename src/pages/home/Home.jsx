import { Carousel, Rate, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Slide1 from "../../assets/Slide1.png";
import Slide2 from "../../assets/Slide2.png";
import Slide3 from "../../assets/Slide3.png";
import Slide4 from "../../assets/Slide4.png";
import Slide5 from "../../assets/Slide5.png";
import demen from "../../assets/demen.png";
import mamochong from "../../assets/mamochong.png";
import ballerina from "../../assets/ballerina.png";
import todoigaunhi from "../../assets/todoigaunhi.png";
import luyenrong from "../../assets/luyenrong.png";
import KM from "../../assets/KM.png";
import "./Home.scss";
import api from '../../constants/axios';

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
    const navigate = useNavigate();
    const [showingMovies, setShowingMovies] = useState([]);
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await api.get('/public/movies', {
                    headers: {
                        Accept: "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                });
                const data = response.data;
                const extractedMovies = data.map((movie) => ({
                    id: movie.movieId,
                    title: movie.movieNameEnglish,
                    img: movie.largeImage,
                    rating: movie.rating || 9.0,
                    genre: movie.genre || "Unknown",
                    showtimes: movie.duration ? `${movie.duration} min` : "120 min"
                }));
                setShowingMovies(extractedMovies);
            } catch (error) {
                console.error("Error fetching movies:", error);
                setShowingMovies([]);
            }
        };
        fetchMovies();
    }, []);

    return (
        <div className="home">
            <main className="home-content">
                <section className="home-slide">
                    <div className="slide-container">
                        <Carousel autoplay effect="fade" style={{ width: "100%", height: "auto", maxHeight: "450px" }}>
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
                <section className="movie-section">
                    <div className="section-header">
                        <h2>Now Showing</h2>
                        <Link to="/movie" className="see-all">See All &rarr;</Link>
                    </div>
                    <div className="movie-carousel-wrap">
  <Carousel
    slidesToShow={5}
    arrows
    infinite={showingMovies.length > 5}
    responsive={[
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ]}
    className="movie-carousel"
  >
    {showingMovies.map((movie, idx) => (
      <div className="movie-card" key={idx} onClick={() => navigate(`/description-movie/${movie.id}`)} style={{cursor: 'pointer'}}>
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
  </Carousel>
</div>
                </section>
                <section className="movie-section">
                    <div className="section-header">
                        <h2>Coming Soon</h2>
                    </div>
                    <div className="movie-carousel-wrap">
  <Carousel
    slidesToShow={5}
    arrows
    infinite={comingMovies.length > 5}
    responsive={[
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ]}
    className="movie-carousel"
  >
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
  </Carousel>
</div>
                </section>
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