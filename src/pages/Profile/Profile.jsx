import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Form,
  Table,
  Upload,
  Tag,
  Dropdown,
  Menu,
  Tabs,
  Badge,
  Modal,
  Space,
  Typography,
  Rate,
} from "antd";
import { DownOutlined, StarOutlined, CommentOutlined, UserOutlined, CameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Profile.scss";
import {
  getUserInfo,
  getUserTickets,
  updateUserWithImage,
} from "../../api/user";
import { getCurrentUserFeedbacks, submitFeedbackForInvoice, getCurrentUserFeedbackForInvoice } from "../../api/feedback";
import { FeedbackModal } from "../Feedback/FeedbackModal.jsx";
import Feedback from "../Feedback/Feedback";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { TabPane } = Tabs;
const { Text } = Typography;

const Profile = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [eligibleFeedbackCount, setEligibleFeedbackCount] = useState(0);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [modalVisible, setModalVisible] = useState(false);
  const [viewFeedbackModalVisible, setViewFeedbackModalVisible] = useState(false);
  const [viewFeedbackLoading, setViewFeedbackLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const navigate = useNavigate();

  // Function to fetch feedback for a specific invoice
  const fetchFeedbackForInvoice = async (invoiceId) => {
    setViewFeedbackLoading(true);
    try {
      const response = await getCurrentUserFeedbackForInvoice(invoiceId);
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch feedback. Please try again.");
      return null;
    } finally {
      setViewFeedbackLoading(false);
    }
  };

  useEffect(() => {
    const fetchHistoryAndPoints = async (page = 1, size = 10) => {
      setHistoryLoading(true);
      try {
        const ticketsRes = await getUserTickets({ page: page - 1, size });
        const ticketsData = ticketsRes.data;
        const mapped = (ticketsData.content || []).map((item, idx) => {
          const ticketCount = Array.isArray(item.products)
            ? item.products.filter((p) => p.itemType === "TICKET").length
            : item.seatNumbers
              ? item.seatNumbers.length
              : 0;
          return {
            key: item.invoiceId || idx,
            date: item.bookingDate
              ? new Date(item.bookingDate).toLocaleDateString("vi-VN")
              : "",
            movie: item.movieName,
            tickets: ticketCount,
            status: item.status || "",
            grandTotal: item.grandTotal || 0,
            invoiceId: item.invoiceId,
            movieName: item.movieName,
            bookingDate: item.bookingDate,
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

    const fetchEligibleFeedbackCount = async () => {
      try {
        const response = await getCurrentUserFeedbacks();
        setUserFeedbacks(response.data || []);
        setEligibleFeedbackCount(
          response.data?.filter((f) => !f.feedbackId).length || 0
        );
      } catch (error) {
        console.error("Error fetching feedback count:", error);
        setEligibleFeedbackCount(0);
        setUserFeedbacks([]);
      }
    };

    fetchHistoryAndPoints(historyPage, historyPageSize);
    fetchEligibleFeedbackCount();
  }, [historyPage, historyPageSize]);

  const handleViewHistory = () => {
    navigate("/history");
  };

  const handleAddFeedback = (invoice) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };

  const handleViewFeedback = async (invoice) => {
    const feedback = await fetchFeedbackForInvoice(invoice.invoiceId);
    if (feedback) {
      setSelectedFeedback(feedback);
      setViewFeedbackModalVisible(true);
    }
  };

  const handleSubmitFeedback = async (values) => {
    try {
      await submitFeedbackForInvoice(selectedInvoice.invoiceId, {
        rating: values.rating,
        comment: values.comment,
      });
      toast.success("Feedback added successfully!");
      setModalVisible(false);
      setSelectedInvoice(null);
      const response = await getCurrentUserFeedbacks();
      setUserFeedbacks(response.data || []);
      setEligibleFeedbackCount(
        response.data?.filter((f) => !f.feedbackId).length || 0
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("descend");

  const sortOptions = [
    { key: "date", label: "Day" },
    { key: "movie", label: "Movie" },
    { key: "grandTotal", label: "Grand Total" },
  ];

  const sortMenuItems = sortOptions.map((opt) => ({
    key: opt.key,
    label: opt.label,
  }));

  const handleMenuClick = (e) => {
    if (sortKey === e.key) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortKey(e.key);
      setSortOrder("descend");
    }
  };

  function useWindowWidth() {
    const [width, setWidth] = React.useState(window.innerWidth);
    React.useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
  }

  const windowWidth = useWindowWidth();

  const columns = React.useMemo(() => {
    const baseColumns = [
      { title: "Day", dataIndex: "date", key: "date", align: "center" },
      { title: "Movie", dataIndex: "movie", key: "movie", align: "center" },
      {
        title: "Grand Total",
        dataIndex: "grandTotal",
        key: "grandTotal",
        align: "center",
        render: (v) => (v ? v.toLocaleString("vi-VN") + " ₫" : ""),
      },
    ];

    if (windowWidth > 576) {
      baseColumns.splice(2, 0, {
        title: "Tickets",
        dataIndex: "tickets",
        key: "tickets",
        align: "center",
      });
      baseColumns.push({
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
            AWAITING_PAYMENT: "yellow",
          };
          return (
            <Tag
              color={statusColors[status] || "default"}
              style={{ minWidth: 90, textAlign: "center" }}
            >
              {status}
            </Tag>
          );
        },
      });
      baseColumns.push({
        title: "Feedback",
        dataIndex: "feedback",
        key: "feedback",
        align: "center",
        render: (_, record) => {
          if (record.status !== "PAID") {
            return null;
          }
          const existingFeedback = userFeedbacks.find(
            (f) => f.invoiceId === record.invoiceId && f.feedbackId
          );
          if (existingFeedback) {
            return (
              <Button
                type="default"
                icon={<CommentOutlined />}
                onClick={() => handleViewFeedback(record)}
                style={{
                  color: '#ffd700', // Text color
                  background: 'rgba(255, 215, 0, 0.15)', // Background color
                  border: 'none', // Remove border for better aesthetics
                }}
              >
                View Feedback
              </Button>
            );
          }
          return (
            <Button
              type="primary"
              icon={<StarOutlined />}
              onClick={() => handleAddFeedback(record)}
              style={{
                color: '#10b981', // Text color for contrast
                background: 'rgba(16, 185, 129, 0.15)', // Muted green background
                border: 'none', // Remove border for better aesthetics
              }}
            >
              Add Feedback
            </Button>
          );
        },
      });
    }

    return baseColumns;
  }, [windowWidth, userFeedbacks]);

  const sortedHistoryData = React.useMemo(() => {
    if (!sortKey) return historyData;
    let sorted = [...historyData];
    if (sortKey === "date") {
      sorted.sort((a, b) => {
        const d1 = new Date(a.date.split("/").reverse().join("-"));
        const d2 = new Date(b.date.split("/").reverse().join("-"));
        return sortOrder === "ascend" ? d1 - d2 : d2 - d1;
      });
    } else if (sortKey === "movie") {
      sorted.sort((a, b) =>
        sortOrder === "ascend"
          ? a.movie.localeCompare(b.movie)
          : b.movie.localeCompare(a.movie)
      );
    } else if (sortKey === "grandTotal") {
      sorted.sort((a, b) =>
        sortOrder === "ascend"
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
        if (data.image.startsWith("data:") || data.image.startsWith("http")) {
          setPreviewAvatar(data.image);
        } else {
          const baseUrl = "https://legally-actual-mollusk.ngrok-free.app";
          const imagePath = data.image.startsWith("/") ? data.image : `/${data.image}`;
          setPreviewAvatar(`${baseUrl}${imagePath}`);
        }
      } else if (data.avatar) {
        if (data.avatar.startsWith("http") || data.avatar.startsWith("data:")) {
          setPreviewAvatar(data.avatar);
        } else {
          const baseUrl = "https://legally-actual-mollusk.ngrok-free.app";
          const imagePath = data.avatar.startsWith("/") ? data.avatar : `/${data.avatar}`;
          setPreviewAvatar(`${baseUrl}${imagePath}`);
        }
      } else {
        setPreviewAvatar(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast.error("Cannot fetch user info. Please check API or login again.");
    }
  }, [form]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleProfileSave = async (values) => {
    setLoading(true);
    try {
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

      Object.keys(accountData).forEach((key) => {
        if (
          key !== "gender" &&
          (accountData[key] === null ||
            accountData[key] === "" ||
            accountData[key] === undefined)
        ) {
          delete accountData[key];
        }
      });

      const accountBlob = new Blob([JSON.stringify(accountData)], {
        type: "application/json",
      });
      formData.append("account", accountBlob);

      if (avatarFile) {
        formData.append("image", avatarFile);
      }

      const response = await updateUserWithImage(formData);
      toast.success("Profile updated successfully!");
      setAvatarFile(null);
      await fetchUserInfo();

      try {
        const oldUser = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = {
          ...oldUser,
          ...response.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("Failed to update user in localStorage:", e);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      let errorMessage = "Update profile failed. Please try again.";
      if (error?.response?.data?.code) {
        switch (error.response.data.code) {
          case "EMAIL_EXISTS":
            errorMessage = "This email is already in use by another account.";
            break;
          case "PHONE_EXISTS":
            errorMessage = "This phone number is already in use by another account.";
            break;
          case "ACCOUNT_NOT_FOUND":
            errorMessage = "Account not found. Please login again.";
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePwdChange = async (values) => {
    const { currentPwd, newPwd, confirmPwd } = values;

    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error("Please fill in all password fields!");
      return;
    }

    if (newPwd.length < 8) {
      toast.error("New password must be at least 8 characters!");
      return;
    }

    if (newPwd !== confirmPwd) {
      toast.error("Password confirmation does not match!");
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
        confirmPassword: confirmPwd,
      };

      Object.keys(accountData).forEach((key) => {
        if (
          !["gender", "currentPassword", "newPassword", "confirmPassword"].includes(key) &&
          (accountData[key] === null || accountData[key] === "" || accountData[key] === undefined)
        ) {
          delete accountData[key];
        }
      });

      const accountBlob = new Blob([JSON.stringify(accountData)], {
        type: "application/json",
      });
      formData.append("account", accountBlob);

      await updateUserWithImage(formData);
      toast.success("Password changed successfully!");
      pwdForm.resetFields();
    } catch (error) {
      console.error("Password change error:", error);
      let errorMessage = "Password change failed!";
      if (error?.response?.data?.code) {
        switch (error.response.data.code) {
          case "INVALID_CURRENT_PASSWORD":
            errorMessage = "Current password is incorrect.";
            break;
          case "PASSWORD_MISMATCH":
            errorMessage = "New password and confirm password do not match.";
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="profile-page">
      <ToastContainer />
      <h2 className="profile-title">Profile</h2>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="profile-tabs"
      >
        <TabPane
          tab={
            <span>
              <UserOutlined /> Profile
            </span>
          }
          key="profile"
        >
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
                  if (!file.type.startsWith("image/")) {
                    toast.error("Please select an image file");
                    return false;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("File size should be less than 5MB");
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
                    {
                      min: 2,
                      max: 100,
                      message: "Full name must be between 2 and 100 characters",
                    },
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
                  rules={[{ type: "email", message: "Invalid email format" }]}
                >
                  <Input />
                </Form.Item>
              </div>

              <div className="profile-info-row">
                <Form.Item label="Sex" name="gender">
                  <select
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #222",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                    }}
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
                    {
                      pattern: /^\d{10}$/,
                      message: "Phone number must be 10 digits",
                    },
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
                    {
                      required: true,
                      message: "Please enter your current password!",
                    },
                    {
                      min: 8,
                      max: 50,
                      message: "Password must be between 8 and 50 characters",
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
                    {
                      min: 8,
                      max: 50,
                      message: "Password must be between 8 and 50 characters",
                    },
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
                    {
                      min: 8,
                      max: 50,
                      message: "Password must be between 8 and 50 characters",
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
        </TabPane>

        <TabPane
          tab={
            <span>
              <StarOutlined /> Feedback{" "}
              {eligibleFeedbackCount > 0 && (
                <Badge count={eligibleFeedbackCount} offset={[10, 0]} />
              )}
            </span>
          }
          key="feedback"
        >
          <Feedback />
        </TabPane>

        <TabPane
          tab={
            <span>
              <CommentOutlined /> Transactions
            </span>
          }
          key="history"
        >
          <div className="profile-section profile-history-section">
            <div className="profile-history-header">
              <span className="profile-history-title">Recent Transactions</span>
              <Dropdown
                menu={{ items: sortMenuItems, onClick: handleMenuClick }}
                trigger={["click"]}
              >
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
                },
              }}
              className="profile-history-table"
              rowKey="key"
              onRow={(record) => ({
                onClick: () => {
                  setSelectedTransaction(record);
                  setTransactionModalVisible(true);
                },
              })}
            />
            <Modal
              title={<span>Transaction Details</span>}
              open={transactionModalVisible}
              onCancel={() => setTransactionModalVisible(false)}
              footer={[
                <Button key="close" onClick={() => setTransactionModalVisible(false)}>
                  Close
                </Button>,
              ]}
              width={windowWidth < 500 ? '90vw' : windowWidth < 768 ? 350 : 500}
              bodyStyle={{ padding: windowWidth < 500 ? '8px' : '16px' }}
            >
              {selectedTransaction && (
                <div style={{ padding: '16px' }}>
                  <div style={{ marginBottom: 12 }}><strong>Day:</strong> {selectedTransaction.date}</div>
                  <div style={{ marginBottom: 12 }}><strong>Movie:</strong> {selectedTransaction.movie}</div>
                  <div style={{ marginBottom: 12 }}><strong>Grand Total:</strong> {selectedTransaction.grandTotal ? selectedTransaction.grandTotal.toLocaleString('vi-VN') + ' ₫' : ''}</div>
                  <div style={{ marginBottom: 12 }}><strong>Tickets:</strong> {selectedTransaction.tickets}</div>
                  <div style={{ marginBottom: 12 }}><strong>Status:</strong> <Tag>{selectedTransaction.status}</Tag></div>
                  <div style={{ marginBottom: 12 }}><strong>Feedback:</strong> {
                    (() => {
                      if (selectedTransaction.status !== 'PAID') {
                        return <span>Not eligible</span>;
                      }
                      const feedback = userFeedbacks.find(f => f.invoiceId === selectedTransaction.invoiceId && f.feedbackId);
                      if (feedback) {
                        return (
                          <span>
                            <Rate disabled value={feedback.rating} allowHalf />
                            <span style={{ marginLeft: 8 }}>({feedback.rating}/5)</span>
                            <div style={{ marginTop: 4 }}>{feedback.comment}</div>
                            <Button
                              type="default"
                              icon={<CommentOutlined />}
                              style={{ marginTop: 8, color: '#ffd700', background: 'rgba(255, 215, 0, 0.15)', border: 'none' }}
                              onClick={() => {
                                setSelectedFeedback(feedback);
                                setViewFeedbackModalVisible(true);
                              }}
                            >
                              View Feedback
                            </Button>
                          </span>
                        );
                      } else {
                        return (
                          <Button
                            type="primary"
                            icon={<StarOutlined />}
                            style={{ marginTop: 8, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', border: 'none' }}
                            onClick={() => {
                              setSelectedInvoice(selectedTransaction);
                              setModalVisible(true);
                            }}
                          >
                            Add Feedback
                          </Button>
                        );
                      }
                    })()
                  }</div>
                </div>
              )}
            </Modal>
            <div className="profile-history-footer">
              <Button className="profile-history-btn" onClick={handleViewHistory}>
                See All History
              </Button>
            </div>
            <FeedbackModal
              visible={modalVisible}
              onCancel={() => {
                setModalVisible(false);
                setSelectedInvoice(null);
              }}
              onSubmit={handleSubmitFeedback}
              invoice={selectedInvoice}
            />
            <Modal
              title={
                <Space style={{ flexWrap: 'wrap', rowGap: 4 }}>
                  <CommentOutlined />
                  <span style={{ fontSize: windowWidth < 500 ? 16 : 20 }}>View Feedback</span>
                  {selectedFeedback && (
                    <Text type="secondary" style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff' }}>
                      for "{selectedFeedback.movieName}"
                    </Text>
                  )}
                </Space>
              }
              open={viewFeedbackModalVisible}
              onCancel={() => setViewFeedbackModalVisible(false)}
              footer={[
                <Button key="close" onClick={() => setViewFeedbackModalVisible(false)} style={{ width: windowWidth < 500 ? '100%' : undefined }}>
                  Close
                </Button>,
              ]}
              width={windowWidth < 500 ? '95vw' : windowWidth < 768 ? 350 : 600}
              bodyStyle={{ padding: windowWidth < 500 ? '12px' : '20px' }}
              className="feedback-modal"
              confirmLoading={viewFeedbackLoading}
            >
              {selectedFeedback && (
                <div className="feedback-details" style={{
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: windowWidth < 500 ? 10 : 16,
                  fontSize: windowWidth < 500 ? 13 : 16,
                  wordBreak: 'break-word',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: windowWidth < 500 ? 13 : 16, color: '#fffcfcff', minWidth: 70 }}>Rating:</Text>
                    <Rate disabled value={selectedFeedback.rating} allowHalf style={{ fontSize: windowWidth < 500 ? 18 : 22 }} />
                    <Text style={{ fontSize: windowWidth < 500 ? 13 : 16, color: '#fffcfcff' }}>({selectedFeedback.rating}/5)</Text>
                  </div>
                  <div style={{ marginTop: windowWidth < 500 ? 2 : 4 }}>
                    <Text strong style={{ fontSize: windowWidth < 500 ? 13 : 16, color: '#fffcfcff', minWidth: 70 }}>Comment:</Text>
                    <div style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff', marginTop: 2, whiteSpace: 'pre-line' }}>{selectedFeedback.comment}</div>
                  </div>
                  <div style={{ marginTop: windowWidth < 500 ? 2 : 4 }}>
                    <Text strong style={{ fontSize: windowWidth < 500 ? 13 : 16, color: '#fffcfcff', minWidth: 70 }}>Seats:</Text>
                    <Text style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff', marginLeft: 4 }}>{selectedFeedback.seat}</Text>
                  </div>
                  <div style={{ marginTop: windowWidth < 500 ? 2 : 4 }}>
                    <Text strong style={{ fontSize: windowWidth < 500 ? 13 : 16, color: '#fffcfcff', minWidth: 70 }}>Show Time:</Text>
                    <Text style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff', marginLeft: 4 }}>
                      {new Date(selectedFeedback.scheduleShowTime).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                  <div style={{ marginTop: windowWidth < 500 ? 2 : 4 }}>
                    <Text strong style={{ fontSize: windowWidth < 500 ? 13 : 16, color: '#fffcfcff', minWidth: 70 }}>Created:</Text>
                    <Text style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff', marginLeft: 4 }}>
                      {new Date(selectedFeedback.createdDate).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                  {selectedFeedback.updatedDate &&
                    selectedFeedback.updatedDate !== selectedFeedback.createdDate && (
                      <div style={{ marginTop: windowWidth < 500 ? 2 : 4 }}>
                        <Text strong style={{ fontSize: windowWidth < 500 ? 13 : 16, minWidth: 70 }}>Updated:</Text>
                        <Text style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff', marginLeft: 4 }}>
                          {new Date(selectedFeedback.updatedDate).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </div>
                    )}
                </div>
              )}
            </Modal>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;