import { useState, useEffect } from "react"
import { List, Typography, Empty, Spin } from "antd"
import { StarOutlined, PlusOutlined } from "@ant-design/icons"
import { updateFeedback, deleteFeedback, getCurrentUserFeedbacks } from "../../api/feedback"
import { FeedbackCard, FeedbackModal } from "./FeedbackComponents"
import "./Feedback.scss"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const { Title } = Typography

const Feedback = () => {
  const [userFeedbacks, setUserFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState(null)

  // Load data
  const loadData = async () => {
    setLoading(true)
    try {
      const feedbacksRes = await getCurrentUserFeedbacks()
      setUserFeedbacks(feedbacksRes.data || [])
    } catch (error) {
      console.error("Error loading feedback data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback)
    setModalVisible(true)
  }

  const handleSubmitFeedback = async (values) => {
    try {
      if (editingFeedback) {
        await updateFeedback(editingFeedback.feedbackId, values)
        toast.success("Feedback updated successfully!")
      }
      setModalVisible(false)
      setEditingFeedback(null)
      await loadData() 
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback. Please try again.")
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await deleteFeedback(feedbackId)
      toast.success("Feedback deleted successfully!")
      await loadData() 
    } catch (error) {
      console.error("Error deleting feedback:", error)
      toast.error("Failed to delete feedback. Please try again.")
    }
  }

  const handleAddFeedback = () => {
    setEditingFeedback(null)
    setModalVisible(true)
  }

  if (loading) {
    return (
      <div className="feedback-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="feedback-container">
      <ToastContainer />
      <Title level={2} className="feedback-title">
        Movie Feedback
      </Title>

      <div className="feedback-section">
        <div className="section-header">
          <Title level={3} className="section-title">
            <StarOutlined /> Your Feedbacks
          </Title>
          {userFeedbacks.length > 0 && (
            <div className="feedback-count-badge">
              {userFeedbacks.length} {userFeedbacks.length === 1 ? "Review" : "Reviews"}
            </div>
          )}
        </div>

        {userFeedbacks.length === 0 ? (
          <div className="custom-empty-state">
            <Empty
              className="custom-empty"
              description={
                <div>
                  <div className="empty-title">No feedback yet</div>
                  <div className="empty-description">
                    You haven't provided any feedback yet. Start by watching a movie and sharing your thoughts!
                  </div>
                </div>
              }
              image={<StarOutlined className="empty-icon" />}
            >
              {/* <button className="add-feedback-btn" onClick={handleAddFeedback}>
                <PlusOutlined /> Add Your First Feedback
              </button> */}
            </Empty>
          </div>
        ) : (
          <>
            <List
              className="feedback-list"
              grid={{ gutter: 16, column: 1 }}
              dataSource={userFeedbacks}
              renderItem={(feedback, index) => (
                <List.Item className={`feedback-list-item fade-in-item-${index % 10}`}>
                  <FeedbackCard feedback={feedback} onEdit={handleEditFeedback} onDelete={handleDeleteFeedback} />
                </List.Item>
              )}
            />
          </>
        )}
      </div>

      <FeedbackModal
        className="feedback-modal"
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingFeedback(null)
        }}
        onSubmit={handleSubmitFeedback}
        initialValues={
          editingFeedback
            ? {
                rating: editingFeedback.rating,
                comment: editingFeedback.comment,
              }
            : null
        }
        isEdit={!!editingFeedback}
      />
    </div>
  )
}

export default Feedback
