import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Tag, Button, message, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { getScoreHistory } from '../../api/ticket';
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./HistoryTicket.scss";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const HistoryTicket = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const membershipLevel = "Gold";


  const fetchChartData = useCallback(async () => {
    try {
      const [addingRes, usingRes] = await Promise.all([
        getScoreHistory('Adding'),
        getScoreHistory('Using')
      ]);

      const combined = [...addingRes.data, ...usingRes.data];

      const currentYear = new Date().getFullYear();
      const labels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}/${currentYear}`);
      const pointsByMonth = {};
      labels.forEach(label => { pointsByMonth[label] = 0; });
      combined.forEach((item) => {
        if (!item.date) return;
        const d = new Date(item.date);
        if (isNaN(d)) return;
        const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        if (pointsByMonth[label] !== undefined) {
          pointsByMonth[label] += item.amount * (item.type === "Adding" ? 1 : -1);
        }
      });
      const data = labels.map(month => pointsByMonth[month]);

      setChartData({
        labels,
        datasets: [
          {
            label: "Points",
            data,
            fill: false,
            borderColor: "#1890ff",
            tension: 0.3,
            pointBackgroundColor: "#1890ff",
            pointBorderColor: "#fff",
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to load points history");
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Points History",
        font: { size: 18, weight: "bold" },
        color: "#333",
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        backgroundColor: "#1890ff",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Points: ${context.parsed.y}`
        }
      },
      datalabels: {
        display: (ctx) => {
          const data = ctx.dataset.data;
          const val = data[ctx.dataIndex];
          const min = Math.min(...data);
          const max = Math.max(...data);
          return val === min || val === max;
        },
        align: "top",
        color: "#1890ff",
        font: { weight: "bold", size: 14 },
        formatter: (value) => value
      }
    },
    elements: {
      line: { borderWidth: 3 },
      point: { borderWidth: 2 }
    },
    scales: {
      x: {
        grid: { color: "#eee" },
        ticks: { color: "#333", font: { size: 13 } }
      },
      y: {
        grid: { color: "#eee" },
        ticks: { color: "#333", font: { size: 13 } },
        beginAtZero: true
      }
    }
  };

  const [scoreHistory, setScoreHistory] = useState([]);

  // Tổng điểm Adding
  const totalAddingPoints = scoreHistory
    .filter(item => item.type === "Adding")
    .reduce((sum, item) => sum + (item.amount || 0), 0);


  useEffect(() => {
    const fetchScoreHistory = async () => {
      try {
        const [addingRes, usingRes] = await Promise.all([
          getScoreHistory('Adding'),
          getScoreHistory('Using')
        ]);
        const merged = [...(addingRes.data || []), ...(usingRes.data || [])];
        setScoreHistory(merged.map((item, idx) => ({ ...item, key: idx })));
      } catch {
        message.error("Failed to load transaction details");
      }
    };


    fetchScoreHistory();
  }, []);

  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('descend');

  const sortOptions = [
    { key: "date", label: "Date" },
    { key: "movieName", label: "Movie Name" },
    { key: "type", label: "Type" },
  ];

  const handleMenuClick = (e) => {
    if (sortKey === e.key) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortKey(e.key);
      setSortOrder('descend');
    }
  };

  const sortMenuItems = sortOptions.map(opt => ({
    key: opt.key,
    label: opt.label,
  }));

  const columns = [
    { title: "Date", dataIndex: "date", key: "date", align: "center" },
    { title: "Movie Name", dataIndex: "movieName", key: "movieName", align: "center" },
    { title: "Points", dataIndex: "amount", key: "amount", align: "center" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type) => (
        <Tag color={type === "Adding" ? "green" : "red"}>{type}</Tag>
      ),
    },
  ];

  const sortedScoreHistory = React.useMemo(() => {
    if (!sortKey) return scoreHistory;
    let sorted = [...scoreHistory];
    if (sortKey === "date") {
      sorted.sort((a, b) => {
        const d1 = new Date(a.date.split('/').reverse().join('-'));
        const d2 = new Date(b.date.split('/').reverse().join('-'));
        return sortOrder === "ascend" ? d1 - d2 : d2 - d1;
      });
    } else if (sortKey === "movieName") {
      sorted.sort((a, b) => sortOrder === "ascend"
        ? a.movieName.localeCompare(b.movieName)
        : b.movieName.localeCompare(a.movieName)
      );
    } else if (sortKey === "type") {
      sorted.sort((a, b) => sortOrder === "ascend"
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type)
      );
    }
    return sorted;
  }, [scoreHistory, sortKey, sortOrder]);
  const totalUsingPoints = scoreHistory ? scoreHistory.filter(i => i.type === 'Using').reduce((sum, i) => sum + (i.amount || 0), 0) : 0;

  return (
    <div className="history-ticket">
      <div className="header">
        <Button
          icon={<ArrowLeftOutlined />}
          className="back-btn"
          onClick={() => navigate("/profile")}
        />
        <h2>Points History</h2>
      </div>
      <div className="summary">
        <Card className="summary-card">
          <div>Points</div>
          <div className="value">{totalAddingPoints.toLocaleString()}</div>
        </Card>
        <Card className="summary-card">
          <div>Points Using</div>
          <div className="value red-value">{totalUsingPoints.toLocaleString()}</div>
        </Card>
      </div>
      <Card className="chart-card">
        <Line
          data={chartData}
          options={chartOptions}
        />
      </Card>
      <Card className="table-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Transaction Details</h3>
          <Dropdown
            menu={{
              items: sortMenuItems,
              onClick: handleMenuClick,
            }}
            trigger={['click']}
          >
            <Button className="sort-btn" style={{ marginLeft: 12, marginBottom: 8 }}>
              Sort <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <Table
          columns={columns}
          dataSource={sortedScoreHistory}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
    </div>
  );
};
export default HistoryTicket;
