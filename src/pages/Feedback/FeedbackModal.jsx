import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Rate, message, Card, Typography, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, StarOutlined, CommentOutlined, CalendarOutlined, VideoCameraOutlined } from "@ant-design/icons";
import "./FeedbackModal.scss"; // Assuming you have a CSS file for styles
const { Text, Title } = Typography;
const { TextArea } = Input;

export const FeedbackModal = ({
  visible,
  onCancel,
  onSubmit,
  initialValues = null,
  isEdit = false,
  invoice = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space style={{ flexWrap: 'wrap', rowGap: 4 }}>
          <StarOutlined />
          <span style={{ fontSize: windowWidth < 500 ? 16 : 20 }}>{isEdit ? "Edit Feedback" : "Add Feedback"}</span>
          {invoice && (
            <Text type="secondary" style={{ fontSize: windowWidth < 500 ? 12 : 14, color: '#fffcfcff' }}>
              for "{invoice.movieName}"
            </Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={windowWidth < 500 ? '95vw' : windowWidth < 768 ? 350 : 600}
      bodyStyle={{ padding: windowWidth < 500 ? '12px' : '20px' }}
      className="feedback-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ rating: 5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: windowWidth < 500 ? 14 : 20,
          fontSize: windowWidth < 500 ? 13 : 16,
        }}
      >
        <Form.Item
          name="rating"
          label={<span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: windowWidth < 500 ? 13 : 16 }}>* Rating</span>}
          rules={[
            { required: true, message: "Please provide a rating!" },
            { type: "number", min: 1, max: 5, message: "Rating must be between 1 and 5" },
          ]}
          style={{ marginBottom: windowWidth < 500 ? 10 : 16 }}
        >
          <Rate allowHalf style={{ fontSize: windowWidth < 500 ? 28 : 32 }} />
        </Form.Item>

        <Form.Item
          name="comment"
          label={<span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: windowWidth < 500 ? 13 : 16 }}>* Comment</span>}
          rules={[
            { required: true, message: "Please provide a comment!" },
            { max: 500, message: "Comment cannot exceed 500 characters" },
          ]}
          style={{ marginBottom: windowWidth < 500 ? 10 : 16 }}
        >
          <TextArea
            rows={windowWidth < 500 ? 3 : 4}
            placeholder="Share your thoughts about this movie..."
            showCount
            maxLength={500}
            style={{ fontSize: windowWidth < 500 ? 13 : 15, background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item className="feedback-modal-actions" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 12, flexDirection: windowWidth < 500 ? 'column' : 'row', marginTop: windowWidth < 500 ? 8 : 16 }}>
            <Button onClick={onCancel} style={{ width: windowWidth < 500 ? '100%' : 120, fontSize: windowWidth < 500 ? 14 : 16 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: windowWidth < 500 ? '100%' : 120, fontSize: windowWidth < 500 ? 14 : 16 }}>
              {isEdit ? "Update" : "Submit"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const FeedbackCard = ({ feedback, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className="feedback-card"
      actions={[
        <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEdit(feedback)}>
          Edit
        </Button>,
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this feedback?"
          onConfirm={() => onDelete(feedback.feedbackId)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" icon={<DeleteOutlined />} danger>
            Delete
          </Button>
        </Popconfirm>,
      ]}
    >
      <div className="feedback-header">
        <div className="feedback-movie-info">
          <VideoCameraOutlined className="movie-icon" />
          <Title level={5} className="movie-title">
            {feedback.movieName}
          </Title>
        </div>
        <div className="feedback-rating">
          <Rate disabled defaultValue={feedback.rating} allowHalf />
          <Text className="rating-text">({feedback.rating}/5)</Text>
        </div>
      </div>

      <div className="feedback-comment">
        <CommentOutlined className="comment-icon" />
        <Text>{feedback.comment}</Text>
      </div>

      <div className="feedback-date">
        <CalendarOutlined className="date-icon" />
        <Text type="secondary" className="date-text">
          {formatDate(feedback.createdDate)}
          {feedback.updatedDate && feedback.updatedDate !== feedback.createdDate && (
            <span> (Updated: {formatDate(feedback.updatedDate)})</span>
          )}
        </Text>
      </div>
    </Card>
  );
};