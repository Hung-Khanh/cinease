/* eslint-disable no-unused-vars */
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import api from '../../../constants/axios';
import './Employees.scss';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Fetch employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/employee/list');

      const formattedEmployees = response.data.map((employee, index) => ({
        key: employee.employeeId?.toString() || index.toString(),
        fullName: employee.fullName || 'N/A',
        identityCard: employee.identityCard || 'N/A',
        email: employee.email || 'N/A',
        phoneNumber: employee.phoneNumber || 'N/A',
        address: employee.address || 'N/A',
      }));

      setEmployees(formattedEmployees);
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

  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-employees ${type}-btn`}>
      {text}
    </Button>
  );
  const handleEdit = (record) => {
    // Reset the form
    form.resetFields();

    // Prepare form values - only include editable fields
    const editRecord = {
      fullName: record.fullName,
      identityCard: record.identityCard,
      email: record.email,
      phoneNumber: record.phoneNumber,
      address: record.address,
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
      // Format date of birth to match backend expectation
      const formattedDateOfBirth = values.dateOfBirth
        ? new Date(values.dateOfBirth).toISOString().split('T')[0]
        : null;

      // Determine the request body based on whether we're editing or adding
      const requestBody = isEditing
        ? Object.fromEntries(
          Object.entries({
            fullName: values.fullName,
            identityCard: values.identityCard,
            email: values.email,
            phoneNumber: values.phoneNumber,
            address: values.address,
          }).filter(([, value]) => value !== undefined && value !== null)
        )
        : {
          image: values.image || "https://example.com/default-avatar.jpg",
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword,
          dateOfBirth: formattedDateOfBirth,
          gender: values.gender,
          fullName: values.fullName,
          identityCard: values.identityCard,
          email: values.email,
          phoneNumber: values.phoneNumber,
          address: values.address,
        };

      // Construct the URL for editing or adding
      const url = isEditing
        ? `/admin/employee/edit/${editingKey}`
        : `/admin/employee/add`;
      const method = isEditing ? 'put' : 'post';

      const response = await api[method](url, requestBody);

      // Refresh the employees list
      await fetchEmployees(true);

      // Show success message
      message.success(`Employee ${isEditing ? 'updated' : 'added'} successfully!`, 3);

      // Reset modal and form
      setIsModalVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      form.resetFields();
    } catch (error) {
      message.error(`Failed to ${isEditing ? 'update' : 'add'} employee: ${error.response?.data || error.message}`, 3);
    }
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await api.delete(`/admin/employee/disable/${employeeToDelete.key}`);

        // Refresh the employees list
        await fetchEmployees(true);

        // Specific delete success toast
        message.success(`Employee "${employeeToDelete.fullName}" deleted successfully`, 2);

        // Hide the delete confirmation modal
        setDeleteConfirmationVisible(false);
        setEmployeeToDelete(null);
      } catch (error) {
        message.error(`Failed to delete employee: ${error.response?.data || error.message}`, 3);
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
          className='ant-table-employee'
          locale={{
            emptyText: loading ? 'Loading...' : 'No employees found'
          }}
          pagination={{
            className: "pagination-btn-employees",

            pageSize: 12,
            showSizeChanger: false,
             itemRender: (current, type, originalElement) => {
            if (type === "prev") return createPaginationButton("prev", "Previous");
            if (type === "next") return createPaginationButton("next", "Next");
            return originalElement;
          },
          }}
        />
      );
    } catch (error) {
      return <ErrorFallback error={error} />;
    }
  };

  // Custom Password Input Component
  const PasswordInput = ({ value, onChange, placeholder, name }) => {
    return (
      <div style={{ position: 'relative' }}>
        <Input
          type={passwordVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          style={{ paddingRight: '40px' }}
        />
        <div
          onClick={() => setPasswordVisible(!passwordVisible)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          {passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </div>
      </div>
    );
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search employee"
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
          setPasswordVisible(false);
          form.resetFields();
        }}
        footer={null}
        className="employee-modal"
        width={600}
        centered
        styles={{
          body: { maxHeight: '70vh', overflowY: 'auto' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEmployee}
          className="employee-form"
          scrollToFirstError={true}
        >
          {!isEditing && (
            <>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please input the username!' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input the password!' },
                  { min: 8, message: 'Password must be at least 8 characters long' }
                ]}
              >
                <PasswordInput
                  placeholder="Enter password"
                  name="password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <PasswordInput
                  placeholder="Confirm password"
                  name="confirmPassword"
                />
              </Form.Item>

              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please select date of birth!' }]}
              >
                <Input type="date" placeholder="Select date of birth" />
              </Form.Item>

              <Form.Item
                name="image"
                label="Profile Image URL"
                initialValue="https://example.com/default-avatar.jpg"
              >
                <Input placeholder="Enter profile image URL" />
              </Form.Item>
            </>
          )}

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
