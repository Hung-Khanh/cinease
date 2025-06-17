import { Carousel, Rate, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Slide1 from "../../assets/Slide1.png";
import KM from "../../assets/KM.png";
import "./Home.scss";
import api from '../../constants/axios';

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
    const [comingSoonMovies, setComingSoonMovies] = useState([]);
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
                    rating: movie.rating,
                    genre: movie.version || "Unknown",
                    types: movie.types || "Unknown",
                    showtimes: movie.duration ? `${movie.duration} min` : "120 min"
                }));
                setShowingMovies(extractedMovies);
            } catch (error) {
                console.error("Error fetching movies:", error);
                setShowingMovies([]);
            }
        };

        const fetchComingSoonMovies = async () => {
            try {
                const response = await api.get('/public/movie/upcoming', {
                    headers: {
                        Accept: "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                });
                console.log(response.data); // Kiểm tra dữ liệu trả về
        const data = response.data.content;
                const extractedComingSoonMovies = data.map((movie) => ({
                    id: movie.movieId,
                    title: movie.movieNameEnglish,
                    img: movie.largeImage,
                    date: movie.fromDate || "Unknown",
                    badge: "Coming Soon",
                    genre: movie.version || "Unknown",
                    types: movie.types || "Unknown",
                }));
                setComingSoonMovies(extractedComingSoonMovies);
            } catch (error) {
                console.error("Error fetching coming soon movies:", error);
                setComingSoonMovies([]);
            }
        }
        fetchMovies();
        fetchComingSoonMovies();
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
                                <div className="movie-card" key={idx} onClick={() => navigate(`/description-movie/${movie.id}`)} style={{ cursor: 'pointer' }}>
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
                                            <span className="movie-genre-btn">{movie.types}</span>
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
                            infinite={comingSoonMovies.length > 5}
                            responsive={[
                                { breakpoint: 1200, settings: { slidesToShow: 3 } },
                                { breakpoint: 900, settings: { slidesToShow: 2 } },
                                { breakpoint: 600, settings: { slidesToShow: 1 } },
                            ]}
                            className="movie-carousel"
                        >
                            {comingSoonMovies.map((movie, idx) => (
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