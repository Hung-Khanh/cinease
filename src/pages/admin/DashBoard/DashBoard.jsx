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
import './DashBoard.scss';

const Dashboard = () => {
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  
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

  // Fetch daily revenue data from API
  const fetchDailyRevenue = async () => {
    setRevenueLoading(true);
    setRevenueError(null);

    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const dateRange = getDateRange();
      const revenuePromises = dateRange.map(async (date) => {
        const response = await fetch(
          `${apiUrl}/admin/invoices/revenue/range?startDate=${date}&endDate=${date}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const revenue = await response.json();
        return {
          date,
          day: getDayName(date),
          revenue: revenue || 0 // API returns a number directly
        };
      });

      const results = await Promise.all(revenuePromises);
      setRevenueData(results);

    } catch (error) {
      console.error('Error fetching daily revenue:', error);
      setRevenueError(error.message);
      
      // Fallback to mock data on error
      setRevenueData([
        { day: 'Mon', revenue: 500 },
        { day: 'Tue', revenue: 750 },
        { day: 'Wed', revenue: 350 },
        { day: 'Thu', revenue: 1200 },
        { day: 'Fri', revenue: 1800 },
        { day: 'Sat', revenue: 2000 },
        { day: 'Sun', revenue: 1600 }
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
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${apiUrl}/admin/invoices/revenue/movie`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // Transform API data to match component structure
      const transformedData = Object.entries(data).map(([movieTitle, revenue]) => {
        // Generate capacity percentage based on relative revenue
        const capacity = Math.min(95, Math.max(30, Math.floor((revenue / Math.max(...Object.values(data))) * 100)));
        
        return {
          title: movieTitle,
          revenue: revenue, // Keep original revenue value
          capacity: capacity
        };
      }).sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

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
    return `${revenue.toLocaleString()} VND`;
  };

  // Custom colors for charts
  const COLORS = ['#00E676', '#2ecc71', '#3498db', '#e67e22'];

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip bar-tooltip">
          <strong>{label}</strong><br/>
          Revenue: {payload[0].value} VND
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
          <strong>{payload[0].payload.type}</strong><br/>
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
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="#00E676" 
                  activeBar={{ fill: '#2ecc71' }}
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