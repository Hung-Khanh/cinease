import "../SCSS/DTS.scss";
import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";

const DateTimeSelection = ({ apiUrl, onBack }) => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null); // Thêm state để lưu scheduleId
  const [loading, setLoading] = useState(true);
  const [movieName, setMovieName] = useState("");
  const [movieImage, setMovieImage] = useState("");

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
        console.log("❌ Error response:", errorText);
        throw new Error(`Failed to fetch movie name: ${response.status}`);
      }

      const data = await response.json();
      const movieData = data[0];
      setMovieName(movieData?.movieNameVn);
      setMovieImage(movieData?.posterImageUrl);
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
      console.error("❌ Error fetching showtimes:", error);
      console.error("❌ Showtimes error details:", error.message);
      message.error("Failed to load showtimes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId && apiUrl) {
      fetchName();
      fetchShowtimes();
    } else {
      console.log("❌ Missing data:", { movieId, apiUrl });
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
    const endHour = parseInt(hours) + 2; // Assuming 2-hour movie duration
    const endTime = `${endHour}:${minutes}`;
    return `${startTime} - ${endTime}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection when date changes
    setSelectedScheduleId(null); // Reset schedule ID when date changes
  };

  // Cập nhật hàm handleTimeSelect để lấy scheduleId
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

  // Xử lý nút back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return <div className="dts-loading">Loading showtimes...</div>;
  }

  return (
    <div className="dts-container">
      <div className="dts-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="dts-back-btn"
          onClick={handleBack}
        />
        <h1 className="dts-title">{movieName}</h1>
      </div>

      <div className="dts-content">
        <div className="dts-poster">
          <img
            src={movieImage}
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
                    onClick={() => handleTimeSelect(showtime)} // Truyền toàn bộ showtime object
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
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
