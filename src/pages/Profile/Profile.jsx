import React, { useState, useEffect } from "react";
import { Input, Button, Form, Table, message, Upload, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import "./Profile.scss";
import api from "../../constants/axios";

const Profile = () => {
  // ...other states
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchHistoryAndPoints = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = user.token || "";
        // Gọi song song 2 API
        const ticketsRes = await api.get("/member/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        const ticketsData = ticketsRes.data;
        // Map API data to table format (lấy từ ticketsData.content)
        const mapped = (ticketsData.content || []).map((item, idx) => {
          // Đếm số vé
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
      } catch (err) {
        console.error(err);
        setHistoryData([]);
      }
    };
    fetchHistoryAndPoints();
  }, []);

  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/history');
  };

  // Lấy token từ localStorage dạng object nếu cần
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || "";

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

  // Fetch user info function
  const fetchUserInfo = React.useCallback(async () => {
    try {
      const response = await api.get("/member/account", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = response.data;
      console.log("API response:", data);

      // Map API data to form fields
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

      // Set previewAvatar from server data if available
      if (data.image) {
        // If image is base64 string, add data prefix
        if (data.image.startsWith('data:')) {
          setPreviewAvatar(data.image);
        } else if (data.image.startsWith('http')) {
          // If it's already a full URL, use as is
          setPreviewAvatar(data.image);
        } else {
          // For relative paths, prepend the base URL
          const baseUrl = 'https://legally-actual-mollusk.ngrok-free.app';
          const imagePath = data.image.startsWith('/') ? data.image : `/${data.image}`;
          setPreviewAvatar(`${baseUrl}${imagePath}`);
        }
      } else if (data.avatar) {
        if (data.avatar.startsWith('http') || data.avatar.startsWith('data:')) {
          setPreviewAvatar(data.avatar);
        } else {
          // For relative paths in avatar field
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
  }, [form, token]);

  // Fetch user info when component mounts
  useEffect(() => {
    fetchUserInfo();
  }, [token, fetchUserInfo]);

  // Updated profile save function to use the new update-with-image API
  const handleProfileSave = async (values) => {
    setLoading(true);
    try {
      console.log('Starting profile update with values:', values);

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // 1. Prepare account data (matching UpdateAccountRequest structure)
      const accountData = {
        fullName: values.fullName || null,
        address: values.address || null,
        dateOfBirth: values.dateOfBirth || null,
        gender: values.gender || "OTHER",
        identityCard: values.identityCard || null,
        email: values.email || null,
        phoneNumber: values.phoneNumber || null,
        // Don't include password fields in basic update
      };

      // Remove null/empty values (except gender)
      Object.keys(accountData).forEach(key => {
        if (key !== "gender" && (accountData[key] === null || accountData[key] === "" || accountData[key] === undefined)) {
          delete accountData[key];
        }
      });

      console.log("Account data being sent:", accountData);

      // 2. Add account data as JSON blob
      const accountBlob = new Blob([JSON.stringify(accountData)], {
        type: 'application/json'
      });
      formData.append('account', accountBlob);

      // 3. Add image file if user selected a new one
      if (avatarFile) {
        console.log('Adding new avatar file:', avatarFile.name);
        formData.append('image', avatarFile);
      }

      // 4. Make API call to the new endpoint
      const response = await api.put("/member/update-with-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          "ngrok-skip-browser-warning": "true"
        }
      });

      console.log("Update successful, response:", response.data);
      message.success("Profile updated successfully!");

      // Clear the avatar file after successful update
      setAvatarFile(null);

      // Refresh user info
      await fetchUserInfo();

      // Update user in localStorage so Header can reflect new avatar immediately
      try {
        const oldUser = JSON.parse(localStorage.getItem('user')) || {};
        // Merge old user with new data (ưu tiên image/avatar mới từ response)
        const updatedUser = {
          ...oldUser,
          ...response.data,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Dispatch storage event to update Header immediately (same tab)
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

      // Handle specific error codes from backend
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

  // Updated password change function to use the new API
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
      // Create FormData for password change
      const formData = new FormData();

      // Get current form values for other fields
      const currentValues = form.getFieldsValue();

      // Create account data with password fields
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

      // Remove null/empty values (except password fields and gender)
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

      await api.put("/member/update-with-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          "ngrok-skip-browser-warning": "true"
        }
      });

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

      {/* Section avatar */}
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
              // Validate file type
              if (!file.type.startsWith('image/')) {
                message.error('Please select an image file');
                return false;
              }

              // Validate file size (max 5MB)
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

        {/* Form info */}
        <Form
          form={form}
          layout="vertical"
          className="profile-info-form"
          onFinish={handleProfileSave}
        >
          {/* Row 1 */}
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

          {/* Row 2 */}
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

          {/* Row 3 */}
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

          {/* Row 4 */}
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

      {/* Change password section */}
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

      {/* Transaction history */}
      <div className="profile-section profile-history-section">
        <div className="profile-history-header">
          <span className="profile-history-title">Recent Transactions</span>
          {/* Optionally, you can show total points or member level here as before */}
        </div>
        <Table
          columns={columns}
          dataSource={historyData}
          pagination={{ pageSize: 5 }}
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