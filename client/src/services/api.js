import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('trustlab_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Labs
export const getLabs = (params) => API.get('/labs', { params });
export const getLabById = (id) => API.get(`/labs/${id}`);
export const updateLabProfile = (id, data) => API.put(`/labs/${id}`, data);
export const uploadLabPhoto = (id, formData) => API.post(`/labs/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const deleteLabPhoto = (id, photoPath) => API.patch(`/labs/${id}/photo`, { photoPath });

// Tests
export const getTests = (params) => API.get('/tests', { params });
export const compareTests = (params) => API.get('/tests/compare', { params });
export const getPopularTests = () => API.get('/tests/popular');
export const getAllTests = (params) => API.get('/tests/all', { params });
export const createLabTest = (data) => API.post('/tests', data);
export const deleteLabTest = (id) => API.delete(`/tests/${id}`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getLabBookings = () => API.get('/bookings/lab');
export const updateBookingStatus = (id, data) => API.put(`/bookings/${id}/status`, data);
export const getBookingById = (id) => API.get(`/bookings/${id}`);

  // Raw Multipart Form File API
export const uploadReportPDF = (id, formData) => API.post(`/bookings/${id}/upload-report`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});

// Reviews
export const createReview = (data) => API.post('/reviews', data);
export const getLabReviews = (labId) => API.get(`/reviews/lab/${labId}`);

// Hospitals
export const getHospitals = () => API.get('/hospitals');

// Dashboard
export const getPatientDashboard = () => API.get('/dashboard/patient');
export const getLabDashboard = () => API.get('/dashboard/lab');

export default API;
