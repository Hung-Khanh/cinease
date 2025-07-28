import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CinemaRooms from './CinemaRoom';
import api from '../../../constants/axios';

jest.mock('../../../constants/axios');

const mockRooms = [
  { cinemaRoomId: 1, cinemaRoomName: 'Room 1', seatQuantity: 100 },
  { cinemaRoomId: 2, cinemaRoomName: 'Room 2', seatQuantity: 80 }
];

describe('CinemaRooms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockRooms });
  });

  it('renders cinema rooms table', async () => {
    render(<CinemaRooms />);
    expect(screen.getByText('Add New Cinema Room')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Room 1')).toBeInTheDocument();
      expect(screen.getByText('Room 2')).toBeInTheDocument();
    });
  });

  it('opens add modal and submits new room', async () => {
    render(<CinemaRooms />);
    // Click the header Add button (first occurrence)
    fireEvent.click(screen.getAllByText('Add New Cinema Room')[0].closest('button'));
    // Modal should open
    expect(screen.getAllByText('Add New Cinema Room').length).toBeGreaterThan(1);
    fireEvent.change(screen.getByPlaceholderText('Enter cinema room name'), { target: { value: 'Room 3' } });
    api.post.mockResolvedValue({ data: 'Added successfully' });
    // Submit the form directly
    const form = document.querySelector('.cinema-room-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/cinema-room/add', expect.objectContaining({ cinemaRoomName: 'Room 3' }));
    });
  });

  it('opens edit modal and submits update', async () => {
    render(<CinemaRooms />);
    await waitFor(() => screen.getByText('Room 1'));
    // Find the edit button by role and accessible name
    const editBtn = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(editBtn);
    expect(screen.getByText('Edit Cinema Room')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Enter cinema room name'), { target: { value: 'Room 1 Updated' } });
    api.put.mockResolvedValue({ data: 'Updated successfully' });
    // Submit the form directly
    const form = document.querySelector('.cinema-room-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/admin/cinema-room/update/1', expect.objectContaining({ cinemaRoomName: 'Room 1 Updated' }));
    });
  });

  it('opens delete confirmation and deletes room', async () => {
    render(<CinemaRooms />);
    await waitFor(() => screen.getByText('Room 1'));
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    api.delete.mockResolvedValue({ data: 'Deleted successfully' });
    fireEvent.click(screen.getByText('Delete Cinema Room'));
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/admin/cinema-room/delete/1');
    });
  });

  it('opens seat details modal', async () => {
    render(<CinemaRooms />);
    await waitFor(() => screen.getByText('Room 1'));
    api.get.mockResolvedValueOnce({ data: mockRooms });
    api.get.mockResolvedValueOnce({ data: [{ seatId: 1, seatColumn: 'A', seatRow: '1', seatType: 'REGULAR' }] });
    fireEvent.click(screen.getAllByRole('button', { name: /view seats/i })[0]);
    await waitFor(() => {
      expect(screen.getByText('Cinema Room 1 - Seat Map')).toBeInTheDocument();
      expect(screen.getByText('A1')).toBeInTheDocument();
    });
  });
});
