import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  TimePicker,
  Tooltip,
  Upload,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import "./Movie.scss";

// Custom Dropdown Component
const MultiSelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (checkedValues) => {
    // Ensure onChange is called with an array
    if (typeof onChange === "function") {
      onChange(checkedValues || []);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    const newValue = safeValue.filter((item) => item !== itemToRemove);
    if (typeof onChange === "function") {
      onChange(newValue);
    }
  };

  return (
    <div className="dropdown-multiple-select">
      <div
        className={`dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={handleToggle}
      >
        {safeValue.length > 0 ? (
          <div className="selected-items">
            {safeValue.map((item) => (
              <span key={item} className="selected-item">
                {options.find((opt) => opt.value === item)?.label || item}
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
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // State for cinema rooms
  const [cinemaRooms, setCinemaRooms] = useState([]);

  // State for file upload - simplified
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Add state for movie details modal
  const [isMovieDetailsModalVisible, setIsMovieDetailsModalVisible] = useState(false);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);

  // Optimize message handling with debounce and key management
  const showSuccessMessage = React.useCallback((content, duration = 2) => {
    message.success({
      content,
      duration,
      key: "movie-operation-success",
    });
  }, []);

  const showErrorMessage = React.useCallback((content, duration = 3) => {
    message.error({
      content,
      duration,
      key: "movie-operation-error",
    });
  }, []);

  const columns = [
    {
      title: "Movie Name (VN)",
      dataIndex: "movieNameVn",
      key: "movieNameVn",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: "150px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Movie Name (EN)",
      dataIndex: "movieNameEnglish",
      key: "movieNameEnglish",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: "150px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Date Range",
      key: "dateRange",
      render: (_, record) => {
        // Ensure consistent formatting by always showing full date range
        const fromDate = record.fromDate || 'N/A';
        const toDate = record.toDate || 'N/A';
        
        return (
          <Tooltip title={`From: ${fromDate} - To: ${toDate}`}>
            <div 
              style={{ 
                cursor: "help", 
                minWidth: "150px",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {fromDate} - {toDate}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Movie Type",
      key: "types",
      render: (_, record) => {
        const typeDisplay = Array.isArray(record.types)
          ? record.types.join(", ")
          : record.types
            ? String(record.types)
            : "No Type";

        return (
          <Tooltip title={typeDisplay}>
            <div
              style={{
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {typeDisplay}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Poster Image",
      dataIndex: "posterImageUrl",
      key: "posterImageUrl",
      render: (posterImageUrl) =>
        posterImageUrl ? (
          <img
            src={posterImageUrl}
            alt="Movie Poster"
            style={{
              maxWidth: 100,
              maxHeight: 100,
              objectFit: "cover",
            }}
          />
        ) : (
          "No Poster"
        ),
    },
    {
      title: "Banner Image",
      dataIndex: "largeImage",
      key: "largeImage",
      render: (largeImage) =>
        largeImage ? (
          <img
            src={largeImage}
            alt="Movie Banner"
            style={{
              maxWidth: 150,
              maxHeight: 100,
              objectFit: "cover",
            }}
          />
        ) : (
          "No Banner"
        ),
    },
    {
      title: "Trailer",
      dataIndex: "trailerUrl",
      key: "trailerUrl",
      render: (trailerUrl) =>
        trailerUrl ? (
          <Button
            type="link"
            size="small"
            onClick={() => window.open(trailerUrl, "_blank")}
            style={{
              padding: 0,
              fontSize: "10px",
              height: "auto",
              minWidth: 0,
            }}
          >
            Watch
          </Button>
        ) : (
          <span style={{ fontSize: "10px", color: "#999" }}>No Trailer</span>
        ),
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
            onClick={async () => {
              const details = await fetchMovieDetails(record.key);
              if (details) {
                setSelectedMovieDetails(details);
                setIsMovieDetailsModalVisible(true);
              }
            }}
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
      dateRange:
        record.fromDate && record.toDate
          ? [dayjs(record.fromDate), dayjs(record.toDate)]
          : null,
      scheduleTimes: record.scheduleTimes
        ? record.scheduleTimes.map((scheduleTime) => {
          const [date, time] = scheduleTime.split(" ");
          return {
            date: dayjs(date),
            time: dayjs(time, "HH:mm"),
          };
        })
        : [],
      // Set initial types using type names
      types: record.types || [],
    };

    // Set the current movie being edited
    setEditingKey(record.key);

    // Set form values
    form.setFieldsValue(editRecord);

    // Reset file states for editing
    setPosterFile(null);
    setBannerFile(null);

    // Set editing state and show modal
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleAddMovie = async (values) => {
    try {
      setUploading(true);

      // Validate required files for new movies
      if (!isEditing && !posterFile) {
        message.error("Please upload a poster image");
        setUploading(false);
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add all form fields as query parameters in the URL
      const queryParams = new URLSearchParams({
        movieNameVn: values.movieNameVn,
        movieNameEnglish: values.movieNameEnglish,
        fromDate: values.dateRange[0].format("YYYY-MM-DD"),
        toDate: values.dateRange[1].format("YYYY-MM-DD"),
        actor: values.actor,
        movieProductionCompany: values.movieProductionCompany,
        director: values.director,
        duration: parseInt(values.duration),
        version: values.version,
        content: values.content,
        cinemaRoomId: values.cinemaRoom,
        trailerUrl: values.trailerUrl || "",

        // Handle type IDs
        typeIds:
          values.types && values.types.length > 0
            ? values.types
              .map((typeName) => {
                const type = movieTypes.find(
                  (t) => t.movieTypeName === typeName
                );
                return type ? type.movieTypeId : null;
              })
              .filter((id) => id !== null)
              .join(",")
            : "1", // Default to first type if none selected

        // Schedule times
        scheduleTimes: values.scheduleTimes
          ? values.scheduleTimes
            .map(
              (scheduleItem) =>
                `${scheduleItem.date.format(
                  "YYYY-MM-DD"
                )}T${scheduleItem.time.format("HH:mm:ss")}`
            )
            .join(",")
          : "",
      });

      // Add files to FormData
      if (posterFile) {
        formData.append("poster", posterFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      console.log("Form Data:", formData);
      console.log("Query Params:", queryParams.toString());

      const token = sessionStorage.getItem("token");
      const url = isEditing
        ? `${apiUrl}/admin/movies/${editingKey}?${queryParams.toString()}`
        : `${apiUrl}/admin/movies/add?${queryParams.toString()}`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error Response:", errorText);
        throw new Error(
          errorText || `Failed to ${isEditing ? "update" : "add"} movie`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      await fetchMovies();

      // Success message with optimized handling
      showSuccessMessage(
        `Movie "${values.movieNameVn}" ${isEditing ? "updated" : "added"
        } successfully!`,
        3
      );

      // Reset modal and form states
      setIsModalVisible(false);
      setIsEditing(false);
      setEditingKey(null);
      setPosterFile(null);
      setBannerFile(null);
      form.resetFields();
    } catch (error) {
      showErrorMessage(
        `Failed to ${isEditing ? "update" : "add"} movie: ${error.message}`,
        3
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (record) => {
    setMovieToDelete(record);
    setDeleteConfirmationVisible(true);
  };

  const confirmDelete = async () => {
    if (movieToDelete) {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${apiUrl}/admin/movies/${movieToDelete.key}`,
          {
            method: "DELETE",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            errorText || `Failed to delete movie with ID ${movieToDelete.key}`
          );
        }

        await fetchMovies();

        // Specific delete success toast with key
        showSuccessMessage(
          `Movie "${movieToDelete.movieNameVn}" deleted successfully`,
          2
        );

        setDeleteConfirmationVisible(false);
        setMovieToDelete(null);
      } catch (error) {
        showErrorMessage(`Failed to delete movie: ${error.message}`, 3);
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
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${apiUrl}/employee/types`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();

      // Map the types using the exact structure from the JSON
      const formattedTypes = result.map((type) => ({
        movieTypeId: type.typeId,
        movieTypeName: type.typeName,
      }));

      setMovieTypes(formattedTypes);
    } catch (error) {
      showErrorMessage(`Failed to fetch movie types: ${error.message}`);
    }
  };

  // Fetch cinema rooms
  const fetchCinemaRooms = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${apiUrl}/admin/cinema-room/list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      setCinemaRooms(result);
    } catch (error) {
      showErrorMessage(`Failed to fetch cinema rooms: ${error.message}`);
    }
  };

  // Fetch movie details by ID
  const fetchMovieDetails = async (movieId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${apiUrl}/admin/movies/details/${movieId}`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();

      // Format the result to match the existing movie structure
      const formattedMovie = {
        movieId: result.movieId,
        movieNameVn: result.movieNameVn,
        movieNameEnglish: result.movieNameEnglish,
        fromDate: result.fromDate,
        toDate: result.toDate,
        actor: result.actor,
        movieProductionCompany: result.movieProductionCompany || "N/A",
        director: result.director,
        duration: result.duration,
        version: result.version,
        content: result.content,
        posterImageUrl: result.posterImageUrl,
        largeImage: result.largeImage,
        cinemaRoom: result.cinemaRoomId,
        trailerUrl: result.trailerUrl,
        types: result.types || [],
      };

      return formattedMovie;
    } catch (error) {
      showErrorMessage(`Failed to fetch movie details: ${error.message}`);
      return null;
    }
  };

  // Modify fetchMovies function to remove sorting
  const fetchMovies = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${apiUrl}/admin/movies/list`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const formattedMovies = result.map((movie) => {
        // Ensure types is always an array
        const movieTypes = Array.isArray(movie.types)
          ? movie.types
          : movie.types
            ? [movie.types]
            : [];

        return {
          key: movie.movieId.toString(),
          movieNameVn: movie.movieNameVn,
          movieNameEnglish: movie.movieNameEnglish,
          fromDate: movie.fromDate,
          toDate: movie.toDate,
          actor: movie.actor,
          movieProductionCompany: movie.movieProductionCompany || "N/A",
          director: movie.director,
          duration:
            movie.duration !== undefined && movie.duration !== null
              ? Number(movie.duration)
              : 0,
          version: movie.version,
          content: movie.content,

          // Ensure image URLs are handled correctly
          posterImageUrl: movie.posterImageUrl || "",
          largeImage: movie.largeImage || "",

          cinemaRoom: movie.cinemaRoomId,
          trailerUrl: movie.trailerUrl,

          // Ensure types is always an array
          types: movieTypes,
        };
      });

      setMovies(formattedMovies);

      // Only show success message when explicitly requested
      if (showSuccessMessage) {
        showSuccessMessage("Movies fetched successfully", 1.5);
      }
    } catch (error) {
      showErrorMessage(`Failed to fetch movies: ${error.message}`, 1.5);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchMovies();
    fetchMovieTypes();
    fetchCinemaRooms();
  }, []);

  // Modify the movies rendering to include search filtering
  const filteredMovies = movies.filter((movie) =>
    searchTerm
      ? movie.movieNameVn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.movieNameEnglish.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="movies-container">
      <div className="movies-header">
        <div className="header-actions">
          <div className="filter-dropdowns">
            <Input
              placeholder="Search Movie"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200, marginRight: 10 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setIsEditing(false);
              setPosterFile(null);
              setBannerFile(null);
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
        dataSource={filteredMovies}
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
          setPosterFile(null);
          setBannerFile(null);
          form.resetFields();
        }}
        footer={null}
        className="movie-modal"
        width={600}
        centered
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
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
            rules={[
              { required: true, message: "Please enter Vietnamese movie name" },
            ]}
          >
            <Input placeholder="Enter Vietnamese movie name" />
          </Form.Item>

          <Form.Item
            name="movieNameEnglish"
            label="Movie Name (English)"
            rules={[
              { required: true, message: "Please enter English movie name" },
            ]}
          >
            <Input placeholder="Enter English movie name" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            style={{ marginBottom: 16 }}
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              placeholder={["From Date", "To Date"]}
            />
          </Form.Item>

          <Form.List
            name="scheduleTimes"
            rules={[
              {
                validator: async (_, scheduleTimes) => {
                  if (!scheduleTimes || scheduleTimes.length === 0) {
                    throw new Error("Please add at least one schedule time");
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "date"]}
                      rules={[{ required: true, message: "Missing date" }]}
                      style={{ width: "45%", marginRight: "10px" }}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        placeholder="Select Date"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "time"]}
                      rules={[{ required: true, message: "Missing time" }]}
                      style={{ width: "45%", marginRight: "10px" }}
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Select Time"
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{
                          fontSize: "20px",
                          color: "#999",
                          marginTop: "10px",
                        }}
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
                    className="add-schedule-btn"
                  >
                    Add Schedule Time
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label="Duration & Version" style={{ marginBottom: 16 }}>
            <Space.Compact block>
              <Form.Item
                name="duration"
                noStyle
                rules={[{ required: true, message: "Please input duration" }]}
              >
                <Input
                  style={{ width: "48%", marginRight: "4%" }}
                  placeholder="Duration (minutes)"
                  type="number"
                />
              </Form.Item>
              <Form.Item
                name="version"
                noStyle
                rules={[{ required: true, message: "Please input version" }]}
              >
                <Input style={{ width: "48%" }} placeholder="Version" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="actor"
            label="Actor"
            rules={[{ required: true, message: "Please enter actor name" }]}
          >
            <Input placeholder="Enter actor name" />
          </Form.Item>

          <Form.Item
            name="movieProductionCompany"
            label="Movie Production Company"
            rules={[
              { required: true, message: "Please enter production company" },
            ]}
          >
            <Input placeholder="Enter production company" />
          </Form.Item>

          <Form.Item
            name="director"
            label="Director"
            rules={[{ required: true, message: "Please enter director name" }]}
          >
            <Input placeholder="Enter director name" />
          </Form.Item>

          <Form.Item
            label="Cinema Room & Movie Types"
            style={{ marginBottom: 16 }}
          >
            <Space.Compact block>
              <Form.Item
                name="cinemaRoom"
                noStyle
                rules={[
                  { required: true, message: "Please select a cinema room" },
                ]}
              >
                <Select
                  placeholder="Select cinema room"
                  style={{ width: "48%", marginRight: "4%" }}
                  options={cinemaRooms.map((room) => ({
                    label: `${room.cinemaRoomName} (${room.seatQuantity} seats)`,
                    value: room.cinemaRoomId,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="types"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please select at least one movie type",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select movie types"
                  style={{ width: "48%" }}
                  options={movieTypes.map((type) => ({
                    label: type.movieTypeName,
                    value: type.movieTypeName,
                  }))}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <Input.TextArea placeholder="Enter movie content" rows={4} />
          </Form.Item>

          <Form.Item name="trailerUrl" label="Trailer URL">
            <Input placeholder="Enter trailer URL" />
          </Form.Item>

          {/* Simplified File Upload Section */}
          <Form.Item
            label="Movie Poster"
            rules={[
              { required: !isEditing, message: "Please upload a poster image" },
            ]}
          >
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

                setPosterFile(file);
                return false; // Prevent automatic upload
              }}
              fileList={posterFile ? [posterFile] : []}
              onRemove={() => setPosterFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Poster Image</Button>
            </Upload>
            {posterFile && (
              <div style={{ marginTop: 8 }}>Selected: {posterFile.name}</div>
            )}
          </Form.Item>

          <Form.Item label="Movie Banner">
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

                setBannerFile(file);
                return false; // Prevent automatic upload
              }}
              fileList={bannerFile ? [bannerFile] : []}
              onRemove={() => setBannerFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Banner Image</Button>
            </Upload>
            {bannerFile && (
              <div style={{ marginTop: 8 }}>Selected: {bannerFile.name}</div>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="submit-btn"
              loading={uploading}
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

      {/* Movie Details Modal */}
      <Modal
        title="Movie Details"
        open={isMovieDetailsModalVisible}
        onCancel={() => {
          setIsMovieDetailsModalVisible(false);
          setSelectedMovieDetails(null);
        }}
        footer={null}
        className="movie-details-modal"
        width={400}
        centered
      >
        {selectedMovieDetails && (
          <div className="movie-details-content">
            <div className="movie-detail-row">
              <div className="movie-detail-label">Movie Name(EN)</div>
              <div className="movie-detail-value">{selectedMovieDetails.movieNameEnglish}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Movie Name(VN)</div>
              <div className="movie-detail-value">{selectedMovieDetails.movieNameVn}</div>
            </div> <div className="movie-detail-row">
              <div className="movie-detail-label">Movie Type</div>
              <div className="movie-detail-value">{selectedMovieDetails.types}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Date Range </div>
              <div className="movie-detail-value">
                {selectedMovieDetails.fromDate || 'N/A'} to {selectedMovieDetails.toDate || 'N/A'}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Duration</div>
              <div className="movie-detail-value">{selectedMovieDetails.duration} mins</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Version</div>
              <div className="movie-detail-value">{selectedMovieDetails.version}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Production Company</div>
              <div className="movie-detail-value">{selectedMovieDetails.movieProductionCompany || 'N/A'}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Director</div>
              <div className="movie-detail-value">{selectedMovieDetails.director}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Actors</div>
              <div className="movie-detail-value">{selectedMovieDetails.actor}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Content</div>
              <div className="movie-detail-value">{selectedMovieDetails.content}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Movie;