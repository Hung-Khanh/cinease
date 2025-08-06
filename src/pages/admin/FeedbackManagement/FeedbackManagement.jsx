import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Select, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../../constants/axios";
import "./FeedbackManagement.scss"; // Assuming you have a CSS file for styling

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("feedbackId");
  const [sortDirection, setSortDirection] = useState("desc");

  // State for details modal
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedFeedbackDetails, setSelectedFeedbackDetails] = useState(null);
  const [accountInfo, setAccountInfo] = useState({ username: '', fullName: '' });
  const [accountLoading, setAccountLoading] = useState(false);

  // State for delete confirmation
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  // State for pagination 
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });

  // Common API handler with toast
  const handleApiCall = async (apiCall, successMessage, errorMessage) => {
    setLoading(true);
    try {
      const response = await apiCall();
      if (successMessage) {
        toast.success(successMessage);
      }
      return response;
    } catch (error) {
      const errorMsg = error.response?.data || errorMessage || error.message;
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch Feedbacks with search and sort functionality
  const fetchFeedbacks = async (page = 0, searchTerm = "", sortBy = sortField, sortDir = sortDirection) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: 12,
        sortBy: sortBy,
        sortDir: sortDir,
      };
      
      // Add search parameter if provided
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axios.get('/admin/feedback', { params });

      // Check if response.data exists and has the expected structure
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Handle different possible response structures
      let feedbackData = [];
      let totalElements = 0;
      let pageNumber = 0;

      if (response.data.content && Array.isArray(response.data.content)) {
        // Paginated response structure
        feedbackData = response.data.content;
        totalElements = response.data.totalElements || 0;
        pageNumber = response.data.number || 0;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        feedbackData = response.data;
        totalElements = response.data.length;
        pageNumber = page;
      } else {
        // Unexpected response structure
        console.error('Unexpected response structure:', response.data);
        throw new Error('Unexpected response structure from server');
      }

      // Format feedbacks with unique keys
      const formattedFeedbacks = feedbackData.map((feedback) => ({
        key: feedback.feedbackId ? feedback.feedbackId.toString() : Math.random().toString(),
        feedbackId: feedback.feedbackId || 'N/A',
        movieName: feedback.movieName || 'Unknown Movie',
        rating: feedback.rating || 0,
        comment: feedback.comment || '',
        createdDate: feedback.createdDate || new Date().toISOString(),
        userId: feedback.userId || null,
        accountId: feedback.accountId || null,
        invoiceId: feedback.invoiceId || null
      }));

      // Client-side sorting fallback (in case backend sorting doesn't work)
      // You can remove this once backend sorting is confirmed working
      const sortedFeedbacks = [...formattedFeedbacks].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Handle different data types
        if (sortBy === 'feedbackId') {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        } else if (sortBy === 'movieName') {
          aValue = (aValue || '').toString().toLowerCase();
          bValue = (bValue || '').toString().toLowerCase();
        } else if (sortBy === 'rating') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortBy === 'createdDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (sortDir === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      console.log('After client-side sorting:', sortedFeedbacks.slice(0, 3).map(item => ({
        id: item.feedbackId,
        movieName: item.movieName,
        rating: item.rating
      })));

      setFeedbacks(sortedFeedbacks);

      // Update pagination state
      setPagination({
        current: pageNumber + 1,
        pageSize: 12,
        total: totalElements
      });
    } catch (error) {
      console.error('Fetch feedbacks error:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to fetch feedbacks';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Server error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
      
      // Set empty state on error
      setFeedbacks([]);
      setPagination({
        current: 1,
        pageSize: 12,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete feedback
  const confirmDeleteFeedback = async () => {
    try {
      const response = await handleApiCall(
        () => axios.delete(`/admin/feedback/${feedbackToDelete.key}`),
        null,
        "Failed to delete feedback"
      );

      toast.success("Feedback deleted successfully!");
      setDeleteConfirmationVisible(false);
      fetchFeedbacks(); // Refresh the list
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  // Fetch feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks(0, "", sortField, sortDirection);
  }, []);

  // Filtered feedbacks based on search term
  const filteredFeedbacks = useMemo(() => {
    if (!searchTerm) return feedbacks;

    const searchTermLower = searchTerm.toLowerCase();
    return feedbacks.filter(feedback =>
      (feedback.movieName || '').toLowerCase().includes(searchTermLower) ||
      (feedback.feedbackId || '').toString().includes(searchTermLower) ||
      (feedback.status || '').toLowerCase().includes(searchTermLower)
    );
  }, [feedbacks, searchTerm]);

  // Columns for the Feedbacks Table
  const columns = [
    {
      title: "Feedback ID",
      dataIndex: "feedbackId",
      key: "feedbackId",
    },
    {
      title: "Movie Name",
      dataIndex: "movieName",
      key: "movieName",
      render: (text) => (
        <div
          style={{
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {text || 'Unknown Movie'}
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => {
        const ratingValue = Number(rating) || 0;
        const stars = [];

        for (let i = 1; i <= 5; i++) {
          stars.push(
            <span
              key={i}
              style={{
                color: i <= ratingValue ? "#ffd700" : "#434343",
                fontSize: "14px",
                marginRight: "2px",
              }}
            >
              ★
            </span>
          );
        }
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex" }}>{stars}</div>
            <span style={{ fontSize: "12px" }}>({ratingValue}/5)</span>
          </div>
        );
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => {
        try {
          return new Date(date).toLocaleString();
        } catch (error) {
          return 'Invalid date';
        }
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="link"
            icon={<EyeOutlined />}
            className="view-btn"
            onClick={async () => {
              setSelectedFeedbackDetails(record);
              setAccountInfo({ username: '', fullName: '' });
              setIsDetailsModalVisible(true);
              if (record.userId) {
                setAccountLoading(true);
                try {
                  // You may want to get the token from your auth context or storage
                  const token = localStorage.getItem('token');
                  const res = await axios.get(`/admin/accounts/${record.userId}`);
                  setAccountInfo({
                    username: res.data?.username || '',
                    fullName: res.data?.fullName || ''
                  });
                } catch (e) {
                  setAccountInfo({ username: 'N/A', fullName: 'N/A' });
                } finally {
                  setAccountLoading(false);
                }
              } else {
                setAccountInfo({ username: 'N/A', fullName: 'N/A' });
              }
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setFeedbackToDelete(record);
              setDeleteConfirmationVisible(true);
            }}
          >
          </Button>
        </div>
      ),
    },
  ];

  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-feedback ${type}-btn`}>
      {text}
    </Button>
  );

  // Handle search, sort, and status filter
  const handleSearchAndFilter = (searchValue, field = sortField, direction = sortDirection) => {
    console.log("Handling Search and Filter:", {
      searchValue,
      field,
      direction
    });
    setSearchTerm(searchValue);
    setSortField(field);
    setSortDirection(direction);
    fetchFeedbacks(0, searchValue);
  };

  return (
    <div className="feedback-management-container">
      <div className="feedback-management-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search Feedback"
              value={searchTerm}
              onChange={(e) => handleSearchAndFilter(e.target.value)}
              style={{ width: 200, marginRight: 10 }}
            />
            <Select
              style={{ width: 150, marginRight: 10 }}
              placeholder="Sort By"
              value={sortField}
              onChange={(value) => handleSearchAndFilter(searchTerm, value)}
              options={[
                { value: "feedbackId", label: "Feedback ID" },
                { value: "movieName", label: "Movie Name" },
                { value: "rating", label: "Rating" },
                { value: "createdDate", label: "Created Date" }
              ]}
            />
            <Select
              style={{ width: 120 }}
              placeholder="Direction"
              value={sortDirection}
              onChange={(value) => handleSearchAndFilter(searchTerm, sortField, value)}
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" }
              ]}
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={feedbacks}
        loading={loading}
        className="ant-table-feedback"
        locale={{ 
          emptyText: 'No feedbacks found' 
        }}
        pagination={{
          pageSize: 12,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: false,
          className: "pagination-btn-feedback",
          itemRender: (current, type, originalElement) => {
            if (type === "prev") return createPaginationButton("prev", "Previous");
            if (type === "next") return createPaginationButton("next", "Next");
            return originalElement;
          },
          onChange: (page) => {
            fetchFeedbacks(page - 1, searchTerm, sortField, sortDirection);
          }
        }}
      />

      {/* Feedback Details Modal */}
      <Modal
        title="Feedback Details"
        open={isDetailsModalVisible}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedFeedbackDetails(null);
          setAccountInfo({ username: '', fullName: '' });
        }}
        footer={null}
        className="feedback-details-modal"
        width={500}
        centered
      >
        {selectedFeedbackDetails && (
          <div className="feedback-details-content">
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Feedback ID</div>
              <div className="feedback-detail-value">{selectedFeedbackDetails.feedbackId || 'N/A'}</div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Movie Name</div>
              <div className="feedback-detail-value">{selectedFeedbackDetails.movieName || 'Unknown Movie'}</div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Rating</div>
              <div className="feedback-detail-value">
                {(() => {
                  const ratingValue = Number(selectedFeedbackDetails.rating) || 0;
                  const stars = [];
                  for (let i = 1; i <= 5; i++) {
                    stars.push(
                      <span
                        key={i}
                        style={{
                          color: i <= ratingValue ? "#ffd700" : "#434343",
                          fontSize: "16px",
                          marginRight: "2px",
                        }}
                      >
                        ★
                      </span>
                    );
                  }
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex" }}>{stars}</div>
                      <span style={{ fontSize: "14px" }}>({ratingValue}/5)</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Comment</div>
              <div className="feedback-detail-value" style={{ whiteSpace: "pre-wrap" }}>
                {selectedFeedbackDetails.comment || "No comment provided"}
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Created Date</div>
              <div className="feedback-detail-value">
                {selectedFeedbackDetails.createdDate 
                  ? new Date(selectedFeedbackDetails.createdDate).toLocaleString()
                  : 'Invalid date'
                }
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Username</div>
              <div className="feedback-detail-value">{accountLoading ? 'Loading...' : accountInfo.username || 'N/A'}</div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Full Name</div>
              <div className="feedback-detail-value">{accountLoading ? 'Loading...' : accountInfo.fullName || 'N/A'}</div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Invoice ID</div>
              <div className="feedback-detail-value">{selectedFeedbackDetails.invoiceId || 'N/A'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={deleteConfirmationVisible}
        onCancel={() => setDeleteConfirmationVisible(false)}
        footer={null}
        className="feedback-modal delete-confirmation-modal"
        width={400}
        centered
      >
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete the feedback:</p>
          <h3 className="feedback-title">{feedbackToDelete?.movieName}</h3>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="delete-confirmation-actions">
            <Button onClick={() => setDeleteConfirmationVisible(false)} className="cancel-btn">
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={confirmDeleteFeedback}
              className="confirm-delete-btn"
              loading={loading}
            > 
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default FeedbackManagement;