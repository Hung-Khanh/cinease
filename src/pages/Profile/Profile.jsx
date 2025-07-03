import React, { useState, useEffect } from "react";
import { Input, Button, Form, Table, message, Upload, Tag, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import "./Profile.scss";
import { getUserInfo, getUserTickets, updateUserWithImage } from '../../api/user';

const Profile = () => {
  const [historyData, setHistoryData] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchHistoryAndPoints = async (page = 1, size = 10) => {
      setHistoryLoading(true);
      try {
        const ticketsRes = await getUserTickets({ page: page - 1, size });
        const ticketsData = ticketsRes.data;
        const mapped = (ticketsData.content || []).map((item, idx) => {
          const ticketCount = Array.isArray(item.products)
            ? item.products.filter(p => p.itemType === "TICKET").length
            : (item.seatNumbers ? item.seatNumbers.length : 0);
          return {
            key: item.invoiceId || idx,
            date: item.bookingDate ? new Date(item.bookingDate).toLocaleDateString("vi-VN") : "",
            movie: item.movieName,
            tickets: ticketCount,
            status: item.status || "",
            grandTotal: item.grandTotal || 0
          };
        });
        setHistoryData(mapped);
        setHistoryTotal(ticketsData.totalElements || 0);
        setHistoryPage(page);
        setHistoryPageSize(size);
      } catch {
        setHistoryData([]);
        setHistoryTotal(0);
      }
      setHistoryLoading(false);
    };
    fetchHistoryAndPoints(historyPage, historyPageSize);
  }, [historyPage, historyPageSize]);

  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/history');
  };

  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('descend');

  const sortOptions = [
    { key: "date", label: "Day" },
    { key: "movie", label: "Movie" },
    { key: "grandTotal", label: "Grand Total" },
  ];

  const handleMenuClick = (e) => {
    if (sortKey === e.key) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortKey(e.key);
      setSortOrder('descend');
    }
  };

  const sortMenu = (
    <Menu onClick={handleMenuClick}>
      {sortOptions.map(opt => (
        <Menu.Item key={opt.key}>{opt.label}</Menu.Item>
      ))}
    </Menu>
  );

  const columns = [
    { title: "Day", dataIndex: "date", key: "date", align: "center" },
    { title: "Movie", dataIndex: "movie", key: "movie", align: "center" },
    { title: "Tickets", dataIndex: "tickets", key: "tickets", align: "center" },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "center",
      render: v => v ? v.toLocaleString('vi-VN') + ' ₫' : ''
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const statusColors = {
          PENDING: "orange",
          CONFIRMED: "blue",
          PAID: "green",
          CANCELLED: "red",
          EXPIRED: "gray",
          AWAITING_PAYMENT: "yellow"
        };
        return (
          <Tag color={statusColors[status] || "default"} style={{ minWidth: 90, textAlign: "center" }}>
            {status}
          </Tag>
        );
      }
    },
  ];

  const sortedHistoryData = React.useMemo(() => {
    if (!sortKey) return historyData;
    let sorted = [...historyData];
    if (sortKey === "date") {
      sorted.sort((a, b) => {
        const d1 = new Date(a.date.split('/').reverse().join('-'));
        const d2 = new Date(b.date.split('/').reverse().join('-'));
        return sortOrder === "ascend" ? d1 - d2 : d2 - d1;
      });
    } else if (sortKey === "movie") {
      sorted.sort((a, b) => sortOrder === "ascend"
        ? a.movie.localeCompare(b.movie)
        : b.movie.localeCompare(a.movie)
      );
    } else if (sortKey === "grandTotal") {
      sorted.sort((a, b) => sortOrder === "ascend"
        ? a.grandTotal - b.grandTotal
        : b.grandTotal - a.grandTotal
      );
    }
    return sorted;
  }, [historyData, sortKey, sortOrder]);

  const fetchUserInfo = React.useCallback(async () => {
    try {
      const response = await getUserInfo();
      const data = response.data;
      console.log("API response:", data);

      form.setFieldsValue({
        username: data.username || "",
        fullName: data.fullName || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "OTHER",
        email: data.email || "",
        identityCard: data.identityCard || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
      });

      if (data.image) {
        if (data.image.startsWith('data:')) {
          setPreviewAvatar(data.image);
        } else if (data.image.startsWith('http')) {
          setPreviewAvatar(data.image);
        } else {
          const baseUrl = 'https://legally-actual-mollusk.ngrok-free.app';
          const imagePath = data.image.startsWith('/') ? data.image : `/${data.image}`;
          setPreviewAvatar(`${baseUrl}${imagePath}`);
        }
      } else if (data.avatar) {
        if (data.avatar.startsWith('http') || data.avatar.startsWith('data:')) {
          setPreviewAvatar(data.avatar);
        } else {
          const baseUrl = 'https://legally-actual-mollusk.ngrok-free.app';
          const imagePath = data.avatar.startsWith('/') ? data.avatar : `/${data.avatar}`;
          setPreviewAvatar(`${baseUrl}${imagePath}`);
        }
      } else {
        setPreviewAvatar(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      message.error("Cannot fetch user info. Please check API or login again.");
    }
  }, [form]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleProfileSave = async (values) => {
    setLoading(true);
    try {
      console.log('Starting profile update with values:', values);

      const formData = new FormData();

      const accountData = {
        fullName: values.fullName || null,
        address: values.address || null,
        dateOfBirth: values.dateOfBirth || null,
        gender: values.gender || "OTHER",
        identityCard: values.identityCard || null,
        email: values.email || null,
        phoneNumber: values.phoneNumber || null,
      };

      Object.keys(accountData).forEach(key => {
        if (key !== "gender" && (accountData[key] === null || accountData[key] === "" || accountData[key] === undefined)) {
          delete accountData[key];
        }
      });

      console.log("Account data being sent:", accountData);

      const accountBlob = new Blob([JSON.stringify(accountData)], {
        type: 'application/json'
      });
      formData.append('account', accountBlob);

      if (avatarFile) {
        console.log('Adding new avatar file:', avatarFile.name);
        formData.append('image', avatarFile);
      }

      const response = await updateUserWithImage(formData);

      console.log("Update successful, response:", response.data);
      message.success("Profile updated successfully!");

      setAvatarFile(null);

      await fetchUserInfo();

      try {
        const oldUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = {
          ...oldUser,
          ...response.data,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Failed to update user in localStorage after profile update:', e);
      }

    } catch (error) {
      console.error("Update profile error:", {
        error: error,
        responseData: error?.response?.data,
        responseStatus: error?.response?.status,
        responseHeaders: error?.response?.headers
      });

      let errorMessage = "Update profile failed. Please try again.";
      if (error?.response?.data?.code) {
        switch (error.response.data.code) {
          case 'EMAIL_EXISTS':
            errorMessage = "This email is already in use by another account.";
            break;
          case 'PHONE_EXISTS':
            errorMessage = "This phone number is already in use by another account.";
            break;
          case 'ACCOUNT_NOT_FOUND':
            errorMessage = "Account not found. Please login again.";
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePwdChange = async (values) => {
    const { currentPwd, newPwd, confirmPwd } = values;

    if (!currentPwd || !newPwd || !confirmPwd) {
      message.error("Please fill in all password fields!");
      return;
    }

    if (newPwd.length < 8) {
      message.error("New password must be at least 8 characters!");
      return;
    }

    if (newPwd !== confirmPwd) {
      message.error("Password confirmation does not match!");
      return;
    }

    try {
      const formData = new FormData();

      const currentValues = form.getFieldsValue();

      const accountData = {
        fullName: currentValues.fullName || null,
        address: currentValues.address || null,
        dateOfBirth: currentValues.dateOfBirth || null,
        gender: currentValues.gender || "OTHER",
        identityCard: currentValues.identityCard || null,
        email: currentValues.email || null,
        phoneNumber: currentValues.phoneNumber || null,
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmPassword: confirmPwd
      };

      Object.keys(accountData).forEach(key => {
        if (!['gender', 'currentPassword', 'newPassword', 'confirmPassword'].includes(key) &&
          (accountData[key] === null || accountData[key] === "" || accountData[key] === undefined)) {
          delete accountData[key];
        }
      });

      const accountBlob = new Blob([JSON.stringify(accountData)], {
        type: 'application/json'
      });
      formData.append('account', accountBlob);

      await updateUserWithImage(formData);

      message.success("Password changed successfully!");
      pwdForm.resetFields();

    } catch (error) {
      console.error("Password change error:", error);

      let errorMessage = "Password change failed!";
      if (error?.response?.data?.code) {
        switch (error.response.data.code) {
          case 'INVALID_CURRENT_PASSWORD':
            errorMessage = "Current password is incorrect.";
            break;
          case 'PASSWORD_MISMATCH':
            errorMessage = "New password and confirm password do not match.";
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }

      message.error(errorMessage);
    }
  };

  return (
    <div className="profile-page">
      <h2 className="profile-title">Profile</h2>

      <div className="profile-section profile-info-section">
        <div className="profile-avatar-block">
          <div className="profile-avatar">
            {previewAvatar ? (
              <img src={previewAvatar} alt="avatar" />
            ) : (
              <UserOutlined style={{ fontSize: 64, padding: 20 }} />
            )}
          </div>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              if (!file.type.startsWith('image/')) {
                message.error('Please select an image file');
                return false;
              }

              if (file.size > 5 * 1024 * 1024) {
                message.error('File size should be less than 5MB');
                return false;
              }

              setPreviewAvatar(URL.createObjectURL(file));
              setAvatarFile(file);
              return false;
            }}
            accept="image/*"
          >
            <Button icon={<CameraOutlined />} className="profile-avatar-btn">
              Choose Avatar
            </Button>
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="profile-info-form"
          onFinish={handleProfileSave}
        >
          <div className="profile-info-row">
            <Form.Item label="Username" name="username">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { min: 2, max: 100, message: "Full name must be between 2 and 100 characters" }
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="profile-info-row">
            <Form.Item label="Date Of Birth" name="dateOfBirth">
              <Input type="date" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="profile-info-row">
            <Form.Item label="Sex" name="gender">
              <select
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #222', background: 'rgba(255,255,255,0.08)', color: '#fff' }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Form.Item>
            <Form.Item label="Identity Card" name="identityCard">
              <Input />
            </Form.Item>
          </div>

          <div className="profile-info-row">
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { pattern: /^\d{10}$/, message: "Phone number must be 10 digits" }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </div>

          <Button
            htmlType="submit"
            className="profile-save-btn"
            loading={loading}
          >
            Save Changes
          </Button>
        </Form>
      </div>


      <div className="profile-section profile-password-section">
        <h3 className="profile-password-title">Change Password</h3>
        <Form
          form={pwdForm}
          layout="vertical"
          className="profile-password-form"
          onFinish={handlePwdChange}
        >
          <div className="profile-info-row">
            <Form.Item
              label="Current Password"
              name="currentPwd"
              rules={[
                { required: true, message: "Please enter your current password!" },
                { min: 8, max: 50, message: "Password must be between 8 and 50 characters" }
              ]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newPwd"
              rules={[
                { required: true, message: "Please enter a new password!" },
                { min: 8, max: 50, message: "Password must be between 8 and 50 characters" }
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPwd"
              dependencies={["newPwd"]}
              rules={[
                { required: true, message: "Please confirm your new password!" },
                { min: 8, max: 50, message: "Password must be between 8 and 50 characters" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPwd") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Password confirmation does not match!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
          </div>
          <Button htmlType="submit" className="profile-save-btn">
            Update Password
          </Button>
        </Form>
      </div>

      <div className="profile-section profile-history-section">
        <div className="profile-history-header">
          <span className="profile-history-title">Recent Transactions</span>
          <Dropdown overlay={sortMenu} trigger={['click']}>
            <Button className="sort-btn" style={{ marginLeft: 12 }}>
              Sort <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <Table
          columns={columns}
          dataSource={sortedHistoryData}
          loading={historyLoading}
          pagination={{
            current: historyPage,
            pageSize: historyPageSize,
            total: historyTotal,
            showSizeChanger: false,
            onChange: (page, pageSize) => {
              setHistoryPage(page);
              setHistoryPageSize(pageSize);
            }
          }}
          className="profile-history-table"
          rowKey="key"
        />
        <div className="profile-history-footer">
          <Button className="profile-history-btn" onClick={handleViewHistory}>See All History</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;