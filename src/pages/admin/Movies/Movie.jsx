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
import axios from "../../../constants/axios";
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
  const [isMovieDetailsModalVisible, setIsMovieDetailsModalVisible] =
    useState(false);
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
        const fromDate = record.fromDate || "N/A";
        const toDate = record.toDate || "N/A";

        return (
          <Tooltip title={`From: ${fromDate} - To: ${toDate}`}>
            <div
              style={{
                cursor: "help",
                minWidth: "150px",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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

  const handleEdit = async (record) => {
    // Reset the form
    form.resetFields();

    try {
      // Fetch the complete movie details to ensure we have all the data
      const movieDetails = await fetchMovieDetails(record.key);

      if (!movieDetails) {
        showErrorMessage("Failed to fetch movie details for editing");
        return;
      }

      // Prepare form values using the fetched details
      const editRecord = {
        ...movieDetails,
        dateRange:
          movieDetails.fromDate && movieDetails.toDate
            ? [dayjs(movieDetails.fromDate), dayjs(movieDetails.toDate)]
            : null,
        scheduleTimes: movieDetails.schedules
          ? movieDetails.schedules
              .map((schedule) => {
                // Extensive logging and defensive programming
                console.log("Raw Schedule Input:", schedule);

                // Handle null or undefined schedules
                if (schedule === null || schedule === undefined) {
                  console.warn("Skipping null/undefined schedule");
                  return null;
                }

                try {
                  let processedSchedule;

                  // String format handling
                  if (typeof schedule === "string") {
                    const [date, time] = schedule.split("T");
                    processedSchedule = {
                      date: dayjs(date),
                      time: dayjs(time, "HH:mm:ss"),
                    };
                  }
                  // Object format handling
                  else if (typeof schedule === "object") {
                    // Multiple possible object structures
                    const dateValue =
                      schedule.date ||
                      schedule.scheduleDate ||
                      schedule.datetime;

                    const timeValue =
                      schedule.time ||
                      schedule.scheduleTime ||
                      schedule.datetime;

                    // Validate date and time
                    if (dateValue && timeValue) {
                      processedSchedule = {
                        date: dayjs(dateValue),
                        time: dayjs(timeValue),
                      };
                    } else {
                      console.warn("Invalid schedule object:", schedule);
                      return null;
                    }
                  } else {
                    console.warn("Unrecognized schedule format:", schedule);
                    return null;
                  }

                  // Final validation
                  if (
                    processedSchedule &&
                    dayjs.isDayjs(processedSchedule.date) &&
                    dayjs.isDayjs(processedSchedule.time)
                  ) {
                    return processedSchedule;
                  } else {
                    console.warn(
                      "Invalid processed schedule:",
                      processedSchedule
                    );
                    return null;
                  }
                } catch (error) {
                  console.error("Schedule Processing Error:", {
                    schedule,
                    error: error.message,
                  });
                  return null;
                }
              })
              // Remove any null entries
              .filter(
                (schedule) =>
                  schedule !== null && schedule.date && schedule.time
              )
          : [],
        // Ensure types are mapped correctly to their names
        types: movieDetails.types || [],
        // Explicitly set cinema room
        cinemaRoom: movieDetails.cinemaRoomId,
      };

      // Debug logging with comprehensive information
      console.log("Edit Record Preparation:", {
        record,
        movieDetails,
        editRecord: {
          ...editRecord,
          scheduleTimes: editRecord.scheduleTimes.map((st) => ({
            date: st.date ? st.date.format("YYYY-MM-DD") : "Invalid Date",
            time: st.time ? st.time.format("HH:mm:ss") : "Invalid Time",
          })),
        },
        availableCinemaRooms: cinemaRooms,
      });

      // Set the current movie being edited
      setEditingKey(record.key);

      // Set form values with additional safety check
      if (editRecord.scheduleTimes && editRecord.scheduleTimes.length > 0) {
        form.setFieldsValue(editRecord);
      } else {
        // If no valid schedules, set an empty schedule
        form.setFieldsValue({
          ...editRecord,
          scheduleTimes: [
            {
              date: dayjs(),
              time: dayjs().startOf("hour"),
            },
          ],
        });
      }

      // Reset file states for editing
      setPosterFile(null);
      setBannerFile(null);

      // Set editing state and show modal
      setIsEditing(true);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      showErrorMessage(`Error preparing movie for edit: ${error.message}`);
    }
  };

  const handleAddMovie = async (values) => {
    try {
      setUploading(true);

      // Validate cinema room selection
      if (!values.cinemaRoom) {
        message.error("Please select a cinema room");
        setUploading(false);
        return;
      }

      // Prepare type names (not IDs)
      const types =
        values.types && values.types.length > 0 ? values.types : ["Romantic"]; // Default type if none selected

      // Prepare schedule times with robust formatting
      const scheduleTimes = values.scheduleTimes
        ? values.scheduleTimes
            .map(
              (scheduleItem) =>
                `${scheduleItem.date.format(
                  "YYYY-MM-DD"
                )}T${scheduleItem.time.format("HH:mm:ss")}`
            )
            .join(",")
        : "";

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add files to FormData if they exist
      if (posterFile) {
        formData.append("poster", posterFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      // Prepare query parameters
      const queryParams = {
        cinemaroom: values.cinemaRoom,
      };

      // Prepare request body
      const requestBody = {
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
        trailerUrl: values.trailerUrl || "",
        types: types,
        scheduleTimes: scheduleTimes,
      };

      // Append request body to FormData
      Object.keys(requestBody).forEach((key) => {
        formData.append(key, requestBody[key]);
      });

      // Debug logging
      console.log("Movie Submission Details:", {
        isEditing,
        editingKey,
        queryParams,
        requestBody,
        files: {
          posterFile: posterFile ? posterFile.name : "No poster",
          bannerFile: bannerFile ? bannerFile.name : "No banner",
        },
      });

      // Determine URL based on whether we're editing or adding
      const url = isEditing
        ? `/admin/movies/${editingKey}`
        : `/admin/movies/add`;

      // Send request
      // eslint-disable-next-line no-unused-vars
      const response = await axios({
        method: isEditing ? "put" : "post",
        url: url,
        data: formData,
        params: queryParams,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh movies list
      await fetchMovies();

      // Success message
      showSuccessMessage(
        `Movie "${values.movieNameVn}" ${
          isEditing ? "updated" : "added"
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
      console.error("Full submission error:", error);
      showErrorMessage(
        `Failed to ${isEditing ? "update" : "add"} movie: ${
          error.response?.data?.message || error.message
        }`,
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
        await axios.delete(`/admin/movies/${movieToDelete.key}`);

        await fetchMovies();

        // Specific delete success toast with key
        showSuccessMessage(
          `Movie "${movieToDelete.movieNameVn}" deleted successfully`,
          2
        );

        setDeleteConfirmationVisible(false);
        setMovieToDelete(null);
      } catch (error) {
        showErrorMessage(
          `Failed to delete movie: ${
            error.response?.data?.message || error.message
          }`,
          3
        );
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
      const response = await axios.get("/employee/types");
      const formattedTypes = response.data.map((type) => ({
        movieTypeId: type.typeId,
        movieTypeName: type.typeName,
      }));
      setMovieTypes(formattedTypes);
    } catch (error) {
      showErrorMessage(
        `Failed to fetch movie types: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Fetch cinema rooms
  const fetchCinemaRooms = async () => {
    try {
      const response = await axios.get("/admin/cinema-room/list");
      setCinemaRooms(response.data);
    } catch (error) {
      showErrorMessage(
        `Failed to fetch cinema rooms: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Update fetchMovieDetails to match the backend response structure
  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await axios.get(`/admin/movies/details/${movieId}`);
      const result = response.data;

      // Extensive logging of raw data
      console.log("Raw Movie Details:", {
        movieId,
        rawResult: result,
      });

      const formattedMovie = {
        ...result,
        // Ensure compatibility with form fields
        cinemaRoom: result.cinemaRoomId,
        dateRange:
          result.fromDate && result.toDate
            ? [dayjs(result.fromDate), dayjs(result.toDate)]
            : null,

        // Robust handling of movie types
        types: result.types
          ? Array.isArray(result.types)
            ? result.types
            : [result.types]
          : [],

        // Enhanced schedule handling with extensive error checking
        scheduleTimes: result.schedules
          ? result.schedules.reduce((acc, schedule) => {
              try {
                // Log each schedule for debugging
                console.log("Processing schedule:", schedule);

                let processedSchedule;
                // Handle string format
                if (typeof schedule === "string") {
                  const [date, time] = schedule.split("T");
                  processedSchedule = {
                    date: dayjs(date),
                    time: dayjs(time, "HH:mm:ss"),
                  };
                }

                // Handle object format
                if (schedule && typeof schedule === "object") {
                  // Check for different possible object structures
                  const dateValue =
                    schedule.date || schedule.scheduleDate || schedule.datetime;
                  const timeValue =
                    schedule.time || schedule.scheduleTime || schedule.datetime;

                  if (dateValue && timeValue) {
                    // eslint-disable-next-line no-unused-vars
                    processedSchedule = {
                      date: dayjs(dateValue),
                      time: dayjs(timeValue),
                    };
                  }
                }

                // If no valid format found
                console.warn("Unprocessable schedule format:", schedule);
                return acc;
              } catch (error) {
                console.error("Error processing schedule:", {
                  schedule,
                  error: error.message,
                });
                return acc;
              }
            }, [])
          : [],
      };

      // Detailed debug logging
      console.log("Formatted Movie Details for Editing:", {
        originalSchedules: result.schedules,
        formattedScheduleTimes: formattedMovie.scheduleTimes,
      });

      return formattedMovie;
    } catch (error) {
      console.error("Full error in fetchMovieDetails:", error);
      showErrorMessage(
        `Failed to fetch movie details: ${
          error.response?.data?.message || error.message
        }`
      );
      return null;
    }
  };

  // Modify fetchMovies function to remove sorting
  const fetchMovies = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const response = await axios.get("/admin/movies/list");
      const result = response.data;

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
      showErrorMessage(
        `Failed to fetch movies: ${
          error.response?.data?.message || error.message
        }`,
        1.5
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchMovies();
    fetchMovieTypes();
    fetchCinemaRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="ant-table-movie"
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
            initialValue={[{ date: dayjs(), time: dayjs().startOf('hour') }]}
            rules={[
              {
                validator: async (_, scheduleTimes) => {
                  // Ensure scheduleTimes is an array and not empty
                  if (!Array.isArray(scheduleTimes) || scheduleTimes.length === 0) {
                    if (!isEditing) {
                      throw new Error("Please add at least one schedule time");
                    }
                    return;
                  }

                  // Validate each schedule time
                  for (const schedule of scheduleTimes) {
                    if (!schedule || !schedule.date || !schedule.time) {
                      throw new Error("Invalid schedule: date and time are required");
                    }
                  }

                  // Additional validation for unique schedule times
                  const uniqueSchedules = new Set(
                    scheduleTimes
                      .map((schedule) => {
                        // Safely handle potential undefined values
                        if (schedule && schedule.date && schedule.time) {
                          return `${schedule.date.format("YYYY-MM-DD")}T${schedule.time.format("HH:mm")}`;
                        }
                        return null;
                      })
                      .filter(Boolean)
                  );

                  if (uniqueSchedules.size !== scheduleTimes.filter(schedule => schedule && schedule.date && schedule.time).length) {
                    throw new Error("Duplicate schedule times are not allowed");
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
                      rules={[
                        {
                          required: true,
                          message: "Missing date",
                          validator: async (_, value) => {
                            if (!value || !dayjs.isDayjs(value)) {
                              throw new Error("Please select a valid date");
                            }
                          },
                        },
                      ]}
                      style={{ width: "45%", marginRight: "10px" }}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        placeholder="Select Date"
                        disabledDate={(current) => {
                          // Optional: Disable past dates
                          return current && current < dayjs().startOf("day");
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "time"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing time",
                          validator: async (_, value) => {
                            if (!value || !dayjs.isDayjs(value)) {
                              throw new Error("Please select a valid time");
                            }
                          },
                        },
                      ]}
                      style={{ width: "45%", marginRight: "10px" }}
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Select Time"
                        minuteStep={15} // Optional: Restrict to 15-minute intervals
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
                    onClick={() => {
                      // Ensure a valid date and time are added
                      add({ 
                        date: dayjs(), 
                        time: dayjs().startOf('hour') 
                      }, 0);
                    }}
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
                  {
                    required: true,
                    message: "Please select a cinema room",
                  },
                ]}
              >
                <Select
                  placeholder="Select cinema room"
                  style={{ width: "48%", marginRight: "4%" }}
                  options={cinemaRooms.map((room) => ({
                    label: `${room.cinemaRoomName} (${room.seatQuantity} seats)`,
                    value: room.cinemaRoomId, // Explicitly use cinemaRoomId
                  }))}
                  // Remove the valueKey prop
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
              {
                required: !isEditing,
                message: "Please upload a poster image",
              },
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
              <Button icon={<UploadOutlined />}>
                {isEditing ? "Replace Poster Image" : "Upload Poster Image"}
              </Button>
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
              <Button icon={<UploadOutlined />}>
                {isEditing ? "Replace Banner Image" : "Upload Banner Image"}
              </Button>
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
              <div className="movie-detail-value">
                {selectedMovieDetails.movieNameEnglish}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Movie Name(VN)</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.movieNameVn}
              </div>
            </div>{" "}
            <div className="movie-detail-row">
              <div className="movie-detail-label">Movie Type</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.types}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Date Range </div>
              <div className="movie-detail-value">
                {selectedMovieDetails.fromDate || "N/A"} to{" "}
                {selectedMovieDetails.toDate || "N/A"}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Duration</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.duration} mins
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Cinema Room</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.cinemaRoomName}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Version</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.version}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Production Company</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.movieProductionCompany || "N/A"}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Director</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.director}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Actors</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.actor}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Content</div>
              <div className="movie-detail-value">
                {selectedMovieDetails.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Movie;
