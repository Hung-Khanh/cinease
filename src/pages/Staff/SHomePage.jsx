import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "./SHomePage.scss";
import api from "../../constants/axios";

const { Meta } = Card;

const SHomePage = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

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
        movieNameEnglish: movie.movieNameEnglish,
        largeImage: movie.largeImage,
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
          autoplaySpeed={3000}
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
                  onClick={() => navigate("/dateTimeSelection")}
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
