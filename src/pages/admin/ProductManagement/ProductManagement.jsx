import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Table, Upload, Select } from "antd";
import { useState, useEffect, useMemo } from "react";
import "./ProductManagement.scss";

const ProductManagement = () => {
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
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

  // Fetch Products List
  const fetchProducts = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/employee/products/all`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      // Ensure each product has a unique key and all required properties
      const formattedProducts = result.map((product) => ({
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
        message.success("Products list fetched successfully", 1.5);
      }
    } catch (error) {
      message.error(`Failed to fetch products: ${error.message}`, 1.5);
      setProducts([]); // Ensure empty array on error
    } finally {
      setLoading(false);
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
      quantity: record.stockQuantity // Rename for form consistency
    });
    setIsModalVisible(true);
  };

  // Update Product Handler
  const handleUpdateProduct = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append form data
      formData.append('productName', values.productName);
      formData.append('price', values.price);
      formData.append('stockQuantity', values.quantity);
      formData.append('category', values.category);
      
      // Append image if exists
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${apiUrl}/admin/products/${editingKey}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Product updated successfully", 1.5);
        setIsModalVisible(false);
        setEditingKey(null);
        form.resetFields();
        setImageFile(null);
        fetchProducts();
      } else {
        message.error(result.message || "Failed to update product", 1.5);
      }
    } catch (error) {
      message.error(`Failed to update product: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product Handler
  const handleDelete = (record) => {
    try {
      setProductToDelete(record);
      setDeleteConfirmationVisible(true);
    } catch (error) {
      message.error("Failed to show delete confirmation");
    }
  };

  // Confirm Delete Product
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/products/${productToDelete.key}`, {
        method: "DELETE",
        headers: {
          "Accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        message.success("Product deleted successfully", 1.5);
        setDeleteConfirmationVisible(false);
        await fetchProducts();
      } else {
        const errorText = await response.text();
        message.error(errorText || "Failed to delete product", 1.5);
      }
    } catch (error) {
      message.error(`Failed to delete product: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setDeleteConfirmationVisible(false);
  };

  // Add new method for handling product addition
  const handleAddProduct = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append form data
      formData.append('productName', values.productName);
      formData.append('description', values.description || 'null');
      formData.append('price', values.price);
      formData.append('stockQuantity', values.quantity);
      formData.append('category', values.category);
      
      // Append image if exists
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${apiUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Product added successfully", 1.5);
        setIsAddModalVisible(false);
        form.resetFields();
        setImageFile(null);
        fetchProducts();
      } else {
        message.error(result.message || "Failed to add product", 1.5);
      }
    } catch (error) {
      message.error(`Failed to add product: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-container">
      <div className="products-header">
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
        locale={{ 
          emptyText: 'No products found' 
        }}
        pagination={{
          pageSize: 12,
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === "prev") {
              return (
                <Button type="default" className="pagination-btn prev-btn">
                  Previous
                </Button>
              );
            }
            if (type === "next") {
              return (
                <Button type="default" className="pagination-btn next-btn">
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
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
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
              style={{ height:45, marginRight: 10 }}
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
                  const numValue = Number(value);
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
            <Input type="number" min={0} placeholder="Enter product price" />
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

          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: "Please select product status!" },
            ]}
          >
            <Input placeholder="Enter product status (ACTIVE/INACTIVE)" />
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
            paddingRight: "8px" // Add some padding for the scrollbar
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
              style={{ height:45, marginRight: 10 }}
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
                  const numValue = Number(value);
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
            <Input type="number" min={0} placeholder="Enter product price" />
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
                  message.error("You can only upload image files!");
                  return false;
                }

                if (!isLt2M) {
                  message.error("Image must be smaller than 2MB!");
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
    </div>
  );
};

export default ProductManagement;