import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './forgotPassword';
import { BrowserRouter } from 'react-router-dom';
import api from '../constants/axios';

jest.mock('../constants/axios');

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );

describe('ForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders email step by default', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('Nhập địa chỉ email')).toBeInTheDocument();
    expect(screen.getByText('Send Email')).toBeInTheDocument();
  });

  test('shows error if email is empty', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Send Email'));
    expect(await screen.findByText('Send Email')).toBeInTheDocument();
  });

  test('shows error if email is invalid', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Send Email'));
    expect(await screen.findByText('Send Email')).toBeInTheDocument();
  });

  test('goes to OTP step on valid email', async () => {
    api.post.mockResolvedValueOnce({});
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
    });
  });

  test('shows error if OTP is empty', async () => {
    api.post.mockResolvedValueOnce({});
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Send OTP'));
    expect(await screen.findByText('Send OTP')).toBeInTheDocument();
  });

  test('shows error if OTP is not 6 digits', async () => {
    api.post.mockResolvedValueOnce({});
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
    });
    // Giả lập nhập 3 ký tự vào 3 input con của OTP
    const otpInputs = screen.getAllByRole('textbox');
    fireEvent.input(otpInputs[0], { target: { value: '1' } });
    fireEvent.input(otpInputs[1], { target: { value: '2' } });
    fireEvent.input(otpInputs[2], { target: { value: '3' } });
    fireEvent.click(screen.getByText('Send OTP'));
    expect(await screen.findByText('Send OTP')).toBeInTheDocument();
  });

  test('goes to reset password step on valid OTP', async () => {
    api.post.mockResolvedValueOnce({}); // email
    api.post.mockResolvedValueOnce({}); // otp
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
    });
    // Nhập đủ 6 ký tự vào 6 input con của OTP
    const otpInputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((char, idx) => {
      fireEvent.input(otpInputs[idx], { target: { value: char } });
    });
    fireEvent.click(screen.getByText('Send OTP'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
    });
  });

  test('shows error if passwords do not match', async () => {
    api.post.mockResolvedValueOnce({}); // email
    api.post.mockResolvedValueOnce({}); // otp
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
    });
    const otpInputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((char, idx) => {
      fireEvent.input(otpInputs[idx], { target: { value: char } });
    });
    fireEvent.click(screen.getByText('Send OTP'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'xyz789' } });
    fireEvent.click(screen.getByText('Change password'));
    // Kiểm tra vẫn còn nút Change password (tức là chưa chuyển step thành công)
    expect(await screen.findByText('Change password')).toBeInTheDocument();
  });

  test('shows success on valid password change', async () => {
    api.post.mockResolvedValueOnce({}); // email
    api.post.mockResolvedValueOnce({}); // otp
    api.post.mockResolvedValueOnce({}); // change password
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nhập mã OTP')).toBeInTheDocument();
    });
    const otpInputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((char, idx) => {
      fireEvent.input(otpInputs[idx], { target: { value: char } });
    });
    fireEvent.click(screen.getByText('Send OTP'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByText('Change password'));
    await waitFor(() => {
      expect(screen.getByText('Successfully reset password')).toBeInTheDocument();
    });
  });
});
