const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
// SockJS endpoint usually starts with http/https, not ws/wss
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

export const getApiUrl = () => API_BASE_URL;
export const getWsUrl = () => WS_BASE_URL;
