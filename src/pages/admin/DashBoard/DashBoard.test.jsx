import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './DashBoard';
import api from '../../../constants/axios';

jest.mock('../../../constants/axios');

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hiển thị biểu đồ doanh thu phim', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/statistic/movie-revenue')) {
        return Promise.resolve({
          data: [
            { movieName: 'Phim 1', revenue: 1000000 },
            { movieName: 'Phim 2', revenue: 2000000 }
          ]
        });
      }
      if (url.includes('/statistic/daily-revenue')) {
        return Promise.resolve({
          data: [
            { date: '2025-07-10', revenue: 500000 },
            { date: '2025-07-11', revenue: 800000 }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
    render(<Dashboard />);
    // Kiểm tra block doanh thu phim xuất hiện
    const movieRevenueBlock = await screen.findByText(/Revenue by Movie/i);
    expect(movieRevenueBlock).toBeInTheDocument();
    // Kiểm tra grid doanh thu phim có render
    expect(document.querySelector('.movie-revenue-grid')).toBeInTheDocument();
  });

  it('hiển thị biểu đồ doanh thu 7 ngày', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/statistic/movie-revenue')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/statistic/daily-revenue')) {
        return Promise.resolve({
          data: [
            { date: '2025-07-10', revenue: 500000 },
            { date: '2025-07-11', revenue: 800000 }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
    render(<Dashboard />);
    // Kiểm tra tiêu đề biểu đồ 7 ngày xuất hiện
    const dailyRevenueBlock = await screen.findByText(/Daily Revenue/i);
    expect(dailyRevenueBlock).toBeInTheDocument();
    // Kiểm tra container biểu đồ có mặt
    expect(document.querySelector('.column-chart .recharts-responsive-container')).toBeInTheDocument();
  });

  it('hiển thị biểu đồ phân phối loại vé', () => {
    render(<Dashboard />);
    // Kiểm tra tiêu đề biểu đồ loại vé xuất hiện
    expect(screen.getByText(/Ticket Type Distribution/i)).toBeInTheDocument();
    // Kiểm tra container pie chart có mặt
    expect(document.querySelector('.pie-chart .recharts-responsive-container')).toBeInTheDocument();
  });

  it('hiển thị lỗi khi API thất bại', async () => {
    api.get.mockRejectedValue(new Error('Lỗi mạng'));
    render(<Dashboard />);
    // Kiểm tra xuất hiện thông báo lỗi
    await waitFor(() => {
      expect(screen.getAllByText(/lỗi/i).length).toBeGreaterThan(0);
    });
  });
});
