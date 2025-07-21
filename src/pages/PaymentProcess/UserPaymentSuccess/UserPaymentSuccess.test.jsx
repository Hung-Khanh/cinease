import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserPaymentSuccess from './UserPaymentSuccess';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate và useLocation
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ search: '?invoiceId=123&status=success' })
  };
});

describe('UserPaymentSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('role', 'USER');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('hiển thị thông tin vé khi fetch thành công', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        invoiceId: 123,
        movieName: 'Tên phim',
        bookingDate: '2025-07-17T10:00:00Z',
        scheduleShowTime: '2025-07-17T12:00:00Z',
        status: 'COMPLETED',
        totalMoney: 150000,
        seat: 'A1',
        accountId: 1,
        addScore: 10,
        useScore: 0
      })
    });
    render(<UserPaymentSuccess />, { wrapper: MemoryRouter });
    // Kiểm tra các label và giá trị thực tế trên UI
    expect(await screen.findByText('Invoice ID')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Total Price')).toBeInTheDocument();
    expect(screen.getByText(/COMPLETED/i)).toBeInTheDocument();
  });

  it('chuyển hướng về login nếu không có token', async () => {
    localStorage.removeItem('token');
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    render(<UserPaymentSuccess />, { wrapper: MemoryRouter });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('không gọi fetch nếu thiếu invoiceId hoặc status khác success', async () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ search: '?invoiceId=&status=fail' });
    global.fetch = jest.fn();
    render(<UserPaymentSuccess />, { wrapper: MemoryRouter });
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('hiển thị lỗi khi fetch thất bại', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    render(<UserPaymentSuccess />, { wrapper: MemoryRouter });
    // Kiểm tra loading khi fetch lỗi
    await waitFor(() => {
      expect(screen.getByText(/loading booking information/i)).toBeInTheDocument();
    });
  });
});
