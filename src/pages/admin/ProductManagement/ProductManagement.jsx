import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Table, Upload, Select, Switch } from "antd";
import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProductManagement.scss";
import axios from '../../../constants/axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [form] = Form.useForm();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Common API handler with toast
  const handleApiCall = async (apiCall, successMessage, errorMessage) => {
    setLoading(true);
    try {
      const response = await apiCall();
      if (successMessage) {
        toast.success(successMessage);
      }
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || errorMessage || error.message;
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format price in Vietnamese dong
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Fetch Products List
  const fetchProducts = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await axios.get('/employee/products/all');
  
      // Ensure each product has a unique key and all required properties
      const formattedProducts = response.data.map((product) => ({
        key: product.productId ? product.productId.toString() : Math.random().toString(),
        productName: product.productName || 'N/A',
        category: product.category || 'N/A',
        price: product.price !== undefined ? product.price : 0,
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 0,
        image: product.image || null,
        status: product.status || 'INACTIVE',
        description: product.description || 'No description available'
      }));

      setProducts(formattedProducts);

      if (showSuccessMessage) {
        toast.success("Products list fetched successfully!");
      }
    } catch (error) {
      const errorMessage = `Failed to fetch products: ${error.response?.data?.message || error.message}`;
      toast.error(errorMessage);
      setProducts([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle Product Status Toggle
  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await handleApiCall(
        () => axios.put(`/admin/products/${productId}/status?status=${newStatus}`),
        `Product ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`
      );

      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.key === productId.toString() 
            ? { ...product, status: newStatus } 
            : product
        )
      );
    } catch (error) {
      // Error already handled in handleApiCall
      console.error('Status toggle error:', error);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;

    const searchTermLower = searchTerm.toLowerCase();
    return products.filter(product =>
      product.productName.toLowerCase().includes(searchTermLower) ||
      product.category.toLowerCase().includes(searchTermLower) ||
      product.price.toString().includes(searchTermLower)
    );
  }, [products, searchTerm]);

  // Columns for the Products Table
  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <img
            src={image}
            alt="Product"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />
        ) : (
          <div style={{ color: "#999" }}>No Image</div>
        ),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => formatPrice(price),
    },
    {
      title: "Stock Quantity",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div className="status-column">
          <Switch
            checked={status === 'ACTIVE'}
            onChange={() => handleStatusToggle(record.key, status)}
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

  // Edit Product Handler
  const handleEdit = (record) => {
    form.resetFields();
    setEditingKey(record.key);
    form.setFieldsValue({
      ...record,
      price: formatPrice(record.price), // Format price for editing
      quantity: record.stockQuantity // Rename for form consistency
    });
    setIsModalVisible(true);
  };

  // Delete Product Handler
  const handleDelete = (record) => {
    try {
      setProductToDelete(record);
      setDeleteConfirmationVisible(true);
    } catch (error) {
      toast.error("Failed to show delete confirmation");
    }
  };

  // Confirm Delete Product
  const confirmDelete = async () => {
    try {
      await handleApiCall(
        () => axios.delete(`/admin/products/${productToDelete.key}`),
        null,
        "Failed to delete product"
      );

      toast.success("Product deleted successfully!");
      setDeleteConfirmationVisible(false);
      await fetchProducts();
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setDeleteConfirmationVisible(false);
  };

  // Update Product Handler
  const handleUpdateProduct = async (values) => {
    try {
      const formData = new FormData();

      // Append form data
      formData.append('productName', values.productName);
      
      // Remove non-numeric characters from price
      const price = values.price ? Number(String(values.price).replace(/[^\d]/g, '')) : 0;
      formData.append('price', price);
      
      formData.append('stockQuantity', values.quantity);
      formData.append('category', values.category);

      // Append image if exists
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await handleApiCall(
        () => axios.put(`/admin/products/${editingKey}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
        null,
        "Failed to update product"
      );

      toast.success("Product updated successfully!");
      setIsModalVisible(false);
      setEditingKey(null);
      form.resetFields();
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  // Add new method for handling product addition
  const handleAddProduct = async (values) => {
    try {
      const formData = new FormData();
      
      // Append form data
      formData.append('productName', values.productName);
      formData.append('description', values.description || 'null');
      
      // Remove non-numeric characters from price
      const price = values.price ? Number(String(values.price).replace(/[^\d]/g, '')) : 0;
      formData.append('price', price);
      
      formData.append('stockQuantity', values.quantity);
      formData.append('category', values.category);
      
      // Append image if exists
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await handleApiCall(
        () => axios.post('/admin/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
        null,
        "Failed to add product"
      );

      toast.success("Product added successfully!");
      setIsAddModalVisible(false);
      form.resetFields();
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      // Error already handled in handleApiCall
    }
  };

  return (
    <div className="productmanagement">
      <div className="productmanagement-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search product (name, category, price)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300, marginRight: 10 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsAddModalVisible(true);
              form.resetFields();
              setImageFile(null);
            }}
          >
            Add New Product
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        className="ant-table-product"
        locale={{ 
          emptyText: 'No products found' 
        }}
        pagination={{
          pageSize: 12,
          showSizeChanger: false,
          className: "pagination-btn-cinema",
          itemRender: (current, type, originalElement) => {
            if (type === "prev") {
              return (
                <Button type="default" className="pagination-btn-product prev-btn">
                  Previous
                </Button>
              );
            }
            if (type === "next") {
              return (
                <Button type="default" className="pagination-btn-product next-btn">
                  Next
                </Button>
              );
            }
            return originalElement;
          },
        }}
      />

      {/* Edit Product Modal */}
      <Modal
        title="Edit Product"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        className="product-modal"
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProduct}
          className="product-form"
        >
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[
              { required: true, message: "Please input the product name!" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[
              { required: true, message: "Please select the product category!" },
            ]}
          >
            <Select
              style={{ height: 45, marginRight: 10 }}
              placeholder="Select Category"
              options={[
                { value: 'FOOD', label: 'Food' },
                { value: 'BEVERAGE', label: 'Beverage' },
                { value: 'COMBO', label: 'Combo' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                required: true,
                message: "Please input the product price!"
              },
              {
                validator: (_, value) => {
                  // Remove any non-numeric characters
                  const numValue = Number(String(value).replace(/[^\d]/g, ''));
                  if (isNaN(numValue)) {
                    return Promise.reject(new Error("Price must be a valid number"));
                  }
                  if (numValue <= 0) {
                    return Promise.reject(new Error("Price must be greater than 0"));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              type="text" 
              min={0} 
              placeholder="Enter product price" 
              onChange={(e) => {
                // Format input as user types
                const value = e.target.value.replace(/[^\d]/g, '');
                const formatted = value ? formatPrice(Number(value)) : '';
                form.setFieldsValue({ price: formatted });
              }}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Stock Quantity"
            rules={[
              {
                required: true,
                message: "Please input the product quantity!"
              },
              {
                validator: (_, value) => {
                  const numValue = Number(value);
                  if (isNaN(numValue)) {
                    return Promise.reject(new Error("Quantity must be a valid number"));
                  }
                  if (numValue < 0) {
                    return Promise.reject(new Error("Quantity cannot be negative"));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input type="number" min={0} placeholder="Enter product stock quantity" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="submit-btn"
              loading={loading}
            >
              Update Product
            </Button>
          </Form.Item>
        </Form>
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
          <p>Are you sure you want to delete this product?</p>
          <p className="product-title">{productToDelete?.productName}</p>
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
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        title="Add New Product"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
          setImageFile(null);
        }}
        footer={null}
        className="product-modal"
        width={600}
        centered
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: "8px" 
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddProduct}
          className="product-form"
        >
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[
              { required: true, message: "Please input the product name!" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter product description (optional)" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[
              { required: true, message: "Please select the product category!" },
            ]}
          >
            <Select
              style={{ height: 45, marginRight: 10 }}
              placeholder="Select Category"
              options={[
                { value: 'FOOD', label: 'Food' },
                { value: 'BEVERAGE', label: 'Beverage' },
                { value: 'COMBO', label: 'Combo' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                required: true,
                message: "Please input the product price!"
              },
              {
                validator: (_, value) => {
                  // Remove any non-numeric characters
                  const numValue = Number(String(value).replace(/[^\d]/g, ''));
                  if (isNaN(numValue)) {
                    return Promise.reject(new Error("Price must be a valid number"));
                  }
                  if (numValue <= 0) {
                    return Promise.reject(new Error("Price must be greater than 0"));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              type="text" 
              min={0} 
              placeholder="Enter product price" 
              onChange={(e) => {
                // Format input as user types
                const value = e.target.value.replace(/[^\d]/g, '');
                const formatted = value ? formatPrice(Number(value)) : '';
                form.setFieldsValue({ price: formatted });
              }}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Stock Quantity"
            rules={[
              {
                required: true,
                message: "Please input the product quantity!"
              },
              {
                validator: (_, value) => {
                  const numValue = Number(value);
                  if (isNaN(numValue)) {
                    return Promise.reject(new Error("Quantity must be a valid number"));
                  }
                  if (numValue < 0) {
                    return Promise.reject(new Error("Quantity cannot be negative"));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input type="number" min={0} placeholder="Enter product stock quantity" />
          </Form.Item>

          <Form.Item label="Product Image">
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isImage) {
                  toast.error("You can only upload image files!");
                  return false;
                }

                if (!isLt2M) {
                  toast.error("Image must be smaller than 2MB!");
                  return false;
                }

                setImageFile(file);
                return false; // Prevent automatic upload
              }}
              fileList={imageFile ? [imageFile] : []}
              onRemove={() => setImageFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Product Image</Button>
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
              loading={loading}
            >
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ProductManagement;