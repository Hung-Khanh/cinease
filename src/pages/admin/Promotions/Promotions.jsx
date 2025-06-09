import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Table, message } from 'antd';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import './Promotions.scss';

const Promotions = () => {
  const [promotions, setPromotions] = useState([
    {
      key: '1',
      title: 'New Year Promotion',
      startTime: '2024/01/01',
      endTime: '2024/01/31',
      discountLevel: '50,000 VND',
      details: 'Celebrate the New Year with special discounts'
    },
    {
      key: '2',
      title: 'Holiday Season Sale',
      startTime: '2024/12/01',
      endTime: '2024/12/31',
      discountLevel: '60,000 VND',
      details: 'Exclusive offers for the holiday season'
    },
    {
      key: '3',
      title: 'Winter Blockbuster Discount',
      startTime: '2024/02/01',
      endTime: '2024/02/28',
      discountLevel: '80,000 VND',
      details: 'Enjoy big savings on winter movie releases'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  const columns = [
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
      startTime: record.startTime ? dayjs(record.startTime, 'YYYY/MM/DD') : null,
      endTime: record.endTime ? dayjs(record.endTime, 'YYYY/MM/DD') : null
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

  const handleAddPromotion = (values) => {
    if (isEditing) {
      // Update existing promotion
      const updatedPromotions = promotions.map(promo => 
        promo.key === editingKey 
          ? {
              ...promo,
              ...values,
              startTime: values.startTime ? values.startTime.format('YYYY/MM/DD') : null,
              endTime: values.endTime ? values.endTime.format('YYYY/MM/DD') : null
            }
          : promo
      );
      
      setPromotions(updatedPromotions);
      message.success('Promotion updated successfully');
    } else {
      // Add new promotion
      const newPromotion = {
        key: (promotions.length + 1).toString(),
        ...values,
        startTime: values.startTime ? values.startTime.format('YYYY/MM/DD') : null,
        endTime: values.endTime ? values.endTime.format('YYYY/MM/DD') : null,
      };

      setPromotions([...promotions, newPromotion]);
      message.success('Promotion added successfully');
    }
    
    // Reset modal and form
    setIsModalVisible(false);
    setIsEditing(false);
    setEditingKey(null);
    form.resetFields();
  };

  const confirmDelete = () => {
    try {
      // Remove the promotion from the list
      const updatedPromotions = promotions.filter(promo => promo.key !== promotionToDelete.key);
      setPromotions(updatedPromotions);
      message.success(`Promotion "${promotionToDelete.title}" deleted successfully`);

      // Hide the delete confirmation modal
      setDeleteConfirmationVisible(false);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
      message.error('Failed to delete promotion');
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
                style={{ width: '100%' }}
                format="YYYY/MM/DD"
                placeholder="Start Date"
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
                style={{ width: '100%' }}
                format="YYYY/MM/DD"
                placeholder="End Date"
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
            label="Image"
          >
            <Input 
              placeholder="Upload image" 
              className="custom-input"
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