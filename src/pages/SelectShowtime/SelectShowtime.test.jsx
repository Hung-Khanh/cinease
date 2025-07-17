import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import SelectShowtime from './SelectShowtime';

jest.mock('antd', () => ({
  message: {
    warning: jest.fn(),
    error: jest.fn(),
  },
}));
const mockStore = configureStore([]);
const defaultState = {};

const mockMovie = {
  movieNameEnglish: 'Test Movie',
  posterImageUrl: 'test-poster.jpg',
  dates: ['2025-07-17', '2025-07-18'],
};

const mockShowtimes = [
  { showDate: '2025-07-17', showTime: '10:00', scheduleId: 1 },
  { showDate: '2025-07-17', showTime: '14:00', scheduleId: 2 },
  { showDate: '2025-07-18', showTime: '16:00', scheduleId: 3 },
];

global.fetch = jest.fn();

describe('SelectShowtime', () => {
  beforeEach(() => {
    fetch.mockClear();
    require('antd').message.warning.mockClear();
    require('antd').message.error.mockClear();
    window.localStorage.clear();
  });

  function renderComponent() {
    const store = mockStore(defaultState);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/select-showtime/123"]}>
          <Routes>
            <Route path="/select-showtime/:movieId" element={<SelectShowtime />} />
            <Route path="/seat-select/:movieId/:scheduleId" element={<div>SeatSelectPage</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

  it('renders loading state then movie info', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => [mockMovie] });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    expect(screen.getByText(/Đang tải thông tin phim/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument());
    expect(screen.getByAltText('Test Movie')).toBeInTheDocument();
  });

  it('shows date and time buttons after loading', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => [mockMovie] });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument());
    expect(screen.getByText('2025-07-17')).toBeInTheDocument();
    expect(screen.getByText('2025-07-18')).toBeInTheDocument();
    // Click vào ngày để hiện nút thời gian
    fireEvent.click(screen.getByText('2025-07-17'));
    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('14:00')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('2025-07-18'));
    await waitFor(() => {
      expect(screen.getByText('16:00')).toBeInTheDocument();
    });
  });

  it('shows warning if SELECT SEAT is clicked without date/time', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => [mockMovie] });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument());
    fireEvent.click(screen.getByText('SELECT SEAT'));
    expect(require('antd').message.warning).toHaveBeenCalledWith('Please select both date and time');
  });

  it('navigates to seat select page when date and time are selected', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => [mockMovie] });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /2025-07-17/ }));
    fireEvent.click(screen.getByRole('button', { name: /10:00/ }));
    fireEvent.click(screen.getByText('SELECT SEAT'));
    await waitFor(() => expect(screen.getByText('SeatSelectPage')).toBeInTheDocument());
  });
});
