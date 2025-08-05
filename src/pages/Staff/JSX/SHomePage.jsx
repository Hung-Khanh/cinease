"use client";

import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { FaFilm } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { ToastHandler } from "../../../../utils/toastHandler";
import "react-toastify/dist/ReactToastify.css";
import "../SCSS/SHomePage.scss";

const { Meta } = Card;

const SHomePage = () => {
  const now = new Date();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";

  const fetchMovies = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const response = await fetch(`${apiUrl}/public/movie/now-showing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMovies(data?.content || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    if (!movie.toDate) return true;
    const movieToDate = new Date(movie.toDate);
    return movieToDate >= now;
  });

  // Carousel responsive settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="shp-container">
      <ToastHandler />

      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="shp-content">
        <h1>NOW SHOWING</h1>

        {isLoading ? (
          <div className="shp-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading movies...</div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="shp-no-movies">
            <FaFilm className="no-movies-icon" />
            <p className="no-movies-text">No movies available at the moment.</p>
          </div>
        ) : (
          <div className="shp-carousel-wrapper">
            <Carousel {...carouselSettings} className="shp-movie-carousel">
              {filteredMovies.map((movie) => (
                <div key={movie.movieId} className="shp-carousel-slide">
                  <Card
                    hoverable
                    className="shp-movie-card"
                    cover={
                      <img
                        src={
                          movie.posterImageUrl ||
                          "/placeholder.svg?height=350&width=250&query=movie poster"
                        }
                        alt={movie.movieNameVn || "Movie Poster"}
                        className="shp-movie-poster"
                        onError={(e) => {
                          e.target.src =
                            "/placeholder.svg?height=350&width=250";
                        }}
                      />
                    }
                  >
                    <Meta title={movie.movieNameVn || "No Title"} />
                    <div className="shp-movie-rating">
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${
                              star <= Math.round(movie.avgFeedback || 0)
                                ? "filled"
                                : "empty"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="rating-text">
                        {movie.avgFeedback
                          ? movie.avgFeedback.toFixed(1)
                          : "0.0"}
                        /5
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        navigate(`/DateTimeSelection/${movie.movieId}`);
                      }}
                      type="primary"
                      className="shp-book-button"
                    >
                      Book Now
                    </Button>
                  </Card>
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SHomePage;
