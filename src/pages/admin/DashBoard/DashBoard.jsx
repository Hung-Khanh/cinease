import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../../../constants/axios';
import './DashBoard.scss';

const Dashboard = () => {
  // State for movie revenue data
  const [movieRevenueData, setMovieRevenueData] = useState([]);
  const [movieLoading, setMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState(null);
  const [showMoreMovies, setShowMoreMovies] = useState(false);

  // State for daily revenue data
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState(null);

  // Ticket Distribution Data (Keep existing static data)
  const ticketDistributionData = [
    { type: 'VIP', value: 25 },
    { type: 'Regular', value: 40 },
    { type: 'Couple', value: 20 },
    { type: 'IMAX', value: 15 }
  ];

  // Helper function to get date range for last 7 days
  const getDateRange = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    return dates;
  };

  // Helper function to get day name from date string
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Format revenue with thousand separators and VND currency
  const formatCurrency = (value) => {
    // Ensure the value is a number and use absolute value
    const numValue = Math.abs(Number(value));
    return numValue.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Log tooltip data for debugging
      console.log('Daily Revenue Tooltip Data:', {
        label,
        rawValue: payload[0].value,
        formattedValue: formatCurrency(payload[0].value)
      });

      return (
        <div className="chart-tooltip bar-tooltip">
          <strong>{label}</strong><br />
          Revenue: {formatCurrency(payload[0].value)}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <strong>{payload[0].payload.type}</strong><br />
          Percentage: {payload[0].value}%
        </div>
      );
    }
    return null;
  };

  // Custom Label for Pie Chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
      
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {ticketDistributionData[index].type}
      </text>
    );
  };

  // Fetch daily revenue data from API
  const fetchDailyRevenue = async () => {
    setRevenueLoading(true);
    setRevenueError(null);

    try {
      const dateRange = getDateRange();
      const revenuePromises = dateRange.map(async (date) => {
        try {
          const response = await api.get('/admin/invoices/revenue/range', {
            params: {
              startDate: date,
              endDate: date
            }
          });

          // Log raw response for each date
          console.log(`Daily Revenue for ${date}:`, {
            rawResponse: response.data,
            parsedValue: Number(response.data)
          });

          return {
            date,
            day: getDayName(date),
            revenue: Math.abs(Number(response.data)) || 0 // Ensure positive numeric value
          };
        } catch (dateError) {
          console.error(`Error fetching revenue for ${date}:`, dateError);
          return {
            date,
            day: getDayName(date),
            revenue: 0
          };
        }
      });

      const results = await Promise.all(revenuePromises);
      
      // Log final results
      console.log('Daily Revenue Results:', results);

      setRevenueData(results);

    } catch (error) {
      console.error('Error fetching daily revenue:', error);
      setRevenueError(error.message);

      // Fallback to mock data on error
      setRevenueData([
        { day: 'Mon', revenue: 500000 },
        { day: 'Tue', revenue: 750000 },
        { day: 'Wed', revenue: 350000 },
        { day: 'Thu', revenue: 1200000 },
        { day: 'Fri', revenue: 1800000 },
        { day: 'Sat', revenue: 2000000 },
        { day: 'Sun', revenue: 1600000 }
      ]);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Fetch movie revenues from API
  const fetchMovieRevenue = async () => {
    setMovieLoading(true);
    setMovieError(null);

    try {
      const response = await api.get('/admin/invoices/revenue/movie');
      const data = response.data;
      
      // Log raw data for debugging
      console.log('Raw Movie Revenue Data:', data);
      
      // Transform API data to match component structure
      const transformedData = Object.entries(data).map(([movieTitle, revenue]) => {
        // Ensure revenue is a number and handle potential negative values
        const parsedRevenue = Math.abs(Number(revenue));
        
        // Log individual movie revenue for debugging
        console.log(`Movie: ${movieTitle}, Raw Revenue: ${revenue}, Parsed Revenue: ${parsedRevenue}`);

        // Generate capacity percentage based on relative revenue
        const capacity = Math.min(95, Math.max(30, Math.floor((parsedRevenue / Math.max(...Object.values(data).map(Number))) * 100)));

        return {
          title: movieTitle,
          revenue: parsedRevenue, // Use absolute value
          capacity: capacity
        };
      }).sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

      // Log transformed data
      console.log('Transformed Movie Revenue Data:', transformedData);

      setMovieRevenueData(transformedData);
    } catch (error) {
      console.error('Error fetching movie revenue:', error);
      setMovieError(error.message);

      // Fallback to mock data on error
      setMovieRevenueData([
        {
          title: 'Xì Trum',
          revenue: 876000,
          capacity: 95
        },
        {
          title: 'Quỷ Ăn Tạng',
          revenue: 206000,
          capacity: 75
        },
        {
          title: 'Gấu Trúc Kung Fu',
          revenue: 120000,
          capacity: 60
        }
      ]);
    } finally {
      setMovieLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMovieRevenue();
    fetchDailyRevenue();
  }, []);

  // Determine movies to display
  const displayedMovies = showMoreMovies
    ? movieRevenueData
    : movieRevenueData.slice(0, 7);

  const formatRevenue = (revenue) => {
    // Ensure absolute value and format with thousand separators
    const absRevenue = Math.abs(revenue);
    return `${absRevenue.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })}`;
  };

  // Custom colors for charts
  const COLORS = ['#00E676', '#2ecc71', '#3498db', '#e67e22'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-charts">
        {/* Daily Revenue Chart */}
        <div className="chart-card column-chart">
          <div className="chart-card-title">
            Daily Revenue (Last 7 Days)
            {revenueLoading && <span className="loading-indicator"> (Loading...)</span>}
            {revenueError && (
              <button
                className="retry-button"
                onClick={fetchDailyRevenue}
                title="Retry loading data"
              >
                🔄 Retry
              </button>
            )}
          </div>
          {revenueError && (
            <div className="error-message">
              <p>⚠️ Failed to load daily revenue: {revenueError}</p>
            </div>
          )}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" tick={{ fill: 'white' }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Type Distribution Chart */}
        <div className="chart-card pie-chart">
          <div className="chart-card-title">Ticket Type Distribution</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketDistributionData}
                  innerRadius="60%"
                  outerRadius="80%"
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {ticketDistributionData.map((entry, index) => (
                    <Cell key={`cell-${entry.type}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="revenue-by-movie-card">
        <div className="header">
          <div className="header-icon">💰</div>
          <div className="header-title">
            Revenue by Movie
            {movieLoading && <span className="loading-indicator"> (Loading...)</span>}
            {movieError && (
              <button
                className="retry-button"
                onClick={fetchMovieRevenue}
                title="Retry loading data"
              >
                🔄 Retry
              </button>
            )}
          </div>
        </div>

        {movieError && (
          <div className="error-message">
            <p>⚠️ Failed to load movie revenue data: {movieError}</p>
            <p>Showing fallback data instead.</p>
          </div>
        )}

        <div className="movie-revenue-grid">
          {displayedMovies.map((movie, index) => (
            <div key={index} className="movie-card">
              <div className="movie-header">
                <div className="movie-title">
                  {movie.title}
                </div>
              </div>

              <div className="stats-row">
                <div className="revenue-stats">
                  <div className="revenue-value">
                    {formatRevenue(movie.revenue)}
                  </div>
                  <div className="stat-label">
                    Revenue
                  </div>
                </div>
              </div>

              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${movie.capacity}%`,
                  }}
                />
              </div>
              <div className="capacity-text">
                {movie.capacity}% capacity
              </div>
            </div>
          ))}

          {movieRevenueData.length > 7 && (
            <div
              className="movie-card show-more-card"
              onClick={() => setShowMoreMovies(!showMoreMovies)}
            >
              <div className="show-more-content">
                {showMoreMovies
                  ? 'Show Less'
                  : 'Show More'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;