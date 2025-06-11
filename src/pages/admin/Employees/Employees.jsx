import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Table, message, Upload } from 'antd';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import './Employees.scss';

const Employees = () => {
  const [employees, setEmployees] = useState([
    {
      key: '1',
      username: 'Employee01',
      fullName: 'Minh Tri',
      dateOfBirth: '2003/11/21',
      gender: 'Female',
      email: 'tricao@gmail.com',
      identityCard: '123456789',
      phone: '123456789',
      address: 'HCM',
      image: null
    },
    {
      key: '2',
      username: 'Employee02',
      fullName: 'Hoang Minh',
      dateOfBirth: '2004/11/21',
      gender: 'Female',
      email: 'hoangminh@gmail.com',
      identityCard: '123456789',
      phone: '123456789',
      address: 'HCM',
      image: null
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        image ? (
          <img
            src={image}
            alt="Employee"
            style={{
              width: 50,
              height: 50,
              objectFit: 'cover',
              borderRadius: '50%'
            }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#27ae60',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white'
            }}
          >
            {/* First letter of full name */}
            {employees.find(emp => emp.image === image)?.fullName[0] || 'N/A'}
          </div>
        )
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.username.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Identity Card',
      dataIndex: 'identityCard',
      key: 'identityCard',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
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
    setImageFile(null);

    // Prepare form values with dayjs dates
    const editRecord = {
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth, 'YYYY/MM/DD') : null,
    };

    // Set the current employee being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(editRecord);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    try {
      // Set the employee to be deleted
      setEmployeeToDelete(record);

      // Show the delete confirmation modal
      setDeleteConfirmationVisible(true);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
      message.error('Failed to show delete confirmation');
    }
  };

  const handleAddEmployee = (values) => {
    // Generate a unique key for the new employee
    const newKey = (employees.length + 1).toString();

    // Prepare the new employee object
    const newEmployee = {
      key: newKey,
      ...values,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY/MM/DD') : null,
      // Auto-set register date to current date
      registerDate: dayjs().format('YYYY/MM/DD'),
      // Add image if uploaded
      image: imageFile ? URL.createObjectURL(imageFile) : null
    };

    if (isEditing) {
      // Update existing employee
      const updatedEmployees = employees.map(emp =>
        emp.key === editingKey
          ? {
            ...newEmployee,
            key: emp.key,
            registerDate: emp.registerDate // Preserve original register date
          }
          : emp
      );

      setEmployees(updatedEmployees);
      message.success('Employee updated successfully');
    } else {
      // Add new employee
      setEmployees([...employees, newEmployee]);
      message.success('Employee added successfully');
    }

    // Reset modal and form
    setIsModalVisible(false);
    setIsEditing(false);
    setEditingKey(null);
    setImageFile(null);
    form.resetFields();
  };

  const handleImageUpload = (info) => {
    const file = info.file.originFileObj;
    setImageFile(file);
  };

  const confirmDelete = () => {
    try {
      // Remove the employee from the list
      const updatedEmployees = employees.filter(emp => emp.key !== employeeToDelete.key);
      setEmployees(updatedEmployees);
      message.success(`Employee "${employeeToDelete.fullName}" deleted successfully`);

      // Hide the delete confirmation modal
      setDeleteConfirmationVisible(false);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
      message.error('Failed to delete employee');
    }
  };

  const cancelDelete = () => {
    // Hide the delete confirmation modal
    setDeleteConfirmationVisible(false);
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search employees"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200, marginRight: 10 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="add-employee-btn"
          >
            Add New Employee
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
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
        title={isEditing ? "Edit Employee" : "Add New Employee"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setEditingKey(null);
          setImageFile(null);
          form.resetFields();
        }}
        footer={null}
        className="employee-modal"
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEmployee}
          className="employee-form"
        >
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input the phone number!' }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>


          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: 'Please select date of birth!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY/MM/DD"
              placeholder="Select date of birth"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select gender!' }]}
          >
            <Select placeholder="Select gender">
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="identityCard"
            label="Identity Card"
            rules={[{ required: true, message: 'Please input the identity card number!' }]}
          >
            <Input placeholder="Enter identity card number" />
          </Form.Item>
          {/* Image Upload */}
          <Form.Item
            name="image"
            label="Employee Image"
            className="employee-image-uploader"
          >
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={() => false} // Prevent auto upload
              onChange={handleImageUpload}
            >
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              className="submit-btn"
            >
              {isEditing ? "Update Employee" : "Add New Employee"}
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
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        className="delete-confirmation-modal"
        centered
        width={500}
      >
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete the employee?</p>
          <p className="movie-title">{employeeToDelete?.fullName}</p>
          <p className="warning-text">This action cannot be undone.</p>
          
          <div className="delete-confirmation-actions">
            <Button 
              className="cancel-btn" 
              onClick={cancelDelete}
            >
              Cancel
            </Button>
            <Button 
              className="confirm-delete-btn" 
              onClick={confirmDelete}
            >
              Delete Employee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
