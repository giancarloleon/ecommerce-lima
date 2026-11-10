import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Creamos una instancia con la URL base de tu backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor: Antes de que salga cualquier petición, revisa si hay un token
api.interceptors.request.use((config) => {
  // Leemos el token directamente del store de Zustand
  const token = useAuthStore.getState().token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;