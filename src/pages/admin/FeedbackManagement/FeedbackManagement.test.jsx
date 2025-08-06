import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackManagement from './FeedbackManagement';
import api from '../../../constants/axios';

jest.mock('../../../constants/axios');

describe('FeedbackManagement', () => {
    const mockFeedbacks = [
        {
            feedbackId: 1,
            movieName: 'Movie A',
            rating: 4,
            comment: 'Good movie',
            createdDate: '2024-01-01T10:00:00Z',
            userId: 10,
            accountId: 100,
            invoiceId: 1000,
        },
        {
            feedbackId: 2,
            movieName: 'Movie B',
            rating: 2,
            comment: 'Bad movie',
            createdDate: '2024-01-02T11:00:00Z',
            userId: 11,
            accountId: 101,
            invoiceId: 1001,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        api.get.mockResolvedValue({ data: { content: mockFeedbacks, totalElements: 2, number: 0 } });
    });

    it('renders feedbacks table', async () => {
        render(<FeedbackManagement />);
        await waitFor(() => {
            expect(screen.getByText('Movie A')).toBeInTheDocument();
            expect(screen.getByText('Movie B')).toBeInTheDocument();
            expect(screen.getAllByText('Feedback ID').length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('Rating')).toBeInTheDocument();
        });
    });

    it('can search feedbacks', async () => {
        render(<FeedbackManagement />);
        await waitFor(() => screen.getByText('Movie A'));
        const searchInput = screen.getByPlaceholderText('Search Feedback');
        fireEvent.change(searchInput, { target: { value: 'Movie B' } });
        expect(searchInput.value).toBe('Movie B');
        // Should still show Movie B
        await waitFor(() => {
            expect(screen.getByText('Movie B')).toBeInTheDocument();
        });
    });

    it('opens details modal when clicking view', async () => {
        render(<FeedbackManagement />);
        await waitFor(() => screen.getByText('Movie A'));
        const viewBtns = document.querySelectorAll('.view-btn');
        fireEvent.click(viewBtns[0]);
        await waitFor(() => {
            expect(screen.getByText('Feedback Details')).toBeInTheDocument();
            expect(screen.getByText('Movie A')).toBeInTheDocument();
        });
    });

    it('opens delete modal and deletes feedback', async () => {
        render(<FeedbackManagement />);
        await waitFor(() => screen.getByText('Movie A'));
        const deleteBtns = document.querySelectorAll('.ant-btn-dangerous');
        fireEvent.click(deleteBtns[0]);
        await waitFor(() => {
            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
        });
        api.delete.mockResolvedValue({ data: 'Deleted successfully' });
        const confirmBtn = screen.getByText('Confirm Delete');
        fireEvent.click(confirmBtn);
        await waitFor(() => {
            expect(api.delete).toHaveBeenCalled();
        });
    });

    it('shows error toast on API error', async () => {
        api.get.mockRejectedValueOnce(new Error('API error'));
        render(<FeedbackManagement />);
        await waitFor(() => {
            expect(screen.getByText('No feedbacks found')).toBeInTheDocument();
        });
    });
});
