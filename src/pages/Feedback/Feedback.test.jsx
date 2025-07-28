import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Feedback from "./Feedback";

jest.mock("../../api/feedback", () => ({
    getCurrentUserFeedbacks: jest.fn(),
    updateFeedback: jest.fn(),
    deleteFeedback: jest.fn(),
}));

jest.mock("antd", () => {
    const antd = jest.requireActual("antd");
    return {
        ...antd,
        message: { success: jest.fn(), error: jest.fn() },
    };
});

describe("Feedback page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading spinner initially", async () => {
        require("../../api/feedback").getCurrentUserFeedbacks.mockResolvedValue({ data: [] });
        const { container } = render(<Feedback />);
        // Check for spinner by aria-busy
        expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText("Movie Feedback")).toBeInTheDocument());
    });

    it("shows empty state and add button when no feedbacks", async () => {
        require("../../api/feedback").getCurrentUserFeedbacks.mockResolvedValue({ data: [] });
        render(<Feedback />);
        await waitFor(() => expect(screen.getByText("No feedback yet")).toBeInTheDocument());
        expect(screen.getByText(/Add Your First Feedback/)).toBeInTheDocument();
    });

    it("shows feedback list and count badge", async () => {
        require("../../api/feedback").getCurrentUserFeedbacks.mockResolvedValue({
            data: [
                { feedbackId: 1, rating: 5, comment: "Great!", movieName: "Movie 1", createdDate: new Date().toISOString() },
                { feedbackId: 2, rating: 4, comment: "Good", movieName: "Movie 2", createdDate: new Date().toISOString() },
            ],
        });
        render(<Feedback />);
        await waitFor(() => expect(screen.getByText("2 Reviews")).toBeInTheDocument());
        expect(screen.getByText("Great!")).toBeInTheDocument();
        expect(screen.getByText("Good")).toBeInTheDocument();
    });

    it("opens modal to add feedback", async () => {
        require("../../api/feedback").getCurrentUserFeedbacks.mockResolvedValue({ data: [] });
        render(<Feedback />);
        await waitFor(() => expect(screen.getByText("No feedback yet")).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Add Your First Feedback/));
        expect(screen.getByText(/Add Feedback/)).toBeInTheDocument();
    });

    it("opens modal to edit feedback", async () => {
        require("../../api/feedback").getCurrentUserFeedbacks.mockResolvedValue({
            data: [
                { feedbackId: 1, rating: 5, comment: "Great!", movieName: "Movie 1", createdDate: new Date().toISOString() },
            ],
        });
        render(<Feedback />);
        await waitFor(() => expect(screen.getByText("Great!")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Edit"));
        expect(screen.getByText(/Edit Feedback/)).toBeInTheDocument();
    });

    it("submits feedback update", async () => {
        const { updateFeedback, getCurrentUserFeedbacks } = require("../../api/feedback");
        getCurrentUserFeedbacks.mockResolvedValue({
            data: [
                { feedbackId: 1, rating: 5, comment: "Great!", movieName: "Movie 1", createdDate: new Date().toISOString() },
            ],
        });
        updateFeedback.mockResolvedValue({});
        render(<Feedback />);
        await waitFor(() => expect(screen.getByText("Great!")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Edit"));
        fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/), { target: { value: "Updated comment!" } });
        fireEvent.click(screen.getByText(/Update Feedback/));
        await waitFor(() => expect(updateFeedback).toHaveBeenCalled());
    });

    it("deletes feedback", async () => {
        const { deleteFeedback, getCurrentUserFeedbacks } = require("../../api/feedback");
        getCurrentUserFeedbacks.mockResolvedValue({
            data: [
                { feedbackId: 1, rating: 5, comment: "Great!", movieName: "Movie 1", createdDate: new Date().toISOString() },
            ],
        });
        deleteFeedback.mockResolvedValue({});
        render(<Feedback />);
        await waitFor(() => expect(screen.getByText("Great!")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Delete"));
        fireEvent.click(screen.getByText("Yes"));
        await waitFor(() => expect(deleteFeedback).toHaveBeenCalled());
    });
});
