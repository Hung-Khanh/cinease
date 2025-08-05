import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Confirm from './Confirm';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockSeatData = {
  sessionId: 'session123',
  movieName: 'Test Movie',
  showDate: '2025-07-17',
  showTime: '18:00',
  selectedSeats: ['A1', 'A2'],
  cinemaRoomName: 'Room 1',
  scheduleId: 1,
  movieId: 10,
  seats: [
    { seatColumn: 'A', seatRow: '1', scheduleSeatId: 101 },
    { seatColumn: 'A', seatRow: '2', scheduleSeatId: 102 },
  ],
  originalTicketTotal: 200000,
  grandTotal: 250000,
};


const mockSelectedProducts = [
  { productId: 1, quantity: 2 },
];



jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


global.fetch = jest.fn();
window.alert = jest.fn();

describe('Confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'testtoken');
  });



  function renderWithRedux(seatData, selectedProducts) {
    const initialState = {
      cart: {
        seatData,
        selectedProducts,
      },
    };
    function reducer(state = initialState, action) {
      return state;
    }
    const store = createStore(reducer);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Confirm />
        </BrowserRouter>
      </Provider>
    );
  }

  test('renders loading state', () => {
    // Provide seatData as null in Redux state
    renderWithRedux(null, mockSelectedProducts);
    expect(screen.getByText((content) => content.toLowerCase().includes('loading'))).toBeInTheDocument();
  });

  test('renders error if no seatData', () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(null, mockSelectedProducts);
    console.log('mockNavigate calls:', mockNavigate.mock.calls);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('renders confirm info', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({ posterImageUrl: 'poster.jpg' }) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(mockSeatData, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Test Movie'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Room 1'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('A1'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('A2'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('200,000'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('250,000'))).toBeInTheDocument();
    });
  });

  test('can change score and ticket type', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(mockSeatData, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
    });
    let scoreInput;
    try {
      scoreInput = screen.getByPlaceholderText((content) => content.toLowerCase().includes('score') || content.toLowerCase().includes('input score'));
    } catch (e) {
      // Nếu không tìm thấy placeholder, thử lấy input type number
      const allInputs = screen.getAllByRole('spinbutton');
      scoreInput = allInputs[0];
    }
    fireEvent.change(scoreInput, { target: { value: '10' } });
    expect(scoreInput.value).toBe('10');
    let ticketSelect;
    try {
      ticketSelect = screen.getByLabelText((content) => content.toLowerCase().includes('ticket type'));
    } catch (e) {
      // Nếu không tìm thấy label, lấy combobox đầu tiên
      ticketSelect = screen.getAllByRole('combobox')[0];
    }
    fireEvent.change(ticketSelect, { target: { value: 'STUDENT' } });
    expect(ticketSelect.value).toBe('STUDENT');
  });

  test('handleConfirm: missing token navigates to login', async () => {
    localStorage.removeItem('token');
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(mockSeatData, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
    });
    const confirmButtons = screen.getAllByText((content) => content.toLowerCase().includes('confirm'));
    // Ưu tiên chọn nút có class btn-text hoặc là button
    const confirmBtn = confirmButtons.find(el => el.className?.includes('btn-text')) || confirmButtons[0];
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('handleConfirm: missing scheduleId navigates to /', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux({ ...mockSeatData, scheduleId: null }, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
    });
    const confirmButtons = screen.getAllByText((content) => content.toLowerCase().includes('confirm'));
    const confirmBtn = confirmButtons.find(el => el.className?.includes('btn-text')) || confirmButtons[0];
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handleConfirm: session expired', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({ posterImageUrl: 'poster.jpg' }) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/member/select-seats')) {
        return Promise.resolve({ ok: false, json: async () => ({ errorCode: 'SESSION_EXPIRED' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(mockSeatData, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
    });
    const confirmButtons = screen.getAllByText((content) => content.toLowerCase().includes('confirm'));
    const confirmBtn = confirmButtons.find(el => el.className?.includes('btn-text')) || confirmButtons[0];
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handleConfirm: seat already booked', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({ posterImageUrl: 'poster.jpg' }) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/member/select-seats')) {
        return Promise.resolve({ ok: false, json: async () => ({ errorCode: 'SEAT_ALREADY_BOOKED' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(mockSeatData, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
    });
    const confirmButtons = screen.getAllByText((content) => content.toLowerCase().includes('confirm'));
    const confirmBtn = confirmButtons.find(el => el.className?.includes('btn-text')) || confirmButtons[0];
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test('handleConfirm: confirm-prices error', async () => {
    // select-seats ok, confirm-prices error
    global.fetch.mockImplementation((url) => {
      if (url.includes('/public/movies/details/')) {
        return Promise.resolve({ ok: true, json: async () => ({ posterImageUrl: 'poster.jpg' }) });
      }
      if (url.includes('/public/promotions')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/member/select-seats')) {
        return Promise.resolve({ ok: true, json: async () => ({ sessionId: 'session123' }) });
      }
      if (url.includes('/member/confirm-prices')) {
        return Promise.resolve({ ok: false, json: async () => ({ errorCode: 'INSUFFICIENT_SCORE' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    renderWithRedux(mockSeatData, mockSelectedProducts);
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('BOOKING'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('CONFIRMATION'))).toBeInTheDocument();
    });
    const confirmButtons = screen.getAllByText((content) => content.toLowerCase().includes('confirm'));
    const confirmBtn = confirmButtons.find(el => el.className?.includes('btn-text')) || confirmButtons[0];
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
