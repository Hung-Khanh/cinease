import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Employees from './Employees';
import api from '../../../constants/axios';

jest.mock('../../../constants/axios');

const mockEmployees = [
  {
    employeeId: 1,
    fullName: 'John Doe',
    identityCard: '123456789',
    email: 'john@example.com',
    phoneNumber: '0123456789',
    address: '123 Main St',
  },
  {
    employeeId: 2,
    fullName: 'Jane Smith',
    identityCard: '987654321',
    email: 'jane@example.com',
    phoneNumber: '0987654321',
    address: '456 Elm St',
  },
];

describe('Employees', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockEmployees });
  });

  it('renders employees table', async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });
  });

  it('opens add modal and submits new employee', async () => {
    render(<Employees />);
    fireEvent.click(screen.getAllByText('Add New Employee')[0].closest('button'));
    expect(screen.getAllByText('Add New Employee').length).toBeGreaterThan(1);
    fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Select date of birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByPlaceholderText('Enter profile image URL'), { target: { value: 'https://img.com/avatar.jpg' } });
    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter identity card number'), { target: { value: '111222333' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter phone number'), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByPlaceholderText('Enter address'), { target: { value: '789 Oak St' } });
    api.post.mockResolvedValue({ data: 'Added successfully' });
    const form = document.querySelector('.employee-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/employee/add', expect.objectContaining({ username: 'newuser' }));
    });
  });

  it('opens edit modal and submits update', async () => {
    render(<Employees />);
    await waitFor(() => screen.getByText('John Doe'));
    const editBtn = document.querySelector('.edit-btn');
    fireEvent.click(editBtn);
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'John Updated' } });
    api.put.mockResolvedValue({ data: 'Updated successfully' });
    const form = document.querySelector('.employee-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/admin/employee/edit/1', expect.objectContaining({ fullName: 'John Updated' }));
    });
  });

  it('opens delete confirmation and deletes employee', async () => {
    render(<Employees />);
    await waitFor(() => screen.getByText('John Doe'));
    const deleteBtn = document.querySelector('.delete-btn');
    fireEvent.click(deleteBtn);
    // Lấy tất cả phần tử chứa text liên quan đến xác nhận xóa/disable
    const confirmDeleteEls = screen.getAllByText((content) => /delete|xóa|are you sure|disable/i.test(content));
    // Kiểm tra có ít nhất 1 phần tử là dialog xác nhận (thường là <p> hoặc <div>)
    expect(
      confirmDeleteEls.some(el => /are you sure|disable|xóa/i.test(el.textContent))
    ).toBe(true);
    api.delete.mockResolvedValue({ data: 'Deleted successfully' });
    // Tìm nút xác nhận xóa với matcher function linh hoạt
    const confirmBtn = screen.getAllByText((content) => /delete|xóa|disable|are you sure/i.test(content))
      .find(el => el.tagName === 'BUTTON' || el.closest('button'));
    expect(confirmBtn).toBeTruthy();
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/employee/disable/1');
    });
  });
});
