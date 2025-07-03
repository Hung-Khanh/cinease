import React, { useEffect, useState } from "react";
import "./DescriptionMovie.scss";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const DescriptionMovie = () => {
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [isTrailerVisible, setTrailerVisible] = useState(false);
    const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
    const { movieId } = useParams();
    const token = sessionStorage.getItem("token");

    const fetchMovieDetails = async () => {
        try {
            const response = await fetch(`${apiUrl}/public/movies/details/${movieId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });
            if (!response.ok) {
                console.error("HTTP error:", response.status);
                return;
            }
            const data = await response.json();

            if (data) {
                setMovie(data);
            } else {
                console.error("Movie data not found:", data);
            }
        } catch (error) {
            console.error("Error fetching movie data:", error);
        }
    };

    useEffect(() => {
        fetchMovieDetails();
    }, []);

    const handleTrailerClick = () => {
        setTrailerVisible(!isTrailerVisible);
    };
    const handleOverlayClick = () => {
        setTrailerVisible(false);
    };
    return (
        <div className="description-page">
            <div className="description-container">
                <h1 className="page-header">Description</h1>
                <div className="poster-section">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <FaArrowLeft />
                    </button>
                    <img src={movie?.posterImageUrl} alt={movie?.movieNameEnglish} className="movie-poster-description" />
                    <div className="poster-title">{movie?.movieNameEnglish}</div>
                    <button className="trailer-btn" onClick={handleTrailerClick}>Trailer</button>
                </div>

                {isTrailerVisible && (
                    <div className="trailer-overlay" onClick={handleOverlayClick}>
                        <div className="trailer-container" onClick={(e) => e.stopPropagation()}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={movie?.trailerUrl}
                                title="Trailer"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                <div className="movie-frame">
                    <div className="movie-header">
                        <div className="movie-subtitle">Movie Title</div>
                        <div className="movie-title">{movie?.movieNameEnglish}</div>
                    </div>

                    <div className="movie-content">
                        <div className="movie-subtitle">Description</div>
                        <p className="movie-description">{movie?.content}</p>
                    </div>

                    <Link
                        to={`/select-showtime/${movieId}`}
                        state={{ movieId: movie?.movieId }}
                        className="buy-ticket-btn"
                        style={{ display: new Date(movie?.fromDate) > new Date() ? 'none' : 'block' }} // Ẩn nút nếu phim chưa phát hành
                    >
                        Buy Ticket
                    </Link>



                    <table className="movie-details">
                        <tbody>
                            <tr><td>Duration (min)</td><td>{movie?.duration}</td></tr>
                            <tr><td>Actor</td><td>{movie?.actor}</td></tr>
                            <tr><td>From date</td><td>{movie?.fromDate}</td></tr>
                            <tr><td>To date</td><td>{movie?.toDate}</td></tr>
                            <tr><td>Version</td><td>{movie?.version}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default DescriptionMovie;