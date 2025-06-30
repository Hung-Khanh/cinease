import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "../SCSS/SHomePage.scss";

const { Meta } = Card;

const SHomePage = () => {
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
      console.log("API response data:", data);
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

  console.log("Current movies:", movies);

  return (
    <div className="shomepage-container">
      <div className="content">
        <h1>SHOWING MOVIES</h1>
        {isLoading ? (
          <p>Loading movies...</p>
        ) : movies.length === 0 ? (
          <p>No movies available.</p>
        ) : (
          <div className="carousel-wrapper">
            <Carousel
              slidesToShow={4}
              slidesToScroll={1}
              arrows
              infinite
              autoplay={true}
              autoplaySpeed={2500}
              className="movie-carousel"
              spaceBetween={20}
            >
              {movies.map((movie) => (
                <div key={movie.movieId} className="carousel-slide">
                  <Card
                    hoverable
                    className="movie-card"
                    cover={
                      <img
                        src={
                          movie.posterImageUrl ||
                          "https://via.placeholder.com/200x300"
                        }
                        alt={movie.movieNameVn || "Movie Poster"}
                        className="movie-poster"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/200x300";
                        }}
                      />
                    }
                  >
                    <Meta title={movie.movieNameVn || "No Title"} />
                    <Button
                      onClick={() => {
                        navigate(`/DateTimeSelection/${movie.movieId}`);
                      }}
                      type="primary"
                      className="book-button"
                    >
                      Book
                    </Button>
                  </Card>
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default SHomePage;
