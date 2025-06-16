import React, { useState, useEffect } from "react";
import { Input, Button, Form, Table, message, Upload, Select } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import "./Profile.scss";
import api from "../../constants/axios";

const historyData = [
  { key: 1, date: "16/06/2025", movie: "Lật mặt 8", tickets: 2, points: "+50" },
  { key: 2, date: "15/06/2025", movie: "Doraemon", tickets: 2, points: "+50" },
  {
    key: 3,
    date: "14/06/2025",
    movie: "Lilo & Stitch",
    tickets: 2,
    points: "+50",
  },
];

const Profile = () => {
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy token từ localStorage dạng object nếu cần
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || "";

  const columns = [
    { title: "Day", dataIndex: "date", key: "date", align: "center" },
    { title: "Movie", dataIndex: "movie", key: "movie", align: "center" },
    { title: "Tickets", dataIndex: "tickets", key: "tickets", align: "center" },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
      align: "center",
      render: (t) => <span style={{ color: "#ac2020" }}>{t}</span>,
    },
  ];

  // Fetch user info function
  const fetchUserInfo = async () => {
    try {
      const response = await api.get("/member/account", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = response.data;

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
        setPreviewAvatar(`data:image/jpeg;base64,${data.image}`);
      } else if (data.avatar) {
        setPreviewAvatar(data.avatar);
      } else {
        setPreviewAvatar(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      message.error("Cannot fetch user info. Please check API or login again.");
    }
  };

  // Fetch user info when component mounts
  useEffect(() => {
    fetchUserInfo();
  }, [token]);

  // Helper: Convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  const handleProfileSave = async (values) => {
    setLoading(true);
    try {
      let imageBase64 = undefined;
      if (avatarFile) {
        imageBase64 = await fileToBase64(avatarFile);
      } else if (previewAvatar && previewAvatar.startsWith("data:image")) {
        imageBase64 = previewAvatar.split(",")[1];
      }

      const payload = {
        ...values,
        ...(imageBase64 ? { image: imageBase64 } : {}),
      };

      Object.keys(payload).forEach((key) => {
        if (
          key !== "gender" &&
          (payload[key] === undefined ||
            payload[key] === null ||
            payload[key] === "")
        ) {
          delete payload[key];
        }
      });

      await api.put("/member/account", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      message.success("Profile updated successfully!");
      setAvatarFile(null);
      await fetchUserInfo();
    } catch (error) {
      console.error("Update profile error:", error?.response?.data || error);
      message.error(error?.response?.data?.message || "Update profile failed!");
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
    if (newPwd.length < 6) {
      message.error("New password must be at least 6 characters!");
      return;
    }
    if (newPwd !== confirmPwd) {
      message.error("Password confirmation does not match!");
      return;
    }
    try {
      await api.put(
        "/member/account",
        {
          currentPassword: currentPwd,
          newPassword: newPwd,
          confirmPassword: confirmPwd,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Password changed successfully!");
      pwdForm.resetFields();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Password change failed!"
      );
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
            <Form.Item label="Full Name" name="fullName">
              <Input />
            </Form.Item>
          </div>

          {/* Row 2 */}
          <div className="profile-info-row">
            <Form.Item label="Date Of Birth" name="dateOfBirth">
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </div>

          {/* Row 3 */}
          <div className="profile-info-row">
            <Form.Item label="Sex" name="gender">
              <Select
                style={{
                  width: "100%",
                  color: "#fff",
                }}
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Identity Card" name="identityCard">
              <Input />
            </Form.Item>
          </div>

          {/* Row 4 */}
          <div className="profile-info-row">
            <Form.Item label="Phone Number" name="phoneNumber">
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
                {
                  required: true,
                  message: "Please enter your current password!",
                },
              ]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newPwd"
              rules={[
                { required: true, message: "Please enter a new password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPwd"
              dependencies={["newPwd"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPwd") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Password confirmation does not match!")
                    );
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
          <span className="profile-point">2,450</span>
          <span className="profile-point-label">Member Level: Gold</span>
        </div>
        <Table
          columns={columns}
          dataSource={historyData}
          pagination={false}
          className="profile-history-table"
        />
        <div className="profile-history-footer">
          <Button className="profile-history-btn">See All History</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
