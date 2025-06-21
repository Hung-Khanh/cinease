import React, { useState, useEffect } from "react";
import "./Movie.scss";
import { useNavigate } from "react-router-dom";

const Movie = () => {
  const navigate = useNavigate();
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [genre, setGenre] = useState("all");
  const moviesPerPage = 12;
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const token = localStorage.getItem("token");
  console.log(token);
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${apiUrl}/public/movies`, {
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
        const extractedMovies = data.map((movie) => ({
          id: movie.movieId,
          title: movie.movieNameEnglish,
          img: movie.largeImage,
          rating: movie.rating || 9.0,
          duration: movie.duration ? `${movie.duration} min` : "120 min",
          genre: movie.version || "Unknown",
          types: movie.types || "Unknown"
        }));
        setNowShowing(extractedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setNowShowing([]);
      }
    };
    const fetchComingSoonMovies = async () => {
      try {
        const response = await fetch(`${apiUrl}/public/movie/upcoming`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        console.log(response.data); // Kiểm tra dữ liệu trả về
        const data = await response.json();
        const comingSoonData = data.content;

        if (Array.isArray(comingSoonData)) {
          const extractedComingSoonMovies = comingSoonData.map((movie) => ({
            id: movie.movieId,
            title: movie.movieNameEnglish,
            img: movie.largeImage,
            date: movie.fromDate || "Unknown",
            badge: "Coming Soon",
            genre: movie.version || "Unknown",
            types: movie.types || "Unknown",
          }));
          setComingSoonMovies(extractedComingSoonMovies);
        } else {
          console.error("Dữ liệu không phải là mảng:", comingSoonData);
          setComingSoonMovies([]);
        }
      } catch (error) {
        console.error("Error fetching coming soon movies:", error);
        setComingSoonMovies([]);
      }
    };
    fetchMovies();
    fetchComingSoonMovies();
  }, [apiUrl, token]);

  const genreOptions = [
    ...new Set(nowShowing.map(m => m.genre))
  ];

  let filtered = nowShowing.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) &&
    (genre === "all" || m.genre === genre)
  );

  if (sort === "rating") {
    filtered = filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === "oldest") {
    filtered = filtered.reverse();
  }

  const totalPages = Math.ceil(filtered.length / moviesPerPage);

  return (
    <div className="movie-page">
      <h2 className="movie-title">Search Movie</h2>
      <div className="movie-search-bar">
        <input
          type="text"
          placeholder="Search by movie name..."
          className="movie-search-input"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="movie-filter-select"
          value={genre}
          onChange={e => { setGenre(e.target.value); setPage(1); }}
        >
          <option value="all">All Genres</option>
          {genreOptions.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          className="movie-sort-select"
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
        >
          <option value="latest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>
      <div className="movie-section-header">
        <span>Now Showing</span>
      </div>
      <div className="movie-grid">
        {filtered
          .slice((page - 1) * moviesPerPage, page * moviesPerPage)
          .map((movie, idx) => (
            <div className="movie-card" key={idx} onClick={() => navigate(`/description-movie/${movie.id}`)} style={{ cursor: 'pointer' }}>
              <img src={movie.img} alt={movie.title} className="movie-img" />
              <div className="movie-info">
                <div className="movie-title">{movie.title}</div>
                <div className="movie-rating-row">
                  <span className="movie-star">★</span>
                  <span className="movie-score">{movie.rating}/10</span>
                </div>
                <div className="movie-extra-row">
                  <span>{movie.duration}</span>
                  <span className="movie-genre">{movie.genre}</span>
                  <span className="movie-genre">{movie.types}</span>
                </div>
                <button className="movie-buy-btn">Book Ticket</button>
              </div>
            </div>
          ))}
      </div>
      {filtered.length > 0 && (
        <div className="movie-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>&lt;</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>&gt;</button>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="no-results">
          <p>Not Found</p>
        </div>
      )}
      <div className="movie-coming-soon-section">
        <span>Coming Soon</span>
        <div className="movie-coming-soon-list">
          {comingSoonMovies.map((movie, idx) => (
            <div className="coming-soon-card" key={idx}>
              <img src={movie.img} alt={movie.title} className="coming-soon-img" />
              <div className="coming-soon-info">
                <div className="coming-soon-title">{movie.title}</div>
                <div className="coming-soon-release">{movie.release}</div>
                <span className="movie-genre">{movie.genre}</span>
              </div>
              <span className="coming-soon-badge">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Movie;