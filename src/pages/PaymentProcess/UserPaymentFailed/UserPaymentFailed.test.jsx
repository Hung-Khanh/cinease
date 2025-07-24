import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserPaymentFailed from './UserPaymentFailed';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ state: { errorCode: '123', errorMessage: 'Thanh toán thất bại!' } })
  };
});

describe('UserPaymentFailed', () => {
  it('hiển thị thông tin lỗi khi có errorCode và errorMessage', () => {
    render(<UserPaymentFailed />, { wrapper: MemoryRouter });
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    expect(screen.getByText(/Error Code/i)).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
    expect(screen.getByText('Thanh toán thất bại!')).toBeInTheDocument();
    expect(screen.getByText('Please try again!')).toBeInTheDocument();
    expect(screen.getByText('Back to Home page')).toBeInTheDocument();
  });

  it('hiển thị fallback khi không có errorCode/errorMessage', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ state: undefined });
    render(<UserPaymentFailed />, { wrapper: MemoryRouter });
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('An unknown error occurred.')).toBeInTheDocument();
  });

  it('bấm nút Back to Home page sẽ gọi navigate', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    render(<UserPaymentFailed />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('Back to Home page'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
