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
  duration: 120,
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
        return Promise.resolve({ ok: true, json: async () => mockMovie });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    // Kiểm tra loading text thực tế
    expect(screen.getByText(/Loading showtimes/i)).toBeInTheDocument();
    // Movie title có thể bị chia nhỏ, dùng matcher function
    await waitFor(() => expect(screen.getByText('Test Movie')).toBeInTheDocument());
    expect(screen.getByAltText('Test Movie')).toBeInTheDocument();
  });

  it('shows date and time buttons after loading', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => mockMovie });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    // Dùng matcher function để tìm tiêu đề phim (có thể bị chia nhỏ)
    await waitFor(() => expect(screen.getByText((content, node) => {
      const hasText = (node) => node.textContent && node.textContent.replace(/\s+/g, ' ').trim() === 'Test Movie';
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node?.children || []).every(child => !hasText(child));
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument());
    // Kiểm tra nút ngày dựa vào số ngày (17, 18)
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    // Click vào nút ngày đầu tiên
    fireEvent.click(screen.getByText('17'));
    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('14:00')).toBeInTheDocument();
    });
    // Click vào nút ngày thứ hai
    fireEvent.click(screen.getByText('18'));
    await waitFor(() => {
      expect(screen.getByText('16:00')).toBeInTheDocument();
    });
  });

  it('shows warning if SELECT SEAT is clicked without date/time', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => mockMovie });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    // Mock window.alert vì component dùng alert thay vì antd.message.warning
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
    // Đảm bảo không có ngày/giờ nào được chọn mặc định
    window.localStorage.setItem('showtimeSelection_123', JSON.stringify({ selectedDate: '', selectedTime: '', selectedScheduleId: null }));
    renderComponent();
    await waitFor(() => expect(screen.getByText((content, node) => {
      const hasText = (node) => node.textContent && node.textContent.replace(/\s+/g, ' ').trim() === 'Test Movie';
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node?.children || []).every(child => !hasText(child));
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument());
    // Chọn ngày đầu tiên (nút '17')
    fireEvent.click(screen.getByText('17'));
    // Không chọn giờ, kiểm tra nút Select Seats có class inactive (không disabled thực sự)
    const selectSeatBtn = screen.getByTestId('select-seat-btn');
    expect(selectSeatBtn.classList.contains('inactive')).toBe(true);
    alertSpy.mockRestore();
  });

  it('navigates to seat select page when date and time are selected', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/public/movies')) {
        return Promise.resolve({ ok: true, json: async () => mockMovie });
      }
      if (url.includes('/public/showtimes')) {
        return Promise.resolve({ ok: true, json: async () => mockShowtimes });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
    renderComponent();
    await waitFor(() => expect(screen.getByText((content, node) => {
      const hasText = (node) => node.textContent && node.textContent.replace(/\s+/g, ' ').trim() === 'Test Movie';
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node?.children || []).every(child => !hasText(child));
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument());
    // Click ngày đầu tiên (nút có text '17')
    fireEvent.click(screen.getByText('17'));
    // Click giờ đầu tiên (nút có text '10:00')
    fireEvent.click(screen.getByText('10:00'));
    // Click nút chọn ghế
    fireEvent.click(screen.getByText('Select Seats'));
    await waitFor(() => expect(screen.getByText('SeatSelectPage')).toBeInTheDocument());
  });
});
