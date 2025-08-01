import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Table } from "antd";
import { useEffect, useState } from "react";
import api from '../../../constants/axios';
import "./CinemaRoom.scss";

const CinemaRooms = () => {
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [cinemaRoomToDelete, setCinemaRoomToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seatDetailsModalVisible, setSeatDetailsModalVisible] = useState(false);
  const [seatDetails, setSeatDetails] = useState([]);
  const [selectedCinemaRoom, setSelectedCinemaRoom] = useState(null);

  // Common API handler
  const handleApiCall = async (apiCall, successMessage, errorMessage) => {
    setLoading(true);
    try {
      const response = await apiCall();
      if (successMessage) {
        message.success(successMessage, 1.5);
      }
      return response;
    } catch (error) {
      const errorMsg = error.response?.data || errorMessage || error.message;
      message.error(errorMsg, 1.5);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Modal visibility handlers
  const showModal = (modalType, data = null) => {
    const modalMap = {
      add: () => {
        setIsModalVisible(true);
        setIsEditing(false);
        form.resetFields();
      },
      edit: () => {
        form.resetFields();
        setEditingKey(data.key);
        form.setFieldsValue(data);
        setIsEditing(true);
        setIsModalVisible(true);
      },
      delete: () => {
        setCinemaRoomToDelete(data);
        setDeleteConfirmationVisible(true);
      },
      viewSeats: () => {
        setSelectedCinemaRoom(data);
        fetchSeatDetails(data.key);
      }
    };
    modalMap[modalType]();
  };

  const closeModal = (modalType) => {
    const modalMap = {
      main: () => {
        setIsModalVisible(false);
        setIsEditing(false);
        setEditingKey(null);
        form.resetFields();
      },
      delete: () => setDeleteConfirmationVisible(false),
      seats: () => setSeatDetailsModalVisible(false)
    };
    modalMap[modalType]();
  };

  const fetchCinemaRooms = async (showSuccessMessage = false) => {
    try {
      const response = await handleApiCall(
        () => api.get('/admin/cinema-room/list'),
        showSuccessMessage ? "Cinema rooms fetched" : null,
        "Failed to fetch cinema rooms"
      );
      
      const formattedRooms = response.data.map(room => ({
        key: room.cinemaRoomId.toString(),
        cinemaroom: room.cinemaRoomName,
        seatQuantity: room.seatQuantity
      }));
      
      setCinemaRooms(formattedRooms);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  const handleAddCinemaRoom = async (values) => {
    if (!values.cinemaroom) {
      message.error("Cinema room name is required", 1);
      return;
    }

    const url = isEditing 
      ? `/admin/cinema-room/update/${editingKey}`
      : `/admin/cinema-room/add`;
    
    const method = isEditing ? 'put' : 'post';
    const requestBody = {
      cinemaRoomName: values.cinemaroom,
      ...(method === 'post' && { seatQuantity: 100 })
    };

    if (typeof message.destroy === 'function') {
      message.destroy();
    }

    try {
      const response = await handleApiCall(
        () => api[method](url, requestBody),
        null,
        isEditing ? "Failed to update cinema room" : "Failed to add cinema room"
      );

      message.success(response.data, 1.5);
      closeModal('main');
      fetchCinemaRooms();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await handleApiCall(
        () => api.delete(`/admin/cinema-room/delete/${cinemaRoomToDelete.key}`),
        null,
        "Failed to delete cinema room"
      );

      message.success(response.data, 1.5);
      closeModal('delete');
      fetchCinemaRooms();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  const fetchSeatDetails = async (cinemaRoomId) => {
    try {
      const response = await handleApiCall(
        () => api.get(`/admin/cinema-room/detail/${cinemaRoomId}/seats`),
        null,
        "Failed to fetch seat details"
      );
      
      setSeatDetails(response.data);
      setSeatDetailsModalVisible(true);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  const updateSeatType = async (seatId, newSeatType) => {
    try {
      const response = await handleApiCall(
        () => api.put(`/admin/cinema-room/detail/${selectedCinemaRoom.key}/update-seat-type`, {
          seatIds: [seatId],
          newSeatType: newSeatType
        }),
        null,
        "Failed to update seat type"
      );

      message.success(response.data, 1.5);
      fetchSeatDetails(selectedCinemaRoom.key);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  const createSeatGrid = () => {
    return [...Array(10)].map((_, rowIndex) => (
      <div key={`row-${rowIndex + 1}`} className="seating-row">
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
                onClick={() => {
                  if (seat) {
                    const newSeatType = seatType === 'regular' ? 1 : 0;
                    updateSeatType(seat.seatId, newSeatType);
                  }
                }}
              >
                {seatId}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  const renderSeatDetails = () => (
    <div className="seat-map-container">
      <div className="screen">Screen</div>
      <div className="seating-grid">
        {createSeatGrid()}
      </div>
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-seat regular"></div>
          <span>Regular Seats (Click to change to VIP)</span>
        </div>
        <div className="legend-item">
          <div className="legend-seat vip"></div>
          <span>VIP Seats (Click to change to Regular)</span>
        </div>
      </div>
    </div>
  );

  const createActionButton = (icon, className, onClick, children = null) => (
    <Button
      type="link"
      icon={icon}
      className={className}
      onClick={onClick}
    >
      {children}
    </Button>
  );

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
          {createActionButton(
            <EyeOutlined />,
            "view-seats-btn",
            () => showModal('viewSeats', record),
            "View Seats"
          )}
          {createActionButton(
            <EditOutlined />,
            "edit-btn",
            () => showModal('edit', record)
          )}
          {createActionButton(
            <DeleteOutlined />,
            "delete-btn",
            () => showModal('delete', record)
          )}
        </div>
      ),
    },
  ];

  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-cinema ${type}-btn`}>
      {text}
    </Button>
  );

  const createModal = (config) => (
    <Modal {...config}>
      {config.content}
    </Modal>
  );

  useEffect(() => {
    fetchCinemaRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            onClick={() => showModal('add')}
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
        className="ant-table-cinema"
        locale={{ 
          emptyText: 'No cinema rooms found' 
        }}
        pagination={{
          pageSize: 12,
          className: "pagination-btn-cinema",
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === "prev") return createPaginationButton("prev", "Previous");
            if (type === "next") return createPaginationButton("next", "Next");
            return originalElement;
          },
        }}
      />

      {/* Main Modal */}
      {createModal({
        title: isEditing ? "Edit Cinema Room" : "Add New Cinema Room",
        open: isModalVisible,
        onCancel: () => closeModal('main'),
        footer: null,
        className: "cinema-room-modal",
        centered: true,
        content: (
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
        )
      })}

      {/* Delete Confirmation Modal */}
      {createModal({
        title: "Confirm Delete",
        open: deleteConfirmationVisible,
        onOk: confirmDelete,
        onCancel: () => closeModal('delete'),
        okText: "Delete",
        okButtonProps: { danger: true, loading: loading },
        cancelText: "Cancel",
        className: "delete-confirmation-modal",
        centered: true,
        width: 500,
        content: (
          <div className="delete-confirmation-content">
            <p>Are you sure you want to delete the cinema room?</p>
            <p className="room-title">{cinemaRoomToDelete?.cinemaroom}</p>
            <p className="warning-text">This action cannot be undone.</p>

            <div className="delete-confirmation-actions">
              <Button className="cancel-btn" onClick={() => closeModal('delete')}>
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
        )
      })}

      {/* Seat Details Modal */}
      {createModal({
        title: "Cinema Room 1 - Seat Map",
        open: seatDetailsModalVisible,
        onCancel: () => closeModal('seats'),
        footer: null,
        width: 600,
        className: "cinema-room-seat-map-modal",
        closeIcon: <span>&times;</span>,
        content: renderSeatDetails()
      })}
    </div>
  );
};

export default CinemaRooms;
