import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Members from './Members';
import api from '../../../constants/axios';

jest.mock('../../../constants/axios');

const mockMembers = [
  {
    memberId: 1,
    fullName: 'Alice',
    identityCard: '111111111',
    email: 'alice@example.com',
    phoneNumber: '0123456789',
    address: '1 Wonderland',
    point: 100,
    membershipLevel: 'Gold',
  },
  {
    memberId: 2,
    fullName: 'Bob',
    identityCard: '222222222',
    email: 'bob@example.com',
    phoneNumber: '0987654321',
    address: '2 Builder St',
    point: 50,
    membershipLevel: 'Silver',
  },
];

const mockDetails = {
  fullName: 'Alice',
  dateOfBirth: '2000-01-01',
  gender: 'Female',
  email: 'alice@example.com',
  identityCard: '111111111',
  phoneNumber: '0123456789',
  address: '1 Wonderland',
};

describe('Members', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/admin/members') {
        return Promise.resolve({ data: { content: mockMembers } });
      }
      if (url === '/admin/members/1/account') {
        return Promise.resolve({ data: mockDetails });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders members table', async () => {
    render(<Members />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });

  it('opens edit modal and submits update', async () => {
    render(<Members />);
    await waitFor(() => screen.getByText('Alice'));
    const editBtn = document.querySelector('.edit-btn');
    fireEvent.click(editBtn);
    expect(screen.getByText('Edit Member')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'Alice Updated' } });
    api.put.mockResolvedValue({ data: 'Updated successfully' });
    const form = document.querySelector('.member-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/admin/members/1/account', expect.objectContaining({ fullName: 'Alice Updated' }));
    });
  });

  it('opens details modal', async () => {
    render(<Members />);
    await waitFor(() => screen.getByText('Alice'));
    const viewBtn = document.querySelector('.view-btn');
    fireEvent.click(viewBtn);
    await waitFor(() => {
      expect(screen.getByText('Member Details')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('2000-01-01')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation and deletes member', async () => {
    render(<Members />);
    await waitFor(() => screen.getByText('Alice'));
    const deleteBtn = document.querySelector('.delete-btn');
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    api.delete.mockResolvedValue({ data: 'Deleted successfully' });
    fireEvent.click(screen.getByText('Delete Member'));
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/members/delete/1');
    });
  });
});
