import React, { useState, useEffect } from 'react';
import './SelectShowtime.scss';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import { Link } from 'react-router-dom';

const SelectShowtime = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState(null); 
    const [dates, setDates] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [movie, setMovie] = useState(null);
    const { movieId } = useParams();
    const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
    const token = sessionStorage.getItem("token");

    // Fetch movie details
    const fetchMovieDetails = async () => {
        try {
            const response = await fetch(`${apiUrl}/public/movies?q=${movieId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            const movieData = data[0];
            setMovie(movieData);
            setDates(movieData.dates || []);
        } catch (error) {
            console.error("Error fetching movie data:", error);
        }
    };

    const fetchShowtimes = async () => {
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
            if (!response.ok) {
                const errorText = await response.text();
                console.log("❌ Showtimes error response:", errorText);
                throw new Error(`Failed to fetch showtimes: ${response.status}`);
            }
            const data = await response.json();
            setShowtimes(data);
        } catch (error) {
            console.error("❌ Error fetching showtimes:", error);
            message.error("Failed to load showtimes");
        }
    };

    useEffect(() => {
        fetchMovieDetails();
        fetchShowtimes();
    }, []);

    const groupedShowtimes = showtimes.reduce((acc, showtime) => {
        const date = showtime.showDate;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(showtime);
        return acc;
    }, {});

    const uniqueDates = Object.keys(groupedShowtimes).sort();

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime('');
        setSelectedScheduleId(null); 
    };

    const handleTimeSelect = (showtime) => {
        setSelectedTime(showtime.showTime);
        setSelectedScheduleId(showtime.scheduleId); 

        console.log("🎬 Selected Schedule ID:", showtime.scheduleId);
    };

    return (
    <div className="select-showtime">
        <h1 className='select-title'>Select Showtime</h1>
        <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
        </button>
        
        <div className="main-content">
            <div className="poster-section">
                <img src={movie?.posterImageUrl} alt={movie?.movieNameEnglish} className="movie-poster-showtime" />
                <h1 className="movie-title">{movie?.movieNameEnglish}</h1>
            </div>
            
            <div className="content-section">
                <h3>Date</h3>
                <div className="date-selection">
                    {uniqueDates.map((date) => (
                        <button
                            key={date}
                            className={`date-button ${selectedDate === date ? 'active' : ''}`}
                            onClick={() => handleDateSelect(date)}
                        >
                            <div>{date}</div>
                            <div>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        </button>
                    ))}
                </div>
                
                <h3>Cinema Complex</h3>
                <div className="cinema-complex">
                    <button className="location-button">Ho Chi Minh</button>
                </div>
                
                <h3>Showtimes</h3>
                <div className="time-selection">
                    {selectedDate && groupedShowtimes[selectedDate]?.map((showtime) => (
                        <button
                            key={showtime.scheduleId}
                            className={`time-button ${selectedTime === showtime.showTime ? 'active' : ''}`}
                            onClick={() => handleTimeSelect(showtime)}
                        >
                            {showtime.showTime}
                        </button>
                    ))}
                </div>
                
                <Link
                    to={{
                        pathname: `/seat-select/${movieId}/${selectedScheduleId}`,
                    }}
                    state={{
                        movieName: movie?.movieNameEnglish,
                        showDate: selectedDate,
                        showTime: selectedTime,
                    }}
                    className="select-seat-btn"
                    onClick={(e) => {
                        if (!selectedDate || !selectedTime) {
                            e.preventDefault();
                            message.warning("Please select both date and time");
                        }
                    }}
                >
                    SELECT SEAT
                </Link>
            </div>
        </div>
    </div>
);
}

    export default SelectShowtime;