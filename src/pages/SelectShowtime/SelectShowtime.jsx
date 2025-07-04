import React, { useState, useEffect } from 'react';
import './SelectShowtime.scss';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setTempBooking } from '../../store/tempBookingSlice';

const SelectShowtime = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const storedReduxDate = useSelector((state) => state.tempBooking.date);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);

    const [dates, setDates] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [movie, setMovie] = useState(null);

    const { movieId } = useParams();
    const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
    const token = sessionStorage.getItem("token");

    const MOVIE_DETAILS_KEY = `movieDetails_${movieId}`;
    const SHOWTIME_SELECTION_KEY = `showtimeSelection_${movieId}`;

    useEffect(() => {
        const storedMovieDetails = sessionStorage.getItem(MOVIE_DETAILS_KEY);
        if (storedMovieDetails) {
            try {
                const parsedMovie = JSON.parse(storedMovieDetails);
                setMovie(parsedMovie);
                setDates(parsedMovie.dates || []);
            } catch (e) {
                console.error("Error parsing stored movie details:", e);
                sessionStorage.removeItem(MOVIE_DETAILS_KEY);
            }
        } else {
            fetchMovieDetails();
        }

        const storedSelection = sessionStorage.getItem(SHOWTIME_SELECTION_KEY);
        if (storedSelection) {
            try {
                const parsedSelection = JSON.parse(storedSelection);
                setSelectedDate(parsedSelection.selectedDate || '');
                setSelectedTime(parsedSelection.selectedTime || '');
                setSelectedScheduleId(parsedSelection.selectedScheduleId || null);

                if (parsedSelection.selectedDate && parsedSelection.selectedDate !== storedReduxDate) {
                     dispatch(setTempBooking({
                         date: parsedSelection.selectedDate,
                         showtime: []
                     }));
                }
            } catch (e) {
                console.error("Error parsing stored showtime selection:", e);
                sessionStorage.removeItem(SHOWTIME_SELECTION_KEY);
            }
        } else if (storedReduxDate) {
            setSelectedDate(storedReduxDate);
        }

        fetchShowtimes();

    }, [movieId, storedReduxDate, dispatch]);

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

            sessionStorage.setItem(MOVIE_DETAILS_KEY, JSON.stringify(movieData));
        } catch (error) {
            console.error("Error fetching movie data:", error);
            message.error("Failed to load movie details.");
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
        }    };

    const groupedShowtimes = showtimes.reduce((acc, showtime) => {
        const date = showtime.showDate;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(showtime);
        return acc;
    }, {});

    const uniqueDates = Object.keys(groupedShowtimes).sort();    useEffect(() => {
        if (!selectedDate && uniqueDates.length > 0) {
            const defaultDate = uniqueDates[0];
            setSelectedDate(defaultDate);
            dispatch(setTempBooking({
                date: defaultDate,
                showtime: []
            }));
            sessionStorage.setItem(SHOWTIME_SELECTION_KEY, JSON.stringify({
                selectedDate: defaultDate,
                selectedTime: '',
                selectedScheduleId: null,
            }));
        }
    }, [selectedDate, uniqueDates, dispatch, SHOWTIME_SELECTION_KEY]);    const handleDateSelect = (date) => {
        if (selectedDate === date) {
            setSelectedDate('');
            setSelectedTime('');
            setSelectedScheduleId(null);

            dispatch(setTempBooking({
                date: '',
                showtime: []
            }));

            sessionStorage.setItem(SHOWTIME_SELECTION_KEY, JSON.stringify({
                selectedDate: '',
                selectedTime: '',
                selectedScheduleId: null,
            }));
        } else {
            // Select new date
            setSelectedDate(date);
            setSelectedTime('');
            setSelectedScheduleId(null);

            dispatch(setTempBooking({
                date: date,
                showtime: []
            }));

            sessionStorage.setItem(SHOWTIME_SELECTION_KEY, JSON.stringify({
                selectedDate: date,
                selectedTime: '',
                selectedScheduleId: null,
            }));
        }
    };    const handleTimeSelect = (showtime) => {
        // Reset if clicking the same time
        if (selectedTime === showtime.showTime) {
            setSelectedTime('');
            setSelectedScheduleId(null);

            sessionStorage.setItem(SHOWTIME_SELECTION_KEY, JSON.stringify({
                selectedDate: selectedDate,
                selectedTime: '',
                selectedScheduleId: null,
            }));
        } else {
            // Select new time
            setSelectedTime(showtime.showTime);
            setSelectedScheduleId(showtime.scheduleId);

            sessionStorage.setItem(SHOWTIME_SELECTION_KEY, JSON.stringify({
                selectedDate: selectedDate,
                selectedTime: showtime.showTime,
                selectedScheduleId: showtime.scheduleId,
            }));
            console.log("🎬 Selected Schedule ID:", showtime.scheduleId);
        }
    };

    if (!movie) return <div>Đang tải thông tin phim...</div>;

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
