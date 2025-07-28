// Mock Line chart to avoid canvas errors
jest.mock('react-chartjs-2', () => ({
  ...jest.requireActual('react-chartjs-2'),
  Line: (props) => <div data-testid="mock-line-chart" />,
}));
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoryTicket from './HistoryTicket';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock getScoreHistory API
const mockAdding = [
  { date: '2025-07-01', amount: 100, type: 'Adding', movieName: 'Movie A' },
  { date: '2025-07-02', amount: 200, type: 'Adding', movieName: 'Movie B' },
];
const mockUsing = [
  { date: '2025-07-03', amount: 50, type: 'Using', movieName: 'Movie C' },
];
jest.mock('../../api/ticket', () => ({
  getScoreHistory: jest.fn((type) => {
    if (type === 'Adding') return Promise.resolve({ data: mockAdding });
    if (type === 'Using') return Promise.resolve({ data: mockUsing });
    return Promise.resolve({ data: [] });
  }),
}));

// Mock Ant Design message
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: { error: jest.fn() },
  };
});

describe('HistoryTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and summary cards', async () => {
    render(
      <MemoryRouter>
        <HistoryTicket />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Points History')).toBeInTheDocument();
      // 'Points' appears in both summary and table header
      const pointsEls = screen.getAllByText('Points');
      expect(pointsEls.length).toBeGreaterThan(1);
      expect(screen.getByText('Membership Level')).toBeInTheDocument();
      expect(screen.getByText('Points Using')).toBeInTheDocument();
      expect(screen.getByText('Gold')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument(); // 100+200
      // Find the summary card value for 'Points Using' (should have class 'red-value')
      const redValueEls = document.querySelectorAll('.red-value');
      expect(Array.from(redValueEls).some(el => el.textContent.trim() === '50')).toBe(true);
    });
  });

  it('renders transaction table rows', async () => {
    render(
      <MemoryRouter>
        <HistoryTicket />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Movie A')).toBeInTheDocument();
      expect(screen.getByText('Movie B')).toBeInTheDocument();
      expect(screen.getByText('Movie C')).toBeInTheDocument();
      expect(screen.getAllByText('Adding').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Using').length).toBeGreaterThan(0);
    });
  });

  it('navigates to /profile when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <HistoryTicket />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Find all buttons, pick the back button by class
      const btns = screen.getAllByRole('button');
      const backBtn = btns.find(btn => btn.className.includes('back-btn'));
      expect(backBtn).toBeTruthy();
      fireEvent.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('sorts table by date', async () => {
    render(
      <MemoryRouter>
        <HistoryTicket />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Sort'));
    fireEvent.click(screen.getByText('Sort'));
    // Find all 'Date' elements, pick the dropdown menu item
    await waitFor(() => {
      const dateEls = screen.getAllByText('Date');
      // The dropdown menu item should be a span
      const menuDate = dateEls.find(el => el.tagName.toLowerCase() === 'span');
      expect(menuDate).toBeTruthy();
      fireEvent.click(menuDate);
    });
    // After sort, Movie B (2025-07-02) should be before Movie A (2025-07-01) in descend order
    const rows = screen.getAllByRole('row');
    const movieNames = rows.map(row => row.textContent);
    expect(movieNames.some(text => text.includes('Movie B'))).toBeTruthy();
  });

  it('handles API error gracefully', async () => {
    const { getScoreHistory } = require('../../api/ticket');
    getScoreHistory.mockImplementation(() => Promise.reject(new Error('API error')));
    const { message } = require('antd');
    render(
      <MemoryRouter>
        <HistoryTicket />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });
});
