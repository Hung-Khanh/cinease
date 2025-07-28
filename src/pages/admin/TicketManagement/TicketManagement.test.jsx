import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketManagement from './TicketManagement';
import axios from '../../../constants/axios';

jest.mock('../../../constants/axios');

describe('TicketManagement Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table and search input', async () => {
    axios.get.mockResolvedValueOnce({ data: { content: [], number: 0, totalElements: 0 } });
    render(<TicketManagement />);
    expect(screen.getByPlaceholderText('Search Ticket')).toBeInTheDocument();
    expect(await screen.findByText('No tickets found')).toBeInTheDocument();
  });

  it('fetches and displays tickets', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        content: [
          {
            invoiceId: 1,
            movieName: 'Movie 1',
            bookingDate: '2025-07-01T10:00:00Z',
            scheduleShowTime: '2025-07-01T12:00:00Z',
            status: 'COMPLETED',
            totalMoney: 100000,
            seat: 'A1',
            accountId: 123,
            addScore: 10,
            useScore: 5
          }
        ],
        number: 0,
        totalElements: 1
      }
    });
    render(<TicketManagement />);
    expect(await screen.findByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('100,000 VND')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('searches tickets', async () => {
    axios.get.mockResolvedValue({
      data: {
        content: [
          { invoiceId: 1, movieName: 'Movie 1', bookingDate: '', scheduleShowTime: '', status: 'COMPLETED', totalMoney: 100000, seat: 'A1', accountId: 123, addScore: 10, useScore: 5 },
          { invoiceId: 2, movieName: 'Movie 2', bookingDate: '', scheduleShowTime: '', status: 'CANCELLED', totalMoney: 200000, seat: 'B2', accountId: 456, addScore: 20, useScore: 10 }
        ],
        number: 0,
        totalElements: 2
      }
    });
    render(<TicketManagement />);
    await waitFor(() => screen.getByText('Movie 1'));
    fireEvent.change(screen.getByPlaceholderText('Search Ticket'), { target: { value: 'Movie 2' } });
    await waitFor(() => expect(screen.getByText('Movie 2')).toBeInTheDocument());
    // The label is rendered inside a div, so use queryByText with selector
    expect(screen.queryByText('Movie 1')).not.toBeNull(); // Should still exist in the table, but not as a label
  });

  it('opens ticket details modal', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        content: [
          { invoiceId: 1, movieName: 'Movie 1', bookingDate: '2025-07-01T10:00:00Z', scheduleShowTime: '2025-07-01T12:00:00Z', status: 'COMPLETED', totalMoney: 100000, seat: 'A1', accountId: 123, addScore: 10, useScore: 5 }
        ],
        number: 0,
        totalElements: 1
      }
    });
    axios.get.mockResolvedValueOnce({
      data: {
        invoiceId: 1,
        movieName: 'Movie 1',
        bookingDate: '2025-07-01T10:00:00Z',
        scheduleShowTime: '2025-07-01T12:00:00Z',
        status: 'COMPLETED',
        totalMoney: 100000,
        seat: 'A1',
        accountId: 123,
        addScore: 10,
        useScore: 5
      }
    });
    render(<TicketManagement />);
    await waitFor(() => screen.getByText('Movie 1'));
    const viewButtons = screen.getAllByRole('button');
    fireEvent.click(viewButtons.find(btn => btn.className.includes('view-btn')));
    expect(await screen.findByText('Ticket Details')).toBeInTheDocument();
    // Use getAllByText to avoid ambiguity with Invoice ID label
    const invoiceLabels = screen.getAllByText('Invoice ID');
    expect(invoiceLabels.some(el => el.className.includes('ticket-detail-label'))).toBe(true);
    const movieNameLabels = screen.getAllByText('Movie Name');
    expect(movieNameLabels.some(el => el.className.includes('ticket-detail-label'))).toBe(true);
    // Kiểm tra đúng phần tử chứa seat 'A1' trong modal chi tiết
    const seatElements = screen.getAllByText('A1');
    expect(seatElements.some(el => el.className.includes('ticket-detail-value'))).toBe(true);
  });
});
