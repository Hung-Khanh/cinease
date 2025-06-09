import { useEffect, useState } from "react";
import { Carousel, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD:src/pages/Staff/JSX/SHomePage.jsx
import "../SCSS/SHomePage.scss";
=======
import "./SHomePage.scss";
import api from "../../constants/axios";
>>>>>>> 9a6be20954a3bdcef22b8b082f3218c79aac260d:src/pages/Staff/SHomePage.jsx

const { Meta } = Card;

const SHomePage = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
<<<<<<< HEAD:src/pages/Staff/JSX/SHomePage.jsx
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
=======
  const apiUrl = "https://c887-118-69-61-33.ngrok-free.app/api";
>>>>>>> 9a6be20954a3bdcef22b8b082f3218c79aac260d:src/pages/Staff/SHomePage.jsx
  const token = localStorage.getItem("token");

  const fetchMovies = async () => {
    try {
<<<<<<< HEAD:src/pages/Staff/JSX/SHomePage.jsx
      const response = await fetch(`${apiUrl}/public/movie/now-showing`, {
=======
      const response = await api.get('/public/movies', {
>>>>>>> 9a6be20954a3bdcef22b8b082f3218c79aac260d:src/pages/Staff/SHomePage.jsx
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = response.data;

<<<<<<< HEAD:src/pages/Staff/JSX/SHomePage.jsx
      const data = await response.json();

      // Lọc dữ liệu chỉ lấy movieNameEnglish và largeImage
      const extractedMovies = data.content.map((movie) => ({
=======
      const extractedMovies = data.map((movie) => ({
>>>>>>> 9a6be20954a3bdcef22b8b082f3218c79aac260d:src/pages/Staff/SHomePage.jsx
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
