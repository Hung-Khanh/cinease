"use client";

import "../SCSS/DTS.scss";
import { useState, useEffect } from "react";
import { Button, message } from "antd";
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const DateTimeSelection = ({ apiUrl, onBack }) => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movieName, setMovieName] = useState("");
  const [movieImage, setMovieImage] = useState("");
  const [movieBanner, setMovieBanner] = useState("");

  // Fetch movie name
  const fetchName = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const fullUrl = `${apiUrl}/public/movies?q=${movieId}`;
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch movie name: ${response.status}`);
      }
      const data = await response.json();
      const movieData = data[0];
      setMovieName(movieData?.movieNameVn);
      setMovieImage(movieData?.posterImageUrl);
      setMovieBanner(movieData?.largeImage);
    } catch (error) {
      console.error("❌ Error in fetchName:", error);
      console.error("❌ Error details:", error.message);
    }
  };

  // Fetch showtimes from API
  const fetchShowtimes = async () => {
    const token = localStorage.getItem("token");
    try {
      const fullUrl = `${apiUrl}/public/showtimes?movieId=${movieId}`;
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await response.json();
      setShowtimes(data);
    } catch (error) {
      message.error("Không thể tải danh sách lịch chiếu");
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId && apiUrl) {
      fetchName();
      fetchShowtimes();
    }
  }, [movieId, apiUrl]);

  // Group showtimes by date
  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const date = showtime.showDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {});

  // Get unique dates
  const uniqueDates = Object.keys(groupedShowtimes).sort();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const weekday = date.toLocaleString("default", { weekday: "short" });
    return { day, month, weekday };
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const startTime = `${hours}:${minutes}`;
    const endHour = Number.parseInt(hours) + 2;
    const endTime = `${endHour}:${minutes}`;
    return `${startTime} - ${endTime}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedScheduleId(null);
  };

  const handleTimeSelect = (showtime) => {
    setSelectedTime(showtime.showTime);
    setSelectedScheduleId(showtime.scheduleId);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime || !selectedScheduleId) {
      message.warning("Please select both date and time");
      return;
    }
    navigate(
      `/cinema-seating/${selectedScheduleId}/${movieName}/${selectedDate}/${selectedTime}`
    );
    message.success("Date and time selected successfully!");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="dts-container">
        <div className="floating-particles">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
        <div className="dts-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading showtimes...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dts-container"
      style={
        movieBanner
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(10,15,13,0.8) 0%, rgba(6,78,59,0.9) 100%), url(${movieBanner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }
          : {}
      }
    >
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="dts-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h1 className="dts-title">{movieName}</h1>
      </div>

      <div className="dts-content">
        <div className="dts-poster">
          <img
            src={movieImage || "/placeholder.svg"}
            alt="Movie Poster"
            className="dts-poster-image"
          />
        </div>

        <div className="dts-selection">
          <div className="dts-section">
            <h2 className="dts-section-title">Date</h2>
            <div className="dts-date-grid">
              {uniqueDates.map((date) => {
                const { day, month, weekday } = formatDate(date);
                return (
                  <Button
                    key={date}
                    className={`dts-date-btn ${
                      selectedDate === date ? "selected" : ""
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="dts-date-content">
                      <span className="dts-date-day">
                        {day} {month}
                      </span>
                      <span className="dts-date-weekday">{weekday}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="dts-section">
            <h2 className="dts-section-title">Time</h2>
            <div className="dts-time-grid">
              {selectedDate &&
                groupedShowtimes[selectedDate]?.map((showtime) => (
                  <Button
                    key={`${showtime.showDate}-${showtime.showTime}-${showtime.scheduleId}`}
                    className={`dts-time-btn ${
                      selectedTime === showtime.showTime ? "selected" : ""
                    }`}
                    onClick={() => handleTimeSelect(showtime)}
                  >
                    <div className="dts-time-content">
                      <div className="dts-time-main">
                        {formatTime(showtime.showTime)}
                      </div>
                    </div>
                  </Button>
                ))}
              {!selectedDate && (
                <div className="dts-time-placeholder">
                  Please select a date first
                </div>
              )}
            </div>
          </div>

          <Button
            type="primary"
            className="dts-next-btn"
            onClick={handleNext}
            disabled={!selectedDate || !selectedTime || !selectedScheduleId}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
