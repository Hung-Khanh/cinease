import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import "../SCSS/TicketIn4.scss";

const TicketInformation = ({ apiUrl, onBack }) => {
  const [ticketData, setTicketData] = useState(null);
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const [movieName, setMovieName] = useState("");
  const [movieImage, setMovieImage] = useState("");

  useEffect(() => {
    const fetchTicketDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        alert("Please log in to proceed.");
        window.location.href = `${apiUrl}/oauth2/authorization/google`;
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/employee/bookings/${invoiceId}`,
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
          const errorText = await response.text();
          console.log("❌ Error response:", errorText);
          throw new Error(`Failed to fetch ticket details: ${response.status}`);
        }
        const data = await response.json();
        console.log("Ticket data:", data.movieName);
        setMovieName(data.movieName);
        setTicketData(data);
      } catch (error) {
        console.error("Error in fetchTicketDetails:", error);
        alert("Failed to load ticket details. Please try again.");
      }
    };

    if (invoiceId) {
      fetchTicketDetails();
    } else {
      console.log("No invoiceId found in state");
      alert("Invalid ticket information.");
    }
  }, [apiUrl, invoiceId]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!movieName) return; // Không gọi API nếu movieName rỗng

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${apiUrl}/public/movies?q=${movieName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Movies data:", data);

        setMovieImage(data[0]?.largeImage || "placeholder-image.jpg");
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovieImage("placeholder-image.jpg");
      }
    };

    fetchMovies();
  }, [movieName, apiUrl]); //

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handlePurchase = () => {
    // Placeholder for purchase logic (e.g., redirect to payment or confirm)
    alert("Purchase functionality to be implemented.");
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/"); // Ensure dd/mm/yyyy format
  };

  return (
    <div className="ticket-info-wrapper">
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>

      <div className="ticket-info-container">
        <div className="ticket-card">
          <div className="ticket-image">
            <img
              src={movieImage || "placeholder-image.jpg"} // Sử dụng movieImage
              alt={ticketData?.movieName || "Movie Poster"}
              className="movie-poster"
            />
          </div>
          <div className="ticket-details">
            <h2>TICKET DETAIL</h2>
            <div className="detail-item">
              <h3>Schedule</h3>
            </div>
            <div className="detail-item">
              <span>Movie Title</span>
              <span>{ticketData?.movieName || "N/A"}</span>
            </div>
            <div className="detail-item">
              <span>Cinema Room</span>
              <span>{ticketData?.cinemaRoomName || "N/A"}</span>
            </div>
            <div className="detail-item">
              <span>Date</span>
              <span>{formatDate(ticketData?.date)}</span>
            </div>
            <div className="detail-item">
              <span>Time</span>
              <span>
                {ticketData?.time
                  ? new Date(ticketData.time).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <span>Ticket ({ticketData?.seat?.length || 0})</span>
              <span>{ticketData?.seat?.join(", ") || "N/A"}</span>
            </div>
            <div className="detail-item voucher">
              <span>Select or enter a voucher</span>
              <select>
                <option value="">Select a voucher</option>
                {/* Add voucher options dynamically if needed */}
              </select>
            </div>
            <div className="detail-item transaction">
              <span>Transaction Detail</span>
              <div className="transaction-details">
                <div>SEAT</div>
                <div>
                  VND{" "}
                  {ticketData?.price
                    ? (
                        ticketData.price / (ticketData.seat?.length || 1)
                      ).toLocaleString()
                    : "0"}{" "}
                  x {ticketData?.seat?.length || 0}
                </div>
                <div>DISCOUNT</div>
                <div>
                  VND{" "}
                  {ticketData?.scoreForTicketConverting?.toLocaleString() ||
                    "0.0"}
                </div>
              </div>
            </div>
            <div className="detail-item total">
              <span>Total payment</span>
              <span>VND {ticketData?.total?.toLocaleString() || "0"}</span>
            </div>
            <p className="note">*Purchased ticket cannot be canceled</p>
            <button className="purchase-button" onClick={handlePurchase}>
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInformation;
