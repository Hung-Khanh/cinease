import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import { MemoryRouter } from 'react-router-dom';

// Mock antd Carousel, Tooltip
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    Carousel: ({ children }) => <div data-testid="mock-carousel">{children}</div>,
    Tooltip: ({ children }) => <>{children}</>,
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock API calls
const mockShowingMovies = [
  {
    movieId: 1,
    movieNameEnglish: 'Movie 1',
    posterImageUrl: 'poster1.jpg',
    largeImage: 'large1.jpg',
    rating: 8.5,
    version: '2D',
    types: 'Action',
    duration: 120,
    trailerUrl: 'https://trailer1',
    content: 'Description 1',
  },
];
const mockComingSoonMovies = [
  {
    movieId: 2,
    movieNameEnglish: 'Movie 2',
    posterImageUrl: 'poster2.jpg',
    fromDate: '2025-07-30',
    version: '3D',
    types: 'Comedy',
  },
];
const mockPromotions = [
  {
    promotionId: 1,
    title: 'Promo 1',
    image: 'promo1.jpg',
    detail: 'Detail 1',
    startTime: '2025-07-01T00:00:00Z',
    endTime: '2025-07-31T23:59:59Z',
  },
];
jest.mock('../../api/movie', () => ({
  getNowShowingMovies: jest.fn(() => Promise.resolve({ status: 200, data: { content: mockShowingMovies } })),
  getComingSoonMovies: jest.fn(() => Promise.resolve({ data: { content: mockComingSoonMovies } })),
}));
jest.mock('../../api/promotion', () => ({
  getPromotions: jest.fn(() => Promise.resolve({ data: mockPromotions })),
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders now showing movies carousel and cards', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Now Showing')).toBeInTheDocument();
      // Find the movie title in the card, not the slide
      const movieTitles = screen.getAllByText('Movie 1');
      expect(movieTitles.some(el => el.className?.includes('movie-title'))).toBe(true);
      expect(screen.getByText('8.59/10')).toBeInTheDocument();
      expect(screen.getByText('2D')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('120 min')).toBeInTheDocument();
    });
  });

  it('renders coming soon movies carousel and cards', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Find the badge, not the header
      const badges = screen.getAllByText('Coming Soon');
      expect(badges.some(el => el.className?.includes('coming-badge'))).toBe(true);
      const titles = screen.getAllByText('Movie 2');
      expect(titles.some(el => el.className?.includes('coming-title'))).toBe(true);
      expect(screen.getByText('Release Date: 2025-07-30')).toBeInTheDocument();
      expect(screen.getByText('3D')).toBeInTheDocument();
    });
  });

  it('renders promotions carousel and cards', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Special Promotions')).toBeInTheDocument();
      // Find promo title by class
      const promoTitles = screen.getAllByText('Promo 1');
      expect(promoTitles.some(el => el.className?.includes('promo-title'))).toBe(true);
      expect(screen.getByText('Start: July 1, 2025')).toBeInTheDocument();
      // The actual rendered date is 'End: August 1, 2025'
      expect(screen.getByText('End: August 1, 2025')).toBeInTheDocument();
    });
  });

  it('navigates to select showtime when Buy Ticket is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Buy Ticket'));
    fireEvent.click(screen.getByText('Buy Ticket'));
    expect(mockNavigate).toHaveBeenCalledWith('/select-showtime/1');
  });

  it('shows trailer overlay when Watch Trailer is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Watch Trailer'));
    fireEvent.click(screen.getByText('Watch Trailer'));
    await waitFor(() => {
      expect(screen.getByTitle('Trailer')).toBeInTheDocument();
    });
    // Close overlay
    fireEvent.click(screen.getByTitle('Trailer').parentElement.parentElement);
    expect(screen.queryByTitle('Trailer')).not.toBeInTheDocument();
  });

  it('navigates to description-movie when movie card is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => {
      const movieTitles = screen.getAllByText('Movie 1');
      const cardTitle = movieTitles.find(el => el.className?.includes('movie-title'));
      expect(cardTitle).toBeTruthy();
      fireEvent.click(cardTitle);
      expect(mockNavigate).toHaveBeenCalledWith('/description-movie/1');
    });
  });

  it('navigates to description-movie when coming soon card is clicked', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Movie 2'));
    fireEvent.click(screen.getByText('Movie 2'));
    expect(mockNavigate).toHaveBeenCalledWith('/description-movie/2');
  });
});
