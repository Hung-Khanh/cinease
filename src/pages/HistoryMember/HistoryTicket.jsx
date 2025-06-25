import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Tag, Button, message } from "antd";
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
import api from "../../constants/axios";
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
  const pointsToNextLevel = 850;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || "";

  const fetchChartData = useCallback(async () => {
    try {
      const [addingRes, usingRes] = await Promise.all([
        api.get("/member/score-history", {
          params: { type: "Adding" },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        }),
        api.get("/member/score-history", {
          params: { type: "Using" },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        })
      ]);

      const combined = [...addingRes.data, ...usingRes.data];

      // Luôn tạo đủ 12 tháng của năm hiện tại
      const currentYear = new Date().getFullYear();
      const labels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}/${currentYear}`);
      // Khởi tạo tất cả tháng = 0
      const pointsByMonth = {};
      labels.forEach(label => { pointsByMonth[label] = 0; });
      // Cộng dồn dữ liệu vào đúng tháng
      combined.forEach((item) => {
        if (!item.date) return;
        const d = new Date(item.date);
        if (isNaN(d)) return;
        const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        if (pointsByMonth[label] !== undefined) {
          pointsByMonth[label] += item.amount * (item.type === "Adding" ? 1 : -1);
        }
      });
      // Dữ liệu cho chart
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
  }, [token]);

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
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user.token || "";
        // Gọi song song cả hai loại type: Adding và Using
        const [addingRes, usingRes] = await Promise.all([
          api.get("/member/score-history", {
            params: { type: "Adding" },
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true"
            }
          }),
          api.get("/member/score-history", {
            params: { type: "Using" },
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true"
            }
          })
        ]);
        const merged = [...(addingRes.data || []), ...(usingRes.data || [])];
        setScoreHistory(merged.map((item, idx) => ({ ...item, key: idx })));
      } catch {
        message.error("Failed to load transaction details");
      }
    };


    fetchScoreHistory();
  }, []);

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
          <div>Total Points</div>
          <div className="value">{totalAddingPoints.toLocaleString()}</div>
        </Card>
        <Card className="summary-card">
          <div>Membership Level</div>
          <div className="value">
            <span className="level-icon">👑</span> {membershipLevel}
          </div>
        </Card>
        <Card className="summary-card">
          <div>Points to Next Level</div>
          <div className="value">{pointsToNextLevel} points to Diamond</div>
        </Card>
      </div>
      <Card className="chart-card">
        <Line
          data={chartData}
          options={chartOptions}
        />
      </Card>
      <Card className="table-card">
        <h3>Transaction Details</h3>
        <Table
          columns={columns}
          dataSource={scoreHistory}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
export default HistoryTicket;
