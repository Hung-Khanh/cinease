import React, { useState } from 'react';
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
  // Revenue by Day Data (Simulated more realistic data)
  const revenueData = [
    { day: 'Mon', revenue: 500 },
    { day: 'Tue', revenue: 750 },
    { day: 'Wed', revenue: 350 },
    { day: 'Thu', revenue: 1200 },
    { day: 'Fri', revenue: 1800 },
    { day: 'Sat', revenue: 2000 },
    { day: 'Sun', revenue: 1600 }
  ];

  // Ticket Distribution Data (Updated to match image)
  const ticketDistributionData = [
    { type: 'VIP', value: 25 },
    { type: 'Regular', value: 40 },
    { type: 'Couple', value: 20 },
    { type: 'IMAX', value: 15 }
  ];

  // Movie Revenue Data
  const fullMovieRevenueData = [
    {
      title: 'Avatar: The Way of Water',
      label: 'HOT',
      revenue: 2.8,
      ticketsSold: 156789,
      capacity: 95,
      isNew: false
    },
    {
      title: 'Black Adam',
      label: 'NEW',
      revenue: 1.9,
      ticketsSold: 89234,
      capacity: 78,
      isNew: true
    },
    {
      title: 'Top Gun: Maverick',
      label: '',
      revenue: 1.6,
      ticketsSold: 72156,
      capacity: 65,
      isNew: false
    },
    {
      title: 'Minions: The Rise of Gru',
      label: '',
      revenue: 1.4,
      ticketsSold: 98432,
      capacity: 52,
      isNew: false
    },
    {
      title: 'Doctor Strange 2',
      label: '',
      revenue: 1.2,
      ticketsSold: 65789,
      capacity: 68,
      isNew: false
    },
    {
      title: 'Thor: Love and Thunder',
      label: '',
      revenue: 0.98,
      ticketsSold: 54321,
      capacity: 72,
      isNew: false
    },
    {
      title: 'Guardians of the Galaxy Vol. 3',
      label: '',
      revenue: 0.85,
      ticketsSold: 48765,
      capacity: 60,
      isNew: false
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      label: '',
      revenue: 0.75,
      ticketsSold: 42123,
      capacity: 55,
      isNew: false
    },
    {
      title: 'Mission: Impossible - Dead Reckoning Part One',
      label: '',
      revenue: 0.65,
      ticketsSold: 38456,
      capacity: 50,
      isNew: false
    },
    {
      title: 'Elemental',
      label: '',
      revenue: 0.55,
      ticketsSold: 35789,
      capacity: 45,
      isNew: false
    },
    {
      title: 'The Flash',
      label: '',
      revenue: 0.45,
      ticketsSold: 32456,
      capacity: 40,
      isNew: false
    },
    // New movies added after Spider-Man
    {
      title: 'Barbie',
      label: 'NEW',
      revenue: 0.7,
      ticketsSold: 40000,
      capacity: 58,
      isNew: true
    },
    {
      title: 'Oppenheimer',
      label: 'HOT',
      revenue: 0.6,
      ticketsSold: 35000,
      capacity: 52,
      isNew: false
    },
    {
      title: 'Indiana Jones and the Dial of Destiny',
      label: '',
      revenue: 0.5,
      ticketsSold: 30000,
      capacity: 45,
      isNew: false
    }
  ];

  // State to manage showing more movies
  const [showMoreMovies, setShowMoreMovies] = useState(false);

  // Determine movies to display
  const movieRevenueData = showMoreMovies 
    ? fullMovieRevenueData 
    : fullMovieRevenueData.slice(0, 7);

  const formatRevenue = (revenue) => {
    if (revenue >= 1) {
      return `$${revenue.toFixed(1)}B`;
    } else {
      return `$${(revenue * 1000).toFixed(0)}M`;
    }
  };

  const formatTickets = (tickets) => {
    return tickets.toLocaleString();
  };

  // Custom colors for charts
  const COLORS = ['#00E676', '#2ecc71', '#3498db', '#e67e22'];

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip bar-tooltip">
          <strong>{label}</strong><br/>
          Revenue: ${payload[0].value}
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
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index }) => {
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
          <div className="chart-card-title">Daily Revenue (Last 7 Days)</div>
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
          </div>
        </div>

        <div className="movie-revenue-grid">
          {movieRevenueData.map((movie, index) => (
            <div key={index} className="movie-card">
              <div className="movie-header">
                <div className="movie-title">
                  {movie.title}
                </div>
                {movie.label && (
                  <span className={`movie-label ${movie.isNew ? 'new' : 'hot'}`}>
                    {movie.label}
                  </span>
                )}
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
                <div className="tickets-stats">
                  <div className="tickets-value">
                    {formatTickets(movie.ticketsSold)}
                  </div>
                  <div className="stat-label">
                    Tickets Sold
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

          {fullMovieRevenueData.length > 7 && (
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