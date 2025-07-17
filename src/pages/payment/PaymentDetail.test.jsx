import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentDetail from './PaymentDetail';
import { MemoryRouter, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

// Mock Redux useSelector
const mockSeatData = {
  sessionId: 'session123',
  movieName: 'Test Movie',
  cinemaRoomName: 'Room 1',
  showDate: '2025-07-17',
  showTime: '18:00',
  confirmationResult: {
    seatNumbers: ['A1', 'A2'],
    originalTicketTotal: 200000,
    finalTicketTotal: 180000,
    discountFromScore: 10000,
    discountFromPromotion: 10000,
    finalProductsTotal: 50000,
    grandTotal: 230000,
  },
};
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => 'mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock fetch for movie details and confirm payment
const mockMovieDetails = {
  posterImageUrl: 'poster-url.jpg',
  movieNameEnglish: 'Test Movie EN',
};
global.fetch = jest.fn((url, options) => {
  if (url.includes('/public/movies/details/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockMovieDetails),
    });
  }
  if (url.includes('/member/confirm-payment')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ paymentUrl: 'https://pay.url' }),
    });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
});

describe('PaymentDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useParams.mockReturnValue({ sessionId: 'session123', movieId: 'movie456' });
    require('react-redux').useSelector.mockImplementation(fn => fn({ cart: { seatData: mockSeatData } }));
  });

  it('renders payment details and movie info', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('PAYMENT INFORMATION')).toBeInTheDocument();
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText('18:00')).toBeInTheDocument();
      expect(screen.getByText('A1, A2')).toBeInTheDocument();
      expect(screen.getByText('200,000 VND')).toBeInTheDocument();
      // Find discount by parent label
      const discountEls = screen.getAllByText('- 10,000 VND');
      expect(discountEls.length).toBeGreaterThan(0);
      expect(screen.getByText('50,000 VND')).toBeInTheDocument();
      expect(screen.getByText('230,000 VND')).toBeInTheDocument();
      expect(screen.queryByText('Book Ticket')).not.toBeInTheDocument(); // Should not exist
    });
  });

  it('changes payment method when option clicked', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('PAYMENT INFORMATION'));
    const momoBtn = document.querySelector('button[title="MOMO"]');
    fireEvent.click(momoBtn);
    expect(momoBtn.className).toContain('selected');
    const vnpayBtn = document.querySelector('button[title="VNPAY"]');
    fireEvent.click(vnpayBtn);
    expect(vnpayBtn.className).toContain('selected');
  });

  it('calls confirm payment and shows proceed link', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('✅ CONFIRM PAYMENT'));
    fireEvent.click(screen.getByText('✅ CONFIRM PAYMENT'));
    await waitFor(() => {
      expect(screen.getByText('💳 PROCEED TO PAY')).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('PAYMENT INFORMATION'));
    const backBtn = document.querySelector('.back-button');
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows loading when loading', () => {
    require('react-redux').useSelector.mockImplementation(fn => fn({ cart: { seatData: null } }));
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();
  });

  it('shows not found when seatData missing confirmationResult', () => {
    require('react-redux').useSelector.mockImplementation(fn => fn({ cart: { seatData: { sessionId: 'session123' } } }));
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    // Wait for loading to disappear, then check for not found message
    return waitFor(() => {
      expect(screen.getByText('Không tìm thấy thông tin đặt vé.')).toBeInTheDocument();
    });
  });
});
