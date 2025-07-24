import axios from "axios";

const API_BASE_URL = "https://legally-actual-mollusk.ngrok-free.app";

// Create an Axios instance with default headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
});

// Add interceptor to include Bearer token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Adjust based on where you store the JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getEligibleInvoicesForFeedback = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/member/tickets?page=0&size=10&status=PAID"
    );
    return response;
  } catch (error) {
    console.error("Error fetching eligible invoices:", error);
    throw error;
  }
};

export const submitFeedbackForInvoice = async (invoiceId, feedbackData) => {
  try {
    const response = await axiosInstance.post(
      `/api/member/feedback/invoices/${invoiceId}`,
      feedbackData
    );
    return response;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const updateFeedback = async (feedbackId, feedbackData) => {
  try {
    const response = await axiosInstance.put(
      `/api/member/feedback/${feedbackId}`,
      feedbackData
    );
    return response;
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
};

export const deleteFeedback = async (feedbackId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/member/feedback/${feedbackId}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
};

export const getCurrentUserFeedbackForInvoice = async (invoiceId) => {
  try {
    const response = await axiosInstance.get(
      `/api/member/feedback/invoices/${invoiceId}/my-feedback`
    );
    return response;
  } catch (error) {
    console.error("Error fetching feedback for invoice:", error);
    throw error;
  }
};

export const getCurrentUserFeedbacks = async () => {
  try {
    const response = await axiosInstance.get("/api/member/feedback/my-feedbacks");
    return response;
  } catch (error) {
    console.error("Error fetching user feedbacks:", error);
    throw error;
  }
};