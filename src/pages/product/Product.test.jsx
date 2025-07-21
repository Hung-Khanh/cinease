import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Product from './Product';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate, useParams, useLocation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ movieId: 'movie1', sessionId: 'session1' }),
  useLocation: () => ({ state: mockSeatData }),
}));

// Mock Redux useSelector, useDispatch
const mockDispatch = jest.fn();
const mockSeatData = {
  sessionId: 'session1',
  scheduleId: 'schedule1',
  selectedSeats: ['A1', 'A2'],
  seats: [
    { seatColumn: 'A', seatRow: '1', scheduleSeatId: 'seatA1' },
    { seatColumn: 'A', seatRow: '2', scheduleSeatId: 'seatA2' },
  ],
};
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(fn => fn({ cart: { seatData: mockSeatData, selectedProducts: [] } })),
  useDispatch: () => mockDispatch,
}));

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(() => 'mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

// Mock fetch for products and select-seats
const mockProducts = [
  { productId: 'p1', productName: 'Popcorn', price: 50000, category: 'Snack', image: 'popcorn.jpg' },
  { productId: 'p2', productName: 'Coke', price: 30000, category: 'Drink', image: 'coke.jpg' },
];
global.fetch = jest.fn((url, options) => {
  if (url.includes('/member/products')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });
  }
  if (url.includes('/member/select-seats')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ productsTotal: 80000, grandTotal: 200000, sessionId: 'session1' }),
    });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
});

describe('Product', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders products and allows quantity change', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('FOOD & DRINK')).toBeInTheDocument();
      expect(screen.getByText('Popcorn')).toBeInTheDocument();
      expect(screen.getByText('Coke')).toBeInTheDocument();
      expect(screen.getByText('50,000 VND')).toBeInTheDocument();
      expect(screen.getByText('30,000 VND')).toBeInTheDocument();
    });
    // Increase Popcorn quantity
    const increaseBtns = screen.getAllByText('+');
    fireEvent.click(increaseBtns[0]);
    expect(screen.getByText('1')).toBeInTheDocument();
    // Decrease Popcorn quantity
    const decreaseBtns = screen.getAllByText('−');
    fireEvent.click(decreaseBtns[0]);
    // Find the quantity display for Popcorn
    const productCards = document.querySelectorAll('.product-card');
    const popcornCard = Array.from(productCards).find(card => card.textContent.includes('Popcorn'));
    const quantityDisplay = popcornCard.querySelector('.quantity-display');
    expect(quantityDisplay.textContent).toBe('0');
  });

  it('shows order summary and confirm button when products selected', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Popcorn'));
    // Increase Popcorn and Coke
    fireEvent.click(screen.getAllByText('+')[0]);
    fireEvent.click(screen.getAllByText('+')[1]);
    await waitFor(() => {
      expect(screen.getByText('2 Product')).toBeInTheDocument();
      expect(screen.getByText('80,000 VND')).toBeInTheDocument();
      expect(screen.getByText('Confirm (2 product)')).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('FOOD & DRINK'));
    fireEvent.click(document.querySelector('.back-button'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls confirm and navigates to confirm page', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Popcorn'));
    fireEvent.click(screen.getAllByText('+')[0]);
    fireEvent.click(screen.getByText('Confirm (1 product)'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/confirm/session1/schedule1', expect.anything());
    });
  });

  it('shows skip & continue when no products selected', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('FOOD & DRINK'));
    expect(screen.getByText('Skip & Continue')).toBeInTheDocument();
  });
});
