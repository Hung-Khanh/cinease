import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentFailed from './PaymentFailed';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../assets/poster.jpg', () => 'poster.jpg');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PaymentFailed', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders all payment failed info', () => {
    render(
      <MemoryRouter>
        <PaymentFailed />
      </MemoryRouter>
    );
    expect(screen.getByText('Payment failed')).toBeInTheDocument();
    const spiderTitles = screen.getAllByText('SPIDERMAN ACROSS THE SPIDERVERSE');
    expect(spiderTitles.length).toBe(2);
    expect(screen.getByText('VINCOM MEGAMALL GRANDPARK')).toBeInTheDocument();
    expect(screen.getByText('ROOM : 8')).toBeInTheDocument();
    expect(screen.getByText('Mon, 26/5/2025')).toBeInTheDocument();
    expect(screen.getByText('C8, C9, C10')).toBeInTheDocument();
    expect(screen.getByText('15:40')).toBeInTheDocument();
    expect(screen.getByText('Please check your payment details or try again later!')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /poster/i })).toHaveAttribute('src', 'poster.jpg');
  });

  it('navigates to payment page when button is clicked', () => {
    render(
      <MemoryRouter>
        <PaymentFailed />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Payment again'));
    expect(mockNavigate).toHaveBeenCalledWith('/payment');
  });
});
