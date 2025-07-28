import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Đã xảy ra lỗi. Vui lòng tải lại trang hoặc thử lại sau.</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
