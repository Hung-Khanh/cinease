
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = jest.fn().mockResolvedValue(true);
const mockRegister = jest.fn().mockResolvedValue(true);

jest.mock('../../constants/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

window.fetch = jest.fn();

describe('Login & Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Hiển thị form đăng nhập mặc định', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login now/i })).toBeInTheDocument();
  });

  it('Chuyển sang form đăng ký khi click', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/Create your account|Đăng ký/i));
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register|Đăng ký/i })).toBeInTheDocument();
  });

  it('Báo lỗi khi đăng nhập thiếu thông tin', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Login now/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Please input your username!/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Please input your password!/i)).toBeInTheDocument();
    });
  });

  it('Gọi API login khi submit đúng', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', role: 'USER' }),
    });
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Test User' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Login now/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/public/login'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'test-token', role: 'USER' })
      );
    });
  });

  it('Gọi API register khi submit đúng', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/Create your account|Đăng ký/i));
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Repeat Password/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth|dob/i), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText(/Sex/i), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: 'Hanoi' } });

    fireEvent.click(screen.getByRole('button', { name: /Register|Đăng ký/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/public/register'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});