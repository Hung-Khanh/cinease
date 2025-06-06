import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "../SCSS/SHomePage.scss";

const { Meta } = Card;

const SHomePage = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const token = localStorage.getItem("token");

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${apiUrl}/public/movie/now-showing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Movies data:", data);

      // Lọc dữ liệu chỉ lấy movieNameEnglish và largeImage
      const extractedMovies = data.content.map((movie) => ({
        movieNameEnglish: movie.movieNameEnglish,
        largeImage: movie.largeImage,
        movieId: movie.movieId,
      }));
      setMovies(extractedMovies);
      console.log(
        "movieID: ",
        extractedMovies.map((movie) => movie.movieId)
      );
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMovies();
    }
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
