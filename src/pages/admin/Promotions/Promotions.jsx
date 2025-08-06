import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  Upload,
  message
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../../constants/axios";
import "./Promotions.scss";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  // State for file upload
  const [imageFile, setImageFile] = useState(null);
  // Memoized filtered promotions
  const filteredPromotions = useMemo(() => {
    if (!searchTerm) return promotions;

    const searchTermLower = searchTerm.toLowerCase();
    return promotions.filter((promotion) =>
      promotion.title.toLowerCase().includes(searchTermLower)
    );
  }, [promotions, searchTerm]);

  // Fetch promotions from API
  const fetchPromotions = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await axios.get("/public/promotions");

      const formattedPromotions = response.data.map((promotion) => {
        return {
          key: promotion.promotionId.toString(),
          title: promotion.title,
          startTime: promotion.startTime,
          endTime: promotion.endTime,
          discountLevel: `${promotion.discountLevel}%`,
          detail: promotion.detail || "No details available",
          image: promotion.image || null,
        };
      });

      setPromotions(formattedPromotions);
    } catch (error) {
      toast.error(
        `Failed to fetch promotions: ${error.response?.data?.message || error.message}`,
        3
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch promotions on component mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Handle view promotion details
  const handleViewDetails = (record) => {
    setSelectedPromotion(record);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <img
            src={image}
            alt="Promotion"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ) : (
          <div style={{ color: "#999" }}>No Image</div>
        ),
    },
    {
      title: "Promotion",
      dataIndex: "title",
      key: "title",
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Promotion Details",
      dataIndex: "detail",
      key: "detail",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Discount Level",
      dataIndex: "discountLevel",
      key: "discountLevel",
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
            onClick={() => handleViewDetails(record)}
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
    <Button type="default" className={`pagination-btn-cinema ${type}-btn`}>
      {text}
    </Button>
  );
  const handleEdit = (record) => {
    // Reset the form
    form.resetFields();

    // Prepare form values with dayjs dates
    const editRecord = {
      ...record,
      startTime: record.startTime
        ? dayjs(record.startTime, "YYYY-MM-DD HH:mm")
        : null,
      endTime: record.endTime
        ? dayjs(record.endTime, "YYYY-MM-DD HH:mm")
        : null,
      discountLevel: record.discountLevel.replace(" VND", ""), // Remove VND for editing
      detail: record.detail, // Use 'detail' for form display
      image: record.image, // Directly use image URL
    };

    // Set the current promotion being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(editRecord);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    try {
      // Set the promotion to be deleted
      setPromotionToDelete(record);

      // Show the delete confirmation modal
      setDeleteConfirmationVisible(true);
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      toast.error("Failed to show delete confirmation");
    }
  };

  const handleAddPromotion = async (values) => {
    try {
      // Format dates to match the API's expected format
      const formatDate = (date) =>
        date ? dayjs(date).format("YYYY-MM-DDTHH:mm") : null;

      // Prepare FormData
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("startTime", formatDate(values.startTime));
      formData.append("endTime", formatDate(values.endTime));
      formData.append("discountLevel", parseInt(values.discountLevel));
      formData.append("detail", values.detail);
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }
      if (isEditing) {
        formData.append("promotionId", parseInt(editingKey));
      }

      const url = isEditing
        ? `/admin/promotions/${editingKey}`
        : `/admin/promotions`;

      const response = await axios({
        method: isEditing ? "put" : "post",
        url: url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh the promotions list
      await fetchPromotions(true);

      // Show success message
      toast.success(
        `Promotion "${values.title}" ${
          isEditing ? "updated" : "added"
        } successfully!`,
        3
      );

      // Reset modal and form
      setIsModalVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      setImageFile(null);
      form.resetFields();
    } catch (error) {
      toast.error(
        `Failed to ${isEditing ? "update" : "add"} promotion: ${
          error.response?.data?.message || error.message
        }`,
        3
      );
    }
  };

  const confirmDelete = async () => {
    if (promotionToDelete) {
      try {
        await axios.delete(`/admin/promotions/${promotionToDelete.key}`);

        // Refresh the promotions list
        await fetchPromotions(true);

        // Specific delete success toast
        toast.success(
          `Promotion "${promotionToDelete.title}" deleted successfully`,
          2
        );

        // Hide the delete confirmation modal
        setDeleteConfirmationVisible(false);
        setPromotionToDelete(null);
      } catch (error) {
        toast.error(
          `Failed to delete promotion: ${
            error.response?.data?.message || error.message
          }`,
          3
        );
      }
    }
  };

  const cancelDelete = () => {
    // Hide the delete confirmation modal
    setDeleteConfirmationVisible(false);
  };

  return (
    <div className="promotions-container">
      <div className="promotions-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search promotion"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200, marginRight: 10 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="add-promotion-btn"
          >
            Add New Promotion
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPromotions}
        loading={loading}
        className="ant-table-promotion"
        locale={{ 
          emptyText: 'No promotions found' 
        }}
        pagination={{
          pageSize: 6,
          className: "pagination-btn-cinema",
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === "prev")
              return createPaginationButton("prev", "Previous");
            if (type === "next") return createPaginationButton("next", "Next");
            return originalElement;
          },
        }}
      />

      <Modal
        title={isEditing ? "Edit Promotion" : "Add New Promotion"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        className="promotion-modal"
        width={500}
        centered
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPromotion}
          className="promotion-form"
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Promotion Title"
            rules={[
              {
                required: true,
                message: "Please enter promotion title",
                validateTrigger: ["onChange", "onBlur"],
              },
            ]}
            hasFeedback
          >
            <Input
              placeholder="Enter promotion title"
              className="custom-input"
            />
          </Form.Item>

          <div className="time-range-container">
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[
                {
                  required: true,
                  message: "Start date is required",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const endTime = getFieldValue("endTime");
                    if (!value) {
                      return Promise.reject(
                        new Error("Please select a start date")
                      );
                    }
                    if (endTime && value.isAfter(endTime)) {
                      return Promise.reject(
                        new Error("Start date must be before end date")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              hasFeedback
              style={{ width: "48%" }}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                placeholder="Start Date and Time"
                className="custom-datepicker"
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time"
              rules={[
                {
                  required: true,
                  message: "End date is required",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue("startTime");
                    if (!value) {
                      return Promise.reject(
                        new Error("Please select an end date")
                      );
                    }
                    if (startTime && value.isBefore(startTime)) {
                      return Promise.reject(
                        new Error("End date must be after start date")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              hasFeedback
              style={{ width: "48%" }}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                placeholder="End Date and Time"
                className="custom-datepicker"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="discountLevel"
            label="Discount Level"
            rules={[
              {
                required: true,
                message: "Please enter discount level",
                validateTrigger: ["onChange", "onBlur"],
              },
            ]}
            hasFeedback
          >
            <Input
              placeholder="Enter discount amount"
              className="custom-input"
              type="number"
            />
          </Form.Item>

          <Form.Item
            name="detail"
            label="Promotion Details"
            rules={[
              {
                required: true,
                message: "Please enter promotion details",
                validateTrigger: ["onChange", "onBlur"],
              },
            ]}
            hasFeedback
          >
            <Input.TextArea
              placeholder="Enter promotion details"
              rows={4}
              className="custom-textarea"
            />
          </Form.Item>

          <Form.Item label="Promotion Image" required={false}>
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                setImageFile(file);
                return false; // Prevent auto upload
              }}
              fileList={imageFile ? [imageFile] : []}
              onRemove={() => setImageFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Promotion Image</Button>
            </Upload>
            {imageFile && (
              <div style={{ marginTop: 8 }}>Selected: {imageFile.name}</div>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="submit-btn"
            >
              {isEditing ? "Update Promotion" : "Add New Promotion"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={deleteConfirmationVisible}
        onCancel={cancelDelete}
        footer={null}
        className="promotion-modal delete-confirmation-modal"
        width={400}
        centered
      >
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete the promotion:</p>
          <h3 className="promotion-title">{promotionToDelete?.title}</h3>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="delete-confirmation-actions">
            <Button onClick={cancelDelete} className="cancel-btn">
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={confirmDelete}
              className="confirm-delete-btn"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Promotion Details Modal */}
      <Modal
        title="Promotion Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        className="promotion-details-modal"
        width={500}
        centered
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        {selectedPromotion && (
          <div className="promotion-details-content">
            <div className="promotion-detail-row">
              <div className="promotion-detail-label">Title:</div>
              <div className="promotion-detail-value">
                {selectedPromotion.title}
              </div>
            </div>
            <div className="promotion-detail-row">
              <div className="promotion-detail-label">Start Time:</div>
              <div className="promotion-detail-value">
                {dayjs(selectedPromotion.startTime).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
            <div className="promotion-detail-row">
              <div className="promotion-detail-label">End Time:</div>
              <div className="promotion-detail-value">
                {dayjs(selectedPromotion.endTime).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
            <div className="promotion-detail-row">
              <div className="promotion-detail-label">Discount Level:</div>
              <div className="promotion-detail-value">
                {selectedPromotion.discountLevel}
              </div>
            </div>
            <div className="promotion-detail-row">
              <div className="promotion-detail-label">Details:</div>
              <div className="promotion-detail-value">{selectedPromotion.details}</div>
            </div>
            
          </div>
        )}
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Promotions;
