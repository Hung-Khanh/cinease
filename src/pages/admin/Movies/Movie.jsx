import { EditOutlined, DeleteOutlined, PlusOutlined, DownOutlined, CloseOutlined, PlusCircleOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Table, message, Upload, Checkbox, TimePicker } from 'antd';
import React, { useState, useEffect } from 'react';
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
  const apiUrl = "https://legally-actual-mollusk.ngrok-free.app/api";
  const [movies, setMovies] = useState([]);
  const [movieTypes, setMovieTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // State for cinema rooms
  const [cinemaRooms, setCinemaRooms] = useState([]);

  const columns = [
    {
      title: 'Movie Name (VN)',
      dataIndex: 'movieNameVn',
      key: 'movieNameVn',
    },
    {
      title: 'Movie Name (EN)',
      dataIndex: 'movieNameEnglish',
      key: 'movieNameEnglish',
    },
    {
      title: 'Date Range',
      key: 'dateRange',
      render: (_, record) => (
        <div>
          {record.fromDate} - {record.toDate}
        </div>
      ),
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
    },
    {
      title: 'Movie Type',
      key: 'types',
      render: (_, record) => {
        // Ensure types is an array and join them
        const typeDisplay = Array.isArray(record.types)
          ? record.types.join(', ')
          : (record.types ? String(record.types) : 'No Type');

        return typeDisplay;
      },
    },
    {
      title: 'Duration (mins)',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} mins`,
    },
    {
      title: 'Large Image',
      dataIndex: 'largeImage',
      key: 'largeImage',
      render: (largeImage) => (
        largeImage ? (
          <img
            src={largeImage}
            alt="Movie Poster"
            style={{
              maxWidth: 100,
              maxHeight: 100,
              objectFit: 'cover'
            }}
          />
        ) : (
          'No Image'
        )
      ),
    },
    {
      title: 'Trailer',
      dataIndex: 'trailerUrl',
      key: 'trailerUrl',
      render: (trailerUrl) => (
        trailerUrl ? (
          <Button
            type="link"
            onClick={() => window.open(trailerUrl, '_blank')}
          >
            Watch Trailer
          </Button>
        ) : (
          'No Trailer'
        )
      ),
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

    // Prepare form values
    const editRecord = {
      ...record,
      dateRange: record.fromDate && record.toDate
        ? [dayjs(record.fromDate), dayjs(record.toDate)]
        : null,
      scheduleTimes: record.scheduleTimes
        ? record.scheduleTimes.map(scheduleTime => {
          const [date, time] = scheduleTime.split(' ');
          return {
            date: dayjs(date),
            time: dayjs(time, 'HH:mm')
          };
        })
        : [],
      // Set initial types using type names
      types: record.types || []
    };

    // Set the current movie being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(editRecord);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleAddMovie = async (values) => {
    try {
      const requestBody = {
        movieNameVn: values.movieNameVn,
        movieNameEnglish: values.movieNameEnglish,
        fromDate: values.dateRange[0].format('YYYY-MM-DD'),
        toDate: values.dateRange[1].format('YYYY-MM-DD'),
        actor: values.actor,
        movieProductionCompany: values.movieProductionCompany,
        director: values.director,
        duration: parseInt(values.duration),
        version: values.version,
        typeIds: values.types && values.types.length > 0
          ? values.types.map(typeName => {
              const type = movieTypes.find(t => t.movieTypeName === typeName);
              return type ? type.movieTypeId : null;
            }).filter(id => id !== null)
          : [1],
        cinemaRoom: values.cinemaRoom,
        content: values.content,
        largeImage: values.largeImage || '',
        scheduleTimes: values.scheduleTimes
          ? values.scheduleTimes.map(scheduleItem =>
              `${scheduleItem.date.format('YYYY-MM-DD')} ${scheduleItem.time.format('HH:mm')}`
            )
          : [],
        trailerUrl: values.trailerUrl || ''
      };

      console.log('Is Editing:', isEditing); // Debug log
      console.log('Editing Key:', editingKey); // Debug log
      console.log('Request Body:', requestBody); // Debug log

      const token = localStorage.getItem('token');
      const url = isEditing
        ? `${apiUrl}/admin/movies/${editingKey}`
        : `${apiUrl}/admin/movies/add`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response Status:', response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response:', errorText); // Debug log
        throw new Error(errorText || `Failed to ${isEditing ? 'update' : 'add'} movie`);
      }

      await fetchMovies();

      // Ensure toast is shown for both add and update
      if (isEditing) {
        message.success({
          content: `Movie "${values.movieNameVn}" updated successfully!`,
          duration: 3,
          key: 'movie-update-toast'
        });
        console.log('Update Toast Triggered'); // Debug log
      } else {
        message.success({
          content: `New movie "${values.movieNameVn}" added successfully!`,
          duration: 3,
          key: 'movie-add-toast'
        });
        console.log('Add Toast Triggered'); // Debug log
      }

      setIsModalVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      form.resetFields();
    } catch (error) {
      console.error(`${isEditing ? 'Update' : 'Add'} Movie Error:`, error);
      message.error(`Failed to ${isEditing ? 'update' : 'add'} movie: ${error.message}`, 3);
    }
  };

  const handleDeleteClick = (record) => {
    setMovieToDelete(record);
    setDeleteConfirmationVisible(true);
  };

  const confirmDelete = async () => {
    if (movieToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/admin/movies/${movieToDelete.key}`, {
          method: "DELETE",
          headers: {
            "Accept": "*/*",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to delete movie with ID ${movieToDelete.key}`);
        }

        await fetchMovies();

        // Specific delete success toast
        message.success(`Movie "${movieToDelete.movieNameVn}" deleted successfully`, 2);

        setDeleteConfirmationVisible(false);
        setMovieToDelete(null);
      } catch (error) {
        console.error('Delete Movie Error:', error);
        message.error(`Failed to delete movie: ${error.message}`, 3);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationVisible(false);
    setMovieToDelete(null);
  };

  // Fetch movie types
  const fetchMovieTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/employee/types`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      // Log the full response for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get error text
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Fetched Types:', result);

      // Map the types using the exact structure from the JSON
      const formattedTypes = result.map(type => ({
        movieTypeId: type.typeId,
        movieTypeName: type.typeName
      }));

      setMovieTypes(formattedTypes);
    } catch (error) {
      console.error('Fetch Movie Types Error:', error);

      // More detailed error message
      message.error(`Failed to fetch movie types: ${error.message}`, 3);
    }
  };

  // Fetch movie types on component mount
  useEffect(() => {
    fetchMovieTypes();
  }, []);

  // Fetch cinema rooms
  const fetchCinemaRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/cinema-room/list`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      // Log the full response for debugging
      console.log('Cinema Rooms Response status:', response.status);

      if (!response.ok) {
        // Try to get error text
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Fetched Cinema Rooms:', result);

      setCinemaRooms(result);
    } catch (error) {
      console.error('Fetch Cinema Rooms Error:', error);
      message.error(`Failed to fetch cinema rooms: ${error.message}`, 3);
    }
  };

  // Fetch cinema rooms on component mount
  useEffect(() => {
    fetchCinemaRooms();
  }, []);

  // Modify fetchMovies to include type fetching
  const fetchMovies = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/admin/movies/list`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw API Response:', result); // Debug log to verify types

      const formattedMovies = result.map((movie) => {
        console.log(`Movie ${movie.movieId} Types:`, movie.types); // Specific type logging
        return {
          key: movie.movieId.toString(),
          movieNameVn: movie.movieNameVn,
          movieNameEnglish: movie.movieNameEnglish,
          fromDate: movie.fromDate,
          toDate: movie.toDate,
          actor: movie.actor,
          movieProductionCompany: movie.movieProductionCompany,
          director: movie.director,
          duration: movie.duration !== undefined && movie.duration !== null
            ? Number(movie.duration)
            : 0,
          version: movie.version,
          // Ensure types is always an array, even if it's not in the expected format
          types: Array.isArray(movie.types)
            ? movie.types
            : (movie.types ? [movie.types] : []),
          cinemaRoom: movie.cinemaRoomId,
          content: movie.content,
          largeImage: movie.largeImage || '',
          scheduleTimes: [],
          trailerUrl: movie.trailerUrl
        };
      });

      setMovies(formattedMovies);

      // Only show success message when explicitly requested
      if (showSuccessMessage) {
        message.success("Movies fetched successfully", 1.5);
      }
    } catch (error) {
      console.error('Fetch Movies Error:', error);
      message.error(`Failed to fetch movies: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Fetch movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="movies-container">
      <div className="movies-header">
        <div className="header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setIsEditing(false);
              form.resetFields();
            }}
            className="add-movie-btn"
          >
            Add New Movie
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={movies}
        loading={loading}
        pagination={{
          pageSize: 10,
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
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMovie}
          className="movie-form"
        >
          <Form.Item
            name="movieNameVn"
            label="Movie Name (Vietnamese)"
            rules={[{ required: true, message: 'Please enter Vietnamese movie name' }]}
          >
            <Input placeholder="Enter Vietnamese movie name" />
          </Form.Item>

          <Form.Item
            name="movieNameEnglish"
            label="Movie Name (English)"
            rules={[{ required: true, message: 'Please enter English movie name' }]}
          >
            <Input placeholder="Enter English movie name" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            style={{ marginBottom: 16 }}
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              placeholder={['From Date', 'To Date']}
            />
          </Form.Item>

          <Form.List
            name="scheduleTimes"
            rules={[
              {
                validator: async (_, scheduleTimes) => {
                  if (!scheduleTimes || scheduleTimes.length === 0) {
                    throw new Error('Please add at least one schedule time');
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'date']}
                      rules={[{ required: true, message: 'Missing date' }]}
                      style={{ width: '45%', marginRight: '10px' }}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        placeholder="Select Date"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'time']}
                      rules={[{ required: true, message: 'Missing time' }]}
                      style={{ width: '45%', marginRight: '10px' }}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        format="HH:mm"
                        placeholder="Select Time"
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ fontSize: '20px', color: '#999', marginTop: '10px' }}
                      />
                    ) : null}
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusCircleOutlined />}
                    className="add-schedule-btn" // Add this className
                  >
                    Add Schedule Time
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            label="Duration & Version"
            style={{ marginBottom: 16 }}
          >
            <Input.Group compact>
              <Form.Item
                name="duration"
                noStyle
                rules={[{ required: true, message: 'Please input duration' }]}
              >
                <Input
                  style={{ width: '48%', marginRight: '4%' }}
                  placeholder="Duration (minutes)"
                  type="number"
                />
              </Form.Item>
              <Form.Item
                name="version"
                noStyle
                rules={[{ required: true, message: 'Please input version' }]}
              >
                <Input
                  style={{ width: '48%' }}
                  placeholder="Version"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="actor"
            label="Actor"
            rules={[{ required: true, message: 'Please enter actor name' }]}
          >
            <Input placeholder="Enter actor name" />
          </Form.Item>

          <Form.Item
            name="movieProductionCompany"
            label="Movie Production Company"
            rules={[{ required: true, message: 'Please enter production company' }]}
          >
            <Input placeholder="Enter production company" />
          </Form.Item>

          <Form.Item
            name="director"
            label="Director"
            rules={[{ required: true, message: 'Please enter director name' }]}
          >
            <Input placeholder="Enter director name" />
          </Form.Item>

          <Form.Item
            label="Cinema Room & Movie Types"
            style={{ marginBottom: 16 }}
          >
            <Input.Group compact>
              <Form.Item
                name="cinemaRoom"
                noStyle
                rules={[{ required: true, message: 'Please select a cinema room' }]}
              >
                <Select
                  placeholder="Select cinema room"
                  style={{ width: '48%', marginRight: '4%' }}
                  options={cinemaRooms.map(room => ({
                    label: `${room.cinemaRoomName} (${room.seatQuantity} seats)`,
                    value: room.cinemaRoomId
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="types"
                noStyle
                rules={[{ required: true, message: 'Please select at least one movie type' }]}
              >
                <Select
                  placeholder="Select movie types"
                  style={{ width: '48%' }}
                  options={movieTypes.map(type => ({
                    label: type.movieTypeName,
                    value: type.movieTypeName
                  }))}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <Input.TextArea
              placeholder="Enter movie content"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="trailerUrl"
            label="Trailer URL"
          >
            <Input placeholder="Enter trailer URL" />
          </Form.Item>

          <Form.Item
            name="largeImage"
            label="Large Image URL"
          >
            <Input placeholder="Enter large image URL" />
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
          <h3 className="movie-title">{movieToDelete?.movieNameVn}</h3>
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
