import "./PaymentSuccess.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticketData, setTicketData] = useState(null);
  const [moviePoster, setMoviePoster] = useState("");

  const getQueryParam = (param) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(param);
  };
  const invoiceId = getQueryParam("invoiceId");
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const weekday = date.toLocaleString("default", { weekday: "short" });
    return { day, month, weekday };
  };
  useEffect(() => {
    const fetchTicketInformation = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `https://legally-actual-mollusk.ngrok-free.app/api/employee/bookings/${invoiceId}`,
          {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch ticket details: ${response.status}`);
        }
        const data = await response.json();
        setTicketData(data);

        // Fetch movie poster
        const movieResponse = await fetch(
          `https://legally-actual-mollusk.ngrok-free.app/api/public/movies?q=${encodeURIComponent(
            data.movieName
          )}`,
          {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!movieResponse.ok) {
          throw new Error(
            `Failed to fetch movie details: ${movieResponse.status}`
          );
        }
        const movieData = await movieResponse.json();
        if (movieData.length > 0) {
          setMoviePoster(movieData[0].largeImage);
        }
      } catch (error) {
        console.error("Error in fetchTicketDetails:", error);
        alert("Failed to load ticket details. Please try again.");
      }
    };

    if (invoiceId) {
      fetchTicketInformation();
    } else {
      alert("Invalid ticket information.");
    }
  }, [invoiceId]);

  if (!ticketData) return <div>Loading...</div>;

  const { day, month, weekday } = formatDate(ticketData.date);

  return (
    <div className="payment-success-page">
      <div className="poster-section">
        <img
          src={moviePoster || "https://via.placeholder.com/220x330"}
          alt="Movie Poster"
          className="movie-poster"
        />
        <div className="poster-title">{ticketData.movieName}</div>
      </div>
      <div className="success-info">
        <div className="success-header">Payment successfully</div>
        <div className="info-group">
          <div className="info-label">Movie Title</div>
          <div className="info-value">{ticketData.movieName}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Room</div>
          <div className="info-value">{ticketData.cinemaRoomName || "1"}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Date</div>
          <div className="info-value">{`${weekday}, ${day} ${month}`}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Ticket</div>
          <div className="info-value">{ticketData.seat.join(", ")}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Hours</div>
          <div className="info-value">
            {new Date(ticketData.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className="info-group">
          <div className="info-label">Total Price</div>
          <div className="info-value">{ticketData.total} VND</div>
        </div>
        <div className="thank-you">Thank you !</div>
        <button className="home-btn" onClick={() => navigate("/")}>
          Back to Home page
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
