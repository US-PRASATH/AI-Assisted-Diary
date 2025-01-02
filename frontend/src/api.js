import axios from 'axios';

// Set the base URL for your Flask API
const BASE_URL = "http://localhost:5000";

// Axios instance to configure default settings
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});
export default api;