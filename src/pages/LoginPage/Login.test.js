import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import Login from './Login';
import { useAuth } from '../../constants/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('../../constants/AuthContext');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock fetch
global.fetch = jest.fn();

// Mock logo import
jest.mock('../../assets/Logo.png', () => 'mock-logo.png');

// Mock SCSS
jest.mock('./Login.scss', () => {});

describe('Login Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      login: mockLogin,
    });
    
    // Clear all mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  describe('Login Form', () => {
    test('renders login form by default', () => {
      renderComponent();
      
      expect(screen.getByText('Login to your account')).toBeInTheDocument();
      expect(screen.getByTestId('login-username')).toBeInTheDocument();
      expect(screen.getByTestId('login-password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login now' })).toBeInTheDocument();
    });

    test('shows validation errors when submitting empty login form', async () => {
      renderComponent();
      
      const loginButton = screen.getByRole('button', { name: 'Login now' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Please input your username!')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Please input your password!')).toBeInTheDocument();
      });
    });

    test('successful login redirects to correct page based on role', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-token',
          role: 'ADMIN',
        }),
      };

      fetch.mockResolvedValueOnce(mockResponse);
      
      // Mock profile API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test User' }),
      });

      renderComponent();

      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login now' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://legally-actual-mollusk.ngrok-free.app/api/public/login',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify({
              username: 'testuser',
              password: 'password123',
            }),
          })
        );
      });

      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Login successful!');
        expect(mockLogin).toHaveBeenCalledWith({
          token: 'mock-token',
          role: 'ADMIN',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    test('login failure shows error message', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
      };

      fetch.mockResolvedValueOnce(mockResponse);

      renderComponent();

      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login now' }));

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Login failed: HTTP error! status: 401');
      });
    });

    test('redirects EMPLOYEE to staff page', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-token',
          role: 'EMPLOYEE',
        }),
      };

      fetch.mockResolvedValueOnce(mockResponse);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test Employee' }),
      });

      renderComponent();

      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'employee' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login now' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/staffHomePage');
      });
    });

    test('redirects regular user to home page', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          token: 'mock-token',
          role: 'USER',
        }),
      };

      fetch.mockResolvedValueOnce(mockResponse);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test User' }),
      });

      renderComponent();

      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'user' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login now' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Register Form', () => {
    test('switches to register form when toggle button is clicked', () => {
      renderComponent();
      
      const registerButton = screen.getByRole('button', { name: 'Register Here' });
      fireEvent.click(registerButton);

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register now' })).toBeInTheDocument();
    });

    test('shows validation errors when submitting empty register form', async () => {
      renderComponent();
      
      // Switch to register form
      fireEvent.click(screen.getByRole('button', { name: 'Register Here' }));

      const registerButton = screen.getByRole('button', { name: 'Register now' });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Please input your username!')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Please input your email!')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Please input your password!')).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      renderComponent();
      
      // Switch to register form
      fireEvent.click(screen.getByRole('button', { name: 'Register Here' }));

      // Fill form with invalid email
      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByTestId('register-email'), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByTestId('register-repeat-password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register now' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Please enter a valid email!')).toBeInTheDocument();
      });
    });

    test('validates password confirmation', async () => {
      renderComponent();
      
      // Switch to register form
      fireEvent.click(screen.getByRole('button', { name: 'Register Here' }));

      // Fill form with mismatched passwords
      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByTestId('register-email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('register-password'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByTestId('register-repeat-password'), {
        target: { value: 'notthesame' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register now' }));

      await waitFor(() => {
        const repeatPasswordInput = screen.getByTestId('register-repeat-password');
        expect(repeatPasswordInput).toHaveAttribute('placeholder', 'Passwords do not match!');
      });
    });
});
// ...existing code...
// Đóng các block describe cha nếu còn thiếu
});