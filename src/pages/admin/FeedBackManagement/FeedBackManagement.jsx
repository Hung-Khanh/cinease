import { EyeOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Rate, Select, Table, Tag } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import axios from "../../../constants/axios";
import "./FeedbackManagement.scss";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("feedbackId");
  const [sortDirection, setSortDirection] = useState("desc");
  const [ratingFilter, setRatingFilter] = useState("");

  // State for details modal
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedFeedbackDetails, setSelectedFeedbackDetails] = useState(null);

  // State for pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // Optimize message handling
  const showErrorMessage = React.useCallback((content, duration = 3) => {
    message.error({
      content,
      duration,
      key: "feedback-operation-error",
    });
  }, []);

  // Fetch Feedbacks with search and sort functionality
  const fetchFeedbacks = async (page = 0, searchTerm = "", rating = "") => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: 12,
        sortBy: sortField,
        sortDir: sortDirection,
      };

      // Add search parameter if provided
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add rating filter if provided
      if (rating) {
        params.rating = rating;
      }

      const response = await axios.get("/admin/feedback", { params });

      // Handle different possible response structures
      let feedbackData = [];
      let totalElements = 0;
      let pageNumber = 0;

      if (response.data.content) {
        // Paginated response
        feedbackData = response.data.content;
        totalElements = response.data.totalElements;
        pageNumber = response.data.number;
      } else if (Array.isArray(response.data)) {
        // Simple array response
        feedbackData = response.data;
        totalElements = response.data.length;
        pageNumber = page;
      } else {
        feedbackData = [response.data];
        totalElements = 1;
        pageNumber = 0;
      }

      // Format feedbacks with unique keys
      const formattedFeedbacks = feedbackData.map((feedback, index) => ({
        key:
          feedback.feedbackId?.toString() ||
          feedback.id?.toString() ||
          index.toString(),
        feedbackId: feedback.feedbackId || feedback.id,
        movieName: feedback.movieName || feedback.movie?.name || "N/A",
        rating: feedback.rating || feedback.score || 0,
        comment: feedback.comment || feedback.message || feedback.content || "",
        createdDate:
          feedback.createdDate ||
          feedback.createDate ||
          feedback.date ||
          new Date().toISOString(),
        status: feedback.status || "ACTIVE",
        accountId: feedback.accountId || feedback.userId || feedback.customerId,
        invoiceId: feedback.invoiceId || feedback.ticketId,
      }));

      setFeedbacks(formattedFeedbacks);

      // Update pagination state
      setPagination({
        current: pageNumber + 1,
        pageSize: 12,
        total: totalElements,
      });
    } catch (error) {
      console.error("Fetch feedbacks error:", error);
      showErrorMessage(
        `Failed to fetch feedbacks: ${
          error.response?.data?.message || error.message
        }`,
        1.5
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedback details
  const fetchFeedbackDetails = async (feedbackId) => {
    try {
      const response = await axios.get(`/admin/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      showErrorMessage(
        `Failed to fetch feedback details: ${
          error.response?.data?.message || error.message
        }`
      );
      return null;
    }
  };

  // Fetch feedbacks on component mount and when sort parameters change
  useEffect(() => {
    fetchFeedbacks(0, searchTerm, ratingFilter);
  }, [sortField, sortDirection]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchFeedbacks(0);
  }, []);

  // Filtered feedbacks based on search term and rating
  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks;

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (feedback) =>
          feedback.movieName.toLowerCase().includes(searchTermLower) ||
          feedback.comment.toLowerCase().includes(searchTermLower) ||
          feedback.feedbackId.toString().includes(searchTermLower)
      );
    }

    if (ratingFilter) {
      filtered = filtered.filter(
        (feedback) => feedback.rating.toString() === ratingFilter
      );
    }

    return filtered;
  }, [feedbacks, searchTerm, ratingFilter]);

  // Columns for the Feedbacks Table
  const columns = [
    {
      title: "Feedback ID",
      dataIndex: "feedbackId",
      key: "feedbackId",
      width: 120,
    },
    {
      title: "Movie Name",
      dataIndex: "movieName",
      key: "movieName",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      align: 'center',
      render: (rating) => {
        const ratingValue = Number(rating) || 0;
        const stars = [];
        
        for (let i = 1; i <= 5; i++) {
          stars.push(
            <span 
              key={i}
              style={{ 
                color: i <= ratingValue ? '#ffd700' : '#434343',
                fontSize: '14px',
                marginRight: '2px'
              }}
            >
              ★
            </span>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <div style={{ display: 'flex' }}>
              {stars}
            </div>
            <span style={{ color: '#ffffff', fontSize: '12px' }}>
              ({ratingValue}/5)
            </span>
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="link"
            icon={<EyeOutlined />}
            className="view-btn"
            onClick={() => {
              // Use the existing record data instead of API call
              setSelectedFeedbackDetails(record);
              setIsDetailsModalVisible(true);
            }}
          />
        </div>
      ),
    },
  ];
  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-feedback ${type}-btn`}>
      {text}
    </Button>
  );
  // Handle search, sort, and rating filter - Updated to match ticket structure
  const handleSearchAndFilter = (searchValue, field = sortField, direction = sortDirection) => {
    console.log("Handling Search and Filter:", {
      searchValue,
      field,
      direction
    });
    setSearchTerm(searchValue);
    setSortField(field);
    setSortDirection(direction);
    fetchFeedbacks(0, searchValue, ratingFilter);
  };

  // Rating filter options
  const ratingOptions = [
    { value: "", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" },
  ];

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
                { value: "movieName", label: "Movie Name" }
              ]}
            />
            <Select
              style={{ width: 120, marginRight: 10 }}
              placeholder="Direction"
              value={sortDirection}
              onChange={(value) => handleSearchAndFilter(searchTerm, sortField, value)}
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" }
              ]}
            />
            <Select
              style={{ width: 130 }}
              placeholder="Filter Rating"
              value={ratingFilter}
              onChange={(value) => {
                setRatingFilter(value);
                fetchFeedbacks(0, searchTerm, value);
              }}
              options={ratingOptions}
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredFeedbacks}
        loading={loading}
        className="ant-table-feedback"
        locale={{
          emptyText: "No feedbacks found",
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
            fetchFeedbacks(page - 1, searchTerm, ratingFilter);
          },
        }}
      />

      {/* Feedback Details Modal */}
      <Modal
        title="Feedback Details"
        open={isDetailsModalVisible}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedFeedbackDetails(null);
        }}
        footer={null}
        className="feedback-details-modal"
        width={600}
        centered
      >
        {selectedFeedbackDetails && (
          <div className="feedback-details-content">
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Feedback ID</div>
              <div className="feedback-detail-value">
                {selectedFeedbackDetails.feedbackId}
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Movie Name</div>
              <div className="feedback-detail-value">
                {selectedFeedbackDetails.movieName}
              </div>
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
                          color: i <= ratingValue ? '#ffd700' : '#434343',
                          fontSize: '16px',
                          marginRight: '2px'
                        }}
                      >
                        ★
                      </span>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex' }}>
                        {stars}
                      </div>
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>
                        ({ratingValue}/5)
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Comment</div>
              <div
                className="feedback-detail-value"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {selectedFeedbackDetails.comment || "No comment provided"}
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Date Created</div>
              <div className="feedback-detail-value">
                {new Date(selectedFeedbackDetails.createdDate).toLocaleString()}
              </div>
            </div>
            <div className="feedback-detail-row">
              <div className="feedback-detail-label">Status</div>
              <div className="feedback-detail-value">
                <Tag
                  color={
                    selectedFeedbackDetails.status === "ACTIVE"
                      ? "green"
                      : selectedFeedbackDetails.status === "INACTIVE"
                      ? "red"
                      : selectedFeedbackDetails.status === "PENDING"
                      ? "orange"
                      : selectedFeedbackDetails.status === "APPROVED"
                      ? "blue"
                      : "default"
                  }
                >
                  {selectedFeedbackDetails.status}
                </Tag>
              </div>
            </div>
            {selectedFeedbackDetails.accountId && (
              <div className="feedback-detail-row">
                <div className="feedback-detail-label">Account ID</div>
                <div className="feedback-detail-value">
                  {selectedFeedbackDetails.accountId}
                </div>
              </div>
            )}
            {selectedFeedbackDetails.invoiceId && (
              <div className="feedback-detail-row">
                <div className="feedback-detail-label">Invoice ID</div>
                <div className="feedback-detail-value">
                  {selectedFeedbackDetails.invoiceId}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManagement;