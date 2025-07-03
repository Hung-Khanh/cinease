import { DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Table, Tag } from "antd";
import { useState, useEffect } from "react";
import "./CinemaRoom.scss";

const CinemaRooms = () => {
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [cinemaRoomToDelete, setCinemaRoomToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New states for seat details
  const [seatDetailsModalVisible, setSeatDetailsModalVisible] = useState(false);
  const [seatDetails, setSeatDetails] = useState([]);
  const [selectedCinemaRoom, setSelectedCinemaRoom] = useState(null);

  const fetchCinemaRooms = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/cinema-room/list`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      const formattedRooms = result.map((room) => ({
        key: room.cinemaRoomId.toString(),
        cinemaroom: room.cinemaRoomName,
        seatQuantity: room.seatQuantity
      }));
  
      setCinemaRooms(formattedRooms);
      
      // Only show success message when explicitly requested
      if (showSuccessMessage) {
        message.success("Cinema rooms fetched", 1.5);
      }
    } catch (error) {
      message.error(`Failed to fetch cinema rooms: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCinemaRoom = async (values) => {
    setLoading(true);
    try {
      // Validate input
      if (!values.cinemaroom) {
        message.error("Cinema room name is required", 1);
        return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        message.error("Authentication token is missing", 1);
        return;
      }

      const url = isEditing 
        ? `${apiUrl}/admin/cinema-room/update/${editingKey}`
        : `${apiUrl}/admin/cinema-room/add`;
      
      const method = isEditing ? "PUT" : "POST";
      
      // Prepare the request body
      const requestBody = {
        cinemaRoomName: values.cinemaroom
      };

      // Only add seatQuantity for adding a new room
      if (!isEditing) {
        requestBody.seatQuantity = 100;
      }

      // Clear any existing messages quickly
      message.destroy();

      // Perform the API call
      const response = await fetch(url, {
        method: method,
        headers: {
          "Accept": "text/plain,application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(requestBody),
      });

      // Get response text
      const responseText = await response.text();

      // Check response status
      if (response.ok) {
        // Use a shorter, more performant message display
        message.success(responseText, 1.5);
        
        // Use microtask to ensure UI updates are non-blocking
        await Promise.resolve();
        
        // Reset modal and form state
        setIsModalVisible(false);
        setIsEditing(false);
        setEditingKey(null);
        form.resetFields();
        
        // Refresh the list
        fetchCinemaRooms();
      } else {
        // Simplified error handling
        message.error(
          responseText || `Failed to ${isEditing ? 'update' : 'add'} cinema room`, 
          1.5
        );
      }
    } catch (error) {
      
      message.error(
        error.message || (isEditing 
          ? "Failed to update cinema room" 
          : "Failed to add cinema room"),
        1.5
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete Cinema Room
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/cinema-room/delete/${cinemaRoomToDelete.key}`, {
        method: "DELETE",
        headers: {
          "Accept": "text/plain,application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      // Get response text
      const responseText = await response.text();

      // Check response status
      if (response.ok) {
        // Use a shorter, more performant message display
        message.success(responseText, 1.5);

        // Hide the delete confirmation modal
        setDeleteConfirmationVisible(false);

        // Use microtask to ensure UI updates are non-blocking
        await Promise.resolve();

        // Refresh the list
        fetchCinemaRooms();
      } else {
        // Simplified error handling
        message.error(
          responseText || "Failed to delete cinema room", 
          1.5
        );
      }
    } catch (error) {
      message.error(
        error.message || "Failed to delete cinema room",
        1.5
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch cinema rooms on component mount
  useEffect(() => {
    fetchCinemaRooms();
  }, []);

  const handleEdit = (record) => {
    // Reset the form
    form.resetFields();

    // Set the current cinema room being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(record);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    try {
      // Set the cinema room to be deleted
      setCinemaRoomToDelete(record);

      // Show the delete confirmation modal
      setDeleteConfirmationVisible(true);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      message.error("Failed to show delete confirmation");
    }
  };

  // Fetch seat details for a specific cinema room
  const fetchSeatDetails = async (cinemaRoomId) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/cinema-room/detail/${cinemaRoomId}/seats`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSeatDetails(result);
      setSeatDetailsModalVisible(true);
    } catch (error) {
      message.error(`Failed to fetch seat details: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Cinema Room",
      dataIndex: "cinemaroom",
      key: "cinemaroom",
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.cinemaroom.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Seat Quantity",
      dataIndex: "seatQuantity",
      key: "seatQuantity",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="link"
            icon={<EyeOutlined />}
            className="view-seats-btn"
            onClick={() => {
              setSelectedCinemaRoom(record);
              fetchSeatDetails(record.key);
            }}
          >
            View Seats
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            className="edit-btn"
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            icon={<DeleteOutlined />}
            className="delete-btn"
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  const cancelDelete = () => {
    // Hide the delete confirmation modal
    setDeleteConfirmationVisible(false);
  };

  return (
    <div className="cinema-rooms-container">
      <div className="cinema-rooms-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search cinema room"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200, marginRight: 10 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setIsEditing(false);
              form.resetFields();
            }}
            className="add-cinema-room-btn"
          >
            Add New Cinema Room
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={cinemaRooms}
        loading={loading}
        pagination={{
          pageSize: 12,
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === "prev") {
              return (
                <Button type="default" className="pagination-btn prev-btn">
                  Previous
                </Button>
              );
            }
            if (type === "next") {
              return (
                <Button type="default" className="pagination-btn next-btn">
                  Next
                </Button>
              );
            }
            return originalElement;
          },
        }}
      />

      <Modal
        title={isEditing ? "Edit Cinema Room" : "Add New Cinema Room"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        className="cinema-room-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCinemaRoom}
          className="cinema-room-form"
        >
          <Form.Item
            name="cinemaroom"
            label="Cinema Room Name"
            rules={[
              { required: true, message: "Please input the cinema room name!" },
            ]}
          >
            <Input placeholder="Enter cinema room name" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="submit-btn"
              loading={loading}
            >
              {isEditing ? "Update Cinema Room" : "Add New Cinema Room"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirm Delete"
        open={deleteConfirmationVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Delete"
        okButtonProps={{ danger: true, loading: loading }}
        cancelText="Cancel"
        className="delete-confirmation-modal"
        centered
        width={500}
      >
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete the cinema room?</p>
          <p className="room-title">{cinemaRoomToDelete?.cinemaroom}</p>
          <p className="warning-text">This action cannot be undone.</p>

          <div className="delete-confirmation-actions">
            <Button className="cancel-btn" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button 
              className="confirm-delete-btn" 
              onClick={confirmDelete}
              loading={loading}
            >
              Delete Cinema Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* Seat Details Modal */}
      <Modal
        title="Cinema Room 1 - Seat Map"
        open={seatDetailsModalVisible}
        onCancel={() => setSeatDetailsModalVisible(false)}
        footer={null}
        width={600}
        className="cinema-room-seat-map-modal"
        closeIcon={<span>&times;</span>}
      >
        <div className="seat-map-container">
          <div className="screen">Screen</div>
          <div className="seating-grid">
            {[...Array(10)].map((_, rowIndex) => (
              <div key={`row-${rowIndex + 1}`} className="seating-row">
                <div className="row-label">{rowIndex + 1}</div>
                <div className="row-seats">
                  {[...Array(10)].map((_, colIndex) => {
                    const seatId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
                    const seat = seatDetails.find(s => s.seatColumn + s.seatRow === seatId);
                    const seatType = seat ? seat.seatType.toLowerCase() : 'regular';
                    
                    return (
                      <div 
                        key={seatId} 
                        className={`seat ${seatType}`}
                        data-seat-id={seat ? seat.seatId : null}
                      >
                        {seatId}
                        {seat && (
                          <div className="tooltip">
                            Seat {seatId} - {seat.seatType}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-seat regular"></div>
              <span>Regular Seats</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat vip"></div>
              <span>VIP Seats</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CinemaRooms;
