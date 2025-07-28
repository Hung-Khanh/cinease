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
      // Header: at least one of 'CINEMA' or 'CONCESSIONS' exists
      const headerSpans = screen.getAllByText((content) => /CINEMA|CONCESSIONS/i.test(content));
      expect(headerSpans.length).toBeGreaterThan(0);
      expect(screen.getByText((content) => content.includes('Popcorn'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Coke'))).toBeInTheDocument();
      // Check price for Popcorn and Coke by DOM
      const productCards = document.querySelectorAll('.product-card');
      const popcornCard = Array.from(productCards).find(card => card.textContent.includes('Popcorn'));
      const cokeCard = Array.from(productCards).find(card => card.textContent.includes('Coke'));
      expect(popcornCard.querySelector('.product-price').textContent).toMatch(/50,?000/);
      expect(popcornCard.querySelector('.product-price').textContent).toMatch(/VND/);
      expect(cokeCard.querySelector('.product-price').textContent).toMatch(/30,?000/);
      expect(cokeCard.querySelector('.product-price').textContent).toMatch(/VND/);
    });
    // Increase Popcorn quantity
    const increaseBtns = screen.getAllByText('+');
    fireEvent.click(increaseBtns[0]);
    // Check quantity for Popcorn card
    const productCards = document.querySelectorAll('.product-card');
    const popcornCard = Array.from(productCards).find(card => card.textContent.includes('Popcorn'));
    const popcornQty = popcornCard.querySelector('.quantity-display .qty-number');
    expect(popcornQty.textContent.trim()).toBe('1');
    // Decrease Popcorn quantity
    const decreaseBtns = screen.getAllByText('−');
    fireEvent.click(decreaseBtns[0]);
    expect(popcornQty.textContent.trim()).toBe('0');
  });

  it('shows order summary and confirm button when products selected', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText((content) => content.includes('Popcorn')));
    // Increase Popcorn and Coke
    fireEvent.click(screen.getAllByText('+')[0]);
    fireEvent.click(screen.getAllByText('+')[1]);
    await waitFor(() => {
      // Match summary: '2 items selected'
      expect(screen.getAllByText((content) => /2\s*items?\s*selected/i.test(content)).length).toBeGreaterThan(0);
      // Match total: '80,000 VND' (may appear in multiple places)
      expect(screen.getAllByText((content) => /80,?000/.test(content) && /VND/.test(content)).length).toBeGreaterThan(0);
      // Match confirm button: 'Continue with 2 items'
      expect(screen.getAllByText((content) => /Continue with\s*2\s*items?/i.test(content)).length).toBeGreaterThan(0);
    });
  });

  it('navigates back when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => {
      const headerSpans = screen.getAllByText((content) => /CINEMA|CONCESSIONS/i.test(content));
      expect(headerSpans.length).toBeGreaterThan(0);
    });
    // Back button: .back-btn
    fireEvent.click(document.querySelector('.back-btn'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls confirm and navigates to confirm page', async () => {
    render(
      <MemoryRouter>
        <Product />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText((content) => content.includes('Popcorn')));
    fireEvent.click(screen.getAllByText('+')[0]);
    // Find confirm button by text: 'Continue with 1 item'
    const confirmBtn = screen.getByText((content) => /Continue with\s*1\s*item/i.test(content));
    fireEvent.click(confirmBtn);
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
    await waitFor(() => {
      const headerSpans = screen.getAllByText((content) => /CINEMA|CONCESSIONS/i.test(content));
      expect(headerSpans.length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText((content) => /Skip\s*&\s*Continue/i.test(content)).length).toBeGreaterThan(0);
  });
});
