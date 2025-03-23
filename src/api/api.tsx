import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',  // Django backend URL
  withCredentials: true,  // Send cookies for session authentication
});

export const register = (data) => api.post('register/', data);
export const login = (data) => api.post('login/', data);
export const createTrip = (data) => api.post('trips/', data);
export const getTrips = () => api.get('trips/');

export default api;