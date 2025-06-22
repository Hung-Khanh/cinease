import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Table, message, Upload } from 'antd';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './Promotions.scss';

const Promotions = () => {
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  // Fetch promotions from API
  const fetchPromotions = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/promotions`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      const formattedPromotions = result.map((promotion) => {
        return {
          key: promotion.promotionId.toString(),
          title: promotion.title,
          startTime: promotion.startTime,
          endTime: promotion.endTime,
          discountLevel: `${promotion.discountLevel} %`,
          details: promotion.detail || 'No details available',
          image: promotion.image || null
        };
      });

      setPromotions(formattedPromotions);

      if (showSuccessMessage) {
        message.success(`Fetched ${formattedPromotions.length} promotions successfully`, 1.5);
      }
    } catch (error) {
      message.error(`Failed to fetch promotions: ${error.message}`, 3);
    } finally {
      setLoading(false);
    }
  };

  // Fetch promotions on component mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => image ? (
        <img 
          src={image} 
          alt="Promotion" 
          style={{ 
            width: '100px', 
            height: '100px', 
            objectFit: 'cover', 
            borderRadius: '8px' 
          }} 
        />
      ) : (
        <div style={{ color: '#999' }}>No Image</div>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: 'Discount Level',
      dataIndex: 'discountLevel',
      key: 'discountLevel',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
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

  const handleEdit = (record) => {
    // Reset the form
    form.resetFields();

    // Prepare form values with dayjs dates
    const editRecord = {
      ...record,
      startTime: record.startTime ? dayjs(record.startTime, 'YYYY-MM-DD HH:mm') : null,
      endTime: record.endTime ? dayjs(record.endTime, 'YYYY-MM-DD HH:mm') : null,
      discountLevel: record.discountLevel.replace(' VND', ''), // Remove VND for editing
      details: record.details, // Use 'details' for form display
      image: record.image // Directly use image URL
    };

    // Set the current promotion being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(editRecord);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    try {
      // Set the promotion to be deleted
      setPromotionToDelete(record);

      // Show the delete confirmation modal
      setDeleteConfirmationVisible(true);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
      message.error('Failed to show delete confirmation');
    }
  };

  const handleAddPromotion = async (values) => {
    try {
      const token = localStorage.getItem('token');
      
      // Format dates to match the API's expected format
      const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : null;

      const requestBody = {
        ...(isEditing ? { promotionId: parseInt(editingKey) } : {}),
        title: values.title,
        startTime: formatDate(values.startTime),
        endTime: formatDate(values.endTime),
        discountLevel: parseInt(values.discountLevel),
        detail: values.details,
        image: values.image || null,
      };

      const url = isEditing
        ? `${apiUrl}/admin/promotions/${editingKey}`
        : `${apiUrl}/admin/promotions`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} promotion. Status: ${response.status}, Message: ${responseText}`);
      }

      // Refresh the promotions list
      await fetchPromotions(true);

      // Show success message
      message.success(`Promotion "${values.title}" ${isEditing ? 'updated' : 'added'} successfully!`, 3);

      // Reset modal and form
      setIsModalVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      form.resetFields();
    } catch (error) {
      message.error(`Failed to ${isEditing ? 'update' : 'add'} promotion: ${error.message}`, 3);
    }
  };

  const confirmDelete = async () => {
    if (promotionToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/admin/promotions/${promotionToDelete.key}`, {
          method: "DELETE",
          headers: {
            "Accept": "*/*",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`Failed to delete promotion. Status: ${response.status}, Message: ${responseText}`);
        }

        // Refresh the promotions list
        await fetchPromotions(true);

        // Specific delete success toast
        message.success(`Promotion "${promotionToDelete.title}" deleted successfully`, 2);

        // Hide the delete confirmation modal
        setDeleteConfirmationVisible(false);
        setPromotionToDelete(null);
      } catch (error) {
        message.error(`Failed to delete promotion: ${error.message}`, 3);
      }
    }
  };

  const cancelDelete = () => {
    // Hide the delete confirmation modal
    setDeleteConfirmationVisible(false);
  };

  return (
    <div className="promotions-container">
      <div className="promotions-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            {/* Removed Genre and Status dropdowns */}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="add-promotion-btn"
          >
            Add New Promotion
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        loading={loading}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === 'prev') {
              return (
                <Button 
                  type="default" 
                  className="pagination-btn prev-btn"
                >
                  Previous
                </Button>
              );
            }
            if (type === 'next') {
              return (
                <Button 
                  type="default" 
                  className="pagination-btn next-btn"
                >
                  Next
                </Button>
              );
            }
            return originalElement;
          }
        }}
      />

      <Modal
        title={isEditing ? "Edit Promotion" : "Add New Promotion"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        className="promotion-modal"
        width={500}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPromotion}
          className="promotion-form"
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Promotion Title"
            rules={[{ 
              required: true, 
              message: 'Please enter promotion title',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter promotion title" 
              className="custom-input"
            />
          </Form.Item>

          <div className="time-range-container">
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[
                { 
                  required: true, 
                  message: 'Start date is required',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const endTime = getFieldValue('endTime');
                    if (!value) {
                      return Promise.reject(new Error('Please select a start date'));
                    }
                    if (endTime && value.isAfter(endTime)) {
                      return Promise.reject(new Error('Start date must be before end date'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              hasFeedback
              style={{ width: '48%' }}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm"
                placeholder="Start Date and Time"
                className="custom-datepicker"
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time"
              rules={[
                { 
                  required: true, 
                  message: 'End date is required',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime');
                    if (!value) {
                      return Promise.reject(new Error('Please select an end date'));
                    }
                    if (startTime && value.isBefore(startTime)) {
                      return Promise.reject(new Error('End date must be after start date'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              hasFeedback
              style={{ width: '48%' }}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm"
                placeholder="End Date and Time"
                className="custom-datepicker"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="discountLevel"
            label="Discount Level"
            rules={[{ 
              required: true, 
              message: 'Please enter discount level',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter discount amount" 
              className="custom-input"
              type="number"
            />
          </Form.Item>

          <Form.Item
            name="details"
            label="Promotion Details"
            rules={[{ 
              required: true, 
              message: 'Please enter promotion details',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input.TextArea 
              placeholder="Enter promotion details" 
              rows={4}
              className="custom-textarea"
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="Promotion Image URL"
            rules={[{ 
              type: 'url', 
              message: 'Please enter a valid image URL',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter image URL" 
              className="custom-input"
              prefix={<UploadOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              className="submit-btn"
            >
              {isEditing ? "Update Promotion" : "Add New Promotion"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={deleteConfirmationVisible}
        onCancel={cancelDelete}
        footer={null}
        className="promotion-modal delete-confirmation-modal"
        width={400}
        centered
      >
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete the promotion:</p>
          <h3 className="promotion-title">{promotionToDelete?.title}</h3>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="delete-confirmation-actions">
            <Button 
              onClick={cancelDelete} 
              className="cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              danger 
              onClick={confirmDelete} 
              className="confirm-delete-btn"
            >
              Confirm Delete
            </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Promotions; 