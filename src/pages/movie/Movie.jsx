import React, { useState, useEffect } from "react";
import "./Movie.scss";
import api from '../../constants/axios';

const comingSoon = [
  {
    title: "Coming Soon 1",
    img: "https://metiz.vn/media/poster_film/d_m_n_-_cu_c_phi_u_l_u_t_i_x_m_l_y_l_i_-_teaser_poster_-_kc_30052025_1_.jpg",
    release: "Release: 15/06/2025",
    genre: "Adventure",
  },
  {
    title: "Coming Soon 2",
    img: "https://cdn.flickeringmyth.com/wp-content/uploads/2024/12/BALLERINA_2025x3000_Online_1SHT_BACK_TATTOO_V5_rgb-600x889.jpg",
    release: "Release: 15/06/2025",
    genre: "Adventure",
  },
  {
    title: "Coming Soon 3",
    img: "https://static1.srcdn.com/wordpress/wp-content/uploads/2024/11/htd_teaser1sheet7_rgb_2sm.jpg",
    release: "Release: 15/06/2025",
    genre: "Adventure",
  },
  {
    title: "Coming Soon 4",
    img: "https://cdn.flickeringmyth.com/wp-content/uploads/2024/12/BALLERINA_2025x3000_Online_1SHT_BACK_TATTOO_V5_rgb-600x889.jpg",
    release: "Release: 15/06/2025",
    genre: "Adventure",
  },
  {
    title: "Coming Soon 5",
    img: "https://metiz.vn/media/poster_film/d_m_n_-_cu_c_phi_u_l_u_t_i_x_m_l_y_l_i_-_teaser_poster_-_kc_30052025_1_.jpg",
    release: "Release: 15/06/2025",
    genre: "Adventure",
  },
  {
    title: "Coming Soon 6",
    img: "https://metiz.vn/media/poster_film/d_m_n_-_cu_c_phi_u_l_u_t_i_x_m_l_y_l_i_-_teaser_poster_-_kc_30052025_1_.jpg",
    release: "Release: 15/06/2025",
    genre: "Adventure",
  },
];

const Movie = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [genre, setGenre] = useState("all");
  const moviesPerPage = 10;

  useEffect(() => {
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
          title: movie.movieNameEnglish,
          img: movie.largeImage,
          rating: movie.rating || 9.0,
          duration: movie.duration ? `${movie.duration} min` : "120 min",
          genre: movie.genre || "Unknown"
        }));
        setNowShowing(extractedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setNowShowing([]);
      }
    };
    fetchMovies();
  }, []);

  const genreOptions = [
    ...new Set(nowShowing.map(m => m.genre))
  ];
  let filtered = nowShowing.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) &&
    (genre === "all" || m.genre === genre)
  );
  if (sort === "rating") {
    filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
  } else if (sort === "oldest") {
    filtered = filtered.slice().reverse();
  }

  let dynamicMoviesPerPage = moviesPerPage;
  if (filtered.length <= 5) {
    dynamicMoviesPerPage = 5;
  } else if (filtered.length <= 10) {
    dynamicMoviesPerPage = 10;
  }

  const totalPages = Math.ceil(filtered.length / dynamicMoviesPerPage);

  return (
    <div className="movie-page">
      <h2 className="movie-title">Search Movie</h2>
      <div className="movie-search-bar">
        <input type="text" placeholder="Search by movie name..." className="movie-search-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="movie-filter-select" value={genre} onChange={e => { setGenre(e.target.value); setPage(1); }}>
          <option value="all">All Genres</option>
          {genreOptions.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select className="movie-sort-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
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
          .slice((page - 1) * dynamicMoviesPerPage, page * dynamicMoviesPerPage)
          .map((movie, idx) => (
            <div className="movie-card" key={idx}>
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
                </div>
                <button className="movie-buy-btn">Book Ticket</button>
              </div>
            </div>
          ))}
        {dynamicMoviesPerPage > 5 && Array(dynamicMoviesPerPage - filtered.slice((page - 1) * dynamicMoviesPerPage, page * dynamicMoviesPerPage).length)
          .fill(0)
          .map((_, idx) => (
            <div key={`empty-${idx}`} className="movie-card movie-card--empty" />
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
          {comingSoon.map((movie, idx) => (
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