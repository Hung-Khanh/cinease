import "./PaymentSuccess.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticketData, setTicketData] = useState(null);
  const [moviePoster, setMoviePoster] = useState("");
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const getQueryParam = (param) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(param);
  };

  const invoiceId = getQueryParam("invoiceId");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      weekday: date.toLocaleString("default", { weekday: "short" }),
    };
  };

  useEffect(() => {
    const fetchTicketInformation = async () => {
      if (!invoiceId) return;

      try {
        const response = await fetch(
          `${apiUrl}/public/booking-summary?invoiceId=${invoiceId}`,
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

        if (data.movieName) {
          const movieResponse = await fetch(
            `${apiUrl}/public/movies?q=${encodeURIComponent(data.movieName)}`,
            {
              method: "GET",
              headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          if (movieResponse.ok) {
            const movieData = await movieResponse.json();
            if (movieData.length > 0) {
              setMoviePoster(movieData[0].largeImage);
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchTicketDetails:", error);
        alert("Failed to load ticket details. Please try again.");
      }
    };

    fetchTicketInformation();
  }, [invoiceId, apiUrl, token]);

  if (!ticketData) return <div>Loading...</div>;

  const { day, month, weekday } = formatDate(ticketData.scheduleShowDate);

  const handleBackToHome = () => {
    navigate(role === "EMPLOYEE" ? "/staffHomePage" : "/");
  };

  return (
    <div className="payment-success-page">
      <div className="ticket">
        <div className="ticket-header">Ticket</div>
        <div className="poster-section">
          <img
            src={moviePoster || "https://via.placeholder.com/220x330"}
            alt="Movie Poster"
            className="movie-poster"
          />
        </div>

        <div className="info-group">
          <div className="info-label">Movie Title:</div>
          <div className="info-value">{ticketData.movieName}</div>
        </div>

        <div className="info-group">
          <div className="info-label">Room:</div>
          <div className="info-value">{ticketData.cinemaRoomName || "N/A"}</div>
        </div>

        <div className="info-group">
          <div className="info-label">Date:</div>
          <div className="info-value">{`${weekday}, ${day} ${month}`}</div>
        </div>

        <div className="info-group">
          <div className="info-label">Seats:</div>
          <div className="info-value">{ticketData.seatNumbers?.join(", ") || "N/A"}</div>
        </div>

        <div className="info-group">
          <div className="info-label">Show Time:</div>
          <div className="info-value">{ticketData.scheduleShowTime || "N/A"}</div>
        </div>

        <div className="info-group">
          <div className="info-label">Ticket Count:</div>
          <div className="info-value">{ticketData.ticketCount || 0}</div>
        </div>

        <div className="info-group">
          <div className="info-label">Products Total:</div>
          <div className="info-value">{ticketData.productsTotal?.toLocaleString() || 0} VND</div>
        </div>

        <div className="info-group">
          <div className="info-label">Grand Total:</div>
          <div className="info-value">{ticketData.grandTotal?.toLocaleString() || 0} VND</div>
        </div>

        <div className="info-group">
          <div className="info-label">Status:</div>
          <div className="info-value">{ticketData.status || "PENDING"}</div>
        </div>

        <button className="home-btn" onClick={handleBackToHome}>
          Back to Home page
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;