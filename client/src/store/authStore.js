import { create } from 'zustand';

// Creamos un "hook" que guarda el estado del usuario en toda la app
export const useAuthStore = create((set) => ({
  // Intentamos leer el usuario del localStorage (por si recarga la página)
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  // Función para guardar el usuario y token al hacer login/registro
  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token });
  },

  // Función para cerrar sesión
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));