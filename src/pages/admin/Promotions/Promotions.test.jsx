import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Promotions from './Promotions';
import axios from '../../../constants/axios';

jest.mock('../../../constants/axios');

describe('Promotions Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders promotions table and add button', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Promotions />);
    expect(screen.getByText('Add New Promotion')).toBeInTheDocument();
    expect(await screen.findByText('No promotions found')).toBeInTheDocument();
  });

  it('fetches and displays promotions', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          promotionId: 1,
          title: 'Summer Sale',
          startTime: '2025-07-01T10:00:00Z',
          endTime: '2025-07-31T23:59:59Z',
          discountLevel: 20,
          detail: '20% off all tickets',
          image: 'http://example.com/image.jpg',
        },
      ],
    });
    render(<Promotions />);
    expect(await screen.findByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('20% off all tickets')).toBeInTheDocument();
    expect(screen.getByAltText('Promotion')).toBeInTheDocument();
  });

  it('opens add promotion modal', () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<Promotions />);
    // Click the button with the text 'Add New Promotion' (the header button)
    const addButtons = screen.getAllByText('Add New Promotion');
    // The first one should be the button in the header
    fireEvent.click(addButtons[0]);
    // Modal should appear, check for the modal title
    const modalTitles = screen.getAllByText('Add New Promotion');
    expect(modalTitles.length).toBeGreaterThan(1); // Modal and button
    // Check for the input label
    expect(screen.getByLabelText('Promotion Title')).toBeInTheDocument();
  });

  it('searches promotions', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { promotionId: 1, title: 'Sale', startTime: '', endTime: '', discountLevel: 10, detail: '', image: null },
        { promotionId: 2, title: 'Discount', startTime: '', endTime: '', discountLevel: 15, detail: '', image: null },
      ],
    });
    render(<Promotions />);
    await waitFor(() => screen.getByText('Sale'));
    fireEvent.change(screen.getByPlaceholderText('Search promotion'), { target: { value: 'Discount' } });
    expect(screen.getByText('Discount')).toBeInTheDocument();
    expect(screen.queryByText('Sale')).not.toBeInTheDocument();
  });

  it('shows delete confirmation modal', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { promotionId: 1, title: 'Sale', startTime: '', endTime: '', discountLevel: 10, detail: '', image: null },
      ],
    });
    render(<Promotions />);
    await waitFor(() => screen.getByText('Sale'));
    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    // There may be multiple 'Sale' texts, so check for the modal's promotion title
    const modalTitles = screen.getAllByText('Sale');
    expect(modalTitles.some(el => el.className.includes('promotion-title'))).toBe(true);
  });
});
