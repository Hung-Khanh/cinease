import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackCard, FeedbackModal } from "./FeedbackComponents";

describe("FeedbackCard", () => {
    const feedback = {
        feedbackId: 1,
        rating: 4,
        comment: "Nice movie!",
        movieName: "Movie X",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
    };

    it("renders feedback info", () => {
        render(<FeedbackCard feedback={feedback} onEdit={jest.fn()} onDelete={jest.fn()} />);
        expect(screen.getByText("Movie X")).toBeInTheDocument();
        expect(screen.getByText("Nice movie!")).toBeInTheDocument();
        expect(screen.getByText(/\(4\/5\)/)).toBeInTheDocument();
    });

    it("calls onEdit when Edit button clicked", () => {
        const onEdit = jest.fn();
        render(<FeedbackCard feedback={feedback} onEdit={onEdit} onDelete={jest.fn()} />);
        fireEvent.click(screen.getByText("Edit"));
        expect(onEdit).toHaveBeenCalledWith(feedback);
    });

    it("calls onDelete when Delete confirmed", () => {
        const onDelete = jest.fn();
        render(<FeedbackCard feedback={feedback} onEdit={jest.fn()} onDelete={onDelete} />);
        fireEvent.click(screen.getByText("Delete"));
        fireEvent.click(screen.getByText("Yes"));
        expect(onDelete).toHaveBeenCalledWith(1);
    });
});

describe("FeedbackModal", () => {
    it("renders modal with form fields", () => {
        render(
            <FeedbackModal
                visible={true}
                onCancel={jest.fn()}
                onSubmit={jest.fn()}
                initialValues={{ rating: 3, comment: "Test comment" }}
                isEdit={false}
            />
        );
        expect(screen.getByText(/Add Feedback|Edit Feedback/)).toBeInTheDocument();
        expect(screen.getByText(/Rating/)).toBeInTheDocument();
        expect(screen.getByText(/Comment/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Share your thoughts/)).toBeInTheDocument();
    });

    it("calls onCancel when Cancel button clicked", () => {
        const onCancel = jest.fn();
        render(
            <FeedbackModal
                visible={true}
                onCancel={onCancel}
                onSubmit={jest.fn()}
                initialValues={{ rating: 3, comment: "Test comment" }}
                isEdit={false}
            />
        );
        fireEvent.click(screen.getByText("Cancel"));
        expect(onCancel).toHaveBeenCalled();
    });
});
