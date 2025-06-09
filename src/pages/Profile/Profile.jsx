import React, { useState, useEffect } from "react";
import { Input, Button, Form, Table, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Profile.scss";
import api from "../../constants/axios";

const userInfo = {
  username: "",
  fullName: "",
  dob: "",
  sex: "",
  email: "",
  card: "",
  phone: "",
  address: "",
};

const historyData = [
  { key: 1, date: "16/06/2025", movie: "Lật mặt 8", tickets: 2, points: "+50" },
  { key: 2, date: "15/06/2025", movie: "Doraemon", tickets: 2, points: "+50" },
  { key: 3, date: "14/06/2025", movie: "Lilo & Stitch", tickets: 2, points: "+50" },
];

const Profile = () => {
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const columns = [
    { title: "Day", dataIndex: "date", key: "date", align: "center" },
    { title: "Movie", dataIndex: "movie", key: "movie", align: "center" },
    { title: "Tickets", dataIndex: "tickets", key: "tickets", align: "center" },
    { title: "Points", dataIndex: "points", key: "points", align: "center", render: (t) => <span style={{ color: '#ac2020' }}>{t}</span> },
  ];

  const handleAvatarChange = () => {
    message.info("Tính năng cập nhật ảnh đại diện sẽ sớm có!");
  };

  const handleProfileSave = () => {
    message.success("Save changes successfully!");
  };

  const handlePwdChange = () => {
    message.success("Update password successfully!");
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        form.setFieldsValue({
          username: data.username,
          fullName: data.fullName,
          dob: data.dob,
          sex: data.sex,
          email: data.email,
          card: data.card,
          phone: data.phone,
          address: data.address,
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [userId, form, token]);

  return (
    <div className="profile-page">
      <h2 className="profile-title">Profile</h2>
      <div className="profile-section profile-info-section">
        <div className="profile-avatar-block">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" />
            ) : (
              <UserOutlined />
            )}
          </div>
          <Button className="profile-avatar-btn" onClick={handleAvatarChange}>
            Change Avatar
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          className="profile-info-form"
          initialValues={userInfo}
          onFinish={handleProfileSave}
        >
          <div className="profile-info-row">
            <Form.Item label="Username" name="username">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Full Name" name="fullName">
              <Input />
            </Form.Item>
          </div>
          <div className="profile-info-row">
            <Form.Item label="Date Of Birth" name="dob">
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </div>
          <div className="profile-info-row">
            <Form.Item label="Sex" name="sex">
              <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #222', background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Form.Item>
            <Form.Item label="Identity Card" name="card">
              <Input />
            </Form.Item>
          </div>
          <div className="profile-info-row">
            <Form.Item label="Phone Number" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </div>
          <Button htmlType="submit" className="profile-save-btn">
            Save Changes
          </Button>
        </Form>
      </div>

      <div className="profile-section profile-password-section">
        <h3 className="profile-password-title">Change Password</h3>
        <Form form={pwdForm} layout="vertical" className="profile-password-form" onFinish={handlePwdChange}>
          <div className="profile-info-row">
            <Form.Item
              label={<span className="profile-password-label-green">Current Password</span>}
              name="currentPwd"
            >
              <Input.Password placeholder="" />
            </Form.Item>
            <Form.Item label="New Password" name="newPwd">
              <Input.Password placeholder="" />
            </Form.Item>
            <Form.Item label="Confirm Password" name="confirmPwd">
              <Input.Password placeholder="" />
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
