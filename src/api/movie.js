import api from '../constants/axios';

// Lấy danh sách phim đang chiếu
export const getNowShowingMovies = async () => {
  return api.get('/public/movie/now-showing');
};

// Lấy danh sách phim sắp chiếu
export const getComingSoonMovies = async () => {
  return api.get('/public/movie/upcoming');
};

// Tìm kiếm phim (theo tên, thể loại, v.v.)
export const searchMovies = async (params) => {
  // params: { q, genre, page, size, sort }
  return api.get('/public/movies', { params });
};

// Lấy chi tiết phim theo ID
export const getMovieDetails = async (movieId) => {
  return api.get(`/public/movies/details/${movieId}`);
};

// ADMIN: Thêm phim mới
export const createMovie = async (formData) => {
  // formData: FormData object (multipart/form-data)
  return api.post('/admin/movie/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ADMIN: Cập nhật phim
export const updateMovie = async (movieId, formData) => {
  // formData: FormData object (multipart/form-data)
  return api.put(`/admin/movie/update/${movieId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ADMIN: Xóa phim
export const deleteMovie = async (movieId) => {
  return api.delete(`/admin/movie/delete/${movieId}`);
};