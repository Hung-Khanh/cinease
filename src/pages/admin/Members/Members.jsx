import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Switch, Table } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../constants/axios";
import "./Members.scss";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [form] = Form.useForm();

  // Fetch Members List
  const fetchMembers = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await api.get("/admin/members");

      // Handle response with content array
      const membersData = response.data.content || response.data;

      // Ensure each member has a unique key and all required properties
      const formattedMembers = membersData.map((member) => ({
        key: member.memberId
          ? member.memberId.toString()
          : Math.random().toString(),
        fullName: member.fullName || "N/A",
        identityCard: member.identityCard || "N/A",
        email: member.email || "N/A",
        phoneNumber: member.phoneNumber || "N/A",
        address: member.address || "N/A",
        point: member.point !== undefined ? member.point : 0,
        membershipLevel: member.membershipLevel || "N/A",
        username: member.username || "N/A",
        status: member.status === "ACTIVE" || member.status === true, // Chuyển status string sang boolean
      }));

      setMembers(formattedMembers);

      if (showSuccessMessage) {
        toast.success("Members list fetched successfully", {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } catch (error) {
      toast.error(`Failed to fetch members: ${error.message}`, {
        position: "top-right",
        autoClose: 1500,
      });
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

      setMemberDetails({
        fullName: response.data.fullName || "N/A",
        dateOfBirth: response.data.dateOfBirth || "N/A",
        gender: response.data.gender || "N/A",
        email: response.data.email || "N/A",
        identityCard: response.data.identityCard || "N/A",
        phoneNumber: response.data.phoneNumber || "N/A",
        address: response.data.address || "N/A",
        username: response.data.username || "N/A",
      });

      setIsDetailModalVisible(true);
    } catch (error) {
      toast.error(`Failed to fetch member details: ${error.message}`, {
        position: "top-right",
        autoClose: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Member Status
  const handleStatusToggle = async (memberId, checked) => {
    try {
      if (checked) {
        // Kích hoạt
        await api.put(`/admin/members/${memberId}/activate`);
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.key === memberId ? { ...member, status: true } : member
          )
        );
        toast.success("Member activated successfully", {
          position: "top-right",
          autoClose: 1500,
        });
      } else {
        // Hủy kích hoạt
        await api.delete(`/admin/members/${memberId}/deactivate`);
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.key === memberId ? { ...member, status: false } : member
          )
        );
        toast.success("Member deactivated successfully", {
          position: "top-right",
          autoClose: 1500,
        });
      }
    } catch (error) {
      toast.error(
        `Failed to update member status: ${
          error.response?.data || error.message
        }`,
        {
          position: "top-right",
          autoClose: 1500,
        }
      );
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
    return members.filter(
      (member) =>
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
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div className="status-column">
          <Switch
            checked={status}
            onChange={(checked) => handleStatusToggle(record.key, checked)}
            size="small"
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            className="status-switch"
          />
        </div>
      ),
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

  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-member ${type}-btn`}>
      {text}
    </Button>
  );
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
        address: values.address,
        status: values.status,
      });

      toast.success("Member updated successfully", {
        position: "top-right",
        autoClose: 1500,
      });
      setIsModalVisible(false);
      setEditingKey(null);
      form.resetFields();
      fetchMembers();
    } catch (error) {
      toast.error(
        `Failed to update member: ${error.response?.data || error.message}`,
        {
          position: "top-right",
          autoClose: 1500,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete Member Handler
  const handleDelete = (record) => {
    try {
      if (!record || !record.key) {
        toast.error("Dữ liệu thành viên không hợp lệ!");
        return;
      }

      setMemberToDelete(record);
      setDeleteConfirmationVisible(true);
    } catch (error) {
      console.error("Error showing delete confirmation:", error);
      toast.error("Không thể hiển thị hộp thoại xác nhận xóa!");
    }
  };

  // Confirm Delete Member
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await api.delete(
        `/admin/members/${memberToDelete.key}/permanent`
      );

      // Hiển thị toast thành công
      toast.success(response.data || "Xóa thành viên thành công!", {
        position: "top-right",
        autoClose: 1500,
      });
      setDeleteConfirmationVisible(false);
      await fetchMembers(); // Không cần Promise.resolve()
    } catch (error) {
      console.error("Delete member error:", error); // Log lỗi để debug
      setDeleteConfirmationVisible(false);

      // Xử lý các loại lỗi khác nhau và hiển thị toast tương ứng
      if (error.response?.status === 403) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 2000,
        });
      } else if (error.response?.data?.code === 1108) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 2000,
        });
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 2000,
        });
      } else if (error.response?.status >= 500) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 2000,
        });
      } else if (!navigator.onLine) {
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 2000,
        });
      } 
      await fetchMembers();
    } finally {
      setLoading(false);
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setDeleteConfirmationVisible(false);
    setMemberToDelete(null); // Clear member data khi cancel
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
          emptyText: "No members found",
        }}
        pagination={{
          pageSize: 6,
          showSizeChanger: false,
          className: "pagination-btn-member",
          itemRender: (current, type, originalElement) => {
            if (type === "prev")
              return createPaginationButton("prev", "Previous");
            if (type === "next") return createPaginationButton("next", "Next");
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
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
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
              {
                required: true,
                message: "Please input the member's full name!",
              },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="identityCard"
            label="Identity Card"
            rules={[
              {
                required: true,
                message: "Please input the member's identity card!",
              },
            ]}
          >
            <Input placeholder="Enter identity card number" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the member's email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              {
                required: true,
                message: "Please input the member's phone number!",
              },
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
              <div className="member-detail-label">Username</div>
              <div className="member-detail-value">
                {memberDetails.username}
              </div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Full Name</div>
              <div className="member-detail-value">
                {memberDetails.fullName}
              </div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Date of Birth</div>
              <div className="member-detail-value">
                {memberDetails.dateOfBirth}
              </div>
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
              <div className="member-detail-value">
                {memberDetails.identityCard}
              </div>
            </div>
            <div className="member-detail-row">
              <div className="member-detail-label">Phone Number</div>
              <div className="member-detail-value">
                {memberDetails.phoneNumber}
              </div>
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
      <ToastContainer />
    </div>
  );
};

export default Members;
