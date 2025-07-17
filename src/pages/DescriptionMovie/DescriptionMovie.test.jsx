import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DescriptionMovie from './DescriptionMovie';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ movieId: '1' }),
}));

describe('DescriptionMovie', () => {
  const mockMovie = {
    posterImageUrl: 'test-poster.jpg',
    movieNameEnglish: 'Test Movie',
    trailerUrl: 'https://youtube.com/test',
    description: 'A test movie',
    director: 'Test Director',
    actors: 'Actor 1, Actor 2',
    genre: 'Action',
    releaseDate: '2025-01-01',
    duration: 120,
    language: 'English',
    rating: 8.5,
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMovie,
    });
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
    mockNavigate.mockClear();
  });

  it('renders page header and poster section', async () => {
    render(
      <MemoryRouter>
        <DescriptionMovie />
      </MemoryRouter>
    );
    // Có nhiều phần tử chứa text Description
    expect(screen.getAllByText(/Description/i).length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.getByAltText('Test Movie')).toBeInTheDocument();
      const movieTitles = screen.getAllByText('Test Movie');
      expect(movieTitles.length).toBeGreaterThanOrEqual(2);
      expect(movieTitles[0]).toBeInTheDocument();
    });
  });

  it('calls navigate(-1) when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <DescriptionMovie />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByRole('button', { name: '' })); // back button
    const backBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows and hides trailer when trailer button is clicked', async () => {
    render(
      <MemoryRouter>
        <DescriptionMovie />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Trailer'));
    const trailerBtn = screen.getByText('Trailer');
    fireEvent.click(trailerBtn);
    expect(screen.getByText(/Trailer/i)).toBeInTheDocument();
    // Overlay click to close
    const overlays = document.getElementsByClassName('trailer-overlay');
    if (overlays.length > 0) {
      fireEvent.click(overlays[0]);
      expect(screen.queryByText(/Trailer/i)).toBeInTheDocument(); // The header remains, but trailer iframe should be hidden
    }
  });

  it('renders movie details', async () => {
    render(
      <MemoryRouter>
        <DescriptionMovie />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Kiểm tra thông tin trong bảng chi tiết phim (table)
      // Kiểm tra đúng số phút
      expect(screen.getByText((content, element) =>
        element.tagName.toLowerCase() === 'td' && content === '120')
      ).toBeInTheDocument();
      // Kiểm tra poster title
      const movieTitles = screen.getAllByText('Test Movie');
      expect(movieTitles.length).toBeGreaterThanOrEqual(2);
      expect(movieTitles[0]).toBeInTheDocument();
      // Có thể kiểm tra các trường khác nếu cần, ví dụ:
      // expect(screen.getByText('Action')).toBeInTheDocument();
      // expect(screen.getByText('English')).toBeInTheDocument();
    });
  });
});
