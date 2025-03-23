import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',  // Django backend URL
  withCredentials: true,  // Send cookies for session authentication
});

interface RegisterData {
  // Define the expected structure of the data object
  username: string;
  password: string;
  email?: string; // Optional field
}

export const register = (data: RegisterData) => api.post('register/', data);
interface LoginData {
  username: string;
  password: string;
}

export const login = (data: LoginData) => api.post('login/', data);
interface TripData {
  // Define the expected structure of the data object
  destination: string;
  startDate: string;
  endDate: string;
  [key: string]: string | number | boolean; // Optional for additional fields
}

export const createTrip = (data: TripData) => api.post('trips/', data);
export const getTrips = () => api.get('trips/');

export default api;