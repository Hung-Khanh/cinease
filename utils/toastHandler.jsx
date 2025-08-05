"use client";

// Tạo file utils/toastHandler.js hoặc components/ToastHandler.jsx
import { useEffect } from "react";
import { toast } from "react-toastify";

export const useToastHandler = () => {
  useEffect(() => {
    // Kiểm tra localStorage cho pending toast
    const pendingToast = localStorage.getItem("pendingToast");

    if (pendingToast) {
      try {
        const toastData = JSON.parse(pendingToast);
        const { type, message, timestamp } = toastData;

        // Kiểm tra xem toast có quá cũ không (5 phút)
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000;

        if (!isExpired) {
          // Hiển thị toast
          if (type === "success") {
            toast.success(message);
          } else if (type === "error") {
            toast.error(message);
          } else if (type === "info") {
            toast.info(message);
          } else if (type === "warning") {
            toast.warning(message);
          }
        }

        // Xóa toast khỏi localStorage sau khi hiển thị
        localStorage.removeItem("pendingToast");
      } catch (error) {
        console.error("Error parsing pending toast:", error);
        localStorage.removeItem("pendingToast");
      }
    }
  }, []);
};

// Component wrapper để sử dụng trong các trang đích
export const ToastHandler = () => {
  useToastHandler();
  return null;
};
