// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend base URL
  withCredentials: true, // If you're using cookies/auth
});

export default instance;
