"use client"

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
  CalendarOutlined, // Import CalendarOutlined for the new button
} from "@ant-design/icons"
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
} from "antd"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import axios from "../../../constants/axios"
import "./Movie.scss"

// Custom Dropdown Component
const MultiSelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : []
  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleCheckboxChange = (checkedValues) => {
    // Ensure onChange is called with an array
    if (typeof onChange === "function") {
      onChange(checkedValues || [])
    }
  }
  const handleRemoveItem = (itemToRemove) => {
    const newValue = safeValue.filter((item) => item !== itemToRemove)
    if (typeof onChange === "function") {
      onChange(newValue)
    }
  }
  return (
    <div className="dropdown-multiple-select">
      <div className={`dropdown-trigger ${isOpen ? "open" : ""}`} onClick={handleToggle}>
        {safeValue.length > 0 ? (
          <div className="selected-items">
            {safeValue.map((item) => (
              <span key={item} className="selected-item">
                {options.find((opt) => opt.value === item)?.label || item}
                <CloseOutlined
                  style={{ marginLeft: 4, fontSize: 10 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveItem(item)
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
  )
}

const Movie = () => {
  const [movies, setMovies] = useState([])
  const [movieTypes, setMovieTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [editingKey, setEditingKey] = useState(null)
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false)
  const [movieToDelete, setMovieToDelete] = useState(null)
  // State for cinema rooms
  const [cinemaRooms, setCinemaRooms] = useState([])
  // State for file upload - simplified
  const [posterFile, setPosterFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  // Add state for movie details modal
  const [isMovieDetailsModalVisible, setIsMovieDetailsModalVisible] = useState(false)
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null)

  // New states for viewing schedules
  const [isViewSchedulesModalVisible, setIsViewSchedulesModalVisible] = useState(false)
  const [selectedMovieSchedules, setSelectedMovieSchedules] = useState([])
  const [selectedMovieForScheduleView, setSelectedMovieForScheduleView] = useState(null)

  // Add a new method to add movie schedules
  const handleAddMovieSchedule = async (movieId, scheduleTime) => {
    try {
      // Validate input
      if (!movieId || !scheduleTime) {
        showErrorMessage("Movie ID and Schedule Time are required")
        return false
      }
      // Ensure movieId is a number and scheduleTime is a valid dayjs object
      const parsedMovieId = Number.parseInt(movieId, 10)
      if (isNaN(parsedMovieId)) {
        showErrorMessage("Invalid Movie ID")
        return false
      }
      if (!dayjs.isDayjs(scheduleTime)) {
        showErrorMessage("Invalid Schedule Time")
        return false
      }
      // Find the movie details to get date range
      const movieDetails = movies.find((movie) => movie.key === movieId)
      if (!movieDetails) {
        showErrorMessage("Movie details not found")
        return false
      }
      // Validate schedule time is within movie's date range
      const scheduleDate = dayjs(scheduleTime)
      const fromDate = dayjs(movieDetails.fromDate)
      const toDate = dayjs(movieDetails.toDate)
      if (scheduleDate.isBefore(fromDate) || scheduleDate.isAfter(toDate)) {
        showErrorMessage(
          `Schedule time must be between ${fromDate.format("YYYY-MM-DD")} and ${toDate.format("YYYY-MM-DD")}`,
          4,
        )
        return false
      }
      // Prepare schedule data - exactly matching the request format
      const scheduleData = {
        movieId: parsedMovieId,
        scheduleTime: scheduleTime.format("YYYY-MM-DD HH:mm"),
      }
      // Enhanced logging for debugging
      console.log("Schedule Creation Request:", {
        url: "/admin/movie-schedules",
        data: scheduleData,
        movieId: parsedMovieId,
        scheduleTime: scheduleTime.format("YYYY-MM-DD HH:mm"),
      })
      // Send request to add schedule
      const response = await axios.post("/admin/movie-schedules", scheduleData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      // Enhanced success message with schedule details
      if (response.data && response.data.result) {
        const scheduleResult = response.data.result
        showSuccessMessage("Schedule added successfully", 2)
      }
      // Close the modal
      setIsAddScheduleModalVisible(false)
      setSelectedMovieForSchedule(null)
      setScheduleDateTime(null)
      // Optionally refresh movie details or schedules
      await fetchMovies()
      return true
    } catch (error) {
      console.error("Error adding movie schedule:", error)
      // Log full error response for 400 Bad Request
      if (error.response) {
        console.error("Full Error Response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
        // Additional detailed logging
        console.error("Detailed Error Breakdown:", {
          errorCode: error.response.data?.code,
          errorMessage: error.response.data?.message,
          errorDetails: error.response.data?.details,
        })
      }
      // More specific error handling
      if (error.response && error.response.data) {
        const errorCode = error.response.data.code
        const errorMessage = error.response.data.message
        switch (errorCode) {
          case 1908:
            showErrorMessage("Schedule time is out of the movie's valid date range", 4)
            break
          default:
            showErrorMessage(`Failed to add schedule: ${errorMessage || error.message}`, 3)
        }
      } else {
        showErrorMessage(`Failed to add schedule: ${error.message}`, 3)
      }
      return false
    }
  }
  // Add a modal for adding schedules
  const [isAddScheduleModalVisible, setIsAddScheduleModalVisible] = useState(false)
  const [selectedMovieForSchedule, setSelectedMovieForSchedule] = useState(null)
  const [scheduleDateTime, setScheduleDateTime] = useState(null)
  // Optimize message handling with debounce and key management
  const showSuccessMessage = React.useCallback((content, duration = 2) => {
    message.success({
      content,
      duration,
      key: "movie-operation-success",
    })
  }, [])
  const showErrorMessage = React.useCallback((content, duration = 3) => {
    message.error({
      content,
      duration,
      key: "movie-operation-error",
    })
  }, [])
  const createActionButton = (icon, className, onClick, children = null) => (
    <Button type="link" icon={icon} className={className} onClick={onClick}>
      {children}
    </Button>
  )

  // New function to fetch movie schedules
  const fetchMovieSchedules = async (movieId) => {
    try {
      console.log(`Fetching schedules for movie ID: ${movieId}`) // Added log
      const response = await axios.get(`/admin/movie-schedules/movie/${movieId}`)
      console.log("Raw schedules API response:", response.data) // Added log
      // Extract the 'result' array from the response
      return response.data.result || []
    } catch (error) {
      console.error("Error fetching movie schedules:", error)
      if (error.response) {
        console.error("Error response data:", error.response.data) // Added log
        console.error("Error response status:", error.response.status) // Added log
      }
      showErrorMessage(`Failed to fetch movie schedules: ${error.response?.data?.message || error.message}`)
      return []
    }
  }

  const columns = [
    
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
        const fromDate = record.fromDate || "N/A"
        const toDate = record.toDate || "N/A"
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
        )
      },
    },
    {
      title: "Movie Type",
      key: "types",
      render: (_, record) => {
        let typeDisplay = "No Type";
        if (Array.isArray(record.types) && record.types.length > 0) {
          typeDisplay = record.types[0];
          if (record.types.length > 1) {
            typeDisplay += ",...";
          }
        } else if (record.types) {
          typeDisplay = String(record.types);
        }
        return (
          <Tooltip title={Array.isArray(record.types) ? record.types.join(", ") : typeDisplay}>
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
            src={posterImageUrl || "/placeholder.svg"}
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
            src={largeImage || "/placeholder.svg"}
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
          {createActionButton(<EyeOutlined />, "view-btn", async () => {
            const details = await fetchMovieDetails(record.key)
            if (details) {
              setSelectedMovieDetails(details)
              setIsMovieDetailsModalVisible(true)
            }
          })}
          {createActionButton(<EditOutlined />, "edit-btn", () => handleEdit(record))}
          {createActionButton(<DeleteOutlined />, "delete-btn", () => handleDeleteClick(record))}
          {createActionButton(<PlusCircleOutlined />, "add-schedule-btn-icon", () => {
            setSelectedMovieForSchedule(record.key)
            setIsAddScheduleModalVisible(true)
          })}
          {/* New button to view schedules */}
          {createActionButton(<CalendarOutlined />, "view-schedules-btn", async () => {
            const schedules = await fetchMovieSchedules(record.key)
            setSelectedMovieSchedules(schedules)
            setSelectedMovieForScheduleView(record) // Store movie details for the modal title
            setIsViewSchedulesModalVisible(true)
          })}
        </div>
      ),
    },
  ]
  const handleEdit = async (record) => {
    // Reset the form
    form.resetFields()
    try {
      // Fetch the complete movie details to ensure we have all the data
      const movieDetails = await fetchMovieDetails(record.key)
      if (!movieDetails) {
        showErrorMessage("Failed to fetch movie details for editing")
        return
      }
      // Validate movieDetails to prevent undefined errors
      if (typeof movieDetails !== "object") {
        showErrorMessage("Invalid movie details received")
        return
      }
      // Prepare form values using the fetched details
      const editRecord = {
        movieNameVn: movieDetails.movieNameVn || "",
        movieNameEnglish: movieDetails.movieNameEnglish || "",
        dateRange:
          movieDetails.fromDate && movieDetails.toDate
            ? [dayjs(movieDetails.fromDate), dayjs(movieDetails.toDate)]
            : null,
        actor: movieDetails.actor || "",
        director: movieDetails.director || "",
        duration: movieDetails.duration || 0,
        version: movieDetails.version || "",
        content: movieDetails.content || "",
        trailerUrl: movieDetails.trailerUrl || "",
        types: Array.isArray(movieDetails.types) ? movieDetails.types : [],
        cinemaRoom: movieDetails.cinemaRoomId || null,
        movieProductionCompany: movieDetails.movieProductionCompany || null,
      }
      // Debug logging with comprehensive information
      console.log("Edit Record Preparation:", {
        record,
        movieDetails,
        editRecord,
      })
      // Set the current movie being edited
      setEditingKey(record.key)
      // Set form values
      form.setFieldsValue(editRecord)
      // Reset file states for editing
      setPosterFile(null)
      setBannerFile(null)
      // Set editing state and show modal
      setIsEditing(true)
      setIsModalVisible(true)
    } catch (error) {
      console.error("Error in handleEdit:", error)
      showErrorMessage(`Error preparing movie for edit: ${error.message}`)
    }
  }
  const handleAddMovie = async (values) => {
    try {
      setUploading(true)
      // Validate cinema room selection
      if (!values.cinemaRoom) {
        message.error("Please select a cinema room")
        setUploading(false)
        return
      }
      // Prepare type names (not IDs)
      const types = values.types && values.types.length > 0 ? values.types : ["Romantic"] // Default type if none selected
      // Prepare schedule times
      let scheduleTimes = ""
      if (!isEditing) {
        // For new movies, use the added schedule times
        scheduleTimes = values.scheduleTimes
          ? values.scheduleTimes
              .map(
                (scheduleItem) => `${scheduleItem.date.format("YYYY-MM-DD")}T${scheduleItem.time.format("HH:mm:ss")}`,
              )
              .join(",")
          : ""
      }
      // Create FormData for multipart upload
      const formData = new FormData()
      // Add files to FormData if they exist
      if (posterFile) {
        formData.append("poster", posterFile)
      }
      if (bannerFile) {
        formData.append("banner", bannerFile)
      }
      // Prepare query parameters
      const queryParams = {
        cinemaRoomId: values.cinemaRoom,
        // Convert movie type names to IDs for the API
        typeIds: movieTypes
          .filter((type) => values.types.includes(type.movieTypeName))
          .map((type) => type.movieTypeId)
          .join(","),
      }
      // Debug logging for type conversion
      console.log("Movie Type Conversion:", {
        selectedTypes: values.types,
        movieTypes: movieTypes,
        convertedTypeIds: movieTypes
          .filter((type) => values.types.includes(type.movieTypeName))
          .map((type) => ({
            typeName: type.movieTypeName,
            typeId: type.movieTypeId,
          })),
      })
      // Prepare request body
      const requestBody = {
        movieNameVn: values.movieNameVn,
        movieNameEnglish: values.movieNameEnglish,
        fromDate: values.dateRange[0].format("YYYY-MM-DD"),
        toDate: values.dateRange[1].format("YYYY-MM-DD"),
        actor: values.actor,
        movieProductionCompany: values.movieProductionCompany,
        director: values.director,
        duration: Number.parseInt(values.duration),
        version: values.version,
        content: values.content,
        trailerUrl: values.trailerUrl || "",
        types: values.types,
        scheduleTimes: scheduleTimes,
      }
      // If editing, fetch existing movie details to preserve schedules
      if (isEditing && editingKey) {
        try {
          const existingMovieDetails = await fetchMovieDetails(editingKey)
          // If existing movie has schedules, use them
          if (existingMovieDetails && existingMovieDetails.schedules) {
            requestBody.scheduleTimes = existingMovieDetails.schedules
              .map((schedule) =>
                typeof schedule === "string"
                  ? schedule
                  : `${schedule.date || schedule.scheduleDate}T${schedule.time || schedule.scheduleTime}`,
              )
              .join(",")
          }
        } catch (fetchError) {
          console.error("Error fetching existing movie details:", fetchError)
          // Continue with the current request even if fetching existing details fails
        }
      }
      // Append request body to FormData
      Object.keys(requestBody).forEach((key) => {
        formData.append(key, requestBody[key])
      })
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
      })
      // Determine URL based on whether we're editing or adding
      const url = isEditing ? `/admin/movies/${editingKey}` : `/admin/movies/add`
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
      })
      // Refresh movies list
      await fetchMovies()
      // Success message
      showSuccessMessage(`Movie "${values.movieNameVn}" ${isEditing ? "updated" : "added"} successfully!`, 3)
      // Reset modal and form states
      setIsModalVisible(false)
      setIsEditing(false)
      setEditingKey(null)
      setPosterFile(null)
      setBannerFile(null)
      form.resetFields()
    } catch (error) {
      console.error("Full submission error:", error)
      showErrorMessage(
        `Failed to ${isEditing ? "update" : "add"} movie: ${error.response?.data?.message || error.message}`,
        3,
      )
    } finally {
      setUploading(false)
    }
  }
  const handleDeleteClick = (record) => {
    setMovieToDelete(record)
    setDeleteConfirmationVisible(true)
  }
  const confirmDelete = async () => {
    if (movieToDelete) {
      try {
        await axios.delete(`/admin/movies/${movieToDelete.key}`)
        await fetchMovies()
        // Specific delete success toast with key
        showSuccessMessage(`Movie "${movieToDelete.movieNameVn}" deleted successfully`, 2)
        setDeleteConfirmationVisible(false)
        setMovieToDelete(null)
      } catch (error) {
        showErrorMessage(`Failed to delete movie: ${error.response?.data?.message || error.message}`, 3)
      }
    }
  }
  const cancelDelete = () => {
    setDeleteConfirmationVisible(false)
    setMovieToDelete(null)
  }
  // Fetch movie types
  const fetchMovieTypes = async () => {
    try {
      const response = await axios.get("/employee/types")
      const formattedTypes = response.data.map((type) => ({
        movieTypeId: type.typeId,
        movieTypeName: type.typeName,
      }))
      setMovieTypes(formattedTypes)
    } catch (error) {
      showErrorMessage(`Failed to fetch movie types: ${error.response?.data?.message || error.message}`)
    }
  }
  // Fetch cinema rooms
  const fetchCinemaRooms = async () => {
    try {
      const response = await axios.get("/admin/cinema-room/list")
      setCinemaRooms(response.data)
    } catch (error) {
      showErrorMessage(`Failed to fetch cinema rooms: ${error.response?.data?.message || error.message}`)
    }
  }
  // Update fetchMovieDetails to match the backend response structure
  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await axios.get(`/admin/movies/details/${movieId}`)
      const result = response.data
      // Extensive logging of raw data
      console.log("Raw Movie Details:", {
        movieId,
        rawResult: result,
      })
      const formattedMovie = {
        ...result,
        // Ensure compatibility with form fields
        cinemaRoom: result.cinemaRoomId,
        dateRange: result.fromDate && result.toDate ? [dayjs(result.fromDate), dayjs(result.toDate)] : null,
        // Robust handling of movie types
        types: result.types ? (Array.isArray(result.types) ? result.types : [result.types]) : [],
        // Enhanced schedule handling with extensive error checking
        scheduleTimes: result.schedules
          ? result.schedules.reduce((acc, schedule) => {
              try {
                // Log each schedule for debugging
                console.log("Processing schedule:", schedule)
                let processedSchedule
                // Handle string format
                if (typeof schedule === "string") {
                  const [date, time] = schedule.split("T")
                  processedSchedule = {
                    date: dayjs(date),
                    time: dayjs(time, "HH:mm:ss"),
                  }
                }
                // Handle object format
                if (schedule && typeof schedule === "object") {
                  // Check for different possible object structures
                  const dateValue = schedule.date || schedule.scheduleDate || schedule.datetime
                  const timeValue = schedule.time || schedule.scheduleTime || schedule.datetime
                  if (dateValue && timeValue) {
                    // eslint-disable-next-line no-unused-vars
                    processedSchedule = {
                      date: dayjs(dateValue),
                      time: dayjs(timeValue),
                    }
                  }
                }
                // If no valid format found
                console.warn("Unprocessable schedule format:", schedule)
                return acc
              } catch (error) {
                console.error("Error processing schedule:", {
                  schedule,
                  error: error.message,
                })
                return acc
              }
            }, [])
          : [],
      }
      // Detailed debug logging
      console.log("Formatted Movie Details for Editing:", {
        originalSchedules: result.schedules,
        formattedScheduleTimes: formattedMovie.scheduleTimes,
      })
      return formattedMovie
    } catch (error) {
      console.error("Full error in fetchMovieDetails:", error)
      showErrorMessage(`Failed to fetch movie details: ${error.response?.data?.message || error.message}`)
      return null
    }
  }
  // Modify fetchMovies function to remove sorting
  const fetchMovies = async (showSuccessMessage = false) => {
    setLoading(true)
    try {
      const response = await axios.get("/admin/movies/list")
      const result = response.data
      const formattedMovies = result.map((movie) => {
        // Ensure types is always an array
        const movieTypes = Array.isArray(movie.types) ? movie.types : movie.types ? [movie.types] : []
        return {
          key: movie.movieId.toString(),
          movieNameVn: movie.movieNameVn,
          movieNameEnglish: movie.movieNameEnglish,
          fromDate: movie.fromDate,
          toDate: movie.toDate,
          actor: movie.actor,
          movieProductionCompany: movie.movieProductionCompany || "N/A",
          director: movie.director,
          duration: movie.duration !== undefined && movie.duration !== null ? Number(movie.duration) : 0,
          version: movie.version,
          content: movie.content,
          // Ensure image URLs are handled correctly
          posterImageUrl: movie.posterImageUrl || "",
          largeImage: movie.largeImage || "",
          cinemaRoom: movie.cinemaRoomId,
          trailerUrl: movie.trailerUrl,
          // Ensure types is always an array
          types: movieTypes,
        }
      })
      setMovies(formattedMovies)
      // Only show success message when explicitly requested
      if (showSuccessMessage) {
        showSuccessMessage("Movies fetched successfully", 1.5)
      }
    } catch (error) {
      showErrorMessage(`Failed to fetch movies: ${error.response?.data?.message || error.message}`, 1.5)
    } finally {
      setLoading(false)
    }
  }
  // Fetch initial data on component mount
  useEffect(() => {
    fetchMovies()
    fetchMovieTypes()
    fetchCinemaRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Modify the movies rendering to include search filtering
  const filteredMovies = movies.filter((movie) =>
    searchTerm
      ? movie.movieNameVn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.movieNameEnglish.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  )
  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-movie ${type}-btn`}>
      {text}
    </Button>
  )
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
              setIsModalVisible(true)
              setIsEditing(false)
              setPosterFile(null)
              setBannerFile(null)
              form.resetFields()
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
        locale={{
          emptyText: "No movies found",
        }}
       pagination={{
          pageSize: 12,
          className: "pagination-btn-movie",
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
              if (type === "prev") return createPaginationButton("prev", "Previous");
              if (type === "next") return createPaginationButton("next", "Next");
            return originalElement;
          },
        }}
      />
      <Modal
        title={isEditing ? "Edit Movie" : "Add New Movie"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setIsEditing(false)
          setEditingKey(null)
          setPosterFile(null)
          setBannerFile(null)
          form.resetFields()
        }}
        footer={null}
        className="movie-modal"
        width={600}
        centered
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddMovie} className="movie-form">
          <Form.Item
            name="movieNameVn"
            label="Movie Name (Vietnamese)"
            rules={[{ required: true, message: "Please enter Vietnamese movie name" }]}
          >
            <Input placeholder="Enter Vietnamese movie name" />
          </Form.Item>
          <Form.Item
            name="movieNameEnglish"
            label="Movie Name (English)"
            rules={[{ required: true, message: "Please enter English movie name" }]}
          >
            <Input placeholder="Enter English movie name" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Date Range"
            style={{ marginBottom: 16 }}
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} placeholder={["From Date", "To Date"]} />
          </Form.Item>
          {!isEditing && (
            <Form.List
              name="scheduleTimes"
              initialValue={[{ date: dayjs(), time: dayjs().startOf("hour") }]}
              rules={[
                {
                  validator: async (_, scheduleTimes) => {
                    // Ensure scheduleTimes is an array and not empty
                    if (!Array.isArray(scheduleTimes) || scheduleTimes.length === 0) {
                      throw new Error("Please add at least one schedule time")
                    }
                    // Validate each schedule time
                    for (const schedule of scheduleTimes) {
                      if (!schedule || !schedule.date || !schedule.time) {
                        throw new Error("Invalid schedule: date and time are required")
                      }
                    }
                    // Additional validation for unique schedule times
                    const uniqueSchedules = new Set(
                      scheduleTimes
                        .map((schedule) => {
                          // Safely handle potential undefined values
                          if (schedule && schedule.date && schedule.time) {
                            return `${schedule.date.format("YYYY-MM-DD")}T${schedule.time.format("HH:mm")}`
                          }
                          return null
                        })
                        .filter(Boolean),
                    )
                    if (
                      uniqueSchedules.size !==
                      scheduleTimes.filter((schedule) => schedule && schedule.date && schedule.time).length
                    ) {
                      throw new Error("Duplicate schedule times are not allowed")
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, "date"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing date",
                            validator: async (_, value) => {
                              if (!value || !dayjs.isDayjs(value)) {
                                throw new Error("Please select a valid date")
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
                            return current && current < dayjs().startOf("day")
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
                                throw new Error("Please select a valid time")
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
                        add(
                          {
                            date: dayjs(),
                            time: dayjs().startOf("hour"),
                          },
                          0,
                        )
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
          )}
          <Form.Item label="Duration & Version" style={{ marginBottom: 16 }}>
            <Space.Compact block>
              <Form.Item name="duration" noStyle rules={[{ required: true, message: "Please input duration" }]}>
                <Input style={{ width: "48%", marginRight: "4%" }} placeholder="Duration (minutes)" type="number" />
              </Form.Item>
              <Form.Item name="version" noStyle rules={[{ required: true, message: "Please input version" }]}>
                <Input style={{ width: "48%" }} placeholder="Version" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="actor" label="Actor" rules={[{ required: true, message: "Please enter actor name" }]}>
            <Input placeholder="Enter actor name" />
          </Form.Item>
          <Form.Item
            name="movieProductionCompany"
            label="Movie Production Company"
            rules={[{ required: true, message: "Please enter production company" }]}
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
          <Form.Item label="Cinema Room & Movie Types" style={{ marginBottom: 16 }}>
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
          <Form.Item name="content" label="Content" rules={[{ required: true, message: "Please enter content" }]}>
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
                const isImage = file.type.startsWith("image/")
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isImage) {
                  message.error("You can only upload image files!")
                  return false
                }
                if (!isLt2M) {
                  message.error("Image must be smaller than 2MB!")
                  return false
                }
                setPosterFile(file)
                return false // Prevent automatic upload
              }}
              fileList={posterFile ? [posterFile] : []}
              onRemove={() => setPosterFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>{isEditing ? "Replace Poster Image" : "Upload Poster Image"}</Button>
            </Upload>
            {posterFile && <div style={{ marginTop: 8 }}>Selected: {posterFile.name}</div>}
          </Form.Item>
          <Form.Item label="Movie Banner">
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/")
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isImage) {
                  message.error("You can only upload image files!")
                  return false
                }
                if (!isLt2M) {
                  message.error("Image must be smaller than 2MB!")
                  return false
                }
                setBannerFile(file)
                return false // Prevent automatic upload
              }}
              fileList={bannerFile ? [bannerFile] : []}
              onRemove={() => setBannerFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>{isEditing ? "Replace Banner Image" : "Upload Banner Image"}</Button>
            </Upload>
            {bannerFile && <div style={{ marginTop: 8 }}>Selected: {bannerFile.name}</div>}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className="submit-btn" loading={uploading}>
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
            <Button type="primary" danger onClick={confirmDelete} className="confirm-delete-btn">
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
          setIsMovieDetailsModalVisible(false)
          setSelectedMovieDetails(null)
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
            </div>{" "}
            <div className="movie-detail-row">
              <div className="movie-detail-label">Movie Type</div>
              <div className="movie-detail-value">
                {Array.isArray(selectedMovieDetails.types)
                  ? selectedMovieDetails.types.join(", ")
                  : selectedMovieDetails.types}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Date Range </div>
              <div className="movie-detail-value">
                {selectedMovieDetails.fromDate || "N/A"} to {selectedMovieDetails.toDate || "N/A"}
              </div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Duration</div>
              <div className="movie-detail-value">{selectedMovieDetails.duration} mins</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Cinema Room</div>
              <div className="movie-detail-value">{selectedMovieDetails.cinemaRoomName}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Version</div>
              <div className="movie-detail-value">{selectedMovieDetails.version}</div>
            </div>
            <div className="movie-detail-row">
              <div className="movie-detail-label">Production Company</div>
              <div className="movie-detail-value">{selectedMovieDetails.movieProductionCompany || "N/A"}</div>
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
      {/* Add Schedule Modal */}
      <Modal
        title="Add Schedule"
        open={isAddScheduleModalVisible}
        onCancel={() => {
          setIsAddScheduleModalVisible(false)
          setSelectedMovieForSchedule(null)
          setScheduleDateTime(null)
        }}
        footer={null}
        className="movie-modal add-schedule-modal"
        width={400}
        centered
      >
        <Form
          layout="vertical"
          onFinish={() => handleAddMovieSchedule(selectedMovieForSchedule, scheduleDateTime)}
          className="movie-form add-schedule-form"
        >
          <Form.Item label="Movie" style={{ marginBottom: 16 }}>
            <Input
              value={
                selectedMovieForSchedule ? movies.find((m) => m.key === selectedMovieForSchedule)?.movieNameVn : ""
              }
              disabled
            />
          </Form.Item>
          <Form.Item
            label="Schedule Date & Time"
            style={{ marginBottom: 16 }}
            rules={[
              {
                required: true,
                message: "Please select a schedule date and time",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="Select Schedule Date & Time"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day")
              }}
              onChange={(date) => setScheduleDateTime(date)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className="submit-btn" loading={uploading}>
              Add Schedule
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* New: View Schedules Modal */}
      <Modal
        title={`${selectedMovieForScheduleView?.movieNameVn || "Movie"}`}
        open={isViewSchedulesModalVisible}
        onCancel={() => {
          setIsViewSchedulesModalVisible(false)
          setSelectedMovieSchedules([])
          setSelectedMovieForScheduleView(null)
        }}
        footer={null}
        className="movie-modal view-schedules-modal"
        width={600}
        centered
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        {selectedMovieSchedules.length > 0 ? (
          <Table
            dataSource={selectedMovieSchedules.map((schedule) => {
              console.log("Processing schedule for table:", schedule) // Added log
              return {
                key: schedule.id, // Use schedule.id for the key
                scheduleTime: schedule.scheduleTime,
              }
            })}
            columns={[
              {
                title: "Schedule Time",
                dataIndex: "scheduleTime",
                key: "scheduleTime",
                render: (text) => text.replace("T", " "), // Format the schedule time
              },
            ]}
            pagination={false} // Disable pagination if you want to show all schedules at once
            className="ant-table-schedule-view"
            rowKey={(record) => record.key}
            locale={{ emptyText: "No schedules found for this movie." }}
          />
        ) : (
          <p className="no-schedules-message">No schedules found for this movie.</p>
        )}
      </Modal>
    </div>
  )
}

export default Movie
