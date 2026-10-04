import axios from 'axios';

export const API = '/api';

export const guestId = (() => {
  let g = localStorage.getItem('ares_guest_id');
  if (!g) {
    g = 'guest_' + Math.random().toString(36).slice(2, 14);
    localStorage.setItem('ares_guest_id', g);
  }
  return g;
})();

const api = axios.create({ baseURL: API, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ares_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Guest-Id'] = guestId;
  return config;
});

export const authHeaders = () => {
  const h = { 'Content-Type': 'application/json', 'X-Guest-Id': guestId };
  const token = localStorage.getItem('ares_token');
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

export default api;
