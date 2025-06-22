import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Table, message } from 'antd';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './Employees.scss';

const Employees = () => {
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Fetch employees from API
  const fetchEmployees = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/employee/list`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      const formattedEmployees = result.map((employee, index) => ({
        key: employee.employeeId?.toString() || index.toString(),
        fullName: employee.fullName || 'N/A',
        identityCard: employee.identityCard || 'N/A',
        email: employee.email || 'N/A',
        phoneNumber: employee.phoneNumber || 'N/A',
        address: employee.address || 'N/A',
      }));

      setEmployees(formattedEmployees);

      if (showSuccessMessage) {
        message.success(`Fetched ${formattedEmployees.length} employees successfully`, 1.5);
      }
    } catch (error) {
      message.error(`Failed to fetch employees: ${error.message}`, 3);
      setEmployees([]); // Ensure employees is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.fullName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Identity Card',
      dataIndex: 'identityCard',
      key: 'identityCard',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
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

    // Prepare form values
    const editRecord = {
      ...record,
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

  const handleAddEmployee = async (values) => {
    try {
      const token = localStorage.getItem('token');

      const requestBody = {
        image: values.image || "https://example.com/default-avatar.jpg",
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        gender: values.gender,
        fullName: values.fullName,
        identityCard: values.identityCard,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
      };

      const url = isEditing
        ? `${apiUrl}/admin/employee/${editingKey}`
        : `${apiUrl}/admin/employee/add`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} employee. Status: ${response.status}, Message: ${responseText}`);
      }

      // Refresh the employees list
      await fetchEmployees(true);

      // Show success message
      message.success(`Employee "${values.fullName}" ${isEditing ? 'updated' : 'added'} successfully!`, 3);

      // Reset modal and form
      setIsModalVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      form.resetFields();
    } catch (error) {
      message.error(`Failed to ${isEditing ? 'update' : 'add'} employee: ${error.message}`, 3);
    }
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/admin/employee/${employeeToDelete.key}`, {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`Failed to delete employee. Status: ${response.status}, Message: ${responseText}`);
        }

        // Refresh the employees list
        await fetchEmployees(true);

        // Specific delete success toast
        message.success(`Employee "${employeeToDelete.fullName}" deleted successfully`, 2);

        // Hide the delete confirmation modal
        setDeleteConfirmationVisible(false);
        setEmployeeToDelete(null);
      } catch (error) {
        message.error(`Failed to delete employee: ${error.message}`, 3);
      }
    }
  };

  const cancelDelete = () => {
    // Hide the delete confirmation modal
    setDeleteConfirmationVisible(false);
  };

  // Error Boundary Component
  const ErrorFallback = ({ error }) => {
    return (
      <div role="alert" style={{ 
        padding: '20px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        borderRadius: '5px' 
      }}>
        <p>Something went wrong:</p>
        <pre style={{ color: 'red' }}>{error.message}</pre>
        <Button onClick={() => fetchEmployees()}>
          Try Again
        </Button>
      </div>
    );
  };

  // Render method with error handling
  const renderEmployeesTable = () => {
    try {
      // Ensure employees is an array before rendering
      const safeEmployees = Array.isArray(employees) ? employees : [];

      return (
        <Table
          columns={columns}
          dataSource={safeEmployees}
          loading={loading}
          locale={{
            emptyText: loading ? 'Loading...' : 'No employees found'
          }}
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
      );
    } catch (error) {
      return <ErrorFallback error={error} />;
    }
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

      {renderEmployeesTable()}

      <Modal
        title={isEditing ? "Edit Employee" : "Add New Employee"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setEditingKey(null);
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
            name="phoneNumber"
            label="Phone Number"
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
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="identityCard"
            label="Identity Card"
            rules={[{ required: true, message: 'Please input the identity card number!' }]}
          >
            <Input placeholder="Enter identity card number" />
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
