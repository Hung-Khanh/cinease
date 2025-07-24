import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from "./Profile";
jest.mock('../../api/feedback', () => ({
  getCurrentUserFeedbacks: jest.fn().mockResolvedValue([]),
  getEligibleInvoicesForFeedback: jest.fn().mockResolvedValue({ data: [] }),
  getCurrentUserFeedbackForInvoice: jest.fn().mockResolvedValue({}),
  updateFeedback: jest.fn().mockResolvedValue({}),
}));
import { BrowserRouter } from 'react-router-dom';
import * as userApi from '../../api/user';

jest.mock('../../api/user');
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

const mockUser = {
  username: 'testuser',
  fullName: 'Test User',
  dateOfBirth: '2000-01-01',
  gender: 'MALE',
  email: 'test@example.com',
  identityCard: '123456789',
  phoneNumber: '0123456789',
  address: 'Test Address',
  image: '',
};

const mockTickets = {
  data: {
    content: [
      {
        invoiceId: 'INV001',
        bookingDate: '2025-07-17T10:00:00Z',
        movieName: 'Movie 1',
        seatNumbers: ['A1', 'A2'],
        status: 'PAID',
        grandTotal: 200000,
        products: [{ itemType: 'TICKET' }, { itemType: 'TICKET' }],
      },
    ],
    totalElements: 1,
  },
};

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (typeof msg === 'string' && msg.includes('[antd: Tabs] `Tabs.TabPane` is deprecated')) return;
    // Call original console.error for other messages
    return jest.requireActual('console').error(msg, ...args);
  });
});

describe('Profile', () => {
  const { message } = require('antd');
  beforeEach(() => {
    jest.clearAllMocks();
    userApi.getUserInfo.mockResolvedValue({ data: mockUser });
    userApi.getUserTickets.mockResolvedValue(mockTickets);
    userApi.updateUserWithImage.mockResolvedValue({ data: mockUser });
    message.success.mockClear();
    message.error.mockClear();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

  test('renders user info', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByDisplayValue(/testuser/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
    });
  });

  test('renders transaction history', async () => {
    renderComponent();
    // Switch to the Transactions tab to render transaction table
    const transactionsTab = screen.getByRole('tab', { name: /comment Transactions/i });
    fireEvent.click(transactionsTab);
    await waitFor(() => {
      // Wait for table to appear
      const table = document.querySelector('.ant-table');
      expect(table).toBeTruthy();
      // Find all table cells
      const tdNodes = Array.from(table.querySelectorAll('td'));
      const allCellTexts = tdNodes.map(td => td.textContent.trim()).filter(Boolean);
      // eslint-disable-next-line no-console
      console.log('Profile transaction table cell texts:', allCellTexts);
      // Flexible matcher: join all cell texts and search for substrings
      const joined = allCellTexts.join(' ');
      expect(joined).toMatch(/Movie\s*1/);
      expect(joined).toMatch(/PAID/);
      expect(joined).toMatch(/200[.,]000/);
    });
  });

  test('updates profile info', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(userApi.updateUserWithImage).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  test('shows error on profile update fail', async () => {
    userApi.updateUserWithImage.mockRejectedValue({ response: { data: { code: 'EMAIL_EXISTS' } } });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('This email is already in use by another account.');
    });
  });

  test('changes password successfully', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByText('Update Password'));
    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Password changed successfully!');
    });
  });

  test('shows error if password confirmation does not match', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Update Password'));
    await waitFor(() => {
      expect(screen.getByText('Password confirmation does not match!')).toBeInTheDocument();
    });
  });

  test('shows error if current password is missing', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByText('Update Password'));
    await waitFor(() => {
      expect(screen.getByText('Please enter your current password!')).toBeInTheDocument();
    });
  });
});
