import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import SeatSelect from './SeatSelect';

const mockStore = configureStore([]);

const defaultState = {
  auth: { token: 'test-token' },
  tempBooking: {
    movieName: 'Test Movie',
    showDate: '2025-07-17',
    showTime: '20:00',
    scheduleId: 1,
  },
  cart: {
    sessionId: 'session-123',
    seatData: {
      selectedSeats: [],
      products: [],
    },
  },
};

const mockSeats = [
  { seatColumn: 'A', seatRow: 1, seatStatus: 'AVAILABLE', seatType: 'REGULAR', scheduleSeatId: 101 },
  { seatColumn: 'A', seatRow: 2, seatStatus: 'BOOKED', seatType: 'REGULAR', scheduleSeatId: 102 },
  { seatColumn: 'B', seatRow: 1, seatStatus: 'AVAILABLE', seatType: 'VIP', scheduleSeatId: 201 },
  { seatColumn: 'B', seatRow: 2, seatStatus: 'BOOKED', seatType: 'VIP', scheduleSeatId: 202 },
];

global.fetch = jest.fn();

describe('SeatSelect', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.localStorage.clear();
    window.alert = jest.fn();
    // Default mock for fetch: GET seats returns mockSeats, POST returns success
    fetch.mockImplementation((url, options) => {
      if (url.includes('/public/seats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSeats,
        });
      }
      if (url.includes('/member/select-seats')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sessionId: 'session-123',
            movieName: 'Test Movie',
            scheduleShowDate: '2025-07-17',
            scheduleShowTime: '20:00',
            cinemaRoomName: 'Room 1',
            totalPrice: 100,
            productsTotal: 0,
            grandTotal: 100,
          }),
        });
      }
      // Nếu là release seats, trả về hợp lệ
      if (url.includes('/member/select-seats') && options && options.body && JSON.parse(options.body).scheduleSeatIds.length === 0) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sessionId: 'session-123',
            totalPrice: 0,
            productsTotal: 0,
            grandTotal: 0,
          }),
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });
  });

  function renderComponent(storeState = defaultState) {
    const store = mockStore(storeState);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/seat/1/1"]}>
          <Routes>
            <Route path="/seat/:scheduleId/:movieId" element={<SeatSelect />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/product/:movieId/:scheduleId" element={<div>Product Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

  it('renders loading state and then seats', async () => {
    renderComponent();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    await waitFor(() => {
      const seatButtons = screen.getAllByRole('button').filter(btn => btn.className.includes('cs-seat-button'));
      expect(seatButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows alert và chuyển hướng login nếu không có token', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 401, json: async () => ({}) }));
    renderComponent({ ...defaultState, auth: { token: null } });
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('cho phép chọn và bỏ chọn ghế AVAILABLE', async () => {
    renderComponent();
    await waitFor(() => {
      const seatButtons = screen.getAllByRole('button').filter(btn => btn.className.includes('cs-seat-button') && !btn.disabled);
      expect(seatButtons.length).toBeGreaterThan(0);
      fireEvent.click(seatButtons[0]);
      // Sau khi chọn, SEAT summary phải hiện tên ghế
      expect(screen.getByText(/A1|B1/)).toBeInTheDocument();
      fireEvent.click(seatButtons[0]);
      // Sau khi bỏ chọn, SEAT summary phải là N/A
      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    });
  });

  it('các ghế BOOKED sẽ bị disabled', async () => {
    renderComponent();
    await waitFor(() => {
      const buttons = screen.getAllByRole('button').filter(btn => btn.className.includes('cs-seat-button'));
      // Ghế BOOKED là A2 và B2
      const bookedButtons = buttons.filter((btn, idx) => btn.disabled);
      expect(bookedButtons.length).toBeGreaterThan(0);
    });
  });

  it('hiện alert nếu checkout mà chưa chọn ghế', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText('Screen')).toBeInTheDocument());
    const seatButtons = screen.getAllByRole('button').filter(btn => btn.className.includes('cs-seat-button') && !btn.disabled);
    if (seatButtons.length === 0) {
      fireEvent.click(screen.getByText('Checkout'));
      await waitFor(() => {
        expect(window.alert).not.toHaveBeenCalled();
      });
    } else {
      fireEvent.click(screen.getByText('Checkout'));
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });
    }
  });

  it('chuyển hướng sang trang product khi checkout thành công', async () => {
    renderComponent();
    await waitFor(() => {
      const seatButtons = screen.getAllByRole('button').filter(btn => btn.className.includes('cs-seat-button') && !btn.disabled);
      expect(seatButtons.length).toBeGreaterThan(0);
      fireEvent.click(seatButtons[0]);
    });
    fireEvent.click(screen.getByText('Checkout'));
    await waitFor(() => expect(screen.getByText('Product Page')).toBeInTheDocument());
  });
});
