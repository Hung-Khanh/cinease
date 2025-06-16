import { EditOutlined, DeleteOutlined, PlusOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Table, message, Upload, Checkbox } from 'antd';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import './Movie.scss';

// Custom Dropdown Component
const MultiSelectDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (checkedValues) => {
    // Ensure onChange is called with an array
    if (typeof onChange === 'function') {
      onChange(checkedValues || []);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    const newValue = safeValue.filter(item => item !== itemToRemove);
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  return (
    <div className="dropdown-multiple-select">
      <div 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`} 
        onClick={handleToggle}
      >
        {safeValue.length > 0 ? (
          <div className="selected-items">
            {safeValue.map(item => (
              <span key={item} className="selected-item">
                {options.find(opt => opt.value === item)?.label || item}
                <CloseOutlined 
                  style={{ marginLeft: 4, fontSize: 10 }} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item);
                  }} 
                />
              </span>
            ))}
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <DownOutlined className="dropdown-icon" />
      </div>
      {isOpen && (
        <div className="dropdown-content">
          <Checkbox.Group
            className="checkbox-group"
            options={options}
            value={safeValue}
            onChange={handleCheckboxChange}
          />
        </div>
      )}
    </div>
  );
};

const Movie = () => {
  const [movies, setMovies] = useState([
    {
      key: '1',
      name: 'Spiderman Across The Spiderverse',
      duration: '140 mins',
      genre: 'Action',
      date: '2023-06-02',
      cinemaRoom: 'Cinema Room 1',
      status: 'Now Showing'
    },
    {
      key: '2',
      name: 'Spiderman Across The Spiderverse',
      duration: '140 mins',
      genre: 'Action',
      date: '2023-06-02',
      cinemaRoom: 'Cinema Room 1',
      status: 'Now Showing'
    },
    {
      key: '3',
      name: 'Spiderman Across The Spiderverse',
      duration: '140 mins',
      genre: 'Action',
      date: '2023-06-02',
      cinemaRoom: 'Cinema Room 1',
      status: 'Now Showing'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  const columns = [
    {
      title: 'Movie',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchTerm],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Cinema Room',
      dataIndex: 'cinemaRoom',
      key: 'cinemaRoom',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
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
            onClick={() => handleDeleteClick(record)}
          />
        </div>
      ),
    },
  ];

  const handleEdit = (record) => {
    // Reset the form
    form.resetFields();

    // Prepare form values with dayjs dates and split multi-select fields
    const editRecord = {
      ...record,
      date: record.date ? dayjs(record.date, 'YYYY-MM-DD') : null,
      genre: record.genre ? record.genre.split(', ') : [],
      cinemaRoom: record.cinemaRoom ? record.cinemaRoom.split(', ') : [],
      status: record.status ? record.status.split(', ') : [],
    };

    // Set the current movie being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(editRecord);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleDeleteClick = (record) => {
    setMovieToDelete(record);
    setDeleteConfirmationVisible(true);
  };

  const confirmDelete = () => {
    if (movieToDelete) {
      const updatedMovies = movies.filter(movie => movie.key !== movieToDelete.key);
      setMovies(updatedMovies);
      message.success(`Movie "${movieToDelete.name}" deleted successfully`);
      setDeleteConfirmationVisible(false);
      setMovieToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationVisible(false);
    setMovieToDelete(null);
  };

  const handleAddMovie = (values) => {
    if (isEditing) {
      // Update existing movie
      const updatedMovies = movies.map(movie => 
        movie.key === editingKey 
          ? {
              ...movie,
              ...values,
              genre: values.genre ? values.genre.join(', ') : '',
              cinemaRoom: values.cinemaRoom ? values.cinemaRoom.join(', ') : '',
              status: values.status ? values.status.join(', ') : '',
              date: values.date ? values.date.format('YYYY-MM-DD') : null,
            }
          : movie
      );
      
      setMovies(updatedMovies);
      message.success('Movie updated successfully');
    } else {
      // Add new movie
      const newMovie = {
        key: (movies.length + 1).toString(),
        ...values,
        genre: values.genre ? values.genre.join(', ') : '',
        cinemaRoom: values.cinemaRoom ? values.cinemaRoom.join(', ') : '',
        status: values.status ? values.status.join(', ') : '',
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
      };

      setMovies([...movies, newMovie]);
      message.success('Movie added successfully');
    }
    
    // Reset modal and form
    setIsModalVisible(false);
    setIsEditing(false);
    setEditingKey(null);
    form.resetFields();
  };

  return (
    <div className="movies-container">
      <div className="movies-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Select
              placeholder="Genre"
              style={{ minWidth: 200 }}
              allowClear
              onChange={(value) => setGenreFilter(value)}
            >
              <Select.Option value="action">Action</Select.Option>
              <Select.Option value="comedy">Comedy</Select.Option>
              <Select.Option value="drama">Drama</Select.Option>
              <Select.Option value="sci-fi">Sci-Fi</Select.Option>
              <Select.Option value="horror">Horror</Select.Option>
            </Select>
            <Select
              placeholder="Status"
              style={{ minWidth: 200 }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
            >
              <Select.Option value="Now Showing">Now Showing</Select.Option>
              <Select.Option value="Upcoming">Upcoming</Select.Option>
              <Select.Option value="Ended">Ended</Select.Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="add-movie-btn"
          >
            Add New Movie
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={movies.filter(movie => {
          const genreMatch = !genreFilter || 
            movie.genre.toLowerCase() === genreFilter.toLowerCase();
          
          const statusMatch = !statusFilter || 
            movie.status.toLowerCase() === statusFilter.toLowerCase();
          
          return genreMatch && statusMatch;
        })}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === 'prev') {
              return (
                <Button 
                  type="default" 
                  className="pagination-btn prev-btn"
                >
                  Previous
                </Button>
              );
            }
            if (type === 'next') {
              return (
                <Button 
                  type="default" 
                  className="pagination-btn next-btn"
                >
                  Next
                </Button>
              );
            }
            return originalElement;
          }
        }}
      />

      {/* Add/Edit Movie Modal */}
      <Modal
        title={isEditing ? "Edit Movie" : "Add New Movie"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditing(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        className="movie-modal"
        width={500}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMovie}
          className="movie-form"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Movie Name"
            rules={[{ 
              required: true, 
              message: 'Please enter movie name',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter movie name" 
              className="custom-input"
            />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="date"
              label="Date"
              rules={[{ 
                required: true, 
                message: 'Date is required',
              }]}
              hasFeedback
              style={{ width: '100%' }}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Select Date"
                className="custom-datepicker"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="movieProductCompany"
            label="Movie Product Company"
            rules={[{ 
              required: true, 
              message: 'Please enter movie product company',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter movie product company" 
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="actor"
            label="Actor"
            rules={[{ 
              required: true, 
              message: 'Please enter actor',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter actor" 
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="director"
            label="Director"
            rules={[{ 
              required: true, 
              message: 'Please enter director',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter director" 
              className="custom-input"
            />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              style={{ width: '48%' }}
              rules={[{ 
                required: true, 
                message: 'Please enter duration',
                validateTrigger: ['onChange', 'onBlur']
              }]}
              hasFeedback
            >
              <Input 
                placeholder="Enter duration" 
                className="custom-input"
                type="number"
              />
            </Form.Item>

            <Form.Item
              name="genre"
              label="Genre"
              style={{ width: '100%' }}
              rules={[{ 
                required: true, 
                message: 'Please select at least one genre',
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    throw new Error('Please select at least one genre');
                  }
                }
              }]}
              hasFeedback
            >
              <MultiSelectDropdown
                options={[
                  { label: 'Action', value: 'action' },
                  { label: 'Comedy', value: 'comedy' },
                  { label: 'Drama', value: 'drama' },
                  { label: 'Sci-Fi', value: 'sci-fi' },
                  { label: 'Thriller', value: 'thriller' },
                  { label: 'Romance', value: 'romance' }
                ]}
                placeholder="Select Genres"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="version"
            label="Version"
            rules={[{ 
              required: true, 
              message: 'Please enter version',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input 
              placeholder="Enter version" 
              className="custom-input"
            />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="cinemaRoom"
              label="Cinema Room"
              style={{ width: '100%' }}
              rules={[{ 
                required: true, 
                message: 'Please select at least one cinema room',
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    throw new Error('Please select at least one cinema room');
                  }
                }
              }]}
              hasFeedback
            >
              <MultiSelectDropdown
                options={[
                  { label: 'Cinema Room 1', value: 'Cinema Room 1' },
                  { label: 'Cinema Room 2', value: 'Cinema Room 2' },
                  { label: 'Cinema Room 3', value: 'Cinema Room 3' },
                  { label: 'Cinema Room 4', value: 'Cinema Room 4' },
                  { label: 'VIP Room', value: 'VIP Room' }
                ]}
                placeholder="Select Cinema Rooms"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              style={{ width: '100%' }}
              rules={[{ 
                required: true, 
                message: 'Please select at least one status',
                validator: async (_, value) => {
                  if (!value || value.length === 0) {
                    throw new Error('Please select at least one status');
                  }
                }
              }]}
              hasFeedback
            >
              <MultiSelectDropdown
                options={[
                  { label: 'Now Showing', value: 'Now Showing' },
                  { label: 'Upcoming', value: 'Upcoming' },
                  { label: 'Ended', value: 'Ended' },
                  { label: 'Premiere', value: 'Premiere' }
                ]}
                placeholder="Select Status"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="schedule"
            label="Schedule"
            rules={[{ 
              required: true, 
              message: 'Please enter schedule',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input.TextArea 
              placeholder="Enter schedule" 
              rows={4}
              className="custom-textarea"
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ 
              required: true, 
              message: 'Please enter content',
              validateTrigger: ['onChange', 'onBlur']
            }]}
            hasFeedback
          >
            <Input.TextArea 
              placeholder="Enter content" 
              rows={4}
              className="custom-textarea"
            />
          </Form.Item>

          <Form.Item
            name="moviePoster"
            label="Movie Poster"
          >
            <Upload 
              name="moviePoster"
              listType="picture-card"
              className="movie-poster-uploader"
              showUploadList={true}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              className="submit-btn"
            >
              {isEditing ? "Update Movie" : "Add New Movie"}
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
        className="movie-modal delete-confirmation-modal"
        width={400}
        centered
      >
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete the movie:</p>
          <h3 className="movie-title">{movieToDelete?.name}</h3>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="delete-confirmation-actions">
            <Button 
              onClick={cancelDelete} 
              className="cancel-btn"
            >
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
    </div>
  );
};

export default Movie;
