import {
  EyeOutlined
} from "@ant-design/icons";
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  message
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import axios from '../../../constants/axios';
import "./TicketManagement.scss";

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("invoiceId");
  const [sortDirection, setSortDirection] = useState("desc");

  // State for details modal
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);

  // State for pagination 
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });

  // Optimize message handling
  const showSuccessMessage = React.useCallback((content, duration = 2) => {
    message.success({
      content,
      duration,
      key: "ticket-operation-success",
    });
  }, []);

  const showErrorMessage = React.useCallback((content, duration = 3) => {
    message.error({
      content,
      duration,
      key: "ticket-operation-error",
    });
  }, []);

  // Fetch Tickets with search and sort functionality
  const fetchTickets = async (page = 0, searchTerm = "") => {
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

      const response = await axios.get('/admin/invoices', { params });

      // Format tickets with unique keys
      const formattedTickets = response.data.content.map((ticket) => ({
        key: ticket.invoiceId.toString(),
        invoiceId: ticket.invoiceId,
        movieName: ticket.movieName,
        bookingDate: ticket.bookingDate,
        scheduleShowTime: ticket.scheduleShowTime,
        status: ticket.status,
        totalMoney: ticket.totalMoney,
        seat: ticket.seat,
        accountId: ticket.accountId,
        addScore: ticket.addScore,
        useScore: ticket.useScore
      }));

      setTickets(formattedTickets);

      // Update pagination state
      setPagination({
        current: response.data.number + 1,
        pageSize: 12,
        total: response.data.totalElements
      });
    } catch (error) {
      showErrorMessage(`Failed to fetch tickets: ${error.response?.data?.message || error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details
  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await axios.get(`/admin/invoices/${ticketId}`);
      return response.data;
    } catch (error) {
      showErrorMessage(`Failed to fetch ticket details: ${error.response?.data?.message || error.message}`);
      return null;
    }
  };

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets(0);
  }, []);

  // Filtered tickets based on search term
  const filteredTickets = useMemo(() => {
    if (!searchTerm) return tickets;

    const searchTermLower = searchTerm.toLowerCase();
    return tickets.filter(ticket =>
      ticket.movieName.toLowerCase().includes(searchTermLower) ||
      ticket.invoiceId.toString().includes(searchTermLower) ||
      ticket.status.toLowerCase().includes(searchTermLower)
    );
  }, [tickets, searchTerm]);

  // Columns for the Tickets Table
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoiceId",
      key: "invoiceId",
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
          {text}
        </div>
      ),
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Show Time",
      dataIndex: "scheduleShowTime",
      key: "scheduleShowTime",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "CANCELLED": "red",
          "COMPLETED": "green",
          "PENDING": "orange"
        };
        return (
          <span style={{ color: colorMap[status] || "default" }}>
            {status}
          </span>
        );
      },
    },
    {
      title: "Total Money",
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (money) => `${money.toLocaleString()} VND`,
    },
    {
      title: "Seat",
      dataIndex: "seat",
      key: "seat",
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
              const details = await fetchTicketDetails(record.key);
              if (details) {
                setSelectedTicketDetails(details);
                setIsDetailsModalVisible(true);
              }
            }}
          />
        </div>
      ),
    },
  ];
  const createPaginationButton = (type, text) => (
      <Button type="default" className={`pagination-btn-ticket ${type}-btn`}>
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
    fetchTickets(0, searchValue);
  };

  return (
    <div className="ticket-management-container">
      <div className="ticket-management-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search Ticket"
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
                { value: "invoiceId", label: "Invoice ID" },
                { value: "movieName", label: "Movie Name" }
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
        dataSource={tickets}
        loading={loading}
        className="ant-table-ticket"
        locale={{ 
          emptyText: 'No tickets found' 
        }}
        pagination={{
          pageSize: 12,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: false,
          className : "pagination-btn-ticket",
            itemRender: (current, type, originalElement) => {
            if (type === "prev") return createPaginationButton("prev", "Previous");
            if (type === "next") return createPaginationButton("next", "Next");
            return originalElement;
          },
          onChange: (page) => {
            fetchTickets(page - 1, searchTerm);
          }
        }}
      />

      {/* Ticket Details Modal */}
      <Modal
        title="Ticket Details"
        open={isDetailsModalVisible}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedTicketDetails(null);
        }}
        footer={null}
        className="ticket-details-modal"
        width={500}
        centered
      >
        {selectedTicketDetails && (
          <div className="ticket-details-content">
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Invoice ID</div>
              <div className="ticket-detail-value">{selectedTicketDetails.invoiceId}</div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Movie Name</div>
              <div className="ticket-detail-value">{selectedTicketDetails.movieName}</div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Booking Date</div>
              <div className="ticket-detail-value">
                {new Date(selectedTicketDetails.bookingDate).toLocaleString()}
              </div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Show Time</div>
              <div className="ticket-detail-value">
                {new Date(selectedTicketDetails.scheduleShowTime).toLocaleString()}
              </div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Status</div>
              <div className="ticket-detail-value">{selectedTicketDetails.status}</div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Total Money</div>
              <div className="ticket-detail-value">
                {selectedTicketDetails.totalMoney.toLocaleString()} VND
              </div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Seat</div>
              <div className="ticket-detail-value">{selectedTicketDetails.seat}</div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Account ID</div>
              <div className="ticket-detail-value">{selectedTicketDetails.accountId || 'N/A'}</div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Add Score</div>
              <div className="ticket-detail-value">{selectedTicketDetails.addScore}</div>
            </div>
            <div className="ticket-detail-row">
              <div className="ticket-detail-label">Use Score</div>
              <div className="ticket-detail-value">{selectedTicketDetails.useScore}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TicketManagement;
