import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "../SCSS/SHomePage.scss";

const { Meta } = Card;

const SHomePage = () => {
  const now = new Date();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";

  const fetchMovies = async () => {
    const token = sessionStorage.getItem("token") || "";

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
    if (!movie.toDate) return true; // Nếu không có toDate thì vẫn hiển thị
    const movieToDate = new Date(movie.toDate);
    return movieToDate >= now;
  });

  return (
    <div className="shp-container">
      <div className="shp-content">
        <h1>SHOWING MOVIES</h1>
        {isLoading ? (
          <p>Loading movies...</p>
        ) : filteredMovies.length === 0 ? (
          <p>No movies available.</p>
        ) : (
          <div className="shp-carousel-wrapper">
            <Carousel
              slidesToShow={4}
              slidesToScroll={1}
              arrows
              infinite
              autoplay={true}
              autoplaySpeed={2500}
              className="shp-movie-carousel"
              spaceBetween={20}
            >
              {filteredMovies.map((movie) => (
                <div key={movie.movieId} className="shp-carousel-slide">
                  <Card
                    hoverable
                    className="shp-movie-card"
                    cover={
                      <img
                        src={
                          movie.posterImageUrl ||
                          "https://via.placeholder.com/200x300"
                        }
                        alt={movie.movieNameVn || "Movie Poster"}
                        className="shp-movie-poster"
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
                      className="shp-book-button"
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
