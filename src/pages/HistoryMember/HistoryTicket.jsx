import React, { useRef, useEffect } from "react";
import { Card, Table, Tag, Button } from "antd";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./HistoryTicket.scss";
import { useNavigate } from "react-router-dom";

//Register ChartJS components
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
  const totalPoints = 2450;
  const membershipLevel = "Gold";
  const pointsToNextLevel = 850;
  const chartRef = useRef(null);
  const chartData = {
    labels: [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ],
    datasets: [
      {
        label: "Điểm tích lũy",
        data: [150, 230, 220, 210, 135, 150, 270, 290, 310, 350, 390, 420],
        fill: false,
        borderColor: "#1890ff",
        tension: 0.3,
        pointBackgroundColor: function (ctx) {
          // Điểm thấp nhất và cao nhất to hơn, xanh hơn
          const data = ctx.chart.data.datasets[0].data;
          const idx = ctx.dataIndex;
          const min = Math.min(...data);
          const max = Math.max(...data);
          if (data[idx] === min || data[idx] === max) return "#1890ff";
          return "#63b3ed";
        },
        pointRadius: function (ctx) {
          const data = ctx.chart.data.datasets[0].data;
          const idx = ctx.dataIndex;
          const min = Math.min(...data);
          const max = Math.max(...data);
          if (data[idx] === min || data[idx] === max) return 10;
          return 5;
        },
        pointHoverRadius: 12,
        pointBorderWidth: 2,
        pointBorderColor: "#fff",
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Points History",
        font: { size: 18, weight: "bold" },
        color: "#333",
        padding: { top: 10, bottom: 20 },
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
          label: function (context) {
            return `Points: ${context.parsed.y}`;
          },
        },
      },
      datalabels: {
        display: function (ctx) {
          // Chỉ hiển thị label cho điểm thấp nhất và cao nhất
          const data = ctx.dataset.data;
          const idx = ctx.dataIndex;
          const min = Math.min(...data);
          const max = Math.max(...data);
          return data[idx] === min || data[idx] === max;
        },
        align: "top",
        color: "#1890ff",
        font: { weight: "bold", size: 14 },
        formatter: function (value) {
          return value;
        },
      },
    },
    elements: {
      line: { borderWidth: 3 },
      point: { borderWidth: 2 },
    },
    scales: {
      x: {
        grid: { color: "#eee" },
        ticks: { color: "#333", font: { size: 13 } },
      },
      y: {
        grid: { color: "#eee" },
        ticks: { color: "#333", font: { size: 13 } },
        beginAtZero: true,
        suggestedMax: 500,
      },
    },
  };
  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);
  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "add" ? "green" : "red"}>
          {type === "add" ? "+" : "-"}
        </Tag>
      ),
    },
    { title: "Points", dataIndex: "points", key: "points" },
  ];
  const data = [
    {
      key: "1",
      date: "11/06/2025",
      transactionId: "TX000001",
      description: "Movie ticket purchase",
      type: "add",
      points: 200,
    },
    {
      key: "2",
      date: "10/06/2025",
      transactionId: "TX000002",
      description: "Refreshments purchase",
      type: "add",
      points: 50,
    },
    {
      key: "3",
      date: "09/06/2025",
      transactionId: "TX000003",
      description: "Ticket refund points",
      type: "minus",
      points: 100,
    },
    {
      key: "4",
      date: "08/06/2025",
      transactionId: "TX000004",
      description: "Movie ticket purchase",
      type: "add",
      points: 300,
    },
    {
      key: "5",
      date: "07/06/2025",
      transactionId: "TX000005",
      description: "Movie ticket purchase",
      type: "add",
      points: 250,
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
          <div className="value">{totalPoints.toLocaleString()}</div>
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
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          updateMode="resize"
        />
      </Card>
      <Card className="table-card">
        <h3>Transaction Details</h3>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};
export default HistoryTicket;
