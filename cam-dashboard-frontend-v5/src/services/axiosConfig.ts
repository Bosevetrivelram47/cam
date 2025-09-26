// frontend/src/services/axiosConfig.ts

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', // Your backend URL
  timeout: 30000, // 30 seconds timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;