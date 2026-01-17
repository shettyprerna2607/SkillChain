import axios from 'axios';
import { getApiUrl } from './config';

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized – token may be invalid or expired');
      // DO NOT redirect here
      // DO NOT remove token here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
