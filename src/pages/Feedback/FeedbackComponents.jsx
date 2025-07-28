import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Rate, message, Card, Typography, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, StarOutlined, CommentOutlined, CalendarOutlined, VideoCameraOutlined } from "@ant-design/icons";

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
        <Space>
          <StarOutlined />
          {isEdit ? "Edit Feedback" : "Add Feedback"}
          {invoice && (
            <Text type="secondary" style={{ fontSize: "14px", color: '#fffcfcff' }}>
              for "{invoice.movieName}"
            </Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="feedback-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ rating: 5 }}
      >
        <Form.Item
          name="rating"
          label="Rating"
          rules={[
            { required: true, message: "Please provide a rating!" },
            { type: "number", min: 1, max: 5, message: "Rating must be between 1 and 5" },
          ]}
        >
          <Rate allowHalf={false} />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Comment"
          rules={[
            { required: true, message: "Please provide a comment!" },
            { max: 500, message: "Comment cannot exceed 500 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Share your thoughts about this movie..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          className="feedback-modal-actions"
        >
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? "Update" : "Submit"} Feedback
            </Button>
          </Space>
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