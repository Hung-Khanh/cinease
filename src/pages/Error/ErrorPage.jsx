import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  return (
    <div className="error-page" style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 style={{ fontSize: 96, margin: 0, color: "#ff4d4f" }}>404</h1>
      <h2 style={{ margin: "16px 0", color: "white" }}>Page Not Found</h2>
      <p style={{ marginBottom: 24, color: "white" }}>The page you are looking for does not exist.</p>
      <Button type="primary" onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </div>
  );
};

export default ErrorPage;
