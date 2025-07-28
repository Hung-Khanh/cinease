import api from '../constants/axios';


export const getNowShowingMovies = async () => {
  return api.get('/public/movie/now-showing');
};

export const getComingSoonMovies = async () => {
  return api.get('/public/movie/upcoming');
};
export const searchMovies = async (params) => {
  return api.get('/public/movies', { params });
};

export const getMovieDetails = async (movieId) => {
  return api.get(`/public/movies/details/${movieId}`);
};
export const createMovie = async (formData) => {
  return api.post('/admin/movie/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateMovie = async (movieId, formData) => {
  return api.put(`/admin/movie/update/${movieId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteMovie = async (movieId) => {
  return api.delete(`/admin/movie/delete/${movieId}`);
};