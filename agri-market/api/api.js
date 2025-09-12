import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

// Login
export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data; // { user, token }
};

// Register
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

// Get dashboard
export const getDashboard = async (token, role) => {
  const res = await axios.get(`${API_URL}/dashboard/${role}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
