import { Carousel, Rate, Badge, Tooltip } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KM from "../../assets/KM.png";
import "./Home.scss";
import { getNowShowingMovies, getComingSoonMovies } from '../../api/movie';
import { getPromotions } from '../../api/promotion';

const Home = () => {
    const navigate = useNavigate();
    const [showingMovies, setShowingMovies] = useState([]);
    const [comingSoonMovies, setComingSoonMovies] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [trailerVisible, setTrailerVisible] = useState(null);
    useEffect(() => {
        const fetchMovies = async () => {
    try {
        const response = await getNowShowingMovies();
        if (response.status !== 200) {
            console.error("HTTP error:", response.status);
            return;
        }
        const data = response.data;
        const filmData = data.content;
        if (Array.isArray(filmData)) {
            const extractedMovies = filmData.map((movie) => ({
                id: movie.movieId,
                title: movie.movieNameEnglish,
                poster: movie.posterImageUrl || KM,
                img: movie.largeImage,
                rating: movie.rating,
                genre: movie.version || "Unknown",
                types: movie.types || "Unknown",
                showtimes: movie.duration ? `${movie.duration} min` : "120 min",
                trailer: movie.trailerUrl,
                desc: movie.content,
            }));
            setShowingMovies(extractedMovies);
        } else {
            console.error("Dữ liệu không phải là mảng:", filmData);
            setShowingMovies([]);
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        setShowingMovies([]);
    }
};

        const fetchComingSoonMovies = async () => {
    try {
        const response = await getComingSoonMovies();
        const data = response.data.content;
        const extractedComingSoonMovies = data.map((movie) => ({
            id: movie.movieId,
            title: movie.movieNameEnglish,
            img: movie.posterImageUrl,
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
};

        const fetchPromotions = async () => {
    try {
        const response = await getPromotions();
        const data = response.data;
        const extractedPromotions = data.map((promo) => ({
            id: promo.promotionId,
            title: promo.title,
            img: promo.image,
            detail: promo.detail,
            startTime: promo.startTime,
            endTime: promo.endTime,
        }));
        setPromotions(extractedPromotions);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotions([]);
    }
};
        fetchMovies();
        fetchComingSoonMovies();
        fetchPromotions();
    }, []);

    return (
        <div className="home">
            <main className="home-content">
                <section className="home-slide">
                    <div className="slide-container">
                        <Carousel autoplay effect="fade" style={{ width: "100%", height: "auto", maxHeight: "450px" }}>
                            {showingMovies.map((movie, index) => (
                                <div className="slide-item" key={index}>
                                    <img src={movie.img} alt={movie.title} />
                                    <div className="slide-overlay">
                                        <h1 className="slide-title">{movie.title}</h1>
                                        <p className="slide-desc">{movie.desc}</p>
                                        <div className="slide-cta">
                                            <button className="slide-btn buy" onClick={() => navigate(`/select-showtime/${movie.id}`)}>Buy Ticket</button>
                                            <button
                                                className="slide-btn trailer"
                                                onClick={() => setTrailerVisible(movie.trailer)} // Use state to show trailer overlay
                                            >
                                                Watch Trailer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </section>

                {trailerVisible && (
                    <div className="trailer-overlay" onClick={() => setTrailerVisible(null)}>
                        <div className="trailer-container" onClick={(e) => e.stopPropagation()}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={trailerVisible} 
                                title="Trailer"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
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
                                <Tooltip title={movie.title} key={idx}>
                                    <div className="movie-card" key={idx} onClick={() => navigate(`/description-movie/${movie.id}`)} style={{ cursor: 'pointer' }}>
                                    <img src={movie.poster} alt={movie.title} className="movie-img" />
                                    <div className="movie-info">
                                        <div className="movie-title">{movie.title}</div>
                                        <div className="movie-rating-row">
                                            <span className="movie-star">★</span>
                                            <span className="movie-score">{movie.rating}9/10</span>
                                        </div>
                                        <div className="movie-extra-row">
                                            <span className="movie-minutes">{movie.showtimes}</span>
                                            <span className="movie-genre-btn">{movie.genre}</span>
                                            <span className="movie-genre-btn">{movie.types}</span>
                                        </div>
                                    </div>
                                </div>
                                </Tooltip>
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
                                <Tooltip title={movie.title} key={idx}>
                                <div className="coming-soon-card" key={idx} onClick={() => navigate(`/description-movie/${movie.id}`)} style={{ cursor: 'pointer' }}>
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
                                </Tooltip>
                            ))}
                        </Carousel>
                    </div>
                </section>
                <section className="promo-section">
                    <div className="section-header">
                        <h2>Special Promotions</h2>
                    </div>
                    <div className="promo-list">
                        {promotions.map((promo, idx) => {
                            const startDate = new Date(promo.startTime);
                            const endDate = new Date(promo.endTime);
                            const options = { year: 'numeric', month: 'long', day: 'numeric' };
                            const formattedStartDate = startDate.toLocaleDateString('en-US', options);
                            const formattedEndDate = endDate.toLocaleDateString('en-US', options);

                            return (
                                <Tooltip title={promo.title} key={idx}>
                                <div className="promo-card" key={idx}>
                                    <img src={promo.img} alt={promo.title} className="promo-img" />
                                    <div className="promo-info">
                                        <div className="promo-title">{promo.title}</div>
                                        {/* Display formatted dates */}
                                        <div className="promo-date">Start: {formattedStartDate}</div>
                                        <div className="promo-date">End: {formattedEndDate}</div>
                                    </div>
                                </div>
                                </Tooltip>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;