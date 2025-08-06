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

// Mock window.alert to prevent jsdom error
beforeAll(() => {
  window.alert = jest.fn();
});
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
      // Chỉ kiểm tra tiêu đề chính của card payment
      expect(screen.getByText('Payment Details')).toBeInTheDocument();
      // Kiểm tra đúng text 'Test Movie' trong thẻ span.summary-value
      const movieSpans = Array.from(document.querySelectorAll('span.summary-value')).filter(el => el.textContent === 'Test Movie');
      expect(movieSpans.length).toBeGreaterThan(0);
      expect(screen.getByText((t) => t && t.includes('Room 1'))).toBeInTheDocument();
      expect(screen.getByText((t) => t && t.includes('18:00'))).toBeInTheDocument();
      // Kiểm tra từng seat riêng biệt
      expect(screen.getByText((t) => t && t.includes('A1'))).toBeInTheDocument();
      expect(screen.getByText((t) => t && t.includes('A2'))).toBeInTheDocument();
      expect(screen.getByText((t) => t && t.includes('200,000'))).toBeInTheDocument();
      // Find discount by class and check for '-' and '10,000' separately
      const discountEls = Array.from(document.querySelectorAll('.breakdown-item.discount'));
      expect(discountEls.length).toBeGreaterThan(0);
      // Check that at least one discount element contains '-' and '10,000'
      expect(
        discountEls.some(el => el.textContent.includes('-') && el.textContent.replace(/\D/g, '').includes('10000'))
      ).toBe(true);
      expect(screen.getByText((t) => t && t.includes('50,000'))).toBeInTheDocument();
      expect(screen.getByText((t) => t && t.includes('230,000'))).toBeInTheDocument();
      expect(screen.queryByText('Book Ticket')).not.toBeInTheDocument(); // Should not exist
    });
  });

  it('changes payment method when option clicked', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    let momoBtn;
    await waitFor(() => {
      momoBtn = document.querySelector('button[title="MOMO"]') || Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.toLowerCase().includes('momo'));
      expect(momoBtn).toBeTruthy();
    });
    fireEvent.click(momoBtn);
    expect(momoBtn.className).toContain('selected');
    let vnpayBtn;
    await waitFor(() => {
      vnpayBtn = document.querySelector('button[title="VNPAY"]') || Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.toLowerCase().includes('vnpay'));
      expect(vnpayBtn).toBeTruthy();
    });
    fireEvent.click(vnpayBtn);
    expect(vnpayBtn.className).toContain('selected');
  });

  it('calls confirm payment and shows proceed link', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    // Find the confirm button by class or text
    let confirmBtn;
    await waitFor(() => {
      confirmBtn = document.querySelector('button.confirm-payment-btn') ||
        Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.toLowerCase().includes('confirm'));
      expect(confirmBtn).toBeTruthy();
    });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      // Chấp nhận cả text split hoặc hoa thường
      expect(screen.getByText((t) => t && t.toLowerCase().includes('proceed'))).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    let backBtn;
    await waitFor(() => {
      backBtn = document.querySelector('.back-btn') || Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.toLowerCase().includes('back'));
      expect(backBtn).toBeTruthy();
    });
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
    // Chấp nhận cả tiếng Anh và tiếng Việt
    expect(
      screen.getByText(
        (t) => t && (t.includes('Đang tải dữ liệu') || t.includes('Loading payment details'))
      )
    ).toBeInTheDocument();
  });

  it('shows not found when seatData missing confirmationResult', () => {
    require('react-redux').useSelector.mockImplementation(fn => fn({ cart: { seatData: { sessionId: 'session123' } } }));
    render(
      <MemoryRouter>
        <PaymentDetail />
      </MemoryRouter>
    );
    // Wait for loading to disappear, then check for not found message (accept both Vietnamese and English)
    return waitFor(() => {
      expect(
        screen.getByText(
          (t) => t && (t.includes('Không tìm thấy thông tin đặt vé') || t.includes('Booking information not found'))
        )
      ).toBeInTheDocument();
    });
  });
});
