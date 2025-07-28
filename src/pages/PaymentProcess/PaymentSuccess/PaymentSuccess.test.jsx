import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentSuccess from './PaymentSuccess';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
const mockLocation = {
  search: '?invoiceId=123',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn((key) => {
    if (key === 'token') return 'test-token';
    if (key === 'role') return 'USER';
    if (key === 'notifications') return '[]';
    return null;
  }),
  setItem: jest.fn(),
};
global.window.dispatchEvent = jest.fn();

describe('PaymentSuccess', () => {
  const ticketData = {
    movieName: 'Spiderman',
    cinemaRoomName: 'Room 1',
    scheduleShowDate: '2025-05-26T00:00:00.000Z',
    seatNumbers: ['A1', 'A2'],
    scheduleShowTime: '15:40',
    ticketCount: 2,
    grandTotal: 200000,
    status: 'SUCCESS',
  };
  const movieData = [{ posterImageUrl: 'movie-poster.jpg' }];

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockImplementation((url) => {
      if (url.includes('booking-summary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(ticketData),
        });
      }
      if (url.includes('movies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(movieData),
        });
      }
      return Promise.resolve({ ok: false });
    });
    // Mock window.alert để tránh lỗi jsdom
    window.alert = jest.fn();
  });

  it('renders ticket info after fetch', async () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('CINEMA TICKET')).toBeInTheDocument();
      expect(screen.getByText('Spiderman')).toBeInTheDocument();
      expect(screen.getByText('Room 1')).toBeInTheDocument();
      // Kiểm tra ngày tháng đúng định dạng fullDate
      expect(screen.getByText('Monday, May 26, 2025')).toBeInTheDocument();
      // Kiểm tra từng ghế riêng lẻ
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
      expect(screen.getByText('15:40')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('200.000 VND')).toBeInTheDocument();
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
      // Kiểm tra poster
      expect(screen.getAllByRole('img', { name: /spiderman/i })[0]).toHaveAttribute('src', 'movie-poster.jpg');
    });
  });

  it('navigates to home when button is clicked', async () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Tìm nút về trang chủ theo text thực tế
      const btn = screen.getByRole('button', { name: /back to home/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading when ticketData is null', () => {
    fetch.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );
    // Dùng matcher phù hợp với UI thực tế
    expect(screen.getByText(/Loading your ticket/i)).toBeInTheDocument();
  });
});
