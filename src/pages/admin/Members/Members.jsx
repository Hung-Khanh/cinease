import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Table } from "antd";
import { useState, useEffect, useMemo } from "react";
import api from '../../../constants/axios';
import "./Members.scss";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [form] = Form.useForm();

  // Fetch Members List
  const fetchMembers = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await api.get('/admin/members');
      
      // Handle response with content array
      const membersData = response.data.content || response.data;
  
      // Ensure each member has a unique key and all required properties
      const formattedMembers = membersData.map((member) => ({
        key: member.memberId ? member.memberId.toString() : Math.random().toString(),
        fullName: member.fullName || 'N/A',
        identityCard: member.identityCard || 'N/A',
        email: member.email || 'N/A',
        phoneNumber: member.phoneNumber || 'N/A',
        address: member.address || 'N/A',
        point: member.point !== undefined ? member.point : 0,
        membershipLevel: member.membershipLevel || 'N/A'
      }));
  
      setMembers(formattedMembers);
      
      if (showSuccessMessage) {
        message.success("Members list fetched successfully", 1.5);
      }
    } catch (error) {
      message.error(`Failed to fetch members: ${error.message}`, 1.5);
      setMembers([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch Member Details
  const fetchMemberDetails = async (memberId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/members/${memberId}/account`);
      
      // Format the details
      setMemberDetails({
        fullName: response.data.fullName || 'N/A',
        dateOfBirth: response.data.dateOfBirth || 'N/A',
        gender: response.data.gender || 'N/A',
        email: response.data.email || 'N/A',
        identityCard: response.data.identityCard || 'N/A',
        phoneNumber: response.data.phoneNumber || 'N/A',
        address: response.data.address || 'N/A'
      });

      setIsDetailModalVisible(true);
    } catch (error) {
      message.error(`Failed to fetch member details: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  // Memoized filtered members for performance
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    
    const searchTermLower = searchTerm.toLowerCase();
    return members.filter(member => 
      member.fullName.toLowerCase().includes(searchTermLower) ||
      member.email.toLowerCase().includes(searchTermLower) ||
      member.phoneNumber.toLowerCase().includes(searchTermLower) ||
      member.identityCard.toLowerCase().includes(searchTermLower)
    );
  }, [members, searchTerm]);

  // Columns for the Members Table
  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Identity Card",
      dataIndex: "identityCard",
      key: "identityCard",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
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
            onClick={() => fetchMemberDetails(record.key)}
          />
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

  // Edit Member Handler
  const handleEdit = (record) => {
    form.resetFields();
    setEditingKey(record.key);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Update Member Handler
  const handleUpdateMember = async (values) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/members/${editingKey}/account`, {
        fullName: values.fullName,
        identityCard: values.identityCard,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address
      });

      message.success("Member updated successfully", 1.5);
      setIsModalVisible(false);
      setEditingKey(null);
      form.resetFields();
      fetchMembers();
    } catch (error) {
      message.error(`Failed to update member: ${error.response?.data || error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Delete Member Handler
  const handleDelete = (record) => {
    try {
      setMemberToDelete(record);
      setDeleteConfirmationVisible(true);
    } catch {
      message.error("Failed to show delete confirmation");
    }
  };

  // Confirm Delete Member
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await api.delete(`/admin/members/delete/${memberToDelete.key}`);

      message.success(response.data, 1.5);
      setDeleteConfirmationVisible(false);
      await Promise.resolve();
      fetchMembers();
    } catch (error) {
      message.error(
        error.response?.data || "Failed to delete member",
        1.5
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setDeleteConfirmationVisible(false);
  };

  return (
    <div className="members-container">
      <div className="members-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search member"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200, marginRight: 10 }}
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMembers}
        loading={loading}
        className="ant-table-member"
        locale={{ 
          emptyText: 'No members found' 
        }}
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

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        className="member-modal"
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateMember}
          className="member-form"
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: "Please input the member's full name!" },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="identityCard"
            label="Identity Card"
            rules={[
              { required: true, message: "Please input the member's identity card!" },
            ]}
          >
            <Input placeholder="Enter identity card number" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the member's email!" },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: "Please input the member's phone number!" },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              { required: true, message: "Please input the member's address!" },
            ]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="submit-btn"
              loading={loading}
            >
              Update Member
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Member Details Modal */}
      <Modal
        title="Member Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        className="member-details-modal"
        width={600}
        centered
      >
        {memberDetails && (
          <div className="member-details-content">
            <div className="member-detail-row">
              <div className="member-detail-label">Full Name</div>
              <div className="member-detail-value">{memberDetails.fullName}</div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Date of Birth</div>
              <div className="member-detail-value">{memberDetails.dateOfBirth}</div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Gender</div>
              <div className="member-detail-value">{memberDetails.gender}</div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Email</div>
              <div className="member-detail-value">{memberDetails.email}</div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Identity Card</div>
              <div className="member-detail-value">{memberDetails.identityCard}</div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Phone Number</div>
              <div className="member-detail-value">{memberDetails.phoneNumber}</div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Address</div>
              <div className="member-detail-value">{memberDetails.address}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
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
          <p>Are you sure you want to delete this member?</p>
          <p className="member-title">{memberToDelete?.fullName}</p>
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
              Delete Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Members;