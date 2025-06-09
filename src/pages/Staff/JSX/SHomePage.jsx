import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "../SCSS/SHomePage.scss";

const { Meta } = Card;

const SHomePage = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";

  const fetchMovies = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiUrl}/public/movie/now-showing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await response.json();

      // Lọc dữ liệu chỉ lấy movieNameEnglish và largeImage
      const extractedMovies = data.content.map((movie) => ({
        movieNameEnglish: movie.movieNameEnglish,
        largeImage: movie.largeImage,
        movieId: movie.movieId,
      }));
      setMovies(extractedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="shomepage-container">
      <div className="content">
        <h1>SHOWING MOVIES</h1>
        <Carousel
          slidesToShow={4}
          slidesToScroll={1}
          arrows
          infinite
          autoplay={true}
          autoplaySpeed={2500}
          className="movie-carousel"
        >
          {movies.map((movie, index) => (
            <div key={index} className="carousel-slide">
              <Card
                hoverable
                className="movie-card"
                cover={
                  <img
                    src={movie.largeImage}
                    alt={movie.movieNameEnglish}
                    className="movie-poster"
                  />
                }
              >
                <Meta title={movie.movieNameEnglish} />
                <Button
                  onClick={() => {
                    navigate(`/DateTimeSelection/${movie.movieId}`);
                    console.log("Movie ID:", movie.movieId);
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
    </div>
  );
};

export default SHomePage;
