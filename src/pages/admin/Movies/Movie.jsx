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
  CalendarOutlined,
  TagOutlined
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
  Switch
} from "antd"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import axios from "../../../constants/axios"
import "./Movie.scss"

// Custom Dropdown Component
const MultiSelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const safeValue = Array.isArray(value) ? value : []

  const handleToggle = () => setIsOpen(!isOpen)

  const handleCheckboxChange = (checkedValues) => {
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
  // State Management
  const [movies, setMovies] = useState([])
  const [movieTypes, setMovieTypes] = useState([])
  const [cinemaRooms, setCinemaRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("")

  // Modal States
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isMovieDetailsModalVisible, setIsMovieDetailsModalVisible] = useState(false)
  const [isViewSchedulesModalVisible, setIsViewSchedulesModalVisible] = useState(false)
  const [isAddScheduleModalVisible, setIsAddScheduleModalVisible] = useState(false)
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false)
  const [isAddTypeModalVisible, setIsAddTypeModalVisible] = useState(false) // New state for add type modal

  // Form and Edit States
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [editingKey, setEditingKey] = useState(null)

  // File Upload States
  const [posterFile, setPosterFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  // Selected Data States
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null)
  const [selectedMovieSchedules, setSelectedMovieSchedules] = useState([])
  const [selectedMovieForScheduleView, setSelectedMovieForScheduleView] = useState(null)
  const [selectedMovieForSchedule, setSelectedMovieForSchedule] = useState(null)
  const [movieToDelete, setMovieToDelete] = useState(null)
  const [scheduleDateTime, setScheduleDateTime] = useState(null)

  // Message Handlers
  const showSuccessMessage = React.useCallback((content, duration = 2) => {
    toast.success(content, {
      position: "top-right",
      autoClose: duration * 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }, [])

  const showErrorMessage = React.useCallback((content, duration = 3) => {
    toast.error(content, {
      position: "top-right",
      autoClose: duration * 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }, [])

  // Utility Functions
  const createActionButton = (icon, className, onClick, children = null) => (
    <Button type="link" icon={icon} className={className} onClick={onClick}>
      {children}
    </Button>
  )

  const createPaginationButton = (type, text) => (
    <Button type="default" className={`pagination-btn-movie ${type}-btn`}>
      {text}
    </Button>
  )

  // API Functions
  const fetchMovieTypes = async () => {
    try {
      const response = await axios.get("/employee/types")
      const formattedTypes = response.data.map((type) => ({
        movieTypeId: type.typeId,
        movieTypeName: type.typeName,
      }))
      setMovieTypes(formattedTypes)
    } catch (error) {
      console.error("Error fetching movie types:", error)
      showErrorMessage(error.response?.data?.message || error.message)
    }
  }
  const handleAddMovieType = async (values) => {
    try {
      setUploading(true)
      const response = await axios.post("/employee/types", {
        typeName: values.typeName
      })
      
      if (response.data) {
        showSuccessMessage(`Movie type "${values.typeName}" added successfully!`, 2)
        await fetchMovieTypes() // Refresh the movie types list
        setIsAddTypeModalVisible(false)
        addTypeForm.resetFields()
      }
    } catch (error) {
      console.error("Error adding movie type:", error)
      showErrorMessage(error.response?.data?.message || error.message)
    } finally {
      setUploading(false)
    }
  }

  const fetchCinemaRooms = async () => {
    try {
      const response = await axios.get("/admin/cinema-room/list")
      setCinemaRooms(response.data)
    } catch (error) {
      showErrorMessage(error.response?.data?.message || error.message)
    }
  }

  const fetchMovies = async (showSuccessMessage = false) => {
    setLoading(true)
    try {
      const response = await axios.get("/admin/movies/list")
      
      // Log the full response to see the status and other details
      console.log("Full Movies List API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      })

      // Check for specific status conditions if needed
      if (response.status !== 200) {
        throw new Error(`Unexpected response status: ${response.status}`)
      }

      const result = response.data
      const formattedMovies = result.map((movie) => {
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
          posterImageUrl: movie.posterImageUrl || "",
          largeImage: movie.largeImage || "",
          cinemaRoom: movie.cinemaRoomId,
          trailerUrl: movie.trailerUrl,
          types: movieTypes,
          status: movie.status || 'INACTIVE'
        }
      })
      
      setMovies(formattedMovies)
      
      if (showSuccessMessage) {
        showSuccessMessage("Movies fetched successfully", 1.5)
      }

      // Log formatted movies with their statuses
      console.log("Formatted Movies with Statuses:", formattedMovies.map(movie => ({
        name: movie.movieNameEnglish,
        status: movie.status
      })))
    } catch (error) {
      console.error("Full error in fetchMovies:", {
        message: error.message,
        response: error.response
      })
      showErrorMessage(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await axios.get(`/admin/movies/details/${movieId}`)
      const result = response.data

      console.log("Raw Movie Details:", { movieId, rawResult: result })

      const formattedMovie = {
        ...result,
        cinemaRoom: result.cinemaRoomId,
        dateRange: result.fromDate && result.toDate ? [dayjs(result.fromDate), dayjs(result.toDate)] : null,
        types: result.types ? (Array.isArray(result.types) ? result.types : [result.types]) : [],
        scheduleTimes: result.schedules
          ? result.schedules.reduce((acc, schedule) => {
              try {
                console.log("Processing schedule:", schedule)
                let processedSchedule
                if (typeof schedule === "string") {
                  const [date, time] = schedule.split("T")
                  processedSchedule = {
                    date: dayjs(date),
                    time: dayjs(time, "HH:mm:ss"),
                  }
                }
                if (schedule && typeof schedule === "object") {
                  const dateValue = schedule.date || schedule.scheduleDate || schedule.datetime
                  const timeValue = schedule.time || schedule.scheduleTime || schedule.datetime
                  if (dateValue && timeValue) {
                    processedSchedule = {
                      date: dayjs(dateValue),
                      time: dayjs(timeValue),
                    }
                  }
                }
                console.warn("Unprocessable schedule format:", schedule)
                return acc
              } catch (error) {
                console.error("Error processing schedule:", { schedule, error: error.message })
                return acc
              }
            }, [])
          : [],
      }

      console.log("Formatted Movie Details for Editing:", {
        originalSchedules: result.schedules,
        formattedScheduleTimes: formattedMovie.scheduleTimes,
      })

      return formattedMovie
    } catch (error) {
      console.error("Full error in fetchMovieDetails:", error)
      showErrorMessage(error.response?.data?.message || error.message)
      return null
    }
  }

  const fetchMovieSchedules = async (movieId) => {
    try {
      console.log(`Fetching schedules for movie ID: ${movieId}`)
      const response = await axios.get(`/admin/movie-schedules/movie/${movieId}`)
      console.log("Raw schedules API response:", response.data)
      return response.data.result || []
    } catch (error) {
      console.error("Error fetching movie schedules:", error)
      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)
      }
      showErrorMessage(error.response?.data?.message || error.message)
      return []
    }
  }

  // Event Handlers
  const handleEdit = async (record) => {
    form.resetFields()
    try {
      const movieDetails = await fetchMovieDetails(record.key)
      if (!movieDetails) {
        return
      }

      if (typeof movieDetails !== "object") {
        showErrorMessage("Invalid movie details received")
        return
      }

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

      console.log("Edit Record Preparation:", { record, movieDetails, editRecord })

      setEditingKey(record.key)
      form.setFieldsValue(editRecord)
      setPosterFile(null)
      setBannerFile(null)
      setIsEditing(true)
      setIsModalVisible(true)
    } catch (error) {
      console.error("Error in handleEdit:", error)
      showErrorMessage(error.response?.data?.message || error.message)
    }
  }

  const handleAddMovie = async (values) => {
    try {
      setUploading(true)

      if (!values.cinemaRoom) {
        showErrorMessage("Please select a cinema room")
        setUploading(false)
        return
      }

      // For new movie creation, keep existing logic
      if (!isEditing) {
        const types = values.types && values.types.length > 0 ? values.types : ["Romantic"]

        let scheduleTimes = ""
        if (!isEditing) {
          scheduleTimes = values.scheduleTimes
            ? values.scheduleTimes
                .map(
                  (scheduleItem) => `${scheduleItem.date.format("YYYY-MM-DD")}T${scheduleItem.time.format("HH:mm:ss")}`,
                )
                .join(",")
            : ""
        }

        const formData = new FormData()

        if (posterFile) {
          formData.append("poster", posterFile)
        }
        if (bannerFile) {
          formData.append("banner", bannerFile)
        }

        const queryParams = {
          cinemaRoomId: values.cinemaRoom,
          typeIds: movieTypes
            .filter((type) => values.types.includes(type.movieTypeName))
            .map((type) => type.movieTypeId)
            .join(","),
        }

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

        Object.keys(requestBody).forEach((key) => {
          formData.append(key, requestBody[key])
        })

        const url = `/admin/movies/add`

        await axios({
          method: "post",
          url: url,
          data: formData,
          params: queryParams,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        await fetchMovies()
        showSuccessMessage(`Movie "${values.movieNameVn}" added successfully!`, 3)

        setIsModalVisible(false)
        setIsEditing(false)
        setEditingKey(null)
        setPosterFile(null)
        setBannerFile(null)
        form.resetFields()
        return
      }

      // For editing, implement selective update
      const originalMovieDetails = await fetchMovieDetails(editingKey)
      if (!originalMovieDetails) {
        showErrorMessage("Failed to fetch original movie details")
        setUploading(false)
        return
      }

      const formData = new FormData()
      const changedFields = {}

      // Helper function to check if a value has changed
      const hasChanged = (key, newValue) => {
        // Special handling for different types of comparisons
        if (key === 'duration') {
          return Number.parseInt(newValue) !== originalMovieDetails[key]
        }
        if (key === 'types') {
          const originalTypes = originalMovieDetails[key] || []
          const newTypes = newValue || []
          return JSON.stringify(originalTypes.sort()) !== JSON.stringify(newTypes.sort())
        }
        return newValue !== originalMovieDetails[key]
      }

      // Check and add changed fields
      const fieldsToCheck = [
        'movieNameVn', 
        'movieNameEnglish', 
        'actor', 
        'director', 
        'duration', 
        'version', 
        'content', 
        'trailerUrl',
        'movieProductionCompany'
      ]

      fieldsToCheck.forEach(field => {
        if (hasChanged(field, values[field])) {
          changedFields[field] = field === 'duration' 
            ? Number.parseInt(values[field]) 
            : values[field]
        }
      })

      // Check date range
      if (values.dateRange) {
        const fromDate = values.dateRange[0].format("YYYY-MM-DD")
        const toDate = values.dateRange[1].format("YYYY-MM-DD")
        if (fromDate !== originalMovieDetails.fromDate || toDate !== originalMovieDetails.toDate) {
          changedFields.fromDate = fromDate
          changedFields.toDate = toDate
        }
      }

      // Check types
      if (hasChanged('types', values.types)) {
        changedFields.types = values.types
        changedFields.typeIds = movieTypes
          .filter((type) => values.types.includes(type.movieTypeName))
          .map((type) => type.movieTypeId)
          .join(",")
      }

      // Check cinema room
      if (values.cinemaRoom !== originalMovieDetails.cinemaRoomId) {
        changedFields.cinemaRoomId = values.cinemaRoom
      }

      // Handle file uploads
      if (posterFile) {
        formData.append("poster", posterFile)
        changedFields.poster = posterFile
      }
      if (bannerFile) {
        formData.append("banner", bannerFile)
        changedFields.banner = bannerFile
      }

      // If no changes, show message and return
      if (Object.keys(changedFields).length === 0) {
        showSuccessMessage("No changes detected", 1)
        setIsModalVisible(false)
        setUploading(false)
        return
      }

      // Add changed fields to formData
      Object.keys(changedFields).forEach((key) => {
        formData.append(key, changedFields[key])
      })

      // Send update request
      await axios({
        method: "put",
        url: `/admin/movies/${editingKey}`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      await fetchMovies()
      showSuccessMessage(`Movie "${values.movieNameVn}" updated successfully!`, 3)

      setIsModalVisible(false)
      setIsEditing(false)
      setEditingKey(null)
      setPosterFile(null)
      setBannerFile(null)
      form.resetFields()
    } catch (error) {
      console.error("Full submission error:", error)
      showErrorMessage(
        error.response?.data?.message || error.message
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
        showSuccessMessage(`Movie "${movieToDelete.movieNameVn}" deleted successfully`, 2)
        setDeleteConfirmationVisible(false)
        setMovieToDelete(null)
      } catch (error) {
        showErrorMessage(error.response?.data?.message || error.message)
      }
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmationVisible(false)
    setMovieToDelete(null)
  }

  const handleAddMovieSchedule = async (movieId, scheduleTime) => {
    try {
      if (!movieId || !scheduleTime) {
        showErrorMessage("Movie ID and Schedule Time are required")
        return false
      }

      const parsedMovieId = Number.parseInt(movieId, 10)
      if (isNaN(parsedMovieId)) {
        showErrorMessage("Invalid Movie ID")
        return false
      }

      if (!dayjs.isDayjs(scheduleTime)) {
        showErrorMessage("Invalid Schedule Time")
        return false
      }

      const movieDetails = movies.find((movie) => movie.key === movieId)
      if (!movieDetails) {
        showErrorMessage("Movie details not found")
        return false
      }

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

      const scheduleData = {
        movieId: parsedMovieId,
        scheduleTime: scheduleTime.format("YYYY-MM-DD HH:mm"),
      }

      console.log("Schedule Creation Request:", {
        url: "/admin/movie-schedules",
        data: scheduleData,
        movieId: parsedMovieId,
        scheduleTime: scheduleTime.format("YYYY-MM-DD HH:mm"),
      })

      const response = await axios.post("/admin/movie-schedules", scheduleData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.data && response.data.result) {
        showSuccessMessage("Schedule added successfully", 2)
      }

      setIsAddScheduleModalVisible(false)
      setSelectedMovieForSchedule(null)
      setScheduleDateTime(null)
      await fetchMovies()
      return true
    } catch (error) {
      console.error("Error adding movie schedule:", error)

      if (error.response) {
        console.error("Full Error Response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })

        console.error("Detailed Error Breakdown:", {
          errorCode: error.response.data?.code,
          errorMessage: error.response.data?.message,
          errorDetails: error.response.data?.details,
        })
      }

      if (error.response && error.response.data) {
        const errorCode = error.response.data.code
        const errorMessage = error.response.data.message
        switch (errorCode) {
          case 1908:
            showErrorMessage("Schedule time is out of the movie's valid date range", 4)
            break
          default:
            showErrorMessage(errorMessage || error.message)
        }
      } else {
        showErrorMessage(error.message)
      }
      return false
    }
  }

  // Add new function for handling movie status toggle
  const handleMovieStatusToggle = async (movieId, checked) => {
    try {
      if (checked) {
        // Activate movie
        await axios.post(`/admin/movies/${movieId}/activate`)
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.key === movieId.toString() ? { ...movie, status: 'ACTIVE' } : movie
          )
        )
        showSuccessMessage("Movie activated successfully", 1.5)
      } else {
        // Inactivate movie
        await axios.post(`/admin/movies/${movieId}/inactivate`)
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.key === movieId.toString() ? { ...movie, status: 'INACTIVE' } : movie
          )
        )
        showSuccessMessage("Movie inactivated successfully", 1.5)
      }
    } catch (error) {
      console.error("Error toggling movie status:", error)
      showErrorMessage(
        error.response?.data?.message || error.message
      )
    }
  }

  // Table Columns Configuration
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
        let typeDisplay = "No Type"
        if (Array.isArray(record.types) && record.types.length > 0) {
          typeDisplay = record.types[0]
          if (record.types.length > 1) {
            typeDisplay += ",..."
          }
        } else if (record.types) {
          typeDisplay = String(record.types)
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
        )
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div className="status-column">
          <Switch
            checked={status === 'ACTIVE'}
            onChange={(checked) => handleMovieStatusToggle(record.key, checked)}
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
          {createActionButton(<CalendarOutlined />, "view-schedules-btn", async () => {
            const schedules = await fetchMovieSchedules(record.key)
            setSelectedMovieSchedules(schedules)
            setSelectedMovieForScheduleView(record)
            setIsViewSchedulesModalVisible(true)
          })}
        </div>
      ),
    },
  ]

  // Effects
  useEffect(() => {
    fetchMovies()
    fetchMovieTypes()
    fetchCinemaRooms()
  }, [])

  // Filtered Movies
  const filteredMovies = movies.filter((movie) =>
    searchTerm
      ? movie.movieNameVn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.movieNameEnglish.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  )

  const [addTypeForm] = Form.useForm()

  return (
    <div className="movies-container">
      {/* Header Section */}
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
          <Space>
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
            <Button
              type="default"
              icon={<TagOutlined />}
              onClick={() => setIsAddTypeModalVisible(true)}
              className="add-movie-type-btn"
            >
              Add Movie Type
            </Button>
          </Space>
        </div>
      </div>

      {/* Movies Table */}
      <Table
        columns={columns}
        dataSource={filteredMovies}
        loading={loading}
        className="ant-table-movie"
        locale={{
          emptyText: "No movies found",
        }}
        pagination={{
          pageSize: 6,
          className: "pagination-btn-movie",
          showSizeChanger: false,
          itemRender: (current, type, originalElement) => {
            if (type === "prev") return createPaginationButton("prev", "Previous")
            if (type === "next") return createPaginationButton("next", "Next")
            return originalElement
          },
        }}
      />

      {/* Add/Edit Movie Modal */}
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
                    if (!Array.isArray(scheduleTimes) || scheduleTimes.length === 0) {
                      throw new Error("Please add at least one schedule time")
                    }
                    for (const schedule of scheduleTimes) {
                      if (!schedule || !schedule.date || !schedule.time) {
                        throw new Error("Invalid schedule: date and time are required")
                      }
                    }
                    const uniqueSchedules = new Set(
                      scheduleTimes
                        .map((schedule) => {
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
                          minuteStep={15}
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

          <Form.Item name="content" label="Content" rules={[{ required: true, message: "Please enter content" }]}>
            <Input.TextArea placeholder="Enter movie content" rows={4} />
          </Form.Item>

          <Form.Item name="trailerUrl" label="Trailer URL">
            <Input placeholder="Enter trailer URL" />
          </Form.Item>

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
                return false
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
                return false
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
            </div>
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

      {/* View Schedules Modal */}
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
              console.log("Processing schedule for table:", schedule)
              return {
                key: schedule.id,
                scheduleTime: schedule.scheduleTime,
              }
            })}
            columns={[
              {
                title: "Schedule Time",
                dataIndex: "scheduleTime",
                key: "scheduleTime",
                render: (text) => text.replace("T", " "),
              },
            ]}
            pagination={false}
            className="ant-table-schedule-view"
            rowKey={(record) => record.key}
            locale={{ emptyText: "No schedules found for this movie." }}
          />
        ) : (
          <p className="no-schedules-message">No schedules found for this movie.</p>
        )}
      </Modal>

      {/* Add Movie Type Modal */}
      <Modal
        title="Add New Movie Type"
        open={isAddTypeModalVisible}
        onCancel={() => {
          setIsAddTypeModalVisible(false)
          addTypeForm.resetFields()
        }}
        footer={null}
        className="movie-modal add-type-modal"
        width={400}
        centered
      >
        <Form
          form={addTypeForm}
          layout="vertical"
          onFinish={handleAddMovieType}
          className="movie-form add-type-form"
        >
          <Form.Item
            name="typeName"
            label="Movie Type Name"
            rules={[
              { 
                required: true, 
                message: "Please enter movie type name" 
              },
              {
                validator: async (_, value) => {
                  if (value && value.trim().length === 0) {
                    throw new Error("Movie type name cannot be empty")
                  }
                }
              }
            ]}
          >
            <Input placeholder="Enter movie type name" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              className="submit-btn" 
              loading={uploading}
            >
              Add Movie Type
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer />
    </div>
  )
}

export default Movie
