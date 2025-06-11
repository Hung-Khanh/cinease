import React, { useState, useEffect } from 'react';
import './SelectShowtime.scss';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import poster from '../../assets/stitch.jpg';

const SelectShowtime = ({ movieId }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [dates, setDates] = useState([
        { date: '2025-06-08', day: 'Mon' },
        { date: '2025-06-09', day: 'Tue' },
        { date: '2025-06-10', day: 'Wed' }
    ]);
    const [times, setTimes] = useState(['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM']);

    useEffect(() => {
        if (dates.length > 0) {
            setSelectedDate(dates[0].date); 
        }
    }, [dates]);

    useEffect(() => {
        if (selectedDate && times.length > 0) {
            setSelectedTime(times[0]); 
        }
    }, [selectedDate, times]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleSubmit = () => {
        navigate('/seat-selection');
    };

    return (
        <div className="select-showtime">
            <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
            <div className="poster-section">
                
                <h1>Select showtime</h1>
                <img src={poster} alt="Movie Poster" className="movie-poster" />
                <h1 className="movie-title">STITCH</h1>
            </div>

            <div className="content-section">
                <h3>Date</h3>
                <div className="date-selection">
                    {dates.map((item, idx) => (
                        <button
                            key={idx}
                            className={`date-button ${selectedDate === item.date ? 'active' : ''}`}
                            onClick={() => handleDateSelect(item.date)}
                        >
                            <div>{item.date}</div>
                            <div>{item.day}</div>
                        </button>
                    ))}
                </div>

                <h3>Cinease complex</h3>
                <div className="cinema-complex">
                    <button className="location-button">Ho Chi Minh</button>
                </div>

                <h3>Cinease Vinhome Grand Park</h3>
                <div className="time-selection">
                    {times.map((time, index) => (
                        <button
                            key={index}
                            className={`time-button ${selectedTime === time ? 'active' : ''}`}
                            onClick={() => handleTimeSelect(time)}
                        >
                            {time}
                        </button>
                    ))}
                </div>

                <button
                    className="select-seat-btn"
                    onClick={handleSubmit}
                    disabled={!selectedDate || !selectedTime}
                >
                    SELECT SEAT
                </button>
            </div>
        </div>
    );
};

export default SelectShowtime;